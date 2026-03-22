import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { allCountries } from "@/data/allCountries";

const goals = [
  { value: "work", label: "Move for work" },
  { value: "remote", label: "Remote lifestyle" },
  { value: "tax", label: "Tax optimization" },
  { value: "citizenship", label: "Citizenship" },
];

export default function PlanBuilderSection() {
  const [budget, setBudget] = useState([50]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [citizenship, setCitizenship] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = allCountries.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [open]);

  const budgetLabel =
    budget[0] < 20
      ? "Under $1K/mo"
      : budget[0] < 40
        ? "$1K – $3K/mo"
        : budget[0] < 60
          ? "$3K – $5K/mo"
          : budget[0] < 80
            ? "$5K – $10K/mo"
            : "$10K+/mo";

  return (
    <section className="py-[60px] md:py-[80px] border-t border-border/40">
      <div className="container">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-[13px] text-muted-foreground mb-4 uppercase tracking-wider font-medium">
            Plan builder
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Get your personalized relocation plan
          </h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-8 md:gap-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          {/* Form */}
          <div className="rounded-xl border border-border/50 bg-card p-7 md:p-10 space-y-7 shadow-[0_2px_24px_-8px_hsl(0_0%_0%/0.2)]">
            {/* Citizenship */}
            <div className="space-y-2.5">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider font-medium">
                Current citizenship
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="flex h-11 w-full items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-[14px] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <span className={citizenship ? "text-foreground" : "text-muted-foreground"}>
                      {citizenship || "Select your citizenship"}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <div className="flex items-center border-b border-border/40 px-3">
                    <Search className="h-4 w-4 shrink-0 opacity-50 mr-2" />
                    <input
                      ref={searchInputRef}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider font-medium">
                  Monthly budget
                </label>
                <span className="text-[13px] text-foreground/70 font-medium tabular-nums">
                  {budgetLabel}
                </span>
              </div>
              <Slider
                value={budget}
                onValueChange={setBudget}
                max={100}
                step={1}
                className="py-1"
              />
            </div>

            {/* Goal */}
            <div className="space-y-2.5">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider font-medium">
                Goal
              </label>
              <div className="grid grid-cols-2 gap-2">
                {goals.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setSelectedGoal(g.value)}
                    className={`px-4 py-2.5 rounded-lg border text-[13px] transition-all duration-200 active:scale-[0.97] ${
                      selectedGoal === g.value
                        ? "border-primary/40 bg-primary/10 text-primary font-medium"
                        : "border-border/50 text-foreground/70 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred regions */}
            <div className="space-y-2.5">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider font-medium">
                Preferred regions
                <span className="text-muted-foreground/40 ml-1.5 normal-case tracking-normal">(optional)</span>
              </label>
              <Input
                placeholder="e.g. Europe, Southeast Asia"
                className="h-11 rounded-lg bg-background border-border/60 text-[14px]"
              />
            </div>

            <Link to="/chat">
              <Button variant="hero" size="lg" className="w-full gap-2.5 text-[14px] h-12 rounded-[10px] mt-2">
                Build my plan <ArrowRight size={15} strokeWidth={2.5} />
              </Button>
            </Link>
          </div>

          {/* Or ask anything */}
          <div className="flex flex-col justify-center">
            <div className="rounded-xl border border-border/50 bg-card p-7 md:p-10 shadow-[0_2px_24px_-8px_hsl(0_0%_0%/0.2)]">
              <p className="text-[12px] text-muted-foreground uppercase tracking-wider font-medium mb-5">
                Or ask anything
              </p>
              <p className="text-[15px] text-foreground/70 leading-relaxed mb-8">
                Not ready to build a plan? Just ask a question — Relova will give you a structured answer.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask your question..."
                  className="h-11 rounded-lg bg-background border-border/60 text-[14px] flex-1"
                />
                <Link to="/chat">
                  <Button variant="outline" className="h-11 rounded-lg px-5">
                    <ArrowRight size={15} strokeWidth={2.5} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
