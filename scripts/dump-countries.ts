/**
 * Build helper: dump countryData as JSON for prerender-countries.mjs.
 * Run via: npx vite-node scripts/dump-countries.ts
 */
import { countryData } from "../src/data/countries";

const snapshot = Object.entries(countryData).map(([slug, c]) => ({
  slug,
  name: c.name,
  flag: c.flag,
  tagline: c.tagline,
  highlights: c.highlights,
  visaOptions: c.visaOptions,
  taxInfo: c.taxInfo,
  costOfLiving: c.costOfLiving,
  checklist: c.checklist,
}));

process.stdout.write(JSON.stringify(snapshot));
