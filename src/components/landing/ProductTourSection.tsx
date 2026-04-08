import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/* ─── tour data ─── */
const steps = [
  {
    label: "Quick onboarding",
    title: "Answer a few questions",
    description: "Tell us your passport, goals, income, and dealbreakers. Takes 2 minutes.",
  },
  {
    label: "AI matching",
    title: "We match you with countries",
    description: "Our engine scores every country against your profile and filters out the impossible.",
  },
  {
    label: "Country results",
    title: "See your ranked matches",
    description: "Spain 100% match. Montenegro 97%. Each with visa difficulty and time to stability.",
  },
  {
    label: "Best path found",
    title: "Your best path is chosen",
    description: "We pick your top match and explain exactly why it fits your situation.",
  },
  {
    label: "Dashboard overview",
    title: "Your personalized dashboard",
    description: "Your relocation path, progress tracker, and next steps — all in one place.",
  },
  {
    label: "Your plan",
    title: "Step-by-step relocation plan",
    description: "51 steps organized by phase: Preparation → Arrival → Settling in → Stability.",
  },
  {
    label: "AI Advisor",
    title: "Ask your AI advisor anything",
    description: "Ask visa questions, get document checklists, understand requirements. Unlimited with Pro.",
  },
];

/* ─── cursor positions per step (% from top-left of frame) ─── */
const cursorPositions = [
  { x: 50, y: 45 },
  { x: 38, y: 55 },
  { x: 65, y: 42 },
  { x: 50, y: 72 },
  { x: 35, y: 38 },
  { x: 45, y: 50 },
  { x: 50, y: 78 },
];

/* ─── mock screens ─── */
function StepScreen({ step }: { step: number }) {
  switch (step) {
    case 0:
      return <OnboardingScreen />;
    case 1:
      return <GoalsScreen />;
    case 2:
      return <ResultsListScreen />;
    case 3:
      return <BestPathScreen />;
    case 4:
      return <DashboardScreen />;
    case 5:
      return <PlanScreen />;
    case 6:
      return <AdvisorScreen />;
    default:
      return null;
  }
}

/* ── shared styles ── */
const cardBg = "bg-[#111113] border border-white/[0.06] rounded-lg";
const labelCyan = "text-[#38bdf8]";

function OnboardingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-3">Step 1 of 6</p>
      <h3 className="text-[15px] sm:text-[18px] font-semibold text-white mb-5">What's your passport?</h3>
      <div className={`${cardBg} w-full max-w-[260px] p-3`}>
        <div className="flex items-center gap-2 mb-2 border-b border-white/[0.06] pb-2">
          <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <span className="text-[12px] text-white/60">Search countries...</span>
        </div>
        {["🇺🇸 United States", "🇬🇧 United Kingdom", "🇷🇺 Russia", "🇩🇪 Germany"].map((c, i) => (
          <div key={c} className={`text-[11px] py-1.5 px-2 rounded ${i === 2 ? "bg-[#38bdf8]/15 text-[#38bdf8]" : "text-white/50"}`}>{c}</div>
        ))}
      </div>
    </div>
  );
}

function GoalsScreen() {
  const goals = [
    { emoji: "🛡", label: "Safety", active: false },
    { emoji: "💰", label: "Money", active: false },
    { emoji: "🌱", label: "Better Life", active: true },
    { emoji: "🕊", label: "Freedom", active: true },
    { emoji: "👨‍👩‍👧", label: "Family", active: false },
    { emoji: "🔄", label: "Reset", active: false },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-3">Step 4 of 6</p>
      <h3 className="text-[15px] sm:text-[18px] font-semibold text-white mb-5">What matters most?</h3>
      <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
        {goals.map(g => (
          <div key={g.label} className={`${cardBg} flex flex-col items-center py-3 px-2 text-center transition-all ${g.active ? "!border-[#38bdf8]/50 bg-[#38bdf8]/10 shadow-[0_0_12px_-4px_#38bdf8]" : ""}`}>
            <span className="text-[18px] mb-1">{g.emoji}</span>
            <span className={`text-[10px] font-medium ${g.active ? "text-[#38bdf8]" : "text-white/50"}`}>{g.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsListScreen() {
  const countries = [
    { flag: "🇪🇸", name: "Spain", score: 100 },
    { flag: "🇲🇪", name: "Montenegro", score: 97 },
    { flag: "🇹🇷", name: "Turkey", score: 93 },
    { flag: "🇬🇪", name: "Georgia", score: 92 },
  ];
  return (
    <div className="flex flex-col h-full px-4 sm:px-6 py-4">
      <h3 className="text-[14px] sm:text-[16px] font-semibold text-white mb-4">Your top matches</h3>
      <div className="space-y-2 flex-1">
        {countries.map((c, i) => (
          <div key={c.name} className={`${cardBg} flex items-center justify-between p-3`}>
            <div className="flex items-center gap-2.5">
              <span className="text-[18px]">{c.flag}</span>
              <div>
                <span className="text-[12px] font-medium text-white">{c.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-14 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-[#38bdf8]" style={{ width: `${c.score}%` }} />
                  </div>
                  <span className={`text-[10px] font-mono font-medium ${labelCyan}`}>{c.score}%</span>
                </div>
              </div>
            </div>
            {i === 0 && (
              <div className="text-[9px] font-medium bg-[#38bdf8] text-black px-2 py-0.5 rounded-full">Build my plan</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BestPathScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-4">We found your best path</p>
      <span className="text-[36px] mb-2">🇪🇸</span>
      <h3 className="text-[18px] sm:text-[22px] font-bold text-white mb-1">Spain</h3>
      <div className={`text-[11px] font-mono font-semibold ${labelCyan} mb-4`}>100% match</div>
      <div className="flex gap-4 text-[10px] text-white/40 mb-5">
        <div><span className="block text-white/60 font-medium">Stability</span>4-8 months</div>
        <div className="w-px bg-white/10" />
        <div><span className="block text-white/60 font-medium">Visa difficulty</span>Medium</div>
      </div>
      <div className="bg-[#38bdf8] text-black text-[11px] font-semibold px-5 py-1.5 rounded-md">See my plan →</div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="flex flex-col h-full px-4 sm:px-5 py-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[20px]">🇪🇸</span>
        <div>
          <h3 className="text-[14px] font-semibold text-white">Spain</h3>
          <p className="text-[9px] text-white/40">Non-Lucrative Visa</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[["STABILITY", "4-8 mo"], ["RISK", "Medium"], ["PATH", "Freedom"]].map(([k, v]) => (
          <div key={k} className={`${cardBg} p-2 text-center`}>
            <p className="text-[8px] text-white/30 uppercase tracking-wider">{k}</p>
            <p className="text-[11px] font-medium text-white mt-0.5">{v}</p>
          </div>
        ))}
      </div>
      <div className={`${cardBg} p-3 mb-3`}>
        <div className="flex justify-between text-[10px] mb-1.5">
          <span className="text-white/50">Progress</span>
          <span className={`font-mono ${labelCyan}`}>Step 1 of 51</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-[#38bdf8] w-[2%]" />
        </div>
      </div>
      <div className={`${cardBg} p-3`}>
        <p className="text-[10px] text-white/40 mb-2 font-medium">What to do next</p>
        <div className="space-y-1.5">
          {["Research entry requirements", "Collect passport copies"].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border border-white/15" />
              <span className="text-[10px] text-white/60">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanScreen() {
  return (
    <div className="flex flex-col h-full px-4 sm:px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Your Journey</h3>
        <span className={`text-[10px] font-mono ${labelCyan}`}>0/17 completed</span>
      </div>
      {/* phases */}
      <div className="flex gap-1.5 mb-4">
        {["Preparation", "Arrival", "Settling in", "Stability"].map((p, i) => (
          <div key={p} className={`text-[8px] px-2 py-1 rounded-full font-medium ${i === 0 ? "bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30" : "bg-white/5 text-white/30"}`}>{p}</div>
        ))}
      </div>
      <div className="space-y-2 flex-1">
        {[
          { n: 1, t: "Research entry requirements", done: false },
          { n: 2, t: "Prepare travel documents", done: false },
          { n: 3, t: "Book initial accommodation", done: false },
          { n: 4, t: "Open a bank account remotely", done: false },
        ].map(s => (
          <div key={s.n} className={`${cardBg} flex items-center gap-3 p-3`}>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-mono ${s.done ? "bg-[#38bdf8] border-[#38bdf8] text-black" : "border-white/15 text-white/30"}`}>{s.n}</div>
            <span className="text-[11px] text-white/70">{s.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdvisorScreen() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-4 sm:px-5 py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-[#38bdf8]/20 flex items-center justify-center text-[10px]">🤖</div>
          <span className="text-[12px] font-medium text-white">AI Advisor</span>
        </div>
        <div className={`${cardBg} p-3 max-w-[85%]`}>
          <p className="text-[11px] text-white/70 leading-relaxed">
            Your path to Spain is set. Ask me anything about your next steps, visa process, or documents.
          </p>
        </div>
        <div className={`${cardBg} p-3 max-w-[75%] mt-3 ml-auto`}>
          <p className="text-[11px] text-[#38bdf8]/80 leading-relaxed">
            What documents do I need for the Non-Lucrative Visa?
          </p>
        </div>
      </div>
      <div className="px-4 sm:px-5 pb-4">
        <div className={`${cardBg} flex items-center gap-2 p-2.5`}>
          <span className="text-[11px] text-white/30 flex-1">Ask anything about your relocation…</span>
          <div className="w-6 h-6 rounded-md bg-[#38bdf8] flex items-center justify-center">
            <ArrowRight className="w-3 h-3 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── animated cursor ─── */
function AnimatedCursor({ x, y, clicking }: { x: number; y: number; clicking: boolean }) {
  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      {/* cursor dot */}
      <div className="relative">
        <div className="w-3 h-3 rounded-full bg-[#38bdf8] shadow-[0_0_10px_2px_#38bdf8aa]" />
        {clicking && (
          <motion.div
            className="absolute inset-0 w-3 h-3 rounded-full border border-[#38bdf8]"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>
    </motion.div>
  );
}

/* ─── main section ─── */
export default function ProductTourSection() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [clicking, setClicking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setActive(p => (p + 1) % steps.length);
    setClicking(true);
    setTimeout(() => setClicking(false), 500);
  }, []);

  /* auto-advance */
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(advance, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, advance]);

  const goTo = (i: number) => {
    setActive(i);
    setClicking(true);
    setTimeout(() => setClicking(false), 500);
    /* reset timer */
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused) {
      timerRef.current = setInterval(advance, 3500);
    }
  };

  const step = steps[active];
  const cursor = cursorPositions[active];

  return (
    <section className="py-16 md:py-24 border-t border-border/40">
      <div className="container max-w-6xl">
        {/* header */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[11px] text-muted-foreground/60 mb-3 uppercase tracking-[0.15em] font-medium">Product tour</p>
          <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight mb-3">See how it works</h2>
          <p className="text-[14px] sm:text-[16px] text-muted-foreground max-w-lg mx-auto">
            From confusion to your personalized relocation plan — in minutes
          </p>
        </motion.div>

        {/* main content: text + frame */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* left text panel */}
          <div className="lg:w-[260px] shrink-0 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, delay: 0.15 }}
              >
                <span className={`text-[12px] font-mono font-medium ${labelCyan}`}>
                  {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                </span>
                <h3 className="text-[20px] sm:text-[22px] font-semibold mt-2 mb-2 tracking-tight text-foreground">{step.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* browser frame */}
          <div
            className="flex-1 order-1 lg:order-2 w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] shadow-[0_0_60px_-20px_#38bdf855] overflow-hidden">
              {/* title bar */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                {/* progress bar */}
                <div className="ml-4 flex-1 h-1 rounded-full bg-white/[0.04] overflow-hidden max-w-[200px]">
                  <motion.div
                    className="h-full rounded-full bg-[#38bdf8]/60"
                    animate={{ width: `${((active + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
              {/* screen */}
              <div className="relative h-[300px] sm:h-[360px] md:h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    className="absolute inset-0"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <StepScreen step={active} />
                  </motion.div>
                </AnimatePresence>
                <AnimatedCursor x={cursor.x} y={cursor.y} clicking={clicking} />
              </div>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative text-[11px] sm:text-[12px] font-medium px-3 sm:px-4 py-1.5 rounded-full transition-all duration-300 ${
                i === active
                  ? "bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30"
                  : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60 hover:border-white/[0.12]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Button variant="hero" size="lg" asChild>
            <Link to="/chat">
              Try it yourself <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
