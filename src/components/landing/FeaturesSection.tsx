import { MessageSquare, Map, ClipboardList, Users } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: MessageSquare,
    title: "AI that understands immigration",
    description: "Not a generic chatbot. Our AI is trained on visa requirements, tax treaties, and immigration law across 30+ countries.",
  },
  {
    icon: ClipboardList,
    title: "Your plan, not a template",
    description: "Based on your passport, budget, and goals — not generic advice. Every plan is unique because every situation is.",
  },
  {
    icon: Map,
    title: "Country intelligence, not blog posts",
    description: "Real-time data on visa options, cost of living, tax rates, and residency pathways. Updated continuously.",
  },
  {
    icon: Users,
    title: "Vetted professionals, not ads",
    description: "Every lawyer, agent, and consultant in our marketplace has been reviewed. No pay-to-play listings.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 border-t border-border">
      <div className="container">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Built different, on purpose
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg">
            Every feature exists because someone was stuck at 2 AM in a foreign country, wishing it existed.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group p-8 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                <feature.icon size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
