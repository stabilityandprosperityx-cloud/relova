import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { countryData } from "@/data/countries";

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
          <motion.section className="mb-12" initial={{ opacity: 0, y: 16, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0)" }} transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
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
          <motion.section className="mb-12" initial={{ opacity: 0, y: 16, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0)" }} transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
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
          <motion.section className="mb-12" initial={{ opacity: 0, y: 16, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0)" }} transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
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
          <motion.section className="mb-12" initial={{ opacity: 0, y: 16, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0)" }} transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}>
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
          <motion.div className="text-center p-8 rounded-xl border border-primary/20 bg-card glow-sm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <h3 className="text-lg font-semibold mb-2">Need help with {country.name}?</h3>
            <p className="text-sm text-muted-foreground mb-5">Get a personalized plan based on your specific situation.</p>
            <Link to="/chat">
              <Button variant="hero" className="gap-2">
                Talk to Relova AI <ArrowRight size={14} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
