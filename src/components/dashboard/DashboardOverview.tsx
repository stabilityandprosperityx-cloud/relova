import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, CheckCircle2, FileText, Circle, CircleDot } from "lucide-react";
import type { UserProfile, DashboardTab } from "@/pages/Dashboard";
import ReactMarkdown from "react-markdown";

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
  const [lastAiMessage, setLastAiMessage] = useState<string | null>(null);
  const [docsReady, setDocsReady] = useState({ done: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile?.visa_type) { setLoading(false); return; }

    const fetchData = async () => {
      // Fetch steps
      const { data: allSteps } = await supabase
        .from("relocation_steps")
        .select("*")
        .eq("visa_type", profile.visa_type!)
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

      // Fetch docs count
      const { data: visaDocs } = await supabase
        .from("visa_documents")
        .select("id, is_required")
        .eq("visa_type", profile.visa_type!);
      const { data: userDocs } = await supabase
        .from("user_documents")
        .select("document_name, status")
        .eq("user_id", user.id);
      const requiredCount = (visaDocs || []).filter((d: any) => d.is_required).length;
      const uploadedNames = new Set((userDocs || []).filter((d: any) => d.status === "uploaded" || d.status === "verified").map((d: any) => d.document_name));
      const requiredUploaded = (visaDocs || []).filter((d: any) => d.is_required && uploadedNames.has(d.document_name)).length;
      setDocsReady({ done: requiredUploaded, total: requiredCount });

      // Fetch last AI message
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("content")
        .eq("user_id", user.id)
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(1);
      if (msgs && msgs.length > 0) {
        setLastAiMessage(msgs[0].content);
      }

      setLoading(false);
    };
    fetchData();
  }, [user, profile]);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-8 text-center max-w-md">
          <h2 className="text-lg font-semibold mb-2">Set up your relocation profile</h2>
          <p className="text-sm text-[#9CA3AF] mb-6">Tell us about your situation and we'll create a personalized plan.</p>
          <Button onClick={() => onNavigate("chat")} className="gap-2">
            Start with AI <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    );
  }

  const doneCount = steps.filter(s => s.status === "done").length;
  const totalSteps = steps.length;
  const progressPct = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0;
  const nextSteps = steps.filter(s => s.status !== "done").slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <MapPin size={16} className="text-[#38BDF8] mb-3" />
          <div className="text-xl font-semibold">{profile.target_country || "—"}</div>
          <div className="text-[11px] text-[#9CA3AF] mt-1">Destination</div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <CheckCircle2 size={16} className="text-[#38BDF8] mb-3" />
          <div className="text-xl font-semibold">{progressPct}%</div>
          <div className="text-[11px] text-[#9CA3AF] mt-1">{doneCount} of {totalSteps} steps done</div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <FileText size={16} className="text-[#38BDF8] mb-3" />
          <div className="text-xl font-semibold">{docsReady.done} / {docsReady.total}</div>
          <div className="text-[11px] text-[#9CA3AF] mt-1">Documents ready</div>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progressPct} className="h-2 bg-white/[0.06]" />

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next steps */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold mb-4">Next steps</h3>
          <div className="space-y-3">
            {nextSteps.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">All steps completed! 🎉</p>
            ) : (
              nextSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => onNavigate("plan")}
                  className="w-full flex items-start gap-3 text-left hover:bg-white/[0.02] rounded-lg p-2 -mx-2 transition-colors"
                >
                  {step.status === "done" ? (
                    <CheckCircle2 size={16} className="text-[#38BDF8] mt-0.5 shrink-0" />
                  ) : step.status === "active" ? (
                    <CircleDot size={16} className="text-[#38BDF8] mt-0.5 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-[#9CA3AF]/40 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <div className="text-[13px] font-medium">{step.title}</div>
                    <div className="text-[11px] text-[#9CA3AF]">{step.description}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Recent AI advice */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold mb-4">Recent AI advice</h3>
          {lastAiMessage ? (
            <>
              <div className="text-[13px] text-[#9CA3AF] leading-relaxed line-clamp-6 prose prose-sm prose-invert max-w-none [&_p]:text-[#9CA3AF] [&_li]:text-[#9CA3AF]">
                <ReactMarkdown>{lastAiMessage}</ReactMarkdown>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-[12px] text-[#38BDF8] hover:text-[#38BDF8] p-0 h-auto"
                onClick={() => onNavigate("chat")}
              >
                Ask follow-up <ArrowRight size={12} className="ml-1" />
              </Button>
            </>
          ) : (
            <div>
              <p className="text-sm text-[#9CA3AF] mb-4">No conversations yet. Ask Relova AI about your next steps.</p>
              <Button size="sm" onClick={() => onNavigate("chat")} className="gap-2 text-[12px]">
                Ask AI <ArrowRight size={12} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
