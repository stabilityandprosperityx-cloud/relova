import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ArticleLayoutProps {
  category: string;
  categoryPath: string;
  title: string;
  subtitle?: string;
  metaTitle?: string;
  metaDescription?: string;
  heroVisual?: React.ReactNode;
  children: React.ReactNode;
}

export default function ArticleLayout({
  category,
  categoryPath,
  title,
  subtitle,
  metaTitle,
  metaDescription,
  children,
}: ArticleLayoutProps) {
  useEffect(() => {
    if (metaTitle) document.title = metaTitle;
    if (metaDescription) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = metaDescription;
    }
    return () => { document.title = "Relova — Relocation Made Simple"; };
  }, [metaTitle, metaDescription]);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <article className="container max-w-[740px] py-16 px-6 md:py-24">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <span>/</span>
            <Link to={categoryPath} className="hover:text-foreground transition-colors capitalize">
              {category}
            </Link>
          </div>

          {/* Header */}
          <header className="mb-12">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary mb-4">
              {category}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.15] mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            )}
          </header>

          {/* Article body — prose styling */}
          <div className="prose-relova">{children}</div>

          {/* CTA Block */}
          <div className="mt-16 rounded-xl border border-border/40 bg-muted/30 p-8 md:p-10 text-center">
            <h2 className="text-xl font-semibold mb-2">
              Get your personalized relocation plan
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Find the best country, required documents, and your step-by-step plan.
            </p>
            <a href="https://relova.ai">
              <Button className="h-10 px-8 text-sm font-medium">
                Start with Relova →
              </Button>
            </a>
          </div>

          {/* Back link */}
          <div className="mt-10">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} /> Back to blog
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
