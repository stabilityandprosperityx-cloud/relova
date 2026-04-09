import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/pages/Dashboard";

export interface RelocationCase {
  progressPct: number;
  doneCount: number;
  totalCount: number;
  currentPhase: string;
  currentPhaseIndex: number;
  totalPhases: number;
  nextStep: { id: string; title: string; description: string; estimatedDays: number } | null;
  daysUntilMove: number | null;
  loading: boolean;
  markStepDone: (stepId: string) => Promise<void>;
  refresh: () => void;
}

const PHASES = ["Before you move", "Arrival", "Legal & Setup", "Settling in"];

function getPhaseFromTitle(title: string): string {
  const t = title.toLowerCase().replace(/^\[.*?\]\s*/, "");
  if (t.includes("arrive") || t.includes("accommodation") || t.includes("bank account") || t.includes("sim card") || t.includes("register address") || t.includes("internet")) return "Arrival";
  if (t.includes("visa") || t.includes("permit") || t.includes("tax") || t.includes("insurance") || t.includes("biometric") || t.includes("nif") || t.includes("nie") || t.includes("emirates") || t.includes("medical fitness")) return "Legal & Setup";
  if (t.includes("routine") || t.includes("network") || t.includes("enroll") || t.includes("settle") || t.includes("daily")) return "Settling in";
  return "Before you move";
}

export function useRelocationCase(profile: UserProfile | null): RelocationCase {
  const { user } = useAuth();
  const [data, setData] = useState<Omit<RelocationCase, "markStepDone" | "refresh">>({
    progressPct: 0, doneCount: 0, totalCount: 0,
    currentPhase: "Before you move", currentPhaseIndex: 0, totalPhases: 4,
    nextStep: null, daysUntilMove: null, loading: true,
  });

  const load = useCallback(async () => {
    if (!user || !profile?.visa_type) { setData(d => ({ ...d, loading: false })); return; }
    const [{ data: allSteps }, { data: userSteps }] = await Promise.all([
      supabase.from("relocation_steps").select("id, title, description, estimated_days, step_number").eq("visa_type", profile.visa_type).order("step_number"),
      supabase.from("user_steps").select("step_id, status").eq("user_id", user.id),
    ]);
    const doneIds = new Set((userSteps || []).filter((s: any) => s.status === "done").map((s: any) => s.step_id));
    const steps = (allSteps || []).map((s: any) => ({
      ...s,
      title: s.title.replace(/^\[.*?\]\s*/, ""),
      isDone: doneIds.has(s.id),
      phase: getPhaseFromTitle(s.title),
    }));
    const doneCount = steps.filter((s: any) => s.isDone).length;
    const totalCount = steps.length;
    const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    const nextStep = steps.find((s: any) => !s.isDone) || null;
    const firstDonePhase = steps.find((s: any) => s.isDone)?.phase || null;
    const currentPhase = doneCount === 0 ? "Before you move" : (nextStep ? nextStep.phase : "Settling in");
    const currentPhaseIndex = Math.max(0, PHASES.indexOf(currentPhase));
    let daysUntilMove: number | null = null;
    if ((profile as any).move_date) {
      const diff = new Date((profile as any).move_date).getTime() - Date.now();
      daysUntilMove = Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
    }
    setData({ progressPct, doneCount, totalCount, currentPhase, currentPhaseIndex, totalPhases: 4, nextStep, daysUntilMove, loading: false });
  }, [user, profile]);

  useEffect(() => { load(); }, [load]);

  const markStepDone = async (stepId: string) => {
    if (!user) return;
    const { data: existing } = await supabase.from("user_steps").select("id").eq("user_id", user.id).eq("step_id", stepId).maybeSingle();
    if (existing) {
      await supabase.from("user_steps").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await supabase.from("user_steps").insert({ user_id: user.id, step_id: stepId, status: "done", completed_at: new Date().toISOString() });
    }
    await load();
  };

  return { ...data, markStepDone, refresh: load };
}
