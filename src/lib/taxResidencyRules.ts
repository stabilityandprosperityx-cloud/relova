/**
 * Tax-residency day-count framing metadata for the Tax Residency Day Tracker.
 * Defaults to a simple calendar-year 183-day awareness model unless overridden.
 */

export type TaxResidencyRule = {
  framing: "calendar_year" | "rolling_12" | "uk_tax_year";
  tier: "simple_183" | "complex";
  thresholdHint?: 183;
  note: string;
};

const GENERIC_SIMPLE_NOTE =
  "Common awareness threshold is ~183 days in a calendar year — treaties, domicile, and center-of-vital-interests rules can still apply.";

const COMPLEX_RULES: Record<string, TaxResidencyRule> = {
  "United States": {
    framing: "calendar_year",
    tier: "complex",
    note: "Uses the Substantial Presence Test (weighted 3-year formula), not a flat 183-day count.",
  },
  "United Kingdom": {
    framing: "uk_tax_year",
    tier: "complex",
    note: "Statutory Residence Test — UK tax year runs 6 Apr–5 Apr; fewer than 183 days can still trigger residency via 'ties'.",
  },
  Germany: {
    framing: "calendar_year",
    tier: "complex",
    note: "Habitual abode / registered dwelling (Wohnsitz) can trigger residency regardless of day count.",
  },
  France: {
    framing: "calendar_year",
    tier: "complex",
    note: "Multiple tests apply (household/foyer, principal stay, professional activity) — days alone don't determine residency.",
  },
  Canada: {
    framing: "calendar_year",
    tier: "complex",
    note: "Residential ties and sojourner rules apply — 183 days is only one path to residency.",
  },
};

const DEFAULT_SIMPLE: TaxResidencyRule = {
  framing: "calendar_year",
  tier: "simple_183",
  thresholdHint: 183,
  note: GENERIC_SIMPLE_NOTE,
};

/** Resolve rule for a destination country name (countryDatabase spelling). */
export function getTaxResidencyRule(countryName: string): TaxResidencyRule {
  return COMPLEX_RULES[countryName] ?? DEFAULT_SIMPLE;
}

export function isComplexTaxCountry(countryName: string): boolean {
  return getTaxResidencyRule(countryName).tier === "complex";
}

export type DayStatus = "safe" | "approaching" | "exceeded";

/** Traffic-light status for simple_183 countries only. */
export function simpleDayStatus(days: number): DayStatus {
  if (days >= 183) return "exceeded";
  if (days >= 150) return "approaching";
  return "safe";
}
