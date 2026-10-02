import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { openPaddleCheckout } from "@/config/paddle";
import { useAuth } from "@/contexts/AuthContext";
import conciergeImage from "@/assets/redesign/plan-builder-lifestyle.jpg";

type Billing = "monthly" | "lifetime";

const planFeatures = {
  Free: ["3 questions to your Relocation Expert", "Countries explorer (70+ countries)", "Basic cost calculator"],
  Pro: ["Unlimited Relocation Expert access", "Personalized relocation checklist", "Move timeline with deadlines", "Cost calculator — 70+ countries", "Living there resources"],
  Full: ["Everything in Pro", "Full step-by-step relocation plan", "Document checklists", "Visa cover letter generator", "Timeline & milestones", "Priority expert responses"],
};

export default function Pricing() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<Billing>("monthly");

  const handlePayment = (plan: "pro" | "full") => {
    const price = billing === "lifetime" ? `${plan}_lifetime` : plan;
    openPaddleCheckout(price as "pro" | "full" | "pro_lifetime" | "full_lifetime", user?.email ?? undefined, user?.id);
  };

  const plans = [
    { name: "Free", eyebrow: "Explore", price: "$0", period: "forever", description: "A clear first look at your options.", cta: "Get started", isFree: true },
    { name: "Pro", eyebrow: "Plan", price: billing === "monthly" ? "$19" : "$79", period: billing === "monthly" ? "month" : "one-time", description: "Personal guidance for a confident move.", cta: billing === "monthly" ? "Start with Pro" : "Get Pro lifetime", isFree: false },
    { name: "Full", eyebrow: "Move", price: billing === "monthly" ? "$49" : "$149", period: billing === "monthly" ? "month" : "one-time", description: "Your complete relocation system.", cta: billing === "monthly" ? "Get Full plan" : "Get Full lifetime", isFree: false },
  ] as const;

  return (
    <div className="min-h-screen bg-[#fbf5f1] text-[#211426]">
      <SEO title="Pricing — Relova" description="Choose a Relova plan for clear, personalized relocation guidance. Start free, subscribe monthly, or get lifetime access." canonical="https://relova.ai/pricing" />
      <Navbar />
      <main className="overflow-hidden pt-[60px]">
        <section className="relative isolate bg-[#24162c] px-5 pb-28 pt-20 text-white md:px-8 md:pb-36 md:pt-28">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-24 -top-52 h-[520px] w-[520px] rounded-full bg-[#7447f6]/25 blur-[110px]" />
            <div className="absolute -bottom-64 left-[12%] h-[420px] w-[620px] rounded-full bg-[#ae7898]/20 blur-[120px]" />
            <div className="absolute right-[9%] top-12 h-[470px] w-[470px] rounded-full border border-[#d9b8df]/15" />
            <div className="absolute right-[13%] top-28 h-[350px] w-[350px] rounded-full border border-[#d9b8df]/10" />
          </div>
          <motion.div className="container max-w-6xl" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="mb-6 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#c8adff]">Simple pricing</p>
            <div className="grid items-end gap-10 md:grid-cols-[1.35fr_0.65fr]">
              <h1 className="max-w-4xl text-[clamp(3.4rem,8vw,7rem)] font-medium leading-[0.88] tracking-[-0.065em]">
                Plan the move.<br /><span className="bg-gradient-to-r from-[#8c61ff] via-[#b89aff] to-[#ead8ff] bg-clip-text text-transparent">Keep the clarity.</span>
              </h1>
              <div className="pb-2 md:pb-3">
                <p className="max-w-md text-[17px] leading-7 text-white/65">Start free, upgrade when you need more certainty, and keep every decision in one calm place.</p>
                <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/15 pt-5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/60">
                  <span>No hidden fees</span><span>Secure checkout</span><span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="relative z-10 -mt-14 px-5 pb-24 md:px-8 md:pb-32">
          <div className="container max-w-6xl">
            <div className="mb-7 flex flex-col gap-5 rounded-[22px] border border-[#dfd2dd] bg-white/90 p-4 shadow-[0_22px_70px_rgba(67,38,62,0.10)] backdrop-blur md:flex-row md:items-center md:justify-between md:p-5">
              <div className="px-2"><p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7c6080]">Choose access</p><p className="mt-1 text-sm text-[#756b77]">One account. Your plan stays with you.</p></div>
              <div className="grid grid-cols-2 rounded-[14px] bg-[#f1e9f1] p-1.5 md:w-[360px]">
                {(["monthly", "lifetime"] as Billing[]).map((option) => (
                  <button key={option} type="button" onClick={() => setBilling(option)} className={`rounded-[10px] px-4 py-3 text-sm font-semibold capitalize transition-all ${billing === option ? "bg-[#2b1b31] text-white shadow-lg" : "text-[#756679] hover:text-[#2b1b31]"}`}>
                    {option}{option === "lifetime" && <span className="ml-2 text-[10px] text-[#c8adff]">SAVE 70%</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const featured = plan.name === "Pro";
                return (
                  <motion.article key={plan.name} className={`relative flex min-h-[590px] flex-col overflow-hidden rounded-[26px] border p-7 md:p-8 ${featured ? "border-[#5c3bbf] bg-[#2b1b31] text-white shadow-[0_28px_80px_rgba(43,27,49,0.24)]" : "border-[#e0d5dd] bg-white text-[#211426] shadow-[0_18px_60px_rgba(67,38,62,0.07)]"}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.08 }}>
                    {featured && <div className="absolute right-0 top-0 rounded-bl-[18px] bg-[#7248ef] px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em]">Most popular</div>}
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${featured ? "text-[#c8adff]" : "text-[#87698a]"}`}>{plan.eyebrow}</p>
                    <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{plan.name}</h2>
                    <p className={`mt-2 min-h-12 text-sm leading-6 ${featured ? "text-white/62" : "text-[#756b77]"}`}>{plan.description}</p>
                    <div className={`my-7 flex items-end gap-2 border-y py-6 ${featured ? "border-white/10" : "border-[#eadfe7]"}`}>
                      <motion.span key={`${billing}-${plan.name}`} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-semibold tracking-[-0.06em] tabular-nums">{plan.price}</motion.span>
                      <span className={`pb-1 text-[13px] font-medium ${featured ? "text-white/55" : "text-[#716774]"}`}>{plan.period === "month" ? "/ month" : plan.period}</span>
                    </div>
                    <ul className="mb-8 space-y-4">
                      {planFeatures[plan.name].map((item) => (
                        <li key={item} className={`flex items-start gap-3 text-[14px] leading-5 ${featured ? "text-white/72" : "text-[#625866]"}`}>
                          <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${featured ? "bg-[#754cf0]/25 text-[#c8adff]" : "bg-[#f0e9f1] text-[#6e45db]"}`}><Check size={12} strokeWidth={2.5} /></span>{item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto">
                      {plan.isFree ? (
                        <Link to="/dashboard" className="flex w-full items-center justify-center rounded-[13px] border border-[#cdbdca] px-5 py-4 text-sm font-semibold transition-all hover:border-[#6e45db] hover:text-[#6e45db] active:scale-[0.99]">{plan.cta}</Link>
                      ) : (
                        <button type="button" onClick={() => handlePayment(plan.name === "Pro" ? "pro" : "full")} className={`w-full rounded-[13px] px-5 py-4 text-sm font-semibold transition-all active:scale-[0.99] ${featured ? "bg-gradient-to-r from-[#5d31db] to-[#8155f2] text-white shadow-[0_12px_32px_rgba(105,64,225,0.36)] hover:brightness-110" : "bg-[#2b1b31] text-white hover:bg-[#3b2742]"}`}>{plan.cta}</button>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
            <p className="mt-8 text-center text-sm text-[#766c78]">{billing === "monthly" ? "Cancel anytime. No questions asked." : "Pay once. Keep lifetime access. No recurring charges."}</p>

            <motion.section className="relative mt-20 overflow-hidden rounded-[30px] bg-[#2b1b31] text-white shadow-[0_28px_90px_rgba(43,27,49,0.20)]" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="grid min-h-[430px] lg:grid-cols-[1.2fr_0.8fr]">
                <div className="relative z-10 flex flex-col justify-center p-8 md:p-14">
                  <div className="mb-7 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c8adff]"><Sparkles size={14} /> White-glove service</div>
                  <h2 className="text-[clamp(2.5rem,5vw,4.6rem)] font-medium leading-[0.92] tracking-[-0.055em]">Relova<br />Concierge</h2>
                  <p className="mt-6 max-w-lg text-[16px] leading-7 text-white/65">A real expert guides you from your first decision to an application-ready visa package.</p>
                  <div className="mt-8 flex flex-wrap items-center gap-5">
                    <button type="button" onClick={() => openPaddleCheckout("concierge", user?.email ?? undefined, user?.id)} className="rounded-[13px] bg-gradient-to-r from-[#5d31db] to-[#8155f2] px-7 py-4 text-sm font-semibold shadow-[0_12px_32px_rgba(105,64,225,0.35)] transition hover:brightness-110 active:scale-[0.99]">Apply for Concierge</button>
                    <div><strong className="text-xl">$990</strong><span className="ml-2 text-sm text-white/50">one-time</span></div>
                  </div>
                </div>
                <div className="relative min-h-[360px] lg:min-h-full">
                  <img src={conciergeImage} alt="Relocation planning with a personal expert" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2b1b31] via-[#2b1b31]/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#2b1b31]/55 to-transparent" />
                </div>
              </div>
            </motion.section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
