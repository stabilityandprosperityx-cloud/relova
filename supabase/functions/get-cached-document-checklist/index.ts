/**
 * Public read-only document checklist lookup against document_requirement_cache.
 * NEVER calls Claude, NEVER upserts, NEVER triggers generation.
 *
 * Modes:
 * - { citizenship_country, destination_country, visa_type } → single cached checklist
 * - { list_popular: true, limit?: number } → one representative pair per distinct citizenship
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPT_VERSION = "v2";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MIN_REAL_DOC_COUNT = 8;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

type CacheRow = {
  citizenship_country: string;
  destination_country: string;
  visa_type: string;
  generated_at: string;
  documents: unknown;
};

/** One destination per citizenship; prefer more recent rows; cap at `limit`. */
function pickDiversePopular(rows: CacheRow[], limit: number) {
  const now = Date.now();
  const fresh = rows.filter((r) => {
    const docs = Array.isArray(r.documents) ? r.documents : [];
    if (docs.length < MIN_REAL_DOC_COUNT) return false;
    const cachedAt = r.generated_at ? new Date(r.generated_at).getTime() : 0;
    return now - cachedAt < CACHE_TTL_MS;
  });

  // Newest first so each citizenship's pick is its freshest destination
  fresh.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());

  const byCitizenship = new Map<string, CacheRow>();
  for (const row of fresh) {
    if (!byCitizenship.has(row.citizenship_country)) {
      byCitizenship.set(row.citizenship_country, row);
    }
  }

  // Stable, readable order for the UI (not Russia-first by volume)
  const picks = [...byCitizenship.values()].sort((a, b) =>
    a.citizenship_country.localeCompare(b.citizenship_country),
  );

  return picks.slice(0, limit).map((r) => ({
    citizenship: r.citizenship_country,
    destination: r.destination_country,
    visa_type: r.visa_type,
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (body?.list_popular === true) {
      const limitRaw = Number(body.limit ?? 5);
      const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.floor(limitRaw), 1), 12) : 5;

      const { data: rows, error } = await supabase
        .from("document_requirement_cache")
        .select("citizenship_country, destination_country, visa_type, generated_at, documents")
        .eq("prompt_version", PROMPT_VERSION);

      if (error) {
        console.error("get-cached-document-checklist: list_popular failed", error);
        return jsonResponse({ status: "ok", pairs: [] });
      }

      const pairs = pickDiversePopular((rows ?? []) as CacheRow[], limit);
      return jsonResponse({ status: "ok", pairs });
    }

    const citizenship_country = normalize(String(body.citizenship_country ?? ""));
    const destination_country = normalize(String(body.destination_country ?? ""));
    const visa_type = normalize(String(body.visa_type ?? ""));

    if (!citizenship_country || !destination_country || !visa_type) {
      return jsonResponse(
        { error: "citizenship_country, destination_country, and visa_type are required" },
        400,
      );
    }

    const { data: row, error } = await supabase
      .from("document_requirement_cache")
      .select("documents, generated_at, visa_type")
      .eq("citizenship_country", citizenship_country)
      .eq("destination_country", destination_country)
      .eq("visa_type", visa_type)
      .eq("prompt_version", PROMPT_VERSION)
      .maybeSingle();

    if (error) {
      console.error("get-cached-document-checklist: select failed", error);
      return jsonResponse({ status: "uncached" });
    }

    if (!row || !Array.isArray(row.documents) || row.documents.length === 0) {
      return jsonResponse({ status: "uncached" });
    }

    const cachedAt = row.generated_at ? new Date(row.generated_at).getTime() : 0;
    const isFresh = Date.now() - cachedAt < CACHE_TTL_MS;
    if (!isFresh) {
      return jsonResponse({ status: "uncached" });
    }

    return jsonResponse({
      status: "cached",
      documents: row.documents,
      generated_at: row.generated_at,
      visa_type: row.visa_type,
    });
  } catch (err) {
    console.error("get-cached-document-checklist: unexpected error", err);
    return jsonResponse({ status: "uncached", error: String(err) });
  }
});
