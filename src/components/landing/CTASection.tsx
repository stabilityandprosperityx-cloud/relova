import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import ctaCityview from "@/assets/redesign/cta-cityview.jpg";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden border-t border-border/50">
      {/* Background photo */}
      <img
        src={ctaCityview}
        alt="Scenic city view representing a new life abroad"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Subtle light overlay for text legibility */}
      <div className="absolute inset-0 bg-background/25" />
      {/* Edge fades — dissolve photo into background at top & bottom */}
      <div
        className="absolute inset-x-0 top-0 h-[18%] pointer-events-none"
        style={{ background: "linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[18%] pointer-events-none"
        style={{ background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)" }}
      />

      {/* Content */}
      <div className="relative z-10 py-24 md:py-36 container max-w-4xl px-5 md:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Logo badge */}
          <div className="inline-flex items-center gap-1.5 mb-6">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: "hsl(var(--primary))" }}
            >
              <span className="text-[9px] font-bold text-white">R</span>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/50">
              Relova
            </span>
          </div>

          <h2 className="font-serif text-[2.4rem] sm:text-[3rem] md:text-[3.6rem] font-semibold leading-[1.08] mb-5 text-foreground">
            Start your next chapter<br />
            with{" "}
            <span className="italic" style={{ color: "hsl(var(--primary))" }}>
              clarity.
            </span>
          </h2>

          <p className="text-[16px] leading-[1.75] text-muted-foreground mb-10 max-w-[420px] mx-auto">
            The right move starts with the right plan.<br />
            We'll help you make it happen.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link to="/chat">
              <button
                className="inline-flex items-center gap-2 rounded-[10px] px-8 h-[52px] text-[15px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "hsl(var(--primary))",
                  boxShadow: "0 4px 28px hsl(var(--primary) / 0.45)",
                }}
              >
                Create My Plan <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </Link>
            <Link to="/pricing">
              <button className="inline-flex items-center gap-2 rounded-[10px] px-8 h-[52px] text-[15px] font-medium text-foreground border border-border hover:border-primary/40 hover:bg-card/40 transition-all bg-card/30 backdrop-blur-sm">
                Book a Free Call
              </button>
            </Link>
          </div>

          {/* Trustpilot badge */}
          <div className="inline-flex items-center gap-2.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < 5 ? "fill-emerald-400 text-emerald-400" : "fill-white/20 text-white/20"}
                />
              ))}
            </div>
            <span className="text-[13px] text-muted-foreground">
              <span className="text-foreground font-medium">4.8</span> out of 5 based on 1,200+ reviews
            </span>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
