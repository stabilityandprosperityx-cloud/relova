import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, AlertTriangle, TrendingUp, Clock, Target, ChevronRight } from "lucide-react";
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-40" /><Skeleton className="h-40" />
        </div>
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

  const doneCount = steps.filter(s => s.status === "done").length;
  const totalSteps = steps.length;
  const progressPct = totalSteps > 0 ? Math.max(5, Math.round((doneCount / totalSteps) * 100)) : 5;

  const nextStep = steps.find(s => s.status === "active") || steps.find(s => s.status === "todo");
  const currentPhase = nextStep?.title.match(/\[(.*?)\]/)?.[1] || "Getting Started";

  const countryData = countryDatabase.find(c => c.name === profile.target_country);

  const matchScore = profile.match_score;
  const confidence = matchScore ? (matchScore >= 75 ? "High" : matchScore >= 50 ? "Medium" : "Low") : "High";

  const reasons: string[] = [];
  if (profile.goal) {
    const goalLabels: Record<string, string> = {
      safety: "Fits your safety priority", money: "Matches your income goals",
      better_life: "Aligns with quality of life goals", freedom: "Offers the freedom you need",
      family: "Good for families", reset: "Great for a fresh start",
      growth: "Strong growth opportunities", environment: "Fits climate preferences",
    };
    const userGoals = profile.goal.split(",").slice(0, 2);
    userGoals.forEach(g => { if (goalLabels[g]) reasons.push(goalLabels[g]); });
  }
  if (countryData?.visaEase === "easy") reasons.push("Easy visa process");
  else if (countryData) reasons.push(`${countryData.stabilityMonths} months to stability`);
  if (reasons.length === 0) reasons.push("Selected as your destination");

  const risks = countryData?.risks || ["Research visa requirements carefully"];

  const recommended = profile.recommended_country;
  const hasBetterOption = recommended && recommended !== profile.target_country;

  const stabilityMonths = countryData?.stabilityMonths || "6-12";

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Control Center</h1>
        <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground hover:text-foreground gap-1.5" onClick={onEditProfile}>
          Edit profile
        </Button>
      </div>

      <p className="text-[13px] text-muted-foreground">Your path is clear. Here's what to do next.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Section 1 — Main Decision */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-primary" />
            <span className="text-[11px] uppercase tracking-wider text-primary font-medium">Your best move</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            {countryData && <span className="text-2xl">{countryData.flag}</span>}
            <div>
              <div className="text-lg md:text-xl font-bold">{profile.target_country}</div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  confidence === "High" ? "bg-green-500/10 text-green-400" :
                  confidence === "Medium" ? "bg-amber-500/10 text-amber-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  Confidence: {confidence}
                </span>
                {profile.visa_type && profile.visa_type !== "TBD" && (
                  <span className="px-2 py-0.5 rounded bg-white/[0.06] text-muted-foreground text-[10px]">
                    {profile.visa_type.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {reasons.map((r, i) => (
              <p key={i} className="text-[12px] text-muted-foreground">✓ {r}</p>
            ))}
          </div>
        </div>

        {/* Section 2 — Reality Check */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-amber-400" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Reality Check</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
              countryData?.visaEase === "easy" ? "bg-green-500/10 text-green-400" :
              countryData?.visaEase === "hard" ? "bg-red-500/10 text-red-400" :
              "bg-amber-500/10 text-amber-400"
            }`}>
              {countryData?.visaEase === "easy" ? "Easy path" : countryData?.visaEase === "hard" ? "Challenging" : "Moderate difficulty"}
            </span>
          </div>
          <div className="space-y-2 mb-3">
            {risks.slice(0, 2).map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[12px] text-muted-foreground">{r}</p>
              </div>
            ))}
          </div>
          {hasBetterOption && (
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 mt-2">
              <p className="text-[11px] text-primary">
                💡 Better option available: <strong>{recommended}</strong> (faster, lower risk)
              </p>
            </div>
          )}
        </div>

        {/* Section 3 — Progress */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Progress</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-bold">{progressPct}%</span>
            <span className="text-[12px] text-muted-foreground">Phase: {currentPhase}</span>
          </div>
          <Progress value={progressPct} className="h-2 bg-white/[0.06] mb-4" />
          {nextStep && (
            <button
              onClick={() => onNavigate("plan")}
              className="w-full flex items-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] p-3 transition-colors text-left"
            >
              <ChevronRight size={14} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate">{nextStep.title.replace(/\[.*?\]\s*/, "")}</p>
                <p className="text-[10px] text-muted-foreground">Next step</p>
              </div>
            </button>
          )}
          <p className="text-[11px] text-muted-foreground/60 mt-3">You are on the right track.</p>
        </div>

        {/* Section 4 — Time to Stability */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-primary" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Time to Stability</span>
          </div>
          <div className="text-2xl font-bold mb-1">{stabilityMonths} months</div>
          <p className="text-[12px] text-muted-foreground mb-3">Estimated time to stable life in {profile.target_country}</p>

          {hasBetterOption && (
            <div className="space-y-1.5 rounded-lg bg-white/[0.02] p-3">
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">{profile.target_country}</span>
                <span className="font-medium">{stabilityMonths} months</span>
              </div>
              {(() => {
                const altData = countryDatabase.find(c => c.name === recommended);
                return altData ? (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-primary">{recommended}</span>
                    <span className="font-medium text-primary">{altData.stabilityMonths} months</span>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-[12px] text-primary hover:text-primary p-0 h-auto"
            onClick={() => onNavigate("chat")}
          >
            Ask your advisor <ArrowRight size={12} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
