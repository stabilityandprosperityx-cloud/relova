import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export default function ComparisonSection() {
  const compRows = [
    { label: "Personalized visa plan", chatgpt: false, lawyer: "partial", relova: true },
    { label: "Step-by-step checklist", chatgpt: false, lawyer: "partial", relova: true },
    { label: "Cost breakdown (70 countries)", chatgpt: false, lawyer: false, relova: true },
    { label: "Visa cover letter", chatgpt: false, lawyer: "paid", relova: true },
    { label: "Knows your passport & budget", chatgpt: false, lawyer: true, relova: true },
    { label: "Available 24/7", chatgpt: true, lawyer: false, relova: true },
    { label: "Price", chatgpt: "$20/mo", lawyer: "$200+/hr", relova: "From $0" },
  ];

  const quotes = [
    { text: "Used ChatGPT — got generic advice, applied for the wrong visa, wasted 3 months.", author: "David L., New York" },
    { text: "Hired a lawyer — $800 later, still waiting for a callback.", author: "Ana R., São Paulo" },
    { text: "Used Relova — plan ready in 10 minutes.", author: "Mikhail T., Moscow" },
  ];

  const renderValue = (value: boolean | string) => {
    if (value === true) {
      return <Check size={14} className="text-emerald-400 mx-auto" strokeWidth={2.5} />;
    }
    if (value === false) {
      return <X size={14} className="text-muted-foreground/40 mx-auto" strokeWidth={2.5} />;
    }
    if (value === "partial") {
      return <span className="text-[13px] text-muted-foreground/60">~</span>;
    }
    if (value === "paid") {
      return <span className="text-[13px] text-muted-foreground/60">$$$</span>;
    }
    return <span className="text-[13px] text-muted-foreground/80">{value}</span>;
  };

  return (
    <section className="py-[60px] md:py-[80px] border-t border-border/40">
      <div className="container">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-[13px] text-muted-foreground mb-4 uppercase tracking-wider font-medium">
            Comparison
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Why Relova vs everything else
          </h2>
        </motion.div>

        <motion.div
          className="overflow-hidden rounded-xl border border-border/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] bg-muted/30">
            <div className="px-5 py-4 md:px-8 md:py-5" />
            <div className="px-5 py-4 md:px-8 md:py-5 border-l border-border/40">
              <p className="text-[12px] text-muted-foreground/60 uppercase tracking-wider font-medium">ChatGPT</p>
            </div>
            <div className="px-5 py-4 md:px-8 md:py-5 border-l border-border/40">
              <p className="text-[12px] text-muted-foreground/60 uppercase tracking-wider font-medium">Immigration Lawyer</p>
            </div>
            <div className="px-5 py-4 md:px-8 md:py-5 border-l border-border/40 bg-primary/5">
              <p className="text-[12px] text-primary uppercase tracking-wider font-semibold">Relova</p>
            </div>
          </div>

          {compRows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1.4fr_1fr_1fr_1fr] border-t border-border/30 ${
                i % 2 === 0 ? "" : "bg-muted/10"
              }`}
            >
              <div className="px-5 py-5 md:px-8 md:py-6">
                <p className="text-[14px] font-medium text-foreground/90">
                  {row.label}
                </p>
              </div>
              <div className="px-5 py-5 md:px-8 md:py-6 border-l border-border/30 flex items-center justify-center text-center">
                {renderValue(row.chatgpt)}
              </div>
              <div className="px-5 py-5 md:px-8 md:py-6 border-l border-border/30 flex items-center justify-center text-center">
                {renderValue(row.lawyer)}
              </div>
              <div className="px-5 py-5 md:px-8 md:py-6 border-l border-border/30 bg-primary/[0.03] flex items-center justify-center text-center">
                {renderValue(row.relova)}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {quotes.map((quote, i) => (
            <div
              key={quote.author}
              className={`rounded-xl p-5 ${
                i === 2
                  ? "border border-primary/30 bg-primary/[0.03]"
                  : "border border-border/40 bg-card/50"
              }`}
            >
              <p className={`text-[13px] leading-relaxed italic ${
                i === 2 ? "text-foreground/80" : "text-muted-foreground"
              }`}>
                {quote.text}
              </p>
              <p className={`text-[12px] mt-3 ${
                i === 2 ? "text-primary/60" : "text-muted-foreground/50"
              }`}>
                {quote.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
