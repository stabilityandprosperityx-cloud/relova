import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { formatVisaTypeLabel } from "@/lib/determineVisaType";
import {
  DOCUMENTS_LAUNCH_PAIRS,
  documentsNeededPath,
} from "@/lib/documentsNeededPairs";

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

/**
 * generated_at from scripts/document-checklist-snapshots.json for each published
 * Documents Needed pair. Not live-pulled — update when snapshots are re-warmed.
 */
const CHECKLIST_LAST_VERIFIED: Record<string, string> = {
  "Russia|Portugal": "2026-08-05T10:30:57.556Z",
  "Russia|Armenia": "2026-08-05T10:32:14.414Z",
  "Russia|Cyprus": "2026-08-05T10:33:59.056Z",
  "Russia|Czech Republic": "2026-08-05T10:35:26.967Z",
  "Russia|Montenegro": "2026-08-05T11:42:18.803Z",
  "Russia|Georgia": "2026-08-05T10:37:15.467Z",
  "Russia|Turkey": "2026-08-05T10:38:43.931Z",
  "Russia|UAE": "2026-08-05T10:40:23.663Z",
  "Russia|Thailand": "2026-08-05T10:41:56.984Z",
  "United States|Portugal": "2026-08-05T10:43:38.158Z",
  "United States|Mexico": "2026-08-05T10:45:02.697Z",
  "United Kingdom|Spain": "2026-08-05T10:46:38.841Z",
  "India|UAE": "2026-08-05T10:48:17.376Z",
  "India|Germany": "2026-08-05T12:02:30.880Z",
  "Brazil|Portugal": "2026-08-05T10:49:28.892Z",
  "Brazil|Spain": "2026-08-05T12:09:56.591Z",
  "China|Japan": "2026-08-05T10:51:05.141Z",
  "China|Singapore": "2026-08-05T12:05:25.548Z",
  "Nigeria|United Kingdom": "2026-08-05T12:11:51.862Z",
  "Nigeria|Canada": "2026-08-05T11:57:08.806Z",
  "Philippines|UAE": "2026-08-05T11:59:10.613Z",
  "Philippines|Canada": "2026-08-05T12:00:44.114Z",
  "Germany|Portugal": "2026-08-05T11:53:57.924Z",
};

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

function formatVerifiedDateUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function lastVerifiedLabel(citizenship: string, destination: string): string {
  const iso = CHECKLIST_LAST_VERIFIED[`${citizenship}|${destination}`];
  if (!iso) return "No snapshot date";
  return formatVerifiedDateUtc(iso);
}

const publishedPairCount = DOCUMENTS_LAUNCH_PAIRS.length;

const publishedVerifiedDates = [
  ...new Set(Object.values(CHECKLIST_LAST_VERIFIED).map(formatVerifiedDateUtc)),
];
const publishedVerifiedRange =
  publishedVerifiedDates.length === 1
    ? publishedVerifiedDates[0]
    : publishedVerifiedDates.join(" / ");

export default function DataSources() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Data & Sources — Relova"
        description="How Relova builds document checklists: methodology, coverage, last-verified dates for each published pair, and terms for citing source-cited (Tier 1) data."
        canonical="https://relova.ai/data-sources"
      />
      <Navbar />
      <main className="pt-14">
        <div className="container max-w-[840px] py-20 px-6">
          <h1 className="font-serif text-[2rem] sm:text-[2.35rem] font-semibold tracking-tight text-foreground mb-3">
            Data &amp; Sources
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
            Relova publishes two kinds of information: AI-researched document checklists
            with named official or consular sources, and static editorial baselines used
            for comparison. This page states which is which, how the checklist cache is
            kept, and which checklists you may cite.
          </p>

          <aside
            id="cite"
            className="rounded-xl border border-border bg-muted/30 px-5 py-4 mb-14 scroll-mt-20"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground/70 mb-2">
              Citing this page
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
              Source-cited document checklists (Tier 1) linked below are free to cite with
              attribution to Relova (relova.ai). Include the last-verified date shown for
              that pair. The static country database and tax-rate overlay (Tier 2) are
              editorial baselines without per-field sources — they are not offered as a
              citable dataset.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              For data citation or press inquiries, email{" "}
              <a
                href="mailto:support@relova.ai?subject=Data%20citation"
                className="text-primary hover:underline"
              >
                support@relova.ai
              </a>{" "}
              with subject &quot;Data citation&quot;.
            </p>
          </aside>

          {/* How data is generated */}
          <section id="methodology" className="mb-16 scroll-mt-20">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
              How data is generated
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
              Three layers sit behind our tools. Only the first is source-cited research.
              The other two are compiled editorial files and should not be read as
              official figures.
            </p>

            <div className="space-y-5">
              <div className="rounded-xl border border-border px-5 py-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground/70 mb-2">
                  1. Document checklists — AI-researched, source-cited (Tier 1)
                </p>
                <p className="text-[13px] text-muted-foreground/70 mb-3">
                  Last verified (published pair pages): {publishedVerifiedRange}.
                  Cache-coverage snapshot as of {COVERAGE.asOfLabel}: generated{" "}
                  {COVERAGE.cacheFreshRange}.
                </p>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
                  An AI research pipeline searches the live web, prioritizes official
                  government and consular sources, and stores results in a cache keyed by
                  citizenship, destination, and visa type. Cached entries are treated as
                  valid for about 30 days, then eligible for re-verification. Today,{" "}
                  {COVERAGE.itemsWithSource} of {COVERAGE.documentItems} document items (
                  {COVERAGE.sourcePctExact}) include a named official or consular source.
                  When a source is missing, we do not present that item as verified
                  evidence.
                </p>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  Citizenship-specific destination notes in Can I Move use a related AI
                  cache ({COVERAGE.citizenshipsCached} citizenships,{" "}
                  {COVERAGE.candidateEntries} destination matches as of{" "}
                  {COVERAGE.asOfLabel}). Those notes are not the same as the source-cited
                  checklist items in the table below.
                </p>
              </div>

              <div className="rounded-xl border border-border border-dashed px-5 py-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground/70 mb-2">
                  2. Country reference database — static, editorial (Tier 2)
                </p>
                <p className="text-[13px] text-muted-foreground/70 mb-3">
                  No per-field verification date.
                </p>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  A compiled country file covering {COVERAGE.countryDatabaseCount}{" "}
                  countries (cost level, safety score, healthcare quality, climate, and
                  similar fields used for general comparison). It is not
                  government-sourced, not citizenship-specific, and not produced by the
                  checklist research pipeline. It can inform shortlists, but it should not
                  be read with the same confidence as a source-cited document requirement.
                </p>
              </div>

              <div className="rounded-xl border border-border border-dashed px-5 py-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-foreground/70 mb-2">
                  3. Tax-rate overlay — static, editorial (Tier 2)
                </p>
                <p className="text-[13px] text-muted-foreground/70 mb-3">
                  No per-field verification date.
                </p>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  A separate overlay covering {COVERAGE.taxRatesCount} countries, used
                  only in comparison tools. It is a compiled editorial baseline — not
                  government-sourced, and not listed as figures on this page. It is not
                  offered as a citable dataset.
                </p>
              </div>
            </div>
          </section>

          {/* Current coverage */}
          <section id="coverage" className="mb-16 scroll-mt-20">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
              Current coverage
            </h2>
            <p className="text-[13px] text-muted-foreground mb-6">
              Snapshot from our live caches and static reference files, as of{" "}
              {COVERAGE.asOfLabel}. These grow as we research more pairs — they are not a
              permanent claim.
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
              Of {COVERAGE.documentItems} cached document items, {COVERAGE.itemsWithSource}{" "}
              carry a non-empty named source field;{" "}
              {COVERAGE.documentItems - COVERAGE.itemsWithSource} do not. We do not treat
              those {COVERAGE.documentItems - COVERAGE.itemsWithSource} as sourced
              evidence.
            </p>
          </section>

          {/* Published checklists table */}
          <section id="checklists" className="mb-16 scroll-mt-20">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
              Published document checklists
            </h2>
            <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed">
              Last-verified dates below are the cache timestamps from the document-checklist
              snapshot used to prerender each pair page — not a live database query. The
              same date appears on the pair page.
            </p>
            <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">
              The table lists every checklist with a public Documents Needed URL
              ({publishedPairCount} pairs). Coverage figures above count{" "}
              {COVERAGE.documentPairs} cached checklists as of {COVERAGE.asOfLabel}; one
              cached row is not published as a standalone page, so it is not listed here.
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-[13px] min-w-[640px]">
                <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Citizenship</th>
                    <th className="px-3 py-2.5 font-medium">Destination</th>
                    <th className="px-3 py-2.5 font-medium">Visa pathway</th>
                    <th className="px-3 py-2.5 font-medium">Last verified</th>
                    <th className="px-3 py-2.5 font-medium">Checklist</th>
                  </tr>
                </thead>
                <tbody>
                  {DOCUMENTS_LAUNCH_PAIRS.map((pair) => (
                    <tr
                      key={`${pair.citizenship}|${pair.destination}`}
                      className="border-t border-border"
                    >
                      <td className="px-3 py-2.5 text-foreground">{pair.citizenship}</td>
                      <td className="px-3 py-2.5 text-foreground">{pair.destination}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {formatVisaTypeLabel(pair.visa_type)}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                        {lastVerifiedLabel(pair.citizenship, pair.destination)}
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          to={documentsNeededPath(pair.citizenship, pair.destination)}
                          className="text-primary hover:underline whitespace-nowrap"
                        >
                          View checklist
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Gaps */}
          <section className="mb-16">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
              What we don&apos;t have yet
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
              Most citizenship / destination pairs haven&apos;t been researched yet.
              Coverage is intentionally incomplete: we publish what we&apos;ve actually
              generated, not a fabricated worldwide catalogue.
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
              , the tools say so clearly (uncached / general-only states) rather than
              guessing.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              That gap is a trust signal, not a bug: we would rather show an empty or
              limited result than invent a checklist without research behind it.
            </p>
          </section>

          {/* Freshness */}
          <section id="freshness" className="mb-16 scroll-mt-20">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
              Freshness policy
            </h2>
            <p className="text-[13px] text-muted-foreground/70 mb-3">
              Applies to AI caches only (document checklists and citizenship candidate
              notes). As of {COVERAGE.asOfLabel}.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
              AI-researched checklist and citizenship caches are kept for roughly 30 days.
              After that window, entries are treated as stale and eligible for regeneration
              so requirements can be re-checked against current official sources.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
              As of {COVERAGE.asOfLabel}, all cached document checklists (v2) and
              citizenship candidate rows were generated within {COVERAGE.cacheFreshRange}{" "}
              — {COVERAGE.staleRows} stale rows pending regeneration.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              The static country database and tax-rate overlay are not on this refresh
              cycle. They have no per-field verification date.
            </p>
          </section>

          {/* Contact */}
          <section id="contact" className="mb-8 scroll-mt-20">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
              Contact
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
              If a document requirement looks outdated or wrong, email{" "}
              <a
                href="mailto:support@relova.ai?subject=Data%20source%20correction"
                className="text-primary hover:underline"
              >
                support@relova.ai
              </a>{" "}
              with the specific item (citizenship, destination, and what looks off).
              We&apos;ll look into it — we don&apos;t publish a fixed response SLA here
              because we won&apos;t promise a turnaround we can&apos;t reliably honor.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              For data citation or press inquiries, email{" "}
              <a
                href="mailto:support@relova.ai?subject=Data%20citation"
                className="text-primary hover:underline"
              >
                support@relova.ai
              </a>{" "}
              with subject &quot;Data citation&quot;.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
