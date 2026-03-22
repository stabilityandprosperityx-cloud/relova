import { motion } from "framer-motion";

export default function SolutionSection() {
  return (
    <section className="pt-[60px] md:pt-[80px] pb-8 md:pb-12 border-t border-border/40">
      <div className="container">
        <motion.div
          className="max-w-[600px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
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
      </div>
    </section>
  );
}
