import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Choose a country", description: "Explore destinations and compare what matters to you." },
  { number: "02", title: "Ask Relova AI", description: "Get structured answers about visas, documents, and legal steps." },
  { number: "03", title: "Follow a clearer path", description: "Move forward with a plan — not guesswork." },
];

export default function HowItWorksSection() {
  return (
    <section className="py-28 md:py-36 border-t border-border/40">
      <div className="container">
        <motion.p
          className="text-[11px] text-muted-foreground/60 mb-12 uppercase tracking-[0.15em] font-medium"
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          How it works
        </motion.p>

        <div className="grid md:grid-cols-3 gap-16 md:gap-20">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
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
