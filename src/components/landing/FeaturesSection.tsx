import { motion } from "framer-motion";
import { MessageSquare, ClipboardCheck, Map, FileText, Globe, Calculator } from "lucide-react";
import advisorPreview from "@/assets/redesign/advisor-preview.jpg";
import documentsPreview from "@/assets/redesign/documents-preview.jpg";
import countryPreview from "@/assets/redesign/country-preview.jpg";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI relocation advisor",
    description: "Unlimited personalized answers about visas, taxes, banking — specific to your passport and situation.",
  },
  {
    icon: ClipboardCheck,
    title: "Personalized checklist",
    description: "A tailored checklist with clear next steps and progress tracking from start to stable life.",
    thumb: true,
  },
  {
    icon: Map,
    title: "Step-by-step move plan",
    description: "51 steps organized by phase: Preparation → Arrival → Legal setup → Settlement.",
    thumb: true,
  },
  {
    icon: FileText,
    title: "Documents & visa letter",
    description: "Manage required documents and generate a visa cover letter — saves $300+ on lawyers.",
  },
  {
    icon: Globe,
    title: "Countries explorer",
    description: "Compare 70+ destinations with visas, stability, climate, and language context.",
  },
  {
    icon: Calculator,
    title: "Relocation cost calculator",
    description: "Real monthly costs for 70+ cities. Rent, visa fees, insurance — adjusted for your family size.",
    thumb: true,
  },
];

/* Small thumbnail for Checklist card */
function ChecklistThumb() {
  const items = [
    { label: "Passport copy", done: true },
    { label: "Bank statement", done: true },
    { label: "Health insurance", done: false },
    { label: "Visa cover letter", done: false },
  ];
  return (
    <div className="w-full rounded-xl border border-border overflow-hidden" style={{ background: "hsl(var(--secondary) / 0.5)" }}>
      <div className="px-3 pt-2.5 pb-2 flex flex-col gap-1">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${it.done ? "border-emerald-400 bg-emerald-50" : "border-border bg-white"}`}>
              {it.done && (
                <svg className="w-2 h-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`text-[9px] ${it.done ? "line-through text-muted-foreground/50" : "text-foreground/70"}`}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Small thumbnail for Move Plan card */
function PlanThumb() {
  return (
    <div className="w-full rounded-xl border border-border overflow-hidden" style={{ background: "hsl(var(--secondary) / 0.5)" }}>
      <div className="px-3 pt-2 pb-2 flex flex-col gap-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[8px] text-muted-foreground/60 uppercase tracking-wider">Your Move Plan</span>
          <span className="text-[8px] text-primary font-medium">1–2 weeks</span>
        </div>
        {[
          { label: "Research visa", active: false, done: true },
          { label: "Project Documents", active: true, done: false },
          { label: "Apply for Visa", active: false, done: false },
        ].map((s, i) => (
          <div key={i} className={`flex items-center gap-1.5 rounded px-1.5 py-1 ${s.active ? "bg-primary/8 border border-primary/20" : ""}`}>
            <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${s.done ? "border-emerald-400 bg-emerald-50" : s.active ? "border-primary bg-primary/20" : "border-border"}`} />
            <span className={`text-[9px] ${s.done ? "line-through text-muted-foreground/50" : s.active ? "text-primary font-medium" : "text-foreground/60"}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Small thumbnail for Cost Calculator card */
function CostThumb() {
  return (
    <div className="w-full rounded-xl border border-border overflow-hidden" style={{ background: "hsl(var(--secondary) / 0.5)" }}>
      <div className="px-3 pt-2 pb-2 flex flex-col gap-1">
        <span className="text-[8px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">Monthly estimate</span>
        {[
          { label: "One-time costs",  val: "$8,670" },
          { label: "Monthly costs",   val: "$2,348" },
          { label: "Total (first yr)", val: "$36,218", bold: true },
        ].map((r, i) => (
          <div key={i} className={`flex items-center justify-between py-0.5 ${r.bold ? "border-t border-border mt-0.5 pt-1" : ""}`}>
            <span className="text-[9px] text-muted-foreground">{r.label}</span>
            <span className={`text-[9px] font-semibold ${r.bold ? "text-foreground" : "text-primary"}`}>{r.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdvisorThumb() {
  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ height: 108 }}>
      <img loading="lazy"
        src={advisorPreview}
        alt="AI relocation advisor answering questions about visas and countries"
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
}

function DocumentsThumb() {
  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ height: 108 }}>
      <img loading="lazy"
        src={documentsPreview}
        alt="Document checklist and visa letter generation interface"
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
}

function CountryThumb() {
  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ height: 108 }}>
      <img loading="lazy"
        src={countryPreview}
        alt="Countries explorer showing destinations around the world"
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
}

const THUMBS: Record<number, React.FC> = { 0: AdvisorThumb, 1: ChecklistThumb, 2: PlanThumb, 3: DocumentsThumb, 4: CountryThumb, 5: CostThumb };

export default function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 border-t border-border/50 bg-secondary">
      <div className="container max-w-6xl px-5 md:px-8">

        {/* Header — left text / right empty (grid aligns naturally) */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 mb-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-4">
              Features
            </p>
            <h2 className="font-serif text-[2rem] sm:text-[2.4rem] md:text-[2.8rem] font-semibold leading-[1.08] text-foreground">
              Everything you need.<br />
              All in one place.
            </h2>
          </motion.div>
          <motion.p
            className="text-[15px] leading-[1.75] text-muted-foreground lg:pb-1 max-w-[420px]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            From finding your country to getting your visa — every tool you need for a successful relocation, in one platform.
          </motion.p>
        </div>

        {/* 3×2 feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const Thumb = THUMBS[i];
            return (
              <motion.div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(var(--primary) / 0.08)" }}
                >
                  <Icon size={18} className="text-primary" strokeWidth={1.8} />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[15px] font-semibold text-foreground tracking-tight">{f.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-[1.65]">{f.description}</p>
                </div>

                {/* Optional mini thumbnail */}
                {Thumb && (
                  <div className="mt-auto pt-1">
                    <Thumb />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
