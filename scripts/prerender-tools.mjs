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
  { citizenship: "India", destination: "Germany", visa_type: "Freelance_Visa" },
  { citizenship: "Brazil", destination: "Portugal", visa_type: "D8_Digital_Nomad" },
  { citizenship: "Brazil", destination: "Spain", visa_type: "Digital_Nomad" },
  { citizenship: "China", destination: "Japan", visa_type: "Digital_Nomad" },
  { citizenship: "China", destination: "Singapore", visa_type: "Employment_Pass" },
  { citizenship: "Nigeria", destination: "United Kingdom", visa_type: "Temporary_Residence" },
  { citizenship: "Nigeria", destination: "Canada", visa_type: "Express_Entry" },
  { citizenship: "Philippines", destination: "UAE", visa_type: "Freelance_Permit" },
  { citizenship: "Philippines", destination: "Canada", visa_type: "Express_Entry" },
  { citizenship: "Germany", destination: "Portugal", visa_type: "D8_Digital_Nomad" },
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

function formatVerifiedDateUtc(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso || "");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
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

// ─── Country Compare ───
let compareSnapshots = [];
try {
  const viteNodeBin = join(__dirname, "..", "node_modules", ".bin", "vite-node");
  const raw = execFileSync(
    viteNodeBin,
    [join(__dirname, "dump-country-compare.ts")],
    { encoding: "utf8", cwd: join(__dirname, "..") },
  );
  compareSnapshots = JSON.parse(raw.trim());
} catch (err) {
  console.error("prerender-tools: failed to dump country compare", err);
  process.exit(1);
}

writePage({
  outPath: join(distDir, "tools", "country-compare", "index.html"),
  title: "Country Compare — Relova",
  description:
    "Compare two countries side by side — cost, safety, healthcare, visas — and optionally through the lens of your passport.",
  bodyHtml: `
    <main style="max-width:36rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2">Compare countries for your move</h1>
      <p style="color:#666;margin-top:0.75rem">Side-by-side cost, safety, healthcare, and visa pathways — with optional passport-specific feasibility.</p>
      <ul style="margin-top:1.5rem;padding-left:1.25rem;line-height:1.8">
        ${compareSnapshots
          .slice(0, 8)
          .map(
            (p) =>
              `<li><a href="${escapeHtml(p.path)}">${escapeHtml(p.title)}</a></li>`,
          )
          .join("\n        ")}
      </ul>
    </main>
  `,
});

for (const snap of compareSnapshots) {
  const rowsHtml = snap.rows
    .map((r) => {
      const aMark = r.winner === "a" ? " ★" : "";
      const bMark = r.winner === "b" ? " ★" : "";
      return `<tr>
        <td style="padding:0.4rem 0.5rem;color:#666;font-size:0.85rem">${escapeHtml(r.label)}</td>
        <td style="padding:0.4rem 0.5rem">${escapeHtml(r.a)}${aMark}</td>
        <td style="padding:0.4rem 0.5rem">${escapeHtml(r.b)}${bMark}</td>
      </tr>`;
    })
    .join("");
  const segments = snap.path.replace(/^\//, "").split("/");
  writePage({
    outPath: join(distDir, ...segments, "index.html"),
    title: `${snap.title} — Relova`,
    description: snap.citizenship
      ? `Compare ${snap.countryA} and ${snap.countryB} for ${snap.citizenship} citizens — cost, safety, healthcare, and visas.`
      : `Compare ${snap.countryA} and ${snap.countryB} side by side — cost, safety, healthcare, and visa pathways.`,
    bodyHtml: `
    <main style="max-width:44rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <p><a href="/tools/country-compare">← Compare different countries</a></p>
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2;margin-top:1.5rem">${escapeHtml(snap.countryA)} vs ${escapeHtml(snap.countryB)}</h1>
      ${snap.demonym ? `<p style="color:#555;margin-top:0.35rem">for ${escapeHtml(snap.demonym)} citizens</p>` : ""}
      <table style="width:100%;margin-top:1.5rem;border-collapse:collapse;font-size:0.9rem">
        <thead>
          <tr style="border-bottom:1px solid #ddd">
            <th style="text-align:left;padding:0.5rem"></th>
            <th style="text-align:left;padding:0.5rem">${escapeHtml(snap.flagA)} ${escapeHtml(snap.countryA)}</th>
            <th style="text-align:left;padding:0.5rem">${escapeHtml(snap.flagB)} ${escapeHtml(snap.countryB)}</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <p style="margin-top:1.5rem;font-size:0.75rem;color:#888">Not legal advice. Based on general and cached research — verify with official sources before making decisions.</p>
      <p style="margin-top:2rem"><a href="/tools/country-compare">Want a personalized plan? Start free →</a></p>
    </main>
  `,
  });
}

// ─── Invitation Letter Generator ───
writePage({
  outPath: join(distDir, "tools", "invitation-letter", "index.html"),
  title: "Visa Invitation Letter Generator — Relova",
  description:
    "Free visa invitation letter generator — create a downloadable draft for tourist or family visits. Your information stays in your browser.",
  bodyHtml: `
    <main style="max-width:40rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2">Visa Invitation Letter Generator</h1>
      <p style="color:#666;margin-top:0.75rem">Fill in host and visitor details for a live draft letter you can print or save as PDF. Nothing is sent to our servers.</p>
      <p style="margin-top:1.5rem"><a href="/tools/invitation-letter/schengen">Schengen invitation letter generator →</a></p>
      <p style="margin-top:1.5rem;font-size:0.75rem;color:#888">Not legal advice — verify exact requirements with the destination country's consulate before your guest applies.</p>
      <ul style="margin-top:0.75rem;padding-left:1.25rem;font-size:0.75rem;color:#888;line-height:1.5">
        <li>Private/family/tourist visit letters only — not business invitations.</li>
        <li>Germany and the Netherlands may require a separate Verpflichtungserklärung; this letter does not replace that.</li>
        <li>Some consulates require notarization or a certified signature.</li>
      </ul>
    </main>
  `,
});

writePage({
  outPath: join(distDir, "tools", "invitation-letter", "schengen", "index.html"),
  title: "Schengen Visa Invitation Letter Generator — Relova",
  description:
    "Free Schengen visa invitation letter generator — fill in host and visitor details for a downloadable draft letter. Nothing is sent to our servers.",
  bodyHtml: `
    <main style="max-width:40rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2">Schengen Visa Invitation Letter Generator</h1>
      <p style="color:#666;margin-top:0.75rem">Generate a draft invitation letter commonly used to support Schengen short-stay visa applications. Your information stays in your browser.</p>
      <p style="margin-top:1.5rem"><a href="/tools/invitation-letter">← Generic invitation letter generator</a></p>
      <p style="margin-top:1.5rem;font-size:0.75rem;color:#888">Not legal advice — verify exact requirements with the destination country's consulate before your guest applies.</p>
      <ul style="margin-top:0.75rem;padding-left:1.25rem;font-size:0.75rem;color:#888;line-height:1.5">
        <li>Private/family/tourist visit letters only — not business invitations.</li>
        <li>Germany and the Netherlands may require a separate Verpflichtungserklärung; this letter does not replace that.</li>
        <li>Some consulates require notarization or a certified signature.</li>
      </ul>
    </main>
  `,
});

// ─── Tax Residency Day Tracker ───
writePage({
  outPath: join(distDir, "tools", "tax-residency-tracker", "index.html"),
  title: "183-Day Tax Residency Tracker — Relova",
  description:
    "Free tax residency day tracker. Log stays by country and see how close you are to common 183-day thresholds. Awareness only — not a tax determination. Your data stays in your browser.",
  bodyHtml: `
    <main style="max-width:40rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2">Track days toward tax residency (183-day rule)</h1>
      <p style="color:#666;margin-top:0.75rem">Log stays by country and see how your day counts stack up against common tax-residency awareness thresholds. Your trip history stays in your browser.</p>
      <p style="margin-top:1rem;padding:0.75rem 1rem;background:#fff8e6;border:1px solid #f0e0a0;border-radius:8px;font-size:0.9rem;color:#444">This tool is about <strong>tax residency</strong> day counts — not the Schengen 90/180 short-stay visa rule (entry permission).</p>
      <p style="margin-top:1.5rem;font-size:0.75rem;color:#888">Not tax advice. Day counts alone do not determine residency — domicile, center-of-vital-interests, and treaty rules may also apply. Verify with a tax professional.</p>
    </main>
  `,
});

// ─── Data & Sources (methodology / coverage transparency) ───
// Keep coverage numbers in sync with src/pages/DataSources.tsx COVERAGE snapshot.
// Checklist table rows come from DOC_LAUNCH_PAIRS + document-checklist-snapshots.json.
const checklistTableRows = DOC_LAUNCH_PAIRS.map((p) => {
  const snap = docSnapByKey.get(`${p.citizenship}|${p.destination}|${p.visa_type}`);
  const verified = snap?.generated_at
    ? formatVerifiedDateUtc(snap.generated_at)
    : "No snapshot date";
  const href = `/tools/documents-needed/${slugify(p.citizenship)}/${slugify(p.destination)}`;
  return `<tr>
        <td style="padding:0.5rem 0.75rem;border-top:1px solid #e8e4dc">${escapeHtml(p.citizenship)}</td>
        <td style="padding:0.5rem 0.75rem;border-top:1px solid #e8e4dc">${escapeHtml(p.destination)}</td>
        <td style="padding:0.5rem 0.75rem;border-top:1px solid #e8e4dc">${escapeHtml(String(p.visa_type).replace(/_/g, " "))}</td>
        <td style="padding:0.5rem 0.75rem;border-top:1px solid #e8e4dc;white-space:nowrap">${escapeHtml(verified)}</td>
        <td style="padding:0.5rem 0.75rem;border-top:1px solid #e8e4dc"><a href="${href}">View checklist</a></td>
      </tr>`;
}).join("\n      ");

writePage({
  outPath: join(distDir, "data-sources", "index.html"),
  title: "Data & Sources — Relova",
  description:
    "How Relova builds document checklists: methodology, coverage, last-verified dates for each published pair, and terms for citing source-cited (Tier 1) data.",
  bodyHtml: `
    <main style="max-width:52rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2">Data &amp; Sources</h1>
      <p style="color:#666;margin-top:0.75rem">Relova publishes two kinds of information: AI-researched document checklists with named official or consular sources, and static editorial baselines used for comparison. This page states which is which, how the checklist cache is kept, and which checklists you may cite.</p>

      <h2 id="cite" style="font-family:Georgia,serif;font-size:1.25rem;margin-top:2rem">Citing this page</h2>
      <p style="color:#555;margin-top:0.75rem;line-height:1.6">Source-cited document checklists (Tier 1) linked below are free to cite with attribution to Relova (relova.ai). Include the last-verified date shown for that pair. The static country database and tax-rate overlay (Tier 2) are editorial baselines without per-field sources — they are not offered as a citable dataset.</p>
      <p style="color:#555;margin-top:0.5rem;line-height:1.6">For data citation or press inquiries, email <a href="mailto:support@relova.ai?subject=Data%20citation">support@relova.ai</a> with subject &quot;Data citation&quot;.</p>

      <h2 id="methodology" style="font-family:Georgia,serif;font-size:1.25rem;margin-top:2rem">How data is generated</h2>
      <p style="color:#555;margin-top:0.75rem;line-height:1.6">Three layers sit behind our tools. Only the first is source-cited research. The other two are compiled editorial files and should not be read as official figures.</p>
      <h3 style="font-size:1rem;margin-top:1.25rem">1. Document checklists — AI-researched, source-cited (Tier 1)</h3>
      <p style="color:#888;font-size:0.85rem;margin-top:0.35rem">Last verified (published pair pages): August 5, 2026. Cache-coverage snapshot as of August 10, 2026: generated August 4–6, 2026.</p>
      <p style="color:#555;margin-top:0.5rem;line-height:1.6">An AI research pipeline searches the live web, prioritizes official government and consular sources, and stores results in a cache. Cached entries are treated as valid for about 30 days. 496 of 500 document items (99.2%) include a named official or consular source. Citizenship-specific destination notes in Can I Move use a related AI cache (8 citizenships, 151 destination matches as of August 10, 2026). Those notes are not the same as the source-cited checklist items in the table below.</p>
      <h3 style="font-size:1rem;margin-top:1.25rem">2. Country reference database — static, editorial (Tier 2)</h3>
      <p style="color:#888;font-size:0.85rem;margin-top:0.35rem">No per-field verification date.</p>
      <p style="color:#555;margin-top:0.5rem;line-height:1.6">A compiled country file covering 106 countries (cost level, safety score, healthcare quality, climate, and similar fields). Not government-sourced, not citizenship-specific, and not produced by the checklist research pipeline.</p>
      <h3 style="font-size:1rem;margin-top:1.25rem">3. Tax-rate overlay — static, editorial (Tier 2)</h3>
      <p style="color:#888;font-size:0.85rem;margin-top:0.35rem">No per-field verification date.</p>
      <p style="color:#555;margin-top:0.5rem;line-height:1.6">A separate overlay covering 28 countries, used only in comparison tools. Compiled editorial baseline — not government-sourced, and not listed as figures on this page. Not offered as a citable dataset.</p>

      <h2 id="coverage" style="font-family:Georgia,serif;font-size:1.25rem;margin-top:2rem">Current coverage</h2>
      <p style="color:#888;font-size:0.85rem;margin-top:0.5rem">Snapshot from our live caches and static reference files, as of August 10, 2026. These grow as we research more pairs — they are not a permanent claim.</p>
      <ul style="margin-top:0.75rem;padding-left:1.25rem;line-height:1.7;color:#444">
        <li><strong>24</strong> citizenship → destination document checklists generated</li>
        <li><strong>500</strong> document requirements catalogued — <strong>496 (99.2%)</strong> with a named official or consular source</li>
        <li><strong>8</strong> citizenships analyzed for realistic relocation destinations — <strong>151</strong> destination matches</li>
        <li><strong>106</strong> countries in our static reference database (lifestyle / cost / safety baseline — not AI checklist research)</li>
      </ul>
      <p style="color:#888;font-size:0.8rem;margin-top:0.75rem;line-height:1.6">Of 500 cached document items, 496 carry a non-empty named source field; 4 do not. We do not treat those 4 as sourced evidence.</p>

      <h2 id="checklists" style="font-family:Georgia,serif;font-size:1.25rem;margin-top:2rem">Published document checklists</h2>
      <p style="color:#555;margin-top:0.75rem;line-height:1.6">Last-verified dates below are the cache timestamps from the document-checklist snapshot used to prerender each pair page — not a live database query. The table lists every checklist with a public Documents Needed URL (${DOC_LAUNCH_PAIRS.length} pairs). Coverage figures above count 24 cached checklists as of August 10, 2026; one cached row is not published as a standalone page, so it is not listed here.</p>
      <div style="overflow-x:auto;margin-top:1rem;border:1px solid #e8e4dc;border-radius:0.75rem">
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem;min-width:40rem">
        <thead>
          <tr style="background:#f6f3ee;text-align:left;font-size:0.7rem;letter-spacing:0.06em;text-transform:uppercase;color:#666">
            <th style="padding:0.6rem 0.75rem">Citizenship</th>
            <th style="padding:0.6rem 0.75rem">Destination</th>
            <th style="padding:0.6rem 0.75rem">Visa pathway</th>
            <th style="padding:0.6rem 0.75rem">Last verified</th>
            <th style="padding:0.6rem 0.75rem">Checklist</th>
          </tr>
        </thead>
        <tbody>
      ${checklistTableRows}
        </tbody>
      </table>
      </div>

      <h2 style="font-family:Georgia,serif;font-size:1.25rem;margin-top:2rem">What we don&apos;t have yet</h2>
      <p style="color:#555;margin-top:0.75rem;line-height:1.6">Most citizenship / destination pairs haven&apos;t been researched yet. Uncached pairs in <a href="/tools/can-i-move">Can I Move</a> and <a href="/tools/documents-needed">Documents Needed</a> say so clearly rather than guessing.</p>

      <h2 id="freshness" style="font-family:Georgia,serif;font-size:1.25rem;margin-top:2rem">Freshness policy</h2>
      <p style="color:#888;font-size:0.85rem;margin-top:0.35rem">Applies to AI caches only. As of August 10, 2026.</p>
      <p style="color:#555;margin-top:0.5rem;line-height:1.6">Caches are valid for roughly 30 days. As of August 10, 2026, all current document (v2) and citizenship candidate rows were generated August 4–6, 2026 — 0 stale rows. The static country database and tax-rate overlay are not on this refresh cycle. They have no per-field verification date.</p>

      <h2 id="contact" style="font-family:Georgia,serif;font-size:1.25rem;margin-top:2rem">Contact</h2>
      <p style="color:#555;margin-top:0.75rem;line-height:1.6">If a document requirement looks outdated or wrong, email <a href="mailto:support@relova.ai?subject=Data%20source%20correction">support@relova.ai</a> with the specific item. We look into corrections without publishing a fixed response SLA.</p>
      <p style="color:#555;margin-top:0.5rem;line-height:1.6">For data citation or press inquiries, email <a href="mailto:support@relova.ai?subject=Data%20citation">support@relova.ai</a> with subject &quot;Data citation&quot;.</p>
    </main>
  `,
});

console.log("prerender-tools: done");
