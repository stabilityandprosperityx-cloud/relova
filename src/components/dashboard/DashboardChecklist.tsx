import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, ChevronDown, Clock, Sparkles, Loader2 } from "lucide-react";
import { generatePlan, type PlanPhase } from "@/lib/planGenerator";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/pages/Dashboard";

interface StepItem {
  id: string;
  title: string;
  description: string;
  estimatedDays: number;
  phase: string;
  status: "todo" | "in_progress" | "done";
  stepNumber: number;
}

interface Props {
  profile: UserProfile | null;
}

export default function DashboardChecklist({ profile }: Props) {
  const { user } = useAuth();
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const fetchSteps = useCallback(async () => {
    if (!user || !profile?.visa_type) { setLoading(false); return; }

    const { data: relocationSteps } = await supabase
      .from("relocation_steps")
      .select("*")
      .eq("visa_type", profile.visa_type!)
      .order("step_number", { ascending: true });

    if (!relocationSteps || relocationSteps.length === 0) {
      setIsEmpty(true);
      setLoading(false);
      return;
    }

    const { data: userSteps } = await supabase
      .from("user_steps")
      .select("*")
      .eq("user_id", user.id);

    const userStepMap = new Map((userSteps || []).map((s: any) => [s.step_id, s.status]));

    const phases = generatePlan(
      profile.target_country || "",
      profile.visa_type || "",
      profile.family_status || "single"
    );

    const phaseMap = new Map<number, string>();
    let stepIdx = 0;
    phases.forEach((phase) => {
      phase.steps.forEach(() => {
        stepIdx++;
        phaseMap.set(stepIdx, phase.name);
      });
    });

    const merged: StepItem[] = relocationSteps.map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description || "",
      estimatedDays: s.estimated_days,
      phase: phaseMap.get(s.step_number) || getPhaseForStep(s.step_number),
      status: (userStepMap.get(s.id) as StepItem["status"]) || "todo",
      stepNumber: s.step_number,
    }));

    setSteps(merged);
    setIsEmpty(false);

    // Auto-open first incomplete phase
    const phaseNames = [...new Set(merged.map(s => s.phase))];
    const firstIncomplete = phaseNames.find(p => merged.some(s => s.phase === p && s.status !== "done"));
    const initial: Record<string, boolean> = {};
    phaseNames.forEach(p => { initial[p] = p === firstIncomplete; });
    setOpenPhases(initial);
    setLoading(false);
  }, [user, profile]);

  useEffect(() => { fetchSteps(); }, [fetchSteps]);

  const getPhaseForStep = (num: number): string => {
    if (num <= 4) return "Entry Preparation";
    if (num <= 9) return "Arrival & Setup";
    if (num <= 13) return "Legal Status";
    return "Stability";
  };

  const handleInitialize = async () => {
    if (!user || !profile) return;
    setInitializing(true);

    const phases = generatePlan(
      profile.target_country || "",
      profile.visa_type || "TBD",
      profile.family_status || "single"
    );

    let stepNumber = 0;
    const rows: { step_number: number; title: string; visa_type: string; description: string; estimated_days: number }[] = [];

    phases.forEach((phase) => {
      phase.steps.forEach((step) => {
        stepNumber++;
        rows.push({
          step_number: stepNumber,
          title: step.title,
          visa_type: profile.visa_type || "TBD",
          description: step.description,
          estimated_days: step.estimatedDays,
        });
      });
    });

    await supabase.from("relocation_steps").insert(rows);
    await fetchSteps();
    setInitializing(false);
  };

  const toggleStepStatus = async (step: StepItem) => {
    if (!user) return;
    const newStatus = step.status === "done" ? "todo" : "done";

    const { data: existing } = await supabase
      .from("user_steps")
      .select("id")
      .eq("user_id", user.id)
      .eq("step_id", step.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("user_steps").update({
        status: newStatus,
        completed_at: newStatus === "done" ? new Date().toISOString() : null,
      }).eq("id", existing.id);
    } else {
      await supabase.from("user_steps").insert({
        user_id: user.id,
        step_id: step.id,
        status: newStatus,
        completed_at: newStatus === "done" ? new Date().toISOString() : null,
      });
    }

    setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: newStatus } : s));
  };

  if (!profile?.visa_type) {
    return <p className="text-muted-foreground text-sm">Complete onboarding to see your checklist.</p>;
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;
  }

  // Empty / initialization state
  if (isEmpty) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center pt-8 md:pt-16 text-center max-w-md mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Your plan is ready</h2>
          <p className="text-muted-foreground text-sm mb-8">
            We generated your relocation checklist based on your profile
          </p>
          <Button onClick={handleInitialize} disabled={initializing} size="lg" className="gap-2">
            {initializing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {initializing ? "Building your plan…" : "Load my checklist"}
          </Button>
        </div>
      </div>
    );
  }

  const completed = steps.filter(s => s.status === "done").length;
  const total = steps.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Group by phase
  const phaseOrder = ["Entry Preparation", "Arrival & Setup", "Legal Status", "Stability"];
  const grouped = phaseOrder
    .map(name => ({ name, steps: steps.filter(s => s.phase === name) }))
    .filter(g => g.steps.length > 0);

  const phaseDescriptions: Record<string, string> = {
    "Entry Preparation": "Get your documents and logistics ready before departure",
    "Arrival & Setup": "First steps after arriving in your destination country",
    "Legal Status": "Visa applications, permits, and official registrations",
    "Stability": "Settle in and build your new life",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Your relocation plan</h1>
          <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[11px] font-medium">
            Personalized for your profile
          </span>
        </div>
        {profile.target_country && (
          <p className="text-muted-foreground text-sm">
            Step-by-step path to {profile.target_country}
          </p>
        )}
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Checklist progress</span>
          <span className="text-sm text-muted-foreground">
            {completed} / {total} completed
          </span>
        </div>
        <Progress value={progressPct} className="h-2" />
        {completed === total && total > 0 && (
          <div className="flex items-center gap-2 text-primary text-sm mt-1">
            <CheckCircle2 size={16} />
            <span>All steps completed — you're ready!</span>
          </div>
        )}
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {grouped.map((group, gi) => {
          const phaseCompleted = group.steps.filter(s => s.status === "done").length;
          const phaseTotal = group.steps.length;
          const phaseDone = phaseCompleted === phaseTotal;

          return (
            <Collapsible
              key={group.name}
              open={openPhases[group.name] ?? false}
              onOpenChange={(open) => setOpenPhases(prev => ({ ...prev, [group.name]: open }))}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4 hover:bg-card/80 transition-colors cursor-pointer">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                    phaseDone
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {phaseDone ? <CheckCircle2 size={18} /> : gi + 1}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-semibold">{group.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {phaseDescriptions[group.name] || ""}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 mr-2">
                    {phaseCompleted}/{phaseTotal}
                  </span>
                  <ChevronDown size={16} className="text-muted-foreground shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2 pt-2 pl-2 md:pl-4"
                >
                  {group.steps.map((step) => {
                    const isExpanded = expandedStep === step.id;
                    return (
                      <div
                        key={step.id}
                        className={`rounded-xl border transition-all ${
                          step.status === "done"
                            ? "border-primary/20 bg-primary/[0.03]"
                            : "border-border/40 bg-card/30 hover:bg-card/50"
                        }`}
                      >
                        <div
                          className="flex items-start gap-3 p-4 cursor-pointer"
                          onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStepStatus(step); }}
                            className="mt-0.5 shrink-0 active:scale-90 transition-transform"
                          >
                            <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                              step.status === "done"
                                ? "bg-primary border-primary"
                                : "border-muted-foreground/30 bg-transparent hover:border-primary/50"
                            }`}>
                              {step.status === "done" && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium leading-snug ${
                              step.status === "done" ? "line-through text-muted-foreground" : ""
                            }`}>
                              {step.title}
                            </div>
                            {step.description && (
                              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {step.description}
                              </div>
                            )}
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-2 shrink-0">
                            {step.estimatedDays > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock size={10} />
                                {step.estimatedDays}d
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              step.status === "done"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {step.status === "done" ? "Done" : "To do"}
                            </span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && step.description && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pl-12 border-t border-border/30 pt-3">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {step.description}
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-3 h-7 text-xs"
                                  onClick={(e) => { e.stopPropagation(); toggleStepStatus(step); }}
                                >
                                  {step.status === "done" ? "Mark as not done" : "Mark as done"}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
