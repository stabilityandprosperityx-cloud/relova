/**
 * Country name → adjectival/demonym form for "with a/an {demonym} passport?"
 * Keep in sync with the copy in scripts/prerender-tools.mjs.
 */
const DEMONYMS: Record<string, string> = {
  Russia: "Russian",
  "United States": "US",
  "United Kingdom": "UK",
  India: "Indian",
  China: "Chinese",
  Brazil: "Brazilian",
  Nigeria: "Nigerian",
  Philippines: "Filipino",
};

/** Acronyms / labels that start with a vowel letter but a consonant sound (/juː/, etc.). */
const CONSONANT_SOUND_EXCEPTIONS = new Set(["us", "uk"]);

/** Return "a" or "an" for the spoken start of `word`. */
export function indefiniteArticle(word: string): "a" | "an" {
  const trimmed = word.trim();
  if (!trimmed) return "a";
  const lower = trimmed.toLowerCase();
  if (CONSONANT_SOUND_EXCEPTIONS.has(lower)) return "a";
  return /^[aeiou]/i.test(lower) ? "an" : "a";
}

/** Demonym if known, otherwise the country name unchanged. */
export function citizenshipDemonym(countryName: string): string {
  const key = countryName.trim();
  return DEMONYMS[key] ?? key;
}

/** e.g. "an Indian passport", "a US passport", fallback "a France passport". */
export function citizenshipPassportPhrase(countryName: string): string {
  const label = citizenshipDemonym(countryName);
  return `${indefiniteArticle(label)} ${label} passport`;
}

/** e.g. "Can I move to Portugal with a US passport?" */
export function canIMoveTitle(destination: string, citizenship: string): string {
  return `Can I move to ${destination} with ${citizenshipPassportPhrase(citizenship)}?`;
}
