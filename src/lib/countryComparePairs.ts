import { slugify } from "./toolSlugs";

export interface CompareLaunchPair {
  /** Omit for generic A-vs-B pages. */
  citizenship?: string;
  countryA: string;
  countryB: string;
}

/** Launch / prerender pairs for Country Compare (12 citizenship-aware + 3 generic). */
export const COMPARE_LAUNCH_PAIRS: CompareLaunchPair[] = [
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
  { countryA: "Portugal", countryB: "Spain" },
  { countryA: "UAE", countryB: "Cyprus" },
  { countryA: "Georgia", countryB: "Armenia" },
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
