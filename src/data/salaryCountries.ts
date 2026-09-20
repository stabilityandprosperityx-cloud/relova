// Countries that have real salary data on salary.relova.ai. Used to link a
// relova.ai country guide to its matching salary.relova.ai/<slug> page when
// one actually exists — a dead link is worse than no link.
//
// Keyed by relova.ai's own country slug (src/data/countries.ts). Keep in
// sync with salary-reality's lib/slugs.ts COUNTRIES list.
const DIRECT_MATCH_SLUGS = new Set([
  "albania", "argentina", "armenia", "australia", "austria", "belgium",
  "brazil", "canada", "chile", "colombia", "costa-rica", "croatia",
  "czech-republic", "denmark", "ecuador", "finland", "france", "georgia",
  "germany", "greece", "hungary", "indonesia", "ireland", "italy", "japan",
  "malaysia", "mexico", "montenegro", "morocco", "netherlands",
  "new-zealand", "norway", "panama", "paraguay", "peru", "philippines",
  "poland", "portugal", "qatar", "romania", "serbia", "singapore",
  "south-africa", "south-korea", "spain", "sweden", "switzerland",
  "thailand", "turkey", "uruguay", "vietnam",
]);

// relova.ai uses short codes for these three; salary-reality spells them out.
const SLUG_OVERRIDES: Record<string, string> = {
  uae: "united-arab-emirates",
  uk: "united-kingdom",
  usa: "united-states",
};

// Returns the salary.relova.ai slug for a given relova.ai country slug, or
// undefined if salary.relova.ai doesn't have data for it (yet).
export function salaryCountrySlug(relovaSlug: string): string | undefined {
  if (SLUG_OVERRIDES[relovaSlug]) return SLUG_OVERRIDES[relovaSlug];
  return DIRECT_MATCH_SLUGS.has(relovaSlug) ? relovaSlug : undefined;
}
