import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, Clock, ChevronRight, Lightbulb, MapPin, Shield, Zap } from "lucide-react";
import type { UserProfile, DashboardTab } from "@/pages/Dashboard";
import { countryDatabase } from "@/lib/countryMatching";

interface Props {
  profile: UserProfile | null;
  onNavigate: (tab: DashboardTab) => void;
  onEditProfile: () => void;
}

interface StepWithStatus {
  id: string;
  step_number: number;
  title: string;
  description: string | null;
  estimated_days: number;
  status: "todo" | "active" | "done";
}

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

function getPathType(profile: UserProfile): string {
  if (!profile.goal) return "General relocation";
  const first = profile.goal.split(",")[0];
  return goalLabels[first] || "General relocation";
}

export default function DashboardOverview({ profile, onNavigate, onEditProfile }: Props) {
  const { user } = useAuth();
  const [steps, setSteps] = useState<StepWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) { setLoading(false); return; }
    const fetchData = async () => {
      const { data: allSteps } = await supabase
        .from("relocation_steps")
        .select("*")
        .eq("visa_type", profile.visa_type || "TBD")
        .order("step_number");
      const { data: userSteps } = await supabase
        .from("user_steps")
        .select("*")
        .eq("user_id", user.id);
      const statusMap = new Map((userSteps || []).map((s: any) => [s.step_id, s.status]));
      const merged: StepWithStatus[] = (allSteps || []).map((s: any) => ({
        ...s,
        status: (statusMap.get(s.id) || "todo") as "todo" | "active" | "done",
      }));
      setSteps(merged);
      setLoading(false);
    };
    fetchData();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center pt-8 md:pt-12 px-5">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 md:p-8 text-center max-w-md w-full">
          <h2 className="text-lg font-semibold mb-2">Set up your relocation profile</h2>
          <p className="text-sm text-muted-foreground mb-6">Tell us about your situation and we'll create a personalized plan.</p>
        </div>
      </div>
    );
  }

  const countryData = countryDatabase.find(c => c.name === profile.target_country);
  const risk = getRiskLevel(countryData);
  const pathType = getPathType(profile);
  const stabilityMonths = countryData?.stabilityMonths || "6-12";

  const doneCount = steps.filter(s => s.status === "done").length;
  const totalSteps = steps.length;
  const currentStepNum = doneCount + 1;
  const progressPct = totalSteps > 0 ? Math.max(3, Math.round((doneCount / totalSteps) * 100)) : 3;
  const nextStep = steps.find(s => s.status === "active") || steps.find(s => s.status === "todo");

  const recommended = profile.recommended_country;
  const hasBetterOption = recommended && recommended !== profile.target_country;
  const altData = hasBetterOption ? countryDatabase.find(c => c.name === recommended) : null;

  const risks = countryData?.risks || ["Research visa requirements carefully"];

  // Dynamic next actions
  const nextActions = [
    { label: "Check visa requirements", tab: "plan" as DashboardTab },
    { label: "Prepare key documents", tab: "documents" as DashboardTab },
    { label: "Talk to your advisor", tab: "chat" as DashboardTab },
  ];

  return (
    <div className="space-y-6 md:space-y-8">

      {/* ─── 1. MAIN BLOCK — Your Relocation Path ─── */}
      <section className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 md:p-7">
        <p className="text-[11px] uppercase tracking-widest text-primary/80 font-medium mb-4">Your relocation path</p>

        <div className="flex items-start gap-4 mb-5">
          {countryData && <span className="text-3xl md:text-4xl mt-0.5">{countryData.flag}</span>}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{profile.target_country}</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Your best path based on your profile</p>
          </div>
          <Button variant="ghost" size="sm" className="text-[11px] text-muted-foreground hover:text-foreground shrink-0" onClick={onEditProfile}>
            Edit
          </Button>
        </div>

        {/* Key metrics row */}
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
          onClick={() => onNavigate("plan")}
        >
          Continue your plan <ArrowRight size={14} className="ml-1.5" />
        </Button>
      </section>

      {/* ─── 2. PROGRESS BLOCK ─── */}
      <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Progress</p>
          <span className="text-[12px] text-muted-foreground">
            Step {Math.min(currentStepNum, totalSteps)} of {totalSteps || "–"}
          </span>
        </div>

        <Progress value={progressPct} className="h-1.5 bg-white/[0.06] mb-4" />

        {nextStep && (
          <button
            onClick={() => onNavigate("plan")}
            className="w-full flex items-center gap-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] p-3 transition-colors text-left group"
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <ChevronRight size={14} className="text-primary group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground mb-0.5">Next step</p>
              <p className="text-[13px] font-medium truncate">{nextStep.title.replace(/\[.*?\]\s*/, "")}</p>
            </div>
          </button>
        )}
      </section>

      {/* ─── 3. WHAT TO DO NEXT ─── */}
      <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-6">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-4">What to do next</p>
        <div className="space-y-1">
          {nextActions.map((action, i) => (
            <button
              key={i}
              onClick={() => onNavigate(action.tab)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.05] transition-colors text-left group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
              <span className="text-[13px] text-foreground/80 group-hover:text-foreground transition-colors flex-1">
                {action.label}
              </span>
              <ChevronRight size={13} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
            </button>
          ))}
        </div>
      </section>

      {/* ─── Bottom row: Risks + Stability comparison ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">

        {/* ─── 4. RISKS & CONSIDERATIONS ─── */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-amber-400" />
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Risks & considerations</p>
          </div>
          <div className="space-y-3">
            {risks.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-1.5 shrink-0" />
                <p className="text-[13px] text-muted-foreground leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
          {hasBetterOption && (
            <div className="mt-4 rounded-lg bg-primary/[0.06] border border-primary/10 p-3 flex items-start gap-2.5">
              <Lightbulb size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-[12px] text-primary/90">
                Better option available: <strong>{recommended}</strong> — faster path, lower risk
              </p>
            </div>
          )}
        </section>

        {/* ─── 5. TIME TO STABILITY ─── */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-primary" />
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Time to stability</p>
          </div>

          <div className="mb-1">
            <span className="text-3xl md:text-4xl font-bold tracking-tight">{stabilityMonths}</span>
            <span className="text-base text-muted-foreground ml-1.5">months</span>
          </div>
          <p className="text-[12px] text-muted-foreground/70 mb-4">
            Estimated time to stable life in {profile.target_country}
          </p>

          {hasBetterOption && altData && (
            <div className="space-y-2 rounded-lg bg-white/[0.03] border border-white/[0.05] p-3">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin size={11} /> {profile.target_country}
                </span>
                <span className="font-medium">{stabilityMonths} mo</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-primary flex items-center gap-1.5">
                  <MapPin size={11} /> {recommended}
                </span>
                <span className="font-medium text-primary">{altData.stabilityMonths} mo</span>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="mt-4 text-[12px] text-primary hover:text-primary p-0 h-auto"
            onClick={() => onNavigate("chat")}
          >
            Ask your advisor <ArrowRight size={12} className="ml-1" />
          </Button>
        </section>
      </div>
    </div>
  );
}
