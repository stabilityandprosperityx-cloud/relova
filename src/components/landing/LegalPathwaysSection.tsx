import { motion } from "framer-motion";

const pathways = [
  { flag: "🇵🇹", country: "Portugal", visa: "D7 / Digital Nomad", income: "$1,500/mo", residency: "5 years", difficulty: "Easy" },
  { flag: "🇪🇸", country: "Spain", visa: "Non-Lucrative / DN", income: "$2,300/mo", residency: "5 years", difficulty: "Medium" },
  { flag: "🇦🇪", country: "UAE", visa: "Freelance / Golden", income: "$0 / inv.", residency: "2–10 years", difficulty: "Easy" },
  { flag: "🇩🇪", country: "Germany", visa: "Freelance / Job Seeker", income: "$1,400/mo", residency: "5 years", difficulty: "Hard" },
  { flag: "🇹🇭", country: "Thailand", visa: "LTR / SMART Visa", income: "$2,000/mo", residency: "No path", difficulty: "Easy" },
  { flag: "🇬🇪", country: "Georgia", visa: "Remotely from Georgia", income: "$0", residency: "1 year", difficulty: "Very Easy" },
  { flag: "🇲🇽", country: "Mexico", visa: "Temporary Residency", income: "$1,620/mo", residency: "4 years", difficulty: "Easy" },
  { flag: "🇨🇦", country: "Canada", visa: "Express Entry / PR", income: "Skills-based", residency: "3 years", difficulty: "Medium" },
  { flag: "🇺🇸", country: "USA", visa: "O-1 / EB-1 / EB-5", income: "Skills / inv.", residency: "5+ years", difficulty: "Very Hard" },
];

export default function LegalPathwaysSection() {
  return (
    <section className="py-[60px] md:py-[80px] border-t border-border/40">
      <div className="container">
        <motion.div
          className="mb-16 max-w-[560px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
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

        <div className="grid md:grid-cols-3 gap-4">
          {pathways.map((p, i) => (
            <motion.div
              key={p.country}
              className="p-7 rounded-xl border border-border/40 bg-card/50 shadow-[0_2px_20px_-6px_hsl(0_0%_0%/0.25)]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
            >
              <div className="text-3xl mb-2">{p.flag}</div>
              <h3 className="text-[16px] font-semibold mb-3 tracking-tight">{p.country}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[11px] text-muted-foreground/50">Visa</span>
                  <span className="text-[11px] text-foreground/80 font-medium">{p.visa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-muted-foreground/50">Min. income</span>
                  <span className="text-[11px] text-foreground/80 font-medium">{p.income}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-muted-foreground/50">Residency</span>
                  <span className="text-[11px] text-foreground/80 font-medium">{p.residency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-muted-foreground/50">Difficulty</span>
                  <span className={`text-[11px] font-medium ${
                    p.difficulty === "Very Easy" || p.difficulty === "Easy"
                      ? "text-emerald-400"
                      : p.difficulty === "Medium"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}>{p.difficulty}</span>
                </div>
              </div>
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
