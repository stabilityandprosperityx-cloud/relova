import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "I was drowning in visa paperwork for Portugal. RelocateAI gave me a clear checklist and connected me with a lawyer who got it done in 3 weeks.",
    name: "Maria Sousa",
    role: "Freelance Designer → Lisbon",
    initials: "MS",
  },
  {
    quote: "As a founder, I needed to know tax residency implications across 4 countries. This tool saved me thousands in consulting fees.",
    name: "Daniel Kim",
    role: "Startup Founder → Dubai",
    initials: "DK",
  },
  {
    quote: "Moved my family to Georgia in 60 days. The step-by-step plan was exactly what we needed to feel in control.",
    name: "Elena Volkov",
    role: "Remote Engineer → Tbilisi",
    initials: "EV",
  },
];

export default function TestimonialsSection() {
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
            People who moved with RelocateAI
          </h2>
          <p className="text-muted-foreground text-lg">
            Real relocations. Real clarity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="p-8 rounded-xl border border-border bg-card"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-sm leading-relaxed text-foreground/90 mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
