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
  {
    name: "Georgia", flag: "🇬🇪", costLevel: "low", safetyScore: 7, climate: "moderate",
    region: "europe", healthcareQuality: 5, crimeLevel: "low", citizenshipYears: null,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "high",
    bestFor: ["freedom", "money", "reset", "growth"],
    topVisa: "Visa-free (1 year)",
    risks: ["No direct path to citizenship", "Limited healthcare infrastructure"],
  },
  {
    name: "Portugal", flag: "🇵🇹", costLevel: "medium", safetyScore: 9, climate: "warm",
    region: "europe", healthcareQuality: 8, crimeLevel: "low", citizenshipYears: 5,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "medium",
    bestFor: ["safety", "better_life", "family", "environment"],
    topVisa: "D7 Passive Income Visa",
    risks: ["Bureaucracy can be slow", "Rising cost of living in Lisbon"],
  },
  {
    name: "Spain", flag: "🇪🇸", costLevel: "medium", safetyScore: 8, climate: "warm",
    region: "europe", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 10,
    visaEase: "moderate", stabilityMonths: "4-8", languageBarrier: "medium",
    bestFor: ["better_life", "family", "environment", "safety"],
    topVisa: "Non-Lucrative Visa",
    risks: ["Long path to citizenship (10 years)", "High taxes"],
  },
  {
    name: "UAE", flag: "🇦🇪", costLevel: "high", safetyScore: 9, climate: "warm",
    region: "middle_east", healthcareQuality: 8, crimeLevel: "low", citizenshipYears: null,
    visaEase: "moderate", stabilityMonths: "1-3", languageBarrier: "low",
    bestFor: ["money", "growth", "safety"],
    topVisa: "Golden Visa (10 years)",
    risks: ["No citizenship path", "High cost of living"],
  },
  {
    name: "Thailand", flag: "🇹🇭", costLevel: "low", safetyScore: 6, climate: "warm",
    region: "asia", healthcareQuality: 7, crimeLevel: "medium", citizenshipYears: null,
    visaEase: "easy", stabilityMonths: "1-2", languageBarrier: "high",
    bestFor: ["money", "environment", "reset", "better_life"],
    topVisa: "LTR Visa (Long-Term Resident)",
    risks: ["No citizenship path", "Visa complexity for long stays"],
  },
  {
    name: "Mexico", flag: "🇲🇽", costLevel: "low", safetyScore: 5, climate: "warm",
    region: "americas", healthcareQuality: 6, crimeLevel: "high", citizenshipYears: 5,
    visaEase: "easy", stabilityMonths: "2-4", languageBarrier: "medium",
    bestFor: ["freedom", "reset", "environment", "money"],
    topVisa: "Temporary Resident Visa",
    risks: ["Safety varies significantly by region", "Healthcare quality varies"],
  },
  {
    name: "Estonia", flag: "🇪🇪", costLevel: "medium", safetyScore: 8, climate: "cold",
    region: "europe", healthcareQuality: 7, crimeLevel: "low", citizenshipYears: 8,
    visaEase: "moderate", stabilityMonths: "3-6", languageBarrier: "medium",
    bestFor: ["growth", "freedom", "money"],
    topVisa: "Digital Nomad Visa",
    risks: ["Cold climate", "Small market for employment"],
  },
  {
    name: "Indonesia", flag: "🇮🇩", costLevel: "low", safetyScore: 6, climate: "warm",
    region: "asia", healthcareQuality: 5, crimeLevel: "medium", citizenshipYears: null,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "high",
    bestFor: ["environment", "reset", "money", "better_life"],
    topVisa: "B211A / Second Home Visa",
    risks: ["No citizenship path", "Infrastructure outside Bali is limited"],
  },
  {
    name: "Canada", flag: "🇨🇦", costLevel: "high", safetyScore: 9, climate: "cold",
    region: "americas", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 3,
    visaEase: "hard", stabilityMonths: "6-12", languageBarrier: "low",
    bestFor: ["safety", "family", "better_life", "growth"],
    topVisa: "Express Entry PR",
    risks: ["Highly competitive immigration", "High cost of living"],
  },
  {
    name: "Germany", flag: "🇩🇪", costLevel: "high", safetyScore: 9, climate: "cold",
    region: "europe", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 5,
    visaEase: "moderate", stabilityMonths: "4-8", languageBarrier: "high",
    bestFor: ["safety", "family", "growth", "better_life"],
    topVisa: "Job Seeker / Blue Card",
    risks: ["Bureaucracy is heavy", "Language barrier significant"],
  },
  {
    name: "Argentina", flag: "🇦🇷", costLevel: "low", safetyScore: 6, climate: "moderate",
    region: "americas", healthcareQuality: 6, crimeLevel: "medium", citizenshipYears: 2,
    visaEase: "easy", stabilityMonths: "2-4", languageBarrier: "medium",
    bestFor: ["freedom", "reset", "money", "environment"],
    topVisa: "Rentista Visa",
    risks: ["Economic instability", "Currency volatility"],
  },
  {
    name: "Singapore", flag: "🇸🇬", costLevel: "high", safetyScore: 10, climate: "warm",
    region: "asia", healthcareQuality: 10, crimeLevel: "low", citizenshipYears: 2,
    visaEase: "hard", stabilityMonths: "3-6", languageBarrier: "low",
    bestFor: ["safety", "money", "growth"],
    topVisa: "Employment Pass / EntrePass",
    risks: ["Very high cost of living", "Strict regulations"],
  },
  {
    name: "Australia", flag: "🇦🇺", costLevel: "high", safetyScore: 9, climate: "warm",
    region: "asia", healthcareQuality: 9, crimeLevel: "low", citizenshipYears: 4,
    visaEase: "hard", stabilityMonths: "6-12", languageBarrier: "low",
    bestFor: ["safety", "family", "better_life", "environment"],
    topVisa: "Skilled Worker Visa (subclass 189)",
    risks: ["Complex points-based immigration", "Expensive"],
  },
  {
    name: "Montenegro", flag: "🇲🇪", costLevel: "low", safetyScore: 7, climate: "warm",
    region: "europe", healthcareQuality: 5, crimeLevel: "low", citizenshipYears: 10,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "high",
    bestFor: ["freedom", "reset", "money", "environment"],
    topVisa: "Temporary Residence Permit",
    risks: ["Small economy", "EU accession still in progress"],
  },
  {
    name: "Turkey", flag: "🇹🇷", costLevel: "low", safetyScore: 6, climate: "warm",
    region: "europe", healthcareQuality: 7, crimeLevel: "medium", citizenshipYears: 5,
    visaEase: "easy", stabilityMonths: "1-3", languageBarrier: "high",
    bestFor: ["money", "reset", "growth", "environment"],
    topVisa: "Residence Permit / Citizenship by Investment",
    risks: ["Currency instability", "Political situation"],
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
