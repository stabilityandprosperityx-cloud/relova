import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import portugalStreet from "@/assets/redesign/portugal-street.jpg";
import uaeCity from "@/assets/redesign/uae-city.jpg";
import australiaHarbour from "@/assets/redesign/australia-harbour.jpg";

const PATHWAYS = [
  {
    countryCode: "PT",
    country: "Portugal",
    flag: "🇵🇹",
    visa: "D7 Passive Income Visa",
    bullets: ["Naturalization path based on 5 years of legal residence", "Multiple visa categories available for different profiles"],
    imgSrc: portugalStreet,
    imgAlt: "A charming street in Lisbon, Portugal with traditional architecture",
    href: "/countries/portugal",
  },
  {
    countryCode: "AE",
    country: "UAE",
    flag: "🇦🇪",
    visa: "Remote Work Visa",
    bullets: ["Residency programs explained clearly — from freelance visas to investor permits", "Golden visa options available"],
    imgSrc: uaeCity,
    imgAlt: "Dubai skyline showing modern city life in the UAE",
    href: "/countries/uae",
  },
  {
    countryCode: "AU",
    country: "Australia",
    flag: "🇦🇺",
    visa: "Skilled Independent Visa",
    bullets: ["Permanent residency required before citizenship", "Points-based skilled migration system"],
    imgSrc: australiaHarbour,
    imgAlt: "Sydney Harbour Bridge and Opera House representing life in Australia",
    href: "/countries/australia",
  },
];

export default function LegalPathwaysSection() {
  const [active, setActive] = useState(0);

  const prev = () => setActive(i => (i - 1 + PATHWAYS.length) % PATHWAYS.length);
  const next = () => setActive(i => (i + 1) % PATHWAYS.length);

  return (
    <section className="py-20 md:py-28 border-t border-border/50 bg-secondary">
      <div className="container max-w-6xl px-5 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.7fr] gap-12 lg:gap-16 items-center">

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-4">
              Legal Pathways
            </p>
            <h2 className="font-serif text-[2rem] sm:text-[2.4rem] md:text-[2.8rem] font-semibold leading-[1.1] mb-5 text-foreground">
              Proven pathways to{" "}
              <span className="italic" style={{ color: "hsl(var(--primary))" }}>
                your new life.
              </span>
            </h2>
            <p className="text-[15px] leading-[1.7] text-muted-foreground mb-6">
              Explore legal relocation options for top destinations.
            </p>
            <Link
              to="/countries"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-primary hover:opacity-75 transition-opacity"
            >
              See all countries <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </motion.div>

          {/* Right — cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Desktop: 3 cards in a row */}
            <div className="hidden md:grid grid-cols-3 gap-4">
              {PATHWAYS.map((p, i) => (
                <VisaCard key={p.country} pathway={p} index={i} />
              ))}
            </div>

            {/* Mobile: single card + prev/next */}
            <div className="md:hidden">
              <VisaCard pathway={PATHWAYS[active]} index={active} />
              <div className="flex items-center justify-center gap-4 mt-5">
                <button
                  onClick={prev}
                  className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <ChevronLeft size={15} className="text-foreground" />
                </button>
                <div className="flex gap-1.5">
                  {PATHWAYS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === active ? "bg-primary w-4" : "bg-border"}`}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <ChevronRight size={15} className="text-foreground" />
                </button>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Legal disclaimer */}
        <p className="mt-12 text-[11px] text-muted-foreground/40 max-w-[520px]">
          Relova provides informational guidance only. We do not provide legal advice or guarantee outcomes. Always consult a qualified professional.
        </p>
      </div>
    </section>
  );
}

function VisaCard({ pathway: p, index: i }: { pathway: typeof PATHWAYS[0]; index: number }) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden border border-border bg-card flex flex-col"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: i * 0.1 }}
    >
      {/* Photo */}
      <div className="relative w-full" style={{ height: 160 }}>
        <img loading="lazy"
          src={p.imgSrc}
          alt={p.imgAlt}
          className="w-full h-full object-cover object-center"
        />
        {/* Country badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-card/80 backdrop-blur-sm rounded-full px-2.5 py-1">
          <span className="text-[12px]">{p.flag}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
            {p.country}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-[13px] font-semibold text-foreground leading-snug tracking-tight">
          {p.visa}
        </h3>
        <ul className="space-y-1">
          {p.bullets.map(b => (
            <li key={b} className="text-[11px] text-muted-foreground leading-snug flex items-start gap-1.5">
              <span className="text-primary mt-0.5 flex-shrink-0">·</span>
              {b}
            </li>
          ))}
        </ul>
        <Link
          to={p.href}
          className="mt-auto pt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:opacity-75 transition-opacity"
        >
          Explore {p.country} <ArrowRight size={11} strokeWidth={2.5} />
        </Link>
      </div>
    </motion.div>
  );
}
