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

/** Shows a small DOM-based modal to collect a guest buyer's email before checkout.
 *  Uses CSS variables so it respects the site's light/dark theme automatically.
 *  Returns the entered email, or null if the user cancelled. */
function promptGuestEmail(): Promise<string | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;" +
      "align-items:center;justify-content:center;z-index:9999;";

    const modal = document.createElement("div");
    modal.style.cssText =
      "background:var(--background,#fff);border:1px solid var(--border,#e5e7eb);" +
      "border-radius:12px;padding:24px;width:360px;max-width:90vw;" +
      "box-shadow:0 20px 60px rgba(0,0,0,0.2);";

    modal.innerHTML = `
      <h3 style="margin:0 0 6px;font-size:16px;font-weight:600;color:var(--foreground,#111);">Enter your email to continue</h3>
      <p style="margin:0 0 16px;font-size:14px;color:var(--muted-foreground,#6b7280);">We'll send your account login details here after purchase.</p>
      <input
        type="email"
        placeholder="your@email.com"
        autocomplete="email"
        style="width:100%;box-sizing:border-box;border:1px solid var(--border,#e5e7eb);
               border-radius:8px;padding:10px 12px;font-size:14px;outline:none;
               background:var(--background,#fff);color:var(--foreground,#111);"
      />
      <div style="display:flex;gap:8px;margin-top:14px;">
        <button id="pg-cancel"
          style="flex:1;padding:10px;border:1px solid var(--border,#e5e7eb);border-radius:8px;
                 background:transparent;cursor:pointer;font-size:14px;color:var(--foreground,#111);">
          Cancel
        </button>
        <button id="pg-continue"
          style="flex:1;padding:10px;border:none;border-radius:8px;
                 background:var(--primary,#7c3aed);color:#fff;cursor:pointer;
                 font-size:14px;font-weight:500;">
          Continue to checkout
        </button>
      </div>
      <p id="pg-error"
        style="margin:8px 0 0;font-size:12px;color:#ef4444;display:none;">
        Please enter a valid email address.
      </p>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const input = modal.querySelector("input") as HTMLInputElement;
    const cancelBtn = modal.querySelector("#pg-cancel") as HTMLButtonElement;
    const continueBtn = modal.querySelector("#pg-continue") as HTMLButtonElement;
    const errorMsg = modal.querySelector("#pg-error") as HTMLParagraphElement;

    function cleanup() {
      if (document.body.contains(overlay)) document.body.removeChild(overlay);
    }

    function submit() {
      const email = input.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) {
        errorMsg.style.display = "block";
        input.style.borderColor = "#ef4444";
        return;
      }
      cleanup();
      resolve(email);
    }

    cancelBtn.addEventListener("click", () => { cleanup(); resolve(null); });
    continueBtn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) { cleanup(); resolve(null); }
    });

    // Restore border color on input so error clears visually on re-type
    input.addEventListener("input", () => {
      input.style.borderColor = "";
      errorMsg.style.display = "none";
    });

    setTimeout(() => input.focus(), 50);
  });
}

export async function openPaddleCheckout(
  plan: "pro" | "full" | "pro_lifetime" | "full_lifetime" | "concierge",
  userEmail?: string,
  userId?: string
) {
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

  let resolvedEmail = userEmail;
  let customData: Record<string, unknown>;

  if (userId) {
    // Logged-in user — existing behaviour unchanged
    customData = { userId };
  } else {
    // Guest checkout — collect email before opening Paddle overlay
    const guestEmail = await promptGuestEmail();
    if (!guestEmail) {
      console.log("openPaddleCheckout: guest cancelled email prompt");
      return;
    }
    resolvedEmail = guestEmail;
    customData = { userId: null, guestEmail };
    console.log("openPaddleCheckout: guest email captured", guestEmail);
  }

  // Fire tracking BEFORE opening the overlay — overlay can pause JS execution
  const value = PLAN_PRICES[plan] ?? 0;
  const eventId = generateEventId();
  trackPixelEvent("InitiateCheckout", eventId, { value, currency: "USD", content_name: plan });
  console.log("InitiateCheckout tracked", eventId, "plan:", plan, "value:", value);

  const itemsList = [{ priceId, quantity: 1 }];
  console.log("Opening Paddle checkout for", plan, "with price", priceId);

  window.Paddle.Checkout.open({
    items: itemsList,
    ...(resolvedEmail ? { customer: { email: resolvedEmail } } : {}),
    customData,
  });
}
