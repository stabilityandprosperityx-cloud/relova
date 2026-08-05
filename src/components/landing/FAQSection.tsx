import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import faqLifestyle from "@/assets/redesign/faq-lifestyle.jpg";

const faqs = [
  {
    question: "Is the information accurate and up to date?",
    answer:
      "Relova's Relocation Expert draws on current visa rules, tax laws, and residency requirements. For final legal decisions, always verify with a licensed professional.",
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
    <section className="py-20 md:py-28 border-t border-border/50 bg-secondary">
      <div className="container max-w-6xl px-5 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.6fr_0.6fr] gap-10 lg:gap-10 items-start">

          {/* Left — text */}
          <motion.div
            className="lg:sticky lg:top-24 relative z-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-4">
              FAQ
            </p>
            <h2 className="font-serif text-[2rem] sm:text-[2.4rem] md:text-[2.8rem] font-semibold leading-[1.1] mb-6 text-foreground">
              Frequently asked questions.
            </h2>
            <p className="text-[14px] text-muted-foreground mb-3">
              Can't find the answer you're looking for?
            </p>
            <div className="flex flex-col gap-2 items-start">
              <Link
                to="/tools/can-i-move"
                className="text-[14px] font-medium text-primary hover:opacity-75 transition-opacity"
              >
                Free visa eligibility check →
              </Link>
              <Link
                to="/tools/where-should-i-move"
                className="text-[14px] font-medium text-primary hover:opacity-75 transition-opacity"
              >
                Where should I move? →
              </Link>
              <Link
                to="/tools/documents-needed"
                className="text-[14px] font-medium text-primary hover:opacity-75 transition-opacity"
              >
                Document checklist finder →
              </Link>
              <Link
                to="/contact"
                className="text-[14px] font-medium text-primary hover:opacity-75 transition-opacity"
              >
                Contact us →
              </Link>
            </div>
          </motion.div>

          {/* Right — accordion */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="divide-y divide-border">
              {faqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={i}>
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-center justify-between py-5 text-left gap-4 group"
                    >
                      <span className="text-[15px] font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-muted-foreground group-hover:text-primary shrink-0 transition-all duration-300 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                        strokeWidth={2}
                      />
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        maxHeight: isOpen ? "300px" : "0px",
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <p className="pb-5 text-[14px] text-muted-foreground leading-[1.75]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right — lifestyle photo */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-[380px] h-[420px] overflow-hidden flex-shrink-0">
              <img loading="lazy"
                src={faqLifestyle}
                alt="Person relaxing at home after a successful international relocation"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
