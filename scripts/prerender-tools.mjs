/**
 * Post-build: write static HTML shells for the can-i-move hub + launch pairs
 * and the where-should-i-move persona hub + pages.
 * Crawlers get real title/H1/verdict text; SPA hydrates via the same bundle as index.html.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

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

/** Keep in sync with src/lib/demonyms.ts */
const DEMONYMS = {
  Russia: "Russian",
  "United States": "US",
  "United Kingdom": "UK",
  India: "Indian",
  China: "Chinese",
  Brazil: "Brazilian",
  Nigeria: "Nigerian",
  Philippines: "Filipino",
};
const CONSONANT_SOUND_EXCEPTIONS = new Set(["us", "uk"]);

function indefiniteArticle(word) {
  const trimmed = String(word || "").trim();
  if (!trimmed) return "a";
  const lower = trimmed.toLowerCase();
  if (CONSONANT_SOUND_EXCEPTIONS.has(lower)) return "a";
  return /^[aeiou]/i.test(lower) ? "an" : "a";
}

function citizenshipPassportPhrase(countryName) {
  const key = String(countryName || "").trim();
  const label = DEMONYMS[key] ?? key;
  return `${indefiniteArticle(label)} ${label} passport`;
}

function canIMoveTitle(destination, citizenship) {
  return `Can I move to ${destination} with ${citizenshipPassportPhrase(citizenship)}?`;
}

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
  const h1 = canIMoveTitle(pair.destination, pair.citizenship);
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

// ─── Where should I move (persona pages) ───
let personaSnapshots = [];
try {
  const viteNodeBin = join(__dirname, "..", "node_modules", ".bin", "vite-node");
  const raw = execFileSync(
    viteNodeBin,
    [join(__dirname, "dump-persona-matches.ts")],
    { encoding: "utf8", cwd: join(__dirname, "..") },
  );
  personaSnapshots = JSON.parse(raw.trim());
} catch (err) {
  console.error("prerender-tools: failed to dump persona matches", err);
  process.exit(1);
}

writePage({
  outPath: join(distDir, "tools", "where-should-i-move", "index.html"),
  title: "Where Should I Move? — Relova",
  description:
    "Free country shortlists for digital nomads, retirees, families, safety-first movers, budget relocators, and anyone seeking a fresh start.",
  bodyHtml: `
    <main style="max-width:36rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2">Where should I move?</h1>
      <p style="color:#666;margin-top:0.75rem">Pick a profile for a ranked shortlist of countries — no account needed.</p>
      <ul style="margin-top:1.5rem;padding-left:1.25rem;line-height:1.8">
        ${personaSnapshots
          .map(
            (p) =>
              `<li><a href="/tools/where-should-i-move/${escapeHtml(p.slug)}">${escapeHtml(p.pageTitle)}</a></li>`,
          )
          .join("\n        ")}
      </ul>
    </main>
  `,
});

for (const persona of personaSnapshots) {
  const listHtml = persona.topCountries
    .map(
      (c, i) => `
      <li style="margin-top:1rem">
        <strong>${escapeHtml(c.flag)} ${escapeHtml(c.name)}</strong> — ${c.score}% match
        ${i === 0 ? " (Best match)" : ""}
        <br /><span style="color:#555;font-size:0.9rem">${escapeHtml((c.reasons || []).slice(0, 2).join(" · "))}</span>
      </li>`,
    )
    .join("");

  writePage({
    outPath: join(distDir, "tools", "where-should-i-move", persona.slug, "index.html"),
    title: `${persona.pageTitle} — Relova`,
    description: persona.metaDescription,
    bodyHtml: `
    <main style="max-width:40rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <p><a href="/tools/where-should-i-move">← See all personas</a></p>
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2;margin-top:1.5rem">${escapeHtml(persona.pageTitle)}</h1>
      <p style="color:#444;margin-top:0.75rem">${escapeHtml(persona.intro)}</p>
      <ol style="margin-top:1.5rem;padding-left:1.25rem">${listHtml}
      </ol>
      <p style="margin-top:1.5rem;font-size:0.75rem;color:#888">General guidance based on typical patterns — your personal situation may differ.</p>
      <p style="margin-top:2rem"><a href="/tools/where-should-i-move">Want a personalized match? Start free →</a></p>
    </main>
  `,
  });
}

// ─── Documents needed pages ───
const DOC_LAUNCH_PAIRS = [
  { citizenship: "Russia", destination: "Portugal", visa_type: "D8_Digital_Nomad" },
  { citizenship: "Russia", destination: "Armenia", visa_type: "Visa_Free" },
  { citizenship: "Russia", destination: "Cyprus", visa_type: "Digital_Nomad" },
  { citizenship: "Russia", destination: "Czech Republic", visa_type: "Long_Term_Residence" },
  { citizenship: "Russia", destination: "Montenegro", visa_type: "Temporary_Residence" },
  { citizenship: "Russia", destination: "Georgia", visa_type: "Visa_Free" },
  { citizenship: "Russia", destination: "Turkey", visa_type: "Residence_Permit" },
  { citizenship: "Russia", destination: "UAE", visa_type: "Freelance_Permit" },
  { citizenship: "Russia", destination: "Thailand", visa_type: "DTV" },
  { citizenship: "United States", destination: "Portugal", visa_type: "D8_Digital_Nomad" },
  { citizenship: "United States", destination: "Mexico", visa_type: "Temporary_Resident" },
  { citizenship: "United Kingdom", destination: "Spain", visa_type: "Digital_Nomad" },
  { citizenship: "India", destination: "UAE", visa_type: "Freelance_Permit" },
  { citizenship: "Brazil", destination: "Portugal", visa_type: "D8_Digital_Nomad" },
  { citizenship: "China", destination: "Japan", visa_type: "Digital_Nomad" },
];

let docSnapshots = [];
const docSnapPath = join(__dirname, "document-checklist-snapshots.json");
if (existsSync(docSnapPath)) {
  try {
    docSnapshots = JSON.parse(readFileSync(docSnapPath, "utf8"));
  } catch (err) {
    console.warn("prerender-tools: could not parse document snapshots", err);
  }
}
const docSnapByKey = new Map(
  docSnapshots.map((s) => [`${s.citizenship}|${s.destination}|${s.visa_type}`, s]),
);

function formatVerifiedDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso || "");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

writePage({
  outPath: join(distDir, "tools", "documents-needed", "index.html"),
  title: "What documents do I need to move abroad? — Relova",
  description:
    "Free document checklist for relocating abroad — passport, visa, and residence requirements by citizenship and destination.",
  bodyHtml: `
    <main style="max-width:36rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2">What documents do I need to move abroad?</h1>
      <p style="color:#666;margin-top:0.75rem">Pick your citizenship and destination for a cached checklist.</p>
      <ul style="margin-top:1.5rem;padding-left:1.25rem;line-height:1.8">
        ${DOC_LAUNCH_PAIRS.map(
          (p) =>
            `<li><a href="/tools/documents-needed/${slugify(p.citizenship)}/${slugify(p.destination)}">What documents do I need to move to ${escapeHtml(p.destination)} as a ${escapeHtml(p.citizenship)} citizen?</a></li>`,
        ).join("\n        ")}
      </ul>
    </main>
  `,
});

for (const pair of DOC_LAUNCH_PAIRS) {
  const snap = docSnapByKey.get(`${pair.citizenship}|${pair.destination}|${pair.visa_type}`);
  const h1 = `What documents do I need to move to ${pair.destination} as a ${pair.citizenship} citizen?`;
  const verified = snap?.generated_at
    ? `<p style="margin-top:0.75rem;font-weight:600">Last verified: ${escapeHtml(formatVerifiedDate(snap.generated_at))}</p>`
    : "";
  const docs = Array.isArray(snap?.documents) ? snap.documents : [];
  const listHtml = docs.length
    ? `<ul style="margin-top:1rem;padding-left:1.25rem;line-height:1.6">${docs
        .map((d) => {
          const src = d.source
            ? ` <span style="color:#666;font-size:0.85rem">— Source: ${escapeHtml(String(d.source))}</span>`
            : "";
          return `<li style="margin-top:0.5rem"><strong>${escapeHtml(d.name || "")}</strong>${d.phase ? ` <em>(${escapeHtml(d.phase)})</em>` : ""}${src}${d.description ? `<br/><span style="color:#555;font-size:0.9rem">${escapeHtml(d.description)}</span>` : ""}</li>`;
        })
        .join("")}</ul>`
    : `<p style="margin-top:1rem;color:#666">Checklist loads when available in cache.</p>`;

  writePage({
    outPath: join(
      distDir,
      "tools",
      "documents-needed",
      slugify(pair.citizenship),
      slugify(pair.destination),
      "index.html",
    ),
    title: `${h1} — Relova`,
    description: `Document checklist for relocating from ${pair.citizenship} to ${pair.destination}.`,
    bodyHtml: `
    <main style="max-width:40rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <p><a href="/tools/documents-needed">← Check a different combination</a></p>
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2;margin-top:1.5rem">${escapeHtml(h1)}</h1>
      <p style="color:#555;margin-top:0.5rem">Typical pathway: ${escapeHtml(pair.visa_type.replace(/_/g, " "))}</p>
      ${verified}
      ${listHtml}
      <p style="margin-top:1.5rem;font-size:0.75rem;color:#888">Not legal advice. Based on cached research — verify with official sources before making decisions.</p>
      <p style="margin-top:2rem"><a href="/tools/documents-needed">Want a personalized plan? Start free →</a></p>
    </main>
  `,
  });
}

console.log("prerender-tools: done");
