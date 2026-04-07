import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Clock } from "lucide-react";
import { countryDatabase, type CountryProfile } from "@/lib/countryMatching";
import { Button } from "@/components/ui/button";
import type { UserProfile, DashboardTab } from "@/pages/Dashboard";

export default function DashboardCountries({
  profile,
  onNavigate,
}: {
  profile: UserProfile | null;
  onNavigate?: (tab: DashboardTab) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<CountryProfile | null>(null);

  const regions = [
    { id: "all", label: "All" },
    { id: "europe", label: "Europe" },
    { id: "asia", label: "Asia" },
    { id: "americas", label: "Americas" },
    { id: "middle_east", label: "Middle East" },
  ];

  const filtered = countryDatabase.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchRegion = selectedRegion === "all" || c.region === selectedRegion;
    return matchSearch && matchRegion;
  });

  if (selectedCountry) {
    return (
      <CountryDetail
        country={selectedCountry}
        profile={profile}
        onBack={() => setSelectedCountry(null)}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Countries</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Explore relocation destinations and compare options
        </p>
      </div>

      {profile?.target_country &&
        (() => {
          const current = countryDatabase.find((c) => c.name === profile.target_country);
          if (!current) return null;
          return (
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedCountry(current);
                }
              }}
              className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 cursor-pointer hover:bg-primary/[0.07] transition-colors"
              onClick={() => setSelectedCountry(current)}
            >
              <p className="text-[11px] uppercase tracking-widest text-primary/70 font-medium mb-2">
                Your destination
              </p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{current.flag}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[15px]">{current.name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {current.topVisa} · {current.stabilityMonths} months to stability
                  </p>
                </div>
                <ArrowRight size={16} className="text-primary shrink-0" />
              </div>
            </div>
          );
        })()}

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
        <input
          type="text"
          placeholder="Search countries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-9 pr-4 py-2.5 text-[13px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {regions.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelectedRegion(r.id)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              selectedRegion === r.id
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-white/[0.04] text-muted-foreground border border-white/[0.06] hover:bg-white/[0.08]"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((country, i) => {
          const isUserCountry = country.name === profile?.target_country;
          const riskColor =
            country.crimeLevel === "low" && country.visaEase !== "hard"
              ? "text-green-400"
              : country.crimeLevel === "high" || country.visaEase === "hard"
                ? "text-red-400"
                : "text-amber-400";
          const riskLabel =
            country.crimeLevel === "low" && country.visaEase !== "hard"
              ? "Low"
              : country.crimeLevel === "high" || country.visaEase === "hard"
                ? "High"
                : "Medium";

          return (
            <motion.div
              key={country.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              onClick={() => setSelectedCountry(country)}
              className={`rounded-xl border p-4 cursor-pointer transition-all hover:bg-white/[0.05] ${
                isUserCountry
                  ? "border-primary/30 bg-primary/[0.04]"
                  : "border-white/[0.06] bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[14px]">{country.name}</p>
                    {isUserCountry && (
                      <span className="text-[9px] uppercase tracking-wider text-primary font-medium">
                        Your pick
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">{country.topVisa}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock size={10} /> {country.stabilityMonths} mo
                    </span>
                    <span className={`text-[11px] font-medium ${riskColor}`}>{riskLabel} risk</span>
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {country.costLevel} cost
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {`No countries found for "${search}"`}
        </div>
      )}
    </div>
  );
}

function CountryDetail({
  country,
  profile: _profile,
  onBack,
  onNavigate,
}: {
  country: CountryProfile;
  profile: UserProfile | null;
  onBack: () => void;
  onNavigate?: (tab: DashboardTab) => void;
}) {
  const riskColor =
    country.crimeLevel === "low" && country.visaEase !== "hard"
      ? "text-green-400"
      : country.crimeLevel === "high" || country.visaEase === "hard"
        ? "text-red-400"
        : "text-amber-400";
  const riskLabel =
    country.crimeLevel === "low" && country.visaEase !== "hard"
      ? "Low"
      : country.crimeLevel === "high" || country.visaEase === "hard"
        ? "High"
        : "Medium";

  const citizenshipLabel =
    country.citizenshipYears != null ? `${country.citizenshipYears} years` : "No path";

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to countries
      </button>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-7">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{country.flag}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{country.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{country.topVisa}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="rounded-lg bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Stability</p>
            <p className="font-bold">{country.stabilityMonths} mo</p>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Risk</p>
            <p className={`font-bold ${riskColor}`}>{riskLabel}</p>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Cost level</p>
            <p className="font-bold capitalize">{country.costLevel}</p>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Citizenship</p>
            <p className="font-bold">{citizenshipLabel}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
          Best for
        </p>
        <div className="flex flex-wrap gap-2">
          {country.bestFor.map((goal) => (
            <span
              key={goal}
              className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-medium capitalize"
            >
              {goal.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
          ⚠ Risks & considerations
        </p>
        <div className="space-y-2">
          {country.risks.map((risk, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-1.5 shrink-0" />
              <p className="text-[13px] text-muted-foreground">{risk}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-[14px]">Want to move to {country.name}?</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Ask your advisor for a personalized plan
          </p>
        </div>
        <Button onClick={() => onNavigate?.("chat")} className="shrink-0">
          Ask Advisor <ArrowRight size={14} className="ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
