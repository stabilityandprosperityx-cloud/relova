import { generateEventId, trackPixelEvent } from "@/lib/metaPixel";

declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string }) => void;
      Checkout: { open: (opts: Record<string, unknown>) => void };
    };
  }
}

const PLAN_PRICES: Record<string, number> = {
  pro: 19,
  full: 49,
  pro_lifetime: 79,
  full_lifetime: 149,
  concierge: 990,
};

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN ?? "";

export const PADDLE_PRICES = {
  pro: import.meta.env.VITE_PADDLE_PRO_PRICE_ID ?? "pri_01kmcrz3x9v1ya2ak025nbpn1g",
  full: import.meta.env.VITE_PADDLE_FULL_PRICE_ID ?? "pri_01kmcs3ffsnfr0gn8qkkqnptkz",
  pro_lifetime: "pri_01knntsw2jrs7fvdysgrvp33gf",
  full_lifetime: "pri_01knntwgba19kgzp0ja68a7xt8",
  concierge: "pri_01krkty7x4gx2m5pkjkj9vtepe",
} as const;

let initialized = false;

export function initPaddle() {
  if (initialized || !window.Paddle || !PADDLE_CLIENT_TOKEN) return;
  try {
    window.Paddle.Initialize({
      token: PADDLE_CLIENT_TOKEN,
    });
    initialized = true;
    console.log("Paddle initialized successfully");
  } catch (e) {
    console.error("Paddle initialization failed:", e);
  }
}

export function openPaddleCheckout(plan: "pro" | "full" | "pro_lifetime" | "full_lifetime" | "concierge", userEmail?: string, userId?: string) {
  if (!window.Paddle) {
    console.error("Paddle.js not loaded — ensure the script tag is in index.html");
    return;
  }
  const priceId = PADDLE_PRICES[plan];
  if (!priceId) {
    console.error("Paddle price ID missing — set VITE_PADDLE_PRO_PRICE_ID / VITE_PADDLE_FULL_PRICE_ID");
    return;
  }
  initPaddle();

  const itemsList = [{ priceId, quantity: 1 }];
  console.log("Opening Paddle checkout for", plan, "with price", priceId);

  window.Paddle.Checkout.open({
    items: itemsList,
    ...(userEmail ? { customer: { email: userEmail } } : {}),
    ...(userId ? { customData: { userId } } : {}),
  });

  // Meta Pixel InitiateCheckout (Pixel-only; no CAPI needed for this event)
  const value = PLAN_PRICES[plan] ?? 0;
  trackPixelEvent("InitiateCheckout", generateEventId(), { value, currency: "USD", content_name: plan });
}
