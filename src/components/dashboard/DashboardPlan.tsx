import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ChevronRight, ArrowRight, Clock, Shield, Zap, Lock, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import type { UserProfile, DashboardTab } from "@/pages/Dashboard";
import { countryDatabase } from "@/lib/countryMatching";
import LockedOverlay from "./LockedOverlay";

interface StepWithStatus {
  id: string;
  step_number: number;
  title: string;
  description: string | null;
  estimated_days: number;
  status: "todo" | "active" | "done";
  phase: string;
}

interface Props {
  profile: UserProfile | null;
  onBack?: () => void;
  onNavigate?: (tab: DashboardTab) => void;
}

const PHASES = [
  { key: "before_move", label: "Preparation", description: "Documents, finances, and logistics" },
  { key: "arrival", label: "Arrival", description: "First steps in your new country" },
  { key: "legal_setup", label: "Legal setup", description: "Visas, permits, and registrations" },
  { key: "settling_in", label: "Settlement", description: "Build your routine and foundation" },
];

const goalLabels: Record<string, string> = {
  safety: "Safety", money: "Income", better_life: "Quality of life",
  freedom: "Freedom", family: "Family", reset: "Fresh start",
  growth: "Growth", environment: "Climate",
};

function parsePhase(raw: string): { phase: string; title: string } {
  const bracketMatch = raw.match(/^\[(.*?)\]\s*(.*)/);
  if (bracketMatch) {
    const p = bracketMatch[1].toLowerCase();
    const title = bracketMatch[2].trim();
    if (p.includes("entry") || p.includes("preparation")) return { phase: "before_move", title };
    if (p.includes("arrival") || p.includes("setup")) return { phase: "arrival", title };
    if (p.includes("legal")) return { phase: "legal_setup", title };
    if (p.includes("stability") || p.includes("settl")) return { phase: "settling_in", title };
    return { phase: "before_move", title };
  }
  let cleaned = raw.replace(/^#{1,4}\s*/, "").replace(/^[📄🔍⚙️🏠💼📋✈️🏦📱🏥💡🔑📝]+\s*/, "").trim();
  const lower = cleaned.toLowerCase();
  if (lower.includes("arrive") || lower.includes("accommodation") || lower.includes("bank account") || lower.includes("sim card"))
    return { phase: "arrival", title: cleaned };
  if (lower.includes("visa") || lower.includes("permit") || lower.includes("tax") || lower.includes("insurance") || lower.includes("biometric"))
    return { phase: "legal_setup", title: cleaned };
  if (lower.includes("routine") || lower.includes("network") || lower.includes("enroll") || lower.includes("settle"))
    return { phase: "settling_in", title: cleaned };
  return { phase: "before_move", title: cleaned };
}

function getRiskLevel(country: ReturnType<typeof countryDatabase.find>): { label: string; color: string } {
  if (!country) return { label: "Unknown", color: "text-muted-foreground" };
  if (country.visaEase === "easy" && country.crimeLevel === "low") return { label: "Low", color: "text-green-400" };
  if (country.visaEase === "hard" || country.crimeLevel === "high") return { label: "High", color: "text-red-400" };
  return { label: "Medium", color: "text-amber-400" };
}

export default function DashboardPlan({ profile, onBack, onNavigate }: Props) {
  const { user } = useAuth();
  const [steps, setSteps] = useState<StepWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(true);
  const isLocked = (profile?.plan || "free") !== "full";

  useEffect(() => {
    if (!user || !profile?.visa_type) { setLoading(false); return; }
    const fetch = async () => {
      const { data: allSteps } = await supabase
        .from("relocation_steps").select("*")
        .eq("visa_type", profile.visa_type!).order("step_number");
      const { data: userSteps } = await supabase
        .from("user_steps").select("*").eq("user_id", user.id);

      const statusMap = new Map((userSteps || []).map((s: any) => [s.step_id, s.status]));
      const seen = new Set<string>();
      const merged: StepWithStatus[] = [];
      for (const s of (allSteps || []) as any[]) {
        const parsed = parsePhase(s.title);
        const normKey = parsed.title.toLowerCase().replace(/[^a-z]/g, "");
        if (seen.has(normKey)) continue;
        seen.add(normKey);
        merged.push({
          ...s,
          title: parsed.title,
          phase: parsed.phase,
          status: (statusMap.get(s.id) || "todo") as any,
        });
      }
      setSteps(merged);
      setLoading(false);
    };
    fetch();
  }, [user, profile]);

  const countryData = countryDatabase.find(c => c.name === profile?.target_country);
  const risk = getRiskLevel(countryData);
  const stabilityMonths = countryData?.stabilityMonths || "6-12";
  const pathType = profile?.goal ? (goalLabels[profile.goal.split(",")[0]] || "General relocation") : "General relocation";

  const doneCount = steps.filter(s => s.status === "done").length;
  const totalSteps = steps.length;
  const progressPct = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0;

  // Determine current phase
  const currentPhaseKey = useMemo(() => {
    for (const phase of PHASES) {
      const phaseSteps = steps.filter(s => s.phase === phase.key);
      const allDone = phaseSteps.length > 0 && phaseSteps.every(s => s.status === "done");
      if (!allDone) return phase.key;
    }
    return PHASES[PHASES.length - 1].key;
  }, [steps]);

  const currentPhaseLabel = PHASES.find(p => p.key === currentPhaseKey)?.label || "Preparation";

  // Why this country fits
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

  const recommended = profile?.recommended_country;
  const hasBetterOption = recommended && recommended !== profile?.target_country;
  const altData = hasBetterOption ? countryDatabase.find(c => c.name === recommended) : null;

  if (!profile?.visa_type) {
    return <p className="text-muted-foreground text-sm">Complete onboarding to see your plan.</p>;
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-8 relative">
      {isLocked && showPaywall && <LockedOverlay onClose={() => { setShowPaywall(false); onBack?.(); }} />}

      <div className={isLocked ? "pointer-events-none" : ""}>

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

          <div className="grid grid-cols-3 gap-3 mb-5">
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

          <Button
            className="w-full md:w-auto shadow-[0_0_28px_-4px_hsl(var(--primary)/0.35)]"
            onClick={() => onNavigate?.("checklist")}
          >
            Continue your plan <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </motion.section>

        {/* ─── VISUAL PROGRESS PATH ─── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-7"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Your journey</p>
            <span className="text-[12px] text-muted-foreground">{doneCount} / {totalSteps} completed</span>
          </div>

          {/* Journey Line */}
          <div className="relative my-5 h-[12px] flex items-center">
            {/* Track */}
            <div className="absolute left-[6px] right-[6px] h-[2px] rounded-full bg-white/[0.06]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(190 80% 60%))" }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full opacity-60"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.6) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "energyFlow 3s ease-in-out infinite",
                  width: `${progressPct}%`,
                }}
              />
            </div>
            {/* Start dot */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <div className="w-[8px] h-[8px] rounded-full bg-primary shadow-[0_0_6px_1px_hsl(var(--primary)/0.3)]" />
            </div>
            {/* Current position */}
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
            {/* End dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <div className={`w-[8px] h-[8px] rounded-full ${progressPct >= 100 ? "bg-primary shadow-[0_0_6px_1px_hsl(var(--primary)/0.3)]" : "bg-white/[0.08] border border-white/[0.12]"}`} />
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-muted-foreground/50 font-medium">Start</span>
            <span className="text-[10px] text-muted-foreground/50 font-medium">Stable life</span>
          </div>

          <p className="text-[10px] text-muted-foreground/40 text-center mb-1">From uncertainty → stability</p>

          {/* You are here */}
          <div className="mt-4 rounded-lg bg-primary/[0.06] border border-primary/10 p-3 text-center">
            <p className="text-[12px] text-primary/90">
              You are currently in: <span className="font-semibold">{currentPhaseLabel} phase</span>
            </p>
          </div>
        </motion.section>

        {/* ─── VERTICAL ROADMAP ─── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-8"
        >
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-6">Your relocation journey</p>

          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-white/[0.08]" />

            {PHASES.map((phase, i) => {
              const phaseSteps = steps.filter(s => s.phase === phase.key);
              const phaseDone = phaseSteps.filter(s => s.status === "done").length;
              const allDone = phaseSteps.length > 0 && phaseDone === phaseSteps.length;
              const isCurrent = phase.key === currentPhaseKey;
              const isAfterCurrent = PHASES.findIndex(p => p.key === currentPhaseKey) < i;

              return (
                <div key={phase.key} className="relative mb-8 last:mb-0">
                  {/* Phase circle */}
                  <div className="absolute -left-6 top-0.5">
                    {allDone ? (
                      <CheckCircle2 size={22} className="text-primary" />
                    ) : isCurrent ? (
                      <div className="w-[22px] h-[22px] rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.4)]" />
                      </div>
                    ) : isAfterCurrent ? (
                      <div className="w-[22px] h-[22px] rounded-full border-2 border-white/10 bg-white/[0.03] flex items-center justify-center">
                        <Lock size={10} className="text-muted-foreground/40" />
                      </div>
                    ) : (
                      <Circle size={22} className="text-white/20" />
                    )}
                  </div>

                  {/* Phase content */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-[14px] font-semibold ${isAfterCurrent ? "text-muted-foreground/40" : ""}`}>
                        {phase.label}
                      </h3>
                      {allDone && <span className="text-[10px] text-primary font-medium">Complete</span>}
                      {isCurrent && <span className="text-[10px] text-primary font-medium">Current</span>}
                      {isAfterCurrent && <span className="text-[10px] text-muted-foreground/40">Locked</span>}
                    </div>
                    <p className={`text-[12px] mb-3 ${isAfterCurrent ? "text-muted-foreground/30" : "text-muted-foreground/70"}`}>
                      {phase.description}
                    </p>

                    {/* Show actions only for current phase */}
                    {isCurrent && phaseSteps.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-1.5 mb-3"
                      >
                        {phaseSteps.slice(0, 5).map((step) => (
                          <div
                            key={step.id}
                            className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2.5"
                          >
                            {step.status === "done" ? (
                              <CheckCircle2 size={15} className="text-primary shrink-0" />
                            ) : (
                              <Circle size={15} className="text-muted-foreground/30 shrink-0" />
                            )}
                            <span className={`text-[13px] ${step.status === "done" ? "text-muted-foreground line-through" : "text-foreground/90"}`}>
                              {step.title}
                            </span>
                          </div>
                        ))}
                        {phaseSteps.length > 5 && (
                          <p className="text-[11px] text-muted-foreground/50 pl-7">+{phaseSteps.length - 5} more steps</p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[12px] text-primary hover:text-primary p-0 h-auto mt-2"
                          onClick={() => onNavigate?.("checklist")}
                        >
                          View full checklist <ChevronRight size={12} className="ml-0.5" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Mini progress for completed phases */}
                    {allDone && phaseSteps.length > 0 && (
                      <p className="text-[11px] text-muted-foreground/50">{phaseDone}/{phaseSteps.length} steps completed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── WHY THIS COUNTRY FITS ─── */}
        {fitReasons.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-6"
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

        {/* ─── ALTERNATIVE OPTION ─── */}
        {hasBetterOption && altData && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-8 rounded-xl border border-white/[0.05] bg-white/[0.02] p-5 md:p-6"
          >
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-3">Alternative option</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{altData.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold">{recommended}</p>
                <p className="text-[12px] text-muted-foreground">
                  {altData.stabilityMonths} months to stability · {altData.visaEase === "easy" ? "Fast" : "Moderate"} visa path
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[11px] text-primary hover:text-primary shrink-0"
                onClick={() => onNavigate?.("chat")}
              >
                Compare <ChevronRight size={12} className="ml-0.5" />
              </Button>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
