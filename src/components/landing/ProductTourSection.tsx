import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/* ─── tour data ─── */
const steps = [
  { label: "AI Advisor", title: "Ask anything about your move", description: "Tell it your passport, destination, and situation. Get a specific answer — not generic advice." },
  { label: "Your Plan", title: "Step-by-step relocation plan", description: "51 steps organized by phase: Preparation → Arrival → Settling in → Stability. Always know what's next." },
  { label: "Cost Calculator", title: "Know exactly what you'll spend", description: "Real cost data for 70 countries. Rent, food, insurance, visa fees — broken down for your family situation." },
  { label: "Countries", title: "Explore and compare 50+ countries", description: "Filter by region, visa type, cost, and climate. See stability timelines, risks, and residency paths." },
  { label: "Visa Letter", title: "Generate your visa cover letter", description: "Fill in your details, get a ready-to-submit cover letter in minutes. Included in Full plan." },
];

/* ─── cursor positions per step (% from top-left of frame) ─── */
const cursorPositions = [
  { x: 50, y: 75 },
  { x: 45, y: 50 },
  { x: 60, y: 45 },
  { x: 40, y: 55 },
  { x: 50, y: 60 },
];

/* ── shared styles ── */
const cardBg = "bg-[#111113] border border-white/[0.06] rounded-lg";
const labelCyan = "text-[#38bdf8]";

function StepScreen0_Advisor() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 sm:px-5 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
        <span className="text-[12px] font-medium text-white">Relova Advisor</span>
        <span className="text-[10px] text-white/30 ml-auto">Online</span>
      </div>
      <div className="flex-1 px-4 sm:px-5 py-3 space-y-3 overflow-hidden">
        <div className={`${cardBg} p-3 max-w-[85%]`}>
          <p className="text-[11px] text-white/70 leading-relaxed">I see you're planning to move from Russia to Portugal. The D7 Passive Income Visa looks like your best path. Want me to walk you through the requirements?</p>
        </div>
        <div className={`${cardBg} p-3 max-w-[75%] ml-auto bg-[#38bdf8]/10 border-[#38bdf8]/20`}>
          <p className="text-[11px] text-[#38bdf8]/90 leading-relaxed">Yes — what documents do I need?</p>
        </div>
        <div className={`${cardBg} p-3 max-w-[85%]`}>
          <p className="text-[11px] text-white/70 leading-relaxed">You'll need: proof of passive income ($1,500+/mo), health insurance, criminal record certificate (apostilled), and proof of accommodation in Portugal.</p>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]/60 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]/60 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-5 pb-4">
        <div className={`${cardBg} flex items-center gap-2 p-2.5`}>
          <span className="text-[11px] text-white/30 flex-1">Ask about visas, costs, documents...</span>
          <div className="w-6 h-6 rounded-md bg-[#38bdf8] flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepScreen1_Plan() {
  return (
    <div className="flex flex-col h-full px-4 sm:px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[13px] font-semibold text-white">Your Relocation Plan</h3>
          <p className="text-[10px] text-white/40 mt-0.5">🇵🇹 Portugal · D7 Visa</p>
        </div>
        <span className={`text-[10px] font-mono ${labelCyan}`}>Step 3 of 51</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
        <div className="h-full rounded-full bg-[#38bdf8] w-[6%]" />
      </div>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {["Preparation", "Arrival", "Settling in", "Stability"].map((p, i) => (
          <div key={p} className={`text-[8px] px-2 py-1 rounded-full font-medium ${i === 0 ? "bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30" : "bg-white/5 text-white/30"}`}>{p}</div>
        ))}
      </div>
      <div className="space-y-2">
        {[
          { n: 1, t: "Research visa requirements", status: "Done", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
          { n: 2, t: "Apostille your documents", status: "Done", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
          { n: 3, t: "Get health insurance quote", status: "In progress", color: "text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20" },
          { n: 4, t: "Book initial accommodation", status: "Upcoming", color: "text-white/30 bg-white/5 border-white/10" },
        ].map(s => (
          <div key={s.n} className={`${cardBg} flex items-center gap-3 p-2.5`}>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-mono shrink-0 ${s.status === "Done" ? "bg-emerald-400/20 border-emerald-400/40 text-emerald-400" : s.status === "In progress" ? "bg-[#38bdf8]/20 border-[#38bdf8]/40 text-[#38bdf8]" : "border-white/15 text-white/30"}`}>{s.n}</div>
            <span className="text-[11px] text-white/70 flex-1">{s.t}</span>
            <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${s.color}`}>{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepScreen2_Calculator() {
  return (
    <div className="flex flex-col h-full px-4 sm:px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-white">Monthly Cost Estimate</h3>
        <div className={`${cardBg} flex items-center gap-1.5 px-2.5 py-1.5`}>
          <span className="text-[11px] text-white/70">🇵🇹 Portugal</span>
          <span className={`text-[10px] ${labelCyan}`}>▾</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[["Rent", "$950", "/mo"], ["Food", "$380", "/mo"], ["Insurance", "$120", "/mo"]].map(([k, v, u]) => (
          <div key={k} className={`${cardBg} p-3 text-center`}>
            <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">{k}</p>
            <p className={`text-[16px] font-bold ${labelCyan}`}>{v}</p>
            <p className="text-[9px] text-white/30">{u}</p>
          </div>
        ))}
      </div>
      <div className={`${cardBg} p-3 mb-3`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] text-white/50">Total monthly</span>
          <span className="text-[15px] font-bold text-white">$1,820</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-white/50">vs your budget</span>
          <span className="text-[11px] text-emerald-400 font-medium">✓ Comfortable</span>
        </div>
      </div>
      <div className={`${cardBg} p-3`}>
        <p className="text-[10px] text-white/40 mb-2">Family status</p>
        <div className="flex gap-2">
          {["Solo", "Couple", "Family"].map((f, i) => (
            <div key={f} className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${i === 0 ? "bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30" : "bg-white/5 text-white/30 border-white/10"}`}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepScreen3_Countries() {
  const countries = [
    { flag: "🇵🇹", name: "Portugal", visa: "D7", cost: "$$$", region: "Europe" },
    { flag: "🇬🇪", name: "Georgia", visa: "Remote", cost: "$", region: "Asia" },
    { flag: "🇦🇪", name: "UAE", visa: "Freelance", cost: "$$$$", region: "Middle East" },
    { flag: "🇹🇭", name: "Thailand", visa: "LTR", cost: "$$", region: "Asia" },
    { flag: "🇪🇸", name: "Spain", visa: "DN", cost: "$$$", region: "Europe" },
    { flag: "🇲🇽", name: "Mexico", visa: "Temp Res", cost: "$$", region: "Americas" },
  ];
  return (
    <div className="flex flex-col h-full px-4 sm:px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`${cardBg} flex items-center gap-1.5 px-2.5 py-1.5 flex-1`}>
          <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <span className="text-[11px] text-white/30">Search countries...</span>
        </div>
        <div className={`${cardBg} px-2.5 py-1.5`}>
          <span className="text-[10px] text-white/40">All regions ▾</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {countries.map((c, i) => (
          <div key={c.name} className={`${cardBg} p-2.5 flex items-center gap-2 ${i === 0 ? "border-[#38bdf8]/30 bg-[#38bdf8]/5" : ""}`}>
            <span className="text-[18px]">{c.flag}</span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-white truncate">{c.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[8px] px-1.5 py-0.5 rounded border ${i === 0 ? "text-[#38bdf8] border-[#38bdf8]/30 bg-[#38bdf8]/10" : "text-white/30 border-white/10"}`}>{c.visa}</span>
                <span className="text-[9px] text-white/30">{c.cost}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepScreen4_VisaLetter() {
  return (
    <div className="flex flex-col h-full px-4 sm:px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-white">Visa Cover Letter</h3>
        <span className="text-[9px] font-medium bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 px-2 py-0.5 rounded-full">Full plan</span>
      </div>
      <div className={`${cardBg} p-3 mb-3 flex-1`}>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.06]">
          <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[10px]">📄</div>
          <div>
            <p className="text-[11px] font-medium text-white">Portugal D7 Visa — Cover Letter</p>
            <p className="text-[9px] text-white/30">Generated · Ready to submit</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 rounded-full bg-white/10 w-full" />
          <div className="h-2 rounded-full bg-white/10 w-[90%]" />
          <div className="h-2 rounded-full bg-white/10 w-[95%]" />
          <div className="h-2 rounded-full bg-white/[0.05] w-[70%]" />
          <div className="mt-2 h-2 rounded-full bg-white/10 w-full" />
          <div className="h-2 rounded-full bg-white/10 w-[85%]" />
          <div className="h-2 rounded-full bg-white/10 w-[92%]" />
          <div className="h-2 rounded-full bg-white/[0.05] w-[60%]" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 bg-[#38bdf8] text-black text-[11px] font-semibold px-3 py-2 rounded-lg text-center">Download PDF</div>
        <div className={`${cardBg} px-3 py-2 text-[11px] text-white/50 rounded-lg`}>Regenerate</div>
      </div>
    </div>
  );
}

/* ─── mock screens ─── */
function StepScreen({ step }: { step: number }) {
  switch (step) {
    case 0: return <StepScreen0_Advisor />;
    case 1: return <StepScreen1_Plan />;
    case 2: return <StepScreen2_Calculator />;
    case 3: return <StepScreen3_Countries />;
    case 4: return <StepScreen4_VisaLetter />;
    default: return null;
  }
}

/* ─── animated cursor ─── */
function AnimatedCursor({ x, y, clicking }: { x: number; y: number; clicking: boolean }) {
  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
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

export default function ProductTourSection() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [clicking, setClicking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setActive((p) => (p + 1) % steps.length);
    setClicking(true);
    setTimeout(() => setClicking(false), 500);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(advance, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, advance]);

  const goTo = (i: number) => {
    setActive(i);
    setClicking(true);
    setTimeout(() => setClicking(false), 500);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused) {
      timerRef.current = setInterval(advance, 3500);
    }
  };

  const step = steps[active];
  const cursor = cursorPositions[active];

  return (
    <section id="product-tour" className="py-16 md:py-24 border-t border-border/40">
      <div className="container max-w-6xl">
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

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
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

          <div
            className="flex-1 order-1 lg:order-2 w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] shadow-[0_0_60px_-20px_#38bdf855] overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <div className="ml-4 flex-1 h-1 rounded-full bg-white/[0.04] overflow-hidden max-w-[200px]">
                  <motion.div
                    className="h-full rounded-full bg-[#38bdf8]/60"
                    animate={{ width: `${((active + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
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
