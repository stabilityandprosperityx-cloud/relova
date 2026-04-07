// Country matching engine — rule-based scoring

export interface CountryProfile {
  name: string;
  flag: string;
  costLevel: "low" | "medium" | "high"; // relative to $3k/mo threshold
  safetyScore: number; // 1-10
  climate: "warm" | "cold" | "moderate";
  region: "europe" | "asia" | "americas" | "middle_east";
  healthcareQuality: number; // 1-10
  crimeLevel: "low" | "medium" | "high";
  citizenshipYears: number | null; // null = no path
  visaEase: "easy" | "moderate" | "hard";
  stabilityMonths: string; // e.g. "3-6"
  languageBarrier: "low" | "medium" | "high";
  bestFor: string[];
  topVisa: string;
  risks: string[];
}

export const countryDatabase: CountryProfile[] = [
  // ─── EUROPE — SOUTHERN ───
  {
    name: "Portugal", flag: "🇵🇹", costLevel: "medium", safetyScore: 9, climate: "warm",
    region: "europe", healthcareQuality: 8, crimeLevel: "low", citizenshipYears: 5,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "medium",
    bestFor: ["safety", "better_life", "family", "environment"],
    topVisa: "D8 Digital Nomad / D7 Passive Income Visa",
    risks: ["Bureaucracy can be slow", "Rising cost of living in Lisbon", "AIMA appointment delays"],
  },
  {
    name: "Spain", flag: "🇪🇸", costLevel: "medium", safetyScore: 8, climate: "warm",
    region: "europe", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 10,
    visaEase: "moderate", stabilityMonths: "4-8", languageBarrier: "medium",
    bestFor: ["better_life", "family", "environment", "safety"],
    topVisa: "Digital Nomad Visa (Ley de Startups)",
    risks: ["Long path to citizenship (10 years)", "High taxes as resident", "Language required for integration"],
  },
  {
    name: "Italy", flag: "🇮🇹", costLevel: "medium", safetyScore: 7, climate: "warm",
    region: "europe", healthcareQuality: 8, crimeLevel: "medium", citizenshipYears: 10,
    visaEase: "moderate", stabilityMonths: "4-8", languageBarrier: "high",
    bestFor: ["better_life", "environment", "family", "reset"],
    topVisa: "Digital Nomad / Elective Residency Visa",
    risks: ["Slow bureaucracy", "Italian required for integration", "Long path to citizenship"],
  },
  {
    name: "Greece", flag: "🇬🇷", costLevel: "medium", safetyScore: 7, climate: "warm",
    region: "europe", healthcareQuality: 7, crimeLevel: "low", citizenshipYears: 7,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "medium",
    bestFor: ["environment", "better_life", "reset", "freedom"],
    topVisa: "Digital Nomad Visa (€3,500/mo required)",
    risks: ["Bureaucracy can be slow", "Healthcare quality varies by region", "Economic instability history"],
  },
  {
    name: "Malta", flag: "🇲🇹", costLevel: "medium", safetyScore: 8, climate: "warm",
    region: "europe", healthcareQuality: 8, crimeLevel: "low", citizenshipYears: null,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "low",
    bestFor: ["safety", "better_life", "freedom", "growth"],
    topVisa: "Nomad Residence Permit (€3,500/mo required)",
    risks: ["Small island — limited space", "No citizenship path via nomad visa", "High cost for EU island"],
  },
  {
    name: "Croatia", flag: "🇭🇷", costLevel: "medium", safetyScore: 8, climate: "warm",
    region: "europe", healthcareQuality: 7, crimeLevel: "low", citizenshipYears: 8,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "medium",
    bestFor: ["environment", "better_life", "reset", "safety"],
    topVisa: "Digital Nomad Visa (18 months, extended 2025)",
    risks: ["Seasonal tourism crowds", "Limited job market", "Language barrier outside cities"],
  },
  {
    name: "Cyprus", flag: "🇨🇾", costLevel: "medium", safetyScore: 8, climate: "warm",
    region: "europe", healthcareQuality: 7, crimeLevel: "low", citizenshipYears: 5,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "low",
    bestFor: ["safety", "better_life", "family", "freedom"],
    topVisa: "Digital Nomad Visa (€3,500/mo required)",
    risks: ["Small market", "Political division of island", "High summer heat"],
  },

  // ─── EUROPE — CENTRAL & EASTERN ───
  {
    name: "Germany", flag: "🇩🇪", costLevel: "high", safetyScore: 9, climate: "cold",
    region: "europe", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 5,
    visaEase: "moderate", stabilityMonths: "4-8", languageBarrier: "high",
    bestFor: ["safety", "family", "growth", "better_life"],
    topVisa: "Freelance Visa / Job Seeker Visa",
    risks: ["Heavy bureaucracy", "German language required", "High taxes"],
  },
  {
    name: "Netherlands", flag: "🇳🇱", costLevel: "high", safetyScore: 9, climate: "cold",
    region: "europe", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 5,
    visaEase: "moderate", stabilityMonths: "4-8", languageBarrier: "low",
    bestFor: ["growth", "safety", "family", "money"],
    topVisa: "Highly Skilled Migrant Visa (DAFT)",
    risks: ["Very high housing costs", "High taxes", "Competitive job market"],
  },
  {
    name: "France", flag: "🇫🇷", costLevel: "high", safetyScore: 8, climate: "moderate",
    region: "europe", healthcareQuality: 9, crimeLevel: "medium", citizenshipYears: 5,
    visaEase: "moderate", stabilityMonths: "4-8", languageBarrier: "high",
    bestFor: ["better_life", "family", "safety", "environment"],
    topVisa: "Talent Passport / Long-Stay Visa",
    risks: ["French required for integration", "High taxes", "Bureaucracy"],
  },
  {
    name: "Austria", flag: "🇦🇹", costLevel: "high", safetyScore: 9, climate: "cold",
    region: "europe", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 6,
    visaEase: "moderate", stabilityMonths: "4-8", languageBarrier: "high",
    bestFor: ["safety", "family", "better_life", "growth"],
    topVisa: "Red-White-Red Card",
    risks: ["German language required", "High cost of living", "Strict immigration criteria"],
  },
  {
    name: "Czech Republic", flag: "🇨🇿", costLevel: "medium", safetyScore: 8, climate: "cold",
    region: "europe", healthcareQuality: 8, crimeLevel: "low", citizenshipYears: 5,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "medium",
    bestFor: ["safety", "growth", "better_life", "family"],
    topVisa: "Long-term Residence Visa / Zivno",
    risks: ["Czech language for integration", "Cold winters", "Bureaucracy"],
  },
  {
    name: "Poland", flag: "🇵🇱", costLevel: "medium", safetyScore: 8, climate: "cold",
    region: "europe", healthcareQuality: 7, crimeLevel: "low", citizenshipYears: 5,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "medium",
    bestFor: ["safety", "growth", "family", "money"],
    topVisa: "Temporary Residence Permit (Karta Pobytu)",
    risks: ["Cold winters", "Polish required for integration", "Bureaucracy"],
  },
  {
    name: "Hungary", flag: "🇭🇺", costLevel: "medium", safetyScore: 7, climate: "moderate",
    region: "europe", healthcareQuality: 7, crimeLevel: "low", citizenshipYears: 8,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "high",
    bestFor: ["money", "growth", "reset", "freedom"],
    topVisa: "White Card (Guest Investor Visa)",
    risks: ["Language barrier very high", "Political environment", "Limited English outside Budapest"],
  },
  {
    name: "Estonia", flag: "🇪🇪", costLevel: "medium", safetyScore: 8, climate: "cold",
    region: "europe", healthcareQuality: 7, crimeLevel: "low", citizenshipYears: 8,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "medium",
    bestFor: ["growth", "freedom", "money", "safety"],
    topVisa: "Digital Nomad Visa (pioneer program)",
    risks: ["Cold climate", "Small market", "Russian-speaking minority tensions"],
  },
  {
    name: "Romania", flag: "🇷🇴", costLevel: "low", safetyScore: 7, climate: "moderate",
    region: "europe", healthcareQuality: 6, crimeLevel: "low", citizenshipYears: 8,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "medium",
    bestFor: ["money", "growth", "reset", "freedom"],
    topVisa: "Digital Nomad Visa (launched 2024)",
    risks: ["Healthcare quality lower than Western EU", "Infrastructure varies", "Language barrier"],
  },

  // ─── EUROPE — BALKANS & EASY ENTRY ───
  {
    name: "Serbia", flag: "🇷🇸", costLevel: "low", safetyScore: 7, climate: "moderate",
    region: "europe", healthcareQuality: 6, crimeLevel: "low", citizenshipYears: 3,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "high",
    bestFor: ["money", "freedom", "reset", "growth"],
    topVisa: "Visa-free Stay / Temporary Residence Permit",
    risks: ["Not EU member", "Limited healthcare quality", "Language barrier"],
  },
  {
    name: "Montenegro", flag: "🇲🇪", costLevel: "low", safetyScore: 7, climate: "warm",
    region: "europe", healthcareQuality: 5, crimeLevel: "low", citizenshipYears: 10,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "high",
    bestFor: ["freedom", "reset", "money", "environment"],
    topVisa: "Temporary Residence Permit (apply on arrival)",
    risks: ["Small economy", "EU accession still in progress", "Limited healthcare"],
  },
  {
    name: "Albania", flag: "🇦🇱", costLevel: "low", safetyScore: 6, climate: "warm",
    region: "europe", healthcareQuality: 5, crimeLevel: "medium", citizenshipYears: null,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "high",
    bestFor: ["money", "reset", "environment", "freedom"],
    topVisa: "Visa-free Stay (1 year for many nationalities)",
    risks: ["Limited infrastructure", "Healthcare quality low", "Not EU member"],
  },
  {
    name: "Turkey", flag: "🇹🇷", costLevel: "low", safetyScore: 6, climate: "warm",
    region: "europe", healthcareQuality: 7, crimeLevel: "medium", citizenshipYears: 5,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "high",
    bestFor: ["money", "reset", "growth", "environment"],
    topVisa: "Residence Permit (ikamet) / Citizenship by Investment",
    risks: ["Currency instability", "Political situation", "High inflation"],
  },

  // ─── MIDDLE EAST ───
  {
    name: "UAE", flag: "🇦🇪", costLevel: "high", safetyScore: 9, climate: "warm",
    region: "middle_east", healthcareQuality: 8, crimeLevel: "low", citizenshipYears: null,
    visaEase: "moderate", stabilityMonths: "1-3", languageBarrier: "low",
    bestFor: ["money", "growth", "safety"],
    topVisa: "Freelance Permit + Residence Visa / Golden Visa",
    risks: ["No citizenship path", "Very high cost of living", "Extreme summer heat"],
  },
  {
    name: "Bahrain", flag: "🇧🇭", costLevel: "medium", safetyScore: 8, climate: "warm",
    region: "middle_east", healthcareQuality: 8, crimeLevel: "low", citizenshipYears: null,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "low",
    bestFor: ["money", "growth", "freedom", "safety"],
    topVisa: "Digital Nomad Visa",
    risks: ["No citizenship path", "Small market", "Heat"],
  },

  // ─── CAUCASUS ───
  {
    name: "Georgia", flag: "🇬🇪", costLevel: "low", safetyScore: 7, climate: "moderate",
    region: "europe", healthcareQuality: 5, crimeLevel: "low", citizenshipYears: null,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "high",
    bestFor: ["freedom", "money", "reset", "growth"],
    topVisa: "Visa-free Stay (1 year for 95+ countries)",
    risks: ["No direct path to citizenship", "Limited healthcare infrastructure", "Language barrier"],
  },
  {
    name: "Armenia", flag: "🇦🇲", costLevel: "low", safetyScore: 7, climate: "moderate",
    region: "europe", healthcareQuality: 6, crimeLevel: "low", citizenshipYears: 3,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "high",
    bestFor: ["money", "freedom", "reset", "growth"],
    topVisa: "Visa-free Stay",
    risks: ["Limited job market", "Language barrier", "Regional geopolitical tensions"],
  },

  // ─── ASIA ───
  {
    name: "Thailand", flag: "🇹🇭", costLevel: "low", safetyScore: 6, climate: "warm",
    region: "asia", healthcareQuality: 7, crimeLevel: "medium", citizenshipYears: null,
    visaEase: "easy", stabilityMonths: "1-2", languageBarrier: "high",
    bestFor: ["money", "environment", "reset", "better_life"],
    topVisa: "DTV - Destination Thailand Visa (5 years)",
    risks: ["No citizenship path", "Visa complexity for permanent stays", "Petty crime in tourist areas"],
  },
  {
    name: "Malaysia", flag: "🇲🇾", costLevel: "low", safetyScore: 7, climate: "warm",
    region: "asia", healthcareQuality: 7, crimeLevel: "medium", citizenshipYears: null,
    visaEase: "moderate", stabilityMonths: "2-4", languageBarrier: "low",
    bestFor: ["money", "better_life", "environment", "growth"],
    topVisa: "DE Rantau Nomad Pass",
    risks: ["No citizenship path", "Income requirement $5,000/mo", "Heat and humidity"],
  },
  {
    name: "Indonesia", flag: "🇮🇩", costLevel: "low", safetyScore: 6, climate: "warm",
    region: "asia", healthcareQuality: 5, crimeLevel: "medium", citizenshipYears: null,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "high",
    bestFor: ["environment", "reset", "money", "better_life"],
    topVisa: "Social/Cultural Visa B211A / Second Home Visa",
    risks: ["No citizenship path", "Healthcare outside Bali limited", "Infrastructure varies"],
  },
  {
    name: "Vietnam", flag: "🇻🇳", costLevel: "low", safetyScore: 7, climate: "warm",
    region: "asia", healthcareQuality: 6, crimeLevel: "low", citizenshipYears: null,
    visaEase: "easy", stabilityMonths: "1-2", languageBarrier: "high",
    bestFor: ["money", "reset", "environment", "better_life"],
    topVisa: "E-visa (90 days) / Business Visa",
    risks: ["No long-term visa solution", "No citizenship path", "Language barrier"],
  },
  {
    name: "Japan", flag: "🇯🇵", costLevel: "medium", safetyScore: 10, climate: "moderate",
    region: "asia", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 5,
    visaEase: "moderate", stabilityMonths: "4-8", languageBarrier: "high",
    bestFor: ["safety", "better_life", "growth", "family"],
    topVisa: "Digital Nomad Visa (launched 2024) / HSP Visa",
    risks: ["Language barrier very high", "Cultural integration challenging", "High cost in Tokyo"],
  },
  {
    name: "Singapore", flag: "🇸🇬", costLevel: "high", safetyScore: 10, climate: "warm",
    region: "asia", healthcareQuality: 10, crimeLevel: "low", citizenshipYears: 2,
    visaEase: "hard", stabilityMonths: "3-6", languageBarrier: "low",
    bestFor: ["safety", "money", "growth"],
    topVisa: "Employment Pass / EntrePass",
    risks: ["Very high cost of living", "Strict regulations", "Competitive for permits"],
  },
  {
    name: "South Korea", flag: "🇰🇷", costLevel: "medium", safetyScore: 9, climate: "moderate",
    region: "asia", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 5,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "high",
    bestFor: ["safety", "growth", "better_life", "money"],
    topVisa: "Workcation Visa (F-1-D) / Digital Nomad Visa",
    risks: ["Language barrier high", "Cultural integration challenging", "Competitive job market"],
  },

  // ─── AMERICAS ───
  {
    name: "Mexico", flag: "🇲🇽", costLevel: "low", safetyScore: 5, climate: "warm",
    region: "americas", healthcareQuality: 6, crimeLevel: "high", citizenshipYears: 5,
    visaEase: "easy", stabilityMonths: "2-4", languageBarrier: "medium",
    bestFor: ["freedom", "reset", "environment", "money"],
    topVisa: "Temporary Resident Visa (Residente Temporal)",
    risks: ["Safety varies significantly by region", "Healthcare quality varies", "Fees doubled in 2026"],
  },
  {
    name: "Colombia", flag: "🇨🇴", costLevel: "low", safetyScore: 5, climate: "warm",
    region: "americas", healthcareQuality: 6, crimeLevel: "medium", citizenshipYears: 5,
    visaEase: "easy", stabilityMonths: "2-4", languageBarrier: "medium",
    bestFor: ["money", "reset", "environment", "freedom"],
    topVisa: "Digital Nomad Visa (Nómada Digital)",
    risks: ["Safety varies by region", "Spanish required", "Political instability"],
  },
  {
    name: "Brazil", flag: "🇧🇷", costLevel: "low", safetyScore: 5, climate: "warm",
    region: "americas", healthcareQuality: 6, crimeLevel: "high", citizenshipYears: 4,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "medium",
    bestFor: ["environment", "reset", "freedom", "better_life"],
    topVisa: "Digital Nomad Visa (1 year renewable)",
    risks: ["Safety concerns in major cities", "Portuguese required", "Bureaucracy"],
  },
  {
    name: "Argentina", flag: "🇦🇷", costLevel: "low", safetyScore: 6, climate: "moderate",
    region: "americas", healthcareQuality: 6, crimeLevel: "medium", citizenshipYears: 2,
    visaEase: "easy", stabilityMonths: "2-4", languageBarrier: "medium",
    bestFor: ["freedom", "reset", "money", "environment"],
    topVisa: "Rentista Visa",
    risks: ["Economic instability", "Currency volatility", "Inflation"],
  },
  {
    name: "Panama", flag: "🇵🇦", costLevel: "medium", safetyScore: 6, climate: "warm",
    region: "americas", healthcareQuality: 7, crimeLevel: "medium", citizenshipYears: 5,
    visaEase: "easy", stabilityMonths: "2-4", languageBarrier: "medium",
    bestFor: ["money", "freedom", "growth", "reset"],
    topVisa: "Friendly Nations Visa",
    risks: ["Safety varies", "Spanish required outside Panama City", "Heat"],
  },
  {
    name: "Costa Rica", flag: "🇨🇷", costLevel: "medium", safetyScore: 7, climate: "warm",
    region: "americas", healthcareQuality: 7, crimeLevel: "medium", citizenshipYears: 7,
    visaEase: "easy", stabilityMonths: "2-4", languageBarrier: "medium",
    bestFor: ["environment", "better_life", "safety", "reset"],
    topVisa: "Rentista Visa ($2,500/mo required)",
    risks: ["Higher cost than other LatAm", "Spanish required", "Petty crime in tourist areas"],
  },
  {
    name: "Uruguay", flag: "🇺🇾", costLevel: "medium", safetyScore: 8, climate: "moderate",
    region: "americas", healthcareQuality: 7, crimeLevel: "low", citizenshipYears: 3,
    visaEase: "easy", stabilityMonths: "2-4", languageBarrier: "medium",
    bestFor: ["safety", "freedom", "better_life", "family"],
    topVisa: "Temporary Residence (straightforward process)",
    risks: ["Higher cost than neighbors", "Spanish required", "Small economy"],
  },
  {
    name: "Canada", flag: "🇨🇦", costLevel: "high", safetyScore: 9, climate: "cold",
    region: "americas", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 3,
    visaEase: "hard", stabilityMonths: "6-12", languageBarrier: "low",
    bestFor: ["safety", "family", "better_life", "growth"],
    topVisa: "Express Entry (points-based PR)",
    risks: ["Highly competitive immigration", "Very high cost of living", "Cold climate"],
  },

  // ─── AFRICA & ISLANDS ───
  {
    name: "Morocco", flag: "🇲🇦", costLevel: "low", safetyScore: 6, climate: "warm",
    region: "middle_east", healthcareQuality: 5, crimeLevel: "medium", citizenshipYears: null,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "medium",
    bestFor: ["money", "reset", "environment", "freedom"],
    topVisa: "Residence Permit (Carte de Séjour)",
    risks: ["Healthcare quality limited", "Language barrier (Arabic/French)", "Close to Europe but different culture"],
  },
  {
    name: "South Africa", flag: "🇿🇦", costLevel: "low", safetyScore: 5, climate: "warm",
    region: "middle_east", healthcareQuality: 6, crimeLevel: "high", citizenshipYears: 5,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "low",
    bestFor: ["money", "environment", "better_life", "growth"],
    topVisa: "Critical Skills Visa",
    risks: ["High crime rate", "Load shedding (power outages)", "Social inequality"],
  },
  {
    name: "Mauritius", flag: "🇲🇺", costLevel: "medium", safetyScore: 8, climate: "warm",
    region: "middle_east", healthcareQuality: 7, crimeLevel: "low", citizenshipYears: null,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "low",
    bestFor: ["environment", "money", "freedom", "better_life"],
    topVisa: "Premium Visa (1 year renewable)",
    risks: ["Small island — limited opportunities", "No citizenship path", "Expensive lifestyle"],
  },

  // ─── PACIFIC & OTHER ───
  {
    name: "Australia", flag: "🇦🇺", costLevel: "high", safetyScore: 9, climate: "warm",
    region: "asia", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 4,
    visaEase: "hard", stabilityMonths: "6-12", languageBarrier: "low",
    bestFor: ["safety", "family", "better_life", "environment"],
    topVisa: "Skilled Worker Visa (subclass 189/190)",
    risks: ["Complex points-based immigration", "Very high cost of living", "Far from Europe/Americas"],
  },
  {
    name: "New Zealand", flag: "🇳🇿", costLevel: "high", safetyScore: 9, climate: "moderate",
    region: "asia", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 5,
    visaEase: "hard", stabilityMonths: "6-12", languageBarrier: "low",
    bestFor: ["safety", "environment", "family", "better_life"],
    topVisa: "Skilled Migrant Category",
    risks: ["Competitive immigration", "High cost of living", "Remote location"],
  },
];

export interface UserCriteria {
  citizenship: string;
  familyStatus: string;
  monthlyIncome: number;
  goals: string[];
  constraints: string[];
  timeline: string;
}

export interface CountryMatch {
  country: CountryProfile;
  score: number;
  reasons: string[];
  topRisk: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
}

export function matchCountries(criteria: UserCriteria): CountryMatch[] {
  const results: CountryMatch[] = [];

  for (const country of countryDatabase) {
    let score = 50; // base score
    const reasons: string[] = [];

    // Goal matching (biggest weight)
    const goalOverlap = criteria.goals.filter(g => country.bestFor.includes(g));
    score += goalOverlap.length * 12;
    if (goalOverlap.length > 0) {
      reasons.push(`Matches your goals: ${goalOverlap.join(", ")}`);
    }

    // Budget fit
    if (country.costLevel === "low" && criteria.monthlyIncome < 3000) {
      score += 15;
      reasons.push("Fits your budget well");
    } else if (country.costLevel === "low" && criteria.monthlyIncome >= 3000) {
      score += 10;
      reasons.push("Very affordable for your income");
    } else if (country.costLevel === "medium" && criteria.monthlyIncome >= 3000) {
      score += 8;
      reasons.push("Comfortable for your budget");
    } else if (country.costLevel === "high" && criteria.monthlyIncome >= 8000) {
      score += 5;
    } else if (country.costLevel === "high" && criteria.monthlyIncome < 5000) {
      score -= 15;
    }

    // Visa ease
    if (country.visaEase === "easy") score += 10;
    else if (country.visaEase === "moderate") score += 5;
    else score -= 5;

    // Constraints
    if (criteria.constraints.includes("language") && country.languageBarrier === "low") {
      score += 10;
      reasons.push("Low language barrier");
    } else if (criteria.constraints.includes("language") && country.languageBarrier === "high") {
      score -= 10;
    }

    if (criteria.constraints.includes("cold_climate") && country.climate === "cold") {
      score -= 15;
    } else if (criteria.constraints.includes("cold_climate") && country.climate === "warm") {
      score += 5;
    }

    if (criteria.constraints.includes("close_europe") && country.region === "europe") {
      score += 10;
      reasons.push("Close to Europe");
    } else if (criteria.constraints.includes("close_europe") && country.region !== "europe") {
      score -= 8;
    }

    if (criteria.constraints.includes("healthcare") && country.healthcareQuality >= 8) {
      score += 10;
      reasons.push("Strong healthcare system");
    } else if (criteria.constraints.includes("healthcare") && country.healthcareQuality < 6) {
      score -= 8;
    }

    if (criteria.constraints.includes("low_crime") && country.crimeLevel === "low") {
      score += 10;
      reasons.push("Low crime rate");
    } else if (criteria.constraints.includes("low_crime") && country.crimeLevel === "high") {
      score -= 12;
    }

    if (criteria.constraints.includes("fast_citizenship")) {
      if (country.citizenshipYears && country.citizenshipYears <= 5) {
        score += 12;
        reasons.push(`Path to citizenship in ${country.citizenshipYears} years`);
      } else if (!country.citizenshipYears) {
        score -= 10;
      }
    }

    // Family considerations
    if (criteria.familyStatus === "family" && country.safetyScore >= 8 && country.healthcareQuality >= 7) {
      score += 8;
    }

    // Timeline fit
    if (criteria.timeline === "ready_now" && country.visaEase === "easy") {
      score += 8;
      reasons.push("Fast entry possible");
    } else if (criteria.timeline === "ready_now" && country.visaEase === "hard") {
      score -= 5;
    }

    // Safety bonus
    if (criteria.goals.includes("safety") && country.safetyScore >= 8) {
      score += 8;
    }

    // Cap score at 100
    score = Math.min(100, Math.max(0, score));

    // Determine difficulty
    let difficulty: "Easy" | "Moderate" | "Challenging" = "Moderate";
    if (country.visaEase === "easy") difficulty = "Easy";
    else if (country.visaEase === "hard") difficulty = "Challenging";

    // Ensure at least 2 reasons
    if (reasons.length === 0) reasons.push("Viable option for your profile");
    if (reasons.length === 1) reasons.push(`${country.stabilityMonths} months to stability`);

    results.push({
      country,
      score,
      reasons: reasons.slice(0, 3),
      topRisk: country.risks[0],
      difficulty,
    });
  }

  // Sort by score desc
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5);
}
