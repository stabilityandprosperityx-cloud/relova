import { motion } from "framer-motion";

const STEPS = [
  {
    n: 1,
    title: "Discover your country match",
    desc: "Answer a few questions and we'll find the best countries for your lifestyle and goals.",
    thumb: "thumb-match",
  },
  {
    n: 2,
    title: "Understand your visa",
    desc: "Get a personalized roadmap with steps, timelines, and cost estimates.",
    thumb: "thumb-visa",
  },
  {
    n: 3,
    title: "Manage your documents",
    desc: "Organize, track, and store all your documents in one secure place.",
    thumb: "thumb-docs",
  },
  {
    n: 4,
    title: "Move with confidence",
    desc: "Stay on track, get reminders, and access expert resources whenever you need.",
    thumb: "thumb-move",
  },
];

/* Mini app-screenshot thumbnails — pure HTML/CSS, no images */

function ThumbMatch() {
  const matches = [
    { flag: "🇵🇹", name: "Portugal", pct: 98 },
    { flag: "🇪🇸", name: "Spain",    pct: 93 },
    { flag: "🇬🇷", name: "Greece",   pct: 89 },
  ];
  return (
    <div className="flex flex-col gap-1.5 px-3 pt-3 pb-2">
      <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">Your top matches</p>
      {matches.map((m, i) => (
        <div key={m.name} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${i === 0 ? "bg-primary/8 border border-primary/20" : "border border-border bg-card"}`}>
          <span className="text-[11px]">{m.flag}</span>
          <span className="text-[9px] font-medium text-foreground flex-1">{m.name}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${m.pct}%`, opacity: i === 0 ? 1 : 0.45 }} />
            </div>
            <span className={`text-[8px] font-mono font-semibold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{m.pct}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ThumbVisa() {
  return (
    <div className="flex flex-col gap-1.5 px-3 pt-3 pb-2">
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider">Relocation Plan</p>
        <span className="text-[8px] text-primary font-medium">Step 2 of 51</span>
      </div>
      <div className="w-full h-1 rounded-full bg-muted overflow-hidden mb-1">
        <div className="h-full w-[4%] rounded-full bg-primary" />
      </div>
      {[
        { label: "Apply for D7 Visa", done: false, active: true },
        { label: "Gather income proof", done: false, active: false },
        { label: "Book accommodation", done: false, active: false },
      ].map((s, i) => (
        <div key={i} className={`flex items-center gap-2 rounded-md px-2 py-1.5 border ${s.active ? "border-primary/25 bg-primary/5" : "border-border bg-card"}`}>
          <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${s.active ? "border-primary bg-primary/20" : "border-border"}`} />
          <span className="text-[9px] text-foreground/70">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function ThumbDocs() {
  const docs = [
    { name: "Passport",         status: "Uploaded",  ok: true },
    { name: "Proof of income",  status: "Uploaded",  ok: true },
    { name: "Relova certificate", status: "Pending", ok: false },
  ];
  return (
    <div className="flex flex-col gap-1.5 px-3 pt-3 pb-2">
      <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">Documents</p>
      {docs.map(d => (
        <div key={d.name} className="flex items-center gap-2 rounded-md px-2 py-1.5 border border-border bg-card">
          <span className="text-[11px]">📄</span>
          <span className="text-[9px] text-foreground flex-1">{d.name}</span>
          <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${d.ok ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
            {d.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function ThumbMove() {
  return (
    <div className="flex flex-col gap-1.5 px-3 pt-3 pb-2">
      <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">Overview · Portugal</p>
      <div className="rounded-md border border-border bg-card px-2.5 py-2 mb-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[8px] text-muted-foreground">Overall progress</span>
          <span className="text-[8px] text-primary font-mono font-semibold">29%</span>
        </div>
        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-[29%] rounded-full bg-primary" />
        </div>
      </div>
      {["Get health insurance", "Book flights to Lisbon"].map((s, i) => (
        <div key={i} className="flex items-center gap-2 rounded-md px-2 py-1.5 border border-border bg-card">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
          <span className="text-[9px] text-foreground/70">{s}</span>
        </div>
      ))}
    </div>
  );
}

const THUMBS = [ThumbMatch, ThumbVisa, ThumbDocs, ThumbMove];

export default function SolutionSection() {
  return (
    <section className="py-20 md:py-28 bg-background border-t border-border/50">
      <div className="container max-w-6xl px-5 md:px-8">

        {/* Header — two-column */}
        <div className="grid lg:grid-cols-2 gap-8 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-4">
              The Solution
            </p>
            <h2 className="font-serif text-[2rem] sm:text-[2.4rem] md:text-[2.8rem] font-semibold leading-[1.1] text-foreground">
              Relova makes relocation simple, step&nbsp;by&nbsp;step.
            </h2>
          </motion.div>
          <motion.p
            className="text-[15px] leading-[1.75] text-muted-foreground self-end lg:pb-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Relova gives you clarity, a personalized plan, and the confidence to move forward.
          </motion.p>
        </div>

        {/* 4 step cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => {
            const Thumb = THUMBS[i];
            return (
              <motion.div
                key={s.n}
                className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: i * 0.09 }}
              >
                {/* Mini thumbnail */}
                <div
                  className="border-b border-border"
                  style={{ background: "hsl(var(--secondary) / 0.5)", minHeight: 130 }}
                >
                  <Thumb />
                </div>

                {/* Step info */}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  {/* Step number */}
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: "hsl(var(--primary))" }}
                    >
                      {s.n}
                    </div>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-foreground leading-snug tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-[12px] text-muted-foreground leading-[1.65]">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
