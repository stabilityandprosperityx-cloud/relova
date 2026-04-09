import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ResultScreen from "./ResultScreen";
import { Button } from "@/components/ui/button";
import { allCountries } from "@/data/allCountries";
import { filterCountryList } from "@/lib/filterCountries";
import { toast } from "sonner";
import { matchCountries, type CountryMatch, type UserCriteria } from "@/lib/countryMatching";
import { generatePlan, generateChecklist } from "@/lib/planGenerator";
import type { UserProfile } from "@/pages/Dashboard";
import { ArrowRight, MapPin, Compass } from "lucide-react";
import LoadingTransition from "./LoadingTransition";

const SCHENGEN_VISA_REQUIRED = [
  "Russia", "China", "India", "Belarus", "Ukraine", "Kazakhstan",
  "Uzbekistan", "Tajikistan", "Kyrgyzstan", "Turkmenistan", "Armenia",
  "Azerbaijan", "Georgia", "Turkey", "Iran", "Iraq", "Syria",
  "Afghanistan", "Pakistan", "Bangladesh", "Algeria", "Morocco",
  "Tunisia", "Egypt", "Libya", "Sudan", "Ethiopia", "Nigeria",
  "Ghana", "Senegal", "Mali", "Cameroon", "DR Congo", "Angola",
  "Cuba", "Haiti", "Jamaica", "Dominican Republic",
];

const SCHENGEN_COUNTRIES = [
  "Portugal", "Spain", "France", "Germany", "Italy", "Greece",
  "Netherlands", "Belgium", "Austria", "Czech Republic", "Poland",
  "Hungary", "Croatia", "Slovakia", "Slovenia", "Estonia",
  "Latvia", "Lithuania", "Romania", "Bulgaria", "Sweden",
  "Denmark", "Finland", "Norway", "Switzerland", "Iceland",
  "Luxembourg", "Malta", "Cyprus",
];

const UK_VISA_REQUIRED = [
  "Russia", "China", "India", "Belarus", "Ukraine", "Kazakhstan",
  "Uzbekistan", "Tajikistan", "Kyrgyzstan", "Turkmenistan",
  "Iran", "Iraq", "Syria", "Afghanistan", "Pakistan",
  "Bangladesh", "Nigeria", "Ghana", "Ethiopia",
];

const goals = [
  { id: "safety", label: "🛡️ Safety" },
  { id: "money", label: "💰 Money" },
  { id: "better_life", label: "✨ Better Life" },
  { id: "freedom", label: "🕊️ Freedom" },
  { id: "family", label: "👨‍👩‍👧 Family" },
  { id: "reset", label: "🔄 Reset" },
  { id: "growth", label: "📈 Growth" },
  { id: "environment", label: "🌿 Environment" },
];

const constraintOptions = [
  { id: "language", label: "Language barrier is a problem" },
  { id: "cold_climate", label: "Cold climate is a dealbreaker" },
  { id: "close_europe", label: "Must stay close to Europe" },
  { id: "healthcare", label: "Need strong healthcare" },
  { id: "low_crime", label: "Low crime is priority" },
  { id: "fast_citizenship", label: "Need fast path to citizenship" },
];

const familyOptions = [
  { id: "single", label: "Single" },
  { id: "couple", label: "Couple" },
  { id: "family", label: "Family with kids" },
];

const timelineOptions = [
  { id: "ready_now", label: "Ready now" },
  { id: "3_6_months", label: "3-6 months" },
  { id: "within_year", label: "Within a year" },
  { id: "exploring", label: "Just exploring" },
];

type Mode = null | "know" | "help";

interface Props {
  userId: string;
  onComplete: (profile: UserProfile) => void;
}

export default function OnboardingModal({ userId, onComplete }: Props) {
  const [mode, setMode] = useState<Mode>(null);
  const [step, setStep] = useState(0);
  const [citizenship, setCitizenship] = useState("");
  const [targetCountry, setTargetCountry] = useState("");
  const [familyStatus, setFamilyStatus] = useState("single");
  const [income, setIncome] = useState(3000);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("exploring");
  const [saving, setSaving] = useState(false);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [matches, setMatches] = useState<CountryMatch[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);

  const filtered1 = filterCountryList(allCountries, search1);
  const filtered2 = filterCountryList(allCountries, search2);

  useEffect(() => {
    if (showMatches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showMatches]);

  // Mode A steps: citizenship → target → family → income → goals → timeline → save
  // Mode B steps: citizenship → family → income → goals → constraints → timeline → show matches → save
  const modeASteps = ["citizenship", "target", "family", "income", "goals", "timeline"];
  const modeBSteps = ["citizenship", "family", "income", "goals", "constraints", "timeline"];
  const currentSteps = mode === "know" ? modeASteps : modeBSteps;
  const totalSteps = currentSteps.length + (mode === "help" ? 1 : 0); // +1 for results
  const currentStepName = step < currentSteps.length ? currentSteps[step] : "results";

  const determineVisaType = (country: string): string => {
    const visaMap: Record<string, string> = {
      // EUROPE — Digital Nomad & Residence Visas
      "Portugal":        "D8_Digital_Nomad",        // D8 for remote workers (D7 for passive income)
      "Spain":           "Digital_Nomad",            // Ley de Startups Digital Nomad Visa (2023)
      "Germany":         "Freelance_Visa",           // Freiberufler visa or Job Seeker Visa
      "Italy":           "Digital_Nomad",            // Remote Worker Visa launched April 2024
      "Greece":          "Digital_Nomad",            // Digital Nomad Visa, requires €3,500/mo
      "Croatia":         "Digital_Nomad",            // Extended to 18 months as of Aug 2025
      "Czech Republic":  "Long_Term_Residence",      // Long-term residence visa / Zivno (trade license)
      "Hungary":         "White_Card",               // Guest Investor / White Card visa
      "Malta":           "Nomad_Residence_Permit",   // Nomad Residence Permit, requires €3,500/mo
      "Cyprus":          "Digital_Nomad",            // Digital Nomad Visa, requires €3,500/mo
      "Estonia":         "Digital_Nomad",            // Estonia Digital Nomad Visa (pioneer program)
      "Netherlands":     "Highly_Skilled_Migrant",   // Kennismigrant / DAFT visa
      "France":          "Talent_Passport",          // Passeport Talent for skilled workers
      "Austria":         "Red_White_Red_Card",       // Red-White-Red Card for skilled workers
      "Poland":          "Temporary_Residence",      // Temporary residence permit (karta pobytu)
      "Bulgaria":        "Digital_Nomad",            // New Digital Nomad program launched 2025
      "Serbia":          "Temporary_Residence",      // Easy temporary residence, visa-free for many
      "Montenegro":      "Temporary_Residence",      // Temporary residence permit, apply on arrival
      "Albania":         "Visa_Free",                // Visa-free up to 1 year for many nationalities
      "Switzerland":     "Work_Permit_B",            // Work permit type B (employer required)
      "Norway":          "Skilled_Worker",           // Skilled Worker Visa
      "Sweden":          "Work_Permit",              // Work permit via Migrationsverket
      "Denmark":         "Pay_Limit_Scheme",         // Pay Limit Scheme or Positive List
      "Finland":         "Work_Permit",              // Work permit (residence permit for employed)
      "Ireland":         "Critical_Skills",          // Critical Skills Employment Permit
      "Belgium":         "Single_Permit",            // Single permit for work and residence
      "Romania":         "Digital_Nomad",            // Digital Nomad Visa launched 2024
      "Slovakia":        "Temporary_Residence",      // Temporary residence permit
      "Slovenia":        "Temporary_Residence",      // Temporary residence for work/self-employment

      // MIDDLE EAST
      "UAE":             "Freelance_Permit",         // Freelance permit via free zone + residence visa
      "Turkey":          "Residence_Permit",         // Short-stay or residence permit (ikamet)
      "Israel":          "Work_Visa",                // B/2 visa → work authorization
      "Saudi Arabia":    "Work_Visa",                // Work visa (requires employer sponsorship)
      "Qatar":           "Work_Visa",                // Work visa (requires employer sponsorship)
      "Bahrain":         "Digital_Nomad",            // Digital nomad visa launched 2021

      // CAUCASUS & CENTRAL ASIA
      "Georgia":         "Visa_Free",                // Visa-free up to 1 year for 95+ countries
      "Armenia":         "Visa_Free",                // Visa-free for many nationalities
      "Kazakhstan":      "Temporary_Residence",      // Temporary residence permit
      "Uzbekistan":      "Temporary_Stay",           // Temporary stay registration

      // ASIA
      "Thailand":        "DTV",                      // Destination Thailand Visa (5yr, remote workers)
      "Bali / Indonesia":"Social_Visa",              // E33G Social/Cultural Visa or B211A
      "Indonesia":       "Social_Visa",              // E33G Social/Cultural Visa
      "Vietnam":         "E_Visa",                   // E-visa (90 days), business visa runs common
      "Malaysia":        "DE_Rantau",                // DE Rantau Nomad Pass
      "Japan":           "Digital_Nomad",            // Digital Nomad Visa launched March 2024
      "Singapore":       "Employment_Pass",          // Employment Pass or EntrePass
      "South Korea":     "Workcation_Visa",          // F-1-D Workation Visa
      "Philippines":     "Digital_Nomad",            // Official Digital Nomad Visa launched 2025
      "Taiwan":          "Gold_Card",                // Employment Gold Card (for high-skill workers)
      "Hong Kong":       "Quality_Migrant",          // Quality Migrant Admission Scheme

      // AMERICAS
      "Mexico":          "Temporary_Resident",       // Residente Temporal (1-4 years)
      "Colombia":        "Digital_Nomad",            // Nómada Digital visa, requires $900/mo
      "Brazil":          "Digital_Nomad",            // Digital Nomad Visa (1yr renewable)
      "Argentina":       "Rentista",                 // Rentista or Pensionado visa
      "Panama":          "Friendly_Nations",         // Friendly Nations Visa
      "Costa Rica":      "Rentista",                 // Rentista visa, requires $2,500/mo
      "Ecuador":         "Professional_Visa",        // Professional or Rentier visa
      "Chile":           "Temporary_Residence",      // Temporary residence visa
      "Uruguay":         "Temporary_Residence",      // Temporary residence (easy process)
      "Canada":          "Express_Entry",            // Express Entry (points-based)
      "United States":   "Work_Visa",                // H-1B or O-1 (no digital nomad visa)

      // AFRICA & ISLANDS
      "South Africa":    "Critical_Skills",          // Critical Skills Visa
      "Morocco":         "Residence_Permit",         // Residence permit (carte de séjour)
      "Mauritius":       "Premium_Visa",             // Premium Travel Visa (1yr renewable)
      "Cape Verde":      "Digital_Nomad",            // Remote Work Visa
      "Seychelles":      "Workcation",               // Workcation permit

      // PACIFIC & OTHER
      "Australia":       "Skilled_Nominated",        // Skilled Nominated visa (subclass 190)
      "New Zealand":     "Skilled_Migrant",          // Skilled Migrant Category
    };

    return visaMap[country] || "Temporary_Residence";
  };

  const handleModeB_Match = async () => {
    const criteria: UserCriteria = {
      citizenship,
      familyStatus,
      monthlyIncome: income,
      goals: selectedGoals,
      constraints: selectedConstraints,
      timeline,
    };
    const results = matchCountries(criteria);

    const top3 = results.slice(0, 3);

    // Show matches immediately with algorithm reasons (fast)
    setMatches(results);
    setShowMatches(true);

    // Then enhance with AI explanations in background
    setAiEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("match-explain", {
        body: { criteria, matches: top3 },
      });
      console.log("match-explain response:", data, error);

      if (data?.explanations) {
        setMatches(prev => prev.map(match => {
          const aiExplanation = data.explanations.find(
            (e: { country: string; reasons: string[] }) => e.country === match.country.name
          );
          if (aiExplanation) {
            return { ...match, reasons: aiExplanation.reasons };
          }
          return match;
        }));
      }
    } catch {
      // silently fail — keep algorithm reasons
    } finally {
      setAiEnhancing(false);
    }
  };

  const selectCountryFromMatch = (countryName: string, matchScore: number) => {
    setTargetCountry(countryName);
    saveProfile(countryName, matchScore);
  };

  const saveProfile = async (country?: string, matchScore?: number) => {
    setSaving(true);
    const finalCountry = country || targetCountry;
    const visaType = determineVisaType(finalCountry);

    // Generate plan and checklist
    const plan = generatePlan(finalCountry, visaType, familyStatus);
    const checklist = generateChecklist(finalCountry, visaType, familyStatus);

    const profile: UserProfile = {
      user_id: userId,
      citizenship,
      target_country: finalCountry,
      visa_type: visaType,
      goal: selectedGoals.join(","),
      monthly_budget: income,
      plan: "free",
      questions_used: 0,
      plan_expires_at: null,
      family_status: familyStatus,
      timeline,
      constraints: selectedConstraints.join(",") || null,
      match_score: matchScore || null,
      recommended_country: matches.length > 0 ? matches[0].country.name : null,
    };

    const { error } = await supabase.from("user_profiles").insert({ ...profile });
    if (error) {
      toast.error("Failed to save profile: " + error.message);
      setSaving(false);
      return;
    }

    // Insert auto-generated plan steps
    let stepNumber = 1;
    for (const phase of plan) {
      for (const s of phase.steps) {
        const { data: newStep } = await supabase
          .from("relocation_steps")
          .insert({
            visa_type: visaType,
            title: `[${phase.name}] ${s.title}`,
            description: s.description,
            step_number: stepNumber,
            estimated_days: s.estimatedDays,
          })
          .select("id")
          .single();

        if (newStep) {
          await supabase.from("user_steps").insert({
            user_id: userId,
            step_id: newStep.id,
            status: stepNumber === 1 ? "active" : "todo",
            completed_at: null,
          });
        }
        stepNumber++;
      }
    }

    // Insert auto-generated checklist documents
    for (const doc of checklist) {
      await supabase.from("visa_documents").insert({
        visa_type: visaType,
        document_name: doc.name,
        description: doc.description,
        is_required: doc.required,
      });
    }

    setPendingProfile(profile);
    setShowLoading(true);
  };

  const handleLoadingFinished = useCallback(() => {
    setShowLoading(false);
    setShowResult(true);
  }, []);

  const nextStep = () => {
    if (mode === "help" && step === currentSteps.length - 1) {
      handleModeB_Match();
      return;
    }
    if (mode === "know" && step === currentSteps.length - 1) {
      saveProfile();
      return;
    }
    setStep(step + 1);
  };

  // Loading transition screen
  if (showLoading) {
    return <LoadingTransition onFinished={handleLoadingFinished} />;
  }

  // Result screen — shown after loading, before dashboard
  if (showResult && pendingProfile) {
    return (
      <ResultScreen
        profile={pendingProfile}
        onContinue={() => onComplete(pendingProfile)}
        onSeeOtherMatches={() => {
          setShowResult(false);
          setShowLoading(false);
          setShowMatches(true);
          // Re-run matching if needed
          if (matches.length === 0) {
            const criteria = {
              citizenship,
              familyStatus,
              monthlyIncome: income,
              goals: selectedGoals,
              constraints: selectedConstraints,
              timeline,
            };
            const results = matchCountries(criteria);
            setMatches(results);
          }
        }}
      />
    );
  }

  // Mode selection screen
  if (mode === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6">
        <div className="w-full max-w-lg mx-4 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-center mb-2">Let's find your path</h2>
          <p className="text-[13px] text-[#9CA3AF] text-center mb-8">Choose how you'd like to start</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => { setMode("know"); setStep(0); }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 text-left hover:bg-white/[0.06] hover:border-[#38BDF8]/30 transition-all group"
            >
              <MapPin size={24} className="text-[#38BDF8] mb-3" />
              <div className="text-[15px] font-semibold mb-1">I know where I want to move</div>
              <div className="text-[12px] text-[#9CA3AF]">Go directly to your personalized plan</div>
            </button>
            <button
              onClick={() => { setMode("help"); setStep(0); }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 text-left hover:bg-white/[0.06] hover:border-[#38BDF8]/30 transition-all group"
            >
              <Compass size={24} className="text-[#38BDF8] mb-3" />
              <div className="text-[15px] font-semibold mb-1">Help me choose the best country</div>
              <div className="text-[12px] text-[#9CA3AF]">We'll match you based on your situation</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Country matching results (Mode B)
  if (showMatches) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
        <div className="w-full max-w-2xl mx-4 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-8">
          <h2 className="text-xl font-bold text-center mb-2">Your best matches</h2>
          {aiEnhancing && (
            <p className="text-[11px] text-[#38BDF8]/60 text-center mb-4 animate-pulse">
              ✨ Personalizing your results...
            </p>
          )}
          <p className="text-[13px] text-[#9CA3AF] text-center mb-6">Based on your profile and preferences</p>

          <div className="space-y-3">
            {matches.map((match, i) => (
              <div key={match.country.name} className={`rounded-xl border p-5 transition-all ${
                i === 0 ? "border-[#38BDF8]/30 bg-[#38BDF8]/5" : "border-white/[0.06] bg-white/[0.03]"
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{match.country.flag}</span>
                      <span className="text-[15px] font-semibold">{match.country.name}</span>
                      {i === 0 && <span className="px-2 py-0.5 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] text-[10px] font-medium">Best match</span>}
                    </div>
                    <div className="space-y-1 mb-3">
                      {match.reasons.map((r, j) => (
                        <p key={j} className="text-[12px] text-[#9CA3AF]">• {r}</p>
                      ))}
                      {SCHENGEN_VISA_REQUIRED.includes(citizenship) &&
                        SCHENGEN_COUNTRIES.includes(match.country.name) && (
                          <p className="text-[11px] text-amber-400/80 mt-1">
                            🛂 Visa required — {citizenship} passport needs Schengen visa
                          </p>
                        )}
                      {UK_VISA_REQUIRED.includes(citizenship) &&
                        match.country.name === "United Kingdom" && (
                          <p className="text-[11px] text-amber-400/80 mt-1">
                            🛂 Visa required — {citizenship} passport needs UK visa
                          </p>
                        )}
                    </div>
                    <div className="flex gap-3 flex-wrap text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[#9CA3AF]">
                        {match.country.stabilityMonths} months to stability
                      </span>
                      <span className={`px-2 py-0.5 rounded ${
                        match.difficulty === "Easy" ? "bg-green-500/10 text-green-400" :
                        match.difficulty === "Moderate" ? "bg-amber-500/10 text-amber-400" :
                        "bg-red-500/10 text-red-400"
                      }`}>
                        {match.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-red-400/60 mt-2">⚠ {match.topRisk}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-[#38BDF8]">{match.score}%</div>
                    <div className="text-[10px] text-[#9CA3AF]">match</div>
                    <Button
                      size="sm"
                      className="mt-3 text-[12px] bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white"
                      onClick={() => selectCountryFromMatch(match.country.name, match.score)}
                      disabled={saving}
                    >
                      {saving ? "..." : "Build my plan →"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setShowMatches(false); setStep(0); }}
            className="mt-4 text-[11px] text-[#9CA3AF]/60 hover:text-[#9CA3AF] transition-colors block mx-auto"
          >
            ← Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-8 max-h-[90vh] overflow-y-auto">
        {/* Progress bar */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, s) => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${s <= step ? "bg-[#38BDF8]" : "bg-white/[0.08]"}`} />
          ))}
        </div>

        {/* Step: Citizenship */}
        {currentStepName === "citizenship" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">What's your passport?</h2>
            <input
              type="text"
              name="onboarding-citizenship-search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search countries..."
              value={search1}
              onChange={(e) => setSearch1(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] placeholder:text-[#9CA3AF]/40 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50"
              autoFocus
            />
            <div className="max-h-[40vh] overflow-y-auto space-y-0.5 rounded-lg">
              {filtered1.map(c => (
                <button key={c} onClick={() => { setCitizenship(c); setStep(step + 1); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    citizenship === c ? "bg-[#38BDF8]/10 text-[#38BDF8]" : "text-[#9CA3AF] hover:bg-white/[0.04] hover:text-foreground"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Target (Mode A only) */}
        {currentStepName === "target" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Where do you want to move?</h2>
            <input
              type="text"
              name="onboarding-target-search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search countries..."
              value={search2}
              onChange={(e) => setSearch2(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] placeholder:text-[#9CA3AF]/40 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50"
              autoFocus
            />
            <div className="max-h-[40vh] overflow-y-auto space-y-0.5 rounded-lg">
              {filtered2.map(c => (
                <button key={c} onClick={() => { setTargetCountry(c); setStep(step + 1); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    targetCountry === c ? "bg-[#38BDF8]/10 text-[#38BDF8]" : "text-[#9CA3AF] hover:bg-white/[0.04] hover:text-foreground"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Family status */}
        {currentStepName === "family" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Who's moving?</h2>
            <div className="space-y-2 pt-2">
              {familyOptions.map(f => (
                <button key={f.id}
                  onClick={() => { setFamilyStatus(f.id); setStep(step + 1); }}
                  className={`w-full rounded-xl border p-4 text-[14px] font-medium text-left transition-all active:scale-[0.98] ${
                    familyStatus === f.id
                      ? "border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8]"
                      : "border-white/[0.06] bg-white/[0.03] text-[#9CA3AF] hover:text-foreground hover:bg-white/[0.05]"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Income */}
        {currentStepName === "income" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-center">Monthly income</h2>
            <div className="text-center">
              <span className="text-3xl font-bold tabular-nums">
                {income >= 50000 ? "$50,000+" : `$${income.toLocaleString()}`}
              </span>
              <span className="text-[#9CA3AF] text-sm">/mo</span>
            </div>
            <input type="range" min={0} max={50000} step={500} value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full accent-[#38BDF8]" />
            <div className="flex justify-between text-[11px] text-[#9CA3AF]">
              <span>$0</span><span>$50,000+</span>
            </div>
            <Button className="w-full h-11 bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white" onClick={nextStep}>
              Continue <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        )}

        {/* Step: Goals */}
        {currentStepName === "goals" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">What matters most?</h2>
            <p className="text-[12px] text-[#9CA3AF] text-center">Select all that apply</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {goals.map(g => (
                <button key={g.id}
                  onClick={() => setSelectedGoals(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                  className={`rounded-xl border p-4 text-[13px] font-medium text-center transition-all active:scale-[0.97] ${
                    selectedGoals.includes(g.id)
                      ? "border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8]"
                      : "border-white/[0.06] bg-white/[0.03] text-[#9CA3AF] hover:text-foreground hover:bg-white/[0.05]"
                  }`}>
                  {g.label}
                </button>
              ))}
            </div>
            <Button className="w-full h-11 bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white mt-2"
              onClick={nextStep} disabled={selectedGoals.length === 0}>
              Continue <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        )}

        {/* Step: Constraints (Mode B only) */}
        {currentStepName === "constraints" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Any dealbreakers?</h2>
            <p className="text-[12px] text-[#9CA3AF] text-center">Select all that apply, or skip</p>
            <div className="space-y-2 pt-2">
              {constraintOptions.map(c => (
                <button key={c.id}
                  onClick={() => setSelectedConstraints(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                  className={`w-full rounded-xl border p-3.5 text-[13px] font-medium text-left transition-all active:scale-[0.98] ${
                    selectedConstraints.includes(c.id)
                      ? "border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8]"
                      : "border-white/[0.06] bg-white/[0.03] text-[#9CA3AF] hover:text-foreground hover:bg-white/[0.05]"
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
            <Button className="w-full h-11 bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white mt-2" onClick={nextStep}>
              Continue <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        )}

        {/* Step: Timeline */}
        {currentStepName === "timeline" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">When are you planning to move?</h2>
            <div className="space-y-2 pt-2">
              {timelineOptions.map(t => (
                <button key={t.id}
                  onClick={async () => {
                    setTimeline(t.id);
                    if (mode === "help") {
                      const criteria: UserCriteria = {
                        citizenship,
                        familyStatus,
                        monthlyIncome: income,
                        goals: selectedGoals,
                        constraints: selectedConstraints,
                        timeline: t.id,
                      };
                      const results = matchCountries(criteria);
                      setMatches(results);
                      setShowMatches(true);

                      // Enhance top 3 with AI explanations
                      setAiEnhancing(true);
                      try {
                        const top3 = results.slice(0, 3);
                        const { data } = await supabase.functions.invoke("match-explain", {
                          body: { criteria, matches: top3 },
                        });
                        if (data?.explanations) {
                          setMatches(prev => prev.map(match => {
                            const aiExplanation = data.explanations.find(
                              (e: { country: string; reasons: string[] }) => e.country === match.country.name
                            );
                            if (aiExplanation) return { ...match, reasons: aiExplanation.reasons };
                            return match;
                          }));
                        }
                      } catch {
                        // silently fail
                      } finally {
                        setAiEnhancing(false);
                      }
                    } else {
                      saveProfile();
                    }
                  }}
                  className={`w-full rounded-xl border p-4 text-[14px] font-medium text-left transition-all active:scale-[0.98] ${
                    timeline === t.id
                      ? "border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8]"
                      : "border-white/[0.06] bg-white/[0.03] text-[#9CA3AF] hover:text-foreground hover:bg-white/[0.05]"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Back button */}
        {step > 0 && !showMatches && (
          <button onClick={() => setStep(step - 1)}
            className="mt-4 text-[11px] text-[#9CA3AF]/60 hover:text-[#9CA3AF] transition-colors block mx-auto">
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
