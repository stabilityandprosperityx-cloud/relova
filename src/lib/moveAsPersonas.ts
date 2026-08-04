import {
  countryDatabase,
  matchCountries,
  type CountryMatch,
  type CountryProfile,
  type MatchScoreWeights,
  type UserCriteria,
} from "./countryMatching";

export interface PersonaConfig {
  slug: string;
  displayName: string;
  pageTitle: string;
  metaDescription: string;
  intro: string;
  criteria: UserCriteria;
  /** Keywords matched case-insensitively against country.topVisa before scoring */
  poolFilterKeywords?: string[];
  /** Exclude speculative visa wording from keyword pools */
  excludeVisaPhrases?: string[];
  /** Min safetyScore required to enter the scored pool (safety-first) */
  minSafetyScore?: number;
  /** Optional matchCountries weight overrides — safety-first only */
  scoreWeights?: MatchScoreWeights;
}

const baseCriteria = (overrides: Partial<UserCriteria> & Pick<UserCriteria, "goals">): UserCriteria => ({
  citizenship: "",
  familyStatus: "single",
  monthlyIncome: 4000,
  constraints: [],
  timeline: "exploring",
  ...overrides,
});

/** Nomad / remote-work visa wording from countryDatabase.topVisa */
export const NOMAD_VISA_KEYWORDS = [
  "nomad",
  "remote",
  "workcation",
  "welcome stamp",
];

/** Drop speculative / not-yet-live programs from the nomad pool */
export const NOMAD_VISA_EXCLUDE_PHRASES = [
  "in development",
  "emerging",
  "launching",
];

/** Retirement / passive-income visa wording from countryDatabase.topVisa */
export const RETIREE_VISA_KEYWORDS = [
  "retire",
  "retirement",
  "pension",
  "pensionado",
  "d7",
  "passive",
  "rentier",
  "rentista",
  "annuitant",
  "qrp",
];

/** Safety-first: boost safety/crime, de-emphasize cost & visa ease (persona-only). */
export const SAFETY_FIRST_WEIGHTS: MatchScoreWeights = {
  safetyScoreMultiplier: 3.5,
  crimeLowBonus: 12,
  crimeHighPenalty: 14,
  budgetScale: 0.35,
  visaScale: 0.35,
};

export const MOVE_AS_PERSONAS: PersonaConfig[] = [
  {
    slug: "digital-nomad",
    displayName: "Digital Nomad",
    pageTitle: "Where Should I Move as a Digital Nomad?",
    metaDescription:
      "Best countries for digital nomads and remote workers — ranked by visa pathways, cost of living, and lifestyle fit. Free Relova match.",
    intro:
      "We score destinations that already offer a digital nomad or remote-work visa pathway, then rank them for freedom and earning power — the priorities most remote workers care about when picking a base.",
    criteria: baseCriteria({ goals: ["freedom", "money"], monthlyIncome: 4500 }),
    poolFilterKeywords: NOMAD_VISA_KEYWORDS,
    excludeVisaPhrases: NOMAD_VISA_EXCLUDE_PHRASES,
  },
  {
    slug: "retiree",
    displayName: "Retiree",
    pageTitle: "Where Should I Move as a Retiree?",
    metaDescription:
      "Best countries for retirees — retirement visas, healthcare, and cost of living. See Relova’s free ranked shortlist.",
    intro:
      "We focus on countries with retirement, pension, or passive-income visa routes, then rank for affordability and quality of life — with a boost for stronger healthcare systems.",
    criteria: baseCriteria({
      goals: ["money", "better_life"],
      monthlyIncome: 3500,
      familyStatus: "couple",
      constraints: ["healthcare"],
    }),
    poolFilterKeywords: RETIREE_VISA_KEYWORDS,
  },
  {
    slug: "family",
    displayName: "Family with Kids",
    pageTitle: "Where Should I Move as a Family with Kids?",
    metaDescription:
      "Best countries to relocate with kids — safety, healthcare, and family-friendly living. Free Relova shortlist.",
    intro:
      "These matches prioritize countries tagged as strong for families — typically safer places with solid healthcare and a lifestyle that works with kids.",
    criteria: baseCriteria({
      goals: ["family"],
      familyStatus: "family",
      monthlyIncome: 5000,
      constraints: ["healthcare", "low_crime"],
    }),
  },
  {
    slug: "safety-first",
    displayName: "Safety-First Mover",
    pageTitle: "Where Should I Move as a Safety-First Mover?",
    metaDescription:
      "Safest countries to relocate to — ranked for low crime and overall safety. Free Relova match for cautious movers.",
    intro:
      "If personal safety is your non-negotiable, we rank countries that score highly on safety goals — with an extra preference for low-crime destinations.",
    criteria: baseCriteria({
      goals: ["safety"],
      monthlyIncome: 4000,
      constraints: ["low_crime"],
    }),
    minSafetyScore: 7,
    scoreWeights: SAFETY_FIRST_WEIGHTS,
  },
  {
    slug: "budget",
    displayName: "Budget Seeker",
    pageTitle: "Where Should I Move on a Budget?",
    metaDescription:
      "Cheapest countries to move to — ranked for cost of living and money stretch. Free Relova shortlist for budget relocators.",
    intro:
      "We use a tight income profile (~$1,800/mo) so the scoring formula pushes hard toward the cheapest destinations — useful if stretching every dollar (or euro) is the point.",
    criteria: baseCriteria({
      goals: ["money"],
      monthlyIncome: 1800,
    }),
  },
  {
    slug: "fresh-start",
    displayName: "Fresh Start",
    pageTitle: "Where Should I Move for a Fresh Start?",
    metaDescription:
      "Best countries for a life reset — new beginnings, slower pace, and a clean slate abroad. Free Relova match.",
    intro:
      "These destinations are tagged for a life reset and a better quality of life — places people choose for a clean slate, not just the lowest rent. We assume a moderate budget, since starting over doesn’t mean going as cheap as possible.",
    criteria: baseCriteria({
      goals: ["reset", "better_life"],
      monthlyIncome: 4000,
    }),
  },
];

export function getPersonaBySlug(slug: string): PersonaConfig | undefined {
  return MOVE_AS_PERSONAS.find((p) => p.slug === slug);
}

export function filterPoolByVisaKeywords(
  keywords: string[],
  database: CountryProfile[] = countryDatabase,
  excludePhrases: string[] = [],
): CountryProfile[] {
  const needles = keywords.map((k) => k.toLowerCase());
  const excludes = excludePhrases.map((k) => k.toLowerCase());
  return database.filter((c) => {
    const visa = (c.topVisa || "").toLowerCase();
    if (!needles.some((k) => visa.includes(k))) return false;
    if (excludes.some((phrase) => visa.includes(phrase))) return false;
    return true;
  });
}

export function getPersonaMatches(persona: PersonaConfig, limit = 8): CountryMatch[] {
  let pool: CountryProfile[] | undefined;

  if (persona.poolFilterKeywords?.length) {
    pool = filterPoolByVisaKeywords(
      persona.poolFilterKeywords,
      countryDatabase,
      persona.excludeVisaPhrases ?? [],
    );
  }

  if (persona.minSafetyScore != null) {
    const base = pool ?? countryDatabase;
    pool = base.filter((c) => c.safetyScore >= persona.minSafetyScore!);
  }

  return matchCountries(persona.criteria, pool, limit, persona.scoreWeights);
}
