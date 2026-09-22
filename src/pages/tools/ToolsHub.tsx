import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { CAN_I_MOVE_LAUNCH_PAIRS } from "@/lib/canIMovePairs";
import { DOCUMENTS_LAUNCH_PAIRS } from "@/lib/documentsNeededPairs";
import { COMPARE_LAUNCH_PAIRS } from "@/lib/countryComparePairs";
import { MOVE_AS_PERSONAS } from "@/lib/moveAsPersonas";

const TOOLS = [
  {
    name: "Can I Move?",
    href: "/tools/can-i-move",
    description:
      "Free passport check: see whether relocating to a destination is often feasible for your citizenship.",
    coverage: `${CAN_I_MOVE_LAUNCH_PAIRS.length} cached citizenship → destination checks`,
  },
  {
    name: "Where Should I Move?",
    href: "/tools/where-should-i-move",
    description:
      "Pick a profile — digital nomad, retiree, family, safety-first, budget, fresh start — and get a ranked country shortlist.",
    coverage: `${MOVE_AS_PERSONAS.length} profiles`,
  },
  {
    name: "Documents Needed",
    href: "/tools/documents-needed",
    description:
      "Free document checklist for relocating abroad — passport, visa, and residence requirements by citizenship and destination.",
    coverage: `${DOCUMENTS_LAUNCH_PAIRS.length} cached checklists, source-cited where available`,
  },
  {
    name: "Country Compare",
    href: "/tools/country-compare",
    description:
      "Compare two countries side by side — cost, safety, healthcare, visas — optionally through the lens of your passport.",
    coverage: `${COMPARE_LAUNCH_PAIRS.length} cached comparisons`,
  },
  {
    name: "Invitation Letter Generator",
    href: "/tools/invitation-letter",
    description:
      "Draft a visa invitation letter (including a Schengen-specific variant) in minutes, free to download.",
    coverage: "Standard + Schengen templates",
  },
  {
    name: "Tax Residency Tracker",
    href: "/tools/tax-residency-tracker",
    description:
      "Log stays by country and see how close you are to common 183-day tax residency thresholds. Your data stays in your browser.",
    coverage: "Awareness only, not a tax determination",
  },
];

export default function ToolsHub() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Free Relocation Tools — Relova"
        description="Free tools for planning a move abroad: passport feasibility checks, document checklists, country comparisons, and more — no account needed."
        canonical="https://relova.ai/tools"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: TOOLS.map((tool, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: tool.name,
            url: `https://relova.ai${tool.href}`,
          })),
        }}
      />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Free relocation tools
          </h1>
          <p className="text-muted-foreground text-lg mb-12">
            No account needed. Pick a tool below, or{" "}
            <Link to="/data-sources" className="text-primary hover:underline">
              see how the data behind them is generated and kept fresh
            </Link>
            .
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                to={tool.href}
                className="group rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 p-6 transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-base font-semibold group-hover:text-primary transition-colors">
                    {tool.name}
                  </h2>
                  <ArrowRight
                    size={16}
                    className="mt-1 shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {tool.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-auto">{tool.coverage}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
