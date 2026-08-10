import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { countryDatabase } from "@/lib/countryMatching";
import { canIMoveTitle } from "@/lib/demonyms";
import { hasDocumentsNeededPage, documentsNeededPath } from "@/lib/documentsNeededPairs";
import { unslugify } from "@/lib/toolSlugs";
import { ArrowLeft } from "lucide-react";

type FeasibilityStatus = "common" | "uncommon" | "uncached" | "loading" | "error";

interface FeasibilityResult {
  status: FeasibilityStatus;
  note?: string;
  generatedAt?: string;
}

function formatVerifiedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function CanIMove() {
  const { citizenshipSlug, destinationSlug } = useParams();
  const citizenship = unslugify(citizenshipSlug || "");
  const destination = unslugify(destinationSlug || "");
  const [result, setResult] = useState<FeasibilityResult>({ status: "loading" });
  const [authOpen, setAuthOpen] = useState(false);

  const destinationProfile = destination
    ? countryDatabase.find((c) => c.name === destination)
    : undefined;

  useEffect(() => {
    if (!citizenship || !destination) return;

    let cancelled = false;
    setResult({ status: "loading" });

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-cached-feasibility", {
          body: {
            citizenship_country: citizenship,
            destination_country: destination,
          },
        });
        if (cancelled) return;
        if (error || !data?.status) {
          setResult({ status: "uncached" });
          return;
        }
        const status = data.status as FeasibilityStatus;
        if (status === "common" || status === "uncommon" || status === "uncached") {
          setResult({
            status,
            note: typeof data.note === "string" ? data.note : undefined,
            generatedAt: typeof data.generated_at === "string" ? data.generated_at : undefined,
          });
        } else {
          setResult({ status: "uncached" });
        }
      } catch {
        if (!cancelled) setResult({ status: "uncached" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [citizenship, destination]);

  if (!citizenship || !destination) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Combination not recognized — Relova</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Navbar />
        <main className="pt-28 pb-20 px-5">
          <div className="max-w-lg mx-auto surface-card p-8 sm:p-10 text-center">
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-3">
              We don&apos;t recognize this combination
            </h1>
            <p className="text-[14px] text-muted-foreground mb-6">
              Try picking your citizenship and destination from the list.
            </p>
            <Link to="/tools/can-i-move">
              <Button>← Back to the checker</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const title = canIMoveTitle(destination, citizenship);
  const description = `Quick check: relocating from ${citizenship} to ${destination} — common paths, visa difficulty, and next steps with Relova.`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title} — Relova</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Helmet>
      <Navbar />
      <main className="pt-28 pb-20 px-5">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/tools/can-i-move"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Check a different combination
          </Link>

          <h1 className="font-serif text-[1.75rem] sm:text-[2.1rem] font-semibold text-foreground tracking-tight leading-[1.15] mb-8">
            {title}
          </h1>

          <div className="surface-card p-6 sm:p-8 mb-6">
            {result.status === "loading" && (
              <p className="text-[14px] text-muted-foreground animate-pulse">Checking cached research…</p>
            )}

            {result.status === "common" && (
              <>
                <span className="inline-flex px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[12px] font-medium mb-4">
                  Often feasible
                </span>
                {result.note && (
                  <p className="text-[15px] text-foreground leading-relaxed">{result.note}</p>
                )}
              </>
            )}

            {result.status === "uncommon" && (
              <>
                <span className="inline-flex px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[12px] font-medium mb-4">
                  Less common for this passport
                </span>
                <p className="text-[15px] text-foreground leading-relaxed">
                  This doesn&apos;t mean it&apos;s impossible — just not among the most typical paths for
                  this passport.
                </p>
              </>
            )}

            {result.status === "uncached" && (
              <>
                <span className="inline-flex px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[12px] font-medium mb-4">
                  General difficulty only
                </span>
                <p className="text-[15px] text-foreground leading-relaxed mb-2">
                  {destinationProfile ? (
                    <>
                      General visa difficulty for {destination}:{" "}
                      <span className="font-medium capitalize">{destinationProfile.visaEase}</span>
                      {destinationProfile.topVisa ? (
                        <> — typical path: {destinationProfile.topVisa}</>
                      ) : null}
                      .
                    </>
                  ) : (
                    <>We have limited general data for this destination.</>
                  )}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  This is general guidance, not specific to your passport yet.
                </p>
              </>
            )}
          </div>

          {(result.status === "common" || result.status === "uncommon") && result.generatedAt && (
            <div className="mb-6 space-y-1.5">
              <p className="text-[13px] text-foreground/80 font-medium">
                Last verified: {formatVerifiedDate(result.generatedAt)}
              </p>
              <p className="text-[12px] text-muted-foreground">
                <Link to="/data-sources" className="text-primary hover:underline">
                  See our data sources →
                </Link>
              </p>
            </div>
          )}

          {result.status === "uncached" && (
            <p className="text-[12px] text-muted-foreground mb-6">
              <Link to="/data-sources" className="text-primary hover:underline">
                See our data sources →
              </Link>
            </p>
          )}

          <p className="text-[11px] text-muted-foreground/70 mb-8 leading-relaxed">
            Not legal advice. Based on general and cached research — verify with official sources before
            making decisions.
          </p>

          {hasDocumentsNeededPage(citizenship, destination) && (
            <p className="text-[13px] text-muted-foreground mb-8">
              Also:{" "}
              <Link
                to={documentsNeededPath(citizenship, destination)}
                className="text-primary hover:underline"
              >
                What documents do I need to move to {destination} as a {citizenship} citizen? →
              </Link>
            </p>
          )}

          <div className="surface-card p-6 sm:p-8 border-primary/20">
            <p className="font-serif text-lg font-semibold text-foreground mb-2">
              Want a personalized relocation plan and document checklist for {citizenship} →{" "}
              {destination}?
            </p>
            <p className="text-[13px] text-muted-foreground mb-5">
              Create a free account to get a step-by-step plan tailored to your passport, family, and
              goals.
            </p>
            <Button onClick={() => setAuthOpen(true)}>Get my relocation plan</Button>
          </div>
        </div>
      </main>
      <Footer />
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        title="Start your relocation plan"
        subtitle={`Personalized for ${citizenship} → ${destination}`}
      />
    </div>
  );
}
