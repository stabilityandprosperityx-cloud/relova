/**
 * Paddle billing webhooks — no Supabase `Authorization` header required.
 * Set `[functions.paddle-webhook] verify_jwt = false` in `supabase/config.toml`.
 * Security: verify `paddle-signature` with `PADDLE_WEBHOOK_SECRET` only.
 */
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
    const [k, ...rest] = pair.split("=");
    const v = rest.join("=");
    if (k?.trim() && v) parts[k.trim()] = v.trim();
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

  return computed.toLowerCase() === h1.toLowerCase();
}

const PRICE_TO_PLAN: Record<string, string> = {
  pri_01kmcrz3x9v1ya2ak025nbpn1g: "pro",
  pri_01kmcs3ffsnfr0gn8qkkqnptkz: "full",
  pri_01knntsw2jrs7fvdysgrvp33gf: "pro",
  pri_01knntwgba19kgzp0ja68a7xt8: "full",
};

type SubscriptionItem = {
  price?: { id?: string };
  price_id?: string;
};

function priceIdFromSubscription(data: {
  items?: SubscriptionItem[];
}): string | undefined {
  const items = data.items;
  if (!Array.isArray(items) || items.length === 0) return undefined;
  for (const item of items) {
    const nested = item.price?.id;
    if (typeof nested === "string" && nested.length > 0) return nested;
    if (typeof item.price_id === "string" && item.price_id.length > 0) {
      return item.price_id;
    }
  }
  return undefined;
}

/** Paddle webhooks use custom_data; keys may be camelCase or snake_case. */
function userIdFromCustomData(
  customData: Record<string, unknown> | null | undefined
): string | undefined {
  if (!customData || typeof customData !== "object") return undefined;
  const raw =
    customData.userId ??
    customData.user_id ??
    (customData as { UserId?: unknown }).UserId;
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  return s.length > 0 ? s : undefined;
}

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

    const event = JSON.parse(rawBody) as {
      event_type?: string;
      data?: Record<string, unknown>;
    };
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
      const data = event.data ?? {};
      const customerId = data.customer_id as string | undefined;
      const subscriptionId = data.id as string | undefined;
      const priceId = priceIdFromSubscription(
        data as { items?: SubscriptionItem[] }
      );
      const plan = priceId ? PRICE_TO_PLAN[priceId] : undefined;

      if (!plan) {
        console.error("Unknown or missing subscription price id:", priceId);
        return jsonResponse(
          {
            error: "Unknown price id",
            priceId: priceId ?? null,
          },
          400
        );
      }

      const customData = data.custom_data as Record<string, unknown> | undefined;
      const userId = userIdFromCustomData(customData);

      if (!userId) {
        console.error(
          "No user id in custom_data; keys present:",
          customData ? Object.keys(customData) : []
        );
        return jsonResponse({ error: "Missing userId in custom_data" }, 400);
      }

      // Table is public.user_profiles (plan + user_id), not "profiles".
      const { data: updatedRows, error: updateError } = await supabase
        .from("user_profiles")
        .update({
          plan,
          paddle_customer_id: customerId,
          paddle_subscription_id: subscriptionId,
        })
        .eq("user_id", userId)
        .select("user_id");

      if (updateError) {
        console.error("Error updating profile:", updateError);
        return jsonResponse({ error: "Update failed" }, 500);
      }

      if (!updatedRows?.length) {
        console.error(
          "No user_profiles row matched user_id (checkout customData must match auth user id):",
          userId
        );
        return jsonResponse(
          {
            error: "No profile row for user_id",
            userId,
          },
          404
        );
      }

      console.log(`Updated user ${userId} to plan: ${plan}`);
    }

    // One-time lifetime purchase
    if (eventType === "transaction.completed") {
      const data = event.data ?? {};
      const customData = data.custom_data as Record<string, unknown> | undefined;
      const userId = userIdFromCustomData(customData);

      if (!userId) {
        console.error("transaction.completed: no userId in custom_data");
        return jsonResponse({ error: "Missing userId" }, 400);
      }

      // Find price ID from transaction items
      const items = (data.items ?? []) as Array<{ price?: { id?: string }; price_id?: string }>;
      let priceId: string | undefined;
      for (const item of items) {
        priceId = item.price?.id ?? item.price_id;
        if (priceId) break;
      }

      const plan = priceId ? PRICE_TO_PLAN[priceId] : undefined;

      if (!plan) {
        console.log("transaction.completed: not a Relova plan price, skipping", priceId);
        return jsonResponse({ received: true });
      }

      const { error } = await supabase
        .from("user_profiles")
        .update({ plan })
        .eq("user_id", userId);

      if (error) {
        console.error("transaction.completed: update failed", error);
        return jsonResponse({ error: "Update failed" }, 500);
      }

      console.log(`Lifetime purchase: updated user ${userId} to plan: ${plan}`);
    }

    if (eventType === "subscription.canceled") {
      const data = event.data ?? {};
      const subscriptionId = data.id as string | undefined;

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
