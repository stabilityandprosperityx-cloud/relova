import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface LegalSection {
  title: string;
  content: string[];
}

interface LegalPageProps {
  title: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export default function LegalPage({ title, effectiveDate, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <div className="container max-w-[720px] py-20 px-6">
          <h1 className="text-3xl font-bold tracking-[-0.03em] mb-2">{title}</h1>
          <p className="text-[13px] text-muted-foreground/50 mb-12">
            Effective date: {effectiveDate}
          </p>
          <div className="space-y-10">
            {sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-[15px] font-semibold mb-3 text-foreground/90">
                  {i + 1}. {section.title}
                </h2>
                <div className="space-y-3">
                  {section.content.map((paragraph, j) => (
                    <p key={j} className="text-[14px] leading-[1.75] text-muted-foreground/70">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
