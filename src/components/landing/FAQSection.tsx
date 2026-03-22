import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is the information accurate and up to date?",
    answer:
      "Relova AI is trained on current visa rules, tax laws, and residency requirements. For final legal decisions, always verify with a licensed professional.",
  },
  {
    question: "What if my country isn't listed?",
    answer:
      "Relova supports any country in the world — not just the ones shown. Just ask.",
  },
  {
    question: "How is this different from ChatGPT?",
    answer:
      "Relova is purpose-built for relocation. It understands visa categories, tax structures, citizenship timelines — and asks the right questions to give you a personalized plan, not generic information.",
  },
  {
    question: "Can I save my relocation plan?",
    answer:
      "Yes — create a free account to save your conversation and continue where you left off.",
  },
  {
    question: "Is this legal advice?",
    answer:
      "No. Relova provides structured guidance and information. Always consult a qualified immigration lawyer for your final decisions.",
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
