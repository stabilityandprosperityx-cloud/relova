import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "I spent three months trying to figure out Portugal on my own. Relova gave me a clear plan in 10 minutes. I moved six weeks later.",
    name: "Karina Engström",
    role: "Product designer",
    route: "🇸🇪 Stockholm → 🇵🇹 Lisbon",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face",
  },
  {
    quote: "The clarity was immediate. I knew exactly which visa to apply for, what documents I needed, and in what order.",
    name: "Tomás Herrera",
    role: "Founder",
    route: "🇦🇷 Buenos Aires → 🇦🇪 Dubai",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
  },
  {
    quote: "We relocated our family of four to Australia. Relova handled the complexity so we could focus on the move itself.",
    name: "Anika Patel",
    role: "Remote engineer",
    route: "🇬🇧 London → 🇪🇸 Barcelona",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-[60px] md:py-[80px] section-purple-bg">
      <div className="container">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-[11px] text-muted-foreground/60 mb-3 uppercase tracking-[0.15em] font-medium">From people who moved</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Real stories, real moves</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="card-premium p-7"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div>
                  <p className="text-[13px] font-semibold">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground/60">{t.role}</p>
                </div>
              </div>
              <p className="text-[14px] leading-[1.7] text-foreground/80 mb-5">"{t.quote}"</p>
              <div
                className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full"
                style={{ background: "rgba(139,92,246,0.08)", color: "#8b5cf6" }}
              >
                {t.route}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
