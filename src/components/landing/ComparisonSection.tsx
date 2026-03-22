import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const rows = [
  {
    label: "Information",
    others: "Scattered blogs, outdated info",
    relova: "Clear, personalized relocation path",
  },
  {
    label: "Legal clarity",
    others: "Unclear steps",
    relova: "Exact steps based on your situation",
  },
  {
    label: "Countries",
    others: "Limited / fragmented",
    relova: "Any country, not just a few options",
  },
  {
    label: "Personalization",
    others: "Generic",
    relova: "Tailored to your life, not generic advice",
  },
];

export default function ComparisonSection() {
  return (
    <section className="py-[60px] md:py-[80px] border-t border-border/40">
      <div className="container">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-[13px] text-muted-foreground mb-4 uppercase tracking-wider font-medium">
            Comparison
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Why Relova vs everything else
          </h2>
        </motion.div>

        <motion.div
          className="overflow-hidden rounded-xl border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr] md:grid-cols-[1.4fr_1fr_1fr] bg-muted/30">
            <div className="px-5 py-4 md:px-8 md:py-5" />
            <div className="px-5 py-4 md:px-8 md:py-5 border-l border-border/40">
              <p className="text-[12px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                Others
              </p>
            </div>
            <div className="px-5 py-4 md:px-8 md:py-5 border-l border-border/40 bg-primary/5">
              <p className="text-[12px] text-primary uppercase tracking-wider font-semibold">
                Relova
              </p>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_1fr_1fr] md:grid-cols-[1.4fr_1fr_1fr] border-t border-border/30 ${
                i % 2 === 0 ? "" : "bg-muted/10"
              }`}
            >
              <div className="px-5 py-5 md:px-8 md:py-6">
                <p className="text-[14px] font-medium text-foreground/90">
                  {row.label}
                </p>
              </div>
              <div className="px-5 py-5 md:px-8 md:py-6 border-l border-border/30 flex items-start gap-2.5">
                <X
                  size={14}
                  className="text-muted-foreground/40 mt-0.5 shrink-0"
                  strokeWidth={2.5}
                />
                <p className="text-[13px] text-muted-foreground/60 leading-relaxed">
                  {row.others}
                </p>
              </div>
              <div className="px-5 py-5 md:px-8 md:py-6 border-l border-border/30 bg-primary/[0.03] flex items-start gap-2.5">
                <Check
                  size={14}
                  className="text-primary mt-0.5 shrink-0"
                  strokeWidth={2.5}
                />
                <p className="text-[13px] text-foreground/80 leading-relaxed">
                  {row.relova}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
