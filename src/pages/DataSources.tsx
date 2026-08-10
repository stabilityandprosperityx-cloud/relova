import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";

/**
 * Coverage snapshot from live DB queries (prompt_version v2 + citizenship cache).
 * Update this block when re-running the coverage SQL — these are not live-pulled.
 */
const COVERAGE = {
  asOfLabel: "August 10, 2026",
  documentPairs: 24,
  documentItems: 500,
  itemsWithSource: 496,
  sourcePctExact: "99.2%",
  citizenshipsCached: 8,
  candidateEntries: 151,
  countryDatabaseCount: 106,
  taxRatesCount: 28,
  cacheFreshRange: "August 4–6, 2026",
  staleRows: 0,
} as const;

const STATS: { value: string; label: string }[] = [
  {
    value: String(COVERAGE.documentPairs),
    label: "Citizenship → destination document checklists generated",
  },
  {
    value: `${COVERAGE.documentItems}`,
    label: `Document requirements catalogued — ${COVERAGE.itemsWithSource} (${COVERAGE.sourcePctExact}) with a named official or consular source`,
  },
  {
    value: String(COVERAGE.citizenshipsCached),
    label: `Citizenships analyzed for realistic relocation destinations — ${COVERAGE.candidateEntries} destination matches`,
  },
  {
    value: String(COVERAGE.countryDatabaseCount),
    label: "Countries in our static reference database (lifestyle / cost / safety baseline — not AI checklist research)",
  },
];

export default function DataSources() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Data & Sources — Relova"
        description="How Relova builds document checklists and country notes: real coverage numbers, AI-researched vs static reference tiers, cache freshness, and how to report errors."
        canonical="https://relova.ai/data-sources"
      />
      <Navbar />
      <main className="pt-14">
        <div className="container max-w-[720px] py-20 px-6">
          <h1 className="font-serif text-[2rem] sm:text-[2.35rem] font-semibold tracking-tight text-foreground mb-3">
            Data &amp; Sources
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-3">
            Every document requirement and country note in our tools links to how it was generated and
            verified. Here&apos;s exactly what&apos;s behind the numbers.
          </p>
          <p className="text-[13px] text-muted-foreground/70 mb-14">
            Coverage figures as of {COVERAGE.asOfLabel}. These grow as we research more pairs — they
            are not a permanent claim.
          </p>

          {/* Current coverage */}
          <section className="mb-16">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
              Current coverage
            </h2>
            <p className="text-[13px] text-muted-foreground mb-6">
              Snapshot from our live caches and static reference files, as of {COVERAGE.asOfLabel}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-muted/30 px-5 py-4"
                >
                  <p className="font-serif text-3xl font-semibold text-foreground tracking-tight mb-1.5">
                    {stat.value}
                  </p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-muted-foreground/70 mt-4 leading-relaxed">
              Of {COVERAGE.documentItems} cached document items, {COVERAGE.itemsWithSource} carry a
              non-empty named source field; {COVERAGE.documentItems - COVERAGE.itemsWithSource} do
              not. We do not treat those {COVERAGE.documentItems - COVERAGE.itemsWithSource} as
              sourced evidence.
            </p>
          </section>

          {/* How data is generated */}
          <section className="mb-16">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
              How data is generated
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
              Document checklists and citizenship-specific destination notes are produced by an AI
              research pipeline that searches the live web, prioritizes official government and
              consular sources, and stores results in a cache. Cached entries are treated as valid
              for about 30 days, then eligible for re-verification. Two confidence tiers matter:
            </p>

            <div className="space-y-5">
              <div className="rounded-xl border border-border px-5 py-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground/70 mb-2">
                  Tier 1 — AI-researched, source-cited
                </p>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  Document checklists and citizenship-specific feasibility notes. Today,{" "}
                  {COVERAGE.itemsWithSource} of {COVERAGE.documentItems} document items (
                  {COVERAGE.sourcePctExact}) include a named official or consular source. When a
                  source is missing, we do not present that item as verified evidence.
                </p>
              </div>

              <div className="rounded-xl border border-border border-dashed px-5 py-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground/70 mb-2">
                  Tier 2 — Static reference data
                </p>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
                  Our country reference database covers {COVERAGE.countryDatabaseCount} countries
                  (cost level, safety score, healthcare quality, climate, and similar fields used for
                  general comparison). A separate tax-rate table covers {COVERAGE.taxRatesCount}{" "}
                  countries for comparison tools.
                </p>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  This tier is a compiled editorial baseline — not government-sourced, not
                  citizenship-specific, and not produced by the same checklist research pipeline.
                  It can inform shortlists and comparisons, but it should not be read with the same
                  confidence as a source-cited document requirement.
                </p>
              </div>
            </div>
          </section>

          {/* Gaps */}
          <section className="mb-16">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
              What we don&apos;t have yet
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
              Most citizenship / destination pairs haven&apos;t been researched yet. Coverage is
              intentionally incomplete: we publish what we&apos;ve actually generated, not a
              fabricated worldwide catalogue.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
              When you check a pair we haven&apos;t covered in{" "}
              <Link to="/tools/can-i-move" className="text-primary hover:underline">
                Can I Move
              </Link>{" "}
              or{" "}
              <Link to="/tools/documents-needed" className="text-primary hover:underline">
                Documents Needed
              </Link>
              , the tools say so clearly (uncached / general-only states) rather than guessing.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              That gap is a trust signal, not a bug: we would rather show an empty or limited result
              than invent a checklist without research behind it.
            </p>
          </section>

          {/* Freshness */}
          <section className="mb-16">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
              Freshness policy
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
              AI-researched checklist and citizenship caches are kept for roughly 30 days. After that
              window, entries are treated as stale and eligible for regeneration so requirements can
              be re-checked against current official sources.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              As of {COVERAGE.asOfLabel}, all cached document checklists (v2) and citizenship
              candidate rows were generated within {COVERAGE.cacheFreshRange} —{" "}
              {COVERAGE.staleRows} stale rows pending regeneration.
            </p>
          </section>

          {/* Corrections */}
          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
              Found something wrong?
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              If a document requirement or country note looks outdated or wrong, email{" "}
              <a
                href="mailto:support@relova.ai?subject=Data%20source%20correction"
                className="text-primary hover:underline"
              >
                support@relova.ai
              </a>{" "}
              with the specific item (citizenship, destination, and what looks off). We&apos;ll look
              into it — we don&apos;t publish a fixed response SLA here because we won&apos;t promise
              a turnaround we can&apos;t reliably honor.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
