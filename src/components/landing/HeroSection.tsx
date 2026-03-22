import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RelovaLogo from "@/components/RelovaLogo";
import { useState, useEffect, useCallback } from "react";

const AI_STEPS = [
  "Step 1 — Choose visa type",
  "Step 2 — Prepare documents",
  "Step 3 — Apply at consulate",
  "Step 4 — Get residency permit",
];

const AI_INTRO = "Portugal offers 2 main options:";
const AI_OPTIONS = ["D7 Passive Income Visa", "Digital Nomad Visa"];
const AI_BRIDGE = "Based on a typical remote profile:";
const AI_TIMELINE = "Estimated timeline: 2–4 months";
const USER_Q = "How can I move to Portugal as a remote worker?";

function useTypingLoop() {
  const [phase, setPhase] = useState<"user" | "intro" | "options" | "bridge" | "steps" | "timeline" | "done">("user");
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [currentText, setCurrentText] = useState("");

  const reset = useCallback(() => {
    setPhase("user");
    setVisibleSteps(0);
    setTypedChars(0);
    setCurrentText("");
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "user") {
      timer = setTimeout(() => setPhase("intro"), 600);
    } else if (phase === "intro") {
      if (typedChars < AI_INTRO.length) {
        timer = setTimeout(() => {
          setTypedChars((c) => c + 1);
          setCurrentText(AI_INTRO.slice(0, typedChars + 1));
        }, 18);
      } else {
        timer = setTimeout(() => {
          setPhase("options");
          setTypedChars(0);
          setCurrentText("");
        }, 200);
      }
    } else if (phase === "options") {
      timer = setTimeout(() => {
        setPhase("bridge");
        setTypedChars(0);
      }, 400);
    } else if (phase === "bridge") {
      if (typedChars < AI_BRIDGE.length) {
        timer = setTimeout(() => {
          setTypedChars((c) => c + 1);
          setCurrentText(AI_BRIDGE.slice(0, typedChars + 1));
        }, 18);
      } else {
        timer = setTimeout(() => {
          setPhase("steps");
          setTypedChars(0);
          setCurrentText("");
        }, 200);
      }
    } else if (phase === "steps") {
      if (visibleSteps < AI_STEPS.length) {
        timer = setTimeout(() => setVisibleSteps((s) => s + 1), 350);
      } else {
        timer = setTimeout(() => setPhase("timeline"), 300);
      }
    } else if (phase === "timeline") {
      timer = setTimeout(() => setPhase("done"), 100);
    } else if (phase === "done") {
      timer = setTimeout(reset, 4000);
    }

    return () => clearTimeout(timer);
  }, [phase, typedChars, visibleSteps, reset]);

  return { phase, currentText, visibleSteps };
}

function ProductPreview() {
  const { phase, currentText, visibleSteps } = useTypingLoop();
  const showAI = phase !== "user";

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40 hover:shadow-[0_8px_40px_-8px_hsl(0_0%_0%/0.35)] transition-shadow duration-500">
      {/* Top bar */}
      <div className="px-5 py-3 border-b border-border/40 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary/50" />
        <span className="text-[10px] text-muted-foreground/50 font-medium tracking-wide">Relova AI</span>
        <div className="ml-auto flex gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-4 min-h-[320px] md:min-h-[360px]">
        {/* User message */}
        <motion.div
          className="bg-muted/50 dark:bg-muted/30 rounded-xl px-4 py-3 max-w-[90%]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-[12px] md:text-[13px] text-muted-foreground">{USER_Q}</p>
        </motion.div>

        {/* AI response */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              className="bg-primary/5 dark:bg-primary/8 rounded-xl px-4 py-4 space-y-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {showAI && (
                <p className="text-[12px] md:text-[13px] text-foreground/85 leading-[1.7]">
                  {phase === "intro" ? currentText : AI_INTRO}
                  {phase === "intro" && (
                    <span className="inline-block w-[1px] h-3.5 bg-primary/70 ml-0.5 animate-pulse" />
                  )}
                </p>
              )}

              {["options", "bridge", "steps", "timeline", "done"].includes(phase) && (
                <div className="space-y-1 pl-1">
                  {AI_OPTIONS.map((opt, i) => (
                    <motion.div
                      key={opt}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12, duration: 0.25 }}
                    >
                      <span className="text-primary text-[10px]">●</span>
                      <span className="text-[12px] md:text-[13px] text-foreground/80">{opt}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {["bridge", "steps", "timeline", "done"].includes(phase) && (
                <p className="text-[12px] md:text-[13px] text-foreground/70 leading-[1.7] pt-1">
                  {phase === "bridge" ? currentText : AI_BRIDGE}
                  {phase === "bridge" && (
                    <span className="inline-block w-[1px] h-3.5 bg-primary/70 ml-0.5 animate-pulse" />
                  )}
                </p>
              )}

              {["steps", "timeline", "done"].includes(phase) && (
                <div className="space-y-1.5 pl-1">
                  {AI_STEPS.slice(0, visibleSteps).map((step, i) => (
                    <motion.div
                      key={step}
                      className="flex items-start gap-2.5"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <span className="text-[10px] font-mono text-primary/60 mt-0.5 shrink-0">{`0${i + 1}`}</span>
                      <span className="text-[12px] md:text-[13px] text-foreground/75">{step}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {["timeline", "done"].includes(phase) && (
                <motion.p
                  className="text-[11px] font-mono text-muted-foreground/50 pt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {AI_TIMELINE}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 mt-auto">
          <span className="text-[11px] text-muted-foreground/30">Ask anything about relocation...</span>
          <span className="ml-auto inline-block w-[1px] h-3.5 bg-muted-foreground/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative pt-40 pb-20 md:pt-52 md:pb-20 bg-radial-glow overflow-hidden">
      <div
        className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(200_60%_52%/0.07)_0%,transparent_70%)] pointer-events-none"
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

        <div className="grid md:grid-cols-2 gap-16 md:gap-12 items-start">
          {/* Left — Copy */}
          <div className="max-w-[540px]">
            <motion.h1
              className="text-[3rem] sm:text-[4rem] md:text-[4.5rem] font-extrabold leading-[0.92] tracking-[-0.04em] mb-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <span className="text-gradient-hero">Know where to move.</span>
              <br />
              <span className="text-gradient-hero">Know how to do it.</span>
            </motion.h1>

            <motion.p
              className="text-[16px] md:text-[18px] text-muted-foreground leading-[1.65] max-w-[460px] mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            >
              Get a clear country decision and a step-by-step relocation plan — tailored to your life.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
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

          {/* Right — Product preview */}
          <motion.div
            className="md:mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          >
            <ProductPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
