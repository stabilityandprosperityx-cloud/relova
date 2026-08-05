/**
 * Generate citizenship+destination+visa-specific document checklists.
 * Caches results for 30 days; optionally materializes into user_documents.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPT_VERSION = "v2";
const MODEL = "claude-opus-5";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface DocItem {
  name: string;
  description: string;
  phase: "before" | "during" | "after";
  required: boolean;
  category: "identity" | "financial" | "legal" | "other";
  /** Official government/consulate URL or source name when found; otherwise null */
  source: string | null;
}

const FALLBACK_DOCS: DocItem[] = [
  { name: "Valid passport", description: "Must be valid for 6+ months from planned entry", phase: "before", required: true, category: "identity", source: null },
  { name: "Proof of funds / bank statements", description: "Recent statements showing sufficient funds for your visa type", phase: "before", required: true, category: "financial", source: null },
  { name: "Health insurance", description: "Coverage valid in the destination country", phase: "before", required: true, category: "legal", source: null },
  { name: "Criminal background check", description: "From your country of citizenship, apostilled if required", phase: "before", required: true, category: "legal", source: null },
  { name: "Proof of accommodation", description: "Rental agreement, booking, or host invitation for arrival", phase: "before", required: true, category: "legal", source: null },
];

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function overlayFamilyDocs(docs: DocItem[], familyStatus?: string): DocItem[] {
  const out = [...docs];
  const names = new Set(out.map((d) => d.name.toLowerCase()));

  const push = (item: DocItem) => {
    if (!names.has(item.name.toLowerCase())) {
      out.push(item);
      names.add(item.name.toLowerCase());
    }
  };

  if (familyStatus === "couple" || familyStatus === "family") {
    push({
      name: "Marriage certificate",
      description: "Apostilled and translated if required by the destination",
      phase: "before",
      required: true,
      category: "legal",
      source: null,
    });
  }
  if (familyStatus === "family") {
    push({
      name: "Birth certificates",
      description: "For all children, apostilled and translated if needed",
      phase: "before",
      required: true,
      category: "identity",
      source: null,
    });
    push({
      name: "School records",
      description: "Recent transcripts for school-age children",
      phase: "before",
      required: false,
      category: "other",
      source: null,
    });
  }
  return out;
}

function extractTextFromClaudeContent(content: unknown[]): { text: string; blockCount: number; blockTypes: string[] } {
  const blocks = Array.isArray(content) ? content : [];
  const blockTypes = blocks.map((b) =>
    b && typeof b === "object" && "type" in b ? String((b as { type: unknown }).type) : "unknown",
  );
  const text = blocks
    .filter((b): b is { type: string; text?: string } =>
      !!b && typeof b === "object" && (b as { type?: string }).type === "text",
    )
    .map((b) => b.text ?? "")
    .join("\n");
  return { text, blockCount: blocks.length, blockTypes };
}

/** Prefer fenced JSON, else outermost {...}, else trimmed text after leading fence strip. */
function extractJsonPayload(rawText: string): string {
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) return fenceMatch[1].trim();

  const stripped = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start >= 0 && end > start) return stripped.slice(start, end + 1);
  return stripped;
}

function parseDocuments(rawText: string): DocItem[] | null {
  const payload = extractJsonPayload(rawText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch (err) {
    console.error(
      "generate-document-checklist: invalid JSON syntax:",
      err instanceof Error ? err.message : err,
    );
    console.error("generate-document-checklist: FULL raw text attempted:\n", rawText);
    return null;
  }

  if (!parsed || typeof parsed !== "object") {
    console.error("generate-document-checklist: JSON wrong shape — not an object/array");
    console.error("generate-document-checklist: FULL raw text attempted:\n", rawText);
    return null;
  }

  const arr = Array.isArray((parsed as { documents?: unknown }).documents)
    ? (parsed as { documents: unknown[] }).documents
    : Array.isArray(parsed)
      ? parsed
      : null;

  if (!arr) {
    console.error('generate-document-checklist: JSON wrong shape — missing "documents" array');
    console.error("generate-document-checklist: FULL raw text attempted:\n", rawText);
    return null;
  }
  if (arr.length === 0) {
    console.error("generate-document-checklist: JSON wrong shape — documents array empty");
    console.error("generate-document-checklist: FULL raw text attempted:\n", rawText);
    return null;
  }

  const validPhases = new Set(["before", "during", "after"]);
  const validCats = new Set(["identity", "financial", "legal", "other"]);
  const out: DocItem[] = [];
  let skipped = 0;

  for (const item of arr) {
    if (!item || typeof item !== "object" || typeof (item as { name?: unknown }).name !== "string") {
      skipped++;
      continue;
    }
    const name = String((item as { name: string }).name).trim();
    if (!name) {
      skipped++;
      continue;
    }
    const phase = validPhases.has((item as { phase?: string }).phase ?? "")
      ? ((item as { phase: "before" | "during" | "after" }).phase)
      : "before";
    const category = validCats.has((item as { category?: string }).category ?? "")
      ? ((item as { category: "identity" | "financial" | "legal" | "other" }).category)
      : "other";
    const rawSource = (item as { source?: unknown }).source;
    let source: string | null = null;
    if (typeof rawSource === "string") {
      const trimmed = rawSource.trim();
      if (trimmed && trimmed.toLowerCase() !== "null") source = trimmed;
    }
    out.push({
      name,
      description:
        typeof (item as { description?: unknown }).description === "string"
          ? (item as { description: string }).description.trim()
          : "",
      phase,
      required: (item as { required?: boolean }).required !== false,
      category,
      source,
    });
  }

  console.log(
    `generate-document-checklist: schema filter — raw=${arr.length}, kept=${out.length}, skipped=${skipped}`,
  );

  if (out.length === 0) {
    console.error("generate-document-checklist: zero valid documents after schema filtering");
    console.error("generate-document-checklist: FULL raw text attempted:\n", rawText);
    return null;
  }
  return out;
}

async function callClaudeWithWebSearch(
  citizenship: string,
  destination: string,
  visaType: string,
): Promise<DocItem[] | null> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    console.error("generate-document-checklist: ANTHROPIC_API_KEY not set");
    return null;
  }

  const prompt = `You are a relocation document specialist.
Given: citizenship=${citizenship}, destination=${destination}, visa_type=${visaType}.

Search official government/consulate/embassy sources for current document requirements for this specific citizenship → destination → visa combination.

Return documents a typical applicant needs BEFORE departure, DURING arrival/setup, and AFTER for residence/stability.
Rules:
- Specific to this citizenship→destination→visa combination
- Distinct atomic items — do not list overlapping/ambiguous items (e.g. distinguish clearly between 'passport photocopies' and 'biometric photos of the applicant' if both are needed, never list near-duplicates unclearly)
- Prefer official government/consulate sources; if uncertain about a specific requirement, note that in the description (e.g. 'verify with official source, requirements may vary by consulate')
- For each document, include a "source" field: an official government/consulate/embassy URL when findable via search, OR a short official source name (e.g. "AIMA Portugal", "Ministry of Interior of the Czech Republic"). Use null only when no credible official source can be identified.
- Do not invent URLs. If unsure of the exact URL, use the official body name as a string instead of guessing a link.
- 8-20 items total across all three phases
- No generic filler items

Return JSON only, no markdown fences, no preamble:
{
  "documents": [
    { "name": "...", "description": "...", "phase": "before"|"during"|"after", "required": true|false, "category": "identity"|"financial"|"legal"|"other", "source": "<official URL or source name, or null>" }
  ]
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8192,
        tools: [{
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
          allowed_callers: ["direct"],
        }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("generate-document-checklist: Anthropic error", response.status, errText);
      return null;
    }

    const data = await response.json();
    const content = Array.isArray(data?.content) ? data.content : [];
    const { text, blockCount, blockTypes } = extractTextFromClaudeContent(content);
    console.log(
      `generate-document-checklist: Claude response: ${blockCount} blocks [${blockTypes.join(", ")}], ${text.length} chars extracted, stop_reason=${data?.stop_reason ?? "n/a"}`,
    );
    return parseDocuments(text);
  } catch (err) {
    console.error("generate-document-checklist: Claude fetch failed", err);
    return null;
  }
}

async function materializeForUser(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  documents: DocItem[],
  status: "ready" | "failed",
) {
  // Remove placeholders
  await supabase.from("user_documents").delete().eq("user_id", userId).eq("source", "placeholder");

  // Load existing to preserve uploads / prepared
  const { data: existing } = await supabase
    .from("user_documents")
    .select("id, document_name, storage_path, prepared_without_upload, source")
    .eq("user_id", userId);

  const preserved = (existing ?? []).filter(
    (d: { storage_path: string | null; prepared_without_upload: boolean | null }) =>
      !!d.storage_path || !!d.prepared_without_upload,
  );
  const preservedNames = new Set(
    preserved.map((d: { document_name: string }) => d.document_name.toLowerCase()),
  );

  // Remove replaceable AI/static rows (never touch uploads/prepared)
  const toRemove = (existing ?? [])
    .filter(
      (d: { id: string; source: string; storage_path: string | null; prepared_without_upload: boolean | null }) =>
        (d.source === "ai_generated" || d.source === "static") &&
        !d.storage_path &&
        !d.prepared_without_upload,
    )
    .map((d: { id: string }) => d.id);

  if (toRemove.length > 0) {
    await supabase.from("user_documents").delete().in("id", toRemove);
  }

  const rows = documents
    .filter((d) => !preservedNames.has(d.name.toLowerCase()))
    .map((d) => ({
      user_id: userId,
      document_name: d.name,
      description: d.description || null,
      phase: d.phase,
      category: d.category,
      source: "ai_generated",
      status: d.required ? "pending" : "optional",
      verification_status: "pending",
      prepared_without_upload: false,
    }));

  if (rows.length > 0) {
    const { error } = await supabase.from("user_documents").insert(rows);
    if (error) console.error("generate-document-checklist: insert docs failed", error);
  }

  await supabase
    .from("user_profiles")
    .update({ documents_status: status })
    .eq("user_id", userId);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const citizenship_country = normalize(String(body.citizenship_country ?? ""));
    const destination_country = normalize(String(body.destination_country ?? ""));
    const visa_type = normalize(String(body.visa_type ?? ""));
    const user_id = body.user_id ? String(body.user_id) : undefined;
    const family_status = body.family_status ? String(body.family_status) : undefined;

    if (!citizenship_country || !destination_country || !visa_type) {
      return jsonResponse({ error: "citizenship_country, destination_country, and visa_type are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let documents: DocItem[] | null = null;
    let source: "cache" | "fresh" | "fallback" = "fallback";
    let generated_at = new Date().toISOString();

    // Cache lookup
    const { data: cached } = await supabase
      .from("document_requirement_cache")
      .select("documents, generated_at")
      .eq("citizenship_country", citizenship_country)
      .eq("destination_country", destination_country)
      .eq("visa_type", visa_type)
      .eq("prompt_version", PROMPT_VERSION)
      .maybeSingle();

    const cachedAt = cached?.generated_at ? new Date(cached.generated_at).getTime() : 0;
    const isFresh = cached && Date.now() - cachedAt < CACHE_TTL_MS;

    if (isFresh && Array.isArray(cached.documents) && cached.documents.length > 0) {
      documents = cached.documents as DocItem[];
      source = "cache";
      generated_at = cached.generated_at;
      console.log(`generate-document-checklist: cache hit ${citizenship_country}→${destination_country}/${visa_type}`);
    } else {
      const fresh = await callClaudeWithWebSearch(citizenship_country, destination_country, visa_type);
      if (fresh && fresh.length > 0) {
        documents = fresh;
        source = "fresh";
        generated_at = new Date().toISOString();

        const { error: upsertErr } = await supabase.from("document_requirement_cache").upsert(
          {
            citizenship_country,
            destination_country,
            visa_type,
            documents: fresh,
            generated_at,
            model: MODEL,
            prompt_version: PROMPT_VERSION,
          },
          { onConflict: "citizenship_country,destination_country,visa_type,prompt_version" },
        );
        if (upsertErr) console.error("generate-document-checklist: cache upsert failed", upsertErr);
        console.log(`generate-document-checklist: fresh list (${fresh.length} docs) for ${citizenship_country}→${destination_country}`);
      }
    }

    if (!documents) {
      documents = FALLBACK_DOCS;
      source = "fallback";
      generated_at = new Date().toISOString();
      console.error("generate-document-checklist: using fallback list");
    }

    const finalDocs = overlayFamilyDocs(documents, family_status);

    if (user_id) {
      await materializeForUser(
        supabase,
        user_id,
        finalDocs,
        source === "fallback" ? "failed" : "ready",
      );
    }

    return jsonResponse({
      documents: finalDocs,
      source,
      generated_at,
    });
  } catch (err) {
    console.error("generate-document-checklist: unexpected error", err);
    return jsonResponse({ error: String(err), documents: FALLBACK_DOCS, source: "fallback" }, 200);
  }
});
