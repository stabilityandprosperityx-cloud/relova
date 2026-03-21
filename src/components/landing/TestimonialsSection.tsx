import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "I spent three months trying to figure out Portugal on my own. Relova gave me a clear plan in 10 minutes. I moved six weeks later.",
    name: "Karina Engström",
    role: "Product designer, Stockholm → Lisbon",
  },
  {
    quote: "The clarity was immediate. I knew exactly which visa to apply for, what documents I needed, and in what order. No more guessing.",
    name: "Tomás Herrera",
    role: "Founder, Buenos Aires → Dubai",
  },
  {
    quote: "We relocated our family of four to Georgia. Relova handled the complexity so we could focus on the move itself.",
    name: "Anika Patel",
    role: "Remote engineer, London → Tbilisi",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 border-t border-border">
      <div className="container">
        <motion.p
          className="text-[13px] text-muted-foreground mb-12 uppercase tracking-wider font-medium"
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          From people who moved
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[14px] leading-relaxed text-foreground/85 mb-6">"{t.quote}"</p>
              <div>
                <p className="text-[13px] font-medium">{t.name}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
