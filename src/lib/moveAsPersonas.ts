import {
  countryDatabase,
  matchCountries,
  type CountryMatch,
  type CountryProfile,
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
  },
  {
    slug: "budget",
    displayName: "Budget Seeker",
    pageTitle: "Where Should I Move on a Budget?",
    metaDescription:
      "Cheapest countries to move to — ranked for cost of living and money stretch. Free Relova shortlist for budget relocators.",
    intro:
      "We use a modest income profile so the scoring formula favors lower cost-of-living destinations — useful if stretching every dollar (or euro) is the point.",
    criteria: baseCriteria({
      goals: ["money"],
      monthlyIncome: 2500,
    }),
  },
  {
    slug: "fresh-start",
    displayName: "Fresh Start",
    pageTitle: "Where Should I Move for a Fresh Start?",
    metaDescription:
      "Best countries for a life reset — new beginnings, slower pace, and a clean slate abroad. Free Relova match.",
    intro:
      "These destinations are tagged for a life reset — places people choose when they want a clean slate, a slower rhythm, or a meaningful change of scenery.",
    criteria: baseCriteria({
      goals: ["reset"],
      monthlyIncome: 3500,
    }),
  },
];

export function getPersonaBySlug(slug: string): PersonaConfig | undefined {
  return MOVE_AS_PERSONAS.find((p) => p.slug === slug);
}

export function filterPoolByVisaKeywords(
  keywords: string[],
  database: CountryProfile[] = countryDatabase,
): CountryProfile[] {
  const needles = keywords.map((k) => k.toLowerCase());
  return database.filter((c) => {
    const visa = (c.topVisa || "").toLowerCase();
    return needles.some((k) => visa.includes(k));
  });
}

export function getPersonaMatches(persona: PersonaConfig, limit = 8): CountryMatch[] {
  const pool = persona.poolFilterKeywords?.length
    ? filterPoolByVisaKeywords(persona.poolFilterKeywords)
    : undefined;
  return matchCountries(persona.criteria, pool, limit);
}
