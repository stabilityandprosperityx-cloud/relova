import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MOVE_AS_PERSONAS } from "@/lib/moveAsPersonas";
import { ArrowRight } from "lucide-react";

export default function MoveAsHub() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Where Should I Move? — Relova</title>
        <meta
          name="description"
          content="Free country shortlists for digital nomads, retirees, families, safety-first movers, budget relocators, and anyone seeking a fresh start."
        />
      </Helmet>
      <Navbar />
      <main className="pt-28 pb-20 px-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-[1.75rem] sm:text-[2.2rem] font-semibold text-foreground tracking-tight leading-[1.15] text-center mb-3">
            Where should I move?
          </h1>
          <p className="text-[14px] text-muted-foreground text-center mb-10 leading-relaxed">
            Pick the profile that fits you best. We&apos;ll show a ranked shortlist of countries using
            Relova&apos;s matching engine — no account needed.
          </p>

          <div className="space-y-3">
            {MOVE_AS_PERSONAS.map((persona) => (
              <Link
                key={persona.slug}
                to={`/tools/where-should-i-move/${persona.slug}`}
                className="surface-card p-5 sm:p-6 flex items-start justify-between gap-4 group hover:border-primary/30 transition-colors block"
              >
                <div className="min-w-0">
                  <h2 className="font-serif text-[1.15rem] font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                    {persona.pageTitle}
                  </h2>
                  <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                    {persona.intro}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 mt-1 text-muted-foreground group-hover:text-primary transition-colors"
                />
              </Link>
            ))}
          </div>

          <p className="text-[12px] text-muted-foreground text-center mt-10 leading-relaxed">
            Looking for a passport-specific check instead?{" "}
            <Link to="/tools/can-i-move" className="text-primary hover:underline">
              Can I move with my passport?
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
