import { motion } from "framer-motion";

export default function DemoSection() {
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
          See it in action
        </motion.p>

        <motion.div
          className="max-w-[640px] rounded-xl border border-border/50 bg-card/80 overflow-hidden"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
            <span className="text-[11px] text-muted-foreground/50 font-medium">Relova AI</span>
          </div>

          <div className="p-6 space-y-5">
            {/* User message */}
            <div className="bg-muted/50 dark:bg-muted/30 rounded-xl px-5 py-3.5 max-w-[80%]">
              <p className="text-[13px] text-muted-foreground">Where should I move based on my income and goals?</p>
            </div>

            {/* AI response */}
            <div className="bg-primary/5 dark:bg-primary/8 rounded-xl px-5 py-4">
              <p className="text-[13px] text-foreground/85 leading-[1.75] mb-4">
                Based on your profile, Portugal is a strong option. Here's the most efficient path forward:
              </p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="text-[11px] font-mono text-primary/70 mt-0.5 shrink-0">01</span>
                  <p className="text-[13px] text-foreground/75 leading-[1.6]">
                    <span className="font-medium text-foreground/90">Select your visa type</span> — D7, Digital Nomad, or D2 depending on your income source.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[11px] font-mono text-primary/70 mt-0.5 shrink-0">02</span>
                  <p className="text-[13px] text-foreground/75 leading-[1.6]">
                    <span className="font-medium text-foreground/90">Prepare documents</span> — passport, proof of income, criminal record certificate, health insurance.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[11px] font-mono text-primary/70 mt-0.5 shrink-0">03</span>
                  <p className="text-[13px] text-foreground/75 leading-[1.6]">
                    <span className="font-medium text-foreground/90">Residency timeline</span> — temporary residence after visa approval, eligible for permanent residence after 5 years.
                  </p>
                </div>
              </div>
              <p className="text-[12px] text-muted-foreground/60 mt-4 font-mono">Estimated timeline: 3–5 months</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
