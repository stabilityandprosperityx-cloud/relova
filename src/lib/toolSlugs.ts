import { countryDatabase } from "@/lib/countryMatching";
import { allCountries } from "@/data/allCountries";

/** URL slug for a country display name. */
export function slugify(countryName: string): string {
  return countryName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const slugToName = new Map<string, string>();

// Destination-canonical names from countryDatabase take precedence
for (const c of countryDatabase) {
  slugToName.set(slugify(c.name), c.name);
}
// Common aliases → countryDatabase spelling
slugToName.set("uae", "UAE");
slugToName.set("united-arab-emirates", "UAE");

// Citizenship names (includes Russia etc. not in destination DB)
for (const name of allCountries) {
  const s = slugify(name);
  if (!slugToName.has(s)) slugToName.set(s, name);
}

/** Reverse slug → canonical country name, or null if unknown. */
export function unslugify(slug: string): string | null {
  if (!slug) return null;
  return slugToName.get(slug.trim().toLowerCase()) ?? null;
}

export const DESTINATION_NAMES = countryDatabase.map((c) => c.name).sort((a, b) => a.localeCompare(b));
export const CITIZENSHIP_NAMES = [...allCountries].sort((a, b) => a.localeCompare(b));
