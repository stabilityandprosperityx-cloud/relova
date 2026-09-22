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
  // Russia (10)
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
    citizenship: "Russia",
    destination: "Serbia",
    status: "common",
    note: "No visa-free EU-style deal, but self-employment/LLC, property, and family routes are common; large informal Russian community since 2022.",
  },
  {
    citizenship: "Russia",
    destination: "Kazakhstan",
    status: "common",
    note: "Visa-free entry and long stays via CIS agreements; no passport barrier, common short-term base, though formal residence needs separate registration.",
  },
  {
    citizenship: "Russia",
    destination: "Israel",
    status: "common",
    note: "Law of Return grants automatic citizenship to those with Jewish ancestry — among the fastest, most complete relocation routes for eligible Russians.",
  },
  // United States (6)
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
  {
    citizenship: "United States",
    destination: "Canada",
    status: "common",
    note: "USMCA/TN visa and standard Express Entry both used; large existing American community, no language barrier — among the most straightforward moves available.",
  },
  {
    citizenship: "United States",
    destination: "Spain",
    status: "common",
    note: "Non-Lucrative Visa (no local work) and Digital Nomad Visa (remote income) are both established, realistic routes for Americans.",
  },
  {
    citizenship: "United States",
    destination: "Costa Rica",
    status: "common",
    note: "Rentista and Pensionado visas are common for Americans with passive income or a pension; long-standing expat community, no minimum-stay requirement for Rentista.",
  },
  {
    citizenship: "United States",
    destination: "Panama",
    status: "common",
    note: "Friendly Nations Visa remains open to US citizens via economic/professional ties or real estate investment — among the fastest residency routes in Latin America.",
  },
  // United Kingdom (5)
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
  {
    citizenship: "United Kingdom",
    destination: "Portugal",
    status: "common",
    note: "D7 and D8 digital nomad visas widely used by Britons post-Brexit; large existing British community, though EU freedom of movement no longer applies.",
  },
  {
    citizenship: "United Kingdom",
    destination: "Australia",
    status: "common",
    note: "Skilled visas plus the 2-year Working Holiday and family/ancestry routes are common; large British-Australian community and cultural ties ease the process.",
  },
  {
    citizenship: "United Kingdom",
    destination: "Canada",
    status: "common",
    note: "Express Entry and the Youth Mobility (IEC) working holiday scheme are standard; Commonwealth ties and a shared language simplify recognition.",
  },
  // India (5)
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
  {
    citizenship: "India",
    destination: "Canada",
    status: "common",
    note: "Express Entry and Provincial Nominee Programs are the dominant routes; India is consistently the top source country for Canadian PR and study permits.",
  },
  {
    citizenship: "India",
    destination: "United Kingdom",
    status: "common",
    note: "Skilled Worker and Global Talent visas widely used; Indians are the largest single nationality receiving UK work visas.",
  },
  {
    citizenship: "India",
    destination: "Australia",
    status: "common",
    note: "Skilled Independent (189) and Skilled Nominated (190) visas are common; India is the top source country for Australia's skilled migration intake.",
  },
  // China (5)
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
  {
    citizenship: "China",
    destination: "United States",
    status: "common",
    note: "H-1B, EB-5 investor, and F-1 student-to-work pathways all used; large existing Chinese-American community across major cities.",
  },
  {
    citizenship: "China",
    destination: "Canada",
    status: "common",
    note: "Express Entry, investor programs, and international-student pathways are common; large existing Chinese-Canadian community, particularly in Vancouver and Toronto.",
  },
  {
    citizenship: "China",
    destination: "Australia",
    status: "common",
    note: "Skilled Independent and investor visas widely used; large existing Chinese-Australian community concentrated in Sydney and Melbourne.",
  },
  // Brazil (5)
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
  {
    citizenship: "Brazil",
    destination: "United States",
    status: "common",
    note: "H-1B, EB-5 investor, and family-sponsored routes all used; large existing Brazilian community, especially in Florida and Massachusetts.",
  },
  {
    citizenship: "Brazil",
    destination: "Italy",
    status: "common",
    note: "Citizenship by descent (jure sanguinis) is the standout route — many Brazilians of Italian ancestry qualify for an Italian/EU passport directly, bypassing standard visas.",
  },
  {
    citizenship: "Brazil",
    destination: "Japan",
    status: "common",
    note: "Descendant (dekasegi) visa for those of Japanese ancestry is a long-established route, backed by a large Brazilian-Japanese community with generations of precedent.",
  },
  // Nigeria (5)
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
  {
    citizenship: "Nigeria",
    destination: "United States",
    status: "common",
    note: "Diversity Visa lottery, family sponsorship, and skilled work visas all used; large, well-established Nigerian-American community.",
  },
  {
    citizenship: "Nigeria",
    destination: "Australia",
    status: "common",
    note: "Skilled-visa demand from Nigeria has grown sharply; the points-based system rewards in-demand occupations like healthcare and IT.",
  },
  {
    citizenship: "Nigeria",
    destination: "Ghana",
    status: "common",
    note: "ECOWAS free movement protocol lets Nigerians enter and reside without a visa — among the simplest cross-border moves available to Nigerian citizens.",
  },
  // Philippines (4)
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
  {
    citizenship: "Philippines",
    destination: "United States",
    status: "common",
    note: "Family-sponsored and employment-based green cards are dominant; one of the largest and most established Filipino diaspora communities in the world.",
  },
  {
    citizenship: "Philippines",
    destination: "Saudi Arabia",
    status: "common",
    note: "Employer-sponsored work visas remain the top route; roughly 725,000 Filipinos already live in Saudi Arabia, mostly as overseas workers.",
  },
  // ─── Second expansion batch (16) — same 8 citizenships, more researched
  // destinations. Two marked "uncommon" where the route is real but
  // smaller/growing rather than an established, high-volume corridor. ───
  {
    citizenship: "Russia",
    destination: "Montenegro",
    status: "common",
    note: "Popular since 2022 for an EU-adjacent lifestyle; business/company-registration and real-estate residency routes are common, though not visa-free like Georgia or Armenia.",
  },
  {
    citizenship: "Russia",
    destination: "Indonesia",
    status: "common",
    note: "Long-stay options (B211A remote-worker, Second Home visa) are widely used by Russians relocating to Bali; large informal community, though not a path to citizenship.",
  },
  {
    citizenship: "United States",
    destination: "Italy",
    status: "common",
    note: "Elective Residency Visa is standard for Americans with passive income; many also qualify for citizenship by descent (jure sanguinis) if they have Italian ancestry.",
  },
  {
    citizenship: "United States",
    destination: "Colombia",
    status: "common",
    note: "Digital Nomad (Visa V) and Rentista routes are increasingly used by Americans, especially in Medellin; simpler and cheaper than most Latin American alternatives.",
  },
  {
    citizenship: "United Kingdom",
    destination: "UAE",
    status: "common",
    note: "Golden Visa and standard employment visas are common; large existing British expat community drawn by no income tax and an English-language business environment.",
  },
  {
    citizenship: "United Kingdom",
    destination: "New Zealand",
    status: "common",
    note: "Skilled Migrant Category plus ancestry/working-holiday routes are common; Commonwealth ties and a shared language ease the process, similar to the Australia route.",
  },
  {
    citizenship: "India",
    destination: "Germany",
    status: "common",
    note: "EU Blue Card is a major and growing route — India is consistently one of the top non-EU nationalities receiving Blue Cards, driven by IT and engineering demand.",
  },
  {
    citizenship: "India",
    destination: "Singapore",
    status: "common",
    note: "Employment Pass and S Pass are standard; Indians are one of the largest expat communities in Singapore, especially in tech and finance.",
  },
  {
    citizenship: "China",
    destination: "Thailand",
    status: "common",
    note: "Elite Visa and Long-Term Resident routes are popular with Chinese retirees and investors; large existing Chinese community, especially in Chiang Mai and Phuket.",
  },
  {
    citizenship: "China",
    destination: "New Zealand",
    status: "common",
    note: "Skilled Migrant and investor visas are established routes; long-standing Chinese-New Zealand community, particularly in Auckland.",
  },
  {
    citizenship: "Brazil",
    destination: "Canada",
    status: "common",
    note: "Express Entry and study-to-work pathways are increasingly used by Brazilians; growing community, though the English/French requirement is the main hurdle.",
  },
  {
    citizenship: "Brazil",
    destination: "United Kingdom",
    status: "uncommon",
    note: "No special UK mobility agreement for Brazilians, unlike the Portugal/Spain routes; Skilled Worker visa and (for eligible ages) Youth Mobility are used but this is a smaller, harder path.",
  },
  {
    citizenship: "Nigeria",
    destination: "Ireland",
    status: "uncommon",
    note: "Skilled Worker and student-to-stay-back visas are used and growing, but this route is smaller and less established than Nigeria's UK or Canada corridors.",
  },
  {
    citizenship: "Nigeria",
    destination: "Germany",
    status: "uncommon",
    note: "Skilled Worker visa and Ausbildung (vocational training) programs are increasingly popular, but this corridor is newer and smaller than the UK/Canada routes.",
  },
  {
    citizenship: "Philippines",
    destination: "Australia",
    status: "common",
    note: "Skilled Independent and Employer Sponsored visas are common; large, well-established Filipino-Australian community.",
  },
  {
    citizenship: "Philippines",
    destination: "Japan",
    status: "common",
    note: "Technical Intern Training Program and entertainer/caregiver visas are long-standing routes; large historic Filipino community in Japan.",
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
  // Derive canonical from the route path (outPath relative to dist/, minus
  // the trailing index.html) — every writePage caller gets a canonical tag
  // for free, which the previous version of this script never emitted.
  const routePath = outPath
    .replace(distDir, "")
    .replace(/index\.html$/, "")
    .replace(/\/+$/, "");
  const canonical = `https://relova.ai${routePath || "/"}`;
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/favicon.png?v=3" type="image/png" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://relova.ai/og-image.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="https://relova.ai/og-image.jpg" />
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

// Group all launch pairs by citizenship for the hub's full link list — was
// 3 hardcoded links out of 21 actual prerendered pages, leaving 18 of them
// with no internal link path at all (sitemap-only discovery).
function groupPairsByCitizenship(pairs) {
  const order = [];
  const map = new Map();
  for (const p of pairs) {
    if (!map.has(p.citizenship)) {
      map.set(p.citizenship, []);
      order.push(p.citizenship);
    }
    map.get(p.citizenship).push(p.destination);
  }
  return order.map((citizenship) => ({ citizenship, destinations: map.get(citizenship) }));
}

// ─── Tools hub (/tools) — was entirely missing: no route, no prerendered
// shell, not in the sitemap. src/pages/tools/ToolsHub.tsx is the live
// React page; this static shell is what crawlers see before hydration. ───
writePage({
  outPath: join(distDir, "tools", "index.html"),
  title: "Free Relocation Tools — Relova",
  description:
    "Free tools for planning a move abroad: passport feasibility checks, document checklists, country comparisons, and more — no account needed.",
  bodyHtml: `
    <main style="max-width:40rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2">Free relocation tools</h1>
      <p style="color:#666;margin-top:0.75rem">No account needed. See also <a href="/data-sources">how the data behind these tools is generated</a>.</p>
      <ul style="margin-top:1.5rem;padding-left:1.25rem;line-height:2">
        <li><a href="/tools/can-i-move">Can I Move? — passport feasibility check</a></li>
        <li><a href="/tools/where-should-i-move">Where Should I Move? — profile-based country shortlist</a></li>
        <li><a href="/tools/documents-needed">Documents Needed — relocation document checklist</a></li>
        <li><a href="/tools/country-compare">Country Compare — side-by-side country comparison</a></li>
        <li><a href="/tools/invitation-letter">Invitation Letter Generator</a></li>
        <li><a href="/tools/tax-residency-tracker">Tax Residency Tracker — 183-day rule</a></li>
      </ul>
    </main>
  `,
});

// Hub
writePage({
  outPath: join(distDir, "tools", "can-i-move", "index.html"),
  title: "Can I move to another country with my passport? — Relova",
  description:
    "Free passport check: see whether relocating to a destination is often feasible for your citizenship — then get a personalized plan.",
  bodyHtml: `
    <main style="max-width:36rem;margin:4rem auto;padding:1.5rem;font-family:system-ui,sans-serif">
      <h1 style="font-family:Georgia,serif;font-size:1.75rem;line-height:1.2">Can I move to another country with my passport?</h1>
      <p style="color:#666;margin-top:0.75rem">Pick your citizenship and where you want to go for a quick, honest signal — then build a full plan if it looks promising.</p>
      ${groupPairsByCitizenship(LAUNCH_PAIRS)
        .map(
          (g) =>
            `<p style="margin-top:1.25rem"><strong>${escapeHtml(g.citizenship)}:</strong> ${g.destinations
              .map((d) => `<a href="/tools/can-i-move/${slugify(g.citizenship)}/${slugify(d)}">${escapeHtml(d)}</a>`)
              .join(" · ")}</p>`,
        )
        .join("\n      ")}
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

// Can I Move and Country Compare tables reuse LAUNCH_PAIRS and
// compareSnapshots, both already built earlier in this script — no need to
// duplicate either pair list here.
const canIMoveTableRows = LAUNCH_PAIRS.map((p) => {
  const href = `/tools/can-i-move/${slugify(p.citizenship)}/${slugify(p.destination)}`;
  return `<tr>
        <td style="padding:0.5rem 0.75rem;border-top:1px solid #e8e4dc">${escapeHtml(p.citizenship)}</td>
        <td style="padding:0.5rem 0.75rem;border-top:1px solid #e8e4dc">${escapeHtml(p.destination)}</td>
        <td style="padding:0.5rem 0.75rem;border-top:1px solid #e8e4dc">${escapeHtml(verdictLabel(p.status))}</td>
        <td style="padding:0.5rem 0.75rem;border-top:1px solid #e8e4dc"><a href="${href}">View check</a></td>
      </tr>`;
}).join("\n      ");

const compareTableRows = compareSnapshots.map((s) => {
  return `<tr>
        <td style="padding:0.5rem 0.75rem;border-top:1px solid #e8e4dc">${escapeHtml(s.demonym ?? "Any")}</td>
        <td style="padding:0.5rem 0.75rem;border-top:1px solid #e8e4dc">${escapeHtml(s.countryA)} vs ${escapeHtml(s.countryB)}</td>
        <td style="padding:0.5rem 0.75rem;border-top:1px solid #e8e4dc"><a href="${escapeHtml(s.path)}">Compare</a></td>
      </tr>`;
}).join("\n      ");

writePage({
  outPath: join(distDir, "data-sources", "index.html"),
  title: "Data & Sources — Relova",
  description:
    "How Relova's tools and data are built: coverage for every tool, methodology, last-verified dates, and terms for citing source-cited (Tier 1) data.",
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
        <li><strong>${LAUNCH_PAIRS.length}</strong> cached Can I Move citizenship → destination checks published</li>
        <li><strong>${compareSnapshots.length}</strong> cached Country Compare pages published</li>
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

      <h2 id="can-i-move-pairs" style="font-family:Georgia,serif;font-size:1.25rem;margin-top:2rem">Cached Can I Move checks</h2>
      <p style="color:#555;margin-top:0.75rem;line-height:1.6">Every citizenship → destination pair with a published Can I Move page (${LAUNCH_PAIRS.length} pairs). Verdicts summarize the cached citizenship-candidate research described above; check each destination page for the underlying note.</p>
      <div style="overflow-x:auto;margin-top:1rem;border:1px solid #e8e4dc;border-radius:0.75rem">
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem;min-width:30rem">
        <thead>
          <tr style="background:#f6f3ee;text-align:left;font-size:0.7rem;letter-spacing:0.06em;text-transform:uppercase;color:#666">
            <th style="padding:0.6rem 0.75rem">Citizenship</th>
            <th style="padding:0.6rem 0.75rem">Destination</th>
            <th style="padding:0.6rem 0.75rem">Verdict</th>
            <th style="padding:0.6rem 0.75rem">Check</th>
          </tr>
        </thead>
        <tbody>
      ${canIMoveTableRows}
        </tbody>
      </table>
      </div>

      <h2 id="country-compare-pairs" style="font-family:Georgia,serif;font-size:1.25rem;margin-top:2rem">Cached Country Compare pages</h2>
      <p style="color:#555;margin-top:0.75rem;line-height:1.6">Every country pair with a published Country Compare page (${compareSnapshots.length} pairs). Table data on each page is computed live from the static reference database above, not separately researched per pair.</p>
      <div style="overflow-x:auto;margin-top:1rem;border:1px solid #e8e4dc;border-radius:0.75rem">
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem;min-width:30rem">
        <thead>
          <tr style="background:#f6f3ee;text-align:left;font-size:0.7rem;letter-spacing:0.06em;text-transform:uppercase;color:#666">
            <th style="padding:0.6rem 0.75rem">Citizenship lens</th>
            <th style="padding:0.6rem 0.75rem">Countries</th>
            <th style="padding:0.6rem 0.75rem">Compare</th>
          </tr>
        </thead>
        <tbody>
      ${compareTableRows}
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
