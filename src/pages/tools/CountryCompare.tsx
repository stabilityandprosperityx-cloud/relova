import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { countryDatabase } from "@/lib/countryMatching";
import { COMPARE_ROWS } from "@/lib/countryCompareRows";
import { citizenshipDemonym } from "@/lib/demonyms";
import { determineVisaType } from "@/lib/determineVisaType";
import {
  canIMovePath,
  documentsNeededPath,
  hasCanIMoveCrosslink,
  hasDocumentsNeededPage,
} from "@/lib/documentsNeededPairs";
import { unslugify } from "@/lib/toolSlugs";

type FeasibilityStatus = "common" | "uncommon" | "uncached" | "loading" | "error";

interface FeasibilityResult {
  status: FeasibilityStatus;
  note?: string;
}

interface DocCacheResult {
  status: "loading" | "cached" | "uncached";
  count?: number;
}

function useFeasibility(citizenship: string | null, destination: string | null) {
  const [result, setResult] = useState<FeasibilityResult>({ status: "loading" });

  useEffect(() => {
    if (!citizenship || !destination) {
      setResult({ status: "uncached" });
      return;
    }
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

  return result;
}

function useDocCount(citizenship: string | null, destination: string | null) {
  const [result, setResult] = useState<DocCacheResult>({ status: "loading" });
  const visaType = destination ? determineVisaType(destination) : "";

  useEffect(() => {
    if (!citizenship || !destination || !visaType) {
      setResult({ status: "uncached" });
      return;
    }
    let cancelled = false;
    setResult({ status: "loading" });
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-cached-document-checklist", {
          body: {
            citizenship_country: citizenship,
            destination_country: destination,
            visa_type: visaType,
          },
        });
        if (cancelled) return;
        if (
          !error &&
          data?.status === "cached" &&
          Array.isArray(data.documents) &&
          data.documents.length > 0
        ) {
          setResult({ status: "cached", count: data.documents.length });
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
  }, [citizenship, destination, visaType]);

  return result;
}

function FeasibilityBadge({
  countryName,
  profile,
  result,
}: {
  countryName: string;
  profile: (typeof countryDatabase)[0];
  result: FeasibilityResult;
}) {
  if (result.status === "loading") {
    return <p className="text-[13px] text-muted-foreground animate-pulse">Checking cache…</p>;
  }
  if (result.status === "common") {
    return (
      <>
        <span className="inline-flex px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[12px] font-medium mb-2">
          Often feasible
        </span>
        {result.note && (
          <p className="text-[13px] text-foreground leading-relaxed">{result.note}</p>
        )}
      </>
    );
  }
  if (result.status === "uncommon") {
    return (
      <>
        <span className="inline-flex px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[12px] font-medium mb-2">
          Less common for this passport
        </span>
        <p className="text-[13px] text-foreground leading-relaxed">
          Not among the most typical paths — still may be possible depending on your situation.
        </p>
      </>
    );
  }
  return (
    <>
      <span className="inline-flex px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[12px] font-medium mb-2">
        General difficulty only
      </span>
      <p className="text-[13px] text-foreground leading-relaxed">
        <span className="capitalize font-medium">{profile.visaEase}</span>
        {profile.topVisa ? ` — ${profile.topVisa}` : ""}
      </p>
      <p className="text-[11px] text-muted-foreground mt-1">
        Not yet passport-specific for {countryName}.
      </p>
    </>
  );
}

export default function CountryCompare() {
  const { citizenshipSlug, countryASlug, countryBSlug } = useParams<{
    citizenshipSlug?: string;
    countryASlug: string;
    countryBSlug: string;
  }>();

  // 2-segment route: params are countryASlug/countryBSlug only
  // 3-segment route: citizenshipSlug + countryASlug + countryBSlug
  const citizenship = citizenshipSlug ? unslugify(citizenshipSlug) : null;
  const nameA = unslugify(countryASlug || "");
  const nameB = unslugify(countryBSlug || "");

  const profileA = nameA ? countryDatabase.find((c) => c.name === nameA) : undefined;
  const profileB = nameB ? countryDatabase.find((c) => c.name === nameB) : undefined;

  const validDestinations = !!profileA && !!profileB && nameA !== nameB;
  // For 3-segment URLs, citizenship must resolve; destinations must be in countryDatabase
  const valid =
    validDestinations &&
    (!citizenshipSlug || !!citizenship) &&
    // When 3-segment, first param must not accidentally be a destination-only pair
    // mis-routed — React Router handles segment count; we just validate names.
    true;

  const feasA = useFeasibility(citizenship, valid ? nameA : null);
  const feasB = useFeasibility(citizenship, valid ? nameB : null);
  const docsA = useDocCount(citizenship, valid ? nameA : null);
  const docsB = useDocCount(citizenship, valid ? nameB : null);

  const [authOpen, setAuthOpen] = useState(false);

  if (!valid || !profileA || !profileB || !nameA || !nameB) {
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
              We don&apos;t recognize this comparison
            </h1>
            <p className="text-[14px] text-muted-foreground mb-6">
              Try picking two destinations (and optional citizenship) from the list.
            </p>
            <Link to="/tools/country-compare">
              <Button>← Back to Country Compare</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const title = citizenship
    ? `${nameA} vs ${nameB} for ${citizenshipDemonym(citizenship)} citizens`
    : `${nameA} vs ${nameB}`;
  const description = citizenship
    ? `Compare ${nameA} and ${nameB} for ${citizenshipDemonym(citizenship)} citizens — cost, safety, healthcare, visas, and passport-specific feasibility.`
    : `Compare ${nameA} and ${nameB} side by side — cost, safety, healthcare, visa pathways, and more.`;

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
        <div className="max-w-3xl mx-auto">
          <Link
            to="/tools/country-compare"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Compare different countries
          </Link>

          <h1 className="font-serif text-[1.75rem] sm:text-[2.1rem] font-semibold text-foreground tracking-tight leading-[1.15] mb-2">
            {nameA} vs {nameB}
          </h1>
          {citizenship && (
            <p className="text-[15px] text-muted-foreground mb-8">
              for {citizenshipDemonym(citizenship)} citizens
            </p>
          )}
          {!citizenship && <div className="mb-8" />}

          {/* Citizenship-aware feasibility layer */}
          {citizenship && (
            <div className="mb-8">
              <h2 className="text-[13px] font-medium text-foreground mb-3">
                For your passport ({citizenship})
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="surface-card p-5">
                  <div className="text-[14px] font-semibold mb-3">
                    {profileA.flag} {nameA}
                  </div>
                  <FeasibilityBadge countryName={nameA} profile={profileA} result={feasA} />
                </div>
                <div className="surface-card p-5">
                  <div className="text-[14px] font-semibold mb-3">
                    {profileB.flag} {nameB}
                  </div>
                  <FeasibilityBadge countryName={nameB} profile={profileB} result={feasB} />
                </div>
              </div>
            </div>
          )}

          {/* Comparison table */}
          <div className="rounded-2xl border border-border overflow-hidden mb-6">
            <div
              className="grid border-b border-border bg-muted/30"
              style={{ gridTemplateColumns: "140px 1fr 1fr" }}
            >
              <div className="p-4" />
              <div className="p-4 text-center border-l border-border">
                <div className="text-2xl mb-1">{profileA.flag}</div>
                <div className="text-[14px] font-semibold">{nameA}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-2xl mb-1">{profileB.flag}</div>
                <div className="text-[14px] font-semibold">{nameB}</div>
              </div>
            </div>

            {COMPARE_ROWS.map((row, i) => {
              const winner = row.winner(profileA, profileB);
              return (
                <div
                  key={row.label}
                  className={`grid border-b border-border last:border-b-0 ${
                    i % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                  style={{ gridTemplateColumns: "140px 1fr 1fr" }}
                >
                  <div className="p-3 px-4 flex items-center">
                    <span className="text-[12px] text-muted-foreground font-medium">{row.label}</span>
                  </div>
                  {(["a", "b"] as const).map((side) => {
                    const c = side === "a" ? profileA : profileB;
                    const isWinner = winner === side;
                    return (
                      <div
                        key={side}
                        className={`p-3 px-4 flex items-center justify-center border-l border-border ${
                          isWinner ? "bg-primary/5" : ""
                        }`}
                      >
                        <span
                          className={`text-[13px] font-medium capitalize text-center leading-snug ${
                            isWinner ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {row.render(c)}
                          {isWinner && (
                            <span className="block text-[10px] font-normal text-primary/70 mt-0.5 normal-case">
                              stronger
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Document checklist row */}
          {citizenship && (
            <div className="surface-card p-5 mb-6">
              <h2 className="text-[13px] font-medium text-foreground mb-3">Document checklists</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-[13px]">
                {([
                  [nameA, docsA],
                  [nameB, docsB],
                ] as const).map(([dest, docs]) => (
                  <div key={dest}>
                    <p className="font-medium mb-1">{dest}</p>
                    {docs.status === "loading" && (
                      <p className="text-muted-foreground animate-pulse">Checking…</p>
                    )}
                    {docs.status === "cached" && (
                      <p>
                        {docs.count} documents cached
                        {hasDocumentsNeededPage(citizenship, dest) && (
                          <>
                            {" — "}
                            <Link
                              to={documentsNeededPath(citizenship, dest)}
                              className="text-primary hover:underline"
                            >
                              View checklist →
                            </Link>
                          </>
                        )}
                      </p>
                    )}
                    {docs.status === "uncached" && (
                      <p className="text-muted-foreground">Not cached yet</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cross-links */}
          {citizenship && (
            <div className="text-[13px] text-muted-foreground mb-8 space-y-2">
              {hasCanIMoveCrosslink(citizenship, nameA) && (
                <p>
                  <Link to={canIMovePath(citizenship, nameA)} className="text-primary hover:underline">
                    Can I move to {nameA} with this passport? →
                  </Link>
                </p>
              )}
              {hasCanIMoveCrosslink(citizenship, nameB) && (
                <p>
                  <Link to={canIMovePath(citizenship, nameB)} className="text-primary hover:underline">
                    Can I move to {nameB} with this passport? →
                  </Link>
                </p>
              )}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground/70 mb-4 leading-relaxed">
            Not legal advice. Based on general and cached research — verify with official sources before
            making decisions. “Stronger” highlights are relative field comparisons, not a recommendation
            for your personal situation.
          </p>

          <p className="text-[13px] text-muted-foreground mb-8">
            Tracking days toward tax residency?{" "}
            <Link to="/tools/tax-residency-tracker" className="text-primary hover:underline">
              Free 183-day tax residency tracker →
            </Link>
          </p>

          <div className="surface-card p-6 sm:p-8 border-primary/20">
            <p className="font-serif text-lg font-semibold text-foreground mb-2">
              Want a personalized plan for {citizenship ? `${citizenship} → ` : ""}
              {nameA} or {nameB}?
            </p>
            <p className="text-[13px] text-muted-foreground mb-5">
              Create a free account to get a step-by-step relocation plan tailored to your passport,
              family, and goals.
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
        subtitle={`Compare options and get a plan for ${nameA} or ${nameB}.`}
      />
    </div>
  );
}
