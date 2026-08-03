import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { criteria, matches } = await req.json();

    const prompt = `You are a relocation advisor helping someone choose where to move abroad.

User profile:
- Citizenship: ${criteria.citizenship}
- Family status: ${criteria.familyStatus}
- Monthly income: $${criteria.monthlyIncome}
- Goals: ${criteria.goals.join(", ")}
- Dealbreakers: ${criteria.constraints.length > 0 ? criteria.constraints.join(", ") : "none"}
- Timeline: ${criteria.timeline}

Top country matches (already calculated by algorithm):
${matches.map((m: { country: { name: string; topVisa: string }; score: number }, i: number) => `${i + 1}. ${m.country.name} (${m.score}% match) - ${m.country.topVisa}`).join("\n")}

For each country, provide:
1. "reasons" — 2 short, personalized reasons why this country fits this specific person (reference their citizenship, income, goals or family status — never be generic).
2. "visaRequired" — true if a ${criteria.citizenship} passport holder needs a visa to ENTER or LIVE in that country long-term, false if they can enter visa-free or get residency easily. Base this on your knowledge of current visa rules.
3. "visaNote" — a short, plain-English note (max 12 words) about the visa situation, e.g. "Russian passport needs a visa for Ireland" or "Visa-free entry, digital nomad visa available". If you are uncertain whether rules are current, add "— verify before booking" to your note.

Respond ONLY in JSON, no markdown:
{
  "explanations": [
    {
      "country": "CountryName",
      "reasons": ["reason 1", "reason 2"],
      "visaRequired": true,
      "visaNote": "Short visa note here"
    }
  ]
}`;

    const _supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text ?? "";

    // Strip any accidental markdown fences
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        explanations: matches.map((m: { country: { name: string }; reasons: string[] }) => ({
          country: m.country.name,
          reasons: m.reasons,
          visaRequired: false,
          visaNote: "",
        })),
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
