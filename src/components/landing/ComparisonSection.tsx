import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const comparisons = [
  { task: "Find visa options for your situation", old: "Hours of googling", us: "Instant AI analysis" },
  { task: "Understand tax implications", old: "Expensive consultations", us: "AI-powered guidance" },
  { task: "Get a relocation checklist", old: "Build your own spreadsheet", us: "Auto-generated plan" },
  { task: "Find trusted local lawyers", old: "Ask random forums", us: "Vetted marketplace" },
  { task: "Track your progress", old: "Scattered notes", us: "One dashboard" },
];

export default function ComparisonSection() {
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
            Why people switch to RelocateAI
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg">
            We replace the fragmented, stressful experience with clarity.
          </p>
        </motion.div>

        <motion.div
          className="rounded-xl border border-border overflow-hidden"
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-4 md:p-5 border-b border-border bg-card">
            <div className="text-sm font-medium text-muted-foreground">Task</div>
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <X size={14} className="text-destructive" /> The old way
            </div>
            <div className="text-sm font-medium flex items-center gap-1.5">
              <Check size={14} className="text-primary" /> RelocateAI
            </div>
          </div>

          {comparisons.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 gap-4 p-4 md:p-5 border-b border-border last:border-b-0 bg-card hover:bg-secondary/30 transition-colors"
            >
              <div className="text-sm font-medium">{row.task}</div>
              <div className="text-sm text-muted-foreground">{row.old}</div>
              <div className="text-sm text-primary font-medium">{row.us}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
