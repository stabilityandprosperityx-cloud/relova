import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeftRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COMPARE_LAUNCH_PAIRS,
  countryComparePath,
  shortCitizenshipLabel,
  groupGenericByCountryA,
} from "@/lib/countryComparePairs";
import { CITIZENSHIP_NAMES, DESTINATION_NAMES } from "@/lib/toolSlugs";

const CITIZENSHIP_PAIRS = COMPARE_LAUNCH_PAIRS.filter((p) => p.citizenship);
const GENERIC_GROUPS = groupGenericByCountryA(COMPARE_LAUNCH_PAIRS);
const GENERIC_COUNT = COMPARE_LAUNCH_PAIRS.length - CITIZENSHIP_PAIRS.length;

export default function CountryCompareHub() {
  const navigate = useNavigate();
  const [citizenship, setCitizenship] = useState("");
  const [countryA, setCountryA] = useState("");
  const [countryB, setCountryB] = useState("");

  const canCompare =
    !!countryA && !!countryB && countryA !== countryB;

  const handleCompare = () => {
    if (!canCompare) return;
    navigate(countryComparePath(countryA, countryB, citizenship || undefined));
  };

  const swap = () => {
    setCountryA(countryB);
    setCountryB(countryA);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Country Compare — Relova</title>
        <meta
          name="description"
          content="Compare two countries side by side — cost, safety, healthcare, visas — and optionally through the lens of your passport."
        />
      </Helmet>
      <Navbar />
      <main className="pt-28 pb-20 px-5">
        <div className="max-w-lg mx-auto">
          <h1 className="font-serif text-[1.75rem] sm:text-[2.2rem] font-semibold text-foreground tracking-tight leading-[1.15] text-center mb-3">
            Compare countries for your move
          </h1>
          <p className="text-[14px] text-muted-foreground text-center mb-10 leading-relaxed">
            Side-by-side cost, safety, healthcare, and visa pathways — with optional passport-specific
            feasibility when we have cached research for your citizenship.
          </p>

          <div className="surface-card p-6 sm:p-8 space-y-5">
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-muted-foreground">
                Your citizenship <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <Select
                value={citizenship || "__none__"}
                onValueChange={(v) => setCitizenship(v === "__none__" ? "" : v)}
              >
                <SelectTrigger className="w-full form-field h-11">
                  <SelectValue placeholder="Any / not specified" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="__none__">Any / not specified</SelectItem>
                  {CITIZENSHIP_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-medium text-muted-foreground">Country A</label>
              <Select value={countryA} onValueChange={setCountryA}>
                <SelectTrigger className="w-full form-field h-11">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {DESTINATION_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={swap}
                disabled={!countryA && !countryB}
                className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                aria-label="Swap countries"
              >
                <ArrowLeftRight size={14} /> Swap
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-medium text-muted-foreground">Country B</label>
              <Select value={countryB} onValueChange={setCountryB}>
                <SelectTrigger className="w-full form-field h-11">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {DESTINATION_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full h-11" disabled={!canCompare} onClick={handleCompare}>
              Compare
            </Button>
          </div>

        </div>

        <div className="max-w-3xl mx-auto mt-14">
          <h2 className="text-[13px] font-medium text-muted-foreground mb-3">
            Popular passport-specific comparisons ({CITIZENSHIP_PAIRS.length})
          </h2>
          <div className="flex flex-wrap gap-x-1 gap-y-1.5 text-[13px] mb-10">
            {CITIZENSHIP_PAIRS.map((pair, i) => (
              <span key={`${pair.citizenship}-${pair.countryA}-${pair.countryB}`}>
                {i > 0 && <span className="text-muted-foreground/40 mr-1">·</span>}
                <Link
                  to={countryComparePath(pair.countryA, pair.countryB, pair.citizenship)}
                  className="text-primary hover:underline"
                >
                  {shortCitizenshipLabel(pair.citizenship!)}: {pair.countryA} vs {pair.countryB}
                </Link>
              </span>
            ))}
          </div>

          <h2 className="text-[13px] font-medium text-muted-foreground mb-3">
            All country comparisons ({GENERIC_COUNT})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {GENERIC_GROUPS.map((g) => (
              <div key={g.countryA} className="text-[13px]">
                <span className="font-medium text-foreground">{g.countryA}</span>{" "}
                <span className="text-muted-foreground">vs</span>{" "}
                {g.destinations.map((d, i) => (
                  <span key={d}>
                    {i > 0 && <span className="text-muted-foreground/40">, </span>}
                    <Link to={countryComparePath(g.countryA, d)} className="text-primary hover:underline">
                      {d}
                    </Link>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
