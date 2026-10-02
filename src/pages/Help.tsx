import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Is the information accurate and up to date?", a: "Relova's Relocation Expert draws on current visa rules, tax laws, and residency requirements. For final legal decisions, always verify with a licensed professional." },
  { q: "What if my country isn't listed?", a: "Relova supports any country in the world — not just the ones shown. Just ask." },
  { q: "How is this different from ChatGPT?", a: "Relova is purpose-built for relocation. It understands visa categories, tax structures, citizenship timelines — and asks the right questions to give you a personalized plan, not generic information." },
  { q: "Can I save my relocation plan?", a: "Yes — create a free account to save your conversation and continue where you left off." },
  { q: "Is this legal advice?", a: "No. Relova provides structured guidance and information. Always consult a qualified immigration lawyer for your final decisions." },
];

export default function Help() {
  return <div className="min-h-screen bg-[#fbf6f1]">
    <SEO title="Help Center — Relova" description="Answers and support for your Relova journey." canonical="https://relova.ai/help" jsonLd={{ "@context":"https://schema.org", "@type":"FAQPage", mainEntity:faqs.map(f=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}})) }} />
    <Navbar />
    <main className="pt-14 help-premium-page">
      <section className="help-premium-hero">
        <div><span>RELOVA SUPPORT</span><h1>Answers that move<br/><em>you forward.</em></h1><p>Clear guidance when you need it, with a real path to human support.</p><div className="help-quick-links"><a href="#questions">Browse questions</a><a href="mailto:support@relova.ai">Talk to our team</a></div></div>
        <figure><img src="/assets/footer-help.jpg" alt="Relova member speaking with an advisor online"/><figcaption><i/> Support is online · typical reply within 24 hours</figcaption></figure>
      </section>
      <section className="help-premium-content" id="questions">
        <div className="help-premium-intro"><span>FREQUENTLY ASKED</span><h2>Good questions deserve clear answers.</h2><p>Everything you need to understand how Relova works and how your information is used.</p></div>
        <Accordion type="single" collapsible className="help-premium-accordion">
          {faqs.map((faq,i)=><AccordionItem key={faq.q} value={`item-${i}`}><AccordionTrigger><b>{String(i+1).padStart(2,"0")}</b>{faq.q}</AccordionTrigger><AccordionContent>{faq.a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </section>
      <section className="help-contact-card"><div><span>PERSONAL SUPPORT</span><h2>Still need help?</h2><p>Tell us where you are stuck. Our team usually replies within one business day.</p></div><a href="mailto:support@relova.ai">support@relova.ai</a></section>
    </main><Footer />
  </div>;
}
