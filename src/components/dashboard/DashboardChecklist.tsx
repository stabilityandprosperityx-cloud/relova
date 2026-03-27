import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, ChevronDown, Clock, Sparkles, Loader2 } from "lucide-react";
import { generatePlan } from "@/lib/planGenerator";
import { motion } from "framer-motion";
import type { UserProfile } from "@/pages/Dashboard";

interface StepItem {
  id: string;
  title: string;
  description: string;
  estimatedDays: number;
  phase: string;
  isDone: boolean;
}

const PHASE_META: { key: string; label: string; description: string }[] = [
  { key: "Before you move", label: "Before you move", description: "Documents, logistics, and preparation before departure" },
  { key: "Arrival", label: "Arrival", description: "First steps after landing in your new country" },
  { key: "Legal & Setup", label: "Legal & Setup", description: "Visas, permits, registrations, and daily infrastructure" },
  { key: "Settling in", label: "Settling in", description: "Build your routine and long-term foundation" },
];

interface Props {
  profile: UserProfile | null;
}

function cleanTitle(raw: string): string {
  let t = raw.replace(/^\[.*?\]\s*/, "");
  t = t.replace(/^#{1,4}\s*/, "");
  t = t.replace(/^[📄🔍⚙️🏠💼📋✈️🏦📱🏥💡🔑📝]+\s*/, "");
  return t.trim();
}

function assignPhase(stepNum: number, total: number): string {
  const pct = stepNum / total;
  if (pct <= 0.3) return "Before you move";
  if (pct <= 0.55) return "Arrival";
  if (pct <= 0.8) return "Legal & Setup";
  return "Settling in";
}

export default function DashboardChecklist({ profile }: Props) {
  const { user } = useAuth();
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});
  const [initializing, setInitializing] = useState(false);
  const [hasDbSteps, setHasDbSteps] = useState(false);

  const fetchSteps = useCallback(async () => {
    if (!user || !profile?.visa_type) { setLoading(false); return; }

    const { data: relSteps } = await supabase
      .from("relocation_steps")
      .select("id, title, description, estimated_days, step_number")
      .eq("visa_type", profile.visa_type!)
      .order("step_number", { ascending: true });

    if (!relSteps || relSteps.length === 0) {
      setHasDbSteps(false);
      setLoading(false);
      return;
    }
    setHasDbSteps(true);

    const { data: userSteps } = await supabase
      .from("user_steps")
      .select("step_id, status")
      .eq("user_id", user.id);

    const doneIds = new Set(
      (userSteps || []).filter((s: any) => s.status === "done").map((s: any) => s.step_id)
    );

    const seen = new Set<string>();
    const total = relSteps.length;
    const deduped: StepItem[] = [];

    for (const r of relSteps) {
      const cleaned = cleanTitle(r.title);
      const key = cleaned.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!key || key.length < 3) continue;
      if (seen.has(key)) continue;
      seen.add(key);

      deduped.push({
        id: r.id,
        title: cleaned,
        description: r.description || "",
        estimatedDays: r.estimated_days,
        phase: assignPhase(r.step_number, total),
        isDone: doneIds.has(r.id),
      });
    }

    setSteps(deduped);

    const phaseKeys = PHASE_META.map(p => p.key);
    const firstIncomplete = phaseKeys.find(p => deduped.some(s => s.phase === p && !s.isDone));
    const init: Record<string, boolean> = {};
    phaseKeys.forEach(p => { init[p] = p === (firstIncomplete || phaseKeys[0]); });
    setOpenPhases(init);
    setLoading(false);
  }, [user, profile]);

  useEffect(() => { fetchSteps(); }, [fetchSteps]);

  const handleInitialize = async () => {
    if (!user || !profile) return;
    setInitializing(true);
    const phases = generatePlan(profile.target_country || "", profile.visa_type || "TBD", profile.family_status || "single");
    let stepNumber = 0;
    const rows: any[] = [];
    phases.forEach((phase) => {
      phase.steps.forEach((step) => {
        stepNumber++;
        rows.push({ step_number: stepNumber, title: step.title, visa_type: profile.visa_type || "TBD", description: step.description, estimated_days: step.estimatedDays });
      });
    });
    await supabase.from("relocation_steps").insert(rows);
    await fetchSteps();
    setInitializing(false);
  };

  const toggleStep = async (step: StepItem) => {
    if (!user) return;
    setSteps(prev => prev.map(s => s.id === step.id ? { ...s, isDone: !s.isDone } : s));

    if (step.isDone) {
      await supabase.from("user_steps").delete().eq("user_id", user.id).eq("step_id", step.id);
    } else {
      const { data: existing } = await supabase
        .from("user_steps").select("id").eq("user_id", user.id).eq("step_id", step.id).maybeSingle();
      if (existing) {
        await supabase.from("user_steps").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", existing.id);
      } else {
        await supabase.from("user_steps").insert({ user_id: user.id, step_id: step.id, status: "done", completed_at: new Date().toISOString() });
      }
    }
  };

  if (!profile?.visa_type) {
    return <p className="text-muted-foreground text-sm">Complete onboarding to see your checklist.</p>;
  }

  if (loading) {
    return <div className="space-y-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
  }

  if (!hasDbSteps) {
    return (
      <div className="flex flex-col items-center pt-12 md:pt-20 text-center max-w-sm mx-auto">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight mb-2">Your plan is ready</h2>
        <p className="text-muted-foreground text-sm mb-8">We generated your relocation checklist based on your profile</p>
        <Button onClick={handleInitialize} disabled={initializing} size="lg" className="gap-2">
          {initializing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {initializing ? "Building your plan…" : "Load my checklist"}
        </Button>
      </div>
    );
  }

  const completed = steps.filter(s => s.isDone).length;
  const total = steps.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Group into phases
  const grouped = PHASE_META
    .map((pm) => ({ ...pm, steps: steps.filter(s => s.phase === pm.key) }))
    .filter(g => g.steps.length > 0);

  // Limit initial view — cap visible steps across all phases
  const INITIAL_LIMIT = 7;
  let counter = 0;
  const visiblePhases = grouped.map(g => {
    if (showAll) return { ...g, visibleSteps: g.steps };
    const visible: StepItem[] = [];
    for (const s of g.steps) {
      if (counter >= INITIAL_LIMIT) break;
      visible.push(s);
      counter++;
    }
    return { ...g, visibleSteps: visible };
  }).filter(g => g.visibleSteps.length > 0);

  const hiddenCount = showAll ? 0 : Math.max(0, total - INITIAL_LIMIT);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Your relocation checklist</h1>
        <p className="text-muted-foreground text-sm">Complete each step to move forward</p>
      </div>

      {/* Overall progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{completed} of {total} completed</span>
          <span className="text-xs text-muted-foreground">{progressPct}%</span>
        </div>
        <Progress value={progressPct} className="h-1.5" />
      </div>

      {/* Phases */}
      <div className="space-y-5">
        {visiblePhases.map((group, gi) => {
          const phaseCompleted = group.steps.filter(s => s.isDone).length;
          const phaseTotal = group.steps.length;
          const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
          const phaseDone = phaseCompleted === phaseTotal;

          return (
            <Collapsible
              key={group.key}
              open={openPhases[group.key] ?? false}
              onOpenChange={(open) => setOpenPhases(prev => ({ ...prev, [group.key]: open }))}
            >
              <CollapsibleTrigger className="w-full group">
                <div className="flex items-center gap-4 rounded-xl bg-card/40 px-5 py-4 transition-colors group-hover:bg-card/60">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                    phaseDone
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/60 text-muted-foreground"
                  }`}>
                    {phaseDone ? <CheckCircle2 size={16} /> : gi + 1}
                  </div>

                  <div className="flex-1 text-left min-w-0 space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">Phase {gi + 1} — {group.label}</span>
                      <span className="text-[11px] text-muted-foreground">{phaseCompleted}/{phaseTotal}</span>
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{group.description}</div>
                    {/* Phase mini progress */}
                    <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary/60"
                        initial={false}
                        animate={{ width: `${phasePct}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <ChevronDown size={16} className="text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="space-y-2 pt-2 ml-3 md:ml-6 border-l border-border/30 pl-4 md:pl-5">
                  {group.visibleSteps.map((step) => (
                    <motion.div
                      key={step.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-start gap-3 rounded-lg px-4 py-3.5 transition-colors ${
                        step.isDone
                          ? "bg-primary/[0.04]"
                          : "bg-card/20 hover:bg-card/40"
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleStep(step)}
                        className="mt-0.5 shrink-0 active:scale-90 transition-transform"
                      >
                        <motion.div
                          className={`h-[18px] w-[18px] rounded-[4px] border-[1.5px] flex items-center justify-center transition-colors ${
                            step.isDone
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/25 bg-transparent hover:border-primary/40"
                          }`}
                          animate={step.isDone ? { scale: [1, 1.15, 1] } : {}}
                          transition={{ duration: 0.25 }}
                        >
                          {step.isDone && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </motion.div>
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <span className={`text-[13px] font-medium leading-snug block ${
                          step.isDone ? "line-through text-muted-foreground/60" : "text-foreground"
                        }`}>
                          {step.title}
                        </span>
                        {step.description && (
                          <span className={`text-[11px] leading-relaxed block mt-0.5 ${
                            step.isDone ? "text-muted-foreground/40" : "text-muted-foreground"
                          }`}>
                            {step.description}
                          </span>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-2.5 shrink-0 mt-0.5">
                        {step.estimatedDays > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                            <Clock size={9} />
                            {step.estimatedDays === 1 ? "1 day" : `${step.estimatedDays}d`}
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wide uppercase ${
                          step.isDone
                            ? "text-primary/70"
                            : "text-muted-foreground/50"
                        }`}>
                          {step.isDone ? "Done" : "To do"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Show full plan */}
      {!showAll && hiddenCount > 0 && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground text-xs gap-1.5"
            onClick={() => setShowAll(true)}
          >
            Show full plan · {hiddenCount} more steps
            <ChevronDown size={12} />
          </Button>
        </div>
      )}
    </div>
  );
}
