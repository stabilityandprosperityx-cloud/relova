import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Sparkles, RefreshCw } from "lucide-react";
import type { UserProfile } from "@/pages/Dashboard";
import { supabase } from "@/integrations/supabase/client";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

interface Props {
  profile: UserProfile | null;
  onBack: () => void;
}

interface FormData {
  fullName: string;
  dateOfBirth: string;
  currentAddress: string;
  employer: string;
  jobTitle: string;
  employmentYears: string;
  incomeSource: string;
  plannedEntryDate: string;
  plannedAddress: string;
  purposeOfMove: string;
  hasPropertyHome: boolean;
  hasFamilyHome: boolean;
  employerStaysHome: boolean;
  additionalNotes: string;
}

const INCOME_SOURCES = [
  "Employment (salary)",
  "Self-employment / freelance",
  "Business owner",
  "Passive income / investments",
  "Pension / retirement",
  "Remote work",
];

const PURPOSES = [
  "Work remotely for foreign employer",
  "Start a new job locally",
  "Join family member",
  "Retirement",
  "Start a business",
  "Study",
  "Better quality of life",
];

export default function VisaLetterGenerator({ profile, onBack }: Props) {
  const STORAGE_KEY = "relova_visa_letter_form";

  const [step, setStep] = useState<"form" | "generating" | "result">(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + "_step");
      return (saved as "form" | "generating" | "result") || "form";
    } catch {}
    return "form";
  });

  const [generatedLetter, setGeneratedLetter] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY + "_letter") || "";
    } catch {}
    return "";
  });
  const [error, setError] = useState("");

  const profileWithExtras = profile as (UserProfile & { income_source?: string | null; move_date?: string | null }) | null;

  const [form, setForm] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      fullName: "",
      dateOfBirth: "",
      currentAddress: "",
      employer: "",
      jobTitle: "",
      employmentYears: "",
      incomeSource: "Employment (salary)",
      plannedEntryDate: profileWithExtras?.move_date || "",
      plannedAddress: "",
      purposeOfMove: "Better quality of life",
      hasPropertyHome: false,
      hasFamilyHome: false,
      employerStaysHome: false,
      additionalNotes: "",
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + "_step", step === "generating" ? "form" : step);
    } catch {}
  }, [step]);

  useEffect(() => {
    try {
      if (generatedLetter) localStorage.setItem(STORAGE_KEY + "_letter", generatedLetter);
    } catch {}
  }, [generatedLetter]);

  const update = (field: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const generateLetter = async () => {
    if (!form.fullName || !form.dateOfBirth || !form.employer) {
      setError("Please fill in Full name, Date of birth, and Employer.");
      return;
    }
    setError("");
    setStep("generating");

    const visaType = profile?.visa_type?.replace(/_/g, " ") || "Long-stay visa";
    const country = profile?.target_country || "the destination country";
    const citizenship = profile?.citizenship || "applicant's home country";
    const monthlyIncome = profile?.monthly_budget || "sufficient";
    const familyStatus = profile?.family_status || "single";

    const prompt = `You are an expert immigration consultant. Write a professional visa cover letter for a ${visaType} application to ${country}.

APPLICANT DETAILS:
- Full name: ${form.fullName}
- Date of birth: ${form.dateOfBirth}
- Citizenship: ${citizenship}
- Current address: ${form.currentAddress}
- Family status: ${familyStatus}

EMPLOYMENT & FINANCES:
- Employer/Company: ${form.employer}
- Job title: ${form.jobTitle}
- Years of employment: ${form.employmentYears}
- Income source: ${form.incomeSource}
- Monthly income: $${monthlyIncome}

RELOCATION DETAILS:
- Planned entry date: ${form.plannedEntryDate}
- Planned address in ${country}: ${form.plannedAddress || "Currently searching for accommodation"}
- Purpose of move: ${form.purposeOfMove}

TIES TO HOME COUNTRY:
- Property in home country: ${form.hasPropertyHome ? "Yes" : "No"}
- Family remaining in home country: ${form.hasFamilyHome ? "Yes" : "No"}
- Current employer continuing (remote): ${form.employerStaysHome ? "Yes" : "No"}

ADDITIONAL CONTEXT: ${form.additionalNotes || "None"}

REQUIREMENTS:
- Write a formal cover letter addressed to "The Visa Officer, Embassy of ${country}"
- Length: 400-550 words
- Format: Professional business letter with proper header, date placeholder [DATE], and signature block
- Include: Introduction, purpose of relocation, financial stability proof, ties to home country, documents list, closing
- Tailor specifically to ${visaType} requirements for ${country}
- Tone: Formal, respectful, confident
- Language: English
- Do NOT include placeholder brackets except for [DATE] and [SIGNATURE]
- Make it sound natural and personal, not like a template
- End with "Yours sincerely," followed by the applicant's full name`;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          tier: "full",
          systemContext: "You are an expert immigration consultant who writes professional visa cover letters. Write only the letter itself with no additional commentary.",
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.delta?.text || parsed.choices?.[0]?.delta?.content || "";
                fullText += delta;
              } catch {}
            }
          }
        }
      }

      if (!fullText) throw new Error("Empty response");
      setGeneratedLetter(fullText);
      setStep("result");
    } catch (e) {
      setError("Generation failed. Please try again.");
      setStep("form");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Visa Cover Letter — ${profile?.target_country || ""}</title>
          <style>
            body { font-family: Georgia, serif; font-size: 12pt; line-height: 1.6; margin: 2.5cm; color: #000; }
            pre { white-space: pre-wrap; font-family: Georgia, serif; font-size: 12pt; line-height: 1.6; }
            @media print { body { margin: 2cm; } }
          </style>
        </head>
        <body>
          <pre>${generatedLetter}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  // ─── FORM STATE ───
  if (step === "form") {
    return (
      <div className="space-y-6 max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
          ← Back to documents
        </button>

        <div>
          <h2 className="text-xl font-semibold tracking-tight">Visa Cover Letter Generator</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in your details and we'll generate a professional cover letter for your{" "}
            <span className="text-primary">{profile?.visa_type?.replace(/_/g, " ")} — {profile?.target_country}</span> application.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Personal */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Personal details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] text-muted-foreground mb-1.5 block">Full name (as in passport) *</label>
                <input
                  value={form.fullName}
                  onChange={e => update("fullName", e.target.value)}
                  placeholder="John Smith"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-1.5 block">Date of birth *</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={e => update("dateOfBirth", e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground mb-1.5 block">Current address</label>
              <input
                value={form.currentAddress}
                onChange={e => update("currentAddress", e.target.value)}
                placeholder="123 Main St, City, Country"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Employment */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Employment & finances</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] text-muted-foreground mb-1.5 block">Employer / Company *</label>
                <input
                  value={form.employer}
                  onChange={e => update("employer", e.target.value)}
                  placeholder="Acme Corp / Self-employed"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-1.5 block">Job title</label>
                <input
                  value={form.jobTitle}
                  onChange={e => update("jobTitle", e.target.value)}
                  placeholder="Software Engineer"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] text-muted-foreground mb-1.5 block">Years of employment</label>
                <input
                  value={form.employmentYears}
                  onChange={e => update("employmentYears", e.target.value)}
                  placeholder="3 years"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-1.5 block">Income source</label>
                <select
                  value={form.incomeSource}
                  onChange={e => update("incomeSource", e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Relocation */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Relocation details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] text-muted-foreground mb-1.5 block">Planned entry date</label>
                <input
                  type="date"
                  value={form.plannedEntryDate}
                  onChange={e => update("plannedEntryDate", e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-1.5 block">Purpose of move</label>
                <select
                  value={form.purposeOfMove}
                  onChange={e => update("purposeOfMove", e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground mb-1.5 block">Planned address in {profile?.target_country || "destination"}</label>
              <input
                value={form.plannedAddress}
                onChange={e => update("plannedAddress", e.target.value)}
                placeholder="Leave blank if still searching"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Ties */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Ties to home country</p>
            <p className="text-[12px] text-muted-foreground">These help demonstrate you have reasons to maintain connection to your home country</p>
            {[
              { field: "hasPropertyHome", label: "I own property in my home country" },
              { field: "hasFamilyHome", label: "Family members remain in my home country" },
              { field: "employerStaysHome", label: "My employer / clients are based in my home country" },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[field as keyof FormData] as boolean}
                  onChange={e => update(field as keyof FormData, e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-[13px]">{label}</span>
              </label>
            ))}
          </div>

          {/* Additional */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Additional context (optional)</p>
            <textarea
              value={form.additionalNotes}
              onChange={e => update("additionalNotes", e.target.value)}
              placeholder="Any special circumstances, previous visa history, specific reasons for choosing this country..."
              rows={3}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            />
          </div>
        </div>

        <Button onClick={generateLetter} className="w-full h-12 text-sm font-semibold">
          <Sparkles size={16} className="mr-2" />
          Generate Cover Letter
        </Button>

        <p className="text-[11px] text-muted-foreground/60 text-center">
          This generates a draft template. Review and personalize before submission. For complex cases, consult an immigration lawyer.
        </p>
      </div>
    );
  }

  // ─── GENERATING STATE ───
  if (step === "generating") {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Sparkles size={20} className="text-primary" />
        </div>
        <p className="text-sm font-medium">Generating your cover letter...</p>
        <p className="text-xs text-muted-foreground">Tailoring for {profile?.visa_type?.replace(/_/g, " ")} — {profile?.target_country}</p>
      </div>
    );
  }

  // ─── RESULT STATE ───
  return (
    <div className="space-y-5 max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
        ← Back to documents
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Your Cover Letter</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{profile?.visa_type?.replace(/_/g, " ")} — {profile?.target_country}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setStep("form")}>
            <RefreshCw size={14} className="mr-1.5" /> Regenerate
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Download size={14} className="mr-1.5" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
        <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-foreground/90">
          {generatedLetter}
        </pre>
      </div>

      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-[12px] text-amber-400/80">
        ⚠️ This is a draft template. Review carefully and personalize before submission. For complex visa cases, consult a licensed immigration lawyer.
      </div>
    </div>
  );
}
