import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import BestMatchCard from "./BestMatchCard";
import heroBalcony from "@/assets/redesign/hero-balcony.jpg";

const AVATARS = [
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=33",
  "https://i.pravatar.cc/150?img=48",
  "https://i.pravatar.cc/150?img=60",
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background min-h-[calc(100vh-60px)]">

      {/* ── Full-bleed photo layer — right 50% of viewport, full height ── */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
      >
        {/* Photo with left+top edge fade into background */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            maskImage: [
              "linear-gradient(to bottom, transparent 0%, black 9%, black 100%)",
              "linear-gradient(to right,  transparent 0%, black 10%, black 100%)",
            ].join(", "),
            maskComposite: "intersect",
            WebkitMaskImage: [
              "linear-gradient(to bottom, transparent 0%, black 9%, black 100%)",
              "linear-gradient(to right,  transparent 0%, black 10%, black 100%)",
            ].join(", "),
            WebkitMaskComposite: "source-in",
          }}
        >
          <img
            src={heroBalcony}
            alt="Person enjoying a sunlit balcony view in their new home abroad"
            className="w-full h-full object-cover object-center"
          />
          {/* Warm bottom overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(30,20,10,0.3) 0%, transparent 50%)" }}
          />
        </div>
      </motion.div>

      {/* ── Content layer — text left, BestMatchCard anchor right ── */}
      <div className="relative z-10 container max-w-6xl px-5 md:px-8 py-20 md:py-28 lg:py-0 min-h-[calc(100vh-60px)] flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full lg:min-h-[calc(100vh-60px)]">

          {/* Text block */}
          <motion.div
            className="max-w-[540px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="font-serif text-[2.6rem] sm:text-[3.2rem] md:text-[3.8rem] lg:text-[4rem] font-semibold leading-[1.08] mb-5 text-foreground">
              Your next chapter,<br />
              planned with{" "}
              <span className="italic" style={{ color: "hsl(var(--primary))" }}>
                clarity.
              </span>
            </h1>

            <p className="text-[16px] md:text-[17px] leading-[1.7] mb-8 text-muted-foreground max-w-[440px]">
              AI-powered relocation planning that finds the right country, builds your personalized plan, and guides you every step of the way.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
              <Link to="/chat">
                <button
                  className="inline-flex items-center gap-2 rounded-[10px] px-7 h-[50px] text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "hsl(var(--primary))",
                    boxShadow: "0 4px 24px hsl(var(--primary) / 0.35)",
                  }}
                >
                  Find my best match <ArrowRight size={15} strokeWidth={2.5} />
                </button>
              </Link>
              <Link to="/countries">
                <Button
                  variant="outline"
                  className="h-[50px] px-7 text-[14px] rounded-[10px] border-border bg-card/60 hover:bg-card"
                >
                  Try the demo
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {AVATARS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Relova user"
                    loading="lazy"
                    className="w-8 h-8 rounded-full border-2 border-background object-cover object-center"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[12px] text-muted-foreground">
                  Trusted by{" "}
                  <span className="font-semibold text-foreground">12,000+</span>{" "}
                  future movers &nbsp;·&nbsp; 4.8/5 from 1,200+ reviews
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right column — anchor for BestMatchCard */}
          {/* self-stretch gives this column the full grid row height so bottom-N works */}
          <div className="relative hidden lg:block self-stretch">
            <motion.div
              className="absolute z-20"
              style={{ bottom: "14%", left: "-100px" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
            >
              <BestMatchCard />
            </motion.div>
          </div>

        </div>
      </div>

    </section>
  );
}
