/**
 * Public read-only document checklist lookup against document_requirement_cache.
 * NEVER calls Claude, NEVER upserts, NEVER triggers generation.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPT_VERSION = "v2";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const citizenship_country = normalize(String(body.citizenship_country ?? ""));
    const destination_country = normalize(String(body.destination_country ?? ""));
    const visa_type = normalize(String(body.visa_type ?? ""));

    if (!citizenship_country || !destination_country || !visa_type) {
      return jsonResponse(
        { error: "citizenship_country, destination_country, and visa_type are required" },
        400,
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

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
