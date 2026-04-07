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
