import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, ChevronDown, Clock, Sparkles, Loader2 } from "lucide-react";
import { generatePlan } from "@/lib/planGenerator";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/pages/Dashboard";

interface StepItem {
  key: string; // dedup key = title normalized
  title: string;
  description: string;
  estimatedDays: number;
  phase: string;
  status: "todo" | "done";
  dbStepId?: string; // linked relocation_steps id for toggle
}

interface PhaseGroup {
  name: string;
  label: string;
  description: string;
  steps: StepItem[];
}

const PHASE_META: Record<string, { label: string; description: string }> = {
  "Entry Preparation": { label: "Before you move", description: "Get your documents and logistics ready before departure" },
  "Arrival & Setup": { label: "Arrival", description: "First steps after landing in your new country" },
  "Legal Status": { label: "Legal setup", description: "Visas, permits, and official registrations" },
  "Stability": { label: "Settling in", description: "Build your routine and long-term foundation" },
};

interface Props {
  profile: UserProfile | null;
}

export default function DashboardChecklist({ profile }: Props) {
  const { user } = useAuth();
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [hasDbSteps, setHasDbSteps] = useState(false);
  const [dbStepMap, setDbStepMap] = useState<Map<string, string>>(new Map()); // title→id

  const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Generate plan from profile (client-side, always consistent)
  const phases: PhaseGroup[] = useMemo(() => {
    if (!profile?.target_country && !profile?.visa_type) return [];
    const raw = generatePlan(
      profile.target_country || "",
      profile.visa_type || "TBD",
      profile.family_status || "single"
    );
    const seen = new Set<string>();
    return raw.map((phase) => {
      const meta = PHASE_META[phase.name] || { label: phase.name, description: "" };
      const uniqueSteps: StepItem[] = [];
      phase.steps.forEach((s) => {
        const key = normalize(s.title);
        if (seen.has(key)) return;
        seen.add(key);
        uniqueSteps.push({
          key,
          title: s.title,
          description: s.description,
          estimatedDays: s.estimatedDays,
          phase: phase.name,
          status: "todo",
        });
      });
      return { name: phase.name, label: meta.label, description: meta.description, steps: uniqueSteps };
    }).filter(g => g.steps.length > 0);
  }, [profile]);

  const allSteps = useMemo(() => phases.flatMap(p => p.steps), [phases]);

  // Fetch completed status from DB
  const fetchStatus = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    // Get relocation_steps ids for this visa type (for linking toggles)
    const { data: relSteps } = await supabase
      .from("relocation_steps")
      .select("id, title")
      .eq("visa_type", profile?.visa_type || "TBD");

    const stepMap = new Map<string, string>();
    (relSteps || []).forEach((r: any) => {
      const key = normalize(r.title);
      if (!stepMap.has(key)) stepMap.set(key, r.id);
    });
    setDbStepMap(stepMap);
    setHasDbSteps(stepMap.size > 0);

    // Get user completions
    const { data: userSteps } = await supabase
      .from("user_steps")
      .select("step_id, status")
      .eq("user_id", user.id);

    const completedIds = new Set((userSteps || []).filter((s: any) => s.status === "done").map((s: any) => s.step_id));
    const completedTitles = new Set<string>();
    stepMap.forEach((id, key) => {
      if (completedIds.has(id)) completedTitles.add(key);
    });

    setCompletedKeys(completedTitles);
    setLoading(false);

    // Auto-open first incomplete phase
    if (phases.length > 0) {
      const first = phases.find(p => p.steps.some(s => !completedTitles.has(s.key)));
      const init: Record<string, boolean> = {};
      phases.forEach(p => { init[p.name] = p.name === (first?.name || phases[0].name); });
      setOpenPhases(init);
    }
  }, [user, profile, phases]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Initialize DB steps if they don't exist
  const handleInitialize = async () => {
    if (!user || !profile) return;
    setInitializing(true);

    const rows = allSteps.map((s, i) => ({
      step_number: i + 1,
      title: s.title,
      visa_type: profile.visa_type || "TBD",
      description: s.description,
      estimated_days: s.estimatedDays,
    }));

    await supabase.from("relocation_steps").insert(rows);
    await fetchStatus();
    setInitializing(false);
  };

  const toggleStep = async (step: StepItem) => {
    if (!user) return;
    const isDone = completedKeys.has(step.key);
    const stepId = dbStepMap.get(step.key);
    if (!stepId) return;

    if (isDone) {
      // Remove completion
      await supabase.from("user_steps").delete().eq("user_id", user.id).eq("step_id", stepId);
      setCompletedKeys(prev => { const n = new Set(prev); n.delete(step.key); return n; });
    } else {
      const { data: existing } = await supabase
        .from("user_steps")
        .select("id")
        .eq("user_id", user.id)
        .eq("step_id", stepId)
        .maybeSingle();

      if (existing) {
        await supabase.from("user_steps").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", existing.id);
      } else {
        await supabase.from("user_steps").insert({ user_id: user.id, step_id: stepId, status: "done", completed_at: new Date().toISOString() });
      }
      setCompletedKeys(prev => new Set(prev).add(step.key));
    }
  };

  if (!profile?.visa_type) {
    return <p className="text-muted-foreground text-sm">Complete onboarding to see your checklist.</p>;
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;
  }

  // Show init state if no DB steps exist yet
  if (!hasDbSteps) {
    return (
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
    );
  }

  const completed = allSteps.filter(s => completedKeys.has(s.key)).length;
  const total = allSteps.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Limit initial view: show first 6 steps across phases, rest hidden
  const INITIAL_LIMIT = 6;
  let visibleCount = 0;

  const getVisibleSteps = (steps: StepItem[]): StepItem[] => {
    if (showAll) return steps;
    const visible: StepItem[] = [];
    for (const s of steps) {
      if (visibleCount >= INITIAL_LIMIT) break;
      visible.push(s);
      visibleCount++;
    }
    return visible;
  };

  // Build visible phases (reset counter)
  visibleCount = 0;
  const visiblePhases = phases.map(p => ({
    ...p,
    visibleSteps: getVisibleSteps(p.steps),
  })).filter(p => p.visibleSteps.length > 0);

  const hiddenCount = total - Math.min(INITIAL_LIMIT, total);

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
          <span className="text-sm text-muted-foreground">{completed} / {total} completed</span>
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
        {visiblePhases.map((group, gi) => {
          const phaseCompleted = group.steps.filter(s => completedKeys.has(s.key)).length;
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
                    phaseDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {phaseDone ? <CheckCircle2 size={18} /> : gi + 1}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-semibold">Phase {gi + 1} — {group.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{group.description}</div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 mr-2">{phaseCompleted}/{phaseTotal}</span>
                  <ChevronDown size={16} className="text-muted-foreground shrink-0 transition-transform duration-200" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-3 pl-2 md:pl-4">
                  {group.visibleSteps.map((step) => {
                    const isDone = completedKeys.has(step.key);
                    const isExpanded = expandedStep === step.key;
                    return (
                      <div
                        key={step.key}
                        className={`rounded-xl border transition-all ${
                          isDone ? "border-primary/20 bg-primary/[0.03]" : "border-border/40 bg-card/30 hover:bg-card/50"
                        }`}
                      >
                        <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpandedStep(isExpanded ? null : step.key)}>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStep(step); }}
                            className="mt-0.5 shrink-0 active:scale-90 transition-transform"
                          >
                            <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isDone ? "bg-primary border-primary" : "border-muted-foreground/30 bg-transparent hover:border-primary/50"
                            }`}>
                              {isDone && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium leading-snug ${isDone ? "line-through text-muted-foreground" : ""}`}>
                              {step.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {step.estimatedDays > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock size={10} />{step.estimatedDays === 1 ? "1 day" : `${step.estimatedDays} days`}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              isDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            }`}>
                              {isDone ? "Done" : "To do"}
                            </span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pl-12 border-t border-border/30 pt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={(e) => { e.stopPropagation(); toggleStep(step); }}
                                >
                                  {isDone ? "Mark as not done" : "Mark as done"}
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

      {/* Show full plan toggle */}
      {!showAll && hiddenCount > 0 && (
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2" onClick={() => setShowAll(true)}>
            Show full plan ({hiddenCount} more steps)
            <ChevronDown size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
