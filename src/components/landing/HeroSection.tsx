import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const AVOID_ITEMS = [
  "Choosing the wrong country",
  "Wasting time and money",
  "Getting stuck in legal dead-ends",
];

const PLAN_ITEMS = [
  "Best country for your situation",
  "Step-by-step relocation path",
  "Real risks and costs",
];

export default function HeroSection() {
  return (
    <section className="relative pt-36 pb-20 md:pt-48 md:pb-24 bg-radial-glow overflow-hidden">
      <div
        className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(200_60%_52%/0.07)_0%,transparent_70%)] pointer-events-none"
      />
      <div className="container relative z-10">
        <div className="max-w-[680px] mx-auto text-center">
          {/* Headline */}
          <motion.h1
            className="text-[2.75rem] sm:text-[3.5rem] md:text-[4.25rem] font-extrabold leading-[0.95] tracking-[-0.04em] mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="text-gradient-hero">Know where to move.</span>
            <br />
            <span className="text-gradient-hero">Know exactly what to do next.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-[15px] md:text-[17px] text-muted-foreground leading-[1.65] max-w-[520px] mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            Get a clear relocation decision based on your passport, income, and goals.
          </motion.p>

          {/* Two columns: Avoid / Your plan */}
          <motion.div
            className="grid sm:grid-cols-2 gap-6 sm:gap-10 mb-10 text-left max-w-[520px] mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          >
            {/* Avoid */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-destructive/70 font-semibold mb-3">Avoid</p>
              <ul className="space-y-2.5">
                {AVOID_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-destructive/50 text-[10px] mt-1 shrink-0">✕</span>
                    <span className="text-[13px] text-muted-foreground leading-[1.5]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Your plan includes */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-primary/70 font-semibold mb-3">Your plan includes</p>
              <ul className="space-y-2.5">
                {PLAN_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-primary/60 text-[10px] mt-1 shrink-0">✓</span>
                    <span className="text-[13px] text-foreground/80 leading-[1.5]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
          >
            <Link to="/chat">
              <Button variant="hero" size="lg" className="gap-2.5 text-[14px] h-12 px-7 rounded-[10px]">
                Find my best country <ArrowRight size={15} strokeWidth={2.5} />
              </Button>
            </Link>
            <Link to="/countries">
              <Button variant="hero-outline" size="lg" className="text-[14px] h-12 px-7 rounded-[10px]">
                Explore countries
              </Button>
            </Link>
          </motion.div>

          {/* Urgency line */}
          <motion.p
            className="text-[12px] text-muted-foreground/45 leading-[1.7] max-w-[400px] mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
          >
            Most people lose 3–12 months choosing the wrong country.
            <br />
            Relova shows your best path instantly.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
