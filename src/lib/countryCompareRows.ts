import type { CountryProfile } from "./countryMatching";
import { TAX_RATES } from "./countryTaxRates";

const LEVEL: Record<string, number> = { low: 0, medium: 1, high: 2, easy: 0, moderate: 1, hard: 2 };

export type WinnerSide = "a" | "b" | null;

export interface CompareRow {
  label: string;
  render: (c: CountryProfile) => string;
  /** Deterministic winner; null = tie / subjective / don't highlight. */
  winner: (a: CountryProfile, b: CountryProfile) => WinnerSide;
  subjective?: boolean;
}

function lowerLevelWins(get: (c: CountryProfile) => string): CompareRow["winner"] {
  return (a, b) => {
    const av = LEVEL[get(a)] ?? 1;
    const bv = LEVEL[get(b)] ?? 1;
    if (av === bv) return null;
    return av < bv ? "a" : "b";
  };
}

function higherScoreWins(
  get: (c: CountryProfile) => number,
  minDiff = 1,
): CompareRow["winner"] {
  return (a, b) => {
    const av = get(a);
    const bv = get(b);
    if (Math.abs(av - bv) < minDiff) return null;
    return av > bv ? "a" : "b";
  };
}

function parseStabilityMin(s: string): number | null {
  const m = s.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

/** Rows for the public Country Compare table (adapted from dashboard CountryCompare). */
export const COMPARE_ROWS: CompareRow[] = [
  {
    label: "Time to stability",
    render: (c) => `${c.stabilityMonths} mo`,
    winner: (a, b) => {
      const av = parseStabilityMin(a.stabilityMonths);
      const bv = parseStabilityMin(b.stabilityMonths);
      if (av == null || bv == null || av === bv) return null;
      return av < bv ? "a" : "b";
    },
  },
  {
    label: "Cost level",
    render: (c) => c.costLevel,
    winner: lowerLevelWins((c) => c.costLevel),
  },
  {
    label: "Safety",
    render: (c) => `${c.safetyScore}/10`,
    winner: higherScoreWins((c) => c.safetyScore),
  },
  {
    label: "Healthcare",
    render: (c) => `${c.healthcareQuality}/10`,
    winner: higherScoreWins((c) => c.healthcareQuality),
  },
  {
    label: "Crime level",
    render: (c) => c.crimeLevel,
    winner: lowerLevelWins((c) => c.crimeLevel),
  },
  {
    label: "Language barrier",
    render: (c) => c.languageBarrier,
    winner: lowerLevelWins((c) => c.languageBarrier),
  },
  {
    label: "Climate",
    render: (c) => c.climate,
    winner: () => null,
    subjective: true,
  },
  {
    label: "Visa ease (general)",
    render: (c) => c.visaEase,
    winner: lowerLevelWins((c) => c.visaEase),
  },
  {
    label: "Citizenship path",
    render: (c) => (c.citizenshipYears ? `${c.citizenshipYears} years` : "No path"),
    winner: (a, b) => {
      const av = a.citizenshipYears ?? 99;
      const bv = b.citizenshipYears ?? 99;
      if (av === bv) return null;
      return av < bv ? "a" : "b";
    },
  },
  {
    label: "Income tax",
    render: (c) => {
      const t = TAX_RATES[c.name];
      if (!t) return "—";
      return t.regime || `${Math.round(t.rate * 100)}%`;
    },
    winner: (a, b) => {
      const ta = TAX_RATES[a.name];
      const tb = TAX_RATES[b.name];
      if (!ta || !tb) return null;
      if (ta.rate === tb.rate) return null;
      return ta.rate < tb.rate ? "a" : "b";
    },
  },
  {
    label: "Top visa pathway",
    render: (c) => c.topVisa,
    winner: () => null,
    subjective: true,
  },
  {
    label: "Best for",
    render: (c) => c.bestFor.map((x) => x.replace(/_/g, " ")).join(", "),
    winner: () => null,
    subjective: true,
  },
  {
    label: "Key risk",
    render: (c) => c.risks[0] || "—",
    winner: () => null,
    subjective: true,
  },
];
