import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ChatWidget from "@/components/chat/ChatWidget";

const FLOAT_BADGES = [
  { flag: "🇵🇹", text: "Portugal · D7 Visa", style: { top: "110px", left: "24px", rotate: "-3deg" } },
  { flag: "🇦🇪", text: "UAE · Tax free", style: { top: "200px", left: "8px", rotate: "2deg" } },
  { flag: "🇬🇪", text: "Georgia · 1% tax", style: { top: "120px", right: "20px", rotate: "2deg" } },
  { flag: "🇪🇸", text: "Spain · Beckham Law", style: { top: "215px", right: "8px", rotate: "-2deg" } },
];

const ROUTES = [
  { from: "🇸🇪 Stockholm", to: "🇵🇹 Lisbon", stat: "6 weeks" },
  { from: "🇦🇷 Buenos Aires", to: "🇦🇪 Dubai", stat: "$2,100" },
  { from: "🇬🇧 London", to: "🇪🇸 Barcelona", stat: "3 months" },
];

export default function HeroSection() {
  return (
    <section
      className="relative pt-24 pb-16 md:pt-36 md:pb-24 overflow-hidden"
      style={{ background: "#07090f" }}
    >
      {/* Grid background */}
      <div className="bg-grid-relova absolute inset-0 pointer-events-none" />

      {/* Glow orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-100px", left: "50%", transform: "translateX(-50%)",
          width: "800px", height: "400px",
          background: "radial-gradient(ellipse, rgba(56,189,248,0.14) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute pointer-events-none hidden lg:block"
        style={{
          top: "80px", left: "-60px",
          width: "420px", height: "320px",
          background: "radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute pointer-events-none hidden lg:block"
        style={{
          top: "100px", right: "-40px",
          width: "360px", height: "280px",
          background: "radial-gradient(ellipse, rgba(20,184,166,0.08) 0%, transparent 65%)",
        }}
      />

      {/* Floating country badges — desktop only */}
      <div className="absolute inset-0 pointer-events-none hidden xl:block">
        {FLOAT_BADGES.map((b) => (
          <motion.div
            key={b.text}
            className="hero-float-badge absolute"
            style={{ ...b.style, rotate: b.style.rotate } as CSSProperties}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            <span style={{ fontSize: 15 }}>{b.flag}</span>
            <span>{b.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="container relative z-10 px-5 md:px-4">
        <div className="max-w-[640px] mx-auto text-center">

          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 rounded-full px-4 py-[5px] mb-7 text-[11px] tracking-[0.04em]"
            style={{
              background: "rgba(56,189,248,0.07)",
              border: "1px solid rgba(56,189,248,0.18)",
              color: "#7dd3fc",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#38bdf8",
                boxShadow: "0 0 6px #38bdf8",
                animation: "blink 2s infinite",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            AI Relocation Intelligence · 70+ countries
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-[2.4rem] sm:text-[3rem] md:text-[3.8rem] font-bold leading-[1.04] tracking-[-0.045em] mb-5"
            style={{ color: "#fff" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
          >
            You already know<br />
            <span style={{ color: "rgba(255,255,255,0.45)" }}>you want to leave.</span><br />
            <span className="text-gradient-accent">We show you where.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-[15px] md:text-[16px] leading-[1.75] max-w-[460px] mx-auto mb-9"
            style={{ color: "rgba(255,255,255,0.42)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          >
            Tell us your passport, budget, and goal — get your best country match, visa path, and full relocation plan in minutes.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          >
            <Link to="/chat" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[10px] px-7 h-[50px] text-[14px] font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                  boxShadow: "0 0 32px rgba(14,165,233,0.3)",
                  border: "none",
                }}
              >
                Find my best country <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            </Link>
            <Link to="/countries" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-[50px] px-7 text-[14px] rounded-[10px]"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Explore countries
              </Button>
            </Link>
          </motion.div>

          {/* Demo Chat Widget with gradient border */}
          <motion.div
            className="gradient-border-box mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <div className="relative z-10 rounded-[18px] overflow-hidden" style={{ background: "#0d1117" }}>
              <ChatWidget maxHeight="320px" compact />
            </div>
          </motion.div>

          {/* Social proof routes */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
          >
            {ROUTES.map((r, i) => (
              <span key={i} className="text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                {r.from} → {r.to} ·{" "}
                <span style={{ color: "#38bdf8", fontWeight: 500 }}>{r.stat}</span>
                {i < ROUTES.length - 1 && (
                  <span className="ml-4" style={{ color: "rgba(255,255,255,0.08)" }}>·</span>
                )}
              </span>
            ))}
          </motion.div>

        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </section>
  );
}
