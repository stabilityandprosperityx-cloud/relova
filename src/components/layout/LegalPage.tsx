import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface LegalSection { title: string; content: string[]; }
interface LegalPageProps { title: string; effectiveDate: string; sections: LegalSection[]; }

const pageMeta: Record<string, { eyebrow: string; intro: string; image: string }> = {
  "Our Mission": { eyebrow: "WHY RELOVA EXISTS", intro: "Relocation should begin with clarity, not complexity. We are building a calmer, more human way to understand what comes next.", image: "/assets/footer-mission.jpg" },
  "About Us": { eyebrow: "THE PEOPLE BEHIND RELOVA", intro: "A relocation platform designed around real decisions, real lives and guidance people can trust.", image: "/assets/footer-mission.jpg" },
  "Privacy Policy": { eyebrow: "TRUST BY DESIGN", intro: "A clear account of the information we collect, why we use it and the choices that remain yours.", image: "/assets/footer-security.jpg" },
  "Terms of Service": { eyebrow: "CLEAR EXPECTATIONS", intro: "The terms that keep your relationship with Relova transparent, responsible and easy to understand.", image: "/assets/footer-security.jpg" },
  "Cookie Policy": { eyebrow: "YOUR EXPERIENCE, EXPLAINED", intro: "How Relova uses essential browser technologies while keeping your privacy and control in focus.", image: "/assets/footer-security.jpg" },
  "Data Security": { eyebrow: "PROTECTED AT EVERY STEP", intro: "How we safeguard the personal details, plans and documents entrusted to Relova.", image: "/assets/footer-security.jpg" },
  "Compliance": { eyebrow: "RESPONSIBLE BY DEFAULT", intro: "The standards and principles that shape the way Relova operates across borders.", image: "/assets/footer-security.jpg" },
  "Refund Policy": { eyebrow: "FAIR AND TRANSPARENT", intro: "Straightforward information about eligibility, timing and how refund requests are handled.", image: "/assets/footer-security.jpg" },
};

export default function LegalPage({ title, effectiveDate, sections }: LegalPageProps) {
  const meta = pageMeta[title] || pageMeta["Privacy Policy"];
  const isEditorial = title === "Our Mission" || title === "About Us";
  return <div className="min-h-screen bg-[#fbf6f1]">
    <Navbar />
    <main className="pt-14 legal-premium-page">
      <section className="legal-premium-hero">
        <div className="legal-premium-copy"><span>{meta.eyebrow}</span><h1>{title}</h1><p>{meta.intro}</p>{!isEditorial && <small>Effective {effectiveDate}</small>}</div>
        <div className="legal-premium-image"><img src={meta.image} alt="" /></div>
      </section>
      <div className="legal-premium-layout">
        <aside><span>ON THIS PAGE</span><nav>{sections.map((section,i)=><a key={section.title} href={`#section-${i+1}`}>{String(i+1).padStart(2,"0")} {section.title}</a>)}</nav></aside>
        <article>{sections.map((section,i)=><section id={`section-${i+1}`} key={section.title}><div className="legal-premium-number">{String(i+1).padStart(2,"0")}</div><div><h2>{section.title}</h2>{section.content.map((paragraph,j)=><p key={j}>{paragraph}</p>)}</div></section>)}</article>
      </div>
      <section className="legal-premium-cta"><div><span>NEED A HUMAN ANSWER?</span><h2>We’re here to make things clear.</h2></div><a href="mailto:support@relova.ai">Contact Relova</a></section>
    </main><Footer />
  </div>;
}
