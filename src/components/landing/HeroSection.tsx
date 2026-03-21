import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const painPoints = [
  "Which visa do I actually qualify for?",
  "Do I need to translate every document?",
  "How do I open a bank account abroad?",
  "Will I lose my tax residency back home?",
  "Where do I even start?",
];

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative">
        <div className="max-w-3xl mx-auto">
          {/* Emotional hook — pain first */}
          <motion.p
            className="text-muted-foreground text-sm md:text-base mb-6 tracking-wide uppercase font-medium"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            For expats, nomads & entrepreneurs
          </motion.p>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold leading-[1.08] tracking-tight mb-6"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            Moving abroad shouldn't feel like{" "}
            <span className="text-gradient">solving a puzzle blindfolded.</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mb-10"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            RelocateAI turns the chaos of international relocation into a clear, step-by-step plan — visas, documents, housing, taxes — all handled by AI that actually understands immigration.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-start gap-3 mb-16"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/chat">
              <Button variant="hero" size="lg" className="gap-2 text-base px-7 h-12">
                Start your relocation plan <ArrowRight size={16} />
              </Button>
            </Link>
            <span className="text-xs text-muted-foreground mt-3 sm:mt-4">Free to start · No credit card required</span>
          </motion.div>

          {/* Pain point ticker — emotional resonance */}
          <motion.div
            className="border-t border-border pt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-5 font-medium">
              Sound familiar?
            </p>
            <div className="flex flex-wrap gap-2">
              {painPoints.map((point, i) => (
                <motion.span
                  key={point}
                  className="inline-block px-3.5 py-2 rounded-lg border border-border text-sm text-muted-foreground bg-card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  {point}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
