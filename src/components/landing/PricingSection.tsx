import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Zap } from "lucide-react";
import { openPaddleCheckout } from "@/config/paddle";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

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
    <section id="pricing" className="py-[60px] md:py-[80px] border-t border-border/40">
      <div className="container max-w-[1200px] mx-auto">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-[11px] text-muted-foreground/60 mb-4 uppercase tracking-[0.15em] font-medium">
            Pricing
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Choose your level of clarity
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Start free. Upgrade when you're ready to move with confidence.
          </p>

          <div className="inline-flex items-center gap-1 p-1 mt-6 rounded-xl bg-white/[0.05] border border-white/[0.08]">
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
        </motion.div>

        <motion.div
          className="max-w-[960px] mx-auto mb-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
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
            <div className="p-7 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                <div className="flex-1">
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-[11px] font-medium tracking-wide"
                    style={{
                      background: "rgba(56,189,248,0.08)",
                      border: "1px solid rgba(56,189,248,0.18)",
                      color: "#7dd3fc",
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#38bdf8", display: "inline-block", flexShrink: 0 }} />
                    White-glove service
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-2">Relova Concierge</h3>
                  <p className="text-[13px] text-muted-foreground mb-4 max-w-lg leading-relaxed">
                    Half the price of an immigration lawyer. A real expert guides you from decision to approved visa — powered by AI, verified by humans.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      "60-min strategy call",
                      "All documents reviewed",
                      "Visa letter written & verified",
                      "WhatsApp 90 days",
                      "Lawyer reviews package",
                      "Everything in Full — forever",
                      "Personalized roadmap",
                      "Money-back guarantee",
                    ].map((f) => (
                      <div key={f} className="flex items-start gap-1.5 text-[12px]">
                        <span style={{ color: "#38bdf8", flexShrink: 0 }}>✓</span>
                        <span className="text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
                  <div className="md:text-right">
                    <p className="text-[11px] text-muted-foreground/40 line-through mb-1">Lawyers charge $1,500–$3,000</p>
                    <div className="flex items-baseline gap-2 md:justify-end">
                      <span className="text-4xl font-bold tracking-tight">$990</span>
                      <span className="text-muted-foreground text-sm">one-time</span>
                    </div>
                    <p className="text-[11px] mt-1" style={{ color: "#34d399" }}>Save $500–$2,000 vs. a lawyer</p>
                  </div>
                  <button
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                      boxShadow: "0 0 28px rgba(14,165,233,0.2)",
                      border: "none",
                    }}
                    onClick={() => openPaddleCheckout("concierge", user?.email ?? undefined, user?.id)}
                  >
                    Apply for Concierge →
                  </button>
                  <p className="text-[11px] text-muted-foreground/40 md:text-right">Limited spots. We review each case.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-[960px] mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative p-7 rounded-xl border transition-shadow ${
                plan.highlighted
                  ? "border-primary/30 bg-primary/[0.03] shadow-[0_0_40px_-12px_hsl(var(--primary)/0.15)]"
                  : billing === "lifetime" && plan.name === "Full"
                  ? "border-amber-500/30 shadow-[0_0_40px_-12px_rgba(245,158,11,0.15)]"
                  : "border-border/50 bg-card/50"
              }`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
            >
              {plan.badge && (
                <span className={`absolute -top-2.5 left-7 px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${
                  plan.badge === "Best value"
                    ? "bg-amber-500 text-white"
                    : "bg-primary text-primary-foreground"
                }`}>
                  {plan.badge}
                </span>
              )}

              <h3 className="text-lg font-semibold tracking-tight mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <motion.span
                  key={billing + plan.name}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold tabular-nums"
                >
                  {billing === "monthly" ? plan.monthlyPrice : plan.lifetimePrice}
                </motion.span>
                <span className="text-xs text-muted-foreground">{plan.period}</span>
              </div>
              {!plan.isFree && billing === "lifetime" && (
                <p className="text-[11px] text-muted-foreground/60 mb-2">
                  vs {plan.monthlyPrice}/mo — pay once, use forever
                </p>
              )}
              <p className="text-[13px] text-muted-foreground mb-6">{plan.description}</p>

              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px] text-foreground/75">
                    <Check size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.isFree ? (
                <Link to="/dashboard">
                  <button
                    className="w-full flex items-center justify-center rounded-lg h-10 text-[13px] transition-all hover:opacity-80"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    {plan.cta}
                  </button>
                </Link>
              ) : (
                <button
                  className="w-full flex items-center justify-center gap-2 rounded-lg h-10 text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                    boxShadow: "0 0 20px rgba(14,165,233,0.15)",
                    border: "none",
                  }}
                  onClick={() => handlePayment(plan.name === "Pro" ? "pro" : "full")}
                >
                  {plan.cta}
                  <ArrowRight size={13} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
