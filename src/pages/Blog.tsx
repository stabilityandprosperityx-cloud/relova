import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ArticleCard {
  title: string;
  description: string;
  href: string;
}

const guides: ArticleCard[] = [
  {
    title: "How to Move to Portugal",
    description: "Visa options, costs, timelines, and everything you need to relocate to Portugal.",
    href: "/guides/move-to-portugal",
  },
];

const compare: ArticleCard[] = [
  {
    title: "Portugal vs Spain",
    description: "Side-by-side comparison of visas, cost of living, taxes, and quality of life.",
    href: "/compare/portugal-vs-spain",
  },
];

const best: ArticleCard[] = [
  {
    title: "Best Countries to Move to in 2026",
    description: "Our ranked list of the easiest and most rewarding countries for relocation this year.",
    href: "/best/best-countries-2026",
  },
];

function Section({ label, articles }: { label: string; articles: ArticleCard[] }) {
  return (
    <section className="mb-16">
      <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-primary mb-6">
        {label}
      </h2>
      <div className="grid gap-4">
        {articles.map((a) => (
          <Link
            key={a.href}
            to={a.href}
            className="group rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 p-6 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold mb-1 group-hover:text-primary transition-colors">
                  {a.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {a.description}
                </p>
              </div>
              <ArrowRight
                size={16}
                className="mt-1 shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <div className="container max-w-[740px] py-16 px-6 md:py-24">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Blog</h1>
          <p className="text-muted-foreground mb-14 text-base">
            Guides, comparisons, and curated lists to help you relocate smarter.
          </p>

          <Section label="Guides" articles={guides} />
          <Section label="Compare" articles={compare} />
          <Section label="Best of" articles={best} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
