import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";

const testimonials = [
  {
    quote: "I spent three months trying to figure out Portugal on my own. Relova gave me a clear plan in 10 minutes. I moved six weeks later.",
    name: "Karina Engström",
    role: "Product designer",
    route: "🇸🇪 Stockholm → 🇵🇹 Lisbon",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face",
  },
  {
    quote: "The clarity was immediate. I knew exactly which visa to apply for, what documents I needed, and in what order.",
    name: "Tomás Herrera",
    role: "Founder",
    route: "🇦🇷 Buenos Aires → 🇦🇪 Dubai",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
  },
  {
    quote: "We relocated our family of four to Australia. Relova handled the complexity so we could focus on the move itself.",
    name: "Anika Patel",
    role: "Remote engineer",
    route: "🇬🇧 London → 🇪🇸 Barcelona",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
  },
  {
    quote: "Compared UAE, Georgia, and Mexico side by side. Chose Georgia — saved $800/mo vs my original plan.",
    name: "Ana R.",
    role: "Freelance designer",
    route: "🇧🇷 São Paulo → 🇬🇪 Tbilisi",
    image: "https://i.pravatar.cc/150?img=5",
  },
  {
    quote: "Had no idea where to start with Portugal D7. Got a 23-step checklist. Applied 3 months later.",
    name: "Mikhail T.",
    role: "Software engineer",
    route: "🇷🇺 Moscow → 🇵🇹 Lisbon",
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    quote: "The visa cover letter alone saved me from hiring a lawyer. Approved first try.",
    name: "James K.",
    role: "Remote consultant",
    route: "🇬🇧 London → 🇦🇪 Dubai",
    image: "https://i.pravatar.cc/150?img=17",
  },
  {
    quote: "I was juggling three job offers in three countries. Relova's cost calculator made the decision obvious.",
    name: "Priya S.",
    role: "Data analyst",
    route: "🇮🇳 Bangalore → 🇪🇸 Barcelona",
    image: "https://i.pravatar.cc/150?img=23",
  },
  {
    quote: "Retiring abroad felt impossible to plan alone. The checklist turned it into a to-do list I could actually finish.",
    name: "Robert H.",
    role: "Retired teacher",
    route: "🇨🇦 Toronto → 🇲🇽 Mérida",
    image: "https://i.pravatar.cc/150?img=33",
  },
  {
    quote: "Moved my whole team remote-first. Relova's country comparisons saved us weeks of spreadsheet work.",
    name: "Julia F.",
    role: "Startup founder",
    route: "🇩🇪 Berlin → 🇹🇭 Chiang Mai",
    image: "https://i.pravatar.cc/150?img=44",
  },
  {
    quote: "Never thought a digital nomad visa was even possible for my job. Relova found three I qualified for.",
    name: "Daniel O.",
    role: "Video editor",
    route: "🇳🇬 Lagos → 🇬🇷 Athens",
    image: "https://i.pravatar.cc/150?img=51",
  },
  {
    quote: "The Relocation Expert answered questions at 2am that my lawyer took a week to reply to.",
    name: "Sofia M.",
    role: "Product manager",
    route: "🇦🇷 Córdoba → 🇵🇹 Porto",
    image: "https://i.pravatar.cc/150?img=57",
  },
  {
    quote: "Two kids, one dog, a house to sell — Relova's plan actually accounted for all of it.",
    name: "Mark & Lena W.",
    role: "Family of four",
    route: "🇺🇸 Austin → 🇮🇹 Bologna",
    image: "https://i.pravatar.cc/150?img=63",
  },
  {
    quote: "I'd been putting off the move for two years out of pure overwhelm. This got me moving in six weeks.",
    name: "Chen L.",
    role: "UX researcher",
    route: "🇸🇬 Singapore → 🇲🇾 Kuala Lumpur",
    image: "https://i.pravatar.cc/150?img=68",
  },
  {
    quote: "The concierge team found us a landlord who accepted foreign income proof — something I'd been stuck on for months alone.",
    name: "Yuki N.",
    role: "Illustrator",
    route: "🇯🇵 Osaka → 🇵🇹 Lisbon",
    image: "https://i.pravatar.cc/150?img=47",
  },
  {
    quote: "Went from 'maybe someday' to holding a visa approval in under four months.",
    name: "Omar B.",
    role: "Civil engineer",
    route: "🇪🇬 Cairo → 🇬🇪 Tbilisi",
    image: "https://i.pravatar.cc/150?img=60",
  },
];

const PAGE_SIZE = 3;
const TOTAL_PAGES = Math.ceil(testimonials.length / PAGE_SIZE);

export default function TestimonialsSection() {
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setPage(p => (p + 1) % TOTAL_PAGES);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(advance, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, advance]);

  const goTo = (i: number) => {
    setPage(i);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused) timerRef.current = setInterval(advance, 5000);
  };

  const visible = testimonials.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <section
      className="py-20 md:py-28 bg-background border-t border-border/50"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container max-w-6xl px-5 md:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-1.5 mb-5">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: "hsl(var(--primary))" }}
            >
              <span className="text-[9px] font-bold text-white">R</span>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Relova
            </span>
          </div>
          <h2 className="font-serif text-[2rem] sm:text-[2.6rem] md:text-[3rem] font-semibold leading-[1.1] mb-4 text-foreground">
            Real stories. Real moves.
          </h2>
          <p className="text-[15px] text-muted-foreground">
            From dream to home, we're with you every step.
          </p>
        </motion.div>

        {/* Cards — animated page swap */}
        <div className="relative min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              className="grid md:grid-cols-3 gap-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {visible.map((t, i) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-border bg-card p-7 flex flex-col"
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
                >
                  {/* Opening quote */}
                  <div
                    className="font-serif text-[3rem] leading-none mb-3 select-none"
                    style={{ color: "hsl(var(--primary))", opacity: 0.45, lineHeight: 1 }}
                    aria-hidden
                  >
                    "
                  </div>

                  <p className="text-[14px] leading-[1.75] text-foreground/80 mb-6 flex-1">
                    {t.quote}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.role}</p>
                    </div>
                  </div>

                  {/* Route badge */}
                  <div
                    className="mt-4 self-start inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full"
                    style={{
                      background: "hsl(var(--primary) / 0.07)",
                      color: "hsl(var(--primary))",
                    }}
                  >
                    {t.route}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === page
                  ? "w-5 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-border hover:bg-muted-foreground/40"
              }`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
