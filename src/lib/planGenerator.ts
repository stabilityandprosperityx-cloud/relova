// Auto-generate relocation plan based on country + visa type

export interface PlanPhase {
  name: string;
  timeframe: string;
  steps: { title: string; description: string; estimatedDays: number }[];
}

export function generatePlan(country: string, visaType: string, familyStatus: string): PlanPhase[] {
  const phases: PlanPhase[] = [];

  // Phase 1 — Entry Preparation (always)
  const entrySteps = [
    { title: "Research entry requirements", description: `Check visa requirements for ${country} based on your passport`, estimatedDays: 2 },
    { title: "Prepare travel documents", description: "Ensure passport is valid for 6+ months, get copies of important documents", estimatedDays: 3 },
    { title: "Book initial accommodation", description: "Secure temporary housing for first 2-4 weeks", estimatedDays: 3 },
    { title: "Set up finances", description: "Notify bank, get travel card, research local banking", estimatedDays: 2 },
  ];
  if (familyStatus === "family") {
    entrySteps.push({ title: "Prepare family documents", description: "Marriage certificate, birth certificates, apostilled", estimatedDays: 7 });
  }
  phases.push({ name: "Entry Preparation", timeframe: "Week 1-2", steps: entrySteps });

  // Phase 2 — Arrival & Setup
  const setupSteps = [
    { title: `Arrive in ${country}`, description: "Complete immigration, fill entry forms correctly", estimatedDays: 1 },
    { title: "Secure long-term accommodation", description: "Find and sign rental agreement", estimatedDays: 14 },
    { title: "Open local bank account", description: "Required for residency and daily life", estimatedDays: 5 },
    { title: "Get local SIM card & internet", description: "Set up phone and internet connectivity", estimatedDays: 1 },
    { title: "Register address", description: "Register with local authorities if required", estimatedDays: 3 },
  ];
  if (familyStatus === "family") {
    setupSteps.push({ title: "Research schools for children", description: "Find international or local schools, visit options", estimatedDays: 7 });
  }
  phases.push({ name: "Arrival & Setup", timeframe: "Month 1", steps: setupSteps });

  // Phase 3 — Legal Status
  const legalSteps = [
    { title: `Apply for ${visaType !== "TBD" ? visaType.replace(/_/g, " ") : "residence permit"}`, description: "Gather required documents and submit application", estimatedDays: 14 },
    { title: "Attend biometrics / interview", description: "Complete required in-person appointments", estimatedDays: 7 },
    { title: "Obtain tax identification number", description: "Register for local tax ID (NIF/TIN equivalent)", estimatedDays: 7 },
    { title: "Set up health insurance", description: "Get local health insurance or register with public system", estimatedDays: 5 },
  ];
  phases.push({ name: "Legal Status", timeframe: "Month 2-4", steps: legalSteps });

  // Phase 4 — Stability
  const stabilitySteps = [
    { title: "Receive residence permit", description: "Collect your official residence document", estimatedDays: 30 },
    { title: "Set up local tax situation", description: "Consult tax advisor, understand obligations in both countries", estimatedDays: 7 },
    { title: "Build local network", description: "Join expat communities, attend events, make connections", estimatedDays: 14 },
    { title: "Establish daily routine", description: "Gym, groceries, transport routes, local services", estimatedDays: 7 },
  ];
  if (familyStatus === "family") {
    stabilitySteps.push({ title: "Enroll children in school", description: "Complete enrollment and settle children into new school", estimatedDays: 14 });
  }
  phases.push({ name: "Stability", timeframe: "Month 4-6", steps: stabilitySteps });

  return phases;
}

export function generateChecklist(country: string, visaType: string, familyStatus: string): { name: string; required: boolean; description: string }[] {
  const docs = [
    { name: "Valid passport", required: true, description: "Must be valid for 6+ months from entry date" },
    { name: "Passport copies (2 sets)", required: true, description: "Color copies of main page and all visa stamps" },
    { name: "Passport photos (6 pcs)", required: true, description: "Biometric format, white background" },
    { name: "Proof of income", required: true, description: "Bank statements, employment contract, or freelance invoices (3-6 months)" },
    { name: "Health insurance", required: true, description: "International coverage valid in destination country" },
    { name: "Criminal background check", required: true, description: "From your country of citizenship, apostilled" },
    { name: "Proof of accommodation", required: true, description: "Rental agreement or hotel booking" },
    { name: "Bank statements", required: true, description: "Last 3-6 months showing sufficient funds" },
    { name: "Tax returns", required: false, description: "Previous year tax returns from home country" },
    { name: "CV / Resume", required: false, description: "Updated resume for work-related visas" },
  ];

  if (familyStatus === "couple" || familyStatus === "family") {
    docs.push({ name: "Marriage certificate", required: true, description: "Apostilled and translated if needed" });
  }
  if (familyStatus === "family") {
    docs.push({ name: "Birth certificates", required: true, description: "For all children, apostilled" });
    docs.push({ name: "School records", required: false, description: "Recent school transcripts for children" });
  }

  // Country-specific
  if (country === "Portugal") {
    docs.push({ name: "NIF application", required: true, description: "Portuguese tax identification number" });
    docs.push({ name: "SEF appointment confirmation", required: true, description: "Immigration service appointment" });
  } else if (country === "Spain") {
    docs.push({ name: "NIE application", required: true, description: "Spanish foreigner ID number" });
    docs.push({ name: "Padrón registration", required: true, description: "Municipal register of residents" });
  } else if (country === "UAE") {
    docs.push({ name: "Emirates ID application", required: true, description: "National ID card" });
    docs.push({ name: "Medical fitness test", required: true, description: "Required for residence visa" });
  }

  return docs;
}
