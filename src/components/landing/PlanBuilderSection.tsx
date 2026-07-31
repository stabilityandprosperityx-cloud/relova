import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { allCountries } from "@/data/allCountries";
import { filterCountryList } from "@/lib/filterCountries";
import planBuilderLifestyle from "@/assets/redesign/plan-builder-lifestyle.jpg";

const goals = [
  { value: "work",        label: "Move for work" },
  { value: "remote",      label: "Remote lifestyle" },
  { value: "tax",         label: "Tax optimization" },
  { value: "citizenship", label: "Citizenship" },
];

const WHEN_OPTIONS = ["Within 3 months", "Within 6 months", "This year", "1–2 years", "Just exploring"];
const STYLE_OPTIONS = ["Budget-friendly", "Balanced (comfort & value)", "Premium comfort"];

export default function PlanBuilderSection() {
  const [budget, setBudget] = useState([50]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [citizenship, setCitizenship] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [whenToMove, setWhenToMove] = useState("Within 6 months");
  const [travelStyle, setTravelStyle] = useState("Balanced (comfort & value)");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = filterCountryList(allCountries, searchQuery);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => { searchInputRef.current?.focus(); });
      return () => cancelAnimationFrame(id);
    }
    setSearchQuery("");
  }, [open]);

  const budgetLabel =
    budget[0] < 20 ? "$1,000 – $2,000"
    : budget[0] < 40 ? "$2,000 – $3,000"
    : budget[0] < 60 ? "$3,000 – $5,000"
    : budget[0] < 80 ? "$5,000 – $10,000"
    : "$10,000+";

  return (
    <section className="py-20 md:py-28 border-t border-border/50 bg-secondary">
      <div className="container max-w-6xl px-5 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.3fr_0.7fr] gap-10 lg:gap-12 items-center">

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-4">
              Plan Builder
            </p>
            <h2 className="font-serif text-[2rem] sm:text-[2.4rem] md:text-[2.6rem] font-semibold leading-[1.1] mb-5 text-foreground">
              Build your<br />relocation plan.
            </h2>
            <p className="text-[15px] leading-[1.7] text-muted-foreground">
              Answer a few questions and get your personalized plan in seconds.
            </p>
          </motion.div>

          {/* Center — form card */}
          <motion.div
            className="rounded-2xl border border-border bg-card p-7 space-y-5"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Citizenship */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium">
                Current citizenship
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-colors hover:border-primary/40">
                    <span className={citizenship ? "text-foreground" : "text-muted-foreground"}>
                      {citizenship || "United States"}
                    </span>
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-40 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                  <div className="flex items-center border-b border-border/40 px-3">
                    <Search className="h-4 w-4 shrink-0 opacity-50 mr-2" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      name="plan-builder-citizenship"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search country..."
                      className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="max-h-[240px] overflow-y-auto overscroll-contain p-1">
                    {filteredCountries.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">No country found</p>
                    ) : (
                      filteredCountries.map((c) => (
                        <button
                          key={c}
                          onClick={() => { setCitizenship(c); setOpen(false); }}
                          className="relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                        >
                          {citizenship === c && (
                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                          {c}
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium">
                  Monthly budget (total)
                </label>
                <span className="text-[12px] text-primary font-semibold tabular-nums">{budgetLabel}</span>
              </div>
              <Slider value={budget} onValueChange={setBudget} max={100} step={1} className="py-1" />
            </div>

            {/* Two-column row: Goal + Preferred regions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium">
                  Your main goal
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {goals.slice(0, 2).map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setSelectedGoal(g.value)}
                      className={`px-3 py-2 rounded-lg border text-[12px] text-left transition-all duration-200 ${
                        selectedGoal === g.value
                          ? "border-primary/40 bg-primary/8 text-primary font-medium"
                          : "border-border text-foreground/70 hover:border-primary/30 hover:bg-primary/4"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                  {goals.slice(2).map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setSelectedGoal(g.value)}
                      className={`px-3 py-2 rounded-lg border text-[12px] text-left transition-all duration-200 ${
                        selectedGoal === g.value
                          ? "border-primary/40 bg-primary/8 text-primary font-medium"
                          : "border-border text-foreground/70 hover:border-primary/30 hover:bg-primary/4"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium">
                    Preferred regions
                  </label>
                  <Input
                    placeholder="Europe, Asia"
                    className="h-10 rounded-lg bg-background border-border text-[13px]"
                  />
                </div>

                <div className="space-y-1.5 mt-auto">
                  <label className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium">
                    When do you plan to move?
                  </label>
                  <select
                    value={whenToMove}
                    onChange={(e) => setWhenToMove(e.target.value)}
                    className="flex h-10 w-full items-center rounded-lg border border-border bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  >
                    {WHEN_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium">
                    Travel style
                  </label>
                  <select
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                    className="flex h-10 w-full items-center rounded-lg border border-border bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  >
                    {STYLE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Link to="/chat" className="block pt-1">
              <button
                className="w-full h-12 rounded-[10px] flex items-center justify-center gap-2.5 text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "hsl(var(--primary))",
                  boxShadow: "0 4px 20px hsl(var(--primary) / 0.30)",
                }}
              >
                Generate My Plan <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            </Link>
            <p className="text-center text-[11px] text-muted-foreground/50">
              Takes less than 60 seconds
            </p>
          </motion.div>

          {/* Right — lifestyle photo */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-[380px] h-[420px] overflow-hidden flex-shrink-0">
              <img loading="lazy"
                src={planBuilderLifestyle}
                alt="A couple planning their relocation journey together"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
