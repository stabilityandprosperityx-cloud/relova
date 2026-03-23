import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
    cta: "Get Started",
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

export default function Pricing() {
  const { user } = useAuth();

  const handlePayment = (plan: "pro" | "full") => {
    openPayment(plan, user?.email ?? undefined, user?.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container max-w-5xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Choose your level of clarity
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Start free. Upgrade when you're ready to move with confidence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative p-8 rounded-xl border bg-card ${
                  plan.highlighted
                    ? "border-primary/30 shadow-[0_0_40px_-12px_hsl(var(--primary)/0.15)]"
                    : "border-border"
                }`}
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-8 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {plan.badge}
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

                {plan.name === "Free" ? (
                  <Link to="/chat">
                    <Button variant={plan.variant} className="w-full gap-2" size="lg">
                      {plan.cta}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant={plan.variant}
                    className="w-full gap-2"
                    size="lg"
                    onClick={() => handlePayment(plan.name === "Pro" ? "pro" : "full")}
                  >
                    {plan.cta} {plan.highlighted && <ArrowRight size={14} />}
                  </Button>
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
            Cancel anytime. No questions asked. 14-day money-back guarantee.
          </motion.p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
