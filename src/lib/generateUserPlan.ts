import { supabase } from "@/integrations/supabase/client";
import { generatePlan } from "@/lib/planGenerator";

/** Minimal starter list shown while AI checklist generates in the background. */
export const PLACEHOLDER_DOCUMENTS = [
  { name: "Valid passport", description: "Must be valid for 6+ months from planned entry", phase: "before" as const, category: "identity", required: true },
  { name: "Proof of funds / bank statements", description: "Recent statements showing sufficient funds", phase: "before" as const, category: "financial", required: true },
  { name: "Health insurance", description: "Coverage valid in the destination country", phase: "before" as const, category: "legal", required: true },
  { name: "Criminal background check", description: "From your country of citizenship, apostilled if required", phase: "before" as const, category: "legal", required: true },
  { name: "Proof of accommodation", description: "Rental agreement, booking, or host invitation", phase: "before" as const, category: "legal", required: true },
];

/**
 * Clears replaceable plan/docs for a user, writes a fresh relocation plan,
 * inserts placeholder documents, then fires async AI checklist generation.
 *
 * Used by both OnboardingModal and EditProfileModal.
 */
export async function generateAndSaveUserPlan(
  userId: string,
  citizenship: string,
  targetCountry: string,
  visaType: string,
  familyStatus: string,
): Promise<void> {
  const plan = generatePlan(targetCountry, visaType, familyStatus);

  // Mark checklist as generating before we swap docs
  await supabase
    .from("user_profiles")
    .update({ documents_status: "generating" })
    .eq("user_id", userId);

  // Clear plan steps always
  await supabase.from("user_relocation_plan").delete().eq("user_id", userId);

  // Clear only non-preserved documents (never wipe uploads / marked-ready)
  const { data: existingDocs } = await supabase
    .from("user_documents")
    .select("id, document_name, storage_path, prepared_without_upload")
    .eq("user_id", userId);

  const preservedNames = new Set(
    (existingDocs || [])
      .filter((d) => d.storage_path || d.prepared_without_upload)
      .map((d) => d.document_name.toLowerCase()),
  );

  const deletableIds = (existingDocs || [])
    .filter((d) => !d.storage_path && !d.prepared_without_upload)
    .map((d) => d.id);

  if (deletableIds.length > 0) {
    await supabase.from("user_documents").delete().in("id", deletableIds);
  }

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

  // Placeholder docs so Documents tab isn't empty while AI runs
  const placeholderRows = PLACEHOLDER_DOCUMENTS
    .filter((doc) => !preservedNames.has(doc.name.toLowerCase()))
    .map((doc) => ({
      user_id: userId,
      document_name: doc.name,
      description: doc.description,
      phase: doc.phase,
      category: doc.category,
      source: "placeholder",
      status: "pending",
      verification_status: "pending",
      prepared_without_upload: false,
    }));
  if (placeholderRows.length > 0) {
    const { error: docError } = await supabase.from("user_documents").insert(placeholderRows);
    if (docError) throw new Error("Failed to save documents: " + docError.message);
  }

  // Fire-and-forget: Edge Function materializes AI list server-side.
  // On gateway/network failure the function never runs, so mark failed client-side
  // after one retry (server-side fallback still handles AI/parse failures when it does run).
  const checklistBody = {
    citizenship_country: citizenship,
    destination_country: targetCountry,
    visa_type: visaType,
    user_id: userId,
    family_status: familyStatus,
  };

  const markChecklistFailed = async () => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ documents_status: "failed" })
      .eq("user_id", userId);
    if (error) console.error("Failed to set documents_status=failed:", error);
  };

  const invokeChecklist = async () => {
    const { error, data } = await supabase.functions.invoke("generate-document-checklist", {
      body: checklistBody,
    });
    // Non-2xx / FunctionsHttpError lands in `error`; also treat explicit error payloads as failure
    if (error) throw error;
    if (data && typeof data === "object" && "error" in data && (data as { error?: unknown }).error) {
      throw new Error(String((data as { error: unknown }).error));
    }
  };

  void (async () => {
    try {
      await invokeChecklist();
    } catch (firstErr) {
      console.error("generate-document-checklist invoke failed, retrying once:", firstErr);
      await new Promise((r) => setTimeout(r, 2000));
      try {
        await invokeChecklist();
      } catch (retryErr) {
        console.error("generate-document-checklist invoke failed after retry:", retryErr);
        await markChecklistFailed();
      }
    }
  })();
}
