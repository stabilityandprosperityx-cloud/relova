import { motion } from "framer-motion";
import { Check } from "lucide-react";
import ChatWidget from "@/components/chat/ChatWidget";
import demoLifestyle from "@/assets/redesign/demo-lifestyle.jpg";

const BENEFITS = [
  "Instant answers",
  "Personalized advice",
  "Expert-backed guidance",
];

export default function DemoSection() {
  return (
    <section className="py-20 md:py-28 bg-background border-t border-border/50">
      <div className="container max-w-6xl px-5 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.6fr_0.6fr] gap-10 lg:gap-10 items-center">

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-4">
              AI Advisor Demo
            </p>
            <h2 className="font-serif text-[2rem] sm:text-[2.4rem] md:text-[2.8rem] font-semibold leading-[1.1] mb-5 text-foreground">
              Ask. Plan. Move.
            </h2>
            <p className="text-[15px] leading-[1.7] text-muted-foreground mb-8">
              Your AI Advisor is here 24/7 to guide you.
            </p>

            <ul className="space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(var(--primary) / 0.10)" }}
                  >
                    <Check size={11} className="text-primary" strokeWidth={2.8} />
                  </div>
                  <span className="text-[14px] text-foreground/80">{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — chat widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div
              className="rounded-2xl overflow-hidden border border-border bg-card"
              style={{ boxShadow: "0 16px 60px rgba(0,0,0,0.09)" }}
            >
              <ChatWidget maxHeight="420px" />
            </div>
          </motion.div>

          {/* Right — lifestyle photo */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-[380px] h-[420px] overflow-hidden flex-shrink-0">
              <img
                src={demoLifestyle}
                alt="Person using Relova AI advisor on a laptop in a cozy home setting"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
