import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, Loader2, X, ListChecks, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ExtractedStep {
  title: string;
  description: string;
  estimated_days: number;
  phase: string;
}

interface ExtractedDocument {
  name: string;
  related_step_title: string | null;
}

interface PreviewItem {
  type: "step" | "document";
  step?: ExtractedStep;
  doc?: ExtractedDocument;
  selected: boolean;
}

type UIState = "idle" | "extracting" | "preview" | "saving" | "done";

interface Props {
  content: string;
  visaType: string | null;
  onNavigate?: (tab: string) => void;
  country?: string | null;
}

export default function ChatActionButtons({ content, onNavigate }: Props) {
  const { user } = useAuth();
  const [uiState, setUiState] = useState<UIState>("idle");
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [resultCounts, setResultCounts] = useState({ steps: 0, docs: 0 });
  const [showSteps, setShowSteps] = useState(true);
  const [showDocs, setShowDocs] = useState(true);

  // Only render for assistant messages with substantial content
  if (!user || content.length < 80) return null;

  const selectedSteps = items.filter((i) => i.type === "step" && i.selected);
  const selectedDocs = items.filter((i) => i.type === "document" && i.selected);
  const allStepItems = items.filter((i) => i.type === "step");
  const allDocItems = items.filter((i) => i.type === "document");

  const handleExtract = async () => {
    if (uiState !== "idle") return;
    setUiState("extracting");

    try {
      // Fetch existing plan steps and documents to pass for deduplication
      const [{ data: existingPlan }, { data: existingDocs }] = await Promise.all([
        supabase.from("user_relocation_plan").select("title").eq("user_id", user.id),
        supabase.from("user_documents").select("document_name").eq("user_id", user.id),
      ]);

      const existingSteps = (existingPlan ?? []).map((s: { title: string }) => s.title);
      const existingDocuments = (existingDocs ?? []).map((d: { document_name: string }) => d.document_name);

      const { data, error } = await supabase.functions.invoke("extract-plan-items", {
        body: { conversationText: content, existingSteps, existingDocuments },
      });

      if (error) throw error;

      const steps: ExtractedStep[] = data?.steps ?? [];
      const docs: ExtractedDocument[] = data?.documents ?? [];

      if (steps.length === 0 && docs.length === 0) {
        toast.info("No new actionable items found in this response");
        setUiState("idle");
        return;
      }

      const preview: PreviewItem[] = [
        ...steps.map((s) => ({ type: "step" as const, step: s, selected: true })),
        ...docs.map((d) => ({ type: "document" as const, doc: d, selected: true })),
      ];
      setItems(preview);
      setUiState("preview");
    } catch (err) {
      console.error("extract-plan-items error:", err);
      toast.error("Could not extract items. Try again.");
      setUiState("idle");
    }
  };

  const toggle = (idx: number) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, selected: !item.selected } : item));
  };

  const handleConfirm = async () => {
    setUiState("saving");
    let stepsAdded = 0;
    let docsAdded = 0;

    try {
      // Get next step_number
      const { data: lastStep } = await supabase
        .from("user_relocation_plan")
        .select("step_number")
        .eq("user_id", user.id)
        .order("step_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextStepNum = (lastStep?.step_number ?? 0) + 1;

      // Insert selected steps
      const stepRows = selectedSteps.map((i) => ({
        user_id: user.id,
        title: i.step!.title,
        description: i.step!.description,
        phase: i.step!.phase,
        step_number: nextStepNum++,
        estimated_days: i.step!.estimated_days,
        status: "todo",
      }));
      if (stepRows.length > 0) {
        const { error } = await supabase.from("user_relocation_plan").insert(stepRows);
        if (!error) stepsAdded = stepRows.length;
      }

      // Insert selected documents
      const docRows = selectedDocs.map((i) => ({
        user_id: user.id,
        document_name: i.doc!.name,
        status: "pending",
        verification_status: "pending",
        prepared_without_upload: false,
        related_step_title: i.doc!.related_step_title ?? null,
      }));
      if (docRows.length > 0) {
        const { error } = await supabase.from("user_documents").insert(docRows);
        if (!error) docsAdded = docRows.length;
      }

      setResultCounts({ steps: stepsAdded, docs: docsAdded });
      setUiState("done");
      toast.success(`Added ${stepsAdded} step${stepsAdded !== 1 ? "s" : ""} and ${docsAdded} document${docsAdded !== 1 ? "s" : ""}`);
    } catch {
      toast.error("Failed to save items");
      setUiState("preview");
    }
  };

  const handleCancel = () => {
    setItems([]);
    setUiState("idle");
  };

  return (
    <div className="mt-4 space-y-3">
      {/* ── Idle: Extract button ─────────────────────────────────────── */}
      {uiState === "idle" && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Button
            onClick={handleExtract}
            className="w-full h-10 text-[13px] font-medium rounded-xl gap-2 bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Sparkles size={13} /> Save steps & documents to my plan
          </Button>
        </motion.div>
      )}

      {/* ── Extracting: loading ──────────────────────────────────────── */}
      {uiState === "extracting" && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[12px] text-muted-foreground">
          <Loader2 size={13} className="animate-spin shrink-0" />
          Analysing response for actionable items…
        </div>
      )}

      {/* ── Preview: checklist before saving ────────────────────────── */}
      {uiState === "preview" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-[12px] font-medium text-foreground">
              Will be added: {selectedSteps.length} step{selectedSteps.length !== 1 ? "s" : ""}, {selectedDocs.length} document{selectedDocs.length !== 1 ? "s" : ""}
            </span>
            <button onClick={handleCancel} className="text-muted-foreground/50 hover:text-muted-foreground">
              <X size={14} />
            </button>
          </div>

          {/* Steps section */}
          {allStepItems.length > 0 && (
            <div className="border-b border-white/[0.04]">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ListChecks size={11} className="shrink-0" />
                <span className="font-medium uppercase tracking-wider">Plan steps ({allStepItems.length})</span>
                <span className="ml-auto">{showSteps ? <ChevronUp size={11} /> : <ChevronDown size={11} />}</span>
              </button>
              <AnimatePresence>
                {showSteps && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    {allStepItems.map((item, globalIdx) => {
                      const idx = items.indexOf(item);
                      return (
                        <label
                          key={idx}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/[0.03] cursor-pointer border-t border-white/[0.04] first:border-t-0"
                        >
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggle(idx)}
                            className="mt-0.5 accent-primary shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[12px] text-foreground leading-snug">{item.step!.title}</p>
                            <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                              {item.step!.phase} · ~{item.step!.estimated_days}d
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Documents section */}
          {allDocItems.length > 0 && (
            <div>
              <button
                onClick={() => setShowDocs(!showDocs)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText size={11} className="shrink-0" />
                <span className="font-medium uppercase tracking-wider">Documents ({allDocItems.length})</span>
                <span className="ml-auto">{showDocs ? <ChevronUp size={11} /> : <ChevronDown size={11} />}</span>
              </button>
              <AnimatePresence>
                {showDocs && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    {allDocItems.map((item) => {
                      const idx = items.indexOf(item);
                      return (
                        <label
                          key={idx}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/[0.03] cursor-pointer border-t border-white/[0.04]"
                        >
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggle(idx)}
                            className="mt-0.5 accent-primary shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[12px] text-foreground leading-snug">{item.doc!.name}</p>
                            {item.doc!.related_step_title && (
                              <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                                For: {item.doc!.related_step_title}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 px-4 py-3 border-t border-white/[0.06]">
            <Button
              onClick={handleConfirm}
              disabled={selectedSteps.length === 0 && selectedDocs.length === 0}
              className="flex-1 h-9 text-[12px] bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg"
            >
              Add to my plan
            </Button>
            <Button
              onClick={handleCancel}
              variant="ghost"
              className="h-9 px-3 text-[12px] text-muted-foreground hover:text-foreground rounded-lg"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── Saving: progress ────────────────────────────────────────── */}
      {uiState === "saving" && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[12px] text-muted-foreground">
          <Loader2 size={13} className="animate-spin shrink-0" />
          Saving to your plan…
        </div>
      )}

      {/* ── Done: success ────────────────────────────────────────────── */}
      {uiState === "done" && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[12px] text-emerald-400">
            <CheckCircle2 size={13} className="shrink-0" />
            Added {resultCounts.steps} step{resultCounts.steps !== 1 ? "s" : ""} and {resultCounts.docs} document{resultCounts.docs !== 1 ? "s" : ""}
          </div>
          <div className="flex gap-2">
            {resultCounts.steps > 0 && (
              <button
                onClick={() => onNavigate?.("plan")}
                className="text-[11px] text-primary/70 hover:text-primary transition-colors"
              >
                Go to Plan →
              </button>
            )}
            {resultCounts.docs > 0 && (
              <button
                onClick={() => onNavigate?.("documents")}
                className="text-[11px] text-primary/70 hover:text-primary transition-colors ml-2"
              >
                Go to Documents →
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
