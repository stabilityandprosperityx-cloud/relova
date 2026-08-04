/**
 * Post-build: write static HTML shells for the can-i-move hub + 10 launch pairs.
 * Crawlers get real title/H1/verdict text; SPA hydrates via the same bundle as index.html.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");
const indexPath = join(distDir, "index.html");

if (!existsSync(indexPath)) {
  console.error("prerender-tools: dist/index.html missing — run vite build first");
  process.exit(1);
}

const indexHtml = readFileSync(indexPath, "utf8");

/** Extract script/link tags from built index for SPA bootstrap */
function extractHeadAssets(html) {
  const links = [...html.matchAll(/<link[^>]+href="\/assets\/[^"]+"[^>]*>/g)].map((m) => m[0]);
  const scripts = [...html.matchAll(/<script[^>]+src="\/assets\/[^"]+"[^>]*><\/script>/g)].map((m) => m[0]);
  return { links, scripts };
}

const { links, scripts } = extractHeadAssets(indexHtml);

const LAUNCH_PAIRS = [
  {
    citizenship: "Russia",
    destination: "Georgia",
    status: "common",
    note: "Visa-free, often indefinite stay without registration; largest and most accessible relocation hub, easy business setup for Russians.",
  },
  {
    citizenship: "Russia",
    destination: "Armenia",
    status: "common",
    note: "No passport even required from Russia; among most popular destinations with large Russian arrivals since 2022.",
  },
  {
    citizenship: "Russia",
    destination: "Turkey",
    status: "common",
    note: "Top emigration destination; visa-free entry, real-estate residency, and citizenship-by-investment remain realistic and fast.",
  },
  {
    citizenship: "Russia",
    destination: "UAE",
    status: "common",
    note: "Major hub for entrepreneurs; tax-free Golden Visa route remains open and heavily used despite no Schengen access.",
  },
  {
    citizenship: "Russia",
    destination: "Cyprus",
    status: "common",
    note: "Large existing Russian community; non-EU permanent residence and family routes still used.",
  },
  {
    citizenship: "Russia",
    destination: "Portugal",
    status: "common",
    note: "Golden Visa resumed case-by-case after court rulings, though banking hurdles and sanctions screening remain significant barriers.",
  },
  {
    citizenship: "Russia",
    destination: "Thailand",
    status: "common",
    note: "Popular visa-free/long-stay and retirement destination; among top tourist-turned-resident countries for Russians.",
  },
  {
    citizenship: "United States",
    destination: "Portugal",
    status: "uncached",
    note: "General visa difficulty: moderate — typical path: D8 Digital Nomad / D7 Passive Income Visa. This is general guidance, not specific to your passport yet.",
  },
  {
    citizenship: "India",
    destination: "UAE",
    status: "uncached",
    note: "General visa difficulty: moderate — typical path: Freelance Permit + Residence Visa / Golden Visa. This is general guidance, not specific to your passport yet.",
  },
  {
    citizenship: "United Kingdom",
    destination: "Spain",
    status: "uncached",
    note: "General visa difficulty: moderate — typical path: Digital Nomad Visa (Ley de Startups). This is general guidance, not specific to your passport yet.",
  },
];

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function verdictLabel(status) {
  if (status === "common") return "Often feasible";
  if (status === "uncommon") return "Less common for this passport";
  return "General difficulty only";
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writePage({ outPath, title, description, bodyHtml }) {
  mkdirSync(dirname(outPath), { recursive: true });
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/favicon.png?v=3" type="image/png" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    ${links.join("\n    ")}
  </head>
  <body>
    <div id="root">${bodyHtml}</div>
    ${scripts.join("\n    ")}
  </body>
</html>
`;
  writeFileSync(outPath, html, "utf8");
  console.log("prerender-tools: wrote", outPath.replace(distDir, "dist"));
}

// Hub
writePage({
  outPath: join(distDir, "tools", "can-i-move", "index.html"),
  title: "Can I move to another country with my passport? — Relova",
  description:
    "Free passport check: see whether relocating to a destination is often feasible for your citizenship — then get a personalized plan.",
  bodyHtml: `
    <main style="max-width:32rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2">Can I move to another country with my passport?</h1>
      <p style="color:#666;margin-top:0.75rem">Pick your citizenship and where you want to go for a quick, honest signal — then build a full plan if it looks promising.</p>
      <p style="margin-top:1.5rem"><a href="/tools/can-i-move/russia/georgia">Russia → Georgia</a> · <a href="/tools/can-i-move/india/uae">India → UAE</a> · <a href="/tools/can-i-move/united-states/portugal">US → Portugal</a></p>
    </main>
  `,
});

for (const pair of LAUNCH_PAIRS) {
  const cSlug = slugify(pair.citizenship);
  const dSlug = slugify(pair.destination);
  const h1 = `Can I move to ${pair.destination} with a ${pair.citizenship} passport?`;
  writePage({
    outPath: join(distDir, "tools", "can-i-move", cSlug, dSlug, "index.html"),
    title: `${h1} — Relova`,
    description: `Quick check: relocating from ${pair.citizenship} to ${pair.destination}. ${verdictLabel(pair.status)}.`,
    bodyHtml: `
    <main style="max-width:40rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <p><a href="/tools/can-i-move">← Check a different combination</a></p>
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2;margin-top:1.5rem">${escapeHtml(h1)}</h1>
      <p style="margin-top:1rem;font-weight:600">${escapeHtml(verdictLabel(pair.status))}</p>
      <p style="margin-top:0.75rem;color:#333">${escapeHtml(pair.note)}</p>
      <p style="margin-top:1.5rem;font-size:0.75rem;color:#888">Not legal advice. Based on general and cached research — verify with official sources before making decisions.</p>
      <p style="margin-top:2rem"><a href="/tools/can-i-move">Want a personalized plan? Start free →</a></p>
    </main>
  `,
  });
}

console.log("prerender-tools: done");
