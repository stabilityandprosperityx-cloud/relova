import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthModal from "@/components/auth/AuthModal";
import {
  getTaxResidencyRule,
  simpleDayStatus,
  type DayStatus,
} from "@/lib/taxResidencyRules";
import { DESTINATION_NAMES } from "@/lib/toolSlugs";

const STORAGE_KEY = "relova_tax_residency_trips_v1";

interface Trip {
  id: string;
  country: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
}

type ViewMode = "calendar" | "rolling";

function parseYmd(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Inclusive day count for an overlap between [tripStart, tripEnd] and [winStart, winEnd]. */
function overlapDays(
  tripStart: Date,
  tripEnd: Date,
  winStart: Date,
  winEnd: Date,
): number {
  const start = tripStart > winStart ? tripStart : winStart;
  const end = tripEnd < winEnd ? tripEnd : winEnd;
  if (end < start) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
}

function daysInCalendarYear(trips: Trip[], country: string, year: number): number {
  const winStart = new Date(year, 0, 1);
  const winEnd = new Date(year, 11, 31);
  let total = 0;
  for (const t of trips) {
    if (t.country !== country) continue;
    const a = parseYmd(t.startDate);
    const b = parseYmd(t.endDate);
    if (!a || !b || b < a) continue;
    total += overlapDays(a, b, winStart, winEnd);
  }
  return total;
}

function daysInRolling12(trips: Trip[], country: string, asOf: Date): number {
  const end = startOfDay(asOf);
  const start = addDays(end, -364); // inclusive 365-day window ending today
  let total = 0;
  for (const t of trips) {
    if (t.country !== country) continue;
    const a = parseYmd(t.startDate);
    const b = parseYmd(t.endDate);
    if (!a || !b || b < a) continue;
    total += overlapDays(a, b, start, end);
  }
  return total;
}

function statusChip(status: DayStatus) {
  if (status === "exceeded") {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-medium">
        Exceeded 183
      </span>
    );
  }
  if (status === "approaching") {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-medium">
        Approaching
      </span>
    );
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
      Under threshold
    </span>
  );
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is Trip =>
        t &&
        typeof t.id === "string" &&
        typeof t.country === "string" &&
        typeof t.startDate === "string" &&
        typeof t.endDate === "string",
    );
  } catch {
    return [];
  }
}

export default function TaxResidencyTracker() {
  const currentYear = new Date().getFullYear();
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips());
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [year, setYear] = useState(currentYear);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [formError, setFormError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  // Client-only persistence — never synced to any server
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch {
      /* ignore */
    }
  }, [trips]);

  const yearOptions = useMemo(() => {
    const years = new Set<number>([currentYear, currentYear - 1, currentYear - 2]);
    for (const t of trips) {
      const a = parseYmd(t.startDate);
      const b = parseYmd(t.endDate);
      if (a) years.add(a.getFullYear());
      if (b) years.add(b.getFullYear());
    }
    return [...years].sort((x, y) => y - x);
  }, [trips, currentYear]);

  const countriesInTrips = useMemo(() => {
    const set = new Set(trips.map((t) => t.country));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [trips]);

  const summary = useMemo(() => {
    const today = startOfDay(new Date());
    return countriesInTrips.map((c) => {
      const rule = getTaxResidencyRule(c);
      const calendarDays = daysInCalendarYear(trips, c, year);
      const rollingDays = daysInRolling12(trips, c, today);
      return {
        country: c,
        rule,
        calendarDays,
        rollingDays,
        status: rule.tier === "simple_183" ? simpleDayStatus(calendarDays) : null,
      };
    });
  }, [countriesInTrips, trips, year]);

  const sortedTrips = useMemo(
    () =>
      [...trips].sort((a, b) => {
        if (a.startDate === b.startDate) return b.endDate.localeCompare(a.endDate);
        return b.startDate.localeCompare(a.startDate);
      }),
    [trips],
  );

  const resetForm = () => {
    setCountry("");
    setStartDate("");
    setEndDate("");
    setEditingId(null);
    setFormError("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!country || !startDate || !endDate) {
      setFormError("Country, start date, and end date are required.");
      return;
    }
    const a = parseYmd(startDate);
    const b = parseYmd(endDate);
    if (!a || !b) {
      setFormError("Use valid dates (YYYY-MM-DD).");
      return;
    }
    if (b < a) {
      setFormError("End date must be on or after the start date.");
      return;
    }
    if (editingId) {
      setTrips((prev) =>
        prev.map((t) =>
          t.id === editingId ? { ...t, country, startDate, endDate } : t,
        ),
      );
    } else {
      setTrips((prev) => [...prev, { id: newId(), country, startDate, endDate }]);
    }
    resetForm();
  };

  const startEdit = (t: Trip) => {
    setEditingId(t.id);
    setCountry(t.country);
    setStartDate(t.startDate);
    setEndDate(t.endDate);
    setFormError("");
  };

  const removeTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>183-Day Tax Residency Tracker — Relova</title>
        <meta
          name="description"
          content="Free tax residency day tracker. Log stays by country and see how close you are to common 183-day thresholds. Awareness only — not a tax determination. Your data stays in your browser."
        />
        <meta property="og:title" content="183-Day Tax Residency Tracker — Relova" />
        <meta
          property="og:description"
          content="Free tax residency day tracker. Log stays by country and see how close you are to common 183-day thresholds. Awareness only — not a tax determination."
        />
      </Helmet>
      <Navbar />
      <main className="pt-28 pb-20 px-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-[1.75rem] sm:text-[2.2rem] font-semibold text-foreground tracking-tight leading-[1.15] mb-3">
            Track days toward tax residency (183-day rule)
          </h1>
          <p className="text-[14px] text-muted-foreground mb-3 leading-relaxed">
            Log stays by country and see how your day counts stack up against common tax-residency
            awareness thresholds. This is for tracking only — not a residency determination.
          </p>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 mb-3 text-[13px] text-foreground leading-relaxed">
            <p className="font-medium mb-1">Tax residency ≠ visa stay limits</p>
            <p className="text-muted-foreground">
              This tool is about <strong className="text-foreground font-medium">tax residency</strong>{" "}
              day counts (commonly framed around ~183 days). It is{" "}
              <strong className="text-foreground font-medium">not</strong> the Schengen 90/180
              short-stay visa rule, which governs entry permission for visitors — a completely
              separate concept.
            </p>
          </div>
          <p className="text-[12px] text-primary/90 font-medium mb-8">
            Your trip history stays in your browser — nothing is sent to our servers.
          </p>

          {/* Add / edit trip */}
          <form onSubmit={handleSubmit} className="surface-card p-5 sm:p-6 space-y-4 mb-8">
            <h2 className="text-[13px] font-semibold text-foreground">
              {editingId ? "Edit trip" : "Add a trip"}
            </h2>
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-muted-foreground">Country</label>
              <Select value={country || undefined} onValueChange={setCountry}>
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
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-muted-foreground">Start date</label>
                <Input
                  type="date"
                  autoComplete="off"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-field h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-muted-foreground">End date</label>
                <Input
                  type="date"
                  autoComplete="off"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-field h-11"
                />
              </div>
            </div>
            {formError && (
              <p className="text-[12px] text-red-600 dark:text-red-400">{formError}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="h-10">
                <Plus size={14} className="mr-1.5" />
                {editingId ? "Save changes" : "Add trip"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" className="h-10" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>

          {/* Summary controls */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
            <div className="space-y-2 flex-1">
              <label className="text-[12px] font-medium text-muted-foreground">
                Calendar year
              </label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="form-field h-10 w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex rounded-lg border border-border p-0.5 bg-muted/30">
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1.5 text-[12px] rounded-md transition-colors ${
                  viewMode === "calendar"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Calendar year
              </button>
              <button
                type="button"
                onClick={() => setViewMode("rolling")}
                className={`px-3 py-1.5 text-[12px] rounded-md transition-colors ${
                  viewMode === "rolling"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Rolling 12 months
              </button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">
            {viewMode === "calendar"
              ? `Primary view: days present in calendar year ${year}. Some countries use any 12-month period instead — use the rolling toggle for awareness.`
              : "Rolling view: days in the last 365 days ending today. Use alongside calendar year — country codes differ on which framing they use."}
          </p>

          {/* Summary table */}
          <div className="rounded-2xl border border-border overflow-hidden mb-8">
            {summary.length === 0 ? (
              <p className="p-6 text-[13px] text-muted-foreground text-center">
                No trips yet — add a stay above to see day counts by country.
              </p>
            ) : (
              <div className="divide-y divide-border">
                <div
                  className="hidden sm:grid gap-2 px-4 py-2.5 bg-muted/30 text-[11px] font-medium text-muted-foreground"
                  style={{ gridTemplateColumns: "1.2fr 0.7fr 0.7fr 1fr" }}
                >
                  <span>Country</span>
                  <span>Calendar {year}</span>
                  <span>Rolling 12 mo</span>
                  <span>Status</span>
                </div>
                {summary.map((row) => {
                  const primary =
                    viewMode === "calendar" ? row.calendarDays : row.rollingDays;
                  return (
                    <div
                      key={row.country}
                      className="grid gap-2 px-4 py-3 sm:items-center"
                      style={{ gridTemplateColumns: "1.2fr 0.7fr 0.7fr 1fr" }}
                    >
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{row.country}</p>
                        {row.rule.tier === "complex" && (
                          <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                            {row.rule.note}
                          </p>
                        )}
                      </div>
                      <div className="text-[13px]">
                        <span className="sm:hidden text-[11px] text-muted-foreground mr-1">
                          {year}:
                        </span>
                        <span className={viewMode === "calendar" ? "font-semibold" : ""}>
                          {row.calendarDays}d
                        </span>
                      </div>
                      <div className="text-[13px]">
                        <span className="sm:hidden text-[11px] text-muted-foreground mr-1">
                          Rolling:
                        </span>
                        <span className={viewMode === "rolling" ? "font-semibold" : ""}>
                          {row.rollingDays}d
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {row.rule.tier === "complex" ? (
                          <span className="inline-flex px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-medium">
                            Complex residency test
                          </span>
                        ) : (
                          statusChip(
                            viewMode === "calendar"
                              ? row.status!
                              : simpleDayStatus(primary),
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trip list */}
          <div className="mb-10">
            <h2 className="text-[13px] font-semibold text-foreground mb-3">Your trips</h2>
            {sortedTrips.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No trips saved yet.</p>
            ) : (
              <ul className="space-y-2">
                {sortedTrips.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate">
                        {t.country}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {t.startDate} → {t.endDate}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Edit trip"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTrip(t.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                        aria-label="Delete trip"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Disclaimer */}
          <div className="text-[11px] text-muted-foreground/70 mb-8 leading-relaxed space-y-2">
            <p>
              <strong className="text-muted-foreground font-medium">Not tax advice.</strong> This
              tool counts days of physical presence for awareness only. It does{" "}
              <strong className="text-muted-foreground font-medium">not</strong> determine tax
              residency.
            </p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>
                It does not apply domicile, center-of-vital-interests, habitual abode / registered
                address, or dual-residency tie-breaker rules under tax treaties.
              </li>
              <li>
                Country rules differ: some use a calendar year, some any 12-month period, and some
                (e.g. UK, US, Germany, France, Canada) use multi-factor or weighted tests — a day
                total alone is not enough.
              </li>
              <li>
                This is not the Schengen 90/180 short-stay visa rule (entry permission). Tax
                residency and visa stay limits are separate.
              </li>
              <li>
                Verify with a qualified tax professional and official guidance before making
                decisions.
              </li>
            </ul>
          </div>

          <div className="surface-card p-6 sm:p-8 border-primary/20">
            <p className="font-serif text-lg font-semibold text-foreground mb-2">
              Planning a move — and the tax side that comes with it?
            </p>
            <p className="text-[13px] text-muted-foreground mb-5">
              Create a free account for a personalized relocation plan. Tax residency still needs a
              professional; Relova helps with the broader move.
            </p>
            <Button onClick={() => setAuthOpen(true)}>Get my relocation plan</Button>
          </div>

          <p className="text-[13px] text-muted-foreground mt-8">
            Comparing destinations?{" "}
            <Link to="/tools/country-compare" className="text-primary hover:underline">
              Country Compare →
            </Link>
          </p>
        </div>
      </main>
      <Footer />
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        title="Start your relocation plan"
        subtitle="Personalized guidance for your next move — alongside tools like this day tracker."
      />
    </div>
  );
}
