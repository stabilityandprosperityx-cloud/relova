import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layers, FileQuestion, FolderOpen, Compass } from "lucide-react";
import problemFragmented from "@/assets/redesign/problem-fragmented.jpg";
import problemLegal from "@/assets/redesign/problem-legal.jpg";
import problemDocuments from "@/assets/redesign/problem-documents.jpg";
import problemSystem from "@/assets/redesign/problem-system.jpg";

const PROBLEMS = [
  {
    icon: Layers,
    title: "Information is fragmented",
    description: "You're jumping between forums, blogs, and outdated sources.",
    imgSrc: problemFragmented,
    imgAlt: "Person overwhelmed by scattered relocation information across multiple screens",
  },
  {
    icon: FileQuestion,
    title: "Legal steps are unclear",
    description: "Requirements change — and no one explains the full path.",
    imgSrc: problemLegal,
    imgAlt: "Stack of legal documents and visa paperwork creating confusion",
  },
  {
    icon: FolderOpen,
    title: "Documents are overwhelming",
    description: "What to prepare, in what order — it's never clear.",
    imgSrc: problemDocuments,
    imgAlt: "Disorganized pile of documents and folders representing bureaucratic overwhelm",
  },
  {
    icon: Compass,
    title: "No clear system",
    description: "There's no place that guides you from decision to relocation.",
    imgSrc: problemSystem,
    imgAlt: "Person looking at a map without a clear direction or relocation plan",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 md:py-28 bg-background border-t border-border/50">
      <div className="container max-w-6xl px-5 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-16 items-start">

          {/* Left — text */}
          <motion.div
            className="lg:sticky lg:top-24"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-4">
              The Problem
            </p>
            <h2 className="font-serif text-[2rem] sm:text-[2.4rem] md:text-[2.8rem] font-semibold leading-[1.1] mb-5 text-foreground">
              Relocation is harder than it should be.
            </h2>
            <p className="text-[15px] leading-[1.7] text-muted-foreground mb-3">
              Most people waste months searching, comparing, and figuring things out on their own.
            </p>
            <Link
              to="/blog"
              className="text-[14px] font-medium text-primary hover:opacity-75 transition-opacity"
            >
              We've been there. →
            </Link>
          </motion.div>

          {/* Right — 2×2 cards grid */}
          <div className="grid sm:grid-cols-2 gap-5">
            {PROBLEMS.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  className="rounded-2xl overflow-hidden border border-border bg-card"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                >
                  {/* Photo */}
                  <div className="relative w-full" style={{ height: 160 }}>
                    <img loading="lazy"
                      src={p.imgSrc}
                      alt={p.imgAlt}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: "hsl(var(--primary) / 0.08)" }}
                    >
                      <Icon size={17} className="text-primary" strokeWidth={1.8} />
                    </div>
                    <h3 className="text-[15px] font-semibold text-foreground mb-1.5 tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-[13px] text-muted-foreground leading-[1.65]">
                      {p.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
