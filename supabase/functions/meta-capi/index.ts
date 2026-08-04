const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PIXEL_ID = "1377613737161212";

async function sha256hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const respond = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const token = Deno.env.get("META_CAPI_ACCESS_TOKEN");
    if (!token) {
      console.error("META_CAPI_ACCESS_TOKEN not configured");
      return respond({ ok: false, error: "misconfigured" }, 500);
    }

    const { eventName, eventId, eventSourceUrl, customData, userData } = await req.json();

    if (!eventName) return respond({ ok: false, error: "missing eventName" }, 400);

    // Build user_data — hash PII fields
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const builtUserData: Record<string, unknown> = {
      ...(clientIp ? { client_ip_address: clientIp } : {}),
      ...(userAgent ? { client_user_agent: userAgent } : {}),
    };

    // Hash email if provided
    if (userData?.email && typeof userData.email === "string") {
      builtUserData.em = await sha256hex(userData.email);
    }
    // Hash external_id (userId) if provided
    if (userData?.external_id && typeof userData.external_id === "string") {
      builtUserData.external_id = await sha256hex(userData.external_id);
    }
    // Pass through any other non-PII user_data fields
    for (const [k, v] of Object.entries(userData ?? {})) {
      if (k !== "email" && k !== "external_id" && !(k in builtUserData)) {
        builtUserData[k] = v;
      }
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId ?? crypto.randomUUID(),
          event_source_url: eventSourceUrl ?? "https://relova.ai",
          action_source: "website",
          user_data: builtUserData,
          ...(customData && Object.keys(customData).length > 0
            ? { custom_data: customData }
            : {}),
        },
      ],
    };

    const metaRes = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await metaRes.json();

    if (!metaRes.ok) {
      console.error("Meta CAPI error:", JSON.stringify(result));
      return respond({ ok: false, error: result }, 502);
    }

    console.log(`CAPI ${eventName} sent, event_id=${eventId}, fbt=${result.fbtrace_id}`);
    return respond({ ok: true, result });
  } catch (err) {
    console.error("meta-capi unexpected error:", err);
    return respond({ ok: false, error: String(err) }, 500);
  }
});
