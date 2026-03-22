import { motion } from "framer-motion";

const pathways = [
  {
    country: "Portugal",
    description: "Naturalization path based on 5 years of legal residence. Multiple visa categories available for different profiles.",
  },
  {
    country: "Australia",
    description: "Permanent residency required before citizenship. Typically 4 years of residence, with language and residency requirements. Points-based skilled migration system.",
  },
  {
    country: "UAE",
    description: "Residency programs explained clearly — from freelance visas to investor permits and golden visa options.",
  },
];

export default function LegalPathwaysSection() {
  return (
    <section className="py-[60px] md:py-[80px] border-t border-border/40">
      <div className="container">
        <motion.div
          className="mb-16 max-w-[560px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-[11px] text-muted-foreground/60 mb-5 uppercase tracking-[0.15em] font-medium">Legal pathways</p>
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-tight mb-4 leading-[1.1]">
            Residency and citizenship, explained clearly
          </h2>
          <p className="text-[14px] text-muted-foreground leading-[1.65]">
            Understand legal pathways country by country — without making false assumptions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {pathways.map((p, i) => (
            <motion.div
              key={p.country}
              className="p-7 rounded-xl border border-border/40 bg-card/50 shadow-[0_2px_20px_-6px_hsl(0_0%_0%/0.25)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
            >
              <h3 className="text-[18px] font-semibold mb-3 tracking-tight">{p.country}</h3>
              <p className="text-[13px] text-muted-foreground leading-[1.7]">{p.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-8 text-[11px] text-muted-foreground/40 max-w-[480px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          Relova provides informational guidance only. We do not provide legal advice or guarantee outcomes. Always consult a qualified professional.
        </motion.p>
      </div>
    </section>
  );
}
