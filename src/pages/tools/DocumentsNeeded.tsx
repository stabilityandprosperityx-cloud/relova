import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { determineVisaType, formatVisaTypeLabel } from "@/lib/determineVisaType";
import { canIMoveTitle } from "@/lib/demonyms";
import { hasCanIMoveCrosslink, canIMovePath } from "@/lib/documentsNeededPairs";
import { DocumentsPopularLinks } from "@/components/tools/DocumentsPopularLinks";
import { unslugify } from "@/lib/toolSlugs";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface DocItem {
  name: string;
  description?: string;
  phase?: "before" | "during" | "after" | string;
  required?: boolean;
  category?: string;
  source?: string | null;
}

type ChecklistStatus = "loading" | "cached" | "uncached" | "error";

const PHASES: { id: "before" | "during" | "after"; label: string }[] = [
  { id: "before", label: "Before you leave" },
  { id: "during", label: "On arrival / setup" },
  { id: "after", label: "After settling in" },
];

function formatVerifiedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

function SourceCitation({ source }: { source: string }) {
  const trimmed = source.trim();
  if (isHttpUrl(trimmed)) {
    let label = trimmed;
    try {
      label = new URL(trimmed).hostname.replace(/^www\./, "");
    } catch {
      /* keep full URL as label */
    }
    return (
      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1.5"
      >
        Source: {label}
        <ExternalLink size={10} />
      </a>
    );
  }
  return <p className="text-[11px] text-muted-foreground mt-1.5">Source: {trimmed}</p>;
}

export default function DocumentsNeeded() {
  const { citizenshipSlug, destinationSlug } = useParams();
  const citizenship = unslugify(citizenshipSlug || "");
  const destination = unslugify(destinationSlug || "");
  const visaType = destination ? determineVisaType(destination) : "";

  const [status, setStatus] = useState<ChecklistStatus>("loading");
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!citizenship || !destination || !visaType) return;

    let cancelled = false;
    setStatus("loading");
    setDocuments([]);
    setGeneratedAt(null);

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
        if (error || !data?.status) {
          setStatus("uncached");
          return;
        }
        if (data.status === "cached" && Array.isArray(data.documents) && data.documents.length > 0) {
          setDocuments(data.documents as DocItem[]);
          setGeneratedAt(typeof data.generated_at === "string" ? data.generated_at : null);
          setStatus("cached");
        } else {
          setStatus("uncached");
        }
      } catch {
        if (!cancelled) setStatus("uncached");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [citizenship, destination, visaType]);

  const grouped = useMemo(() => {
    const map: Record<string, DocItem[]> = { before: [], during: [], after: [] };
    for (const doc of documents) {
      const phase = doc.phase === "during" || doc.phase === "after" ? doc.phase : "before";
      map[phase].push(doc);
    }
    return map;
  }, [documents]);

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
            <Link to="/tools/documents-needed">
              <Button>← Back to document finder</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const title = `What documents do I need to move to ${destination} as a ${citizenship} citizen?`;
  const description = `Document checklist for relocating from ${citizenship} to ${destination} (${formatVisaTypeLabel(visaType)} pathway) — Relova.`;

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
            to="/tools/documents-needed"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Check a different combination
          </Link>

          <h1 className="font-serif text-[1.75rem] sm:text-[2.1rem] font-semibold text-foreground tracking-tight leading-[1.15] mb-3">
            {title}
          </h1>
          <p className="text-[13px] text-muted-foreground mb-2">
            Typical pathway: <span className="text-foreground font-medium">{formatVisaTypeLabel(visaType)}</span>
          </p>
          {status === "cached" && generatedAt && (
            <div className="mb-8 space-y-1.5">
              <p className="text-[13px] text-foreground/80 font-medium">
                Last verified: {formatVerifiedDate(generatedAt)}
              </p>
              <p className="text-[12px] text-muted-foreground">
                <Link to="/data-sources" className="text-primary hover:underline">
                  See our data sources →
                </Link>
              </p>
            </div>
          )}
          {status !== "cached" && <div className="mb-8" />}

          {status === "loading" && (
            <div className="surface-card p-6 sm:p-8 mb-6">
              <p className="text-[14px] text-muted-foreground animate-pulse">Loading cached checklist…</p>
            </div>
          )}

          {status === "cached" && (
            <div className="space-y-8 mb-8">
              {PHASES.map((phase) => {
                const items = grouped[phase.id] || [];
                if (items.length === 0) return null;
                return (
                  <section key={phase.id}>
                    <h2 className="font-serif text-lg font-semibold text-foreground mb-3">{phase.label}</h2>
                    <ul className="space-y-3">
                      {items.map((doc) => (
                        <li key={doc.name} className="rounded-xl border border-border bg-muted/40 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[14px] font-semibold text-foreground">{doc.name}</p>
                            {doc.required !== false ? (
                              <span className="shrink-0 px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                                Required
                              </span>
                            ) : (
                              <span className="shrink-0 px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-medium">
                                Optional
                              </span>
                            )}
                          </div>
                          {doc.description && (
                            <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
                              {doc.description}
                            </p>
                          )}
                          {doc.source ? <SourceCitation source={doc.source} /> : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}

          {status === "uncached" && (
            <div className="surface-card p-6 sm:p-8 mb-6">
              <span className="inline-flex px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[12px] font-medium mb-4">
                Checklist not cached yet
              </span>
              <p className="text-[15px] text-foreground leading-relaxed mb-3">
                We don&apos;t have a verified document list for {citizenship} → {destination} yet.
                Try one of the popular combinations below, or create a free account to generate a
                personalized checklist.
              </p>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                <DocumentsPopularLinks limit={5} />
              </p>
            </div>
          )}

          {hasCanIMoveCrosslink(citizenship, destination) && (
            <p className="text-[13px] text-muted-foreground mb-8">
              Also:{" "}
              <Link to={canIMovePath(citizenship, destination)} className="text-primary hover:underline">
                {canIMoveTitle(destination, citizenship)} →
              </Link>
            </p>
          )}

          <p className="text-[11px] text-muted-foreground/70 mb-8 leading-relaxed">
            Not legal advice. Based on cached research — verify with official sources before making
            decisions.
          </p>

          <div className="surface-card p-6 sm:p-8 border-primary/20">
            <p className="font-serif text-lg font-semibold text-foreground mb-2">
              Track these documents in your personalized Relova plan
            </p>
            <p className="text-[13px] text-muted-foreground mb-5">
              Create a free account to save this checklist, upload files, and get a step-by-step plan
              for {citizenship} → {destination}.
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
        subtitle={`Document checklist for ${citizenship} → ${destination}`}
      />
    </div>
  );
}
