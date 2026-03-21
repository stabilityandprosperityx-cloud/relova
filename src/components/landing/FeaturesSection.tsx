import { motion } from "framer-motion";

const features = [
  {
    title: "Clarity, not information",
    description: "Turn confusion into a clear action plan. Know exactly what to do, in what order, and why.",
  },
  {
    title: "Your path, not generic advice",
    description: "Every plan is built from your passport, budget, and goals. No templates, no guessing.",
  },
  {
    title: "Real decisions, not endless research",
    description: "Stop reading forums at 2 AM. Get answers that move you forward — instantly.",
  },
];

export default function FeaturesSection() {
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
          Why Relova
        </motion.p>

        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="text-[20px] font-semibold mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-[14px] text-muted-foreground leading-[1.7]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
