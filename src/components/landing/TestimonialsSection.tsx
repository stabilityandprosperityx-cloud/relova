import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "I spent three months trying to figure out Portugal on my own. Relova gave me a clear plan in 10 minutes. I moved six weeks later.",
    name: "Karina Engström",
    role: "Product designer · Stockholm → Lisbon",
  },
  {
    quote: "The clarity was immediate. I knew exactly which visa to apply for, what documents I needed, and in what order.",
    name: "Tomás Herrera",
    role: "Founder · Buenos Aires → Dubai",
  },
  {
    quote: "We relocated our family of four to Australia. Relova handled the complexity so we could focus on the move itself.",
    name: "Anika Patel",
    role: "Remote engineer · London → Barcelona",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-[60px] md:py-[80px] border-t border-border/40">
      <div className="container">
        <motion.p
          className="text-[11px] text-muted-foreground/60 mb-14 uppercase tracking-[0.15em] font-medium"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          From people who moved
        </motion.p>

        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
            >
              <p className="text-[15px] leading-[1.7] text-foreground/80 mb-8">"{t.quote}"</p>
              <div>
                <p className="text-[13px] font-medium text-foreground/90">{t.name}</p>
                <p className="text-[12px] text-muted-foreground/50 mt-1">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
