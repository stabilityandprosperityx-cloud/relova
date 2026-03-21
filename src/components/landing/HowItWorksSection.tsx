import { motion } from "framer-motion";

const steps = [
  { number: "1", title: "Tell us your situation", description: "Passport, destination, goals. Two minutes." },
  { number: "2", title: "Get your relocation plan", description: "Visas, documents, timelines — personalized to you." },
  { number: "3", title: "Move with confidence", description: "Follow clear steps. Ask questions anytime." },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 md:py-32 border-t border-border">
      <div className="container">
        <motion.p
          className="text-[13px] text-muted-foreground mb-10 uppercase tracking-wider font-medium"
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          How it works
        </motion.p>

        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[13px] font-mono text-primary font-medium">{step.number}</span>
              <h3 className="text-xl font-semibold mt-2 mb-2 tracking-tight">{step.title}</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
