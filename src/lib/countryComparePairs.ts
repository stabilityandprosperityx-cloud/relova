import { slugify } from "./toolSlugs";

export interface CompareLaunchPair {
  /** Omit for generic A-vs-B pages. */
  citizenship?: string;
  countryA: string;
  countryB: string;
}

/**
 * Launch / prerender pairs for Country Compare (12 citizenship-aware + 190
 * generic A-vs-B, the latter a full combinatorial matrix across 20 popular
 * destination countries — was 3 generic pairs, leaving 190 real, useful
 * comparisons undiscoverable). Every row in the rendered table comes from
 * countryCompareRows.ts reading real per-country profile data
 * (src/lib/countryMatching.ts), so this expansion adds no hand-authored
 * claims — it's the same feature just applied to more country pairs.
 */
export const COMPARE_LAUNCH_PAIRS: CompareLaunchPair[] = [
  // ─── Citizenship-aware (12) ───
  { citizenship: "India", countryA: "Portugal", countryB: "Spain" },
  { citizenship: "India", countryA: "UAE", countryB: "Portugal" },
  { citizenship: "Brazil", countryA: "Portugal", countryB: "Spain" },
  { citizenship: "United Kingdom", countryA: "Spain", countryB: "Portugal" },
  { citizenship: "United States", countryA: "Portugal", countryB: "Mexico" },
  { citizenship: "Russia", countryA: "Georgia", countryB: "Armenia" },
  { citizenship: "Russia", countryA: "UAE", countryB: "Cyprus" },
  { citizenship: "Russia", countryA: "Portugal", countryB: "Thailand" },
  { citizenship: "China", countryA: "Singapore", countryB: "Japan" },
  { citizenship: "Nigeria", countryA: "United Kingdom", countryB: "Canada" },
  { citizenship: "Philippines", countryA: "UAE", countryB: "Canada" },
  { citizenship: "Germany", countryA: "Portugal", countryB: "Spain" },
  // ─── Generic A-vs-B (190) — full matrix across 20 popular destinations ───
  { countryA: "Portugal", countryB: "Spain" },
  { countryA: "UAE", countryB: "Cyprus" },
  { countryA: "Georgia", countryB: "Armenia" },
  { countryA: "Portugal", countryB: "Italy" },
  { countryA: "Portugal", countryB: "Greece" },
  { countryA: "Portugal", countryB: "Cyprus" },
  { countryA: "Portugal", countryB: "Malta" },
  { countryA: "Portugal", countryB: "Germany" },
  { countryA: "Portugal", countryB: "Netherlands" },
  { countryA: "Portugal", countryB: "France" },
  { countryA: "Portugal", countryB: "Ireland" },
  { countryA: "Portugal", countryB: "Turkey" },
  { countryA: "Portugal", countryB: "Georgia" },
  { countryA: "Portugal", countryB: "Armenia" },
  { countryA: "Portugal", countryB: "UAE" },
  { countryA: "Portugal", countryB: "Thailand" },
  { countryA: "Portugal", countryB: "Malaysia" },
  { countryA: "Portugal", countryB: "Singapore" },
  { countryA: "Portugal", countryB: "Japan" },
  { countryA: "Portugal", countryB: "Mexico" },
  { countryA: "Portugal", countryB: "Canada" },
  { countryA: "Spain", countryB: "Italy" },
  { countryA: "Spain", countryB: "Greece" },
  { countryA: "Spain", countryB: "Cyprus" },
  { countryA: "Spain", countryB: "Malta" },
  { countryA: "Spain", countryB: "Germany" },
  { countryA: "Spain", countryB: "Netherlands" },
  { countryA: "Spain", countryB: "France" },
  { countryA: "Spain", countryB: "Ireland" },
  { countryA: "Spain", countryB: "Turkey" },
  { countryA: "Spain", countryB: "Georgia" },
  { countryA: "Spain", countryB: "Armenia" },
  { countryA: "Spain", countryB: "UAE" },
  { countryA: "Spain", countryB: "Thailand" },
  { countryA: "Spain", countryB: "Malaysia" },
  { countryA: "Spain", countryB: "Singapore" },
  { countryA: "Spain", countryB: "Japan" },
  { countryA: "Spain", countryB: "Mexico" },
  { countryA: "Spain", countryB: "Canada" },
  { countryA: "Italy", countryB: "Greece" },
  { countryA: "Italy", countryB: "Cyprus" },
  { countryA: "Italy", countryB: "Malta" },
  { countryA: "Italy", countryB: "Germany" },
  { countryA: "Italy", countryB: "Netherlands" },
  { countryA: "Italy", countryB: "France" },
  { countryA: "Italy", countryB: "Ireland" },
  { countryA: "Italy", countryB: "Turkey" },
  { countryA: "Italy", countryB: "Georgia" },
  { countryA: "Italy", countryB: "Armenia" },
  { countryA: "Italy", countryB: "UAE" },
  { countryA: "Italy", countryB: "Thailand" },
  { countryA: "Italy", countryB: "Malaysia" },
  { countryA: "Italy", countryB: "Singapore" },
  { countryA: "Italy", countryB: "Japan" },
  { countryA: "Italy", countryB: "Mexico" },
  { countryA: "Italy", countryB: "Canada" },
  { countryA: "Greece", countryB: "Cyprus" },
  { countryA: "Greece", countryB: "Malta" },
  { countryA: "Greece", countryB: "Germany" },
  { countryA: "Greece", countryB: "Netherlands" },
  { countryA: "Greece", countryB: "France" },
  { countryA: "Greece", countryB: "Ireland" },
  { countryA: "Greece", countryB: "Turkey" },
  { countryA: "Greece", countryB: "Georgia" },
  { countryA: "Greece", countryB: "Armenia" },
  { countryA: "Greece", countryB: "UAE" },
  { countryA: "Greece", countryB: "Thailand" },
  { countryA: "Greece", countryB: "Malaysia" },
  { countryA: "Greece", countryB: "Singapore" },
  { countryA: "Greece", countryB: "Japan" },
  { countryA: "Greece", countryB: "Mexico" },
  { countryA: "Greece", countryB: "Canada" },
  { countryA: "Cyprus", countryB: "Malta" },
  { countryA: "Cyprus", countryB: "Germany" },
  { countryA: "Cyprus", countryB: "Netherlands" },
  { countryA: "Cyprus", countryB: "France" },
  { countryA: "Cyprus", countryB: "Ireland" },
  { countryA: "Cyprus", countryB: "Turkey" },
  { countryA: "Cyprus", countryB: "Georgia" },
  { countryA: "Cyprus", countryB: "Armenia" },
  { countryA: "Cyprus", countryB: "Thailand" },
  { countryA: "Cyprus", countryB: "Malaysia" },
  { countryA: "Cyprus", countryB: "Singapore" },
  { countryA: "Cyprus", countryB: "Japan" },
  { countryA: "Cyprus", countryB: "Mexico" },
  { countryA: "Cyprus", countryB: "Canada" },
  { countryA: "Malta", countryB: "Germany" },
  { countryA: "Malta", countryB: "Netherlands" },
  { countryA: "Malta", countryB: "France" },
  { countryA: "Malta", countryB: "Ireland" },
  { countryA: "Malta", countryB: "Turkey" },
  { countryA: "Malta", countryB: "Georgia" },
  { countryA: "Malta", countryB: "Armenia" },
  { countryA: "Malta", countryB: "UAE" },
  { countryA: "Malta", countryB: "Thailand" },
  { countryA: "Malta", countryB: "Malaysia" },
  { countryA: "Malta", countryB: "Singapore" },
  { countryA: "Malta", countryB: "Japan" },
  { countryA: "Malta", countryB: "Mexico" },
  { countryA: "Malta", countryB: "Canada" },
  { countryA: "Germany", countryB: "Netherlands" },
  { countryA: "Germany", countryB: "France" },
  { countryA: "Germany", countryB: "Ireland" },
  { countryA: "Germany", countryB: "Turkey" },
  { countryA: "Germany", countryB: "Georgia" },
  { countryA: "Germany", countryB: "Armenia" },
  { countryA: "Germany", countryB: "UAE" },
  { countryA: "Germany", countryB: "Thailand" },
  { countryA: "Germany", countryB: "Malaysia" },
  { countryA: "Germany", countryB: "Singapore" },
  { countryA: "Germany", countryB: "Japan" },
  { countryA: "Germany", countryB: "Mexico" },
  { countryA: "Germany", countryB: "Canada" },
  { countryA: "Netherlands", countryB: "France" },
  { countryA: "Netherlands", countryB: "Ireland" },
  { countryA: "Netherlands", countryB: "Turkey" },
  { countryA: "Netherlands", countryB: "Georgia" },
  { countryA: "Netherlands", countryB: "Armenia" },
  { countryA: "Netherlands", countryB: "UAE" },
  { countryA: "Netherlands", countryB: "Thailand" },
  { countryA: "Netherlands", countryB: "Malaysia" },
  { countryA: "Netherlands", countryB: "Singapore" },
  { countryA: "Netherlands", countryB: "Japan" },
  { countryA: "Netherlands", countryB: "Mexico" },
  { countryA: "Netherlands", countryB: "Canada" },
  { countryA: "France", countryB: "Ireland" },
  { countryA: "France", countryB: "Turkey" },
  { countryA: "France", countryB: "Georgia" },
  { countryA: "France", countryB: "Armenia" },
  { countryA: "France", countryB: "UAE" },
  { countryA: "France", countryB: "Thailand" },
  { countryA: "France", countryB: "Malaysia" },
  { countryA: "France", countryB: "Singapore" },
  { countryA: "France", countryB: "Japan" },
  { countryA: "France", countryB: "Mexico" },
  { countryA: "France", countryB: "Canada" },
  { countryA: "Ireland", countryB: "Turkey" },
  { countryA: "Ireland", countryB: "Georgia" },
  { countryA: "Ireland", countryB: "Armenia" },
  { countryA: "Ireland", countryB: "UAE" },
  { countryA: "Ireland", countryB: "Thailand" },
  { countryA: "Ireland", countryB: "Malaysia" },
  { countryA: "Ireland", countryB: "Singapore" },
  { countryA: "Ireland", countryB: "Japan" },
  { countryA: "Ireland", countryB: "Mexico" },
  { countryA: "Ireland", countryB: "Canada" },
  { countryA: "Turkey", countryB: "Georgia" },
  { countryA: "Turkey", countryB: "Armenia" },
  { countryA: "Turkey", countryB: "UAE" },
  { countryA: "Turkey", countryB: "Thailand" },
  { countryA: "Turkey", countryB: "Malaysia" },
  { countryA: "Turkey", countryB: "Singapore" },
  { countryA: "Turkey", countryB: "Japan" },
  { countryA: "Turkey", countryB: "Mexico" },
  { countryA: "Turkey", countryB: "Canada" },
  { countryA: "Georgia", countryB: "UAE" },
  { countryA: "Georgia", countryB: "Thailand" },
  { countryA: "Georgia", countryB: "Malaysia" },
  { countryA: "Georgia", countryB: "Singapore" },
  { countryA: "Georgia", countryB: "Japan" },
  { countryA: "Georgia", countryB: "Mexico" },
  { countryA: "Georgia", countryB: "Canada" },
  { countryA: "Armenia", countryB: "UAE" },
  { countryA: "Armenia", countryB: "Thailand" },
  { countryA: "Armenia", countryB: "Malaysia" },
  { countryA: "Armenia", countryB: "Singapore" },
  { countryA: "Armenia", countryB: "Japan" },
  { countryA: "Armenia", countryB: "Mexico" },
  { countryA: "Armenia", countryB: "Canada" },
  { countryA: "UAE", countryB: "Thailand" },
  { countryA: "UAE", countryB: "Malaysia" },
  { countryA: "UAE", countryB: "Singapore" },
  { countryA: "UAE", countryB: "Japan" },
  { countryA: "UAE", countryB: "Mexico" },
  { countryA: "UAE", countryB: "Canada" },
  { countryA: "Thailand", countryB: "Malaysia" },
  { countryA: "Thailand", countryB: "Singapore" },
  { countryA: "Thailand", countryB: "Japan" },
  { countryA: "Thailand", countryB: "Mexico" },
  { countryA: "Thailand", countryB: "Canada" },
  { countryA: "Malaysia", countryB: "Singapore" },
  { countryA: "Malaysia", countryB: "Japan" },
  { countryA: "Malaysia", countryB: "Mexico" },
  { countryA: "Malaysia", countryB: "Canada" },
  { countryA: "Singapore", countryB: "Japan" },
  { countryA: "Singapore", countryB: "Mexico" },
  { countryA: "Singapore", countryB: "Canada" },
  { countryA: "Japan", countryB: "Mexico" },
  { countryA: "Japan", countryB: "Canada" },
  { countryA: "Mexico", countryB: "Canada" },
];

export function countryComparePath(
  countryA: string,
  countryB: string,
  citizenship?: string,
): string {
  if (citizenship) {
    return `/tools/country-compare/${slugify(citizenship)}/${slugify(countryA)}/${slugify(countryB)}`;
  }
  return `/tools/country-compare/${slugify(countryA)}/${slugify(countryB)}`;
}

export function shortCitizenshipLabel(citizenship: string): string {
  if (citizenship === "United States") return "US";
  if (citizenship === "United Kingdom") return "UK";
  return citizenship;
}

/**
 * Groups the generic (no-citizenship) pairs by countryA, preserving
 * first-seen order — used to render the 190-pair matrix as a scannable
 * grid on the hub instead of one giant comma-separated paragraph.
 */
export function groupGenericByCountryA(
  pairs: CompareLaunchPair[],
): { countryA: string; destinations: string[] }[] {
  const order: string[] = [];
  const map = new Map<string, string[]>();
  for (const p of pairs) {
    if (p.citizenship) continue;
    if (!map.has(p.countryA)) {
      map.set(p.countryA, []);
      order.push(p.countryA);
    }
    map.get(p.countryA)!.push(p.countryB);
  }
  return order.map((countryA) => ({ countryA, destinations: map.get(countryA)! }));
}
