import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Check, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { openPaddleCheckout } from "@/config/paddle";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { useState } from "react";

export default function Pricing() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "lifetime">("monthly");

  const handlePayment = (plan: "pro" | "full") => {
    if (billing === "lifetime") {
      openPaddleCheckout(plan === "pro" ? "pro_lifetime" : "full_lifetime", user?.email ?? undefined, user?.id);
    } else {
      openPaddleCheckout(plan, user?.email ?? undefined, user?.id);
    }
  };

  const plans = [
    {
      name: "Free",
      monthlyPrice: "$0",
      lifetimePrice: "$0",
      period: billing === "monthly" ? "forever" : "forever",
      description: "Explore what Relova can do.",
      features: [
        "3 AI questions total",
        "Countries explorer (50+ countries)",
        "Basic cost calculator",
      ],
      cta: "Get Started",
      highlighted: false,
      badge: null,
      isFree: true,
    },
    {
      name: "Pro",
      monthlyPrice: "$19",
      lifetimePrice: "$79",
      period: billing === "monthly" ? "/month" : "one-time",
      description: "Personalized guidance for your move.",
      features: [
        "Unlimited AI Advisor",
        "Personalized relocation checklist",
        "Move timeline with deadlines",
        "Cost calculator — 70+ countries",
        "Living there resources",
      ],
      cta: billing === "monthly" ? "Start with Pro" : "Get Pro Lifetime",
      highlighted: true,
      badge: "Most popular",
      isFree: false,
    },
    {
      name: "Full",
      monthlyPrice: "$49",
      lifetimePrice: "$149",
      period: billing === "monthly" ? "/month" : "one-time",
      description: "Your complete relocation system.",
      features: [
        "Everything in Pro",
        "Full step-by-step relocation plan",
        "Document checklists",
        "Visa cover letter generator",
        "Timeline & milestones",
        "Priority AI responses",
      ],
      cta: billing === "monthly" ? "Get Full Plan" : "Get Full Lifetime",
      highlighted: false,
      badge: billing === "lifetime" ? "Best value" : null,
      isFree: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing — Relova"
        description="Relova plans for AI relocation planning: free exploration, Pro for unlimited guidance, and Full for deep plans. Choose monthly or lifetime access."
        canonical="https://relova.ai/pricing"
      />
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container max-w-5xl">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Choose your level of clarity
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
              Start free. Upgrade when you're ready to move with confidence.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.05] border border-white/[0.08]">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  billing === "monthly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("lifetime")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  billing === "lifetime"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap size={13} />
                Lifetime
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  billing === "lifetime"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/20 text-primary"
                }`}>
                  Save 70%
                </span>
              </button>
            </div>

            {billing === "lifetime" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted-foreground mt-3"
              >
                Pay once. Use forever. No recurring charges.
              </motion.p>
            )}
          </motion.div>

          {/* Concierge */}
          <motion.div
            className="mb-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(56,189,248,0.2)",
                background: "linear-gradient(135deg, rgba(56,189,248,0.04) 0%, rgba(99,102,241,0.03) 50%, rgba(255,255,255,0.01) 100%)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.5), transparent)" }}
              />
              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12">

                  <div className="flex-1">
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-[11px] font-medium tracking-wide"
                      style={{
                        background: "rgba(56,189,248,0.08)",
                        border: "1px solid rgba(56,189,248,0.18)",
                        color: "#7dd3fc",
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#38bdf8", display: "inline-block", flexShrink: 0 }} />
                      White-glove service
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                      Relova Concierge
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                      Half the price of an immigration lawyer. A real expert guides you from decision to approved visa — powered by AI, verified by humans.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        "Everything in Full plan — forever",
                        "Personal expert via chat (WhatsApp / Telegram)",
                        "All documents reviewed before submission",
                        "Visa cover letter written & verified",
                        "Chat support for 90 days",
                        "Lawyer reviews your final package",
                        "Personalized relocation roadmap",
                        "Money-back if we make an error",
                      ].map((f) => (
                        <div key={f} className="flex items-start gap-2.5 text-[13px]">
                          <span style={{ color: "#38bdf8", flexShrink: 0, marginTop: 1 }}>✓</span>
                          <span className="text-muted-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-4 md:min-w-[200px]">
                    <div className="md:text-right">
                      <p className="text-[12px] text-muted-foreground/40 line-through mb-1">
                        Lawyers charge $1,500–$3,000
                      </p>
                      <div className="flex items-baseline gap-2 md:justify-end">
                        <span className="text-5xl font-bold tracking-tight">$990</span>
                        <span className="text-muted-foreground text-sm">one-time</span>
                      </div>
                      <p className="text-[12px] mt-1" style={{ color: "#34d399" }}>
                        Save $500–$2,000 vs. a lawyer
                      </p>
                    </div>

                    <button
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-[15px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                        boxShadow: "0 0 32px rgba(14,165,233,0.2)",
                        border: "none",
                      }}
                      onClick={() => openPaddleCheckout("concierge", user?.email ?? undefined, user?.id)}
                    >
                      Apply for Concierge →
                    </button>

                    <p className="text-[11px] text-muted-foreground/40 text-center md:text-right">
                      Limited spots. We review each case.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative p-8 rounded-xl border bg-card ${
                  plan.highlighted
                    ? "border-primary/30 shadow-[0_0_40px_-12px_hsl(var(--primary)/0.15)]"
                    : billing === "lifetime" && plan.name === "Full"
                    ? "border-amber-500/30 shadow-[0_0_40px_-12px_rgba(245,158,11,0.15)]"
                    : "border-border"
                }`}
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-8 px-3 py-0.5 rounded-full text-xs font-medium ${
                    plan.badge === "Best value"
                      ? "bg-amber-500 text-white"
                      : "bg-primary text-primary-foreground"
                  }`}>
                    {plan.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      key={billing + plan.name}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl font-bold tabular-nums"
                    >
                      {billing === "monthly" ? plan.monthlyPrice : plan.lifetimePrice}
                    </motion.span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  {!plan.isFree && billing === "lifetime" && (
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      vs {plan.monthlyPrice}/mo — pay once, use forever
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check size={16} className="text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.isFree ? (
                  <Link to="/dashboard">
                    <button
                      className="w-full flex items-center justify-center gap-2 rounded-xl h-[52px] text-[14px] font-medium transition-all hover:opacity-80 active:scale-[0.98]"
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {plan.cta}
                    </button>
                  </Link>
                ) : (
                  <button
                    className="w-full flex items-center justify-center gap-2 rounded-xl h-[52px] text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                      boxShadow: "0 0 24px rgba(14,165,233,0.2)",
                      border: "none",
                    }}
                    onClick={() => handlePayment(plan.name === "Pro" ? "pro" : "full")}
                  >
                    {plan.cta}
                    <ArrowRight size={14} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-center text-sm text-muted-foreground mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {billing === "monthly"
              ? "Cancel anytime. No questions asked."
              : "One-time payment. Lifetime access. No surprises."}
          </motion.p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
