const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractedStep {
  title: string;
  description: string;
  estimated_days: number;
  phase: "Entry Preparation" | "Arrival & Setup" | "Legal Status" | "Stability";
}

interface ExtractedDocument {
  name: string;
  related_step_title: string | null;
}

interface ExtractResult {
  steps: ExtractedStep[];
  documents: ExtractedDocument[];
}

const FALLBACK: ExtractResult = { steps: [], documents: [] };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const respond = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { conversationText, existingSteps = [], existingDocuments = [] } = await req.json();

    if (!conversationText) return respond(FALLBACK);

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) return respond(FALLBACK);

    const existingStepsList = (existingSteps as string[]).join("\n- ");
    const existingDocsList = (existingDocuments as string[]).join("\n- ");

    const systemPrompt = `You are a structured data extractor for a relocation planning app. 
Extract only concrete, actionable items from the conversation. Return valid JSON only — no markdown, no explanation.

Output format (strict JSON):
{
  "steps": [
    {
      "title": "One sentence action (max 80 chars)",
      "description": "Brief explanation of what to do and why",
      "estimated_days": <integer, realistic estimate>,
      "phase": "<exactly one of: Entry Preparation | Arrival & Setup | Legal Status | Stability>"
    }
  ],
  "documents": [
    {
      "name": "Document name (max 60 chars)",
      "related_step_title": "<title of a step above that requires this document, or null>"
    }
  ]
}

Phase definitions:
- Entry Preparation: research, booking, preparing before leaving home country
- Arrival & Setup: first days/weeks after arriving (accommodation, SIM, bank)
- Legal Status: visas, permits, tax registration, biometrics, government offices
- Stability: long-term integration, community, career, daily routine

Rules (MUST follow):
1. DO NOT include items already in the user's existing plan or document list (check semantically, not just exact text)
2. DO NOT include general advice, section headers (lines starting with # or ##), warnings, or explanations
3. DO NOT include entire paragraphs as steps — each step must be one atomic action
4. Steps must be concrete actions the user can actually do (not "understand the process")
5. Document names must be real document titles, not descriptions or instructions
6. If the conversation has no actionable items, return {"steps": [], "documents": []}`;

    const userPrompt = `Existing plan steps (DO NOT add these):
${existingStepsList ? `- ${existingStepsList}` : "(none yet)"}

Existing documents (DO NOT add these):
${existingDocsList ? `- ${existingDocsList}` : "(none yet)"}

Conversation text to extract from:
${conversationText}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic error:", response.status, await response.text());
      return respond(FALLBACK);
    }

    const data = await response.json();
    const raw = data?.content?.[0]?.text?.trim() ?? "";

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed: ExtractResult;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse error. Raw:", raw);
      return respond(FALLBACK);
    }

    // Sanitize output
    const validPhases = new Set(["Entry Preparation", "Arrival & Setup", "Legal Status", "Stability"]);
    const result: ExtractResult = {
      steps: (parsed.steps ?? [])
        .filter((s) => s?.title && typeof s.title === "string" && s.title.length > 3)
        .map((s) => ({
          title: String(s.title).slice(0, 120),
          description: String(s.description ?? "").slice(0, 300),
          estimated_days: typeof s.estimated_days === "number" && s.estimated_days > 0 ? s.estimated_days : 7,
          phase: validPhases.has(s.phase) ? s.phase : "Entry Preparation",
        })),
      documents: (parsed.documents ?? [])
        .filter((d) => d?.name && typeof d.name === "string" && d.name.length > 2)
        .map((d) => ({
          name: String(d.name).slice(0, 120),
          related_step_title: d.related_step_title ? String(d.related_step_title).slice(0, 120) : null,
        })),
    };

    return respond(result);
  } catch (err) {
    console.error("extract-plan-items error:", err);
    return respond(FALLBACK);
  }
});
