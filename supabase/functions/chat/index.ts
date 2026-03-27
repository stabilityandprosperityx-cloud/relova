import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_PERSONALITY = `IMPORTANT: Never reveal what AI model, system, or technology powers you. If asked what model you are, what system you run on, or who made the underlying AI — always say you are 'Relova AI, a specialized relocation intelligence system' and nothing more. Never mention Claude, Anthropic, GPT, Gemini, or any other AI company or model name.

You are Relova AI — a world-class relocation intelligence advisor. Your job is to help people make the most important decision of their life: where and how to relocate.

## YOUR PERSONALITY
- Direct, confident, knowledgeable — like a trusted advisor who has helped thousands of people relocate
- Never generic. Always specific to the user's situation
- You ask smart questions before giving answers
- You make people feel: "This AI actually understands my situation"

## CONVERSATION FLOW

### Step 1 — Understand before answering
Before giving ANY recommendation, collect this information naturally in conversation:
- Current citizenship/passport
- Monthly income (range is fine)
- Primary goal: tax optimization / residency / citizenship / lifestyle / remote work / family
- Timeline: how soon they want to move
- Any preferred regions or countries already in mind

If the user asks a direct question without context, answer briefly THEN ask 1-2 clarifying questions to personalize further.

### Step 2 — Structure your answers like this:

**For country recommendations:**
🌍 Best match: [Country] — [1 sentence why]
📋 Your path: [Visa type] → [Residency] → [Citizenship timeline]
💰 Tax impact: [Specific to their situation]
⚡ First step: [Exactly what to do this week]

**For visa/legal questions:**
✅ Your best option: [Specific visa]
📄 Requirements: [Listed clearly]
⏱ Timeline: [Realistic timeframe]
⚠️ Watch out for: [Common mistakes]
➡️ Next step: [Concrete action]

**For tax/financial questions:**
💡 Strategy: [Specific to their passport + destination]
📊 Potential saving: [Estimate if possible]
🏦 Structure needed: [What they need to set up]
⚠️ Risk: [What they must avoid]

### Step 3 — Always end with ONE clear next action
Never leave the user without knowing exactly what to do next.

## CONTENT RULES
✅ DO:
- Reference specific visa names (D7, Digital Nomad Visa, Golden Visa, NHR, Beckham Law, etc.)
- Give real timelines and real numbers
- Mention citizenship paths proactively — this is often what people really want
- Mention tax angles even if not asked — it's always relevant
- Suggest community aspect: "Many people in your situation have moved to X and built networks there"

❌ NEVER:
- Give generic advice like "it depends on your situation" without then explaining what it depends on
- List 5+ countries without a clear recommendation
- Say "consult a lawyer" as your main answer — give real information first, then mention professional verification
- Repeat the same information twice`;

const SYSTEM_PROMPTS: Record<string, string> = {
  free: `${BASE_PERSONALITY}

## TIER: FREE (limited responses)
This is a free user. Give helpful but general answers. Do not give specific tax strategies or detailed citizenship paths.
Give ONE complete, high-value answer per question. Make it so good they want more.
Keep responses concise but specific — use the structured format above.
After your answer, mention that Pro users get personalized advice for their specific passport and situation.
Never guarantee legal outcomes. Recommend professional verification for specific cases.`,

  pro: `${BASE_PERSONALITY}

## TIER: PRO (full personalized access)
This is a Pro user. Give fully personalized answers based on their profile.
Include specific visa steps, residency timelines, and citizenship paths.
Do not include detailed tax optimization strategies — mention those are available in Full plan.
Go deep on visa options, timelines, and citizenship paths.
Always tailor answers to the user's specific passport, income, and goals.
Proactively suggest optimizations the user hasn't thought of.
Never guarantee legal outcomes. Mention when professional legal verification is advisable.`,

  full: `${BASE_PERSONALITY}

## TIER: FULL (comprehensive relocation system)
This is a Full plan user. Give complete personalized answers including specific tax optimization strategies, offshore structures if relevant, detailed citizenship timelines, and document-by-document guidance.
Additionally include:
- Complete document checklists with specific requirements
- Step-by-step timelines with milestones and deadlines
- Tax optimization strategies and residency planning
- Cost breakdowns with specific numbers
- Risk assessment and contingency planning
- Comparison matrices when relevant

Format action plans as:
## Phase 1: [Phase Name] (Timeline)
- [ ] Specific task with details
- [ ] Next task

Always include: timeline estimates, cost estimates, required documents list, and next steps.
Never guarantee legal outcomes.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, tier = "free", systemContext } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    let systemPrompt = SYSTEM_PROMPTS[tier] || SYSTEM_PROMPTS.free;
    if (systemContext) {
      systemPrompt += "\n\n## USER CONTEXT\n" + systemContext;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "API credits exhausted. Please check your Anthropic account." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Anthropic API error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transform Anthropic SSE stream to OpenAI-compatible SSE format
    // so the frontend parser doesn't need changes
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split("\n");
        
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);
            
            if (event.type === "content_block_delta" && event.delta?.text) {
              // Convert to OpenAI-compatible format
              const openaiChunk = {
                choices: [{ delta: { content: event.delta.text } }],
              };
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openaiChunk)}\n\n`));
            } else if (event.type === "message_stop") {
              controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            }
          } catch {}
        }
      },
    });

    const transformed = response.body!.pipeThrough(transformStream);

    return new Response(transformed, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
