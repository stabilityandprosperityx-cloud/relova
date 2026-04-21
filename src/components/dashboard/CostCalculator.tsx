import { useEffect, useState } from "react";

type FamilyStatus = "single" | "couple" | "family";

type CostEntry = {
  visaFeeMin: number;
  visaFeeMax: number;
  apostilleAndTranslationsMin: number;
  apostilleAndTranslationsMax: number;
  rentFirstMonthMin: number;
  rentFirstMonthMax: number;
  insurance3MonthsMin: number;
  insurance3MonthsMax: number;
  emergencyBuffer: number;
  visaType: string;
  notes: string;
};

const COST_DATA: Record<string, CostEntry> = {
  Portugal: {
    visaFeeMin: 150, visaFeeMax: 310,
    apostilleAndTranslationsMin: 300, apostilleAndTranslationsMax: 1000,
    rentFirstMonthMin: 850, rentFirstMonthMax: 1300,
    insurance3MonthsMin: 300, insurance3MonthsMax: 500,
    emergencyBuffer: 500,
    visaType: "D7 Passive Income / D8 Digital Nomad Visa",
    notes: "2026 comfortable living ~€1,500–2,000/mo single (Lisbon €1,750+, Porto €1,300–1,600). Visa fee: €110 consular + €41 VFS + ~€170 residence permit. Apostilles vary by country."
  },
  Spain: {
    visaFeeMin: 80, visaFeeMax: 160,
    apostilleAndTranslationsMin: 500, apostilleAndTranslationsMax: 1500,
    rentFirstMonthMin: 950, rentFirstMonthMax: 1550,
    insurance3MonthsMin: 300, insurance3MonthsMax: 600,
    emergencyBuffer: 500,
    visaType: "Non-Lucrative Visa (NLV)",
    notes: "2026 comfortable living ~€1,500–2,200/mo (Madrid/Barcelona €2,000+, Valencia/Seville ~€1,400). Min income NLV ~€2,400/mo. Sworn translations required. No remote work on NLV."
  },
  Germany: {
    visaFeeMin: 75, visaFeeMax: 100,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 1100, rentFirstMonthMax: 2000,
    insurance3MonthsMin: 350, insurance3MonthsMax: 600,
    emergencyBuffer: 700,
    visaType: "Freelance Visa / Job Seeker Visa",
    notes: "2026 comfortable living ~€2,000–2,800/mo (Berlin ~€2,200, Munich €2,800+). German language strongly recommended. Health insurance mandatory and expensive."
  },
  Greece: {
    visaFeeMin: 75, visaFeeMax: 75,
    apostilleAndTranslationsMin: 300, apostilleAndTranslationsMax: 600,
    rentFirstMonthMin: 650, rentFirstMonthMax: 1050,
    insurance3MonthsMin: 200, insurance3MonthsMax: 400,
    emergencyBuffer: 350,
    visaType: "Digital Nomad Visa",
    notes: "Requires €3,500/mo income. 2026 comfortable living ~€1,300–1,800/mo (Athens €1,500–1,800). Islands pricier in peak season."
  },
  Croatia: {
    visaFeeMin: 50, visaFeeMax: 80,
    apostilleAndTranslationsMin: 250, apostilleAndTranslationsMax: 500,
    rentFirstMonthMin: 600, rentFirstMonthMax: 1000,
    insurance3MonthsMin: 200, insurance3MonthsMax: 350,
    emergencyBuffer: 300,
    visaType: "Digital Nomad Visa",
    notes: "EU member. Requires €2,300/month income. Adriatic coast lifestyle. Rent: Zagreb €600–900, coastal cities higher."
  },
  Montenegro: {
    visaFeeMin: 20, visaFeeMax: 70,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 400,
    rentFirstMonthMin: 400, rentFirstMonthMax: 700,
    insurance3MonthsMin: 150, insurance3MonthsMax: 280,
    emergencyBuffer: 300,
    visaType: "Temporary Residence Permit",
    notes: "EU candidate country. Easy entry for many nationalities. Very low cost of living. Apply after arrival. Rent: Podgorica €400–600, coastal areas higher."
  },
  Serbia: {
    visaFeeMin: 0, visaFeeMax: 50,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 350,
    rentFirstMonthMin: 450, rentFirstMonthMax: 750,
    insurance3MonthsMin: 120, insurance3MonthsMax: 220,
    emergencyBuffer: 250,
    visaType: "Visa-free Stay / Residence Permit",
    notes: "Visa-free for most passports (90 days). Low cost of living. Belgrade growing expat hub. Rent: Belgrade €500–800."
  },
  "Czech Republic": {
    visaFeeMin: 100, visaFeeMax: 200,
    apostilleAndTranslationsMin: 300, apostilleAndTranslationsMax: 600,
    rentFirstMonthMin: 850, rentFirstMonthMax: 1250,
    insurance3MonthsMin: 250, insurance3MonthsMax: 400,
    emergencyBuffer: 400,
    visaType: "Long-term Residence Visa",
    notes: "2026 comfortable living ~€1,500–1,900/mo (Prague €1,700–1,900). Strong expat community; English common in Prague."
  },
  Hungary: {
    visaFeeMin: 60, visaFeeMax: 110,
    apostilleAndTranslationsMin: 250, apostilleAndTranslationsMax: 500,
    rentFirstMonthMin: 600, rentFirstMonthMax: 1000,
    insurance3MonthsMin: 200, insurance3MonthsMax: 350,
    emergencyBuffer: 300,
    visaType: "White Card (Guest Investor Visa)",
    notes: "Budapest very affordable by EU standards. New digital nomad-friendly visa. Rent: Budapest €600–900."
  },
  Italy: {
    visaFeeMin: 100, visaFeeMax: 130,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 900,
    rentFirstMonthMin: 1000, rentFirstMonthMax: 1700,
    insurance3MonthsMin: 280, insurance3MonthsMax: 500,
    emergencyBuffer: 500,
    visaType: "Elective Residency Visa",
    notes: "2026 comfortable living ~€1,800–2,500/mo (Rome/Milan €2,200+, smaller cities ~€1,600). Slow bureaucracy; passive income required."
  },
  UAE: {
    visaFeeMin: 1400, visaFeeMax: 3500,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 2200, rentFirstMonthMax: 4200,
    insurance3MonthsMin: 400, insurance3MonthsMax: 700,
    emergencyBuffer: 1000,
    visaType: "Freelance Permit + Residence Visa",
    notes: "2026 ~$3,000–5,000/mo (Dubai Marina $4,500+, JLT/Discovery Gardens $2,500–3,500). Single comfortable often $3,000–4,000/mo. Freelance permit AED 7,500–20,000. 0% income tax."
  },
  Turkey: {
    visaFeeMin: 50, visaFeeMax: 100,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 350,
    rentFirstMonthMin: 400, rentFirstMonthMax: 900,
    insurance3MonthsMin: 150, insurance3MonthsMax: 300,
    emergencyBuffer: 300,
    visaType: "Short-stay Visa / Residence Permit",
    notes: "Easy entry. High inflation — real costs fluctuate. Strategic location. Rent: Istanbul €500–1,200 depending on area."
  },
  Georgia: {
    visaFeeMin: 0, visaFeeMax: 20,
    apostilleAndTranslationsMin: 100, apostilleAndTranslationsMax: 250,
    rentFirstMonthMin: 450, rentFirstMonthMax: 750,
    insurance3MonthsMin: 120, insurance3MonthsMax: 220,
    emergencyBuffer: 300,
    visaType: "Visa-free Stay (up to 1 year for most passports)",
    notes: "2026 ~$900–1,200/mo comfortable (Tbilisi $1,000–1,200). Visa-free 1 year for 95+ countries. 1% small-business tax. Among the cheapest hubs in Europe."
  },
  Armenia: {
    visaFeeMin: 0, visaFeeMax: 30,
    apostilleAndTranslationsMin: 100, apostilleAndTranslationsMax: 200,
    rentFirstMonthMin: 400, rentFirstMonthMax: 700,
    insurance3MonthsMin: 100, insurance3MonthsMax: 200,
    emergencyBuffer: 250,
    visaType: "Visa-free Stay",
    notes: "Visa-free for many nationalities. Yerevan affordable and modern. Good internet. Rent: Yerevan €400–700."
  },
  Thailand: {
    visaFeeMin: 90, visaFeeMax: 300,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 400,
    rentFirstMonthMin: 500, rentFirstMonthMax: 950,
    insurance3MonthsMin: 150, insurance3MonthsMax: 350,
    emergencyBuffer: 300,
    visaType: "DTV (Destination Thailand Visa) — 5 years",
    notes: "2026 ~$1,200–1,800/mo comfortable; Bangkok central 1BR ~$500–700; budget $800–1,000 outside Bangkok. DTV: savings or remote income proof; fee ~$90–300 by embassy."
  },
  Malaysia: {
    visaFeeMin: 150, visaFeeMax: 250,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 350,
    rentFirstMonthMin: 550, rentFirstMonthMax: 1000,
    insurance3MonthsMin: 150, insurance3MonthsMax: 300,
    emergencyBuffer: 300,
    visaType: "DE Rantau Nomad Pass",
    notes: "2026 ~$1,200–1,700/mo (Kuala Lumpur $1,200–1,600). DE Rantau has high income threshold — verify current RM requirement. English widely spoken."
  },
  Mexico: {
    visaFeeMin: 56, visaFeeMax: 150,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 600,
    rentFirstMonthMin: 700, rentFirstMonthMax: 1250,
    insurance3MonthsMin: 150, insurance3MonthsMax: 350,
    emergencyBuffer: 350,
    visaType: "Temporary Residence Visa",
    notes: "2026 ~$1,200–1,800/mo (Mexico City ~$1,300, Playa del Carmen ~$1,500). Consular fee $56; residence card ~$600/yr (2026). Hotspots: CDMX, Oaxaca, Playa, Mérida."
  },
  Colombia: {
    visaFeeMin: 200, visaFeeMax: 270,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 400,
    rentFirstMonthMin: 450, rentFirstMonthMax: 900,
    insurance3MonthsMin: 120, insurance3MonthsMax: 280,
    emergencyBuffer: 280,
    visaType: "Digital Nomad Visa (Nómada Digital)",
    notes: "2026 ~$1,000–1,500/mo (Medellín $1,000–1,300, Bogotá $1,200–1,500). Visa often ~$900/mo income proof — confirm with consulate."
  },
  Panama: {
    visaFeeMin: 250, visaFeeMax: 400,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 500,
    rentFirstMonthMin: 700, rentFirstMonthMax: 1400,
    insurance3MonthsMin: 200, insurance3MonthsMax: 400,
    emergencyBuffer: 400,
    visaType: "Friendly Nations Visa",
    notes: "Dollar economy. No tax on foreign income. Easy residency for many nationalities. Panama City modern infrastructure."
  },

  // ─── EUROPE — MISSING ───
  Austria: {
    visaFeeMin: 160, visaFeeMax: 250,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 900,
    rentFirstMonthMin: 1100, rentFirstMonthMax: 1850,
    insurance3MonthsMin: 300, insurance3MonthsMax: 550,
    emergencyBuffer: 600,
    visaType: "Red-White-Red Card",
    notes: "2026 ~€2,000–2,600/mo (Vienna €2,200–2,500). German required for integration. Health insurance mandatory."
  },
  Netherlands: {
    visaFeeMin: 200, visaFeeMax: 350,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 1600, rentFirstMonthMax: 2700,
    insurance3MonthsMin: 350, insurance3MonthsMax: 600,
    emergencyBuffer: 700,
    visaType: "Highly Skilled Migrant Visa",
    notes: "2026 ~€2,500–3,200/mo (Amsterdam €3,000+). Rotterdam/Utrecht below Amsterdam. Mandatory health insurance ~€150/mo."
  },
  France: {
    visaFeeMin: 99, visaFeeMax: 200,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 900,
    rentFirstMonthMin: 1050, rentFirstMonthMax: 2000,
    insurance3MonthsMin: 300, insurance3MonthsMax: 550,
    emergencyBuffer: 600,
    visaType: "Talent Passport / Long-Stay Visa",
    notes: "2026 ~€2,000–2,800/mo (Paris €2,800+, Lyon/Bordeaux ~€2,000). French required for integration."
  },
  Poland: {
    visaFeeMin: 135, visaFeeMax: 200,
    apostilleAndTranslationsMin: 250, apostilleAndTranslationsMax: 500,
    rentFirstMonthMin: 650, rentFirstMonthMax: 1100,
    insurance3MonthsMin: 200, insurance3MonthsMax: 380,
    emergencyBuffer: 400,
    visaType: "Temporary Residence Permit (Karta Pobytu)",
    notes: "2026 ~€1,200–1,600/mo (Warsaw €1,400–1,600). Kraków/Wrocław often below Warsaw."
  },
  Romania: {
    visaFeeMin: 80, visaFeeMax: 150,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 450,
    rentFirstMonthMin: 500, rentFirstMonthMax: 900,
    insurance3MonthsMin: 150, insurance3MonthsMax: 300,
    emergencyBuffer: 300,
    visaType: "Digital Nomad Visa / Long-stay Visa",
    notes: "Bucharest rent: €500–900/mo. Very affordable EU country. Digital nomad visa launched 2024."
  },
  Bulgaria: {
    visaFeeMin: 60, visaFeeMax: 100,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 400,
    rentFirstMonthMin: 400, rentFirstMonthMax: 700,
    insurance3MonthsMin: 120, insurance3MonthsMax: 250,
    emergencyBuffer: 300,
    visaType: "Digital Nomad Visa / Long-stay Visa",
    notes: "Sofia rent: €400–700/mo. Cheapest EU country. Digital nomad program launched 2025. Black Sea coast popular."
  },
  Albania: {
    visaFeeMin: 0, visaFeeMax: 50,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 300,
    rentFirstMonthMin: 350, rentFirstMonthMax: 600,
    insurance3MonthsMin: 100, insurance3MonthsMax: 200,
    emergencyBuffer: 250,
    visaType: "Visa-free Stay (1 year for many nationalities)",
    notes: "Tirana rent: €350–600/mo. Very affordable. 1-year visa-free for many passports. EU candidate country."
  },
  Estonia: {
    visaFeeMin: 100, visaFeeMax: 180,
    apostilleAndTranslationsMin: 300, apostilleAndTranslationsMax: 600,
    rentFirstMonthMin: 750, rentFirstMonthMax: 1200,
    insurance3MonthsMin: 200, insurance3MonthsMax: 380,
    emergencyBuffer: 400,
    visaType: "Digital Nomad Visa",
    notes: "2026 ~€1,400–1,900/mo (Tallinn €1,600–1,900). Digital nomad pioneer; cold winters."
  },
  Malta: {
    visaFeeMin: 280, visaFeeMax: 350,
    apostilleAndTranslationsMin: 350, apostilleAndTranslationsMax: 600,
    rentFirstMonthMin: 900, rentFirstMonthMax: 1500,
    insurance3MonthsMin: 250, insurance3MonthsMax: 450,
    emergencyBuffer: 450,
    visaType: "Nomad Residence Permit",
    notes: "English official language. Valletta/Sliema rent: €900–1,500/mo. Requires €3,500/mo income. Mediterranean lifestyle."
  },
  Cyprus: {
    visaFeeMin: 70, visaFeeMax: 140,
    apostilleAndTranslationsMin: 300, apostilleAndTranslationsMax: 600,
    rentFirstMonthMin: 800, rentFirstMonthMax: 1400,
    insurance3MonthsMin: 250, insurance3MonthsMax: 450,
    emergencyBuffer: 400,
    visaType: "Digital Nomad Visa",
    notes: "Nicosia/Limassol rent: €800–1,400/mo. English widely spoken. Requires €3,500/mo income. Reopened March 2025."
  },
  Switzerland: {
    visaFeeMin: 150, visaFeeMax: 300,
    apostilleAndTranslationsMin: 500, apostilleAndTranslationsMax: 1000,
    rentFirstMonthMin: 2000, rentFirstMonthMax: 3500,
    insurance3MonthsMin: 500, insurance3MonthsMax: 900,
    emergencyBuffer: 1000,
    visaType: "Work Permit Type B",
    notes: "Most expensive country in Europe. Zurich/Geneva rent: €2,000–3,500/mo. Highest salaries in world. Employer sponsorship required."
  },
  Norway: {
    visaFeeMin: 600, visaFeeMax: 800,
    apostilleAndTranslationsMin: 450, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 1500, rentFirstMonthMax: 2500,
    insurance3MonthsMin: 350, insurance3MonthsMax: 600,
    emergencyBuffer: 700,
    visaType: "Skilled Worker Visa",
    notes: "Oslo rent: €1,500–2,500/mo. High salaries offset high costs. Job offer required. Excellent welfare system."
  },
  Sweden: {
    visaFeeMin: 250, visaFeeMax: 400,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 700,
    rentFirstMonthMin: 1200, rentFirstMonthMax: 2000,
    insurance3MonthsMin: 300, insurance3MonthsMax: 500,
    emergencyBuffer: 600,
    visaType: "Work Permit",
    notes: "Stockholm rent: €1,200–2,000/mo. High taxes but excellent public services. Job offer required."
  },
  Denmark: {
    visaFeeMin: 350, visaFeeMax: 500,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 700,
    rentFirstMonthMin: 1400, rentFirstMonthMax: 2200,
    insurance3MonthsMin: 300, insurance3MonthsMax: 550,
    emergencyBuffer: 700,
    visaType: "Pay Limit Scheme / Positive List",
    notes: "Copenhagen rent: €1,400–2,200/mo. High taxes. Job offer required. One of world happiest countries."
  },
  Ireland: {
    visaFeeMin: 100, visaFeeMax: 200,
    apostilleAndTranslationsMin: 350, apostilleAndTranslationsMax: 650,
    rentFirstMonthMin: 1500, rentFirstMonthMax: 2500,
    insurance3MonthsMin: 300, insurance3MonthsMax: 550,
    emergencyBuffer: 700,
    visaType: "Critical Skills Employment Permit",
    notes: "Dublin rent: €1,800–2,500/mo. Severe housing shortage. English speaking. Tech hub. Job offer required."
  },

  // ─── MIDDLE EAST ───
  Bahrain: {
    visaFeeMin: 50, visaFeeMax: 150,
    apostilleAndTranslationsMin: 300, apostilleAndTranslationsMax: 600,
    rentFirstMonthMin: 800, rentFirstMonthMax: 1600,
    insurance3MonthsMin: 250, insurance3MonthsMax: 450,
    emergencyBuffer: 500,
    visaType: "Digital Nomad Visa",
    notes: "Manama rent: €800–1,600/mo. No income tax. Smaller and cheaper than Dubai. English widely spoken."
  },

  // ─── ASIA ───
  Japan: {
    visaFeeMin: 100, visaFeeMax: 200,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 900,
    rentFirstMonthMin: 900, rentFirstMonthMax: 1700,
    insurance3MonthsMin: 250, insurance3MonthsMax: 500,
    emergencyBuffer: 500,
    visaType: "Digital Nomad Visa / Highly Skilled Professional",
    notes: "2026 ~$2,000–3,000/mo (Tokyo $2,500–3,500; Osaka ~15% cheaper). Language barrier high; excellent safety."
  },
  Singapore: {
    visaFeeMin: 150, visaFeeMax: 300,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 2600, rentFirstMonthMax: 4200,
    insurance3MonthsMin: 400, insurance3MonthsMax: 700,
    emergencyBuffer: 1000,
    visaType: "Employment Pass / EntrePass",
    notes: "2026 ~$4,000–6,000/mo comfortable single — among the priciest cities in Asia. English official; top infrastructure. Employment Pass needs job offer."
  },
  "South Korea": {
    visaFeeMin: 60, visaFeeMax: 150,
    apostilleAndTranslationsMin: 350, apostilleAndTranslationsMax: 700,
    rentFirstMonthMin: 800, rentFirstMonthMax: 1450,
    insurance3MonthsMin: 200, insurance3MonthsMax: 400,
    emergencyBuffer: 450,
    visaType: "Workcation Visa / Digital Nomad Visa",
    notes: "2026 ~$2,000–2,800/mo (Seoul $2,200–2,800). Fast internet; language barrier outside Seoul."
  },
  Indonesia: {
    visaFeeMin: 100, visaFeeMax: 200,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 350,
    rentFirstMonthMin: 550, rentFirstMonthMax: 1100,
    insurance3MonthsMin: 150, insurance3MonthsMax: 300,
    emergencyBuffer: 300,
    visaType: "Social/Cultural Visa B211A",
    notes: "2026 Bali ~$1,200–2,000/mo (Canggu $1,500+, Ubud/Sanur ~$1,200). Healthcare thin outside major hubs."
  },
  Vietnam: {
    visaFeeMin: 50, visaFeeMax: 100,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 300,
    rentFirstMonthMin: 380, rentFirstMonthMax: 780,
    insurance3MonthsMin: 120, insurance3MonthsMax: 250,
    emergencyBuffer: 250,
    visaType: "E-visa (90 days)",
    notes: "2026 ~$1,000–1,500/mo (HCMC $1,200–1,600, Hanoi $900–1,300). Long-stay rules change — confirm latest visa options."
  },
  Philippines: {
    visaFeeMin: 50, visaFeeMax: 150,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 300,
    rentFirstMonthMin: 350, rentFirstMonthMax: 800,
    insurance3MonthsMin: 120, insurance3MonthsMax: 250,
    emergencyBuffer: 300,
    visaType: "Digital Nomad Visa (launched 2025)",
    notes: "2026 ~$800–1,400/mo (Manila $1,000–1,400, Cebu $800–1,100). English widely spoken."
  },

  // ─── AMERICAS ───
  "Costa Rica": {
    visaFeeMin: 100, visaFeeMax: 200,
    apostilleAndTranslationsMin: 250, apostilleAndTranslationsMax: 500,
    rentFirstMonthMin: 700, rentFirstMonthMax: 1400,
    insurance3MonthsMin: 200, insurance3MonthsMax: 400,
    emergencyBuffer: 400,
    visaType: "Rentista Visa",
    notes: "San José rent: €700–1,200/mo. Beach areas €900–1,400/mo. Requires $2,500/mo income. Stable democracy. Pura vida lifestyle."
  },
  Uruguay: {
    visaFeeMin: 50, visaFeeMax: 150,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 400,
    rentFirstMonthMin: 600, rentFirstMonthMax: 1200,
    insurance3MonthsMin: 180, insurance3MonthsMax: 350,
    emergencyBuffer: 400,
    visaType: "Temporary Residence",
    notes: "Montevideo rent: €600–1,200/mo. Most stable country in South America. Straightforward residency process."
  },
  Argentina: {
    visaFeeMin: 0, visaFeeMax: 100,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 350,
    rentFirstMonthMin: 400, rentFirstMonthMax: 800,
    insurance3MonthsMin: 120, insurance3MonthsMax: 280,
    emergencyBuffer: 300,
    visaType: "Rentista Visa",
    notes: "2026 ~$800–1,200/mo Buenos Aires; costs swing with FX — think in USD. Vibrant culture; plan for inflation volatility."
  },
  Brazil: {
    visaFeeMin: 80, visaFeeMax: 180,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 450,
    rentFirstMonthMin: 600, rentFirstMonthMax: 1100,
    insurance3MonthsMin: 150, insurance3MonthsMax: 320,
    emergencyBuffer: 350,
    visaType: "Digital Nomad Visa (1 year renewable)",
    notes: "2026 ~$1,200–1,800/mo (São Paulo $1,600–2,000, Florianópolis ~$1,200). Portuguese helps; safety varies by neighborhood."
  },
  Canada: {
    visaFeeMin: 150, visaFeeMax: 350,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 1700, rentFirstMonthMax: 2900,
    insurance3MonthsMin: 350, insurance3MonthsMax: 600,
    emergencyBuffer: 800,
    visaType: "Express Entry (points-based PR)",
    notes: "2026 ~CAD $3,000–4,500/mo single (Toronto/Vancouver $4,000+; Montreal ~$2,800). Figures shown in USD in calculator — convert mentally. Cold winters."
  },

  // ─── AFRICA & ISLANDS ───
  "South Africa": {
    visaFeeMin: 100, visaFeeMax: 200,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 450,
    rentFirstMonthMin: 400, rentFirstMonthMax: 900,
    insurance3MonthsMin: 150, insurance3MonthsMax: 320,
    emergencyBuffer: 350,
    visaType: "Critical Skills Visa",
    notes: "Cape Town/Johannesburg rent: €400–900/mo. Affordable lifestyle. Safety concerns vary by area. Excellent weather."
  },
  Morocco: {
    visaFeeMin: 0, visaFeeMax: 80,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 350,
    rentFirstMonthMin: 350, rentFirstMonthMax: 700,
    insurance3MonthsMin: 100, insurance3MonthsMax: 220,
    emergencyBuffer: 300,
    visaType: "Residence Permit (Carte de Séjour)",
    notes: "Marrakech/Casablanca rent: €350–700/mo. Very affordable. Close to Europe. French widely spoken."
  },
  Mauritius: {
    visaFeeMin: 0, visaFeeMax: 100,
    apostilleAndTranslationsMin: 250, apostilleAndTranslationsMax: 500,
    rentFirstMonthMin: 800, rentFirstMonthMax: 1500,
    insurance3MonthsMin: 200, insurance3MonthsMax: 400,
    emergencyBuffer: 450,
    visaType: "Premium Visa (1 year renewable)",
    notes: "Port Louis area rent: €800–1,500/mo. English/French spoken. Tropical island. No income tax on foreign earnings."
  },

  // ─── PACIFIC ───
  Australia: {
    visaFeeMin: 200, visaFeeMax: 400,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 1500, rentFirstMonthMax: 2600,
    insurance3MonthsMin: 350, insurance3MonthsMax: 650,
    emergencyBuffer: 800,
    visaType: "Skilled Worker Visa (subclass 189/190)",
    notes: "2026 ~AUD $3,500–4,500/mo single (~USD $2,200–2,900). Sydney AUD $4,000+; Brisbane/Adelaide AUD $3,200–3,500. Calculator uses USD for line items."
  },
  "New Zealand": {
    visaFeeMin: 200, visaFeeMax: 400,
    apostilleAndTranslationsMin: 350, apostilleAndTranslationsMax: 700,
    rentFirstMonthMin: 1300, rentFirstMonthMax: 2100,
    insurance3MonthsMin: 300, insurance3MonthsMax: 550,
    emergencyBuffer: 700,
    visaType: "Skilled Migrant Category",
    notes: "2026 ~NZD $3,500–4,500/mo (~USD $2,100–2,700). Auckland highest; Wellington/Christchurch lower. English speaking; points-based immigration."
  },

  // ─── UK ───
  "United Kingdom": {
    visaFeeMin: 800, visaFeeMax: 1600,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 1400, rentFirstMonthMax: 2500,
    insurance3MonthsMin: 0, insurance3MonthsMax: 0,
    emergencyBuffer: 800,
    visaType: "Skilled Worker Visa",
    notes: "Visa fee £769–1,519 + Immigration Health Surcharge £1,035/year (NHS access). London rent: £1,800–2,500/mo. Manchester/Birmingham: £900–1,400/mo. Job offer required."
  },

  // ─── USA ───
  "United States": {
    visaFeeMin: 500, visaFeeMax: 2000,
    apostilleAndTranslationsMin: 500, apostilleAndTranslationsMax: 1200,
    rentFirstMonthMin: 2000, rentFirstMonthMax: 4200,
    insurance3MonthsMin: 600, insurance3MonthsMax: 1500,
    emergencyBuffer: 1500,
    visaType: "H-1B / O-1 / EB-1 Work Visa",
    notes: "2026 comfortable living ~$3,500–6,000/mo (NYC/SF $5,000+; Austin/Denver ~$3,500). H-1B needs employer + lottery. Health insurance extra — not in visa fees."
  },

  // ─── EUROPE — WESTERN ───
  Belgium: {
    visaFeeMin: 180, visaFeeMax: 350,
    apostilleAndTranslationsMin: 350, apostilleAndTranslationsMax: 700,
    rentFirstMonthMin: 900, rentFirstMonthMax: 1600,
    insurance3MonthsMin: 300, insurance3MonthsMax: 500,
    emergencyBuffer: 550,
    visaType: "Single Permit (Work + Residence)",
    notes: "Brussels rent: €1,100–1,800/mo. Antwerp/Ghent cheaper at €800–1,200/mo. High taxes but excellent public services. French/Dutch/German spoken."
  },
  Luxembourg: {
    visaFeeMin: 80, visaFeeMax: 200,
    apostilleAndTranslationsMin: 350, apostilleAndTranslationsMax: 700,
    rentFirstMonthMin: 1800, rentFirstMonthMax: 3000,
    insurance3MonthsMin: 350, insurance3MonthsMax: 600,
    emergencyBuffer: 800,
    visaType: "Work Permit / EU Blue Card",
    notes: "Highest salaries in EU. Luxembourg City rent: €1,800–3,000/mo. Small country — easy to navigate. French/German/Luxembourgish spoken."
  },

  // ─── EUROPE — NORTHERN ───
  Finland: {
    visaFeeMin: 350, visaFeeMax: 500,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 700,
    rentFirstMonthMin: 900, rentFirstMonthMax: 1600,
    insurance3MonthsMin: 280, insurance3MonthsMax: 500,
    emergencyBuffer: 600,
    visaType: "Work Permit (Residence Permit for Employed)",
    notes: "Helsinki rent: €900–1,600/mo. Excellent education and welfare. English widely spoken in cities. Cold climate. Job offer usually required."
  },
  Iceland: {
    visaFeeMin: 80, visaFeeMax: 200,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 700,
    rentFirstMonthMin: 1400, rentFirstMonthMax: 2200,
    insurance3MonthsMin: 350, insurance3MonthsMax: 600,
    emergencyBuffer: 700,
    visaType: "Work Permit",
    notes: "Reykjavik rent: €1,400–2,200/mo. Very high cost of living. English widely spoken. Unique nature. Strong job market in tech and tourism."
  },

  // ─── EUROPE — EASTERN ───
  Slovakia: {
    visaFeeMin: 100, visaFeeMax: 180,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 450,
    rentFirstMonthMin: 600, rentFirstMonthMax: 1000,
    insurance3MonthsMin: 180, insurance3MonthsMax: 330,
    emergencyBuffer: 350,
    visaType: "Temporary Residence Permit",
    notes: "Bratislava rent: €700–1,100/mo. Affordable EU country. Close to Vienna (1 hour). Slovak language barrier. Growing expat community."
  },
  Slovenia: {
    visaFeeMin: 100, visaFeeMax: 180,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 450,
    rentFirstMonthMin: 700, rentFirstMonthMax: 1200,
    insurance3MonthsMin: 200, insurance3MonthsMax: 350,
    emergencyBuffer: 400,
    visaType: "Temporary Residence Permit",
    notes: "Ljubljana rent: €700–1,200/mo. Beautiful nature. Affordable EU country. Good quality of life. Slovenian language required for integration."
  },
  Latvia: {
    visaFeeMin: 100, visaFeeMax: 180,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 400,
    rentFirstMonthMin: 500, rentFirstMonthMax: 900,
    insurance3MonthsMin: 160, insurance3MonthsMax: 300,
    emergencyBuffer: 350,
    visaType: "Temporary Residence Permit",
    notes: "Riga rent: €500–900/mo. Affordable Baltic EU country. Russian/Latvian spoken. Good digital infrastructure. EU access."
  },
  Lithuania: {
    visaFeeMin: 100, visaFeeMax: 180,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 400,
    rentFirstMonthMin: 500, rentFirstMonthMax: 900,
    insurance3MonthsMin: 160, insurance3MonthsMax: 300,
    emergencyBuffer: 350,
    visaType: "Temporary Residence Permit",
    notes: "Vilnius rent: €500–900/mo. Most affordable Baltic country. Growing tech scene. Lithuanian/Russian spoken. EU access."
  },

  // ─── ASIA — ADDITIONAL ───
  Taiwan: {
    visaFeeMin: 100, visaFeeMax: 200,
    apostilleAndTranslationsMin: 300, apostilleAndTranslationsMax: 600,
    rentFirstMonthMin: 600, rentFirstMonthMax: 1200,
    insurance3MonthsMin: 150, insurance3MonthsMax: 300,
    emergencyBuffer: 400,
    visaType: "Employment Gold Card",
    notes: "Taipei rent: €600–1,200/mo. Excellent healthcare. Gold Card for high-skill workers. English spoken in cities. Unique political situation."
  },
  "Hong Kong": {
    visaFeeMin: 100, visaFeeMax: 250,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 2000, rentFirstMonthMax: 4000,
    insurance3MonthsMin: 400, insurance3MonthsMax: 700,
    emergencyBuffer: 1000,
    visaType: "Quality Migrant Admission Scheme",
    notes: "Extremely expensive. Rent: HK$15,000–30,000/mo (€1,800–3,600). English official. Financial hub. Complex political situation post-2020."
  },
  India: {
    visaFeeMin: 0, visaFeeMax: 100,
    apostilleAndTranslationsMin: 100, apostilleAndTranslationsMax: 300,
    rentFirstMonthMin: 300, rentFirstMonthMax: 800,
    insurance3MonthsMin: 80, insurance3MonthsMax: 200,
    emergencyBuffer: 300,
    visaType: "Employment Visa / Business Visa",
    notes: "Mumbai/Bangalore rent: €300–800/mo. Very affordable. Large English-speaking population. Bureaucracy complex. Tropical climate with monsoons."
  },
  "Sri Lanka": {
    visaFeeMin: 50, visaFeeMax: 100,
    apostilleAndTranslationsMin: 100, apostilleAndTranslationsMax: 250,
    rentFirstMonthMin: 300, rentFirstMonthMax: 700,
    insurance3MonthsMin: 100, insurance3MonthsMax: 200,
    emergencyBuffer: 250,
    visaType: "Residence Visa",
    notes: "Colombo rent: €300–700/mo. Beautiful island. English spoken. Recovering economy. Growing digital nomad community."
  },

  // ─── MIDDLE EAST — ADDITIONAL ───
  "Saudi Arabia": {
    visaFeeMin: 300, visaFeeMax: 600,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 900,
    rentFirstMonthMin: 1000, rentFirstMonthMax: 2500,
    insurance3MonthsMin: 300, insurance3MonthsMax: 600,
    emergencyBuffer: 700,
    visaType: "Work Visa (Employer Sponsorship Required)",
    notes: "Riyadh/Jeddah rent: €1,000–2,500/mo. 0% income tax. Employer sponsorship required. Strict cultural rules. High salaries in oil/tech sectors."
  },

  // ─── AMERICAS — ADDITIONAL ───
  Chile: {
    visaFeeMin: 100, visaFeeMax: 250,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 450,
    rentFirstMonthMin: 600, rentFirstMonthMax: 1200,
    insurance3MonthsMin: 180, insurance3MonthsMax: 350,
    emergencyBuffer: 400,
    visaType: "Temporary Residence Visa",
    notes: "Santiago rent: €600–1,200/mo. Most stable South American country. Spanish required. Excellent wine country. Fast path to residency."
  },
  Ecuador: {
    visaFeeMin: 50, visaFeeMax: 150,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 350,
    rentFirstMonthMin: 400, rentFirstMonthMax: 800,
    insurance3MonthsMin: 120, insurance3MonthsMax: 250,
    emergencyBuffer: 300,
    visaType: "Professional Visa / Rentier Visa",
    notes: "Quito/Cuenca rent: €400–800/mo. Dollar economy. Affordable. Growing expat community in Cuenca. Spanish required."
  },

  // ─── AFRICA — ADDITIONAL ───
  Egypt: {
    visaFeeMin: 0, visaFeeMax: 50,
    apostilleAndTranslationsMin: 100, apostilleAndTranslationsMax: 250,
    rentFirstMonthMin: 200, rentFirstMonthMax: 600,
    insurance3MonthsMin: 80, insurance3MonthsMax: 200,
    emergencyBuffer: 250,
    visaType: "Residence Permit",
    notes: "Cairo/Alexandria rent: €200–600/mo. Very affordable. Arabic spoken. Growing expat community. Currency fluctuations."
  },
  Kenya: {
    visaFeeMin: 50, visaFeeMax: 200,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 350,
    rentFirstMonthMin: 400, rentFirstMonthMax: 900,
    insurance3MonthsMin: 120, insurance3MonthsMax: 280,
    emergencyBuffer: 350,
    visaType: "Work Permit / Special Pass",
    notes: "Nairobi rent: €400–900/mo. Africa's tech hub. English spoken. Growing startup ecosystem. Safari culture."
  },
};

const TAX_DATA: Record<string, { incomeTaxRate: number; specialRegime?: string; specialRegimeRate?: number; specialRegimeYears?: number; notes: string }> = {
  Portugal: { incomeTaxRate: 0.53, specialRegime: "IFICI/NHR 2.0", specialRegimeRate: 0.20, specialRegimeYears: 10, notes: "20% flat tax for 10 years — but only for tech, science, research, and innovation professionals. Standard rate up to 53%." },
  Spain: { incomeTaxRate: 0.47, specialRegime: "Beckham Law", specialRegimeRate: 0.24, specialRegimeYears: 6, notes: "24% flat tax on Spanish income up to €600k for 6 years. Must not have been Spanish resident for 5 years prior." },
  Germany: { incomeTaxRate: 0.47, notes: "Progressive up to 47.5%. No special expat regime. High social contributions add ~20% on top." },
  Greece: { incomeTaxRate: 0.44, specialRegime: "Non-Dom", specialRegimeRate: 0.07, specialRegimeYears: 15, notes: "7% flat tax on foreign income for 15 years (retirees) OR €100k lump sum for HNWIs. Standard rate up to 44%." },
  Croatia: { incomeTaxRate: 0.35, notes: "Max 35.4% income tax. EU member since 2013. No special expat tax regime." },
  Montenegro: { incomeTaxRate: 0.15, notes: "15% flat income tax — one of the lowest in Europe. No wealth or inheritance tax." },
  Serbia: { incomeTaxRate: 0.10, notes: "10% flat income tax. No wealth tax. Very low cost base. Popular with digital nomads." },
  Hungary: { incomeTaxRate: 0.15, notes: "15% flat income tax — lowest in the EU. Corporate tax 9% — also lowest in EU. No special expat regime needed." },
  Italy: { incomeTaxRate: 0.43, specialRegime: "Flat Tax / Impatriate", specialRegimeRate: 0.07, specialRegimeYears: 10, notes: "€100k flat tax on foreign income OR 7% in southern regions for retirees. Impatriate regime: 50% income exemption for workers. Standard rate up to 43%." },
  UAE: { incomeTaxRate: 0, notes: "Zero personal income tax. Corporate tax 9% above AED 375k profit. No capital gains tax. No inheritance tax." },
  Turkey: { incomeTaxRate: 0.40, notes: "Progressive 15-40%. No special expat regime. Residents taxed on worldwide income after 183 days." },
  Georgia: { incomeTaxRate: 0.20, specialRegime: "Small Business Status", specialRegimeRate: 0.01, notes: "1% tax on turnover up to 500,000 GEL (~$180k/yr) via Individual Entrepreneur + Small Business Status. Standard rate 20%. Some professions excluded (legal, medical, financial)." },
  Armenia: { incomeTaxRate: 0.20, notes: "20% flat income tax. No special expat regime but very low cost of living. Visa-free for many nationalities." },
  Thailand: { incomeTaxRate: 0.35, specialRegime: "LTR Visa", specialRegimeRate: 0.00, notes: "LTR Visa holders: 0% tax on foreign-sourced income. Standard residents taxed on remitted foreign income at progressive rates up to 35%. LTR requires $80k+ annual income or $1M+ assets." },
  Malaysia: { incomeTaxRate: 0.30, specialRegime: "MM2H / Territorial", specialRegimeRate: 0.00, notes: "Foreign-sourced income not taxed for residents (territorial system). MM2H visa holders: tax-free on overseas income. Local income taxed at up to 30%. Exemption valid until 2036." },
  Mexico: { incomeTaxRate: 0.35, notes: "Progressive 1.92-35%. Residents (183+ days) taxed on worldwide income. No special expat regime. No inheritance or wealth tax." },
  Colombia: { incomeTaxRate: 0.39, notes: "Progressive up to 39%. Residents taxed on worldwide income. Growing digital nomad scene but no special tax regime." },
  Panama: { incomeTaxRate: 0.25, specialRegime: "Territorial", specialRegimeRate: 0.00, notes: "Territorial tax system — foreign-sourced income not taxed. Only Panama-sourced income taxed at up to 25%. Popular for offshore structures." },
  Austria: { incomeTaxRate: 0.55, notes: "Progressive up to 55%. Among the highest in Europe. No special expat regime. High social contributions." },
  Netherlands: { incomeTaxRate: 0.495, specialRegime: "30% Ruling", specialRegimeRate: 0.347, specialRegimeYears: 5, notes: "30% of salary is tax-free for 5 years for skilled migrants. Effective rate ~35% on remaining 70%. Must be hired from abroad." },
  France: { incomeTaxRate: 0.55, notes: "Progressive up to 55.4% including social charges. Among highest in world. No meaningful special expat regime for income tax." },
  Poland: { incomeTaxRate: 0.32, notes: "Progressive up to 32%. No special expat regime. Low cost of living relative to Western Europe." },
  Romania: { incomeTaxRate: 0.10, notes: "10% flat income tax — tied with Bulgaria for lowest in EU. No special expat regime needed. Low cost base." },
  Bulgaria: { incomeTaxRate: 0.10, notes: "10% flat income tax — lowest in EU. Corporate tax 10%. No wealth or inheritance tax. EU member." },
  Albania: { incomeTaxRate: 0.23, notes: "Progressive up to 23%. Low cost of living. No special expat tax regime. Growing nomad community." },
  Estonia: { incomeTaxRate: 0.20, specialRegime: "e-Residency / 0% retained earnings", specialRegimeRate: 0.00, notes: "20% personal income tax. BUT corporate tax 0% on undistributed profits — only pay when you take dividends. Popular for EU company formation." },
  Malta: { incomeTaxRate: 0.35, specialRegime: "Non-Dom", specialRegimeRate: 0.15, notes: "Non-Dom status: 15% flat tax on remitted foreign income. Non-remitted foreign income not taxed. Standard rate up to 35%." },
  Cyprus: { incomeTaxRate: 0.35, specialRegime: "Non-Dom", specialRegimeRate: 0.00, notes: "Non-Dom status: 0% tax on dividends and interest for 17 years. Capital gains on foreign assets exempt. 60-day residency rule available. Standard income rate up to 35%." },
  Switzerland: { incomeTaxRate: 0.40, notes: "Progressive up to ~40% combined federal+cantonal. Lump-sum taxation available for HNWIs not working in Switzerland. Canton varies significantly." },
  Norway: { incomeTaxRate: 0.40, notes: "Progressive up to ~39.6% + social contributions. High cost of living. Oil wealth fund but high taxes." },
  Sweden: { incomeTaxRate: 0.52, specialRegime: "Expert Tax", specialRegimeRate: 0.32, specialRegimeYears: 7, notes: "Expert/researcher/key personnel regime: 25% of salary tax-exempt for 7 years. Effective ~32% vs standard 52%. Must earn above SEK 114,100/month (~$10k)." },
  Denmark: { incomeTaxRate: 0.56, specialRegime: "Researcher Scheme", specialRegimeRate: 0.27, specialRegimeYears: 7, notes: "Researcher/key employee scheme: flat 27% tax for 7 years. Must earn above DKK 75,100/month (~$10.5k). Standard rate up to 55.9%." },
  Ireland: { incomeTaxRate: 0.48, notes: "Progressive up to 48% + USC + PRSI. No special expat regime. Remittance basis for non-doms on some foreign income." },
  Bahrain: { incomeTaxRate: 0, notes: "Zero personal income tax. No corporate income tax on most businesses. No capital gains tax. No VAT on most items." },
  Japan: { incomeTaxRate: 0.55, notes: "Progressive up to 55% combined national+local. Non-permanent residents (first 5 years): foreign income not taxed unless remitted to Japan." },
  Singapore: { incomeTaxRate: 0.22, specialRegime: "Territorial", specialRegimeRate: 0.00, notes: "Territorial tax system — foreign-sourced income not taxed. Local income taxed at progressive rates up to 22%. No capital gains tax. No inheritance tax." },
  Indonesia: { incomeTaxRate: 0.35, notes: "Progressive up to 35%. Non-residents taxed at 20% on Indonesian-source income only. No special digital nomad tax regime." },
  Vietnam: { incomeTaxRate: 0.35, notes: "Progressive up to 35%. Residents taxed on worldwide income. No special expat regime." },
  Philippines: { incomeTaxRate: 0.35, notes: "Progressive up to 35%. Special Economic Zone workers get 5% preferential rate. SRRV visa holders: foreign income not taxed." },
  Uruguay: { incomeTaxRate: 0.36, specialRegime: "Tax Holiday", specialRegimeRate: 0.00, specialRegimeYears: 11, notes: "New residents: exempt from tax on foreign income for 10 years (extendable to 11). Only Uruguay-sourced income taxed at up to 36%." },
  Argentina: { incomeTaxRate: 0.35, notes: "Progressive up to 35%. Economic instability and currency controls are key risk factors." },
  Brazil: { incomeTaxRate: 0.275, notes: "Progressive up to 27.5%. Residents taxed on worldwide income. No special expat regime." },
  Canada: { incomeTaxRate: 0.33, notes: "Federal rate up to 33% + provincial up to 21% = combined up to ~54%. No special expat regime. High social benefits in return." },
  Morocco: { incomeTaxRate: 0.38, notes: "Progressive up to 38%. Foreign pensions: 80% exemption. Growing expat community in Marrakech and Rabat." },
  Mauritius: { incomeTaxRate: 0.20, notes: "20% flat income tax. No capital gains tax. No inheritance tax. Strong offshore structures available. Premium Visa for long stays." },
  Australia: { incomeTaxRate: 0.45, notes: "Progressive up to 45% + Medicare levy 2%. Working Holiday Makers: 15% on first $45k. No special expat tax regime." },
  Belgium: { incomeTaxRate: 0.50, notes: "Progressive up to 50% + communal tax. One of the highest in EU. No special expat regime for most income." },
  Luxembourg: { incomeTaxRate: 0.46, notes: "Progressive up to 45.8%. High salaries compensate high taxes. EU finance hub." },
  Finland: { incomeTaxRate: 0.45, notes: "Progressive up to 45% (reduced from 51.5% in 2025). No special expat regime." },
  Iceland: { incomeTaxRate: 0.46, notes: "Progressive up to 46.3%. High cost of living. No special expat regime." },
  Slovakia: { incomeTaxRate: 0.35, notes: "Two brackets: 19% up to €47k, 25% above (35% top from 2025 reform). EU member. Low cost of living." },
  Slovenia: { incomeTaxRate: 0.50, notes: "Progressive up to 50%. No special expat regime. EU member." },
  Latvia: { incomeTaxRate: 0.31, notes: "Progressive up to 31%. EU member. Baltic tech hub." },
  Lithuania: { incomeTaxRate: 0.32, notes: "Progressive up to 32%. EU member. Growing startup scene in Vilnius." },
  Taiwan: { incomeTaxRate: 0.40, notes: "Progressive up to 40%. Foreign income under TWD 1M (~$31k) exempt. Gold Card visa: special tax treatment for high earners." },
  India: { incomeTaxRate: 0.30, notes: "Progressive up to 30% + surcharge. NRI status: foreign income not taxed. Returning NRIs: RNOR status for 2-3 years with partial exemptions." },
  Chile: { incomeTaxRate: 0.40, notes: "Progressive up to 40%. Territorial for first 3 years of residency — foreign income exempt. Then worldwide taxation." },
  Ecuador: { incomeTaxRate: 0.37, notes: "Progressive up to 37%. Foreign income not taxed if not remitted to Ecuador. Pensioner visa popular." },
  Egypt: { incomeTaxRate: 0.27, notes: "Progressive up to 27.5%. Residents taxed on Egypt-sourced income. Foreign income generally not taxed." },
  Kenya: { incomeTaxRate: 0.30, notes: "Progressive up to 30%. Foreign income not taxed for non-citizens. Growing tech hub (Silicon Savannah)." },
};

const ORIGIN_TAX_RATES: Record<string, number> = {
  "United Kingdom": 0.45,
  "United States": 0.37,
  "Germany": 0.475,
  "France": 0.55,
  "Netherlands": 0.495,
  "Sweden": 0.52,
  "Denmark": 0.56,
  "Norway": 0.47,
  "Finland": 0.45,
  "Belgium": 0.50,
  "Austria": 0.55,
  "Italy": 0.43,
  "Spain": 0.47,
  "Canada": 0.54,
  "Australia": 0.47,
  "Russia": 0.13,
  "Ukraine": 0.195,
  "India": 0.30,
  "China": 0.45,
  "Switzerland": 0.40,
  "Ireland": 0.48,
  "Poland": 0.32,
  "Portugal": 0.53,
  "Brazil": 0.275,
  "Argentina": 0.35,
  "Mexico": 0.35,
  "Japan": 0.55,
  "South Korea": 0.45,
  "Israel": 0.50,
  "South Africa": 0.45,
  "New Zealand": 0.39,
  "Singapore": 0.22,
  "Turkey": 0.40,
  "Romania": 0.10,
  "Bulgaria": 0.10,
  "Hungary": 0.15,
  "Czech Republic": 0.23,
  "Slovakia": 0.35,
  "Greece": 0.44,
  "Estonia": 0.20,
  "Latvia": 0.31,
  "Lithuania": 0.32,
};

type CostCalculatorProps = {
  country: string;
  familyStatus: FamilyStatus;
  monthlyIncome: number;
  citizenship?: string;
};

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));

const midpoint = (min: number, max: number) => (min + max) / 2;

const familyLabel = (status: FamilyStatus) =>
  status === "single" ? "Single" : status === "couple" ? "Couple" : "Family";

export const CostCalculator = ({ country, familyStatus, monthlyIncome, citizenship }: CostCalculatorProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string>(country);
  const [selectedFamily, setSelectedFamily] = useState<FamilyStatus>(
    (familyStatus as FamilyStatus) || "single",
  );
  const [selectedIncome, setSelectedIncome] = useState<number>(monthlyIncome || 0);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    setSelectedCountry(country);
    setSelectedFamily(((["single", "couple", "family"] as const).includes(familyStatus as FamilyStatus)
      ? familyStatus
      : "single") as FamilyStatus);
    setSelectedIncome(monthlyIncome || 0);
  }, [country, familyStatus, monthlyIncome]);

  const entry = COST_DATA[selectedCountry];

  if (!entry) {
    return (
      <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-6">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
            Estimated relocation budget
          </p>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                if (!(selectedCountry in COST_DATA)) {
                  setSelectedCountry(Object.keys(COST_DATA)[0]);
                }
              }}
              className="text-[11px] text-primary/80 hover:text-primary shrink-0"
            >
              Customize →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-[11px] text-primary/80 hover:text-primary shrink-0"
            >
              Done ✓
            </button>
          )}
        </div>
        {isEditing ? (
          <p className="text-[13px] text-foreground/85 mb-3">Customize your estimate</p>
        ) : (
          <p className="text-[13px] text-muted-foreground mb-3">
            Cost estimate not yet available for {country}. Ask your advisor for a personalized breakdown.
          </p>
        )}
        {isEditing && (
          <div className="mt-3 mb-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] space-y-3">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-full"
            >
              {Object.keys(COST_DATA).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              {(["single", "couple", "family"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFamily(f)}
                  className={
                    selectedFamily === f
                      ? "px-3 py-1.5 rounded-lg text-[12px] font-medium bg-primary/20 text-primary border border-primary/30"
                      : "px-3 py-1.5 rounded-lg text-[12px] font-medium bg-white/[0.04] text-muted-foreground border border-white/[0.06] hover:bg-white/[0.08]"
                  }
                >
                  {familyLabel(f)}
                </button>
              ))}
            </div>
            <div>
              <p className="text-[12px] text-muted-foreground mb-1">
                Monthly income: ${money(selectedIncome)}
              </p>
              <input
                type="range"
                min={500}
                max={50000}
                step={500}
                value={selectedIncome < 500 ? 500 : selectedIncome}
                onChange={(e) => setSelectedIncome(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground mt-5 leading-relaxed">
          Estimates for a comfortable single-person lifestyle. Varies by city and habits.
        </p>
      </section>
    );
  }

  const rentFactor = selectedFamily === "single" ? 1 : selectedFamily === "couple" ? 1.3 : 1.7;
  const insuranceFactor = selectedFamily === "single" ? 1 : selectedFamily === "couple" ? 1.2 : 1.6;
  const emergencyFactor = selectedFamily === "single" ? 1 : selectedFamily === "couple" ? 1.2 : 1.5;

  const visaMin = entry.visaFeeMin;
  const visaMax = entry.visaFeeMax;
  const apostilleMin = entry.apostilleAndTranslationsMin;
  const apostilleMax = entry.apostilleAndTranslationsMax;
  const rentMin = entry.rentFirstMonthMin * rentFactor;
  const rentMax = entry.rentFirstMonthMax * rentFactor;
  const insuranceMin = entry.insurance3MonthsMin * insuranceFactor;
  const insuranceMax = entry.insurance3MonthsMax * insuranceFactor;
  const emergency = entry.emergencyBuffer * emergencyFactor;

  const totalMin = visaMin + apostilleMin + rentMin + insuranceMin + emergency;
  const totalMax = visaMax + apostilleMax + rentMax + insuranceMax + emergency;
  const totalMid = midpoint(totalMin, totalMax);

  const totalMidpoint = totalMid;
  const monthsOfIncome =
    selectedIncome > 0 ? Math.round((totalMidpoint / selectedIncome) * 10) / 10 : 0;
  const affordabilityPct =
    selectedIncome > 0 ? Math.round((totalMidpoint / selectedIncome) * 100) : 0;

  let budgetMessage = "";
  let budgetColor = "";
  if (selectedIncome > 0 && entry) {
    if (monthsOfIncome <= 0.5) {
      budgetMessage = "Your monthly income covers this move 2x over. Very affordable.";
      budgetColor = "text-green-400";
    } else if (monthsOfIncome <= 1) {
      budgetMessage = "This move costs less than 1 month of your income. Comfortable.";
      budgetColor = "text-green-400";
    } else if (monthsOfIncome <= 2) {
      budgetMessage = `This move costs about ${monthsOfIncome} months of your income. Manageable.`;
      budgetColor = "text-amber-400";
    } else if (monthsOfIncome <= 3) {
      budgetMessage = `This move costs about ${monthsOfIncome} months of your income. Start saving now.`;
      budgetColor = "text-amber-400";
    } else {
      budgetMessage = `This move costs over ${monthsOfIncome} months of your income. Consider a lower-cost destination.`;
      budgetColor = "text-red-400";
    }
  }

  const taxData = TAX_DATA[selectedCountry];
  const originTaxRate = ORIGIN_TAX_RATES[citizenship || ""] ?? 0.35;
  const annualIncome = selectedIncome * 12;
  const taxInOrigin = annualIncome * originTaxRate;
  const effectiveDestRate = taxData?.specialRegimeRate ?? taxData?.incomeTaxRate ?? 0;
  const taxInDestination = annualIncome * effectiveDestRate;
  const annualSaving = Math.max(0, taxInOrigin - taxInDestination);
  const tenYearSaving = annualSaving * 10;

  return (
    <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-6">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
          Estimated relocation budget
        </p>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-[11px] text-primary/80 hover:text-primary shrink-0"
          >
            Customize →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-[11px] text-primary/80 hover:text-primary shrink-0"
          >
            Done ✓
          </button>
        )}
      </div>
      {isEditing ? (
        <p className="text-[13px] text-foreground/85 mb-3">Customize your estimate</p>
      ) : (
        <p className="text-[13px] text-foreground/85 mb-3">
          Moving to {selectedCountry} · {entry.visaType} · {familyLabel(selectedFamily)}
        </p>
      )}

      {isEditing && (
        <div className="mt-3 mb-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] space-y-3">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-full"
          >
            {Object.keys(COST_DATA).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {(["single", "couple", "family"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFamily(f)}
                className={
                  selectedFamily === f
                    ? "px-3 py-1.5 rounded-lg text-[12px] font-medium bg-primary/20 text-primary border border-primary/30"
                    : "px-3 py-1.5 rounded-lg text-[12px] font-medium bg-white/[0.04] text-muted-foreground border border-white/[0.06] hover:bg-white/[0.08]"
                }
              >
                {familyLabel(f)}
              </button>
            ))}
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground mb-1">
              Monthly income: ${money(selectedIncome)}
            </p>
            <input
              type="range"
              min={500}
              max={50000}
              step={500}
              value={selectedIncome < 500 ? 500 : selectedIncome}
              onChange={(e) => setSelectedIncome(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      )}

      <p className="text-[12px] text-muted-foreground italic mb-5">{entry.notes}</p>

      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <span className="text-[13px] text-foreground/85">Visa &amp; government fees</span>
          <div className="text-right">
            <p className="text-[13px] font-medium">${money(midpoint(visaMin, visaMax))}</p>
            <p className="text-[11px] text-muted-foreground">(${money(visaMin)}–${money(visaMax)})</p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <span className="text-[13px] text-foreground/85">Apostilles &amp; translations</span>
          <div className="text-right">
            <p className="text-[13px] font-medium">${money(midpoint(apostilleMin, apostilleMax))}</p>
            <p className="text-[11px] text-muted-foreground">(${money(apostilleMin)}–${money(apostilleMax)})</p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <span className="text-[13px] text-foreground/85">First month rent</span>
          <div className="text-right">
            <p className="text-[13px] font-medium">${money(midpoint(rentMin, rentMax))}</p>
            <p className="text-[11px] text-muted-foreground">(${money(rentMin)}–${money(rentMax)})</p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <span className="text-[13px] text-foreground/85">Health insurance (3 months)</span>
          <div className="text-right">
            <p className="text-[13px] font-medium">${money(midpoint(insuranceMin, insuranceMax))}</p>
            <p className="text-[11px] text-muted-foreground">(${money(insuranceMin)}–${money(insuranceMax)})</p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <span className="text-[13px] text-foreground/85">Emergency buffer</span>
          <div className="text-right">
            <p className="text-[13px] font-medium">${money(emergency)}</p>
          </div>
        </div>

        <div className="h-px bg-white/[0.08] my-2" />

        <div className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border-l-2 border-primary bg-primary/[0.06] px-3 py-2">
          <span className="text-[14px] font-semibold text-foreground">💰 Total estimate</span>
          <div className="text-right">
            <p className="text-[15px] font-semibold text-white">${money(totalMid)}</p>
            <p className="text-[11px] text-muted-foreground">(${money(totalMin)}–${money(totalMax)})</p>
          </div>
        </div>

        {taxData && annualSaving > 500 && (
          <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/[0.04] p-4">
            <p className="text-[11px] uppercase tracking-widest text-green-400/70 font-medium mb-3">💸 Tax savings estimate</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[11px] text-muted-foreground/60 mb-0.5">Annual saving</p>
                <p className="text-[18px] font-bold text-green-400">${money(annualSaving)}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground/60 mb-0.5">Over 10 years</p>
                <p className="text-[18px] font-bold text-green-400">${money(tenYearSaving)}</p>
              </div>
            </div>
            {taxData.specialRegime && (
              <div className="rounded-lg bg-green-500/[0.06] border border-green-500/10 px-3 py-2 mb-2">
                <p className="text-[12px] text-green-400/90 font-medium">
                  {taxData.specialRegime}: {Math.round(effectiveDestRate * 100)}% vs your current ~{Math.round(originTaxRate * 100)}%
                </p>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground/50 leading-relaxed">{taxData.notes}</p>
            <p className="text-[10px] text-muted-foreground/30 mt-2">Estimates only. Consult a tax professional for your specific situation.</p>
          </div>
        )}

        {taxData && annualSaving <= 500 && taxData.incomeTaxRate > 0 && (
          <div className="mt-4 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
            <p className="text-[11px] text-muted-foreground/50 leading-relaxed">{taxData.notes}</p>
          </div>
        )}
      </div>

      {selectedIncome > 0 && entry && (
        <div
          className="mt-4 pt-4 border-t border-white/[0.08]"
          data-affordability-pct={affordabilityPct}
        >
          <p className="text-[12px] font-medium text-foreground/90 mb-1">💡 Your budget analysis</p>
          <p className={`text-[13px] leading-relaxed ${budgetColor}`}>{budgetMessage}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            Your income: ${money(selectedIncome)}/mo · Move cost: ${money(totalMidpoint)} · Ratio:{" "}
            {monthsOfIncome} months
          </p>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground mt-5 leading-relaxed">
        Estimates for a comfortable single-person lifestyle. Varies by city and habits. Line-item totals are in USD unless noted in the country notes above. Cross-check with official sources before you budget.
      </p>
    </section>
  );
};
