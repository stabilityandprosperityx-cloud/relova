/**
 * Warm document_requirement_cache for launch pairs via generate-document-checklist
 * (no user_id → cache-only). Sequential + rate-limited. Merges into existing snapshots.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/warm-document-checklist.mjs
 *   ONLY_NEW=1 …  → warm pairs not already in snapshots
 * Or with VITE_ vars from .env loaded by the shell.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Mirror DOCUMENTS_LAUNCH_PAIRS + determineVisaType without TS transpile
function determineVisaType(country) {
  const visaMap = {
    Portugal: "D8_Digital_Nomad",
    Spain: "Digital_Nomad",
    Germany: "Freelance_Visa",
    Italy: "Digital_Nomad",
    Greece: "Digital_Nomad",
    Croatia: "Digital_Nomad",
    "Czech Republic": "Long_Term_Residence",
    Hungary: "White_Card",
    Malta: "Nomad_Residence_Permit",
    Cyprus: "Digital_Nomad",
    Estonia: "Digital_Nomad",
    Netherlands: "Highly_Skilled_Migrant",
    France: "Talent_Passport",
    Austria: "Red_White_Red_Card",
    Poland: "Temporary_Residence",
    Bulgaria: "Digital_Nomad",
    Serbia: "Temporary_Residence",
    Montenegro: "Temporary_Residence",
    Albania: "Visa_Free",
    Switzerland: "Work_Permit_B",
    Norway: "Skilled_Worker",
    Sweden: "Work_Permit",
    Denmark: "Pay_Limit_Scheme",
    Finland: "Work_Permit",
    Ireland: "Critical_Skills",
    Belgium: "Single_Permit",
    Romania: "Digital_Nomad",
    Slovakia: "Temporary_Residence",
    Slovenia: "Temporary_Residence",
    UAE: "Freelance_Permit",
    Turkey: "Residence_Permit",
    Israel: "Work_Visa",
    "Saudi Arabia": "Work_Visa",
    Qatar: "Work_Visa",
    Bahrain: "Digital_Nomad",
    Georgia: "Visa_Free",
    Armenia: "Visa_Free",
    Kazakhstan: "Temporary_Residence",
    Uzbekistan: "Temporary_Stay",
    Thailand: "DTV",
    "Bali / Indonesia": "Social_Visa",
    Indonesia: "Social_Visa",
    Vietnam: "E_Visa",
    Malaysia: "DE_Rantau",
    Japan: "Digital_Nomad",
    Singapore: "Employment_Pass",
    "South Korea": "Workcation_Visa",
    Philippines: "Digital_Nomad",
    Taiwan: "Gold_Card",
    "Hong Kong": "Quality_Migrant",
    Mexico: "Temporary_Resident",
    Colombia: "Digital_Nomad",
    Brazil: "Digital_Nomad",
    Argentina: "Rentista",
    Panama: "Friendly_Nations",
    "Costa Rica": "Rentista",
    Ecuador: "Professional_Visa",
    Chile: "Temporary_Residence",
    Uruguay: "Temporary_Residence",
    Canada: "Express_Entry",
    "United States": "Work_Visa",
    "United Kingdom": "Temporary_Residence",
    "South Africa": "Critical_Skills",
    Morocco: "Residence_Permit",
    Mauritius: "Premium_Visa",
    "Cape Verde": "Digital_Nomad",
    Seychelles: "Workcation",
    Australia: "Skilled_Nominated",
    "New Zealand": "Skilled_Migrant",
  };
  return visaMap[country] || "Temporary_Residence";
}

const PAIRS = [
  { citizenship: "Russia", destination: "Portugal", visa_type: determineVisaType("Portugal") },
  { citizenship: "Russia", destination: "Armenia", visa_type: determineVisaType("Armenia") },
  { citizenship: "Russia", destination: "Cyprus", visa_type: determineVisaType("Cyprus") },
  { citizenship: "Russia", destination: "Czech Republic", visa_type: determineVisaType("Czech Republic") },
  { citizenship: "Russia", destination: "Montenegro", visa_type: determineVisaType("Montenegro") },
  { citizenship: "Russia", destination: "Georgia", visa_type: determineVisaType("Georgia") },
  { citizenship: "Russia", destination: "Turkey", visa_type: determineVisaType("Turkey") },
  { citizenship: "Russia", destination: "UAE", visa_type: determineVisaType("UAE") },
  { citizenship: "Russia", destination: "Thailand", visa_type: determineVisaType("Thailand") },
  { citizenship: "United States", destination: "Portugal", visa_type: determineVisaType("Portugal") },
  { citizenship: "United States", destination: "Mexico", visa_type: determineVisaType("Mexico") },
  { citizenship: "United Kingdom", destination: "Spain", visa_type: determineVisaType("Spain") },
  { citizenship: "India", destination: "UAE", visa_type: determineVisaType("UAE") },
  { citizenship: "India", destination: "Germany", visa_type: determineVisaType("Germany") },
  { citizenship: "Brazil", destination: "Portugal", visa_type: determineVisaType("Portugal") },
  { citizenship: "Brazil", destination: "Spain", visa_type: determineVisaType("Spain") },
  { citizenship: "China", destination: "Japan", visa_type: determineVisaType("Japan") },
  { citizenship: "China", destination: "Singapore", visa_type: determineVisaType("Singapore") },
  { citizenship: "Nigeria", destination: "United Kingdom", visa_type: determineVisaType("United Kingdom") },
  { citizenship: "Nigeria", destination: "Canada", visa_type: determineVisaType("Canada") },
  { citizenship: "Philippines", destination: "UAE", visa_type: determineVisaType("UAE") },
  { citizenship: "Philippines", destination: "Canada", visa_type: determineVisaType("Canada") },
  { citizenship: "Germany", destination: "Portugal", visa_type: determineVisaType("Portugal") },
];

/** Pairs requested in the diversification batch (may overlap existing). */
const DIVERSIFY_BATCH = [
  { citizenship: "Nigeria", destination: "United Kingdom" },
  { citizenship: "Nigeria", destination: "Canada" },
  { citizenship: "Philippines", destination: "UAE" },
  { citizenship: "Philippines", destination: "Canada" },
  { citizenship: "Germany", destination: "Portugal" },
  { citizenship: "United States", destination: "Mexico" },
  { citizenship: "United Kingdom", destination: "Spain" },
  { citizenship: "India", destination: "Germany" },
  { citizenship: "Brazil", destination: "Spain" },
  { citizenship: "China", destination: "Singapore" },
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pairKey(p) {
  return `${p.citizenship}|${p.destination}|${p.visa_type || determineVisaType(p.destination)}`;
}

async function main() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!url || !key) {
    console.error("Missing SUPABASE_URL / anon key env vars");
    process.exit(1);
  }

  const outPath = join(__dirname, "document-checklist-snapshots.json");
  let existing = [];
  if (existsSync(outPath)) {
    try {
      existing = JSON.parse(readFileSync(outPath, "utf8"));
    } catch (err) {
      console.warn("Could not parse existing snapshots, starting fresh", err);
    }
  }
  const byKey = new Map(existing.map((s) => [pairKey(s), s]));

  const onlyNew = process.env.ONLY_NEW === "1" || process.env.ONLY_NEW === "true";
  const diversify = process.env.DIVERSIFY === "1" || process.env.DIVERSIFY === "true";

  let toWarm = PAIRS.map((p) => ({
    ...p,
    visa_type: p.visa_type || determineVisaType(p.destination),
  }));

  if (diversify) {
    toWarm = DIVERSIFY_BATCH.map((p) => ({
      citizenship: p.citizenship,
      destination: p.destination,
      visa_type: determineVisaType(p.destination),
    }));
  }

  if (onlyNew) {
    toWarm = toWarm.filter((p) => !byKey.has(pairKey(p)));
  }

  console.log(`Warming ${toWarm.length} pairs (onlyNew=${onlyNew}, diversify=${diversify})…`);
  for (const p of toWarm) {
    console.log(`  · ${p.citizenship} → ${p.destination} (${p.visa_type})`);
  }

  const failures = [];
  let stoppedForBilling = false;

  for (let i = 0; i < toWarm.length; i++) {
    const pair = toWarm[i];
    const label = `${pair.citizenship} → ${pair.destination} (${pair.visa_type})`;
    console.log(`[${i + 1}/${toWarm.length}] Warming ${label}…`);

    try {
      const res = await fetch(`${url}/functions/v1/generate-document-checklist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          apikey: key,
        },
        body: JSON.stringify({
          citizenship_country: pair.citizenship,
          destination_country: pair.destination,
          visa_type: pair.visa_type,
        }),
      });
      const data = await res.json();
      const docs = Array.isArray(data.documents) ? data.documents : [];
      const source = data.source ?? "unknown";
      const genErr = data.generation_error ?? "";
      console.log(
        `  → HTTP ${res.status}, source=${source}, docs=${docs.length}, generated_at=${data.generated_at ?? "n/a"}`,
      );
      if (genErr) console.log(`  → generation_error: ${genErr}`);

      if (/credit balance is too low|billing/i.test(String(genErr))) {
        console.error("\nSTOPPING: Anthropic billing error detected. Not continuing further pairs.");
        failures.push({ pair, status: res.status, source, error: genErr });
        stoppedForBilling = true;
        break;
      }

      if (!res.ok || docs.length === 0 || source === "fallback") {
        failures.push({ pair, status: res.status, source, error: genErr || data.error });
      } else {
        byKey.set(pairKey(pair), {
          citizenship: pair.citizenship,
          destination: pair.destination,
          visa_type: pair.visa_type,
          cSlug: slugify(pair.citizenship),
          dSlug: slugify(pair.destination),
          generated_at: data.generated_at,
          documents: docs,
          source,
        });
      }
    } catch (err) {
      console.error(`  → FAILED`, err);
      failures.push({ pair, error: String(err) });
    }

    if (stoppedForBilling) break;
    if (i < toWarm.length - 1) {
      console.log("  sleeping 8s…");
      await sleep(8000);
    }
  }

  // Keep launch-pair order when writing
  const ordered = [];
  const seen = new Set();
  for (const p of PAIRS) {
    const k = pairKey(p);
    const snap = byKey.get(k);
    if (snap) {
      ordered.push(snap);
      seen.add(k);
    }
  }
  for (const [k, snap] of byKey) {
    if (!seen.has(k)) ordered.push(snap);
  }

  writeFileSync(outPath, JSON.stringify(ordered, null, 2) + "\n", "utf8");
  console.log(`\nWrote ${ordered.length} snapshots → ${outPath}`);
  if (failures.length) {
    console.error(`\nFailures (${failures.length}):`);
    for (const f of failures) console.error(JSON.stringify(f));
    process.exitCode = 1;
  } else {
    console.log("All pairs warmed successfully.");
  }
}

main();
