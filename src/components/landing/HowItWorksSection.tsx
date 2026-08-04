import { motion } from "framer-motion";
import { UserCircle, Sparkles, CheckSquare, Flag } from "lucide-react";

const STEPS = [
  {
    n: 1,
    icon: UserCircle,
    title: "Tell us about you",
    desc: "Share your goals, budget, and preferences.",
  },
  {
    n: 2,
    icon: Sparkles,
    title: "Get your plan",
    desc: "Relova builds your personalized relocation plan.",
  },
  {
    n: 3,
    icon: CheckSquare,
    title: "Take action",
    desc: "Follow your checklist and we'll handle the complex stuff.",
  },
  {
    n: 4,
    icon: Flag,
    title: "Move with confidence",
    desc: "Arrive prepared and start your new chapter.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-background border-t border-border/50">
      <div className="container max-w-6xl px-5 md:px-8">

        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-14 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-4">
              How it works
            </p>
            <h2 className="font-serif text-[2rem] sm:text-[2.4rem] md:text-[2.8rem] font-semibold leading-[1.1] text-foreground">
              Your new life,<br />step by step.
            </h2>
          </motion.div>
          <motion.p
            className="text-[15px] leading-[1.75] text-muted-foreground lg:pb-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Relocation made simple.
          </motion.p>
        </div>

        {/* Steps row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">

          {/* Connector line — desktop only */}
          <div
            className="absolute hidden lg:block top-[28px] left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px pointer-events-none"
            style={{
              background: "repeating-linear-gradient(90deg, hsl(var(--primary) / 0.3) 0, hsl(var(--primary) / 0.3) 6px, transparent 6px, transparent 14px)",
            }}
          />

          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.n}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
              >
                {/* Icon circle */}
                <div className="relative mb-5 z-10">
                  {/* Outer ring */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: "hsl(var(--card))",
                      border: "2px solid hsl(var(--primary) / 0.25)",
                      boxShadow: "0 0 0 6px hsl(var(--primary) / 0.06)",
                    }}
                  >
                    <Icon size={22} className="text-primary" strokeWidth={1.6} />
                  </div>
                  {/* Step number badge */}
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: "hsl(var(--primary))" }}
                  >
                    {s.n}
                  </div>
                </div>

                <h3 className="text-[15px] font-semibold text-foreground mb-2 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-[1.65] max-w-[180px]">
                  {s.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
