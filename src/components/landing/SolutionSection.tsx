import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Tell us your situation", desc: "Passport, income, goal, timeline. 2 minutes." },
  { num: "02", title: "Get your country + plan", desc: "AI matches you to the right destination with a clear path." },
  { num: "03", title: "Move with confidence", desc: "Checklists, documents, timeline — everything in one place." },
];

export default function SolutionSection() {
  return (
    <section className="pt-[60px] md:pt-[80px] pb-8 md:pb-12 border-t border-border/40">
      <div className="container">
        <motion.div
          className="max-w-[600px] mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-[11px] text-muted-foreground/60 mb-5 uppercase tracking-[0.15em] font-medium">The solution</p>
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-tight mb-5 leading-[1.1]">
            From decision to relocation — in one system
          </h2>
          <p className="text-[15px] text-muted-foreground leading-[1.7]">
            Relova helps you choose the right country and gives you a clear, step-by-step path to move — without confusion or guesswork.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              className="card-premium p-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
            >
              <div
                className="text-[11px] font-mono font-semibold mb-4 tracking-[0.1em]"
                style={{ color: "#8b5cf6" }}
              >
                {s.num} ——
              </div>
              <h3 className="text-[16px] font-semibold tracking-tight mb-2">{s.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
