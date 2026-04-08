import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
                  <Button variant="outline" className="w-full h-10 text-[13px] rounded-lg gap-1.5">
                    {plan.cta}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant={plan.highlighted ? "hero" : "outline"}
                  className="w-full h-10 text-[13px] rounded-lg gap-1.5"
                  onClick={() => handlePayment(plan.name === "Pro" ? "pro" : "full")}
                >
                  {plan.cta}
                  {plan.highlighted && <ArrowRight size={13} />}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
