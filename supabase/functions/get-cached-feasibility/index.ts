/**
 * Public read-only feasibility lookup against citizenship_candidate_countries cache.
 * NEVER calls Claude, NEVER upserts, NEVER triggers generation.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    if (!citizenship_country || !destination_country) {
      return jsonResponse(
        { error: "citizenship_country and destination_country are required" },
        400,
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: rows, error } = await supabase
      .from("citizenship_candidate_countries")
      .select("candidates, generated_at")
      .eq("citizenship_country", citizenship_country)
      .order("generated_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("get-cached-feasibility: select failed", error);
      return jsonResponse({ status: "uncached" });
    }

    const row = rows?.[0];
    if (!row || !Array.isArray(row.candidates) || row.candidates.length === 0) {
      return jsonResponse({ status: "uncached" });
    }

    const destLower = destination_country.toLowerCase();
    const match = (row.candidates as { country?: string; note?: string }[]).find(
      (c) => typeof c?.country === "string" && c.country.trim().toLowerCase() === destLower,
    );

    if (match) {
      return jsonResponse({
        status: "common",
        note: typeof match.note === "string" ? match.note : "",
        generated_at: row.generated_at,
      });
    }

    return jsonResponse({
      status: "uncommon",
      generated_at: row.generated_at,
    });
  } catch (err) {
    console.error("get-cached-feasibility: unexpected error", err);
    return jsonResponse({ status: "uncached", error: String(err) });
  }
});
