import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-36">
      <div className="container relative">
        <div className="max-w-2xl">
          <motion.h1
            className="text-[2.75rem] sm:text-[3.5rem] md:text-[4rem] font-bold leading-[1.05] tracking-[-0.035em] mb-6"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Stop guessing.
            <br />
            Start moving.
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg mb-10"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Relova turns international relocation into a clear, step-by-step plan — tailored to your passport, budget, and goals.
          </motion.p>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/chat">
              <Button size="lg" className="gap-2 text-[14px] h-11 px-6 rounded-lg">
                Start your relocation plan <ArrowRight size={15} />
              </Button>
            </Link>
            <span className="text-[13px] text-muted-foreground">Free to start. No credit card.</span>
          </motion.div>
        </div>

        {/* Product preview */}
        <motion.div
          className="mt-20 rounded-xl border border-border bg-card overflow-hidden"
          initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid md:grid-cols-5">
            {/* Chat side */}
            <div className="md:col-span-3 p-6 md:p-8 border-b md:border-b-0 md:border-r border-border">
              <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">AI Assistant</p>
              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg px-4 py-3 max-w-[85%]">
                  <p className="text-[13px] text-muted-foreground">I want to move to Portugal as a freelancer. What visa do I need?</p>
                </div>
                <div className="bg-primary/10 rounded-lg px-4 py-3">
                  <p className="text-[13px] text-foreground/90 leading-relaxed">
                    For freelancers, Portugal offers the <span className="text-primary font-medium">D7 Passive Income Visa</span> or the <span className="text-primary font-medium">Digital Nomad Visa</span>. Based on your profile, the Digital Nomad Visa is likely your best path. Here's what you need:
                  </p>
                </div>
              </div>
            </div>

            {/* Plan side */}
            <div className="md:col-span-2 p-6 md:p-8">
              <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">Your plan</p>
              <div className="space-y-3">
                {["Gather documents", "Apply for NIF number", "Open Portuguese bank account", "Submit visa application", "Book accommodation"].map((step, i) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${i < 2 ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      {i < 2 ? "✓" : i + 1}
                    </div>
                    <span className={`text-[13px] ${i < 2 ? "text-muted-foreground line-through" : "text-foreground/80"}`}>{step}</span>
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
