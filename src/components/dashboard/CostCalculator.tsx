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
    rentFirstMonthMin: 900, rentFirstMonthMax: 1400,
    insurance3MonthsMin: 300, insurance3MonthsMax: 500,
    emergencyBuffer: 500,
    visaType: "D7 Passive Income / D8 Digital Nomad Visa",
    notes: "Visa fee: €110 consular + €41 VFS + ~€170 residence permit. Apostilles vary greatly by country. Rent: Lisbon €900–1,200, Porto €700–1,000, smaller cities cheaper."
  },
  Spain: {
    visaFeeMin: 80, visaFeeMax: 160,
    apostilleAndTranslationsMin: 500, apostilleAndTranslationsMax: 1500,
    rentFirstMonthMin: 900, rentFirstMonthMax: 1500,
    insurance3MonthsMin: 300, insurance3MonthsMax: 600,
    emergencyBuffer: 500,
    visaType: "Non-Lucrative Visa (NLV)",
    notes: "Min income required: ~€2,400/month. No remote work allowed on NLV. Sworn translations into Spanish required for all foreign documents. Rent: Madrid/Barcelona €1,200–1,800, Valencia/Seville €800–1,200."
  },
  Germany: {
    visaFeeMin: 75, visaFeeMax: 100,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 1200, rentFirstMonthMax: 2000,
    insurance3MonthsMin: 350, insurance3MonthsMax: 600,
    emergencyBuffer: 700,
    visaType: "Freelance Visa / Job Seeker Visa",
    notes: "High bureaucracy. German language strongly recommended. Rent in Munich/Frankfurt is highest in EU. Health insurance mandatory and expensive."
  },
  Greece: {
    visaFeeMin: 75, visaFeeMax: 75,
    apostilleAndTranslationsMin: 300, apostilleAndTranslationsMax: 600,
    rentFirstMonthMin: 600, rentFirstMonthMax: 1000,
    insurance3MonthsMin: 200, insurance3MonthsMax: 400,
    emergencyBuffer: 350,
    visaType: "Digital Nomad Visa",
    notes: "Requires €3,500/month income. 12-month renewable visa. Rent: Athens €700–1,100, islands more expensive in summer."
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
    rentFirstMonthMin: 800, rentFirstMonthMax: 1300,
    insurance3MonthsMin: 250, insurance3MonthsMax: 400,
    emergencyBuffer: 400,
    visaType: "Long-term Residence Visa",
    notes: "Affordable EU country. Prague has strong expat community. English widely spoken in cities. Rent: Prague €900–1,300."
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
    rentFirstMonthMin: 900, rentFirstMonthMax: 1600,
    insurance3MonthsMin: 280, insurance3MonthsMax: 500,
    emergencyBuffer: 500,
    visaType: "Elective Residency Visa",
    notes: "Slow bureaucracy. Requires passive income. Beautiful quality of life. Rent: Milan €1,200–1,800, Rome €900–1,400, southern Italy much cheaper."
  },
  UAE: {
    visaFeeMin: 1400, visaFeeMax: 3500,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 2000, rentFirstMonthMax: 4000,
    insurance3MonthsMin: 400, insurance3MonthsMax: 700,
    emergencyBuffer: 1000,
    visaType: "Freelance Permit + Residence Visa",
    notes: "Freelance permit via free zone: AED 7,500–20,000 (~$2,000–5,500). 0% income tax. High cost of living in Dubai. Rent: Dubai €2,000–4,000/month for 1BR."
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
    rentFirstMonthMin: 500, rentFirstMonthMax: 800,
    insurance3MonthsMin: 120, insurance3MonthsMax: 220,
    emergencyBuffer: 300,
    visaType: "Visa-free Stay (up to 1 year for most passports)",
    notes: "Truly visa-free for 1 year for 95+ countries. Low taxes (1% for small business). Growing expat scene. Rent: Tbilisi €500–800."
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
    rentFirstMonthMin: 400, rentFirstMonthMax: 1000,
    insurance3MonthsMin: 150, insurance3MonthsMax: 350,
    emergencyBuffer: 300,
    visaType: "DTV (Destination Thailand Visa) — 5 years",
    notes: "DTV requires ~$14,500 savings or proof of remote income. Fee varies by embassy (~$90–300). Rent: Chiang Mai €300–500, Bangkok €600–1,000, Phuket €600–1,200."
  },
  Malaysia: {
    visaFeeMin: 150, visaFeeMax: 250,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 350,
    rentFirstMonthMin: 500, rentFirstMonthMax: 1000,
    insurance3MonthsMin: 150, insurance3MonthsMax: 300,
    emergencyBuffer: 300,
    visaType: "DE Rantau Nomad Pass",
    notes: "Requires RM24,000/month (~$5,000). English widely spoken. Kuala Lumpur affordable. Rent: KL €500–900."
  },
  Mexico: {
    visaFeeMin: 56, visaFeeMax: 150,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 600,
    rentFirstMonthMin: 600, rentFirstMonthMax: 1200,
    insurance3MonthsMin: 150, insurance3MonthsMax: 350,
    emergencyBuffer: 350,
    visaType: "Temporary Residence Visa",
    notes: "Consular fee $56 USD. Residence card fee doubled in 2026: ~$600 USD/year. Popular destinations: Mexico City, Oaxaca, Playa del Carmen, Mérida. Rent varies widely."
  },
  Colombia: {
    visaFeeMin: 200, visaFeeMax: 270,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 400,
    rentFirstMonthMin: 400, rentFirstMonthMax: 900,
    insurance3MonthsMin: 120, insurance3MonthsMax: 280,
    emergencyBuffer: 280,
    visaType: "Digital Nomad Visa (Nómada Digital)",
    notes: "Requires $900/month income. Medellín top nomad city. Affordable lifestyle. Rent: Medellín €400–700, Bogotá €500–900."
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
    rentFirstMonthMin: 1100, rentFirstMonthMax: 1800,
    insurance3MonthsMin: 300, insurance3MonthsMax: 550,
    emergencyBuffer: 600,
    visaType: "Red-White-Red Card",
    notes: "German language required. Vienna rent: €1,100–1,800/mo. High quality of life. Health insurance mandatory."
  },
  Netherlands: {
    visaFeeMin: 200, visaFeeMax: 350,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 1500, rentFirstMonthMax: 2500,
    insurance3MonthsMin: 350, insurance3MonthsMax: 600,
    emergencyBuffer: 700,
    visaType: "Highly Skilled Migrant Visa",
    notes: "Amsterdam is most expensive: €1,800–2,500/mo. Rotterdam/Utrecht cheaper at €1,200–1,600/mo. Mandatory health insurance ~€150/mo."
  },
  France: {
    visaFeeMin: 99, visaFeeMax: 200,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 900,
    rentFirstMonthMin: 1000, rentFirstMonthMax: 2000,
    insurance3MonthsMin: 300, insurance3MonthsMax: 550,
    emergencyBuffer: 600,
    visaType: "Talent Passport / Long-Stay Visa",
    notes: "Paris rent: €1,400–2,200/mo. Lyon/Marseille cheaper at €800–1,200/mo. French language required for integration."
  },
  Poland: {
    visaFeeMin: 135, visaFeeMax: 200,
    apostilleAndTranslationsMin: 250, apostilleAndTranslationsMax: 500,
    rentFirstMonthMin: 700, rentFirstMonthMax: 1200,
    insurance3MonthsMin: 200, insurance3MonthsMax: 380,
    emergencyBuffer: 400,
    visaType: "Temporary Residence Permit (Karta Pobytu)",
    notes: "Warsaw rent: €800–1,200/mo. Krakow/Wroclaw cheaper at €600–900/mo. Fast-growing economy, low cost of living."
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
    rentFirstMonthMin: 700, rentFirstMonthMax: 1200,
    insurance3MonthsMin: 200, insurance3MonthsMax: 380,
    emergencyBuffer: 400,
    visaType: "Digital Nomad Visa",
    notes: "Tallinn rent: €700–1,200/mo. Pioneer digital nomad visa program. Most digital country in EU. Cold climate."
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
    rentFirstMonthMin: 800, rentFirstMonthMax: 1600,
    insurance3MonthsMin: 250, insurance3MonthsMax: 500,
    emergencyBuffer: 500,
    visaType: "Digital Nomad Visa / Highly Skilled Professional",
    notes: "Tokyo rent: €1,000–1,800/mo. Osaka/Kyoto cheaper at €700–1,200/mo. Language barrier very high. World-class safety."
  },
  Singapore: {
    visaFeeMin: 150, visaFeeMax: 300,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 2500, rentFirstMonthMax: 4000,
    insurance3MonthsMin: 400, insurance3MonthsMax: 700,
    emergencyBuffer: 1000,
    visaType: "Employment Pass / EntrePass",
    notes: "Most expensive city in Asia. Rent: €2,500–4,000/mo. English official language. World's best infrastructure. Job offer required."
  },
  "South Korea": {
    visaFeeMin: 60, visaFeeMax: 150,
    apostilleAndTranslationsMin: 350, apostilleAndTranslationsMax: 700,
    rentFirstMonthMin: 700, rentFirstMonthMax: 1400,
    insurance3MonthsMin: 200, insurance3MonthsMax: 400,
    emergencyBuffer: 450,
    visaType: "Workcation Visa / Digital Nomad Visa",
    notes: "Seoul rent: €700–1,400/mo. Blazing internet. K-culture hub. Language barrier high outside Seoul."
  },
  Indonesia: {
    visaFeeMin: 100, visaFeeMax: 200,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 350,
    rentFirstMonthMin: 500, rentFirstMonthMax: 1000,
    insurance3MonthsMin: 150, insurance3MonthsMax: 300,
    emergencyBuffer: 300,
    visaType: "Social/Cultural Visa B211A",
    notes: "Bali rent: €500–1,000/mo. Canggu/Seminyak more expensive. Healthcare limited outside Bali. Tropical lifestyle."
  },
  Vietnam: {
    visaFeeMin: 50, visaFeeMax: 100,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 300,
    rentFirstMonthMin: 400, rentFirstMonthMax: 800,
    insurance3MonthsMin: 120, insurance3MonthsMax: 250,
    emergencyBuffer: 250,
    visaType: "E-visa (90 days)",
    notes: "Ho Chi Minh/Hanoi rent: €400–800/mo. Very affordable. No long-term visa solution yet. Visa runs still common."
  },
  Philippines: {
    visaFeeMin: 50, visaFeeMax: 150,
    apostilleAndTranslationsMin: 150, apostilleAndTranslationsMax: 300,
    rentFirstMonthMin: 400, rentFirstMonthMax: 900,
    insurance3MonthsMin: 120, insurance3MonthsMax: 250,
    emergencyBuffer: 300,
    visaType: "Digital Nomad Visa (launched 2025)",
    notes: "Manila/Cebu rent: €400–900/mo. English widely spoken. New digital nomad visa launched April 2025."
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
    rentFirstMonthMin: 400, rentFirstMonthMax: 900,
    insurance3MonthsMin: 120, insurance3MonthsMax: 280,
    emergencyBuffer: 300,
    visaType: "Rentista Visa",
    notes: "Buenos Aires rent: €400–900/mo (in USD). Economic instability — use USD. 2-year path to citizenship. Vibrant culture."
  },
  Brazil: {
    visaFeeMin: 80, visaFeeMax: 180,
    apostilleAndTranslationsMin: 200, apostilleAndTranslationsMax: 450,
    rentFirstMonthMin: 500, rentFirstMonthMax: 1000,
    insurance3MonthsMin: 150, insurance3MonthsMax: 320,
    emergencyBuffer: 350,
    visaType: "Digital Nomad Visa (1 year renewable)",
    notes: "São Paulo/Rio rent: €500–1,000/mo. Florianópolis popular with nomads. Portuguese required. Safety varies by area."
  },
  Canada: {
    visaFeeMin: 150, visaFeeMax: 350,
    apostilleAndTranslationsMin: 400, apostilleAndTranslationsMax: 800,
    rentFirstMonthMin: 1500, rentFirstMonthMax: 2500,
    insurance3MonthsMin: 350, insurance3MonthsMax: 600,
    emergencyBuffer: 800,
    visaType: "Express Entry (points-based PR)",
    notes: "Toronto/Vancouver rent: €1,800–2,500/mo. Calgary/Montreal cheaper at €1,200–1,700/mo. Competitive immigration. Cold winters."
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
    rentFirstMonthMin: 1400, rentFirstMonthMax: 2500,
    insurance3MonthsMin: 350, insurance3MonthsMax: 650,
    emergencyBuffer: 800,
    visaType: "Skilled Worker Visa (subclass 189/190)",
    notes: "Sydney/Melbourne rent: €1,600–2,500/mo. Brisbane/Perth cheaper at €1,200–1,800/mo. Points-based immigration. English speaking."
  },
  "New Zealand": {
    visaFeeMin: 200, visaFeeMax: 400,
    apostilleAndTranslationsMin: 350, apostilleAndTranslationsMax: 700,
    rentFirstMonthMin: 1200, rentFirstMonthMax: 2000,
    insurance3MonthsMin: 300, insurance3MonthsMax: 550,
    emergencyBuffer: 700,
    visaType: "Skilled Migrant Category",
    notes: "Auckland rent: €1,400–2,000/mo. Wellington/Christchurch cheaper. English speaking. Beautiful nature. Points-based system."
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
    rentFirstMonthMin: 1800, rentFirstMonthMax: 4000,
    insurance3MonthsMin: 600, insurance3MonthsMax: 1500,
    emergencyBuffer: 1500,
    visaType: "H-1B / O-1 / EB-1 Work Visa",
    notes: "Most complex immigration system. H-1B requires employer + lottery. O-1 for extraordinary ability. NYC/SF rent: $2,500–4,500/mo. Austin/Miami cheaper at $1,800–2,800/mo. Health insurance NOT included in visa."
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

type CostCalculatorProps = {
  country: string;
  familyStatus: FamilyStatus;
  monthlyIncome: number;
};

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));

const midpoint = (min: number, max: number) => (min + max) / 2;

const familyLabel = (status: FamilyStatus) =>
  status === "single" ? "Single" : status === "couple" ? "Couple" : "Family";

export const CostCalculator = ({ country, familyStatus, monthlyIncome }: CostCalculatorProps) => {
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

      <p className="text-[11px] text-muted-foreground mt-5">
        ⓘ Based on verified 2025–2026 data. Costs vary by nationality, city, and individual situation. Always verify with official sources.
      </p>
    </section>
  );
};
