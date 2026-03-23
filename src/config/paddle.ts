declare global {
  interface Window {
    Paddle?: any;
  }
}

const PADDLE_CLIENT_TOKEN = "live_f2580841fc56eea826c1082622d";

export const PADDLE_PRICES = {
  pro: "pri_01kmcrz3x9v1ya2ak025nbpn1g",
  full: "pri_01kmcs3ffsnfr0gn8qkkqnptkz",
} as const;

let initialized = false;

export function initPaddle() {
  if (initialized || !window.Paddle) return;
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

export function openPaddleCheckout(plan: "pro" | "full", userEmail?: string) {
  if (!window.Paddle) {
    console.error("Paddle.js not loaded — ensure the script tag is in index.html");
    return;
  }
  initPaddle();

  const itemsList = [{ priceId: PADDLE_PRICES[plan], quantity: 1 }];
  console.log("Opening Paddle checkout for", plan, "with price", PADDLE_PRICES[plan]);

  window.Paddle.Checkout.open({
    items: itemsList,
    ...(userEmail ? { customer: { email: userEmail } } : {}),
  });
}
