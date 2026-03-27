import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, FileText, ListChecks, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  const seen = new Set<string>();
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.replace(/^[\s*\-•]+/, "").trim();
    if (!trimmed) continue;
    const clean = trimmed.replace(/\*\*/g, "").replace(/^[-•]\s*/, "").trim();
    const key = clean.toLowerCase();

    // Detect step/plan items
    if (/step\s*\d|phase\s*\d|→.*apply|→.*register|→.*open|→.*get|→.*obtain|→.*submit|\[\s*\]|✅|☑|☐|📋/i.test(trimmed)) {
      const title = clean.replace(/^(step\s*\d+[:\.]?\s*)/i, "").replace(/^\[[\s xX]?\]\s*/, "").replace(/^[✅☑☐📋]\s*/u, "").trim();
      if (title.length > 5 && title.length < 200 && !seen.has(title.toLowerCase())) {
        seen.add(title.toLowerCase());
        actions.push({ type: "step", title });
      }
    }

    // Detect document items
    if (/passport|birth\s*certificate|proof\s*of|bank\s*statement|tax\s*return|insurance|transcript|diploma|criminal\s*record|nif|visa\s*application|photo|letter|contract|cv|resume/i.test(trimmed)) {
      if (clean.length > 3 && clean.length < 200 && !seen.has(key)) {
        seen.add(key);
        actions.push({ type: "document", title: clean });
      }
    }
  }

  return actions;
}

export default function ChatActionButtons({ content, visaType }: Props) {
  const { user } = useAuth();
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [resultCounts, setResultCounts] = useState({ steps: 0, docs: 0 });

  const actions = extractActions(content);
  if (actions.length === 0 || !user) return null;

  const steps = actions.filter(a => a.type === "step");
  const docs = actions.filter(a => a.type === "document");

  const applyFullPlan = async () => {
    if (applied || applying) return;
    if (!visaType) { toast.error("Complete onboarding first"); return; }
    setApplying(true);

    let stepsAdded = 0;
    let docsAdded = 0;

    try {
      // Get next step number
      const { data: existingSteps } = await supabase
        .from("relocation_steps")
        .select("step_number")
        .eq("visa_type", visaType)
        .order("step_number", { ascending: false })
        .limit(1);

      let nextNumber = (existingSteps?.[0]?.step_number || 0) + 1;

      // Insert all steps
      for (const step of steps) {
        const { data: newStep, error } = await supabase
          .from("relocation_steps")
          .insert({ visa_type: visaType, title: step.title, step_number: nextNumber, estimated_days: 7 })
          .select("id")
          .single();

        if (!error && newStep) {
          await supabase.from("user_steps").insert({ user_id: user.id, step_id: newStep.id, status: "todo" });
          stepsAdded++;
          nextNumber++;
        }
      }

      // Insert all documents
      for (const doc of docs) {
        const { error } = await supabase
          .from("user_documents")
          .insert({ user_id: user.id, document_name: doc.title, status: "pending" });
        if (!error) docsAdded++;
      }

      setApplied(true);
      setResultCounts({ steps: stepsAdded, docs: docsAdded });
      setShowResult(true);
      setAddedItems(new Set(actions.map(a => `${a.type}:${a.title}`)));
      toast.success(`Plan applied: ${stepsAdded} steps, ${docsAdded} documents added`);
    } catch {
      toast.error("Failed to apply plan");
    } finally {
      setApplying(false);
    }
  };

  const addSingleChecklist = async (title: string) => {
    const key = `step:${title}`;
    if (addedItems.has(key) || !visaType) return;

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

    if (!error && newStep) {
      await supabase.from("user_steps").insert({ user_id: user.id, step_id: newStep.id, status: "todo" });
      setAddedItems(prev => new Set(prev).add(key));
      toast.success(`Added to checklist: ${title}`);
    } else {
      toast.error("Could not add item");
    }
  };

  const addSingleDocument = async (title: string) => {
    const key = `document:${title}`;
    if (addedItems.has(key)) return;

    const { error } = await supabase
      .from("user_documents")
      .insert({ user_id: user.id, document_name: title, status: "pending" });

    if (!error) {
      setAddedItems(prev => new Set(prev).add(key));
      toast.success(`Added to documents: ${title}`);
    } else {
      toast.error("Could not add document");
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Primary action: Apply full plan */}
      {(steps.length > 0 || docs.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Button
            onClick={applyFullPlan}
            disabled={applied || applying}
            className={`w-full h-11 text-[13px] font-medium rounded-xl gap-2 transition-all duration-300 ${
              applied
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15"
                : "bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
            }`}
          >
            {applying ? (
              <><Loader2 size={14} className="animate-spin" /> Applying plan…</>
            ) : applied ? (
              <><CheckCircle2 size={14} /> Plan applied — {resultCounts.steps} steps, {resultCounts.docs} documents</>
            ) : (
              <><Sparkles size={14} /> Apply full relocation plan</>
            )}
          </Button>
        </motion.div>
      )}

      {/* Success feedback */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[11px] text-muted-foreground/70 text-center"
          >
            Your checklist and documents have been updated. Check your Plan and Documents tabs.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secondary actions: individual items */}
      {!applied && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-1.5"
        >
          {steps.slice(0, 4).map((action, i) => {
            const key = `step:${action.title}`;
            const isAdded = addedItems.has(key);
            const shortTitle = action.title.length > 35 ? action.title.slice(0, 35) + "…" : action.title;
            return (
              <Button
                key={`s-${i}`}
                size="sm"
                variant="outline"
                disabled={isAdded}
                onClick={() => addSingleChecklist(action.title)}
                className="h-7 text-[10px] gap-1 border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] bg-transparent"
              >
                {isAdded ? <CheckCircle2 size={10} className="text-emerald-400" /> : <ListChecks size={10} />}
                {shortTitle}
              </Button>
            );
          })}
          {docs.slice(0, 4).map((action, i) => {
            const key = `document:${action.title}`;
            const isAdded = addedItems.has(key);
            const shortTitle = action.title.length > 35 ? action.title.slice(0, 35) + "…" : action.title;
            return (
              <Button
                key={`d-${i}`}
                size="sm"
                variant="outline"
                disabled={isAdded}
                onClick={() => addSingleDocument(action.title)}
                className="h-7 text-[10px] gap-1 border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] bg-transparent"
              >
                {isAdded ? <CheckCircle2 size={10} className="text-emerald-400" /> : <FileText size={10} />}
                {shortTitle}
              </Button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
