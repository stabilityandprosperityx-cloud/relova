import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ChevronDown, Clock, Shield, Zap, Lightbulb, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { UserProfile, DashboardTab } from "@/pages/Dashboard";
import { countryDatabase } from "@/lib/countryMatching";
import LockedOverlayPro from "./LockedOverlayPro";
import type { RelocationCase } from "@/hooks/useRelocationCase";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface StepWithStatus {
  id: string;
  step_number: number;
  title: string;
  description: string | null;
  estimated_days: number;
  status: "todo" | "done";
  phase: string;
}

interface Props {
  profile: UserProfile | null;
  onBack?: () => void;
  onNavigate?: (tab: DashboardTab) => void;
  relocationCase: RelocationCase;
}

// Must match planGenerator.ts phase names
const PHASES = [
  { key: "Entry Preparation", label: "Preparation",  description: "Documents, finances, and logistics" },
  { key: "Arrival & Setup",   label: "Arrival",       description: "First steps in your new country" },
  { key: "Legal Status",      label: "Legal setup",   description: "Visas, permits, and registrations" },
  { key: "Stability",         label: "Settlement",    description: "Build your routine and foundation" },
];

const goalLabels: Record<string, string> = {
  safety: "Safety", money: "Income", better_life: "Quality of life",
  freedom: "Freedom", family: "Family", reset: "Fresh start",
  growth: "Growth", environment: "Climate",
};

function getRiskLevel(country: ReturnType<typeof countryDatabase.find>): { label: string; color: string } {
  if (!country) return { label: "Unknown", color: "text-muted-foreground" };
  if (country.visaEase === "easy" && country.crimeLevel === "low") return { label: "Low", color: "text-green-400" };
  if (country.visaEase === "hard" || country.crimeLevel === "high") return { label: "High", color: "text-red-400" };
  return { label: "Medium", color: "text-amber-400" };
}

const getTimelineActions = (daysUntilMove: number) => {
  if (daysUntilMove > 90) return {
    thisWeek: ["Research visa requirements for your passport", "Check apostille requirements for your documents"],
    thisMonth: ["Start collecting required documents", "Get criminal background check (takes 4–8 weeks)", "Research neighborhoods and cost of living"],
    comingUp: ["Book flights and initial accommodation", "Open bank account abroad", "Apply for visa"],
  };
  if (daysUntilMove > 60) return {
    thisWeek: ["Submit visa application if not done", "Get documents apostilled"],
    thisMonth: ["Book flights", "Arrange temporary housing for first month", "Notify your bank about international use"],
    comingUp: ["Pack essentials", "Set up international health insurance", "Arrange mail forwarding"],
  };
  if (daysUntilMove > 30) return {
    thisWeek: ["Confirm visa status", "Book flights if not done", "Arrange temporary housing"],
    thisMonth: ["Cancel local subscriptions", "Notify tax authorities", "Set up international health insurance"],
    comingUp: ["Pack", "Transfer money to international account", "Say goodbyes"],
  };
  if (daysUntilMove > 14) return {
    thisWeek: ["Confirm all bookings", "Pack non-essentials", "Transfer funds to destination account"],
    thisMonth: ["Wrap up remaining tasks", "Collect all original documents", "Download offline maps"],
    comingUp: ["Arrive and register address", "Open local bank account", "Apply for residence permit"],
  };
  return {
    thisWeek: ["Final packing", "Confirm visa and travel documents are accessible", "Charge all devices"],
    thisMonth: ["You are almost there — focus on arrival tasks"],
    comingUp: ["Register address", "Open local bank account", "Apply for residence permit", "Get local SIM card"],
  };
};

export default function DashboardPlan({ profile, onNavigate, relocationCase }: Props) {
  const { user } = useAuth();
  const [steps, setSteps] = useState<StepWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProPaywall, setShowProPaywall] = useState(true);
  const [moveDate, setMoveDate] = useState<string>(profile?.move_date || "");
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});

  const plan = profile?.plan || "free";
  const isProOrAbove = plan === "pro" || plan === "full";
  const isFullPlan = plan === "full";

  useEffect(() => {
    setMoveDate(profile?.move_date || "");
  }, [profile?.move_date]);

  // Fetch full step list from user_relocation_plan for the checklist
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchPlan = async () => {
      const { data } = await supabase
        .from("user_relocation_plan")
        .select("id, step_number, title, description, estimated_days, status, phase")
        .eq("user_id", user.id)
        .order("step_number");
      const rows = (data || []) as StepWithStatus[];
      setSteps(rows);

      // Auto-open first incomplete phase
      const firstIncompletePhase = PHASES.find(p => rows.some(s => s.phase === p.key && s.status !== "done"));
      const init: Record<string, boolean> = {};
      PHASES.forEach(p => { init[p.key] = p.key === (firstIncompletePhase?.key ?? PHASES[0].key); });
      setOpenPhases(init);
      setLoading(false);
    };
    fetchPlan();
  }, [user]);

  const toggleStep = async (step: StepWithStatus) => {
    if (!user) return;
    const newStatus: "todo" | "done" = step.status === "done" ? "todo" : "done";
    setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: newStatus } : s));
    await supabase
      .from("user_relocation_plan")
      .update({ status: newStatus, completed_at: newStatus === "done" ? new Date().toISOString() : null })
      .eq("id", step.id)
      .eq("user_id", user.id);
    relocationCase.refresh();
  };

  const saveMoveDate = async (selected: string) => {
    setMoveDate(selected);
    if (!profile?.user_id) return;
    await supabase.from("user_profiles").update({ move_date: selected }).eq("user_id", profile.user_id);
  };

  const countryData = countryDatabase.find(c => c.name === profile?.target_country);
  const risk = getRiskLevel(countryData);
  const stabilityMonths = countryData?.stabilityMonths || "6-12";
  const pathType = profile?.goal ? (goalLabels[profile.goal.split(",")[0]] || "General relocation") : "General relocation";

  const fitReasons = useMemo(() => {
    if (!countryData || !profile) return [];
    const reasons: string[] = [];
    if (countryData.costLevel === "low") reasons.push("Fits your budget — low cost of living");
    else if (countryData.costLevel === "medium") reasons.push("Reasonable cost of living for your budget");
    if (profile.goal) {
      const goals = profile.goal.split(",");
      if (goals.some(g => countryData.bestFor.includes(g))) reasons.push(`Matches your goal: ${goalLabels[goals[0]] || goals[0]}`);
    }
    if (countryData.visaEase === "easy") reasons.push("Fastest visa path available");
    else if (countryData.visaEase === "moderate") reasons.push("Clear visa path with moderate requirements");
    if (countryData.safetyScore >= 8) reasons.push("High safety score for your family");
    if (countryData.languageBarrier === "low") reasons.push("Low language barrier");
    if (countryData.citizenshipYears) reasons.push(`Path to citizenship in ${countryData.citizenshipYears} years`);
    return reasons.slice(0, 5);
  }, [countryData, profile]);

  const daysUntilMove = useMemo(() => {
    if (!moveDate) return null;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return Math.ceil((new Date(`${moveDate}T00:00:00`).getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
  }, [moveDate]);

  const timelineActions = daysUntilMove !== null && daysUntilMove >= 0 ? getTimelineActions(daysUntilMove) : null;
  const timelineProgress = daysUntilMove !== null
    ? Math.max(0, Math.min(100, Math.round(((120 - daysUntilMove) / 120) * 100)))
    : 0;

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!profile) {
    return <p className="text-muted-foreground text-sm">Complete onboarding to see your plan.</p>;
  }

  if (!isProOrAbove) {
    return (
      <div className="relative min-h-[400px]">
        {showProPaywall && (
          <LockedOverlayPro onClose={() => setShowProPaywall(false)} profile={profile} />
        )}
        <div className="pointer-events-none select-none blur-[3px] space-y-6">
          <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-6">
            <p className="text-[11px] uppercase tracking-widest text-primary/80 font-medium mb-4">Your relocation plan</p>
            <h1 className="text-2xl font-bold">{profile.target_country}</h1>
            <p className="text-muted-foreground text-sm mt-1">Your best path based on your profile</p>
          </div>
          <div className="surface-card p-5 h-40" />
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;
  }

  // ── Grouped steps ─────────────────────────────────────────────────────────
  const grouped = PHASES.map(p => ({
    ...p,
    steps: steps.filter(s => s.phase === p.key),
  })).filter(g => g.steps.length > 0);

  const { progressPct, doneCount, totalCount } = relocationCase;

  return (
    <div className="space-y-8">

      {/* ─── HERO ─── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 md:p-7"
      >
        <p className="text-[11px] uppercase tracking-widest text-primary/80 font-medium mb-4">Your relocation plan</p>
        <div className="flex items-start gap-4 mb-5">
          {countryData && <span className="text-3xl md:text-4xl mt-0.5">{countryData.flag}</span>}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{profile.target_country}</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Your best path based on your profile</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-white/[0.04] p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={12} className="text-primary/70" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Stability</span>
            </div>
            <span className="text-base md:text-lg font-bold">{stabilityMonths} mo</span>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield size={12} className="text-primary/70" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk</span>
            </div>
            <span className={`text-base md:text-lg font-bold ${risk.color}`}>{risk.label}</span>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={12} className="text-primary/70" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Path</span>
            </div>
            <span className="text-base md:text-lg font-bold truncate block">{pathType}</span>
          </div>
        </div>
      </motion.section>

      {/* ─── PROGRESS BAR ─── */}
      <section className="surface-card p-5 md:p-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Your journey</p>
          <span className="text-[12px] text-muted-foreground">{doneCount} / {totalCount} completed</span>
        </div>
        <div className="relative my-5 h-[12px] flex items-center">
          <div className="absolute left-[6px] right-[6px] h-[2px] rounded-full bg-white/[0.06]">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(190 80% 60%))" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
            <div className="w-[8px] h-[8px] rounded-full bg-primary shadow-[0_0_6px_1px_hsl(var(--primary)/0.3)]" />
          </div>
          {progressPct > 0 && progressPct < 100 && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 z-10"
              initial={{ left: "6px" }}
              animate={{ left: `calc(6px + (100% - 12px) * ${progressPct / 100})` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ marginLeft: "-6px" }}
            >
              <div className="relative">
                <div className="w-[12px] h-[12px] rounded-full bg-primary shadow-[0_0_12px_3px_hsl(var(--primary)/0.4)]" />
                <div className="absolute inset-0 w-[12px] h-[12px] rounded-full bg-primary/40 animate-ping" style={{ animationDuration: "2.5s" }} />
              </div>
            </motion.div>
          )}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
            <div className={`w-[8px] h-[8px] rounded-full ${progressPct >= 100 ? "bg-primary shadow-[0_0_6px_1px_hsl(var(--primary)/0.3)]" : "bg-white/[0.08] border border-white/[0.12]"}`} />
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] text-muted-foreground/50 font-medium">Start</span>
          <span className="text-[10px] text-muted-foreground/50 font-medium">Stable life</span>
        </div>
        <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
          Phase {relocationCase.currentPhaseIndex + 1} of {relocationCase.totalPhases} · <span className="text-primary/70">{relocationCase.currentPhase}</span>
        </p>
      </section>

      {/* ─── CHECKLIST BY PHASES (Pro+) ─── */}
      <section className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Step-by-step checklist</h2>

        {grouped.length === 0 ? (
          <div className="surface-card p-6 text-center">
            <p className="text-muted-foreground text-sm">No plan steps found. Complete onboarding to generate your plan.</p>
            <Button size="sm" variant="ghost" className="mt-3 text-primary text-xs" onClick={() => onNavigate?.("chat")}>
              Ask your advisor <ArrowRight size={12} className="ml-1" />
            </Button>
          </div>
        ) : (
          grouped.map((group, gi) => {
            const phaseDone = group.steps.filter(s => s.status === "done").length;
            const phaseTotal = group.steps.length;
            const phasePct = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;
            const allDone = phaseDone === phaseTotal;

            return (
              <Collapsible
                key={group.key}
                open={openPhases[group.key] ?? false}
                onOpenChange={(open) => setOpenPhases(prev => ({ ...prev, [group.key]: open }))}
              >
                <div className="rounded-xl bg-card/40 overflow-hidden border border-border/30">
                  <CollapsibleTrigger className="w-full group">
                    <div className="flex items-center gap-4 px-5 py-4 transition-colors group-hover:bg-card/60">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                        allDone ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"
                      }`}>
                        {allDone ? <CheckCircle2 size={16} /> : gi + 1}
                      </div>
                      <div className="flex-1 text-left min-w-0 space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">Phase {gi + 1} — {group.label}</span>
                          <span className="text-[11px] text-muted-foreground">{phaseDone}/{phaseTotal}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{group.description}</div>
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
                    <div className="px-5 pb-4 space-y-2 border-t border-border/20 pt-3">
                      {group.steps.map((step) => (
                        <motion.div
                          key={step.id}
                          layout
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex items-start gap-3 rounded-lg px-3.5 py-3 transition-colors ${
                            step.status === "done" ? "bg-primary/[0.04]" : "hover:bg-card/40"
                          }`}
                        >
                          <button
                            onClick={() => toggleStep(step)}
                            className="mt-0.5 shrink-0 active:scale-90 transition-transform"
                          >
                            <motion.div
                              className={`h-[18px] w-[18px] rounded-[4px] border-[1.5px] flex items-center justify-center transition-colors ${
                                step.status === "done"
                                  ? "bg-primary border-primary"
                                  : "border-muted-foreground/25 bg-transparent hover:border-primary/40"
                              }`}
                              animate={step.status === "done" ? { scale: [1, 1.15, 1] } : {}}
                              transition={{ duration: 0.25 }}
                            >
                              {step.status === "done" && (
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </motion.div>
                          </button>

                          <div className="flex-1 min-w-0">
                            <span className={`text-[13px] font-medium leading-snug block ${
                              step.status === "done" ? "line-through text-muted-foreground/60" : "text-foreground"
                            }`}>
                              {step.title}
                            </span>
                            {step.description && (
                              <span className={`text-[11px] leading-relaxed block mt-0.5 ${
                                step.status === "done" ? "text-muted-foreground/40" : "text-muted-foreground"
                              }`}>
                                {step.description}
                              </span>
                            )}
                            {relocationCase.nextStep?.id === step.id && step.status !== "done" && (
                              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">← Your next action</span>
                            )}
                          </div>

                          {step.estimated_days > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60 shrink-0 mt-0.5">
                              <Clock size={9} />
                              {step.estimated_days === 1 ? "1 day" : `${step.estimated_days}d`}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })
        )}
      </section>

      {/* ─── MOVE TIMELINE (Full only) ─── */}
      {isFullPlan ? (
        <section className="surface-card p-5 md:p-6">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-4">Your move timeline</p>

          {!moveDate ? (
            <div className="space-y-4">
              <p className="text-[13px] text-muted-foreground">
                When are you planning to move? Set a date to get a week-by-week action plan.
              </p>
              <input
                type="date"
                value={moveDate}
                onChange={(e) => saveMoveDate(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 [color-scheme:dark]"
              />
            </div>
          ) : daysUntilMove !== null && daysUntilMove >= 0 ? (
            <div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-4xl font-bold text-primary">{daysUntilMove} days</p>
                  <p className="text-[12px] text-muted-foreground mt-1">until your move</p>
                </div>
                <button onClick={() => saveMoveDate("")} className="text-[11px] text-primary/70 hover:text-primary transition-colors">
                  Change date
                </button>
              </div>
              <Progress value={timelineProgress} className="mt-4" />
              {timelineActions && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <div className="rounded-lg bg-white/[0.04] p-4">
                    <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2">This week</p>
                    <ul className="space-y-1.5">
                      {timelineActions.thisWeek.map((item, idx) => (
                        <li key={idx} className="text-[12px] text-muted-foreground leading-relaxed">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] p-4">
                    <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-2">This month</p>
                    <ul className="space-y-1.5">
                      {timelineActions.thisMonth.map((item, idx) => (
                        <li key={idx} className="text-[12px] text-muted-foreground leading-relaxed">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] p-4">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Coming up</p>
                    <ul className="space-y-1.5">
                      {timelineActions.comingUp.map((item, idx) => (
                        <li key={idx} className="text-[12px] text-muted-foreground leading-relaxed">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] text-muted-foreground">Your move date has passed — update it to continue planning.</p>
              <input
                type="date"
                value={moveDate}
                onChange={(e) => saveMoveDate(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 [color-scheme:dark]"
              />
            </div>
          )}
        </section>
      ) : (
        <section className="surface-card p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Clock size={14} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium">Move date & weekly focus</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Set your move date and get a week-by-week action plan — available on Full plan.</p>
          </div>
          <Button size="sm" variant="ghost" className="text-[11px] text-primary shrink-0" onClick={() => onNavigate?.("chat")}>
            Upgrade
          </Button>
        </section>
      )}

      {/* ─── WHY THIS COUNTRY (Full only) ─── */}
      {isFullPlan && fitReasons.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="surface-card p-5 md:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={14} className="text-primary" />
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Why this country fits you</p>
          </div>
          <div className="space-y-2.5">
            {fitReasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                <p className="text-[13px] text-muted-foreground leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ─── ALTERNATIVE OPTION (Full only) ─── */}
      {isFullPlan && profile?.recommended_country && profile.recommended_country !== profile.target_country && (() => {
        const altData = countryDatabase.find(c => c.name === profile.recommended_country);
        if (!altData) return null;
        return (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="surface-card p-5 md:p-6"
          >
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-3">Alternative option</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{altData.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold">{profile.recommended_country}</p>
                <p className="text-[12px] text-muted-foreground">
                  {altData.stabilityMonths} months to stability · {altData.visaEase === "easy" ? "Fast" : "Moderate"} visa path
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-[11px] text-primary hover:text-primary shrink-0" onClick={() => onNavigate?.("chat")}>
                Compare →
              </Button>
            </div>
          </motion.section>
        );
      })()}

    </div>
  );
}
