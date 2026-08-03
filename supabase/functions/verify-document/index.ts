const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPPORTED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const respond = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { imageBase64, documentType, mimeType } = await req.json();

    if (!imageBase64 || !documentType) {
      return respond({ status: "warning", note: "Missing required fields." });
    }

    // Non-image files cannot be checked with vision
    const normalizedMime = (mimeType || "image/jpeg").toLowerCase();
    if (!SUPPORTED_MIME_TYPES.includes(normalizedMime)) {
      return respond({
        status: "warning",
        note: "AI visual check is only available for image files (JPEG/PNG/WebP). Please ensure this document is complete and valid.",
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY not set");
      return respond({ status: "warning", note: "AI verification temporarily unavailable." });
    }

    const prompt = `You are a document verification assistant for a relocation platform.

A user uploaded this image and identified it as: "${documentType}"

Check ONLY the following — do NOT read, transcribe or repeat any personal data (names, ID numbers, dates of birth, nationality, addresses):
1. Does this image visually look like the expected document type?
2. If an expiry or validity date is visible, does it appear still valid (not expired)?
3. Is the scan quality sufficient — not too blurry, not severely cropped, roughly legible?

Reply with valid JSON only (no markdown, no explanation outside JSON):
{"status":"ok","note":"..."}

Rules:
- "ok" = appears to be the correct type, quality acceptable, not expired
- "warning" = probably correct type but has a concern (quality, near-expiry, partially cut off)
- "mismatch" = clearly does NOT appear to be the expected document type

Keep the note under 20 words.`;

    const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 150,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: normalizedMime, data: imageBase64 },
            },
            { type: "text", text: prompt },
          ],
        }],
      }),
    });

    if (!anthropicResp.ok) {
      console.error("Anthropic API error:", anthropicResp.status, await anthropicResp.text());
      return respond({ status: "warning", note: "AI verification temporarily unavailable. Please review manually." });
    }

    const json = await anthropicResp.json();
    const rawText: string = json.content?.[0]?.text ?? "";

    // Extract JSON from the response (model might add extra text)
    const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const status = ["ok", "warning", "mismatch"].includes(parsed.status) ? parsed.status : "warning";
        return respond({ status, note: parsed.note || "Verification complete." });
      } catch {
        // fall through
      }
    }

    return respond({ status: "warning", note: "Could not parse AI result. Please review manually." });
  } catch (err) {
    console.error("verify-document error:", err);
    return respond({ status: "warning", note: "Verification error. Please review manually." });
  }
});
