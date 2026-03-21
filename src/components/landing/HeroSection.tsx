import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative pt-40 pb-28 md:pt-52 md:pb-40 bg-radial-glow">
      <div className="container relative z-10">
        <div className="max-w-[680px]">
          <motion.h1
            className="text-[3rem] sm:text-[4rem] md:text-[4.75rem] font-extrabold leading-[0.95] tracking-[-0.04em] mb-7"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Stop guessing.
            <br />
            Start moving.
          </motion.h1>

          <motion.p
            className="text-[17px] md:text-[19px] text-muted-foreground leading-[1.6] max-w-[520px] mb-12"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            Relova turns international relocation into a clear, step-by-step plan — tailored to your passport, budget, and goals.
          </motion.p>

          <motion.div
            className="flex items-center gap-5"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/chat">
              <Button variant="hero" size="lg" className="gap-2.5 text-[14px] h-12 px-7 rounded-[10px]">
                Start your relocation plan <ArrowRight size={15} strokeWidth={2.5} />
              </Button>
            </Link>
            <span className="text-[13px] text-muted-foreground/70">Free to start. No credit card.</span>
          </motion.div>
        </div>

        {/* Product preview */}
        <motion.div
          className="mt-24 rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40"
          initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid md:grid-cols-5">
            {/* Chat side */}
            <div className="md:col-span-3 p-7 md:p-10 border-b md:border-b-0 md:border-r border-border/50">
              <p className="text-[11px] text-muted-foreground/60 mb-5 font-medium uppercase tracking-[0.15em]">AI Assistant</p>
              <div className="space-y-5">
                <div className="bg-muted/50 dark:bg-muted/30 rounded-xl px-5 py-3.5 max-w-[85%]">
                  <p className="text-[13px] text-muted-foreground">I want to move to Portugal as a freelancer. What visa do I need?</p>
                </div>
                <div className="bg-primary/8 dark:bg-primary/10 rounded-xl px-5 py-3.5">
                  <p className="text-[13px] text-foreground/85 leading-[1.7]">
                    For freelancers, Portugal offers the <span className="text-primary font-medium">D7 Passive Income Visa</span> or the <span className="text-primary font-medium">Digital Nomad Visa</span>. Based on your profile, the Digital Nomad Visa is likely your best path.
                  </p>
                </div>
              </div>
            </div>

            {/* Plan side */}
            <div className="md:col-span-2 p-7 md:p-10">
              <p className="text-[11px] text-muted-foreground/60 mb-5 font-medium uppercase tracking-[0.15em]">Your plan</p>
              <div className="space-y-3.5">
                {["Gather documents", "Apply for NIF number", "Open Portuguese bank account", "Submit visa application", "Book accommodation"].map((step, i) => (
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
