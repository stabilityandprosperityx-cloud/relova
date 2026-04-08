import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  { label: "Onboarding", title: "Set up in 2 minutes", description: "Tell us your passport, destination, income, and goals. Relova builds everything from this." },
  { label: "AI Advisor", title: "Ask anything about your move", description: "Get specific answers about visas, documents, taxes, banking — personalized to your situation." },
  { label: "Country Match", title: "See your ranked country matches", description: "Every country scored against your profile. Visa difficulty, cost, stability — all in one view." },
  { label: "Your Plan", title: "51-step relocation plan", description: "Every step organized by phase: Preparation → Arrival → Settling in → Stability." },
  { label: "Cost Calculator", title: "Know exactly what you'll spend", description: "Rent, food, insurance, visa fees — real data for 70 countries, adjusted for your family size." },
  { label: "Countries", title: "Explore 50+ countries", description: "Filter by region, visa type, cost level, and climate. Click any country for full details." },
  { label: "Visa Letter", title: "Generate your visa cover letter", description: "Fill in your details and get a ready-to-submit cover letter in minutes." },
  { label: "Checklist", title: "Document checklist per visa", description: "Every document you need, in the right order, with status tracking." },
  { label: "Timeline", title: "Deadline calendar", description: "See when to submit documents, book appointments, and hit key milestones." },
  { label: "Overview", title: "Your relocation dashboard", description: "Progress, next steps, budget, and destination — everything in one place." },
];

const cursorPositions = [
  { x: 50, y: 55 }, { x: 50, y: 75 }, { x: 65, y: 50 },
  { x: 45, y: 50 }, { x: 60, y: 45 }, { x: 40, y: 55 },
  { x: 50, y: 60 }, { x: 45, y: 55 }, { x: 55, y: 50 }, { x: 35, y: 40 },
];

const cardBg = "bg-[#111113] border border-white/[0.06] rounded-lg";
const labelCyan = "text-[#38bdf8]";

function Screen0() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-3">Step 1 of 4</p>
      <h3 className="text-[15px] font-semibold text-white mb-5">What's your passport?</h3>
      <div className={`${cardBg} w-full max-w-[260px] p-3 mb-3`}>
        <div className="flex items-center gap-2 mb-2 border-b border-white/[0.06] pb-2">
          <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <span className="text-[12px] text-white/60">Search countries...</span>
        </div>
        {["🇺🇸 United States", "🇬🇧 United Kingdom", "🇷🇺 Russia", "🇩🇪 Germany"].map((c, i) => (
          <div key={c} className={`text-[11px] py-1.5 px-2 rounded ${i === 2 ? "bg-[#38bdf8]/15 text-[#38bdf8]" : "text-white/50"}`}>{c}</div>
        ))}
      </div>
      <div className={`${cardBg} w-full max-w-[260px] p-3`}>
        <p className="text-[10px] text-white/40 mb-2">Monthly budget</p>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[13px] font-semibold ${labelCyan}`}>$3,000 / mo</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-[#38bdf8] w-[45%]" />
        </div>
      </div>
    </div>
  );
}

function Screen1() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
        <span className="text-[12px] font-medium text-white">Relova Advisor</span>
        <span className="text-[10px] text-white/30 ml-auto">Online</span>
      </div>
      <div className="flex-1 px-4 py-3 space-y-3 overflow-hidden">
        <div className={`${cardBg} p-3 max-w-[85%]`}>
          <p className="text-[11px] text-white/70 leading-relaxed">I see you're planning to move from Russia to Portugal. The D7 Passive Income Visa looks like your best path. Want me to walk you through the requirements?</p>
        </div>
        <div className="p-3 max-w-[75%] ml-auto bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-lg">
          <p className="text-[11px] text-[#38bdf8]/90 leading-relaxed">Yes — what documents do I need?</p>
        </div>
        <div className={`${cardBg} p-3 max-w-[85%]`}>
          <p className="text-[11px] text-white/70 leading-relaxed">You'll need: proof of passive income ($1,500+/mo), health insurance, criminal record certificate (apostilled), and proof of accommodation in Portugal.</p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className={`${cardBg} flex items-center gap-2 p-2.5`}>
          <span className="text-[11px] text-white/30 flex-1">Ask about visas, costs, documents...</span>
          <div className="w-6 h-6 rounded-md bg-[#38bdf8] flex items-center justify-center">
            <ArrowRight className="w-3 h-3 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Screen2() {
  const countries = [
    { flag: "🇵🇹", name: "Portugal", score: 98, visa: "D7", diff: "Easy" },
    { flag: "🇪🇸", name: "Spain", score: 94, visa: "NLV", diff: "Medium" },
    { flag: "🇬🇪", name: "Georgia", score: 91, visa: "Remote", diff: "Very Easy" },
    { flag: "🇦🇪", name: "UAE", score: 87, visa: "Freelance", diff: "Easy" },
  ];
  return (
    <div className="flex flex-col h-full px-4 py-4">
      <h3 className="text-[13px] font-semibold text-white mb-3">Your top matches</h3>
      <div className="space-y-2 flex-1">
        {countries.map((c, i) => (
          <div key={c.name} className={`${cardBg} flex items-center gap-3 p-3 ${i === 0 ? "border-[#38bdf8]/30 bg-[#38bdf8]/5" : ""}`}>
            <span className="text-[18px]">{c.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-medium text-white">{c.name}</span>
                <span className={`text-[10px] font-mono font-semibold ${i === 0 ? labelCyan : "text-white/40"}`}>{c.score}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[#38bdf8]" style={{ width: `${c.score}%`, opacity: i === 0 ? 1 : 0.4 }} />
                </div>
                <span className="text-[9px] text-white/30">{c.visa}</span>
                <span className={`text-[9px] ${c.diff === "Very Easy" || c.diff === "Easy" ? "text-emerald-400" : "text-yellow-400"}`}>{c.diff}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Screen3() {
  return (
    <div className="flex flex-col h-full px-4 py-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[13px] font-semibold text-white">Your Relocation Plan</h3>
          <p className="text-[10px] text-white/40 mt-0.5">🇵🇹 Portugal · D7 Visa</p>
        </div>
        <span className={`text-[10px] font-mono ${labelCyan}`}>Step 3 of 51</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
        <div className="h-full rounded-full bg-[#38bdf8] w-[6%]" />
      </div>
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {["Preparation", "Arrival", "Settling in", "Stability"].map((p, i) => (
          <div key={p} className={`text-[8px] px-2 py-1 rounded-full font-medium ${i === 0 ? "bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30" : "bg-white/5 text-white/30"}`}>{p}</div>
        ))}
      </div>
      <div className="space-y-2 flex-1">
        {[
          { n: 1, t: "Research visa requirements", status: "Done", c: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
          { n: 2, t: "Apostille your documents", status: "Done", c: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
          { n: 3, t: "Get health insurance quote", status: "In progress", c: "text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20" },
          { n: 4, t: "Book initial accommodation", status: "Upcoming", c: "text-white/30 bg-white/5 border-white/10" },
        ].map(s => (
          <div key={s.n} className={`${cardBg} flex items-center gap-3 p-2.5`}>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-mono shrink-0 ${s.status === "Done" ? "bg-emerald-400/20 border-emerald-400/40 text-emerald-400" : s.status === "In progress" ? "bg-[#38bdf8]/20 border-[#38bdf8]/40 text-[#38bdf8]" : "border-white/15 text-white/30"}`}>{s.n}</div>
            <span className="text-[11px] text-white/70 flex-1">{s.t}</span>
            <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${s.c}`}>{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Screen4() {
  return (
    <div className="flex flex-col h-full px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-white">Monthly Cost Estimate</h3>
        <div className={`${cardBg} flex items-center gap-1.5 px-2.5 py-1.5`}>
          <span className="text-[11px] text-white/70">🇵🇹 Portugal</span>
          <span className={`text-[10px] ${labelCyan}`}>▾</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[["Rent", "€700–1,100"], ["Food", "€280–400"], ["Insurance", "€70–120"]].map(([k, v]) => (
          <div key={k} className={`${cardBg} p-3 text-center`}>
            <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">{k}</p>
            <p className={`text-[13px] font-bold ${labelCyan} leading-tight`}>{v}</p>
            <p className="text-[9px] text-white/30">/mo</p>
          </div>
        ))}
      </div>
      <div className={`${cardBg} p-3 mb-3`}>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-white/50">Visa fees (one-time)</span>
          <span className="text-[11px] text-white/70">~€250–350</span>
        </div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-white/50">Total monthly</span>
          <span className="text-[13px] font-bold text-white leading-tight">€1,500–2,000/mo</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-white/50">vs your budget ($3,000)</span>
          <span className="text-[11px] text-emerald-400 font-medium">✓ Comfortable</span>
        </div>
        <p className="text-[9px] text-white/35 mt-2 leading-relaxed">
          Estimates for a comfortable single-person lifestyle. Varies by city and habits.
        </p>
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

function Screen5() {
  const countries = [
    { flag: "🇵🇹", name: "Portugal", visa: "D7", cost: "$$$", tag: "Your destination" },
    { flag: "🇬🇪", name: "Georgia", visa: "Remote", cost: "$", tag: "" },
    { flag: "🇦🇪", name: "UAE", visa: "Freelance", cost: "$$$$", tag: "" },
    { flag: "🇹🇭", name: "Thailand", visa: "LTR", cost: "$$", tag: "" },
    { flag: "🇪🇸", name: "Spain", visa: "DN", cost: "$$$", tag: "" },
    { flag: "🇲🇽", name: "Mexico", visa: "Temp Res", cost: "$$", tag: "" },
  ];
  return (
    <div className="flex flex-col h-full px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`${cardBg} flex items-center gap-1.5 px-2.5 py-1.5 flex-1`}>
          <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <span className="text-[11px] text-white/30">Search 50+ countries...</span>
        </div>
        <div className={`${cardBg} px-2.5 py-1.5`}>
          <span className="text-[10px] text-white/40">Europe ▾</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {countries.map((c, i) => (
          <div key={c.name} className={`${cardBg} p-2.5 flex items-center gap-2 ${i === 0 ? "border-[#38bdf8]/30 bg-[#38bdf8]/5" : ""}`}>
            <span className="text-[18px]">{c.flag}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-[11px] font-medium text-white truncate">{c.name}</p>
                {c.tag && <span className={`text-[8px] ${labelCyan}`}>★</span>}
              </div>
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

function Screen6() {
  return (
    <div className="flex flex-col h-full px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-white">Visa Cover Letter</h3>
        <span className="text-[9px] font-medium bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 px-2 py-0.5 rounded-full">Full plan</span>
      </div>
      <div className={`${cardBg} p-3 mb-3`}>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.06]">
          <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[11px]">📄</div>
          <div>
            <p className="text-[11px] font-medium text-white">Portugal D7 — Cover Letter</p>
            <p className="text-[9px] text-white/30">Generated · Ready to submit</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {[100, 90, 95, 0, 100, 85, 92, 0, 70, 88].map((w, i) => (
            <div key={i} className={`h-1.5 rounded-full ${w === 0 ? "bg-transparent h-1" : "bg-white/10"}`} style={{ width: w ? `${w}%` : "100%" }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 bg-[#38bdf8] text-black text-[11px] font-semibold px-3 py-2 rounded-lg text-center cursor-pointer">Download PDF</div>
        <div className={`${cardBg} px-3 py-2 text-[11px] text-white/50 rounded-lg cursor-pointer`}>Regenerate</div>
      </div>
    </div>
  );
}

function Screen7() {
  return (
    <div className="flex flex-col h-full px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-white">Document Checklist</h3>
        <span className={`text-[10px] font-mono ${labelCyan}`}>4 / 11 done</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
        <div className="h-full rounded-full bg-[#38bdf8] w-[36%]" />
      </div>
      <div className="space-y-1.5 flex-1">
        {[
          { t: "Valid passport (6+ months)", done: true },
          { t: "Proof of passive income", done: true },
          { t: "Criminal record certificate", done: true },
          { t: "Apostille on criminal record", done: true },
          { t: "Health insurance policy", done: false },
          { t: "Proof of accommodation", done: false },
          { t: "NIF (tax number) application", done: false },
          { t: "Visa cover letter", done: false },
        ].map((d, i) => (
          <div key={i} className={`${cardBg} flex items-center gap-3 p-2.5`}>
            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${d.done ? "bg-emerald-400/20 border-emerald-400/40" : "border-white/15"}`}>
              {d.done && <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
            </div>
            <span className={`text-[10px] ${d.done ? "text-white/40 line-through" : "text-white/70"}`}>{d.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Screen8() {
  const months = ["May", "Jun", "Jul", "Aug", "Sep"];
  const events = [
    { month: 0, label: "Apostille docs", color: "bg-[#38bdf8]" },
    { month: 1, label: "Submit visa", color: "bg-yellow-400" },
    { month: 2, label: "Visa decision", color: "bg-emerald-400" },
    { month: 3, label: "Book flights", color: "bg-purple-400" },
    { month: 4, label: "Arrive", color: "bg-[#38bdf8]" },
  ];
  return (
    <div className="flex flex-col h-full px-4 py-4">
      <h3 className="text-[13px] font-semibold text-white mb-4">Relocation Timeline</h3>
      <div className="flex gap-2 mb-4">
        {months.map((m, i) => (
          <div key={m} className="flex-1 text-center">
            <p className="text-[9px] text-white/30 mb-2">{m}</p>
            <div className={`w-full h-1 rounded-full ${i === 0 ? "bg-[#38bdf8]" : "bg-white/10"}`} />
          </div>
        ))}
      </div>
      <div className="space-y-2 flex-1">
        {events.map((e, i) => (
          <div key={i} className={`${cardBg} flex items-center gap-3 p-2.5`}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${e.color}`} />
            <span className="text-[10px] text-white/60 flex-1">{e.label}</span>
            <span className="text-[9px] text-white/30">{months[e.month]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Screen9() {
  return (
    <div className="flex flex-col h-full px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[18px]">🇵🇹</span>
        <div>
          <h3 className="text-[13px] font-semibold text-white">Portugal · D7 Visa</h3>
          <p className="text-[9px] text-white/40">Overview</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[["STABILITY", "4-8 mo", labelCyan], ["COST", "€1.5–2k/mo", "text-emerald-400"], ["STEPS", "3 / 51", "text-white/60"]].map(([k, v, c]) => (
          <div key={k} className={`${cardBg} p-2 text-center`}>
            <p className="text-[8px] text-white/30 uppercase tracking-wider">{k}</p>
            <p className={`text-[11px] font-semibold mt-0.5 ${c}`}>{v}</p>
          </div>
        ))}
      </div>
      <div className={`${cardBg} p-3 mb-2`}>
        <div className="flex justify-between text-[10px] mb-1.5">
          <span className="text-white/50">Overall progress</span>
          <span className={`font-mono ${labelCyan}`}>6%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-[#38bdf8] w-[6%]" />
        </div>
      </div>
      <div className={`${cardBg} p-3`}>
        <p className="text-[10px] text-white/40 mb-2">Next up</p>
        <div className="space-y-1.5">
          {["Get health insurance quote", "Book initial accommodation"].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]/60 shrink-0" />
              <span className="text-[10px] text-white/60">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepScreen({ step }: { step: number }) {
  switch (step) {
    case 0: return <Screen0 />;
    case 1: return <Screen1 />;
    case 2: return <Screen2 />;
    case 3: return <Screen3 />;
    case 4: return <Screen4 />;
    case 5: return <Screen5 />;
    case 6: return <Screen6 />;
    case 7: return <Screen7 />;
    case 8: return <Screen8 />;
    case 9: return <Screen9 />;
    default: return null;
  }
}

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
    setActive(p => (p + 1) % steps.length);
    setClicking(true);
    setTimeout(() => setClicking(false), 500);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(advance, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, advance]);

  const goTo = (i: number) => {
    setActive(i);
    setClicking(true);
    setTimeout(() => setClicking(false), 500);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused) timerRef.current = setInterval(advance, 4000);
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
            Everything you need to relocate — in one place
          </p>
        </motion.div>

        <div
          className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* left sidebar */}
          <div className="lg:w-[200px] shrink-0 order-2 lg:order-1 w-full">
            <div className="flex flex-row flex-wrap lg:flex-col gap-1.5">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`text-left px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 ${
                    i === active
                      ? "bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30"
                      : "text-white/35 hover:text-white/60 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <span className={`text-[9px] font-mono mr-1.5 ${i === active ? "text-[#38bdf8]/60" : "text-white/20"}`}>{String(i + 1).padStart(2, "0")}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* right: description + browser */}
          <div className="flex-1 order-1 lg:order-2 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="mb-4"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-foreground mb-1">{step.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            </AnimatePresence>

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
                <span className="ml-auto text-[10px] text-white/20 font-mono">{String(active + 1).padStart(2, "0")}/{String(steps.length).padStart(2, "0")}</span>
              </div>
              <div className="relative h-[300px] sm:h-[360px] md:h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    className="absolute inset-0"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <StepScreen step={active} />
                  </motion.div>
                </AnimatePresence>
                <AnimatedCursor x={cursor.x} y={cursor.y} clicking={clicking} />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Button variant="hero" size="lg" asChild>
            <Link to="/dashboard">
              Try it yourself <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
