import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { openPayment } from "@/config/payments";
import { useAuth } from "@/contexts/AuthContext";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Explore what Relova can do.",
    features: [
      "3 AI questions total",
      "General relocation answers",
      "Basic country overviews",
    ],
    cta: "Get started",
    variant: "outline" as const,
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Personalized guidance for your move.",
    features: [
      "Unlimited AI questions",
      "Personalized answers",
      "Country comparisons",
      "Residency & citizenship overview",
      "Save conversations",
    ],
    cta: "Start with Pro",
    variant: "hero" as const,
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Full",
    price: "$49",
    period: "/month",
    description: "Your complete relocation system.",
    features: [
      "Everything in Pro",
      "Full step-by-step relocation plan",
      "Document checklists",
      "Timeline & milestones",
      "Tax & strategy guidance",
      "Priority AI responses",
    ],
    cta: "Get Full Plan",
    variant: "outline" as const,
    highlighted: false,
    badge: null,
  },
];

export default function PricingSection() {
  const { user } = useAuth();

  const handlePayment = (plan: "pro" | "full") => {
    openPayment(plan, user?.email ?? undefined, user?.id);
  };

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
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-[960px] mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative p-7 rounded-xl border transition-shadow ${
                plan.highlighted
                  ? "border-primary/30 bg-primary/[0.03] shadow-[0_0_40px_-12px_hsl(var(--primary)/0.15)]"
                  : "border-border/50 bg-card/50"
              }`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-7 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium tracking-wide">
                  {plan.badge}
                </span>
              )}

              <h3 className="text-lg font-semibold tracking-tight mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold tabular-nums">{plan.price}</span>
                <span className="text-xs text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-[13px] text-muted-foreground mb-6">{plan.description}</p>

              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px] text-foreground/75">
                    <Check size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.name === "Free" ? (
                <Link to="/chat">
                  <Button variant={plan.variant} className="w-full h-10 text-[13px] rounded-lg gap-1.5">
                    {plan.cta}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant={plan.variant}
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
