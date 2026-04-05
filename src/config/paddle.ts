declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string }) => void;
      Checkout: { open: (opts: Record<string, unknown>) => void };
    };
  }
}

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN ?? "";

export const PADDLE_PRICES = {
  pro: import.meta.env.VITE_PADDLE_PRO_PRICE_ID ?? "",
  full: import.meta.env.VITE_PADDLE_FULL_PRICE_ID ?? "",
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

export function openPaddleCheckout(plan: "pro" | "full", userEmail?: string, userId?: string) {
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
}
