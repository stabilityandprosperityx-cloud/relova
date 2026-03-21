import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Tell us where you're going",
    description: "Select your target country and share your situation — passport, budget, goals. Takes 2 minutes.",
  },
  {
    number: "02",
    title: "Get your AI relocation plan",
    description: "Our AI analyzes visa pathways, tax implications, document requirements, and timelines specific to you.",
  },
  {
    number: "03",
    title: "Execute with confidence",
    description: "Follow your step-by-step checklist. Ask the AI anything along the way. Connect with vetted local experts if needed.",
  },
];

export default function HowItWorksSection() {
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
            From overwhelmed to organized in minutes
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg">
            No more scattered Google searches. No more outdated forum posts. One platform, one plan.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative p-8 rounded-xl border border-border bg-card"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-xs font-mono text-primary font-medium">{step.number}</span>
              <h3 className="text-lg font-semibold mt-3 mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
