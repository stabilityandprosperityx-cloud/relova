import { motion } from "framer-motion";

interface Step {
  label: string;
  detail?: string;
}

interface ProcessFlowProps {
  steps: Step[];
  title?: string;
}

export default function ProcessFlow({ steps, title }: ProcessFlowProps) {
  return (
    <div className="my-10">
      {title && (
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary/60 mb-5">
          {title}
        </p>
      )}
      <div className="relative flex flex-col gap-0">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="relative flex items-start gap-4 pb-6 last:pb-0"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            {/* Vertical line + dot */}
            <div className="relative flex flex-col items-center">
              <div className="w-7 h-7 rounded-full border border-primary/25 bg-primary/5 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-medium text-primary/70">{i + 1}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 min-h-[16px] bg-gradient-to-b from-primary/20 to-transparent" />
              )}
            </div>

            {/* Content */}
            <div className="pt-1">
              <p className="text-sm font-medium text-foreground/90 leading-snug">{step.label}</p>
              {step.detail && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.detail}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
