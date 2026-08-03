import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, DollarSign, Home, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { countryData } from "@/data/countries";
import SEO from "@/components/SEO";
import countriesHero from "@/assets/redesign/countries-hero.jpg";

const countryOrder = ["portugal", "spain", "uae", "usa", "canada", "germany", "australia", "thailand", "mexico", "estonia", "indonesia", "singapore", "argentina"];

const quickStats = [
  { icon: FileText, label: "Visa Pathways", value: "120+" },
  { icon: DollarSign, label: "Tax Regimes Mapped", value: "30+" },
  { icon: Home, label: "Housing Guides", value: "45" },
  { icon: Briefcase, label: "Job Markets", value: "28" },
];

export default function Countries() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Countries — Relova"
        description="Explore destinations with Relova: compare visas, cost of living, taxes, and pathways. AI-powered relocation planning for Portugal, Spain, UAE, and dozens more."
        canonical="https://relova.ai/countries"
      />
      <Navbar />
      <main className="pt-0 pb-16">
        {/* Hero — full-bleed photo with text overlay */}
        <div className="relative overflow-hidden h-[340px] md:h-[400px] mb-12">
          {/* Photo background */}
          <img
            src={countriesHero}
            alt="Explore countries for relocation"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay for text contrast */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(5,3,20,0.75) 0%, rgba(5,3,20,0.45) 55%, rgba(5,3,20,0.20) 100%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-end container pb-10 pt-24">
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-[11px] font-medium tracking-wide"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  color: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(8px)" as const,
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#8b5cf6", display: "inline-block" }} />
                70+ destinations · Real visa paths
              </div>
              <p
                className="text-lg md:text-xl max-w-[520px] font-medium"
                style={{
                  color: "rgba(255,255,255,0.82)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                }}
              >
                Compare destinations and find the right fit for your relocation. Real costs, visa paths, and timelines.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
            {quickStats.map((stat) => (
              <div key={stat.label} className="p-5 rounded-xl border border-border bg-card">
                <stat.icon size={18} className="text-primary mb-3" />
                <div className="text-2xl font-semibold tabular-nums">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countryOrder.map((slug, i) => {
              const country = countryData[slug];
              if (!country) return null;
              return (
                <motion.div key={slug} initial={{ opacity: 0, y: 16, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0)" }} transition={{ duration: 0.6, delay: 0.15 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}>
                  <Link to={`/countries/${slug}`}>
                    <div className="group p-6 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors duration-300 cursor-pointer h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-lg font-bold">{country.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{country.tagline}</div>
                        </div>
                        <span className="text-2xl">{country.flag}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {country.highlights.map((h) => (
                          <span key={h} className="px-2 py-0.5 rounded-md bg-secondary text-[11px] text-secondary-foreground">{h}</span>
                        ))}
                      </div>
                      <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                        View details <ArrowRight size={14} className="ml-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div className="mt-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <p className="text-muted-foreground mb-4">Not sure which country is right for you?</p>
            <Link to="/chat">
              <Button variant="hero" className="gap-2">Ask Relova AI <ArrowRight size={14} /></Button>
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
