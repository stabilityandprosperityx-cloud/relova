import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-[80px] md:py-[100px] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(99,102,241,0.04) 50%, transparent 100%)",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px section-divider" />
      <div className="container relative z-10">
        <motion.div
          className="max-w-[600px] mx-auto text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-[11px] font-medium tracking-wide"
            style={{
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.2)",
              color: "#8b5cf6",
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#8b5cf6", display: "inline-block" }} />
            Start your journey today
          </div>
          <h2 className="text-[2rem] md:text-[2.75rem] font-bold tracking-tight mb-5 leading-[1.05]">
            Start your next chapter<br />with clarity.
          </h2>
          <p className="text-muted-foreground text-[15px] mb-10 leading-relaxed max-w-[400px] mx-auto">
            Join Relova and get a structured path to your new country. AI-powered, human-verified.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/chat">
              <button
                className="inline-flex items-center gap-2 rounded-[10px] px-8 h-[52px] text-[15px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  boxShadow: "0 0 40px rgba(139,92,246,0.3)",
                  border: "none",
                }}
              >
                Get my plan <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </Link>
            <Link to="/pricing">
              <button className="inline-flex items-center gap-2 rounded-[10px] px-8 h-[52px] text-[15px] text-muted-foreground border border-border hover:border-primary/30 transition-all bg-transparent">
                View pricing
              </button>
            </Link>
          </div>
          <p className="text-[12px] text-muted-foreground/40 mt-5">
            Free to start · No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
