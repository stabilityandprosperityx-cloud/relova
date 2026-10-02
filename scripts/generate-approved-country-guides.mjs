/**
 * Merge the approved static redesign with the complete country data that
 * previously lived only in the React CountryPage. This keeps the visual
 * language of /countries/ while restoring visas, taxes, costs and checklists.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const viteNode = join(root, "node_modules", ".bin", "vite-node");
const countries = JSON.parse(execFileSync(viteNode, [join(root, "scripts", "dump-countries.ts")], {
  cwd: root,
  encoding: "utf8",
}).trim());

const iceland = {
  slug: "iceland",
  name: "Iceland",
  flag: "🇮🇸",
  tagline: "Nordic safety, dramatic nature, and a highly connected international community",
  highlights: ["Remote Work Long-Term Visa", "Exceptional safety", "Highly connected society"],
  visaOptions: [
    { name: "Remote Work Long-Term Visa", duration: "Up to 180 days", requirements: "For eligible non-EEA remote workers employed by a foreign company; income and health-insurance evidence required." },
    { name: "Residence Permit for Qualified Professionals", duration: "Employer-linked", requirements: "A qualifying Icelandic job offer and employer-supported residence/work application." },
    { name: "Student Residence Permit", duration: "For the study period", requirements: "Admission to an Icelandic institution plus proof of funds, housing, and insurance." },
  ],
  taxInfo: [
    { label: "Personal income tax", value: "Progressive national and municipal taxation" },
    { label: "Corporate income tax", value: "20% standard rate" },
    { label: "VAT", value: "24% standard rate; reduced rates apply" },
    { label: "Important", value: "Tax residence depends on time spent and personal circumstances—verify before moving." },
  ],
  costOfLiving: [
    { item: "Comfortable living (single, typical)", cost: "ISK 350,000–550,000/mo" },
    { item: "Housing", cost: "Highest in Reykjavík and nearby municipalities" },
    { item: "Groceries and dining", cost: "Above the European average" },
    { item: "Transport", cost: "Public transport in Reykjavík; a car is useful outside it" },
  ],
  checklist: [
    "Confirm the correct visa or residence route for your nationality and purpose",
    "Prepare proof of remote income or an Icelandic employment contract",
    "Arrange valid health insurance for the required period",
    "Gather and legalize civil and police-clearance documents where required",
    "Secure accommodation before arrival",
    "Register your legal domicile and obtain a kennitala when eligible",
    "Open a local bank account and confirm your tax-registration obligations",
  ],
};

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cards(items) {
  return items.map((item) => `
    <article class="guide-visa-card">
      <div class="guide-visa-head"><h3>${esc(item.name)}</h3><span>${esc(item.duration)}</span></div>
      <p>${esc(item.requirements)}</p>
    </article>`).join("");
}

function rows(items) {
  return items.map((item) => `
    <div class="guide-data-row"><span>${esc(item.label ?? item.item)}</span><strong>${esc(item.value ?? item.cost)}</strong></div>`).join("");
}

function render(country, outputSlug, templateSlug = outputSlug) {
  const templatePath = join(dist, "countries", templateSlug, "index.html");
  if (!existsSync(templatePath)) throw new Error(`Missing approved country template: ${templatePath}`);
  const source = readFileSync(templatePath, "utf8");
  const mainStart = source.indexOf("<main");
  const mainEnd = source.indexOf("</main>", mainStart);
  if (mainStart < 0 || mainEnd < 0) throw new Error(`Invalid country template: ${templatePath}`);
  const image = source.match(/<div class="detail-cover"><img src="([^"]+)"/)?.[1] ?? `/assets/${outputSlug}.jpg`;
  const highlights = (country.highlights ?? []).slice(0, 3).map((h) => `<span>${esc(h)}</span>`).join("");
  const checklist = (country.checklist ?? []).map((step, index) => `
    <li><b>${String(index + 1).padStart(2, "0")}</b><span>${esc(step)}</span></li>`).join("");
  const main = `<main class="country-guide-page">
    <section class="page-hero country-guide-title">
      <div class="container">
        <a class="guide-back" href="/countries/">← All countries</a>
        <span class="eyebrow">Country guide</span>
        <h1>${esc(country.flag)} ${esc(country.name)}</h1>
        <p>${esc(country.tagline)}</p>
      </div>
    </section>

    <div class="container guide-overview">
      <figure class="guide-cover">
        <img src="${esc(image)}" alt="${esc(country.name)}" loading="eager">
        <figcaption>${esc(country.name.toUpperCase())} / DESTINATION GUIDE</figcaption>
      </figure>
      <div class="guide-summary">
        <span class="eyebrow">At a glance</span>
        <h2>A clearer way to plan your move to ${esc(country.name)}.</h2>
        <p>Explore realistic visa routes, the tax landscape, everyday costs, and the practical steps that turn research into a relocation plan.</p>
        <div class="guide-highlights">${highlights}</div>
        <div class="guide-actions">
          <a class="btn btn-plum" href="/tools/can-i-move">Check my eligibility</a>
          <a class="guide-text-link" href="/chat">Build my plan</a>
        </div>
      </div>
    </div>

    <section class="container guide-section">
      <div class="guide-section-heading"><span>01</span><div><p class="eyebrow">Residency routes</p><h2>Visa options</h2></div></div>
      <div class="guide-visa-grid">${cards(country.visaOptions ?? [])}</div>
    </section>

    <section class="container guide-section guide-two-column">
      <div>
        <div class="guide-section-heading"><span>02</span><div><p class="eyebrow">Financial picture</p><h2>Tax overview</h2></div></div>
        <div class="guide-data-card">${rows(country.taxInfo ?? [])}</div>
      </div>
      <div>
        <div class="guide-section-heading"><span>03</span><div><p class="eyebrow">Everyday reality</p><h2>Cost of living</h2></div></div>
        <div class="guide-data-card">${rows(country.costOfLiving ?? [])}</div>
      </div>
    </section>

    <section class="container guide-section">
      <div class="guide-section-heading"><span>04</span><div><p class="eyebrow">Your next steps</p><h2>Relocation checklist</h2></div></div>
      <ol class="guide-checklist">${checklist}</ol>
    </section>

    <section class="container guide-final-cta">
      <div><span class="eyebrow">Personalized guidance</span><h2>Make ${esc(country.name)} more than an idea.</h2><p>Get a relocation plan built around your passport, budget, family, and timeline.</p></div>
      <a class="btn btn-plum" href="/chat">Talk to your Relocation Expert</a>
    </section>
    <p class="container guide-disclaimer">Information is a planning overview, not legal or tax advice. Requirements and rates can change; confirm them with official authorities before acting.</p>
  </main>`;
  const target = join(dist, "countries", outputSlug, "index.html");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${source.slice(0, mainStart)}${main}${source.slice(mainEnd + 7)}`, "utf8");
}

for (const country of countries) {
  const outputSlug = country.slug === "uk" ? "united-kingdom" : country.slug;
  render(country, outputSlug);
  if (country.slug === "uk") render(country, "uk", "united-kingdom");
}
render(iceland, "iceland");

console.log(`generate-approved-country-guides: wrote ${countries.length + 2} full guides`);
