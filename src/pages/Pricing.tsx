import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Explore countries and get basic guidance",
    features: [
      "5 AI questions per day",
      "Country dashboards",
      "Cost of living data",
      "Basic visa information",
    ],
    cta: "Get Started",
    variant: "outline" as const,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Full relocation support with AI",
    features: [
      "Unlimited AI conversations",
      "Personalized relocation plans",
      "Step-by-step checklists",
      "Tax optimization guidance",
      "Document preparation help",
      "Priority marketplace access",
      "Export plans as PDF",
    ],
    cta: "Start your relocation plan",
    variant: "hero" as const,
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container max-w-4xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Start free. Upgrade when you're ready to get serious about your move.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative p-8 rounded-xl border bg-card ${
                  plan.highlighted ? "border-primary/30 glow-sm" : "border-border"
                }`}
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-8 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Most popular
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tabular-nums">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check size={16} className="text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/chat">
                  <Button variant={plan.variant} className="w-full gap-2" size="lg">
                    {plan.cta} {plan.highlighted && <ArrowRight size={14} />}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-center text-sm text-muted-foreground mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Cancel anytime. No questions asked. 7-day money-back guarantee.
          </motion.p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
