import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ResultScreen from "./ResultScreen";
import { Button } from "@/components/ui/button";
import { allCountries } from "@/data/allCountries";
import { filterCountryList } from "@/lib/filterCountries";
import { toast } from "sonner";
import {
  matchCountries,
  resolveCountryProfile,
  type CountryMatch,
  type CountryProfile,
  type UserCriteria,
} from "@/lib/countryMatching";
import { generateAndSaveUserPlan } from "@/lib/generateUserPlan";
import type { UserProfile } from "@/pages/Dashboard";
import { ArrowRight, MapPin, Compass } from "lucide-react";
import LoadingTransition from "./LoadingTransition";
import { generateEventId, trackPixelEvent } from "@/lib/metaPixel";


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
  const [selectingCountry, setSelectingCountry] = useState<string | null>(null);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [matches, setMatches] = useState<CountryMatch[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [findingDestinations, setFindingDestinations] = useState(false);
  const [citizenshipMatchFallback, setCitizenshipMatchFallback] = useState(false);
  const [retryingCitizenshipMatch, setRetryingCitizenshipMatch] = useState(false);
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

  /** Mode B: Layer 1 citizenship candidates → Layer 2 static scoring → match-explain. */
  const runModeBMatching = useCallback(async (criteria: UserCriteria, opts?: { isRetry?: boolean }) => {
    const isRetry = !!opts?.isRetry;
    if (isRetry) {
      setRetryingCitizenshipMatch(true);
    } else {
      setFindingDestinations(true);
      setShowMatches(false);
    }
    setCitizenshipMatchFallback(false);

    let pool: CountryProfile[] | undefined;
    const noteByCountry = new Map<string, string>();
    let usedFallback = false;

    try {
      const { data, error } = await supabase.functions.invoke("get-citizenship-candidates", {
        body: { citizenship_country: criteria.citizenship },
      });

      if (error || data?.source === "fallback" || !Array.isArray(data?.candidates)) {
        usedFallback = true;
      } else {
        const resolved: CountryProfile[] = [];
        for (const c of data.candidates as { country?: string; note?: string }[]) {
          if (!c?.country) continue;
          const profile = resolveCountryProfile(c.country);
          if (!profile) continue;
          if (!resolved.some((p) => p.name === profile.name)) {
            resolved.push(profile);
            if (typeof c.note === "string" && c.note.trim()) {
              noteByCountry.set(profile.name, c.note.trim());
            }
          }
        }
        if (resolved.length >= 5) {
          pool = resolved;
        } else {
          usedFallback = true;
        }
      }
    } catch (err) {
      console.error("get-citizenship-candidates invoke failed, using full database:", err);
      usedFallback = true;
    }

    const results = matchCountries(criteria, pool).map((m) => ({
      ...m,
      feasibilityNote: noteByCountry.get(m.country.name),
    }));

    setMatches(results);
    setCitizenshipMatchFallback(usedFallback);
    setFindingDestinations(false);
    setRetryingCitizenshipMatch(false);
    setShowMatches(true);

    // Enhance top 3 with AI explanations (unchanged)
    setAiEnhancing(true);
    try {
      const top3 = results.slice(0, 3);
      const { data, error } = await supabase.functions.invoke("match-explain", {
        body: { criteria, matches: top3 },
      });
      console.log("match-explain response:", data, error);

      if (data?.explanations) {
        setMatches((prev) =>
          prev.map((match) => {
            const aiExpl = data.explanations.find(
              (e: { country: string; reasons: string[]; visaRequired?: boolean; visaNote?: string }) =>
                e.country === match.country.name,
            );
            if (aiExpl) {
              return {
                ...match,
                reasons: aiExpl.reasons,
                visaRequired: aiExpl.visaRequired ?? false,
                visaNote: aiExpl.visaNote ?? "",
              };
            }
            return match;
          }),
        );
      }
    } catch {
      // silently fail — keep algorithm reasons
    } finally {
      setAiEnhancing(false);
    }
  }, []);

  const handleModeB_Match = async () => {
    await runModeBMatching({
      citizenship,
      familyStatus,
      monthlyIncome: income,
      goals: selectedGoals,
      constraints: selectedConstraints,
      timeline,
    });
  };

  const retryCitizenshipPersonalization = () => {
    void runModeBMatching(
      {
        citizenship,
        familyStatus,
        monthlyIncome: income,
        goals: selectedGoals,
        constraints: selectedConstraints,
        timeline,
      },
      { isRetry: true },
    );
  };

  const selectCountryFromMatch = (countryName: string, matchScore: number) => {
    setTargetCountry(countryName);
    setSelectingCountry(countryName);
    saveProfile(countryName, matchScore);
  };

  const saveProfile = async (country?: string, matchScore?: number) => {
    setSaving(true);

    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("plan, paddle_customer_id, paddle_subscription_id, plan_expires_at")
      .eq("user_id", userId)
      .maybeSingle();

    const preservedPlan = existingProfile?.plan && existingProfile.plan !== "free"
      ? existingProfile.plan
      : "free";

    const finalCountry = country || targetCountry;
    const visaType = determineVisaType(finalCountry);

    const profile: UserProfile = {
      user_id: userId,
      citizenship,
      target_country: finalCountry,
      visa_type: visaType,
      goal: selectedGoals.join(","),
      monthly_budget: income,
      plan: preservedPlan,
      questions_used: 0,
      plan_expires_at: existingProfile?.plan_expires_at ?? null,
      paddle_customer_id: existingProfile?.paddle_customer_id ?? null,
      paddle_subscription_id: existingProfile?.paddle_subscription_id ?? null,
      family_status: familyStatus,
      timeline,
      constraints: selectedConstraints.join(",") || null,
      match_score: matchScore || null,
      recommended_country: matches.length > 0 ? matches[0].country.name : null,
    };

    const { error } = await supabase.from("user_profiles").upsert({ ...profile }, { onConflict: "user_id" });
    if (error) {
      toast.error("Failed to save profile: " + error.message);
      setSaving(false);
      setSelectingCountry(null);
      return;
    }

    // Clear old plan + docs, then write fresh ones (shared logic with EditProfileModal)
    try {
      await generateAndSaveUserPlan(userId, citizenship, finalCountry, visaType, familyStatus);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save plan");
      setSaving(false);
      setSelectingCountry(null);
      return;
    }

    // generateAndSaveUserPlan sets documents_status='generating' in DB — include it so
    // DashboardDocuments initializes correctly instead of defaulting to 'ready'.
    setPendingProfile({ ...profile, documents_status: "generating" });
    setShowLoading(true);
  };

  const handleLoadingFinished = useCallback(() => {
    setShowLoading(false);
    setShowResult(true);
  }, []);

  const handleCompleteWithAutoInit = async () => {
    if (!pendingProfile) return;
    onComplete(pendingProfile);
  };

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
        onContinue={handleCompleteWithAutoInit}
        onSeeOtherMatches={() => {
          setSaving(false);
          setSelectingCountry(null);
          setShowResult(false);
          setShowLoading(false);
          if (matches.length > 0) {
            setShowMatches(true);
          } else {
            void runModeBMatching({
              citizenship,
              familyStatus,
              monthlyIncome: income,
              goals: selectedGoals,
              constraints: selectedConstraints,
              timeline,
            });
          }
        }}
      />
    );
  }

  // Mode selection screen
  if (mode === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-4 px-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8 my-4">
          <h2 className="text-xl font-bold text-center mb-2">Let's find your path</h2>
          <p className="text-[13px] text-muted-foreground text-center mb-8">Choose how you'd like to start</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => { setMode("know"); setStep(0); trackPixelEvent("StartQuestionnaire", generateEventId()); }}
              className="rounded-xl border border-border bg-muted/50 p-6 text-left hover:bg-muted hover:border-primary/30 transition-all group"
            >
              <MapPin size={24} className="text-primary mb-3" />
              <div className="text-[15px] font-semibold mb-1">I know where I want to move</div>
              <div className="text-[12px] text-muted-foreground">Go directly to your personalized plan</div>
            </button>
            <button
              onClick={() => { setMode("help"); setStep(0); trackPixelEvent("StartQuestionnaire", generateEventId()); }}
              className="rounded-xl border border-border bg-muted/50 p-6 text-left hover:bg-muted hover:border-primary/30 transition-all group"
            >
              <Compass size={24} className="text-primary mb-3" />
              <div className="text-[15px] font-semibold mb-1">Help me choose the best country</div>
              <div className="text-[12px] text-muted-foreground">We'll match you based on your situation</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Layer 1 loading — before matches are revealed
  if (findingDestinations) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-4 px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 my-4">
          <div className="rounded-lg border border-primary/20 bg-primary/[0.04] px-4 py-5 text-center">
            <p className="text-[13px] text-muted-foreground animate-pulse">
              Finding realistic destinations for{" "}
              {citizenship ? `${citizenship} passports` : "your passport"}…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Country matching results (Mode B)
  if (showMatches) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-4 px-4">
        <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-4 sm:p-8 my-4">
          <h2 className="text-xl font-bold text-center mb-2">Your best matches</h2>
          {aiEnhancing && (
            <p className="text-[11px] text-primary/60 text-center mb-4 animate-pulse">
              ✨ Personalizing your results...
            </p>
          )}
          {citizenshipMatchFallback && (
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-[12px] text-muted-foreground">
                Showing general matches — couldn&apos;t personalize for your passport right now.
              </p>
              <button
                type="button"
                onClick={retryCitizenshipPersonalization}
                disabled={retryingCitizenshipMatch || aiEnhancing}
                className="text-[12px] text-primary hover:underline disabled:opacity-40 shrink-0"
              >
                {retryingCitizenshipMatch ? "Retrying…" : "Retry"}
              </button>
            </div>
          )}
          <p className="text-[13px] text-muted-foreground text-center mb-6">Based on your profile and preferences</p>

          <div className="space-y-3">
            {matches.map((match, i) => (
              <div key={match.country.name} className={`rounded-xl border p-3 sm:p-5 transition-all ${
                i === 0 ? "border-primary/30 bg-primary/5" : "border-border bg-muted/50"
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{match.country.flag}</span>
                      <span className="text-[15px] font-semibold">{match.country.name}</span>
                      {i === 0 && <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-medium">Best match</span>}
                    </div>
                    <div className="space-y-1 mb-3">
                      {match.reasons.map((r, j) => (
                        <p key={j} className="text-[12px] text-muted-foreground">• {r}</p>
                      ))}
                      {match.feasibilityNote && (
                        <p className="text-[11px] text-muted-foreground/70 mt-1 line-clamp-1">
                          {match.feasibilityNote}
                        </p>
                      )}
                      {(match as CountryMatch & { visaRequired?: boolean; visaNote?: string }).visaRequired &&
                        (match as CountryMatch & { visaNote?: string }).visaNote && (
                          <p className="text-[11px] text-amber-400/80 mt-1">
                            🛂 {(match as CountryMatch & { visaNote?: string }).visaNote}
                          </p>
                        )}
                    </div>
                    <div className="flex gap-3 flex-wrap text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
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
                  <div className="text-right shrink-0 min-w-[60px]">
                    <div className="text-xl sm:text-2xl font-bold text-primary">{match.score}%</div>
                    <div className="text-[10px] text-muted-foreground">match</div>
                    <Button
                      size="sm"
                      className="mt-3 text-[12px] text-white border-0 hover:opacity-90 transition-opacity"
                      style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}
                      onClick={() => selectCountryFromMatch(match.country.name, match.score)}
                      disabled={selectingCountry === match.country.name}
                    >
                      {selectingCountry === match.country.name ? "..." : "Build my plan →"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setSaving(false); setSelectingCountry(null); setShowMatches(false); setStep(0); }}
            className="mt-4 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors block mx-auto"
          >
            ← Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-4 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 my-4">
        {/* Progress bar */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, s) => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
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
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-[13px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
              autoFocus
            />
            <div className="max-h-[40vh] overflow-y-auto space-y-0.5 rounded-lg">
              {filtered1.map(c => (
                <button key={c} onClick={() => { setCitizenship(c); setStep(step + 1); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    citizenship === c ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-[13px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
              autoFocus
            />
            <div className="max-h-[40vh] overflow-y-auto space-y-0.5 rounded-lg">
              {filtered2.map(c => (
                <button key={c} onClick={() => { setTargetCountry(c); setStep(step + 1); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    targetCountry === c ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
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
              <span className="text-muted-foreground text-sm">/mo</span>
            </div>
            <input type="range" min={0} max={50000} step={500} value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>$0</span><span>$50,000+</span>
            </div>
            <Button className="w-full h-11 text-white border-0 hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }} onClick={nextStep}>
              Continue <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        )}

        {/* Step: Goals */}
        {currentStepName === "goals" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">What matters most?</h2>
            <p className="text-[12px] text-muted-foreground text-center">Select all that apply</p>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3 pt-2">
              {goals.map(g => (
                <button key={g.id}
                  onClick={() => setSelectedGoals(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                  className={`rounded-xl border p-4 text-[13px] font-medium text-center transition-all active:scale-[0.97] ${
                    selectedGoals.includes(g.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                  {g.label}
                </button>
              ))}
            </div>
            <Button className="w-full h-11 text-white border-0 hover:opacity-90 transition-opacity mt-2"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}
              onClick={nextStep} disabled={selectedGoals.length === 0}>
              Continue <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        )}

        {/* Step: Constraints (Mode B only) */}
        {currentStepName === "constraints" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Any dealbreakers?</h2>
            <p className="text-[12px] text-muted-foreground text-center">Select all that apply, or skip</p>
            <div className="space-y-2 pt-2">
              {constraintOptions.map(c => (
                <button key={c.id}
                  onClick={() => setSelectedConstraints(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                  className={`w-full rounded-xl border p-3.5 text-[13px] font-medium text-left transition-all active:scale-[0.98] ${
                    selectedConstraints.includes(c.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
            <Button className="w-full h-11 text-white border-0 hover:opacity-90 transition-opacity mt-2"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}
              onClick={nextStep}>
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
                      void runModeBMatching({
                        citizenship,
                        familyStatus,
                        monthlyIncome: income,
                        goals: selectedGoals,
                        constraints: selectedConstraints,
                        timeline: t.id,
                      });
                    } else {
                      saveProfile();
                    }
                  }}
                  className={`w-full rounded-xl border p-4 text-[14px] font-medium text-left transition-all active:scale-[0.98] ${
                    timeline === t.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
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
            className="mt-4 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors block mx-auto">
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
