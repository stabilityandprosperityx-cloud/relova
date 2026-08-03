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

// Must match the phase names produced by planGenerator.ts
const PHASES = ["Entry Preparation", "Arrival & Setup", "Legal Status", "Stability"];

export function useRelocationCase(profile: UserProfile | null): RelocationCase {
  const { user } = useAuth();
  const [data, setData] = useState<Omit<RelocationCase, "markStepDone" | "refresh">>({
    progressPct: 0, doneCount: 0, totalCount: 0,
    currentPhase: "Entry Preparation", currentPhaseIndex: 0, totalPhases: PHASES.length,
    nextStep: null, daysUntilMove: null, loading: true,
  });

  const load = useCallback(async () => {
    if (!user) { setData(d => ({ ...d, loading: false })); return; }

    const { data: planRows } = await supabase
      .from("user_relocation_plan")
      .select("id, title, description, estimated_days, step_number, status, phase")
      .eq("user_id", user.id)
      .order("step_number");

    const steps = (planRows || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description || "",
      estimatedDays: s.estimated_days,
      phase: s.phase,
      isDone: s.status === "done",
    }));

    const doneCount = steps.filter(s => s.isDone).length;
    const totalCount = steps.length;
    const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    // Current step = first todo by step_number (already ordered)
    const nextStepRaw = steps.find(s => !s.isDone) ?? null;
    const nextStep = nextStepRaw
      ? { id: nextStepRaw.id, title: nextStepRaw.title, description: nextStepRaw.description, estimatedDays: nextStepRaw.estimatedDays }
      : null;

    const currentPhase = doneCount === 0
      ? PHASES[0]
      : (nextStepRaw?.phase ?? PHASES[PHASES.length - 1]);
    const currentPhaseIndex = Math.max(0, PHASES.indexOf(currentPhase));

    let daysUntilMove: number | null = null;
    if ((profile as any)?.move_date) {
      const diff = new Date((profile as any).move_date).getTime() - Date.now();
      daysUntilMove = Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
    }

    setData({ progressPct, doneCount, totalCount, currentPhase, currentPhaseIndex, totalPhases: PHASES.length, nextStep, daysUntilMove, loading: false });
  }, [user, profile]);

  useEffect(() => { load(); }, [load]);

  const markStepDone = async (stepId: string) => {
    if (!user) return;
    await supabase
      .from("user_relocation_plan")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", stepId)
      .eq("user_id", user.id);
    await load();
  };

  return { ...data, markStepDone, refresh: load };
}
