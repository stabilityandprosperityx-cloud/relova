import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, CircleDot, Download, Link2 } from "lucide-react";
import { toast } from "sonner";
import type { UserProfile } from "@/pages/Dashboard";
import LockedOverlay from "./LockedOverlay";

interface StepWithStatus {
  id: string;
  step_number: number;
  title: string;
  description: string | null;
  estimated_days: number;
  status: "todo" | "active" | "done";
  user_step_id?: string;
}

interface Props {
  profile: UserProfile | null;
  onBack?: () => void;
}

export default function DashboardPlan({ profile, onBack }: Props) {
  const { user } = useAuth();
  const [steps, setSteps] = useState<StepWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(true);
  const isLocked = (profile?.plan || "free") !== "full";

  const fetchSteps = async () => {
    if (!user || !profile?.visa_type) { setLoading(false); return; }
    const { data: allSteps } = await supabase
      .from("relocation_steps")
      .select("*")
      .eq("visa_type", profile.visa_type!)
      .order("step_number");
    const { data: userSteps } = await supabase
      .from("user_steps")
      .select("*")
      .eq("user_id", user.id);

    const statusMap = new Map((userSteps || []).map((s: any) => [s.step_id, { status: s.status, id: s.id }]));
    const merged: StepWithStatus[] = (allSteps || []).map((s: any) => ({
      ...s,
      status: (statusMap.get(s.id)?.status || "todo") as "todo" | "active" | "done",
      user_step_id: statusMap.get(s.id)?.id,
    }));
    setSteps(merged);
    setLoading(false);
  };

  useEffect(() => { fetchSteps(); }, [user, profile]);

  const cycleStatus = async (step: StepWithStatus) => {
    if (!user || isLocked) return;
    const nextStatus = step.status === "todo" ? "active" : step.status === "active" ? "done" : "todo";
    const completedAt = nextStatus === "done" ? new Date().toISOString() : null;
    setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: nextStatus as any } : s));

    if (step.user_step_id) {
      await supabase.from("user_steps").update({ status: nextStatus, completed_at: completedAt }).eq("id", step.user_step_id);
    } else {
      await supabase.from("user_steps").insert({ user_id: user.id, step_id: step.id, status: nextStatus, completed_at: completedAt });
    }
    fetchSteps();
  };

  const exportPdf = () => {
    const content = steps.map(s => `${s.status === "done" ? "✓" : s.status === "active" ? "●" : "○"} Step ${s.step_number}: ${s.title}\n  ${s.description || ""}\n  Est: ${s.estimated_days} days\n`).join("\n");
    const blob = new Blob([`Relocation Plan — ${profile?.visa_type} Visa\n${"=".repeat(40)}\n\n${content}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relova-plan-${profile?.visa_type?.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Plan exported");
  };

  const shareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/dashboard`);
    toast.success("Link copied to clipboard");
  };

  if (!profile?.visa_type) {
    return <p className="text-[#9CA3AF] text-sm">Complete onboarding to see your plan.</p>;
  }

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>;
  }

  return (
    <div className="space-y-6 relative">
      {isLocked && showPaywall && <LockedOverlay onClose={() => setShowPaywall(false)} />}
      <div className={isLocked ? "pointer-events-none" : ""}>
         <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">My Plan</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportPdf} className="gap-2 text-[12px] border-white/[0.08] bg-transparent hover:bg-white/[0.04]">
              <Download size={14} /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={shareLink} className="gap-2 text-[12px] border-white/[0.08] bg-transparent hover:bg-white/[0.04]">
              <Link2 size={14} /> Share
            </Button>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-start gap-3 md:gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 md:p-4 hover:bg-white/[0.05] transition-colors"
            >
              <button onClick={() => cycleStatus(step)} className="mt-0.5 shrink-0 active:scale-[0.9] transition-transform">
                {step.status === "done" ? (
                  <CheckCircle2 size={20} className="text-[#38BDF8]" />
                ) : step.status === "active" ? (
                  <CircleDot size={20} className="text-[#38BDF8]" />
                ) : (
                  <Circle size={20} className="text-[#9CA3AF]/30" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] font-medium ${step.status === "done" ? "line-through text-[#9CA3AF]" : ""}`}>
                  {step.step_number}. {step.title}
                </div>
                {step.description && (
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">{step.description}</div>
                )}
              </div>
              <span className="text-[11px] text-[#9CA3AF]/60 shrink-0 tabular-nums">{step.estimated_days}d</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
