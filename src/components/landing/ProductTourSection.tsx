import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Home, MessageSquare, FileText, CheckSquare, Globe, Calculator, Users, Bell, User } from "lucide-react";
import { Link } from "react-router-dom";
import worldMap from "@/assets/redesign/world-map.jpg";
import countryPortugal from "@/assets/redesign/country-portugal.jpg";
import countrySpain from "@/assets/redesign/country-spain.jpg";
import countryGreece from "@/assets/redesign/country-greece.jpg";
import mexicoCoast from "@/assets/redesign/mexico-coast.jpg";

const steps = [
  { label: "AI Advisor", navIdx: 1, title: "Ask anything about your move", description: "Get specific answers about visas, documents, taxes, banking — personalized to your situation." },
  { label: "My Plan", navIdx: 2, title: "51-step relocation plan", description: "Every step organized by phase: Preparation → Arrival → Settling in → Stability." },
  { label: "Documents", navIdx: 3, title: "Manage your documents", description: "Organize, track, and store all your documents in one secure place." },
  { label: "Checklists", navIdx: 4, title: "Document checklist per visa", description: "Every document you need, in the right order, with status tracking." },
  { label: "Country Guide", navIdx: 5, title: "Explore 50+ countries", description: "Filter by region, visa type, cost level, and climate. Click any country for full details." },
  { label: "Cost Calculator", navIdx: 6, title: "Know exactly what you'll spend", description: "Rent, food, insurance, visa fees — real data for 70 countries, adjusted for your family size." },
];

const NAV_ITEMS = [
  { label: "Home", icon: Home },
  { label: "AI Advisor", icon: MessageSquare },
  { label: "My Plan", icon: FileText },
  { label: "Documents", icon: FileText },
  { label: "Checklists", icon: CheckSquare },
  { label: "Country Guide", icon: Globe },
  { label: "Cost Calculator", icon: Calculator },
  { label: "Community", icon: Users },
];

const TOP_MATCHES = [
  { flag: "🇵🇹", name: "Portugal", pct: 96, imgSrc: countryPortugal },
  { flag: "🇪🇸", name: "Spain", pct: 91, imgSrc: countrySpain },
  { flag: "🇬🇷", name: "Greece", pct: 88, imgSrc: countryGreece },
];

function AdvisorScreen() {
  return (
    <div className="flex flex-col h-full px-5 py-5">
      <h3 className="text-[15px] font-semibold text-foreground mb-1">Where should you relocate?</h3>
      <p className="text-[11px] text-muted-foreground mb-4">Answer a few questions and our AI will find your best matches.</p>

      {/* World map */}
      <div className="w-full rounded-xl mb-4 overflow-hidden" style={{ height: 110 }}>
        <img loading="lazy"
          src={worldMap}
          alt="World map showing popular relocation destinations"
          className="w-full h-full object-cover object-center"
        />
      </div>

      <button
        className="w-full py-2 rounded-lg text-[12px] font-semibold text-white mb-5"
        style={{ background: "hsl(var(--primary))" }}
      >
        Start assessment
      </button>

      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium text-foreground">Top matches for you</p>
        <span className="text-[10px] text-primary cursor-pointer">View all countries</span>
      </div>
        <div className="grid grid-cols-3 gap-2">
        {TOP_MATCHES.map((c) => (
          <div
            key={c.name}
            className="rounded-xl overflow-hidden border border-border bg-card"
          >
            {/* Country photo */}
            <div className="w-full" style={{ height: 48 }}>
              <img loading="lazy"
                src={c.imgSrc}
                alt={c.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="p-2">
              <p className="text-[10px] font-semibold text-foreground">{c.name}</p>
              <p className="text-[9px] text-primary font-medium">{c.pct}% match</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanScreen() {
  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] font-semibold text-foreground">Your Relocation Plan</h3>
        <span className="text-[10px] font-medium text-primary">Step 3 of 12</span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3">🇵🇹 Portugal · D7 Visa</p>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mb-4">
        <div className="h-full w-[25%] rounded-full bg-primary" />
      </div>
      {[
        { n: 1, t: "Research visa requirements", status: "Done" },
        { n: 2, t: "Apostille your documents", status: "Done" },
        { n: 3, t: "Get health insurance quote", status: "In progress" },
        { n: 4, t: "Book initial accommodation", status: "Upcoming" },
      ].map(s => (
        <div key={s.n} className="flex items-center gap-3 p-2.5 mb-1.5 rounded-lg border border-border bg-card text-[11px]">
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-mono shrink-0 ${
            s.status === "Done" ? "bg-emerald-100 border-emerald-300 text-emerald-600"
            : s.status === "In progress" ? "bg-primary/10 border-primary/30 text-primary"
            : "border-border text-muted-foreground"
          }`}>{s.n}</div>
          <span className="flex-1 text-foreground/70">{s.t}</span>
          <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
            s.status === "Done" ? "bg-emerald-50 text-emerald-600"
            : s.status === "In progress" ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
          }`}>{s.status}</span>
        </div>
      ))}
    </div>
  );
}

function DocumentsScreen() {
  const docs = [
    { name: "Passport", status: "Uploaded", ok: true },
    { name: "Proof of income", status: "Uploaded", ok: true },
    { name: "Relova certificate", status: "Pending", ok: false },
  ];
  return (
    <div className="flex flex-col h-full px-5 py-5">
      <h3 className="text-[14px] font-semibold text-foreground mb-4">Your Documents</h3>
      <button
        className="w-full py-2 rounded-lg text-[12px] font-semibold border border-dashed border-primary/40 text-primary mb-4"
        style={{ background: "hsl(var(--primary) / 0.04)" }}
      >
        + Upload document
      </button>
      {docs.map(d => (
        <div key={d.name} className="flex items-center gap-3 p-3 mb-2 rounded-lg border border-border bg-card">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[14px]">📄</div>
          <div className="flex-1">
            <p className="text-[11px] font-medium text-foreground">{d.name}</p>
            <p className={`text-[10px] ${d.ok ? "text-emerald-600" : "text-amber-500"}`}>{d.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChecklistScreen() {
  const items = [
    { t: "Valid passport (6+ months)", done: true },
    { t: "Proof of passive income", done: true },
    { t: "Criminal record certificate", done: true },
    { t: "Health insurance policy", done: false },
    { t: "Proof of accommodation", done: false },
  ];
  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] font-semibold text-foreground">Document Checklist</h3>
        <span className="text-[10px] text-primary font-medium">3 / 5 done</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mb-4">
        <div className="h-full w-[60%] rounded-full bg-primary" />
      </div>
      {items.map((d, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5 mb-1.5 rounded-lg border border-border bg-card">
          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${d.done ? "bg-emerald-100 border-emerald-300" : "border-border"}`}>
            {d.done && <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
          </div>
          <span className={`text-[11px] ${d.done ? "text-muted-foreground line-through" : "text-foreground/70"}`}>{d.t}</span>
        </div>
      ))}
    </div>
  );
}

function CountryScreen() {
  const countries = [
    { flag: "🇵🇹", name: "Portugal", score: 96, visa: "D7 Visa", imgSrc: countryPortugal },
    { flag: "🇪🇸", name: "Spain", score: 91, visa: "Non-Lucrative", imgSrc: countrySpain },
    { flag: "🇬🇷", name: "Greece", score: 88, visa: "Digital Nomad", imgSrc: countryGreece },
    { flag: "🇲🇽", name: "Mexico", score: 84, visa: "Temporary Res.", imgSrc: mexicoCoast },
  ];
  return (
    <div className="flex flex-col h-full px-5 py-5">
      <h3 className="text-[14px] font-semibold text-foreground mb-3">Country Guide</h3>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {countries.map((c, i) => (
          <div key={c.name} className={`rounded-xl overflow-hidden border ${i === 0 ? "border-primary/30" : "border-border"} bg-card`}>
            {/* Country photo */}
            <div className="w-full" style={{ height: 52 }}>
              <img loading="lazy"
                src={c.imgSrc}
                alt={c.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="p-2.5">
              <p className="text-[11px] font-semibold text-foreground">{c.name}</p>
              <p className="text-[9px] text-muted-foreground">{c.visa}</p>
              <p className="text-[9px] text-primary font-medium mt-0.5">{c.score}% match</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostScreen() {
  return (
    <div className="flex flex-col h-full px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-foreground">Cost Calculator</h3>
        <span className="text-[11px] text-muted-foreground">🇵🇹 Portugal</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[["Rent", "€700–1,100"], ["Food", "€280–400"], ["Insurance", "€70–120"]].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{k}</p>
            <p className="text-[12px] font-bold text-primary leading-tight">{v}</p>
            <p className="text-[9px] text-muted-foreground">/mo</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] text-muted-foreground">Total monthly</span>
          <span className="text-[13px] font-bold text-foreground">€1,500–2,000</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">vs budget ($3,000)</span>
          <span className="text-[11px] text-emerald-600 font-medium">✓ Comfortable</span>
        </div>
      </div>
    </div>
  );
}

function AppScreen({ stepIdx }: { stepIdx: number }) {
  switch (stepIdx) {
    case 0: return <AdvisorScreen />;
    case 1: return <PlanScreen />;
    case 2: return <DocumentsScreen />;
    case 3: return <ChecklistScreen />;
    case 4: return <CountryScreen />;
    case 5: return <CostScreen />;
    default: return <AdvisorScreen />;
  }
}

export default function ProductTourSection() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setActive(p => (p + 1) % steps.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(advance, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, advance]);

  const goTo = (i: number) => {
    setActive(i);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused) timerRef.current = setInterval(advance, 4000);
  };

  const step = steps[active];

  return (
    <section id="product-tour" className="py-20 md:py-28 relative overflow-hidden bg-secondary">
      {/* Radial glow behind browser mockup */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "-5%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "60%",
          height: "80%",
          background: "radial-gradient(ellipse, hsl(var(--primary) / 0.07) 0%, transparent 65%)",
        }}
      />
      <div className="container max-w-6xl px-5 md:px-8 relative z-10">
        <div
          className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-4">
              Product Tour
            </p>
            <h2 className="font-serif text-[2rem] sm:text-[2.4rem] md:text-[2.8rem] font-semibold leading-[1.1] mb-5 text-foreground">
              See Relova<br />in action
            </h2>
            <p className="text-[15px] leading-[1.7] text-muted-foreground mb-8 max-w-[380px]">
              From finding your perfect country to managing your documents, Relova simplifies every step of your relocation.
            </p>

            {/* Step nav list */}
            <div className="space-y-1 mb-8">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 text-[13px] font-medium ${
                    i === active
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {i === active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                  {i !== active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-border flex-shrink-0" />
                  )}
                  {s.label}
                </button>
              ))}
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-primary hover:opacity-80 transition-opacity"
            >
              Explore the demo <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </motion.div>

          {/* Right — browser mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Step description (animated) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="mb-4"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[13px] text-muted-foreground">{step.description}</p>
              </motion.div>
            </AnimatePresence>

            {/* Browser chrome */}
            <div
              className="rounded-2xl overflow-hidden border border-border bg-card"
              style={{
                boxShadow: "0 20px 60px -20px rgba(0,0,0,0.15), 0 8px 24px -8px rgba(0,0,0,0.08), 0 0 0 1px hsl(var(--border))",
              }}
            >
              {/* Browser top bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/40">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-1.5 bg-background/70 border border-border rounded-md px-3 py-1 w-[200px]">
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                    <span className="text-[10px] text-muted-foreground">app.relova.io/advisor</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bell size={12} className="text-muted-foreground" />
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <User size={10} className="text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* App layout: sidebar + content */}
              <div className="flex h-[380px]">
                {/* Left sidebar nav */}
                <div className="w-[160px] shrink-0 border-r border-border bg-secondary/20 flex flex-col py-3 px-2">
                  {/* Logo */}
                  <div className="flex items-center gap-2 px-2 mb-4">
                    <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white">R</span>
                    </div>
                    <span className="text-[11px] font-semibold text-foreground">RELOVA</span>
                  </div>

                  {/* Nav items */}
                  <div className="space-y-0.5 flex-1">
                    {NAV_ITEMS.map((item, i) => {
                      const Icon = item.icon;
                      const isActive = i === steps[active].navIdx;
                      return (
                        <div
                          key={item.label}
                          className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          <Icon size={12} strokeWidth={isActive ? 2.5 : 1.8} />
                          <span className="text-[10px] font-medium">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Settings at bottom */}
                  <div className="text-[10px] text-muted-foreground px-2 space-y-1 mt-2 border-t border-border pt-2">
                    <div className="flex items-center gap-2 py-1 cursor-pointer hover:text-foreground">
                      <Calculator size={11} /> Settings
                    </div>
                    <div className="flex items-center gap-2 py-1 cursor-pointer hover:text-foreground">
                      <Users size={11} /> Help & Support
                    </div>
                  </div>
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      className="h-full"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <AppScreen stepIdx={active} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
