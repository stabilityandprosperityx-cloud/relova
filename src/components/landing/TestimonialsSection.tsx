import { motion } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    quote: "Had no idea where to start with Portugal D7. Got a 23-step checklist. Applied 3 months later.",
    name: "Mikhail T.",
    role: "Software engineer · Moscow → Lisbon",
  },
  {
    quote: "Compared UAE, Georgia, and Mexico side by side. Chose Georgia — saved $800/mo vs my original plan.",
    name: "Ana R.",
    role: "Freelance designer · São Paulo → Tbilisi",
  },
  {
    quote: "The visa cover letter alone saved me from hiring a lawyer. Approved first try.",
    name: "James K.",
    role: "Remote consultant · London → Dubai",
  },
  {
    quote: "Spanish visa requirements explained step by step. Worth every cent of the Pro plan.",
    name: "Yuki M.",
    role: "Developer · Tokyo → Barcelona",
  },
  {
    quote: "Express Entry is confusing. Relova broke it down into actual tasks I could complete.",
    name: "Priya S.",
    role: "Marketing manager · Mumbai → Toronto",
  },
  {
    quote: "I knew I wanted Portugal. Relova told me exactly which documents, in what order, with no fluff.",
    name: "David L.",
    role: "Freelancer · New York → Lisbon",
  },
  {
    quote: "Moved during a chaotic time. Having a clear 51-step plan made all the difference.",
    name: "Nina K.",
    role: "Teacher · Kyiv → Berlin",
  },
  {
    quote: "LTR visa process looked impossible. The step-by-step plan made it manageable.",
    name: "Carlos M.",
    role: "Remote worker · Buenos Aires → Thailand",
  },
  {
    quote: "Retirement visa checklist plus cost breakdown. My husband and I moved in 5 months.",
    name: "Sarah B.",
    role: "Retiree · Chicago → Mexico City",
  },
  {
    quote: "Compared freelance visa vs Golden visa for UAE. Picked the right one for my income level.",
    name: "Arjun P.",
    role: "Startup founder · Delhi → Dubai",
  },
];

export default function TestimonialsSection() {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const looped = [...testimonials, ...testimonials];

  return (
    <section className="py-[60px] md:py-[80px] border-t border-border/40">
      <div className="container">
        <motion.p
          className="text-[11px] text-muted-foreground/60 mb-14 uppercase tracking-[0.15em] font-medium"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          From people who moved
        </motion.p>

        <style>{`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => {
            if (sliderRef.current) sliderRef.current.style.animationPlayState = "paused";
          }}
          onMouseLeave={() => {
            if (sliderRef.current) sliderRef.current.style.animationPlayState = "running";
          }}
        >
          <div
            ref={sliderRef}
            className="flex w-max"
            style={{ animation: "scroll-left 40s linear infinite" }}
          >
            {looped.map((t, i) => (
              <div key={`${t.name}-${i}`} className="rounded-xl border border-border/40 bg-card/50 p-6 w-[300px] shrink-0 mx-3">
                <p className="text-[14px] leading-[1.7] text-foreground/80 mb-5">{t.quote}</p>
                <div>
                  <p className="text-[13px] font-medium text-foreground/90">{t.name}</p>
                  <p className="text-[12px] text-muted-foreground/50 mt-1">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
