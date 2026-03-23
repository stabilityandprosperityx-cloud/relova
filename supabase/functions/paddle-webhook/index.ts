import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, paddle-signature",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Paddle webhook signature verification
async function verifySignature(
  rawBody: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false;

  // Parse ts=...;h1=...
  const parts: Record<string, string> = {};
  for (const pair of signature.split(";")) {
    const [k, v] = pair.split("=");
    if (k && v) parts[k] = v;
  }

  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  const signedPayload = `${ts}:${rawBody}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === h1;
}

const PRICE_TO_PLAN: Record<string, string> = {
  pri_01kmcrz3x9v1ya2ak025nbpn1g: "pro",
  pri_01kmcs3ffsnfr0gn8qkkqnptkz: "full",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("paddle-signature");
    const webhookSecret = Deno.env.get("PADDLE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error("PADDLE_WEBHOOK_SECRET not configured");
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const valid = await verifySignature(rawBody, signature, webhookSecret);
    if (!valid) {
      console.error("Invalid Paddle webhook signature");
      return jsonResponse({ error: "Invalid signature" }, 401);
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type;
    console.log("Paddle event:", eventType);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (
      eventType === "subscription.activated" ||
      eventType === "subscription.updated"
    ) {
      const data = event.data;
      const customerId = data.customer_id;
      const subscriptionId = data.id;
      const priceId = data.items?.[0]?.price?.id;
      const plan = PRICE_TO_PLAN[priceId] || "pro";
      const userId = data.custom_data?.userId;

      if (!userId) {
        console.error("No userId in custom_data");
        return jsonResponse({ error: "Missing userId in custom_data" }, 400);
      }

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          plan,
          paddle_customer_id: customerId,
          paddle_subscription_id: subscriptionId,
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        return jsonResponse({ error: "Update failed" }, 500);
      }

      console.log(`Updated user ${userId} to plan: ${plan}`);
    }

    if (eventType === "subscription.canceled") {
      const data = event.data;
      const subscriptionId = data.id;

      const { error } = await supabase
        .from("user_profiles")
        .update({ plan: "free" })
        .eq("paddle_subscription_id", subscriptionId);

      if (error) {
        console.error("Error downgrading:", error);
      } else {
        console.log(`Subscription ${subscriptionId} canceled, downgraded to free`);
      }
    }

    return jsonResponse({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
