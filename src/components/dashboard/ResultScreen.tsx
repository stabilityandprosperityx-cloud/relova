import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import type { UserProfile } from "@/pages/Dashboard";
import { countryDatabase } from "@/lib/countryMatching";

interface Props {
  profile: UserProfile;
  onContinue: () => void;
  onSeeOtherMatches: () => void;
}

function getCountryFlag(name: string): string {
  return countryDatabase.find((c) => c.name === name)?.flag || "🌍";
}

function getStabilityMonths(name: string): string {
  return countryDatabase.find((c) => c.name === name)?.stabilityMonths || "3-6";
}

function generateReasons(profile: UserProfile): string[] {
  const reasons: string[] = [];
  const country = countryDatabase.find((c) => c.name === profile.target_country);

  if (profile.monthly_budget && country) {
    if (country.costLevel === "low") reasons.push("Fits your income — affordable cost of living");
    else if (country.costLevel === "medium") reasons.push("Comfortable for your budget level");
    else reasons.push("Premium destination within your reach");
  }

  const goals = profile.goal?.split(",") || [];
  if (goals.length > 0 && country) {
    const overlap = goals.filter((g) => country.bestFor.includes(g));
    if (overlap.length > 0) reasons.push("Matches your top goals");
  }

  if (country) {
    if (country.visaEase === "easy") reasons.push("Easier entry path available");
    else if (country.visaEase === "moderate") reasons.push("Clear visa pathway exists");

    if (country.citizenshipYears) reasons.push(`Path to citizenship in ${country.citizenshipYears} years`);
    if (country.safetyScore >= 8) reasons.push("High safety and stability");
    if (country.healthcareQuality >= 8) reasons.push("Strong healthcare system");
  }

  // Fallbacks
  if (reasons.length < 2) reasons.push("Strong fit for your profile");
  if (reasons.length < 3) reasons.push("Realistic timeline for relocation");

  return reasons.slice(0, 3);
}

function getWhyItFits(profile: UserProfile): string {
  const country = countryDatabase.find((c) => c.name === profile.target_country);
  if (!country) return "This country aligns well with your goals and budget.";

  const goals = profile.goal?.split(",") || [];
  const goalLabels: Record<string, string> = {
    safety: "safety", money: "financial goals", better_life: "quality of life",
    freedom: "personal freedom", family: "family needs", reset: "fresh start",
    growth: "career growth", environment: "lifestyle",
  };
  const matched = goals.filter((g) => country.bestFor.includes(g)).map((g) => goalLabels[g] || g);

  if (matched.length > 0) {
    return `Based on your profile, ${country.name} offers a strong combination of ${matched.slice(0, 2).join(" and ")} with a realistic path to residency.`;
  }
  return `${country.name} is a strong match for your situation — balancing accessibility, cost, and quality of life.`;
}

export default function ResultScreen({ profile, onContinue, onSeeOtherMatches }: Props) {
  const country = profile.target_country || "Your match";
  const flag = getCountryFlag(country);
  const score = profile.match_score || 85;
  const stability = getStabilityMonths(country);
  const reasons = generateReasons(profile);
  const whyText = getWhyItFits(profile);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0b]"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md mx-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm"
      >
        {/* Header */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[12px] uppercase tracking-[0.15em] text-[#38BDF8] font-medium text-center mb-6"
        >
          We found your best path
        </motion.p>

        {/* Country + Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-6"
        >
          <div className="text-4xl mb-2">{flag}</div>
          <h2 className="text-[22px] font-bold text-[#EDEDED] tracking-tight">{country}</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/20">
              <Star size={13} className="text-[#38BDF8] fill-[#38BDF8]" />
              <span className="text-[14px] font-bold text-[#38BDF8]">{score}%</span>
              <span className="text-[11px] text-[#38BDF8]/70">match</span>
            </div>
          </div>
        </motion.div>

        {/* Why it fits */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-6"
        >
          <p className="text-[12px] text-[#9CA3AF] leading-relaxed text-center">{whyText}</p>
        </motion.div>

        {/* Key reasons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="space-y-2.5 mb-6"
        >
          {reasons.map((reason, i) => (
            <motion.div
              key={reason}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]"
            >
              <span className="text-[#38BDF8] text-[11px]">✓</span>
              <span className="text-[13px] text-[#EDEDED]/90">{reason}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Time to stability */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
          className="text-center mb-8 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
        >
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#9CA3AF]/60 mb-1">Estimated time to stability</p>
          <p className="text-[16px] font-semibold text-[#EDEDED]">{stability} months</p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
          className="space-y-3"
        >
          <Button
            className="w-full h-12 bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white font-semibold text-[14px]"
            onClick={onContinue}
          >
            See my plan <ArrowRight size={15} className="ml-1" />
          </Button>
          <button
            onClick={onSeeOtherMatches}
            className="w-full text-center text-[12px] text-[#9CA3AF]/60 hover:text-[#9CA3AF] transition-colors py-2"
          >
            See other matches
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
