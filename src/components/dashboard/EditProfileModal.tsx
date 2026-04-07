import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { allCountries } from "@/data/allCountries";
import { filterCountryList } from "@/lib/filterCountries";
import { toast } from "sonner";
import { X } from "lucide-react";
import { generatePlan, generateChecklist } from "@/lib/planGenerator";
import type { UserProfile } from "@/pages/Dashboard";

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

interface Props {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}

function determineVisaType(country: string): string {
  const visaMap: Record<string, string> = {
    "Portugal": "D8_Digital_Nomad",
    "Spain": "Digital_Nomad",
    "Germany": "Freelance_Visa",
    "Italy": "Digital_Nomad",
    "Greece": "Digital_Nomad",
    "Croatia": "Digital_Nomad",
    "Czech Republic": "Long_Term_Residence",
    "Hungary": "White_Card",
    "Malta": "Nomad_Residence_Permit",
    "Cyprus": "Digital_Nomad",
    "Estonia": "Digital_Nomad",
    "Netherlands": "Highly_Skilled_Migrant",
    "France": "Talent_Passport",
    "Austria": "Red_White_Red_Card",
    "Poland": "Temporary_Residence",
    "Romania": "Digital_Nomad",
    "Bulgaria": "Digital_Nomad",
    "Serbia": "Temporary_Residence",
    "Montenegro": "Temporary_Residence",
    "Albania": "Visa_Free",
    "Switzerland": "Work_Permit_B",
    "Norway": "Skilled_Worker",
    "Sweden": "Work_Permit",
    "Denmark": "Pay_Limit_Scheme",
    "Finland": "Work_Permit",
    "Ireland": "Critical_Skills",
    "UAE": "Freelance_Permit",
    "Turkey": "Residence_Permit",
    "Bahrain": "Digital_Nomad",
    "Georgia": "Visa_Free",
    "Armenia": "Visa_Free",
    "Thailand": "DTV",
    "Indonesia": "Social_Visa",
    "Vietnam": "E_Visa",
    "Malaysia": "DE_Rantau",
    "Japan": "Digital_Nomad",
    "Singapore": "Employment_Pass",
    "South Korea": "Workcation_Visa",
    "Philippines": "Digital_Nomad",
    "Mexico": "Temporary_Resident",
    "Colombia": "Digital_Nomad",
    "Brazil": "Digital_Nomad",
    "Argentina": "Rentista",
    "Panama": "Friendly_Nations",
    "Costa Rica": "Rentista",
    "Uruguay": "Temporary_Residence",
    "Canada": "Express_Entry",
    "South Africa": "Critical_Skills",
    "Morocco": "Residence_Permit",
    "Mauritius": "Premium_Visa",
    "Australia": "Skilled_Nominated",
    "New Zealand": "Skilled_Migrant",
  };
  return visaMap[country] || "Temporary_Residence";
}

export default function EditProfileModal({ profile, onSave, onClose }: Props) {
  const [citizenship, setCitizenship] = useState(profile.citizenship || "");
  const [targetCountry, setTargetCountry] = useState(profile.target_country || "");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    profile.goal ? profile.goal.split(",").filter(Boolean) : []
  );
  const [budget, setBudget] = useState(profile.monthly_budget || 5000);
  const [familyStatus, setFamilyStatus] = useState(profile.family_status || "single");
  const [timeline, setTimeline] = useState(profile.timeline || "exploring");
  const [saving, setSaving] = useState(false);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [focus1, setFocus1] = useState(false);
  const [focus2, setFocus2] = useState(false);

  const filtered1 = filterCountryList(allCountries, search1);
  const filtered2 = filterCountryList(allCountries, search2);

  const handleSave = async () => {
    if (!citizenship || !targetCountry || selectedGoals.length === 0) {
      toast.error("Please fill all fields");
      return;
    }

    setSaving(true);
    const goalStr = selectedGoals.join(",");
    const newVisaType = determineVisaType(targetCountry);
    const visaChanged = newVisaType !== profile.visa_type;

    const { error } = await supabase
      .from("user_profiles")
      .update({
        citizenship,
        target_country: targetCountry,
        goal: goalStr,
        monthly_budget: budget,
        visa_type: newVisaType,
        family_status: familyStatus,
        timeline,
      })
      .eq("user_id", profile.user_id);

    if (error) {
      toast.error("Failed to update: " + error.message);
      setSaving(false);
      return;
    }

    if (visaChanged || targetCountry !== profile.target_country) {
      // Step 1: Get all step IDs linked to this user
      const { data: oldUserSteps } = await supabase
        .from("user_steps")
        .select("step_id")
        .eq("user_id", profile.user_id);

      // Step 2: Delete user_steps first (foreign key constraint)
      await supabase.from("user_steps").delete().eq("user_id", profile.user_id);

      // Step 3: Delete the old relocation_steps that belonged to this user
      if (oldUserSteps && oldUserSteps.length > 0) {
        const stepIds = oldUserSteps.map((s: any) => s.step_id);
        await supabase.from("relocation_steps").delete().in("id", stepIds);
      }

      // Step 4: Regenerate plan
      const plan = generatePlan(targetCountry, newVisaType, familyStatus);
      let stepNumber = 1;
      for (const phase of plan) {
        for (const s of phase.steps) {
          const { data: newStep } = await supabase
            .from("relocation_steps")
            .insert({
              visa_type: newVisaType,
              title: `[${phase.name}] ${s.title}`,
              description: s.description,
              step_number: stepNumber,
              estimated_days: s.estimatedDays,
            })
            .select("id")
            .single();
          if (newStep) {
            await supabase.from("user_steps").insert({
              user_id: profile.user_id,
              step_id: newStep.id,
              status: stepNumber === 1 ? "active" : "todo",
              completed_at: null,
            });
          }
          stepNumber++;
        }
      }
    }

    const updated: UserProfile = {
      ...profile,
      citizenship,
      target_country: targetCountry,
      goal: goalStr,
      monthly_budget: budget,
      visa_type: newVisaType,
      family_status: familyStatus,
      timeline,
    };

    toast.success("Profile updated");
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9CA3AF]/60 hover:text-[#9CA3AF] transition-colors">
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-6">Edit profile</h2>

        <div className="space-y-5">
          {/* Citizenship */}
          <div className="relative">
            <label className="text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">Citizenship</label>
            <input
              type="text"
              name="edit-citizenship-search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search countries..."
              value={focus1 ? search1 : citizenship || ""}
              onFocus={() => {
                setFocus1(true);
                setSearch1(citizenship || "");
              }}
              onBlur={() => setTimeout(() => setFocus1(false), 250)}
              onChange={(e) => {
                setSearch1(e.target.value);
                setCitizenship("");
              }}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] placeholder:text-[#9CA3AF]/40 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50"
            />
            {focus1 && (
              <div className="absolute left-0 right-0 z-50 max-h-48 overflow-y-auto mt-1 rounded-lg border border-white/[0.06] bg-[#111]">
                {filtered1.length > 0 ? filtered1.map((c) => (
                  <button key={c} onMouseDown={(e) => e.preventDefault()} onClick={() => { setCitizenship(c); setSearch1(""); setFocus1(false); }}
                    className="w-full text-left px-3 py-2 text-[13px] text-[#9CA3AF] hover:bg-white/[0.04] hover:text-foreground">
                    {c}
                  </button>
                )) : (
                  <div className="px-3 py-2 text-[12px] text-[#9CA3AF]/50">No countries found</div>
                )}
              </div>
            )}
          </div>

          {/* Target country */}
          <div className="relative">
            <label className="text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">Target country</label>
            <input
              type="text"
              name="edit-target-search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search countries..."
              value={focus2 ? search2 : targetCountry || ""}
              onFocus={() => {
                setFocus2(true);
                setSearch2(targetCountry || "");
              }}
              onBlur={() => setTimeout(() => setFocus2(false), 250)}
              onChange={(e) => {
                setSearch2(e.target.value);
                setTargetCountry("");
              }}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] placeholder:text-[#9CA3AF]/40 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50"
            />
            {focus2 && (
              <div className="absolute left-0 right-0 z-50 max-h-48 overflow-y-auto mt-1 rounded-lg border border-white/[0.06] bg-[#111]">
                {filtered2.length > 0 ? filtered2.map((c) => (
                  <button key={c} onMouseDown={(e) => e.preventDefault()} onClick={() => { setTargetCountry(c); setSearch2(""); setFocus2(false); }}
                    className="w-full text-left px-3 py-2 text-[13px] text-[#9CA3AF] hover:bg-white/[0.04] hover:text-foreground">
                    {c}
                  </button>
                )) : (
                  <div className="px-3 py-2 text-[12px] text-[#9CA3AF]/50">No countries found</div>
                )}
              </div>
            )}
          </div>

          {/* Family status */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">Family status</label>
            <div className="grid grid-cols-3 gap-2">
              {familyOptions.map(f => (
                <button key={f.id} onClick={() => setFamilyStatus(f.id)}
                  className={`rounded-lg border p-2.5 text-[12px] font-medium text-center transition-all ${
                    familyStatus === f.id
                      ? "border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8]"
                      : "border-white/[0.06] bg-white/[0.03] text-[#9CA3AF] hover:text-foreground"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
              Goals <span className="normal-case tracking-normal">(select all that apply)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {goals.map(g => (
                <button key={g.id} onClick={() => {
                    setSelectedGoals(prev =>
                      prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id]
                    );
                  }}
                  className={`rounded-lg border p-2.5 text-[12px] font-medium text-center transition-all active:scale-[0.97] ${
                    selectedGoals.includes(g.id)
                      ? "border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8]"
                      : "border-white/[0.06] bg-white/[0.03] text-[#9CA3AF] hover:text-foreground hover:bg-white/[0.05]"
                  }`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">Monthly budget</label>
            <div className="text-center mb-2">
              <span className="text-xl font-bold tabular-nums">
                {budget >= 50000 ? "$50,000+" : `$${budget.toLocaleString()}`}
              </span>
              <span className="text-[#9CA3AF] text-sm">/mo</span>
            </div>
            <input type="range" min={0} max={50000} step={500} value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[#38BDF8]" />
          </div>

          {/* Timeline */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">Timeline</label>
            <div className="grid grid-cols-2 gap-2">
              {timelineOptions.map(t => (
                <button key={t.id} onClick={() => setTimeline(t.id)}
                  className={`rounded-lg border p-2.5 text-[12px] font-medium text-center transition-all ${
                    timeline === t.id
                      ? "border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8]"
                      : "border-white/[0.06] bg-white/[0.03] text-[#9CA3AF] hover:text-foreground"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full h-11 bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
