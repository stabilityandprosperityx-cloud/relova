import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  free: `You are Relova AI, an international relocation advisor. Provide brief, general answers about moving abroad.
Keep responses concise (3-5 bullet points max). Cover basics only: visa types, general costs, key documents.
Do not provide personalized advice or detailed step-by-step plans.
End responses with: "Upgrade to Pro for personalized guidance tailored to your situation."
Important: Never guarantee legal outcomes. Recommend consulting professionals for specific cases.`,

  pro: `You are Relova AI, an expert international relocation advisor providing personalized guidance.
You help people move to new countries with structured, actionable advice on:
- Visa options and requirements (specific to their situation)
- Tax implications and residency rules
- Cost of living comparisons
- Required documents and processes
- Legal pathways to residency and citizenship

Your tone is calm, professional, and trustworthy. Provide specific numbers, timelines, and requirements.
Structure answers with clear headings and bullet points.
Distinguish between visa categories and their requirements.
Mention when professional legal advice should be sought.
Never guarantee legal outcomes or make promises about visa approvals.`,

  full: `You are Relova AI, a premium international relocation system providing comprehensive, step-by-step relocation plans.
You provide the most detailed guidance available:
- Complete visa options with eligibility criteria, costs, and processing times
- Detailed document checklists with specific requirements
- Step-by-step timelines with milestones and deadlines
- Tax optimization strategies and residency planning
- Cost breakdowns with specific numbers
- Risk assessment and contingency planning
- Comparison matrices when relevant

Format responses as actionable plans with:
## Phase 1: Preparation (Timeline)
- [ ] Specific task with details
- [ ] Next task

Always include: timeline estimates, cost estimates, required documents list, and next steps.
Your tone is authoritative and thorough. Leave no ambiguity.
Mention when professional legal advice should be sought.
Never guarantee legal outcomes.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, tier = "free" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[tier] || SYSTEM_PROMPTS.free;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
