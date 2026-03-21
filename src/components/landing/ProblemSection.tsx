import { motion } from "framer-motion";

const painPoints = [
  { title: "Scattered information", description: "Answers spread across forums, blogs, and outdated government sites." },
  { title: "Unclear legal steps", description: "Visa rules change constantly. It's hard to know what's current." },
  { title: "Document confusion", description: "Which documents, in what order, translated or not — nobody tells you clearly." },
  { title: "No single system", description: "There's no one place that guides the entire process from start to finish." },
];

export default function ProblemSection() {
  return (
    <section className="py-28 md:py-36 border-t border-border/40">
      <div className="container">
        <motion.h2
          className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-tight mb-16 leading-[1.1]"
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Moving abroad is confusing
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.title}
              className="space-y-2.5"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="h-1 w-8 rounded-full bg-primary/30 mb-4" />
              <h3 className="text-[16px] font-semibold tracking-tight">{point.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-[1.65]">{point.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
