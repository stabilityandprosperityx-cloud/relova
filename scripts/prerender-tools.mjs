/**
 * Post-build: write static HTML shells for the can-i-move hub + launch pairs.
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
  // Russia (7)
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
  // United States (2)
  {
    citizenship: "United States",
    destination: "Mexico",
    status: "common",
    note: "Most popular expat destination for Americans; Temporary Resident Visa via income proof, easy land access, no US totalization agreement issue.",
  },
  {
    citizenship: "United States",
    destination: "Portugal",
    status: "common",
    note: "D7 passive-income and D8 digital nomad visas widely used by Americans, though NHR tax break closed to new arrivals in 2025.",
  },
  // United Kingdom (2)
  {
    citizenship: "United Kingdom",
    destination: "Ireland",
    status: "common",
    note: "Common Travel Area lets Britons live, work, and study visa-free with no residency permits or income checks.",
  },
  {
    citizenship: "United Kingdom",
    destination: "Spain",
    status: "common",
    note: "Non-Lucrative and Digital Nomad Visas are standard routes; over 400,000 British residents already there.",
  },
  // India (2)
  {
    citizenship: "India",
    destination: "United States",
    status: "common",
    note: "H-1B visa: India is top source, 71-73% of all approvals, despite 2025 $100,000 fee hike.",
  },
  {
    citizenship: "India",
    destination: "UAE",
    status: "common",
    note: "10-year Golden Visa and sponsor-free work visas; Indians are largest expat community (~35% of population).",
  },
  // China (2)
  {
    citizenship: "China",
    destination: "Singapore",
    status: "common",
    note: "Among Singapore's citizens and permanent residents, three-quarters are of Chinese ethnicity, easing cultural/language integration for mainland Chinese via work/",
  },
  {
    citizenship: "China",
    destination: "Japan",
    status: "common",
    note: "Visa-free short-stay entry was re-established for Japan in 2025; large existing Chinese community supports work/study/spouse visa routes.",
  },
  // Brazil (2)
  {
    citizenship: "Brazil",
    destination: "Portugal",
    status: "common",
    note: "CPLP mobility deal lets Brazilians get fast residency/work permits; largest Brazilian community in Europe.",
  },
  {
    citizenship: "Brazil",
    destination: "Spain",
    status: "common",
    note: "Ibero-American nationals get citizenship after just 2 years' legal residence vs 10 for others.",
  },
  // Nigeria (2)
  {
    citizenship: "Nigeria",
    destination: "United Kingdom",
    status: "common",
    note: "Nigeria consistently top-5 nationality for UK visas; large diaspora, but Skilled Worker/Health-Care routes now tightened with higher salary thresholds.",
  },
  {
    citizenship: "Nigeria",
    destination: "Canada",
    status: "common",
    note: "Nigeria ranks among top 3 nationalities for Express Entry PR and a leading source country for study permits; strong track record.",
  },
  // Philippines (2)
  {
    citizenship: "Philippines",
    destination: "UAE",
    status: "common",
    note: "Top land-based OFW destination overall, with 397,892 deployed in 2025, mostly on employer-sponsored work visas.",
  },
  {
    citizenship: "Philippines",
    destination: "Canada",
    status: "common",
    note: "Nearly 1 million Filipino-Canadians; Express Entry, caregiver pilots (Home Child Care/Home Support Worker), and PNPs are common PR routes.",
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
