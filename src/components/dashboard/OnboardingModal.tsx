import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import ResultScreen from "./ResultScreen";
import { Button } from "@/components/ui/button";
import { allCountries } from "@/data/allCountries";
import { toast } from "sonner";
import { matchCountries, type CountryMatch, type UserCriteria } from "@/lib/countryMatching";
import { generatePlan, generateChecklist } from "@/lib/planGenerator";
import type { UserProfile } from "@/pages/Dashboard";
import { ArrowRight, MapPin, Compass } from "lucide-react";
import LoadingTransition from "./LoadingTransition";

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
  const [showLoading, setShowLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);

  const filtered1 = allCountries.filter(c => c.toLowerCase().includes(search1.toLowerCase()));
  const filtered2 = allCountries.filter(c => c.toLowerCase().includes(search2.toLowerCase()));

  // Mode A steps: citizenship → target → family → income → goals → timeline → save
  // Mode B steps: citizenship → family → income → goals → constraints → timeline → show matches → save
  const modeASteps = ["citizenship", "target", "family", "income", "goals", "timeline"];
  const modeBSteps = ["citizenship", "family", "income", "goals", "constraints", "timeline"];
  const currentSteps = mode === "know" ? modeASteps : modeBSteps;
  const totalSteps = currentSteps.length + (mode === "help" ? 1 : 0); // +1 for results
  const currentStepName = step < currentSteps.length ? currentSteps[step] : "results";

  const determineVisaType = (country: string): string => {
    if (country === "Portugal") return "D7";
    if (country === "Spain") return "Non_Lucrative";
    if (country === "UAE") return "Golden_Visa";
    if (country === "Thailand") return "LTR";
    if (country === "Georgia") return "Visa_Free";
    if (country === "Estonia") return "Digital_Nomad";
    if (country === "Mexico") return "Temporary_Resident";
    if (country === "Argentina") return "Rentista";
    if (country === "Montenegro") return "Temporary_Residence";
    if (country === "Turkey") return "Residence_Permit";
    return "TBD";
  };

  const handleModeB_Match = () => {
    const criteria: UserCriteria = {
      citizenship,
      familyStatus,
      monthlyIncome: income,
      goals: selectedGoals,
      constraints: selectedConstraints,
      timeline,
    };
    const results = matchCountries(criteria);
    setMatches(results);
    setShowMatches(true);
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
    if (pendingProfile) {
      onComplete(pendingProfile);
    }
  }, [pendingProfile, onComplete]);

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

  // Mode selection screen
  if (mode === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-lg mx-4 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-8">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-8">
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
              placeholder="Search countries..."
              value={search1}
              onChange={(e) => setSearch1(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] placeholder:text-[#9CA3AF]/40 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50"
              autoFocus
            />
            <div className="h-48 overflow-y-auto space-y-0.5 rounded-lg">
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
              placeholder="Search countries..."
              value={search2}
              onChange={(e) => setSearch2(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] placeholder:text-[#9CA3AF]/40 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50"
              autoFocus
            />
            <div className="h-48 overflow-y-auto space-y-0.5 rounded-lg">
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
                  onClick={() => {
                    setTimeline(t.id);
                    if (mode === "help") {
                      // Trigger matching
                      setTimeout(() => {
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
                      }, 100);
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
