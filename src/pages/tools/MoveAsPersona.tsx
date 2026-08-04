import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { getPersonaBySlug, getPersonaMatches } from "@/lib/moveAsPersonas";
import { ArrowLeft } from "lucide-react";

export default function MoveAsPersona() {
  const { personaSlug } = useParams();
  const persona = personaSlug ? getPersonaBySlug(personaSlug) : undefined;
  const [authOpen, setAuthOpen] = useState(false);

  const matches = useMemo(() => (persona ? getPersonaMatches(persona, 8) : []), [persona]);

  if (!persona) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Persona not found — Relova</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Navbar />
        <main className="pt-28 pb-20 px-5">
          <div className="max-w-lg mx-auto surface-card p-8 sm:p-10 text-center">
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-3">
              We don&apos;t recognize this persona
            </h1>
            <p className="text-[14px] text-muted-foreground mb-6">
              Pick a profile from the list to see ranked country matches.
            </p>
            <Link to="/tools/where-should-i-move">
              <Button>← Browse personas</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{persona.pageTitle} — Relova</title>
        <meta name="description" content={persona.metaDescription} />
        <meta property="og:title" content={persona.pageTitle} />
        <meta property="og:description" content={persona.metaDescription} />
      </Helmet>
      <Navbar />
      <main className="pt-28 pb-20 px-5">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/tools/where-should-i-move"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} /> See all personas
          </Link>

          <h1 className="font-serif text-[1.75rem] sm:text-[2.1rem] font-semibold text-foreground tracking-tight leading-[1.15] mb-4">
            {persona.pageTitle}
          </h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-10">{persona.intro}</p>

          <div className="space-y-3 mb-8">
            {matches.map((match, i) => (
              <div
                key={match.country.name}
                className={`rounded-xl border p-3 sm:p-5 transition-all ${
                  i === 0 ? "border-primary/30 bg-primary/5" : "border-border bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-lg">{match.country.flag}</span>
                      <span className="text-[15px] font-semibold text-foreground">{match.country.name}</span>
                      {i === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-medium">
                          Best match
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 mb-3">
                      {match.reasons.map((r, j) => (
                        <p key={j} className="text-[12px] text-muted-foreground">
                          • {r}
                        </p>
                      ))}
                    </div>
                    <div className="flex gap-3 flex-wrap text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {match.country.stabilityMonths} months to stability
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded ${
                          match.difficulty === "Easy"
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : match.difficulty === "Moderate"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              : "bg-red-500/10 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {match.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-red-600/70 dark:text-red-400/60 mt-2">
                      ⚠ {match.topRisk}
                    </p>
                  </div>
                  <div className="text-right shrink-0 min-w-[60px]">
                    <div className="text-xl sm:text-2xl font-bold text-primary">{match.score}%</div>
                    <div className="text-[10px] text-muted-foreground">match</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground/70 mb-8 leading-relaxed">
            General guidance based on typical patterns — your personal situation may differ. Create a
            free account for a match tailored to your passport, budget, and goals.
          </p>

          <div className="surface-card p-6 sm:p-8 border-primary/20">
            <p className="font-serif text-lg font-semibold text-foreground mb-2">
              Want your own personalized match?
            </p>
            <p className="text-[13px] text-muted-foreground mb-5">
              Create a free account to get a shortlist and relocation plan based on your passport,
              family, and goals — not just a general persona.
            </p>
            <Button onClick={() => setAuthOpen(true)}>Get my personalized matches</Button>
          </div>
        </div>
      </main>
      <Footer />
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        title="Start your relocation plan"
        subtitle={`Personalized beyond the ${persona.displayName} shortlist`}
      />
    </div>
  );
}
