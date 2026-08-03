import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Shield, RefreshCw, Lock, Headphones, Zap } from "lucide-react";
import { openPaddleCheckout } from "@/config/paddle";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import conciergeCouple from "@/assets/redesign/concierge-couple.jpg";

const CONCIERGE_FEATURES = [
  "Personal expert via chat (WhatsApp / Telegram)",
  "All documents reviewed",
  "Visa letter written & verified",
  "Chat support for 90 days",
  "Lawyer reviews package",
  "Everything in Full — forever",
  "Personalized roadmap",
  "Money-back guarantee",
];

const TRUST_BADGES = [
  { icon: Shield,     label: "Secure payments" },
  { icon: RefreshCw,  label: "Cancel anytime" },
  { icon: Lock,       label: "Your data is protected" },
  { icon: Headphones, label: "Human support" },
];

export default function PricingSection() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "lifetime">("monthly");

  const handlePayment = (plan: "pro" | "full") => {
    if (billing === "lifetime") {
      openPaddleCheckout(
        plan === "pro" ? "pro_lifetime" : "full_lifetime",
        user?.email ?? undefined,
        user?.id
      );
    } else {
      openPaddleCheckout(plan, user?.email ?? undefined, user?.id);
    }
  };

  const plans = [
    {
      name: "Free",
      monthlyPrice: "$0",
      lifetimePrice: "$0",
      period: "forever",
      description: "Explore what Relova can do.",
      features: [
        "3 AI questions total",
        "Countries explorer (70+ countries)",
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
    <section id="pricing" className="py-20 md:py-28 bg-background border-t border-border/50">
      <div className="container max-w-6xl px-5 md:px-8">

        {/* Centered header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo badge */}
          <div className="inline-flex items-center gap-1.5 mb-5">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: "hsl(var(--primary))" }}
            >
              <span className="text-[9px] font-bold text-white">R</span>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Relova
            </span>
          </div>

          <h2 className="font-serif text-[2rem] sm:text-[2.6rem] md:text-[3rem] font-semibold leading-[1.1] mb-4 text-foreground">
            Simple pricing. Every journey.
          </h2>
          <p className="text-[15px] text-muted-foreground max-w-md mx-auto mb-6">
            Choose the plan that fits your move. Upgrade or cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                billing === "monthly"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("lifetime")}
              className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 ${
                billing === "lifetime"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap size={12} />
              Lifetime
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">
                Save 70%
              </span>
            </button>
          </div>
        </motion.div>

        {/* 3 regular plan cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.highlighted
                  ? "border-2 border-primary bg-card"
                  : "border border-border bg-card"
              }`}
              style={{
                boxShadow: plan.highlighted
                  ? "0 8px 40px hsl(var(--primary) / 0.12)"
                  : "0 2px 12px rgba(0,0,0,0.05)",
              }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white ${
                      plan.badge === "Best value" ? "bg-amber-500" : ""
                    }`}
                    style={plan.badge !== "Best value" ? { background: "hsl(var(--primary))" } : undefined}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-5">
                <h3 className="text-[16px] font-semibold text-foreground mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <motion.span
                    key={billing + plan.name}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[2.2rem] font-bold text-foreground tabular-nums"
                  >
                    {billing === "monthly" ? plan.monthlyPrice : plan.lifetimePrice}
                  </motion.span>
                  <span className="text-[13px] text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-[13px] text-muted-foreground">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                    <Check size={14} className="text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.isFree ? (
                <Link to="/dashboard">
                  <button className="w-full h-10 rounded-xl border border-border text-[13px] font-medium text-foreground hover:bg-secondary transition-colors">
                    {plan.cta}
                  </button>
                </Link>
              ) : plan.highlighted ? (
                <button
                  className="w-full h-10 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "hsl(var(--primary))", boxShadow: "0 4px 16px hsl(var(--primary) / 0.30)" }}
                  onClick={() => handlePayment(plan.name === "Pro" ? "pro" : "full")}
                >
                  {plan.cta}
                </button>
              ) : (
                <button
                  className="w-full h-10 rounded-xl border border-border text-[13px] font-medium text-foreground hover:border-primary/40 hover:bg-primary/4 transition-colors"
                  onClick={() => handlePayment(plan.name === "Pro" ? "pro" : "full")}
                >
                  {plan.cta}
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Concierge card — full width, 2-column */}
        <motion.div
          className="rounded-2xl overflow-hidden border border-border bg-card grid md:grid-cols-[1fr_0.55fr]"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {/* Left — text content */}
          <div className="p-7 md:p-9 flex flex-col">
            {/* White-glove service badge */}
            <div className="mb-4">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
                style={{
                  background: "hsl(var(--primary) / 0.06)",
                  borderColor: "hsl(var(--primary) / 0.25)",
                  color: "hsl(var(--primary))",
                }}
              >
                ✦ White-glove service
              </span>
            </div>

            <h3 className="font-serif text-[1.6rem] md:text-[1.9rem] font-semibold text-foreground mb-2 leading-tight">
              Relova Concierge
            </h3>
            <p className="text-[14px] text-muted-foreground mb-5">
              Half the price of an immigration lawyer. A real expert guides you from decision to approved visa — powered by AI, verified by humans.
            </p>

            {/* Price */}
            <div className="mb-1">
              <p className="text-[11px] text-muted-foreground/50 line-through mb-1">
                Lawyers charge $1,500–$3,000
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-[2.4rem] font-bold text-foreground tabular-nums">$990</span>
                <span className="text-[14px] text-muted-foreground">one-time</span>
              </div>
              <p className="text-[12px] text-emerald-600 font-medium mt-0.5 mb-5">
                Save $500–$2,000 vs. a lawyer
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-2.5 mb-8 flex-1">
              {CONCIERGE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "hsl(var(--primary) / 0.10)" }}
                  >
                    <Check size={9} className="text-primary" strokeWidth={3} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <button
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 h-11 px-8 rounded-xl text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "hsl(var(--primary))",
                boxShadow: "0 4px 20px hsl(var(--primary) / 0.28)",
              }}
              onClick={() => openPaddleCheckout("concierge", user?.email ?? undefined, user?.id)}
            >
              Apply for Concierge →
            </button>
            <p className="text-[11px] text-muted-foreground/50 mt-2">
              Limited spots. We review each case.
            </p>
          </div>

          {/* Right — photo */}
          <div className="hidden md:block relative overflow-hidden" style={{ minHeight: 320 }}>
            <img loading="lazy"
              src={conciergeCouple}
              alt="A couple working with a Relova concierge expert on their relocation plan"
              className="w-full h-full object-cover object-center absolute inset-0"
            />
          </div>
        </motion.div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-[12px] text-muted-foreground/60">
              <Icon size={14} strokeWidth={1.6} />
              {label}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
