/**
 * Warm document_requirement_cache for launch pairs via generate-document-checklist
 * (no user_id → cache-only). Sequential + rate-limited.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/warm-document-checklist.mjs
 * Or with VITE_ vars from .env loaded by the shell.
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PAIRS = [
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

  const snapshots = [];
  const failures = [];

  for (let i = 0; i < PAIRS.length; i++) {
    const pair = PAIRS[i];
    const label = `${pair.citizenship} → ${pair.destination} (${pair.visa_type})`;
    console.log(`[${i + 1}/${PAIRS.length}] Warming ${label}…`);

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
      console.log(
        `  → HTTP ${res.status}, source=${source}, docs=${docs.length}, generated_at=${data.generated_at ?? "n/a"}`,
      );

      if (!res.ok || docs.length === 0 || source === "fallback") {
        failures.push({ pair, status: res.status, source, error: data.error });
      } else {
        snapshots.push({
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

    if (i < PAIRS.length - 1) {
      console.log("  sleeping 8s…");
      await sleep(8000);
    }
  }

  const outPath = join(__dirname, "document-checklist-snapshots.json");
  writeFileSync(outPath, JSON.stringify(snapshots, null, 2), "utf8");
  console.log(`\nWrote ${snapshots.length} snapshots → ${outPath}`);
  if (failures.length) {
    console.error(`\nFailures (${failures.length}):`);
    for (const f of failures) console.error(JSON.stringify(f));
    process.exitCode = 1;
  } else {
    console.log("All pairs warmed successfully.");
  }
}

main();
