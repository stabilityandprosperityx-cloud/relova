import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Download } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthModal from "@/components/auth/AuthModal";
import { printPlainLetter } from "@/lib/printToPdf";
import { CITIZENSHIP_NAMES } from "@/lib/toolSlugs";

const STORAGE_KEY = "relova_invitation_letter_form_v1";

type LegalStatus = "citizen" | "permanent_resident" | "temporary_resident";
type Purpose = "tourism" | "family_visit" | "other";
type Payer = "host" | "visitor" | "split";

interface FormData {
  hostName: string;
  hostNationality: string;
  hostLegalStatus: LegalStatus;
  hostAddress: string;
  hostCity: string;
  hostCountry: string;
  hostPhone: string;
  hostEmail: string;
  hostIdNumber: string;
  visitorName: string;
  visitorNationality: string;
  visitorDob: string;
  visitorPassport: string;
  visitorHomeAddress: string;
  visitorHomeCountry: string;
  relationship: string;
  knownHowLong: string;
  purpose: Purpose;
  purposeOther: string;
  arrivalDate: string;
  departureDate: string;
  stayingWithHost: "yes" | "no";
  accommodationAddress: string;
  paysTravel: Payer;
  paysLodging: Payer;
  paysDaily: Payer;
  financeNote: string;
  letterDate: string;
  embassyLine: string;
  signatureName: string;
}

const DEFAULT_FORM: FormData = {
  hostName: "",
  hostNationality: "",
  hostLegalStatus: "citizen",
  hostAddress: "",
  hostCity: "",
  hostCountry: "",
  hostPhone: "",
  hostEmail: "",
  hostIdNumber: "",
  visitorName: "",
  visitorNationality: "",
  visitorDob: "",
  visitorPassport: "",
  visitorHomeAddress: "",
  visitorHomeCountry: "",
  relationship: "",
  knownHowLong: "",
  purpose: "tourism",
  purposeOther: "",
  arrivalDate: "",
  departureDate: "",
  stayingWithHost: "yes",
  accommodationAddress: "",
  paysTravel: "visitor",
  paysLodging: "host",
  paysDaily: "visitor",
  financeNote: "",
  letterDate: "",
  embassyLine: "",
  signatureName: "",
};

function legalStatusLabel(s: LegalStatus): string {
  if (s === "permanent_resident") return "permanent resident";
  if (s === "temporary_resident") return "temporary resident";
  return "citizen";
}

function purposeLabel(f: FormData): string {
  if (f.purpose === "family_visit") return "a family visit";
  if (f.purpose === "other" && f.purposeOther.trim()) return f.purposeOther.trim();
  if (f.purpose === "other") return "a personal visit";
  return "tourism";
}

function payerPhrase(p: Payer, who: string): string {
  if (p === "host") return `I (the host) will cover ${who}`;
  if (p === "split") return `${who.charAt(0).toUpperCase() + who.slice(1)} will be shared between us`;
  return `the visitor will cover ${who}`;
}

function buildLetter(f: FormData, variant: "generic" | "schengen"): string {
  const date =
    f.letterDate ||
    new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const addressed =
    f.embassyLine.trim() ||
    (variant === "schengen"
      ? "To the Visa Officer / Consulate of the Schengen Area"
      : "To the Visa Officer");
  const status = legalStatusLabel(f.hostLegalStatus);
  const hostId = f.hostIdNumber.trim()
    ? `, holding identification/residence document number ${f.hostIdNumber.trim()}`
    : "";
  const stay =
    f.stayingWithHost === "yes"
      ? `During the visit, ${f.visitorName || "[Visitor Name]"} will stay with me at my residence at ${f.hostAddress || "[Host Address]"}, ${f.hostCity || "[City]"}, ${f.hostCountry || "[Country]"}.`
      : `During the visit, ${f.visitorName || "[Visitor Name]"} will stay at ${f.accommodationAddress || "[Accommodation Address]"}.`;
  const finance = [
    payerPhrase(f.paysTravel, "travel expenses"),
    payerPhrase(f.paysLodging, "accommodation costs"),
    payerPhrase(f.paysDaily, "daily living expenses"),
  ].join("; ");
  const sig = f.signatureName.trim() || f.hostName || "[Host Full Name]";

  return `${addressed}

Date: ${date}

Dear Sir/Madam,

I, ${f.hostName || "[Host Full Name]"}, a ${status} of ${f.hostCountry || "[Host Country]"} (nationality: ${f.hostNationality || "[Host Nationality]"})${hostId}, residing at ${f.hostAddress || "[Host Address]"}, ${f.hostCity || "[City]"}, ${f.hostCountry || "[Country]"}, hereby invite:

${f.visitorName || "[Visitor Full Name]"}, born ${f.visitorDob || "[Date of Birth]"}, nationality ${f.visitorNationality || "[Nationality]"}, passport number ${f.visitorPassport || "[Passport Number]"}, residing at ${f.visitorHomeAddress || "[Home Address]"}, ${f.visitorHomeCountry || "[Home Country]"},

to visit me for ${purposeLabel(f)} from ${f.arrivalDate || "[Arrival Date]"} to ${f.departureDate || "[Departure Date]"}.

Our relationship: ${f.relationship || "[Relationship]"}${f.knownHowLong ? ` (known for ${f.knownHowLong})` : ""}.

${stay}

Regarding financial arrangements: ${finance}.${f.financeNote.trim() ? ` ${f.financeNote.trim()}` : ""}

I confirm that the information in this letter is true to the best of my knowledge. Please contact me if you require any further information.

Contact: ${f.hostPhone || "[Phone]"} · ${f.hostEmail || "[Email]"}

Yours faithfully,

${sig}
${f.hostAddress || "[Host Address]"}
${f.hostCity || "[City]"}, ${f.hostCountry || "[Country]"}`;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="text-[12px] font-medium text-muted-foreground block mb-1.5">{children}</label>;
}

function InvitationLetterPage({ variant }: { variant: "generic" | "schengen" }) {
  const [form, setForm] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_FORM, ...JSON.parse(saved) };
    } catch {
      /* ignore */
    }
    return {
      ...DEFAULT_FORM,
      letterDate: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  });
  const [authOpen, setAuthOpen] = useState(false);

  // Client-only persistence — never synced to any server
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const letter = useMemo(() => buildLetter(form, variant), [form, variant]);

  const title =
    variant === "schengen"
      ? "Schengen Visa Invitation Letter Generator"
      : "Visa Invitation Letter Generator";
  const description =
    variant === "schengen"
      ? "Free Schengen visa invitation letter generator — fill in host and visitor details for a downloadable draft letter. Nothing is sent to our servers."
      : "Free visa invitation letter generator — create a downloadable draft for tourist or family visits. Your information stays in your browser.";

  const handlePrint = () => {
    printPlainLetter(
      variant === "schengen" ? "Schengen Visa Invitation Letter" : "Visa Invitation Letter",
      letter,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title} — Relova</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Helmet>
      <Navbar />
      <main className="pt-28 pb-20 px-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-[1.75rem] sm:text-[2.2rem] font-semibold text-foreground tracking-tight leading-[1.15] mb-3">
            {title}
          </h1>
          <p className="text-[14px] text-muted-foreground mb-2 leading-relaxed max-w-2xl">
            {variant === "schengen"
              ? "Generate a draft invitation letter commonly used to support Schengen short-stay visa applications. Edit any field — the letter updates instantly."
              : "Generate a draft invitation letter for tourist or family visits. Edit any field — the letter updates instantly."}
          </p>
          <p className="text-[12px] text-primary/90 font-medium mb-8">
            Your information stays in your browser — nothing is sent to our servers.
          </p>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Form — all client-side; no fetch / analytics on change */}
            <div className="surface-card p-5 sm:p-6 space-y-6">
              <section className="space-y-3">
                <h2 className="text-[13px] font-semibold text-foreground">Host</h2>
                <div>
                  <FieldLabel>Full name</FieldLabel>
                  <Input
                    autoComplete="off"
                    value={form.hostName}
                    onChange={(e) => set("hostName", e.target.value)}
                    className="form-field"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Nationality</FieldLabel>
                    <Select value={form.hostNationality || undefined} onValueChange={(v) => set("hostNationality", v)}>
                      <SelectTrigger className="form-field h-10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {CITIZENSHIP_NAMES.map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FieldLabel>Legal status</FieldLabel>
                    <Select
                      value={form.hostLegalStatus}
                      onValueChange={(v) => set("hostLegalStatus", v as LegalStatus)}
                    >
                      <SelectTrigger className="form-field h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="permanent_resident">Permanent resident</SelectItem>
                        <SelectItem value="temporary_resident">Temporary resident</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <FieldLabel>Address</FieldLabel>
                  <Input
                    autoComplete="off"
                    value={form.hostAddress}
                    onChange={(e) => set("hostAddress", e.target.value)}
                    className="form-field"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>City</FieldLabel>
                    <Input
                      autoComplete="off"
                      value={form.hostCity}
                      onChange={(e) => set("hostCity", e.target.value)}
                      className="form-field"
                    />
                  </div>
                  <div>
                    <FieldLabel>Country</FieldLabel>
                    <Input
                      autoComplete="off"
                      value={form.hostCountry}
                      onChange={(e) => set("hostCountry", e.target.value)}
                      className="form-field"
                      placeholder={variant === "schengen" ? "e.g. Portugal" : undefined}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Phone</FieldLabel>
                    <Input
                      autoComplete="off"
                      value={form.hostPhone}
                      onChange={(e) => set("hostPhone", e.target.value)}
                      className="form-field"
                    />
                  </div>
                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      autoComplete="off"
                      type="email"
                      value={form.hostEmail}
                      onChange={(e) => set("hostEmail", e.target.value)}
                      className="form-field"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>ID / residence permit number (optional)</FieldLabel>
                  <Input
                    autoComplete="off"
                    value={form.hostIdNumber}
                    onChange={(e) => set("hostIdNumber", e.target.value)}
                    className="form-field"
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-[13px] font-semibold text-foreground">Visitor</h2>
                <div>
                  <FieldLabel>Full name</FieldLabel>
                  <Input
                    autoComplete="off"
                    value={form.visitorName}
                    onChange={(e) => set("visitorName", e.target.value)}
                    className="form-field"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Nationality</FieldLabel>
                    <Select
                      value={form.visitorNationality || undefined}
                      onValueChange={(v) => set("visitorNationality", v)}
                    >
                      <SelectTrigger className="form-field h-10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {CITIZENSHIP_NAMES.map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FieldLabel>Date of birth</FieldLabel>
                    <Input
                      autoComplete="off"
                      value={form.visitorDob}
                      onChange={(e) => set("visitorDob", e.target.value)}
                      className="form-field"
                      placeholder="e.g. 15 March 1990"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Passport number</FieldLabel>
                  <Input
                    autoComplete="off"
                    value={form.visitorPassport}
                    onChange={(e) => set("visitorPassport", e.target.value)}
                    className="form-field"
                  />
                </div>
                <div>
                  <FieldLabel>Home address</FieldLabel>
                  <Input
                    autoComplete="off"
                    value={form.visitorHomeAddress}
                    onChange={(e) => set("visitorHomeAddress", e.target.value)}
                    className="form-field"
                  />
                </div>
                <div>
                  <FieldLabel>Home country</FieldLabel>
                  <Input
                    autoComplete="off"
                    value={form.visitorHomeCountry}
                    onChange={(e) => set("visitorHomeCountry", e.target.value)}
                    className="form-field"
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-[13px] font-semibold text-foreground">Relationship & trip</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Relationship</FieldLabel>
                    <Input
                      autoComplete="off"
                      value={form.relationship}
                      onChange={(e) => set("relationship", e.target.value)}
                      className="form-field"
                      placeholder="e.g. friend, sibling"
                    />
                  </div>
                  <div>
                    <FieldLabel>Known for</FieldLabel>
                    <Input
                      autoComplete="off"
                      value={form.knownHowLong}
                      onChange={(e) => set("knownHowLong", e.target.value)}
                      className="form-field"
                      placeholder="e.g. 5 years"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Purpose</FieldLabel>
                  <Select value={form.purpose} onValueChange={(v) => set("purpose", v as Purpose)}>
                    <SelectTrigger className="form-field h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tourism">Tourism</SelectItem>
                      <SelectItem value="family_visit">Family visit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.purpose === "other" && (
                  <div>
                    <FieldLabel>Purpose details</FieldLabel>
                    <Input
                      autoComplete="off"
                      value={form.purposeOther}
                      onChange={(e) => set("purposeOther", e.target.value)}
                      className="form-field"
                    />
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Arrival date</FieldLabel>
                    <Input
                      autoComplete="off"
                      value={form.arrivalDate}
                      onChange={(e) => set("arrivalDate", e.target.value)}
                      className="form-field"
                      placeholder="e.g. 1 July 2026"
                    />
                  </div>
                  <div>
                    <FieldLabel>Departure date</FieldLabel>
                    <Input
                      autoComplete="off"
                      value={form.departureDate}
                      onChange={(e) => set("departureDate", e.target.value)}
                      className="form-field"
                      placeholder="e.g. 15 July 2026"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Staying with host?</FieldLabel>
                  <Select
                    value={form.stayingWithHost}
                    onValueChange={(v) => set("stayingWithHost", v as "yes" | "no")}
                  >
                    <SelectTrigger className="form-field h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes — at host address</SelectItem>
                      <SelectItem value="no">No — other accommodation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.stayingWithHost === "no" && (
                  <div>
                    <FieldLabel>Accommodation address</FieldLabel>
                    <Input
                      autoComplete="off"
                      value={form.accommodationAddress}
                      onChange={(e) => set("accommodationAddress", e.target.value)}
                      className="form-field"
                    />
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <h2 className="text-[13px] font-semibold text-foreground">Finances</h2>
                {(
                  [
                    ["paysTravel", "Who pays travel"],
                    ["paysLodging", "Who pays lodging"],
                    ["paysDaily", "Who pays daily expenses"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <FieldLabel>{label}</FieldLabel>
                    <Select value={form[key]} onValueChange={(v) => set(key, v as Payer)}>
                      <SelectTrigger className="form-field h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="host">Host</SelectItem>
                        <SelectItem value="visitor">Visitor</SelectItem>
                        <SelectItem value="split">Split</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <div>
                  <FieldLabel>Additional finance note (optional)</FieldLabel>
                  <Textarea
                    autoComplete="off"
                    value={form.financeNote}
                    onChange={(e) => set("financeNote", e.target.value)}
                    className="form-field min-h-[72px]"
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-[13px] font-semibold text-foreground">Letter details</h2>
                <div>
                  <FieldLabel>Letter date</FieldLabel>
                  <Input
                    autoComplete="off"
                    value={form.letterDate}
                    onChange={(e) => set("letterDate", e.target.value)}
                    className="form-field"
                  />
                </div>
                <div>
                  <FieldLabel>
                    {variant === "schengen"
                      ? "Addressed to (optional — defaults to Schengen consulate)"
                      : "Embassy / consulate line (optional)"}
                  </FieldLabel>
                  <Input
                    autoComplete="off"
                    value={form.embassyLine}
                    onChange={(e) => set("embassyLine", e.target.value)}
                    className="form-field"
                    placeholder={
                      variant === "schengen"
                        ? "To the Visa Officer / Consulate of the Schengen Area"
                        : "To the Visa Officer, Embassy of…"
                    }
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Recommended — naming the specific embassy or consulate where the application will
                    be submitted strengthens the letter.
                  </p>
                </div>
                <div>
                  <FieldLabel>Signature name</FieldLabel>
                  <Input
                    autoComplete="off"
                    value={form.signatureName}
                    onChange={(e) => set("signatureName", e.target.value)}
                    className="form-field"
                    placeholder="Defaults to host full name"
                  />
                </div>
              </section>

              <Button className="w-full h-11" onClick={handlePrint}>
                <Download size={16} className="mr-2" /> Print / Save as PDF
              </Button>
            </div>

            {/* Live preview */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border bg-white text-black p-6 sm:p-8 shadow-sm">
                <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-4">
                  Live preview
                </p>
                <pre className="whitespace-pre-wrap font-serif text-[13px] leading-[1.75] text-neutral-900">
                  {letter}
                </pre>
              </div>
              <Button variant="outline" className="w-full mt-4 h-11" onClick={handlePrint}>
                <Download size={16} className="mr-2" /> Print / Save as PDF
              </Button>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground/70 mt-10 mb-8 leading-relaxed max-w-3xl space-y-2">
            <p>
              Not legal advice — verify exact requirements with the destination country&apos;s
              consulate before your guest applies.
            </p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>
                This generates a private/family/tourist visit invitation letter only — not a
                business invitation (which needs employer details, job info, and payslips instead).
              </li>
              <li>
                Some countries — notably Germany and the Netherlands — may require a separate formal
                sponsorship declaration (e.g. Verpflichtungserklärung) completed in person at a local
                immigration office, especially if you&apos;re financially sponsoring your guest&apos;s
                trip. This letter does not replace that.
              </li>
              <li>
                Some consulates require the letter to be notarized or have a certified signature —
                check your specific destination&apos;s requirements before submitting.
              </li>
            </ul>
          </div>

          <div className="surface-card p-6 sm:p-8 border-primary/20 max-w-3xl space-y-4">
            <p className="font-serif text-lg font-semibold text-foreground">
              Need the full document checklist for your visa application too?
            </p>
            <Link to="/tools/documents-needed" className="text-primary hover:underline text-[14px]">
              Open the free Document Checklist tool →
            </Link>
            <div className="pt-2">
              <p className="text-[13px] text-muted-foreground mb-3">
                Want a complete relocation plan for your passport and destination?
              </p>
              <Button onClick={() => setAuthOpen(true)}>Get my relocation plan</Button>
            </div>
          </div>

          {variant === "generic" && (
            <p className="text-[13px] text-muted-foreground mt-8">
              Looking for Schengen-specific wording?{" "}
              <Link to="/tools/invitation-letter/schengen" className="text-primary hover:underline">
                Schengen invitation letter generator →
              </Link>
            </p>
          )}
          {variant === "schengen" && (
            <p className="text-[13px] text-muted-foreground mt-8">
              <Link to="/tools/invitation-letter" className="text-primary hover:underline">
                ← Generic invitation letter generator
              </Link>
            </p>
          )}
        </div>
      </main>
      <Footer />
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        title="Start your relocation plan"
        subtitle="Personalized guidance beyond a draft invitation letter."
      />
    </div>
  );
}

/** Route entry: /tools/invitation-letter or /tools/invitation-letter/schengen */
export default function InvitationLetter() {
  const { variant } = useParams<{ variant?: string }>();
  if (variant && variant !== "schengen") {
    return <Navigate to="/tools/invitation-letter" replace />;
  }
  return <InvitationLetterPage variant={variant === "schengen" ? "schengen" : "generic"} />;
}
