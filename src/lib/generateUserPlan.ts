import { supabase } from "@/integrations/supabase/client";
import { generatePlan, generateChecklist } from "@/lib/planGenerator";

/**
 * Clears any existing plan/documents for a user, then writes a fresh
 * user_relocation_plan + user_documents derived from the given profile data.
 *
 * Used by both OnboardingModal and EditProfileModal so the logic never
 * diverges between the two flows.
 */
export async function generateAndSaveUserPlan(
  userId: string,
  targetCountry: string,
  visaType: string,
  familyStatus: string,
): Promise<void> {
  const plan = generatePlan(targetCountry, visaType, familyStatus);
  const checklist = generateChecklist(targetCountry, visaType, familyStatus);

  // Clear existing plan + docs (handles re-onboarding / country change)
  await Promise.all([
    supabase.from("user_relocation_plan").delete().eq("user_id", userId),
    supabase.from("user_documents").delete().eq("user_id", userId),
  ]);

  // Insert steps into user_relocation_plan
  let stepNumber = 1;
  const planRows: object[] = [];
  for (const phase of plan) {
    for (const s of phase.steps) {
      planRows.push({
        user_id: userId,
        title: s.title,
        description: s.description,
        phase: phase.name,
        step_number: stepNumber,
        estimated_days: s.estimatedDays,
        status: "todo",
      });
      stepNumber++;
    }
  }
  if (planRows.length > 0) {
    const { error } = await supabase.from("user_relocation_plan").insert(planRows);
    if (error) throw new Error("Failed to save plan: " + error.message);
  }

  // Insert documents into user_documents
  const docRows = checklist.map((doc) => ({
    user_id: userId,
    document_name: doc.name,
    status: "pending",
    verification_status: "pending",
    prepared_without_upload: false,
  }));
  if (docRows.length > 0) {
    const { error } = await supabase.from("user_documents").insert(docRows);
    if (error) throw new Error("Failed to save documents: " + error.message);
  }
}
