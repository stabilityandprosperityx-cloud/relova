import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 md:pt-48 md:pb-24 bg-radial-glow overflow-hidden">
      <div
        className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(200_60%_52%/0.07)_0%,transparent_70%)] pointer-events-none"
      />
      <div className="container relative z-10 px-5 md:px-4">
        <div className="max-w-[680px] mx-auto text-center">
          {/* Headline */}
          <motion.h1
            className="text-[2rem] sm:text-[2.75rem] md:text-[4.25rem] font-extrabold leading-[1.1] sm:leading-[0.95] tracking-[-0.04em] mb-5 md:mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="text-gradient-hero">Your next country.</span>
            <br />
            <span className="text-gradient-hero">Your clearest path there.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-[14px] md:text-[17px] text-muted-foreground leading-[1.7] max-w-[480px] mx-auto mb-10 md:mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            Enter your passport and destination — get a personalized visa checklist, relocation plan, and cost breakdown in minutes.
          </motion.p>

          {/* CTA Buttons — full width on mobile */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
          >
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="gap-2.5 text-[14px] h-[52px] sm:h-12 px-7 rounded-[10px] w-full sm:w-auto">
                Get my plan — it's free <ArrowRight size={15} strokeWidth={2.5} />
              </Button>
            </Link>
            <Link to="/#product-tour" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="lg" className="text-[14px] h-[52px] sm:h-12 px-7 rounded-[10px] w-full sm:w-auto">
                See how it works
              </Button>
            </Link>
          </motion.div>

          {/* Urgency line */}
          <motion.p
            className="text-[11px] md:text-[12px] text-muted-foreground/45 leading-[1.7] max-w-[400px] mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
          >
            70 countries · Free to start · No credit card
          </motion.p>
        </div>
      </div>
    </section>
  );
}
