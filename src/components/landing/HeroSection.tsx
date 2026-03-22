import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import RelovaLogo from "@/components/RelovaLogo";
import { useRef } from "react";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={sectionRef} className="relative pt-40 pb-28 md:pt-52 md:pb-40 bg-radial-glow overflow-hidden">
      {/* Parallax radial light behind headline */}
      <motion.div
        className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(200_60%_52%/0.07)_0%,transparent_70%)] pointer-events-none"
        style={{ y: glowY, opacity: glowOpacity }}
      />
      <div className="container relative z-10">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <RelovaLogo size={48} className="text-primary" glow />
        </motion.div>
        <div className="max-w-[720px]">
          <motion.h1
            className="text-[3rem] sm:text-[4rem] md:text-[5rem] font-extrabold leading-[0.92] tracking-[-0.04em] mb-7"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-gradient-hero">Know where to move.</span>
            <br />
            <span className="text-gradient-hero">Know how to do it.</span>
          </motion.h1>

          <motion.p
            className="text-[17px] md:text-[19px] text-muted-foreground leading-[1.65] max-w-[540px] mb-12"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            Get a clear country decision and a step-by-step relocation plan — tailored to your life.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/chat">
              <Button variant="hero" size="lg" className="gap-2.5 text-[14px] h-12 px-7 rounded-[10px]">
                Get my plan <ArrowRight size={15} strokeWidth={2.5} />
              </Button>
            </Link>
            <Link to="/chat">
              <Button variant="hero-outline" size="lg" className="text-[14px] h-12 px-7 rounded-[10px]">
                Explore countries
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Product preview — minimal AI interface mock */}
        <motion.div
          className="mt-24 rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40"
          initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid md:grid-cols-5">
            {/* Chat side */}
            <div className="md:col-span-3 p-7 md:p-10 border-b md:border-b-0 md:border-r border-border/50">
              <p className="text-[11px] text-muted-foreground/60 mb-5 font-medium uppercase tracking-[0.15em]">Relova AI</p>
              <div className="space-y-5">
                <div className="bg-muted/50 dark:bg-muted/30 rounded-xl px-5 py-3.5 max-w-[85%]">
                  <p className="text-[13px] text-muted-foreground">Where should I move based on my income and goals?</p>
                </div>
                <div className="bg-primary/8 dark:bg-primary/10 rounded-xl px-5 py-3.5">
                  <p className="text-[13px] text-foreground/85 leading-[1.7]">
                    Based on your profile, <span className="text-primary font-medium">Portugal</span> is a strong option. You qualify for the <span className="text-primary font-medium">D7 or Digital Nomad visa</span>. Here's the most efficient path forward.
                  </p>
                  <p className="text-[12px] text-muted-foreground/60 mt-2 font-mono">Estimated timeline: 3–5 months</p>
                </div>
              </div>
            </div>

            {/* Plan side */}
            <div className="md:col-span-2 p-7 md:p-10">
              <p className="text-[11px] text-muted-foreground/60 mb-5 font-medium uppercase tracking-[0.15em]">Your personalized relocation plan</p>
              <div className="space-y-3.5">
                {["Select the right visa for your situation", "Prepare required documents (with exact checklist)", "Get your tax number (NIF)", "Open a bank account", "Submit your application"].map((step, i) => (
                  <div key={step} className="flex items-start gap-3.5">
                    <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${i < 2 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground/60"}`}>
                      {i < 2 ? "✓" : i + 1}
                    </div>
                    <span className={`text-[13px] ${i < 2 ? "text-muted-foreground line-through decoration-muted-foreground/30" : "text-foreground/75"}`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
