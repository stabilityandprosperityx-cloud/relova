import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { openPaddleCheckout } from "@/config/paddle";
import Navbar from "@/components/layout/Navbar";

const allowedPlans = ["pro", "full", "pro_lifetime", "full_lifetime", "concierge"] as const;
type Plan = typeof allowedPlans[number];

export default function Checkout() {
  const [params] = useSearchParams();
  const opened = useRef(false);
  const requested = params.get("plan") as Plan | null;
  const plan = requested && allowedPlans.includes(requested) ? requested : null;

  useEffect(() => {
    if (!plan) return;
    const tryOpen = () => {
      if (opened.current || !window.Paddle) return false;
      opened.current = true;
      openPaddleCheckout(plan);
      return true;
    };
    if (tryOpen()) return;
    const timer = window.setInterval(() => {
      if (tryOpen()) window.clearInterval(timer);
    }, 200);
    const timeout = window.setTimeout(() => window.clearInterval(timer), 12000);
    return () => { window.clearInterval(timer); window.clearTimeout(timeout); };
  }, [plan]);

  return (
    <div className="min-h-screen bg-[#f8f2ee] pt-[76px] text-[#241829]">
      <Navbar />
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6 py-20 text-center">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[.22em] text-[#7146e8]">Secure checkout</p>
          <h1 className="text-4xl font-medium tracking-[-.04em] sm:text-6xl">Your Relova plan<br/>is one step away.</h1>
          <p className="mx-auto mt-6 max-w-lg text-[#756a78]">The secure Paddle checkout should open automatically. If you closed it, return to pricing and select your plan again.</p>
          {!plan && <p className="mt-5 text-sm text-red-700">Please choose a valid plan.</p>}
          <Link to="/pricing" className="mt-9 inline-flex rounded-xl bg-gradient-to-r from-[#5728d9] to-[#8052ef] px-7 py-4 text-sm font-semibold text-white shadow-xl">Back to pricing</Link>
        </div>
      </main>
    </div>
  );
}
