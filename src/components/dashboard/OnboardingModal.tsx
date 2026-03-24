import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { allCountries } from "@/data/allCountries";
import { toast } from "sonner";
import type { UserProfile } from "@/pages/Dashboard";

const goals = [
  { id: "safety", label: "Safety" },
  { id: "money", label: "Money" },
  { id: "better_life", label: "Better Life" },
  { id: "freedom", label: "Freedom" },
  { id: "family", label: "Family" },
  { id: "reset", label: "Reset" },
  { id: "growth", label: "Growth" },
  { id: "environment", label: "Environment" },
];

interface Props {
  userId: string;
  onComplete: (profile: UserProfile) => void;
}

export default function OnboardingModal({ userId, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [citizenship, setCitizenship] = useState("");
  const [targetCountry, setTargetCountry] = useState("");
  const [goal, setGoal] = useState("");
  const [budget, setBudget] = useState(5000);
  const [saving, setSaving] = useState(false);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");

  const filteredCountries1 = allCountries.filter(c => c.toLowerCase().includes(search1.toLowerCase()));
  const filteredCountries2 = allCountries.filter(c => c.toLowerCase().includes(search2.toLowerCase()));

  const determineVisaType = (country: string, _userGoal: string): string => {
    // Return null/TBD — visa type should be determined by AI or user later
    // Only set specific visa types for countries we have data for
    if (country === "Portugal") return "D7";
    if (country === "Spain") return "Non_Lucrative";
    if (country === "UAE") return "Golden_Visa";
    if (country === "Thailand") return "LTR";
    return "TBD";
  };

  const handleSave = async () => {
    setSaving(true);
    const visaType = determineVisaType(targetCountry, goal);

    const profile: UserProfile = {
      user_id: userId,
      citizenship,
      target_country: targetCountry,
      visa_type: visaType,
      goal,
      monthly_budget: budget,
      plan: "free",
      questions_used: 0,
      plan_expires_at: null,
    };

    // 1. Save profile
    const { error } = await supabase.from("user_profiles").insert({ ...profile });
    if (error) {
      toast.error("Failed to save profile: " + error.message);
      setSaving(false);
      return;
    }

    // 2. Fetch relocation_steps template for this visa type
    const { data: templateSteps } = await supabase
      .from("relocation_steps")
      .select("id, step_number")
      .eq("visa_type", visaType)
      .order("step_number");

    if (templateSteps && templateSteps.length > 0) {
      // 3. Create user_steps for each template step
      const userStepsToInsert = templateSteps.map((s: any, i: number) => ({
        user_id: userId,
        step_id: s.id,
        status: i === 0 ? "active" : "todo", // first step is active
        completed_at: null,
      }));

      const { error: stepsError } = await supabase
        .from("user_steps")
        .insert(userStepsToInsert);

      if (stepsError) {
        console.error("Failed to populate steps:", stepsError.message);
        // Non-blocking — profile is saved, steps can be retried
      }
    }

    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${s <= step ? "bg-[#38BDF8]" : "bg-white/[0.08]"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">What's your current citizenship?</h2>
            <input
              placeholder="Search countries..."
              value={search1}
              onChange={(e) => setSearch1(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] placeholder:text-[#9CA3AF]/40 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50"
              autoFocus
            />
            <div className="h-48 overflow-y-auto space-y-0.5 rounded-lg">
              {filteredCountries1.map(c => (
                <button
                  key={c}
                  onClick={() => { setCitizenship(c); setStep(2); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    citizenship === c ? "bg-[#38BDF8]/10 text-[#38BDF8]" : "text-[#9CA3AF] hover:bg-white/[0.04] hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
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
              {filteredCountries2.map(c => (
                <button
                  key={c}
                  onClick={() => { setTargetCountry(c); setStep(3); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    targetCountry === c ? "bg-[#38BDF8]/10 text-[#38BDF8]" : "text-[#9CA3AF] hover:bg-white/[0.04] hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">What's your main goal?</h2>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {goals.map(g => (
                <button
                  key={g.id}
                  onClick={() => { setGoal(g.id); setStep(4); }}
                  className={`rounded-xl border p-4 text-[13px] font-medium text-center transition-all active:scale-[0.97] ${
                    goal === g.id
                      ? "border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8]"
                      : "border-white/[0.06] bg-white/[0.03] text-[#9CA3AF] hover:text-foreground hover:bg-white/[0.05]"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-center">What's your monthly budget?</h2>
            <div className="text-center">
              <span className="text-3xl font-bold tabular-nums">${budget.toLocaleString()}</span>
              <span className="text-[#9CA3AF] text-sm">/mo</span>
            </div>
            <input
              type="range"
              min={1000}
              max={20000}
              step={500}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[#38BDF8]"
            />
            <div className="flex justify-between text-[11px] text-[#9CA3AF]">
              <span>$1,000</span>
              <span>$20,000</span>
            </div>
            <Button
              className="w-full h-11 bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Get my plan →"}
            </Button>
          </div>
        )}

        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-4 text-[11px] text-[#9CA3AF]/60 hover:text-[#9CA3AF] transition-colors block mx-auto"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
