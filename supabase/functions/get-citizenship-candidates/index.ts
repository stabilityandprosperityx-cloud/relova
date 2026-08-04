/**
 * Layer 1: citizenship → realistic relocation destination shortlist.
 * Cached 30 days; client scores only these candidates with static matchCountries.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPT_VERSION = "v1";
const MODEL = "claude-sonnet-5";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Exact countryDatabase[].name values — keep in sync with src/lib/countryMatching.ts */
const COUNTRY_ALLOWLIST = [
  "Portugal", "Spain", "Italy", "Greece", "Malta", "Croatia", "Cyprus",
  "Germany", "Netherlands", "France", "Austria", "Czech Republic", "Poland",
  "Hungary", "Estonia", "Romania", "Serbia", "Montenegro", "Albania", "Turkey",
  "UAE", "Bahrain", "Georgia", "Armenia", "Thailand", "Malaysia", "Indonesia",
  "Vietnam", "Japan", "Singapore", "South Korea", "Mexico", "Colombia", "Brazil",
  "Argentina", "Panama", "Costa Rica", "Uruguay", "Canada", "Morocco",
  "South Africa", "Mauritius", "Australia", "New Zealand", "United States",
  "United Kingdom", "Switzerland", "Norway", "Sweden", "Denmark", "Finland",
  "Iceland", "Ireland", "Belgium", "Luxembourg", "Andorra", "Bulgaria",
  "Slovakia", "Slovenia", "Latvia", "Lithuania", "North Macedonia",
  "Bosnia and Herzegovina", "Kazakhstan", "Azerbaijan", "Saudi Arabia", "Oman",
  "Qatar", "Israel", "Kuwait", "Jordan", "Taiwan", "Philippines", "Cambodia",
  "Sri Lanka", "Myanmar", "Laos", "Nepal", "India", "China", "Hong Kong",
  "Ecuador", "Chile", "Paraguay", "Peru", "Bolivia", "Dominican Republic",
  "Barbados", "Jamaica", "Belize", "Honduras", "Nicaragua", "El Salvador",
  "Guatemala", "Kenya", "Tanzania", "Rwanda", "Ethiopia", "Ghana", "Egypt",
  "Tunisia", "Cape Verde", "Namibia", "Botswana", "Fiji", "Maldives",
] as const;

const ALLOWLIST_SET = new Set<string>(COUNTRY_ALLOWLIST);

/** Map common AI variants → exact allowlist names */
const ALIAS_MAP: Record<string, string> = {
  "usa": "United States",
  "u.s.": "United States",
  "u.s.a.": "United States",
  "us": "United States",
  "united states of america": "United States",
  "uk": "United Kingdom",
  "u.k.": "United Kingdom",
  "great britain": "United Kingdom",
  "britain": "United Kingdom",
  "czechia": "Czech Republic",
  "czech": "Czech Republic",
  "u.a.e.": "UAE",
  "uae": "UAE",
  "united arab emirates": "UAE",
  "korea": "South Korea",
  "republic of korea": "South Korea",
  "south korea": "South Korea",
  "turkiye": "Turkey",
  "türkiye": "Turkey",
  "holland": "Netherlands",
  "the netherlands": "Netherlands",
  "bosnia": "Bosnia and Herzegovina",
  "bosnia-herzegovina": "Bosnia and Herzegovina",
  "macedonia": "North Macedonia",
  "republic of north macedonia": "North Macedonia",
  "cape verde": "Cape Verde",
  "cabo verde": "Cape Verde",
};

interface Candidate {
  country: string;
  note: string;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function resolveCountryName(raw: string): string | null {
  const trimmed = normalize(raw);
  if (ALLOWLIST_SET.has(trimmed)) return trimmed;
  const alias = ALIAS_MAP[trimmed.toLowerCase()];
  if (alias && ALLOWLIST_SET.has(alias)) return alias;
  return null;
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

function parseCandidates(rawText: string): Candidate[] | null {
  const payload = extractJsonPayload(rawText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch (err) {
    console.error(
      "get-citizenship-candidates: invalid JSON syntax:",
      err instanceof Error ? err.message : err,
    );
    console.error("get-citizenship-candidates: FULL raw text attempted:\n", rawText);
    return null;
  }

  if (!parsed || typeof parsed !== "object") {
    console.error("get-citizenship-candidates: JSON wrong shape — not an object");
    console.error("get-citizenship-candidates: FULL raw text attempted:\n", rawText);
    return null;
  }

  const arr = Array.isArray((parsed as { candidates?: unknown }).candidates)
    ? (parsed as { candidates: unknown[] }).candidates
    : null;

  if (!arr) {
    console.error('get-citizenship-candidates: JSON wrong shape — missing "candidates" array');
    console.error("get-citizenship-candidates: FULL raw text attempted:\n", rawText);
    return null;
  }
  if (arr.length === 0) {
    console.error("get-citizenship-candidates: JSON wrong shape — candidates array empty");
    console.error("get-citizenship-candidates: FULL raw text attempted:\n", rawText);
    return null;
  }

  const out: Candidate[] = [];
  const seen = new Set<string>();
  let dropped = 0;

  for (const item of arr) {
    if (!item || typeof item !== "object" || typeof (item as { country?: unknown }).country !== "string") {
      dropped++;
      continue;
    }
    const rawName = (item as { country: string }).country;
    const resolved = resolveCountryName(rawName);
    if (!resolved) {
      dropped++;
      console.warn("get-citizenship-candidates: dropping unknown country", rawName);
      continue;
    }
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    const note =
      typeof (item as { note?: unknown }).note === "string"
        ? (item as { note: string }).note.trim().slice(0, 160)
        : "";
    out.push({ country: resolved, note });
  }

  console.log(
    `get-citizenship-candidates: allowlist filter — raw=${arr.length}, kept=${out.length}, dropped=${dropped}`,
  );

  if (out.length === 0) {
    console.error(
      "get-citizenship-candidates: zero valid candidates after allowlist/alias filtering",
    );
    console.error("get-citizenship-candidates: FULL raw text attempted:\n", rawText);
    return null;
  }
  return out;
}

async function callClaude(citizenship: string): Promise<Candidate[] | null> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    console.error("get-citizenship-candidates: ANTHROPIC_API_KEY not set");
    return null;
  }

  const allowlistStr = COUNTRY_ALLOWLIST.join(", ");
  const prompt = `You are a relocation feasibility researcher. Citizenship: ${citizenship}.
Using current official/consular and reputable immigration sources, list 15-20 countries where citizens of ${citizenship} most often and realistically relocate successfully today (work, digital nomad, study→work, family, retirement, or other common legal paths). Prefer destinations that are practically used, not abstract "best countries." Reflect current visa/entry/residence difficulty for this passport.
You MUST choose each country name from this exact allowlist only (copy spelling exactly):
[${allowlistStr}]
Return JSON only:
{ "candidates": [ { "country": "<allowlist name>", "note": "<≤20 words: why realistic for this passport>" } ] }
Rules: 15-20 items; no duplicates; only allowlist names; notes specific to this citizenship; if uncertain, say so briefly in the note.`;

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
        max_tokens: 2048,
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
      console.error("get-citizenship-candidates: Anthropic error", response.status, errText);
      return null;
    }

    const data = await response.json();
    const content = Array.isArray(data?.content) ? data.content : [];
    const { text, blockCount, blockTypes } = extractTextFromClaudeContent(content);
    console.log(
      `get-citizenship-candidates: Claude response: ${blockCount} blocks [${blockTypes.join(", ")}], ${text.length} chars extracted, stop_reason=${data?.stop_reason ?? "n/a"}`,
    );
    return parseCandidates(text);
  } catch (err) {
    console.error("get-citizenship-candidates: Claude fetch failed", err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const citizenship_country = normalize(String(body.citizenship_country ?? ""));

    if (!citizenship_country) {
      return jsonResponse({ error: "citizenship_country is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Cache lookup
    const { data: cached } = await supabase
      .from("citizenship_candidate_countries")
      .select("candidates, generated_at")
      .eq("citizenship_country", citizenship_country)
      .eq("prompt_version", PROMPT_VERSION)
      .maybeSingle();

    const cachedAt = cached?.generated_at ? new Date(cached.generated_at).getTime() : 0;
    const isFresh = cached && Date.now() - cachedAt < CACHE_TTL_MS;
    const cachedCandidates = Array.isArray(cached?.candidates) ? cached.candidates as Candidate[] : [];

    if (isFresh && cachedCandidates.length > 0) {
      console.log(`get-citizenship-candidates: cache hit for ${citizenship_country} (${cachedCandidates.length})`);
      return jsonResponse({
        candidates: cachedCandidates,
        source: "cache",
        generated_at: cached.generated_at,
      });
    }

    const fresh = await callClaude(citizenship_country);
    if (fresh && fresh.length > 0) {
      const generated_at = new Date().toISOString();
      const { error: upsertErr } = await supabase.from("citizenship_candidate_countries").upsert(
        {
          citizenship_country,
          candidates: fresh,
          generated_at,
          model: MODEL,
          prompt_version: PROMPT_VERSION,
        },
        { onConflict: "citizenship_country,prompt_version" },
      );
      if (upsertErr) console.error("get-citizenship-candidates: cache upsert failed", upsertErr);

      console.log(`get-citizenship-candidates: fresh list (${fresh.length}) for ${citizenship_country}`);
      return jsonResponse({
        candidates: fresh,
        source: "fresh",
        generated_at,
      });
    }

    console.error("get-citizenship-candidates: using fallback (empty candidates)");
    return jsonResponse({
      candidates: [],
      source: "fallback",
      generated_at: null,
    });
  } catch (err) {
    console.error("get-citizenship-candidates: unexpected error", err);
    return jsonResponse({
      candidates: [],
      source: "fallback",
      generated_at: null,
      error: String(err),
    });
  }
});
