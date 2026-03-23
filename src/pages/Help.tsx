import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is the information accurate and up to date?",
    a: "Relova AI is trained on current visa rules, tax laws, and residency requirements. For final legal decisions, always verify with a licensed professional.",
  },
  {
    q: "What if my country isn't listed?",
    a: "Relova supports any country in the world — not just the ones shown. Just ask.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "Relova is purpose-built for relocation. It understands visa categories, tax structures, citizenship timelines — and asks the right questions to give you a personalized plan, not generic information.",
  },
  {
    q: "Can I save my relocation plan?",
    a: "Yes — create a free account to save your conversation and continue where you left off.",
  },
  {
    q: "Is this legal advice?",
    a: "No. Relova provides structured guidance and information. Always consult a qualified immigration lawyer for your final decisions.",
  },
];

export default function Help() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <div className="container max-w-[720px] py-20 px-6">
          <h1 className="text-3xl font-bold mb-2">Help Center</h1>
          <p className="text-muted-foreground mb-10">
            Find answers to common questions or reach out to our team.
          </p>

          <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="mb-12">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/30">
                <AccordionTrigger className="text-[15px] text-left hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-[14px] leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <h2 className="text-lg font-semibold mb-3">Still need help?</h2>
          <p className="text-muted-foreground text-[14px] leading-relaxed">
            Email us at{" "}
            <a href="mailto:support@relova.ai" className="text-sky-400 hover:underline">
              support@relova.ai
            </a>{" "}
            — we typically respond within 24 hours.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
