import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

const countryData: Record<string, {
  name: string; flag: string; tagline: string;
  visaOptions: { name: string; duration: string; requirements: string }[];
  taxInfo: { label: string; value: string }[];
  costOfLiving: { item: string; cost: string }[];
  checklist: string[];
}> = {
  portugal: {
    name: "Portugal", flag: "🇵🇹", tagline: "Europe's top destination for digital nomads and retirees",
    visaOptions: [
      { name: "D7 Passive Income Visa", duration: "2 years (renewable)", requirements: "Proof of €760/mo passive income" },
      { name: "Digital Nomad Visa", duration: "1 year", requirements: "€3,040/mo income, remote employment" },
      { name: "Golden Visa", duration: "5 years → citizenship", requirements: "€500k+ investment" },
      { name: "D2 Entrepreneur Visa", duration: "2 years", requirements: "Business plan, €5k+ capital" },
    ],
    taxInfo: [
      { label: "Income Tax", value: "14.5% – 48% (progressive)" },
      { label: "NHR Regime", value: "20% flat rate for 10 years (qualifying professions)" },
      { label: "Corporate Tax", value: "21%" },
      { label: "VAT", value: "23%" },
    ],
    costOfLiving: [
      { item: "1BR Apartment (Lisbon)", cost: "€900 – €1,400/mo" },
      { item: "Groceries", cost: "€250 – €350/mo" },
      { item: "Utilities", cost: "€100 – €150/mo" },
      { item: "Dining out", cost: "€10 – €20/meal" },
      { item: "Public transport", cost: "€40/mo pass" },
    ],
    checklist: [
      "Apply for NIF (tax number) — can be done remotely",
      "Open a Portuguese bank account",
      "Gather apostilled documents",
      "Schedule visa appointment at consulate",
      "Book initial accommodation (min 1 month)",
      "Register with local SEF office upon arrival",
      "Apply for residency card",
      "Register with local health center",
    ],
  },
  uae: {
    name: "United Arab Emirates", flag: "🇦🇪", tagline: "Tax-free hub for business and investment",
    visaOptions: [
      { name: "Golden Visa", duration: "10 years", requirements: "AED 2M+ investment or specialized talent" },
      { name: "Green Visa", duration: "5 years", requirements: "Freelancers, investors, skilled workers" },
      { name: "Remote Work Visa", duration: "1 year", requirements: "$5,000/mo income proof" },
      { name: "Investor Visa", duration: "3 years", requirements: "Company formation in free zone" },
    ],
    taxInfo: [
      { label: "Personal Income Tax", value: "0%" },
      { label: "Corporate Tax", value: "9% (above AED 375k)" },
      { label: "VAT", value: "5%" },
      { label: "Free Zone Tax", value: "0% (qualifying activities)" },
    ],
    costOfLiving: [
      { item: "1BR Apartment (Dubai)", cost: "$1,500 – $2,500/mo" },
      { item: "Groceries", cost: "$400 – $600/mo" },
      { item: "Utilities", cost: "$150 – $200/mo" },
      { item: "Dining out", cost: "$15 – $40/meal" },
      { item: "Metro", cost: "$80/mo pass" },
    ],
    checklist: [
      "Choose free zone or mainland setup",
      "Register your company or find employer sponsor",
      "Get medical fitness test",
      "Apply for Emirates ID",
      "Open UAE bank account",
      "Get health insurance",
      "Find accommodation",
      "Register vehicle (if applicable)",
    ],
  },
  georgia: {
    name: "Georgia", flag: "🇬🇪", tagline: "Low-cost, high-freedom country for remote workers",
    visaOptions: [
      { name: "Visa-Free Stay", duration: "1 year", requirements: "Most nationalities — no visa needed" },
      { name: "Remotely from Georgia", duration: "1 year", requirements: "$2,000/mo income" },
      { name: "Residence Permit", duration: "1–6 years", requirements: "Work, business, or study basis" },
      { name: "Investment Residency", duration: "Permanent", requirements: "GEL 300k+ investment" },
    ],
    taxInfo: [
      { label: "Personal Income Tax", value: "20% flat" },
      { label: "Small Business Status", value: "1% turnover tax (under GEL 500k)" },
      { label: "IT/Virtual Zone", value: "0% on international income" },
      { label: "VAT", value: "18%" },
    ],
    costOfLiving: [
      { item: "1BR Apartment (Tbilisi)", cost: "$400 – $700/mo" },
      { item: "Groceries", cost: "$150 – $250/mo" },
      { item: "Utilities", cost: "$50 – $80/mo" },
      { item: "Dining out", cost: "$5 – $12/meal" },
      { item: "Transport", cost: "$20/mo" },
    ],
    checklist: [
      "Arrive (no visa needed for most)",
      "Register temporary address",
      "Get Georgian phone number and SIM",
      "Open bank account (BOG or TBC)",
      "Apply for Virtual Zone if freelancer",
      "Get residence permit if staying 1yr+",
      "Register with Revenue Service",
      "Get local health insurance",
    ],
  },
  argentina: {
    name: "Argentina", flag: "🇦🇷", tagline: "Affordable destination with vibrant culture",
    visaOptions: [
      { name: "Digital Nomad Visa", duration: "6 months (renewable)", requirements: "Remote employment, $1,500/mo" },
      { name: "Rentista Visa", duration: "1 year (renewable)", requirements: "Proof of passive income" },
      { name: "Work Visa", duration: "1 year", requirements: "Employment contract with Argentine company" },
      { name: "Investor Visa", duration: "1 year → permanent", requirements: "Investment in Argentine business" },
    ],
    taxInfo: [
      { label: "Income Tax", value: "5% – 35% (progressive)" },
      { label: "For Non-Residents", value: "Taxed only on Argentine-source income" },
      { label: "VAT", value: "21%" },
      { label: "Wealth Tax", value: "0.5% – 1.75% on assets" },
    ],
    costOfLiving: [
      { item: "1BR Apartment (Buenos Aires)", cost: "$400 – $700/mo" },
      { item: "Groceries", cost: "$150 – $250/mo" },
      { item: "Utilities", cost: "$40 – $70/mo" },
      { item: "Dining out", cost: "$5 – $15/meal" },
      { item: "Metro (SUBE card)", cost: "$15/mo" },
    ],
    checklist: [
      "Apply for DNI (national ID) upon arrival",
      "Open bank account (or use fintech apps)",
      "Get Argentine phone number",
      "Find accommodation (temporary → permanent)",
      "Apply for appropriate visa at immigration office",
      "Register with AFIP (tax authority) if working",
      "Get health insurance (prepaga or OSDE)",
      "Learn basic Spanish (strongly recommended)",
    ],
  },
};

export default function CountryPage() {
  const { slug } = useParams();
  const country = countryData[slug || "portugal"] || countryData.portugal;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft size={14} /> All countries
            </Link>

            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl">{country.flag}</span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{country.name}</h1>
            </div>
            <p className="text-muted-foreground text-lg mb-12">{country.tagline}</p>
          </motion.div>

          {/* Visa Options */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-xl font-semibold mb-5">Visa Options</h2>
            <div className="grid gap-3">
              {country.visaOptions.map((v) => (
                <div key={v.name} className="p-5 rounded-xl border border-border bg-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold">{v.name}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium w-fit">{v.duration}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{v.requirements}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Tax Info */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-xl font-semibold mb-5">Tax Overview</h2>
            <div className="rounded-xl border border-border overflow-hidden">
              {country.taxInfo.map((t, i) => (
                <div key={t.label} className={`flex justify-between items-center p-4 bg-card ${i < country.taxInfo.length - 1 ? "border-b border-border" : ""}`}>
                  <span className="text-sm font-medium">{t.label}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">{t.value}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Cost of Living */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-xl font-semibold mb-5">Cost of Living</h2>
            <div className="rounded-xl border border-border overflow-hidden">
              {country.costOfLiving.map((c, i) => (
                <div key={c.item} className={`flex justify-between items-center p-4 bg-card ${i < country.costOfLiving.length - 1 ? "border-b border-border" : ""}`}>
                  <span className="text-sm">{c.item}</span>
                  <span className="text-sm font-medium tabular-nums">{c.cost}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Checklist */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-xl font-semibold mb-5">Relocation Checklist</h2>
            <div className="space-y-2">
              {country.checklist.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                  <div className="h-5 w-5 rounded-md border border-border flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Check size={12} className="text-muted-foreground/30" />
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div
            className="text-center p-8 rounded-xl border border-primary/20 bg-card glow-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-2">Need help with {country.name}?</h3>
            <p className="text-sm text-muted-foreground mb-5">Get a personalized plan based on your specific situation.</p>
            <Link to="/chat">
              <Button variant="hero" className="gap-2">
                Talk to RelocateAI <ArrowRight size={14} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
