import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How accurate is the information?",
    answer:
      "Relova is updated regularly with current visa rules, income requirements, and residency timelines. For final legal decisions, always verify with official government sources or a licensed professional.",
  },
  {
    question: "What if my country isn't listed?",
    answer:
      "We cover 70 countries with detailed data. For any other country, the AI Advisor can still answer questions and guide you — it's not limited to the list.",
  },
  {
    question: "How is this different from ChatGPT?",
    answer:
      "ChatGPT gives generic answers. Relova knows your passport, budget, family situation, and goals — and builds a structured, step-by-step plan specific to your case. It also generates real documents like visa cover letters.",
  },
  {
    question: "How long does it take to get my plan?",
    answer:
      "The onboarding takes about 4 minutes. Your personalized plan, checklist, and cost breakdown are ready immediately after.",
  },
  {
    question: "Do I need to know which country I want?",
    answer:
      "No. You can start with a question like 'where should I move?' and Relova will help you figure it out based on your passport, income, goals, and preferences.",
  },
  {
    question: "I already know my destination — can Relova still help?",
    answer:
      "Absolutely. Skip the discovery phase and go straight to your visa checklist, step-by-step plan, cost breakdown, and cover letter for your chosen country.",
  },
  {
    question: "Is this legal advice?",
    answer:
      "No. Relova provides structured information and planning tools. For complex cases or final decisions, we recommend consulting a qualified immigration lawyer.",
  },
  {
    question: "What documents does Relova help with?",
    answer:
      "Relova generates visa cover letters, provides document checklists per visa type, and gives you a timeline for gathering and submitting everything.",
  },
  {
    question: "Can I use this for my whole family?",
    answer:
      "Yes. Set your family status during onboarding and Relova adjusts cost estimates, visa requirements, and the relocation plan for your situation.",
  },
  {
    question: "What if visa rules change after I start my plan?",
    answer:
      "Immigration rules change frequently. We update our data regularly, but always cross-check with official embassy or government websites before submitting any application.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-[60px] md:py-[80px] border-t border-border/40">
      <div className="container max-w-[720px]">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-[11px] text-muted-foreground/60 mb-4 uppercase tracking-[0.15em] font-medium">
            FAQ
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Common questions
          </h2>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                className="rounded-xl border border-border/40 bg-card/50 overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-muted/20 active:scale-[0.99]"
                >
                  <span className="text-[14px] font-medium text-foreground/90 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-primary shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={2.5}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: isOpen ? "200px" : "0px",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p className="px-6 pb-5 text-[13px] text-muted-foreground leading-[1.7]">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
