/**
 * Post-build: write static HTML shells for /countries (hub) and every
 * /countries/<slug> page, mirroring the pattern in prerender-tools.mjs.
 *
 * Why: CountryPage.tsx (src/pages/CountryPage.tsx) renders per-country
 * title/description only via react-helmet-async client-side — with zero
 * static HTML, crawlers see identical boilerplate on all 63 country pages
 * until/unless they execute JS. This writes real title/H1/description/body
 * content for each page at build time; the SPA still hydrates on top via
 * the same bundle, so interactivity is unaffected.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");
const indexPath = join(distDir, "index.html");

if (!existsSync(indexPath)) {
  console.error("prerender-countries: dist/index.html missing — run vite build first");
  process.exit(1);
}

const indexHtml = readFileSync(indexPath, "utf8");

function extractHeadAssets(html) {
  const links = [...html.matchAll(/<link[^>]+href="\/assets\/[^"]+"[^>]*>/g)].map((m) => m[0]);
  const scripts = [...html.matchAll(/<script[^>]+src="\/assets\/[^"]+"[^>]*><\/script>/g)].map((m) => m[0]);
  return { links, scripts };
}

const { links, scripts } = extractHeadAssets(indexHtml);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writePage({ outPath, title, description, canonical, bodyHtml, jsonLd }) {
  mkdirSync(dirname(outPath), { recursive: true });
  const jsonLdList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const jsonLdScripts = jsonLdList
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join("\n    ");
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/favicon.png?v=3" type="image/png" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    ${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : ""}
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${jsonLdScripts}
    ${links.join("\n    ")}
  </head>
  <body>
    <div id="root">${bodyHtml}</div>
    ${scripts.join("\n    ")}
  </body>
</html>
`;
  writeFileSync(outPath, html, "utf8");
  console.log("prerender-countries: wrote", outPath.replace(distDir, "dist"));
}

let countries = [];
try {
  const viteNodeBin = join(__dirname, "..", "node_modules", ".bin", "vite-node");
  const raw = execFileSync(viteNodeBin, [join(__dirname, "dump-countries.ts")], {
    encoding: "utf8",
    cwd: join(__dirname, ".."),
  });
  countries = JSON.parse(raw.trim());
} catch (err) {
  console.error("prerender-countries: failed to dump countryData", err);
  process.exit(1);
}

// ─── Hub: /countries ───
writePage({
  outPath: join(distDir, "countries", "index.html"),
  title: `${countries.length}+ Relocation Destinations — Visas, Taxes & Cost of Living | Relova`,
  description: `Explore ${countries.length} destinations with Relova: compare visa pathways, tax regimes, and real cost-of-living data for ${countries
    .slice(0, 6)
    .map((c) => c.name)
    .join(", ")}, and more.`,
  canonical: "https://relova.ai/countries",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Countries", item: "https://relova.ai/countries" }],
  },
  bodyHtml: `
    <main style="max-width:56rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <h1 style="font-family:Georgia,serif;font-size:1.9rem;line-height:1.2">Compare relocation destinations</h1>
      <p style="color:#666;margin-top:0.75rem">Real visa paths, tax regimes, and cost-of-living data for ${countries.length} countries.</p>
      <ul style="margin-top:1.5rem;columns:2;list-style:none;padding:0">
        ${countries
          .map((c) => `<li style="margin-bottom:0.4rem"><a href="/countries/${c.slug}">${escapeHtml(c.flag)} ${escapeHtml(c.name)}</a></li>`)
          .join("\n        ")}
      </ul>
    </main>
  `,
});

// ─── Per-country pages: /countries/<slug> ───
for (const c of countries) {
  const title = `${c.name} Relocation Guide 2026 — Visas, Taxes & Cost of Living | Relova`;
  const topHighlight = c.highlights?.[0] ? ` ${c.highlights[0]}.` : "";
  const description = `${c.tagline}.${topHighlight} Compare visa options, tax rates, and real cost-of-living data for ${c.name} on Relova.`;

  const visaListHtml = c.visaOptions
    .map(
      (v) => `<li style="margin-bottom:0.6rem"><strong>${escapeHtml(v.name)}</strong> (${escapeHtml(v.duration)}) — ${escapeHtml(v.requirements)}</li>`
    )
    .join("\n          ");
  const taxListHtml = c.taxInfo
    .map((t) => `<li style="margin-bottom:0.4rem"><strong>${escapeHtml(t.label)}:</strong> ${escapeHtml(t.value)}</li>`)
    .join("\n          ");
  const costListHtml = c.costOfLiving
    .map((item) => `<li style="margin-bottom:0.4rem">${escapeHtml(item.item)}: <strong>${escapeHtml(item.cost)}</strong></li>`)
    .join("\n          ");
  const checklistHtml = c.checklist
    .map((step) => `<li style="margin-bottom:0.4rem">${escapeHtml(step)}</li>`)
    .join("\n          ");

  writePage({
    outPath: join(distDir, "countries", c.slug, "index.html"),
    title,
    description,
    canonical: `https://relova.ai/countries/${c.slug}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Countries", item: "https://relova.ai/countries" },
        { "@type": "ListItem", position: 2, name: c.name, item: `https://relova.ai/countries/${c.slug}` },
      ],
    },
    bodyHtml: `
    <main style="max-width:40rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <p><a href="/countries">← All countries</a></p>
      <h1 style="font-family:Georgia,serif;font-size:1.9rem;line-height:1.2;margin-top:1rem">${escapeHtml(c.flag)} ${escapeHtml(c.name)}</h1>
      <p style="color:#666;margin-top:0.5rem">${escapeHtml(c.tagline)}</p>

      <h2 style="font-size:1.2rem;margin-top:2rem">Visa Options</h2>
      <ul style="margin-top:0.75rem;padding-left:1.2rem">
          ${visaListHtml}
      </ul>

      <h2 style="font-size:1.2rem;margin-top:2rem">Tax Overview</h2>
      <ul style="margin-top:0.75rem;padding-left:1.2rem">
          ${taxListHtml}
      </ul>

      <h2 style="font-size:1.2rem;margin-top:2rem">Cost of Living</h2>
      <ul style="margin-top:0.75rem;padding-left:1.2rem">
          ${costListHtml}
      </ul>

      <h2 style="font-size:1.2rem;margin-top:2rem">Relocation Checklist</h2>
      <ul style="margin-top:0.75rem;padding-left:1.2rem">
          ${checklistHtml}
      </ul>

      <p style="margin-top:2rem"><a href="/chat">Talk to Your Relocation Expert →</a></p>
    </main>
  `,
  });
}

console.log(`prerender-countries: done (${countries.length} country pages + hub)`);
