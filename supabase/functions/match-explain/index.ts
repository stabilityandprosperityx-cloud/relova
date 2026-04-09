import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { criteria, matches } = await req.json();

    const SCHENGEN_VISA_PASSPORTS = ["Russia", "China", "India", "Belarus", "Ukraine", "Kazakhstan", "Uzbekistan", "Armenia", "Azerbaijan", "Georgia", "Turkey", "Iran", "Pakistan", "Bangladesh", "Nigeria", "Ghana", "Egypt", "Morocco", "Algeria", "Tunisia"];
    const SCHENGEN_ZONE = ["Portugal", "Spain", "France", "Germany", "Italy", "Greece", "Netherlands", "Belgium", "Austria", "Czech Republic", "Poland", "Hungary", "Croatia", "Slovakia", "Slovenia", "Estonia", "Latvia", "Lithuania", "Romania", "Bulgaria", "Sweden", "Denmark", "Finland", "Norway", "Switzerland", "Iceland", "Luxembourg", "Malta"];

    const needsSchengenVisa = SCHENGEN_VISA_PASSPORTS.includes(criteria.citizenship);

    const prompt = `You are a relocation advisor helping someone choose where to move abroad.
${needsSchengenVisa ? `IMPORTANT: This person holds a ${criteria.citizenship} passport which REQUIRES a Schengen visa for EU countries. Mention this briefly in your explanation where relevant and suggest the specific visa they would need (e.g. D8 Digital Nomad Visa for Portugal, Digital Nomad Visa for Spain).` : ""}

User profile:
- Citizenship: ${criteria.citizenship}
- Family status: ${criteria.familyStatus}
- Monthly income: $${criteria.monthlyIncome}
- Goals: ${criteria.goals.join(", ")}
- Dealbreakers: ${criteria.constraints.length > 0 ? criteria.constraints.join(", ") : "none"}
- Timeline: ${criteria.timeline}

Top country matches (already calculated by algorithm):
${matches.map((m: { country: { name: string; topVisa: string }; score: number }, i: number) => `${i + 1}. ${m.country.name} (${m.score}% match) - ${m.country.topVisa}`).join("\n")}
${needsSchengenVisa ? `Schengen countries in this context: ${SCHENGEN_ZONE.join(", ")}` : ""}

Write a SHORT, personalized explanation for why each country matches this specific person.
Be conversational, specific to their profile, and mention 1-2 concrete things relevant to their situation.
DO NOT be generic. Reference their citizenship, income, goals or family status specifically.

Respond in JSON format only, no markdown:
{
  "explanations": [
    { "country": "CountryName", "reasons": ["reason 1", "reason 2"] },
    { "country": "CountryName", "reasons": ["reason 1", "reason 2"] },
    { "country": "CountryName", "reasons": ["reason 1", "reason 2"] }
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
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content[0].text;

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // fallback if JSON parse fails
      parsed = {
        explanations: matches.map((m: { country: { name: string }; reasons: string[] }) => ({
          country: m.country.name,
          reasons: m.reasons,
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
