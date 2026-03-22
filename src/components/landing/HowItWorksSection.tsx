import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Tell us about your situation", description: "Your passport, budget, goals, and preferences." },
  { number: "02", title: "Get your best country and plan", description: "A structured recommendation with a clear path forward." },
  { number: "03", title: "Move with a clear path", description: "Step-by-step guidance from decision to relocation." },
];

export default function HowItWorksSection() {
  return (
    <section className="py-[60px] md:py-[80px] border-t border-border/40">
      <div className="container">
        <motion.p
          className="text-[11px] text-muted-foreground/60 mb-12 uppercase tracking-[0.15em] font-medium"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          How it works
        </motion.p>

        <div className="grid md:grid-cols-3 gap-16 md:gap-20">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
            >
              <span className="text-[12px] font-mono text-primary/70 font-medium">{step.number}</span>
              <h3 className="text-[22px] font-semibold mt-3 mb-3 tracking-tight">{step.title}</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
