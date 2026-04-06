/** Normalize for case- and accent-insensitive substring match. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * Filter country names by search query. Empty query returns the full list (copy).
 */
export function filterCountryList(countries: readonly string[], rawQuery: string): string[] {
  const q = rawQuery.trim();
  if (!q) return [...countries];

  try {
    const nq = normalize(q);
    return countries.filter((c) => normalize(c).includes(nq));
  } catch {
    const lower = q.toLowerCase();
    return countries.filter((c) => c.toLowerCase().includes(lower));
  }
}
