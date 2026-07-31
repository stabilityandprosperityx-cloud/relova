import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";

type CellValue = true | "—" | string;

const ROWS: { label: string; others: CellValue; lawyers: CellValue; relova: CellValue }[] = [
  { label: "AI-powered guidance",   others: "—",            lawyers: "—",               relova: true },
  { label: "Personalized plan",     others: "—",            lawyers: "Basic",            relova: true },
  { label: "Real-time updates",     others: "—",            lawyers: "—",               relova: true },
  { label: "Document automation",   others: "Limited",      lawyers: "Manual",           relova: true },
  { label: "Cost transparency",     others: "$$$",          lawyers: "Expensive",        relova: "$" },
  { label: "Affordable pricing",    others: "Expensive",    lawyers: "Expensive",        relova: true },
  { label: "24/7 support",          others: "Email only",   lawyers: "Business hours",   relova: true },
];

function Cell({ value, relova = false }: { value: CellValue; relova?: boolean }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "hsl(var(--primary) / 0.12)" }}
        >
          <Check size={11} className="text-primary" strokeWidth={2.8} />
        </div>
      </div>
    );
  }
  if (value === "—") {
    return (
      <div className="flex justify-center">
        <Minus size={14} className="text-muted-foreground/30" strokeWidth={2} />
      </div>
    );
  }
  return (
    <p className={`text-[12px] text-center leading-snug ${relova ? "text-primary font-semibold" : "text-muted-foreground/60"}`}>
      {value}
    </p>
  );
}

export default function ComparisonSection() {
  return (
    <section className="py-20 md:py-28 bg-background border-t border-border/50">
      <div className="container max-w-5xl px-5 md:px-8">

        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-4">
              Comparison
            </p>
            <h2 className="font-serif text-[2rem] sm:text-[2.4rem] md:text-[2.8rem] font-semibold leading-[1.08] text-foreground">
              Why Relova vs<br />everything else.
            </h2>
          </motion.div>
          <motion.p
            className="text-[15px] leading-[1.75] text-muted-foreground lg:pb-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Relova combines AI precision with human expertise — at a fraction of the cost.
          </motion.p>
        </div>

        {/* Comparison table */}
        <motion.div
          className="rounded-2xl border border-border overflow-hidden"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {/* Table header */}
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] border-b border-border bg-secondary/40">
            <div className="px-6 py-4" />
            {["Others", "Lawyers", "Relova"].map((col, i) => (
              <div
                key={col}
                className={`px-4 py-4 border-l border-border flex items-center justify-center ${i === 2 ? "bg-primary/5" : ""}`}
              >
                <span className={`text-[11px] font-semibold uppercase tracking-[0.1em] ${i === 2 ? "text-primary" : "text-muted-foreground/50"}`}>
                  {col}
                </span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1.6fr_1fr_1fr_1fr] border-t border-border/50 ${i % 2 === 1 ? "bg-secondary/20" : ""}`}
            >
              {/* Label */}
              <div className="px-6 py-4 flex items-center">
                <span className="text-[13px] font-medium text-foreground/85">{row.label}</span>
              </div>
              {/* Others */}
              <div className="px-4 py-4 border-l border-border/50 flex items-center justify-center">
                <Cell value={row.others} />
              </div>
              {/* Lawyers */}
              <div className="px-4 py-4 border-l border-border/50 flex items-center justify-center">
                <Cell value={row.lawyers} />
              </div>
              {/* Relova */}
              <div className="px-4 py-4 border-l border-border/50 bg-primary/[0.03] flex items-center justify-center">
                <Cell value={row.relova} relova />
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
