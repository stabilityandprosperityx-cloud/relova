import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Basic access to explore Relova.",
    features: ["Limited AI questions", "Country overview pages", "Basic document checklists"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Early access pricing",
    description: "Full access to everything Relova offers.",
    features: ["Unlimited AI questions", "Deeper country guidance", "Legal pathway overviews", "Personalized action plans", "Priority support"],
    cta: "Join early access",
    highlighted: true,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-28 md:py-36 border-t border-border/40">
      <div className="container">
        <motion.p
          className="text-[11px] text-muted-foreground/60 mb-12 uppercase tracking-[0.15em] font-medium"
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Pricing
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6 max-w-[800px]">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`p-8 rounded-xl border ${plan.highlighted ? "border-primary/30 bg-primary/[0.03]" : "border-border/50 bg-card/50"}`}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="text-[20px] font-semibold tracking-tight mb-1">{plan.name}</h3>
              {plan.price && <p className="text-[13px] text-primary font-medium mb-3">{plan.price}</p>}
              <p className="text-[13px] text-muted-foreground mb-6">{plan.description}</p>

              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px] text-foreground/75">
                    <Check size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to="/chat">
                <Button
                  variant={plan.highlighted ? "hero" : "outline"}
                  className="w-full h-10 text-[13px] rounded-lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
