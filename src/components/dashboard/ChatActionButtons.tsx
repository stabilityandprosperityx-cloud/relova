import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, FileText, ListChecks } from "lucide-react";
import { toast } from "sonner";

interface ActionItem {
  type: "step" | "checklist" | "document";
  title: string;
}

interface Props {
  content: string;
  visaType: string | null;
}

function extractActions(content: string): ActionItem[] {
  const actions: ActionItem[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.replace(/^[\s*\-•]+/, "").trim();
    if (!trimmed) continue;

    // Detect step/plan items
    if (/step\s*\d|phase\s*\d|→.*apply|→.*register|→.*open|→.*get|→.*obtain|→.*submit/i.test(trimmed)) {
      const title = trimmed.replace(/^(step\s*\d+[:\.]?\s*)/i, "").replace(/\*\*/g, "").trim();
      if (title.length > 5 && title.length < 200) {
        actions.push({ type: "step", title });
      }
    }

    // Detect document items
    if (/passport|birth\s*certificate|proof\s*of|bank\s*statement|tax\s*return|insurance|transcript|diploma|criminal\s*record|nif|visa\s*application|photo|letter|contract|cv|resume/i.test(trimmed)) {
      const title = trimmed.replace(/\*\*/g, "").replace(/^[-•]\s*/, "").trim();
      if (title.length > 3 && title.length < 200 && !actions.find(a => a.title === title)) {
        actions.push({ type: "document", title });
      }
    }

    // Detect checklist items (checkbox-like)
    if (/^\[[\s xX]?\]|✅|☑|☐|📄|📋/u.test(trimmed)) {
      const title = trimmed.replace(/^\[[\s xX]?\]\s*/, "").replace(/^[✅☑☐📄📋]\s*/u, "").replace(/\*\*/g, "").trim();
      if (title.length > 3 && title.length < 200 && !actions.find(a => a.title === title)) {
        actions.push({ type: "checklist", title });
      }
    }
  }

  return actions;
}

export default function ChatActionButtons({ content, visaType }: Props) {
  const { user } = useAuth();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const actions = extractActions(content);
  if (actions.length === 0 || !user) return null;

  const addToPlan = async (title: string) => {
    if (!visaType) { toast.error("Complete onboarding first"); return; }
    const key = `step:${title}`;
    if (addedItems.has(key)) return;

    // Get the next step number
    const { data: existingSteps } = await supabase
      .from("relocation_steps")
      .select("step_number")
      .eq("visa_type", visaType)
      .order("step_number", { ascending: false })
      .limit(1);

    const nextNumber = (existingSteps?.[0]?.step_number || 0) + 1;

    const { data: newStep, error } = await supabase
      .from("relocation_steps")
      .insert({ visa_type: visaType, title, step_number: nextNumber, estimated_days: 7 })
      .select("id")
      .single();

    if (error) {
      toast.error("Could not add step");
      return;
    }

    await supabase.from("user_steps").insert({ user_id: user.id, step_id: newStep.id, status: "todo" });
    setAddedItems(prev => new Set(prev).add(key));
    toast.success(`Added to My Plan: ${title}`);
  };

  const addToChecklist = async (title: string) => {
    const key = `check:${title}`;
    if (addedItems.has(key)) return;

    const { error } = await supabase
      .from("user_documents")
      .insert({ user_id: user.id, document_name: title, status: "pending" });

    if (error) {
      toast.error("Could not add to checklist");
      return;
    }
    setAddedItems(prev => new Set(prev).add(key));
    toast.success(`Added to Checklist: ${title}`);
  };

  const addToDocuments = async (title: string) => {
    const key = `doc:${title}`;
    if (addedItems.has(key)) return;

    const { error } = await supabase
      .from("user_documents")
      .insert({ user_id: user.id, document_name: title, status: "pending" });

    if (error) {
      toast.error("Could not add document");
      return;
    }
    setAddedItems(prev => new Set(prev).add(key));
    toast.success(`Added to Documents: ${title}`);
  };

  // Deduplicate and limit
  const uniqueActions = actions.slice(0, 8);

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {uniqueActions.map((action, i) => {
        const key = `${action.type}:${action.title}`;
        const isAdded = addedItems.has(key);
        const shortTitle = action.title.length > 40 ? action.title.slice(0, 40) + "…" : action.title;

        if (action.type === "step") {
          return (
            <Button
              key={i}
              size="sm"
              variant="outline"
              disabled={isAdded}
              onClick={() => addToPlan(action.title)}
              className="h-7 text-[10px] gap-1 border-[#38BDF8]/20 text-[#38BDF8] hover:bg-[#38BDF8]/10 bg-transparent"
            >
              {isAdded ? <CheckCircle2 size={10} /> : <Plus size={10} />}
              Add to Plan: {shortTitle}
            </Button>
          );
        }

        if (action.type === "document") {
          return (
            <Button
              key={i}
              size="sm"
              variant="outline"
              disabled={isAdded}
              onClick={() => addToDocuments(action.title)}
              className="h-7 text-[10px] gap-1 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
            >
              {isAdded ? <CheckCircle2 size={10} /> : <FileText size={10} />}
              Add to Docs: {shortTitle}
            </Button>
          );
        }

        return (
          <Button
            key={i}
            size="sm"
            variant="outline"
            disabled={isAdded}
            onClick={() => addToChecklist(action.title)}
            className="h-7 text-[10px] gap-1 border-amber-500/20 text-amber-400 hover:bg-amber-500/10 bg-transparent"
          >
            {isAdded ? <CheckCircle2 size={10} /> : <ListChecks size={10} />}
            Add to Checklist: {shortTitle}
          </Button>
        );
      })}
    </div>
  );
}