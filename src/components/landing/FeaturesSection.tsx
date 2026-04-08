import { motion } from "framer-motion";
import { MessageSquare, ClipboardCheck, Map, FileText, Globe, Calculator } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI relocation advisor",
    description: "Unlimited personalized answers based on your passport, budget, and goals.",
  },
  {
    icon: ClipboardCheck,
    title: "Personalized checklist",
    description: "Get a tailored checklist with clear next steps and progress tracking.",
  },
  {
    icon: Map,
    title: "Step-by-step move plan",
    description: "See deadlines and milestones in one timeline from prep to relocation.",
  },
  {
    icon: FileText,
    title: "Documents & visa letter",
    description: "Manage required documents and generate a visa cover letter draft.",
  },
  {
    icon: Globe,
    title: "Countries explorer",
    description: "Compare 70+ destinations with visas, stability, climate, and language context.",
  },
  {
    icon: Calculator,
    title: "Relocation cost calculator",
    description: "Estimate monthly living costs and budget fit for your destination.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="pt-0 pb-[60px] md:pb-[80px]">
      <div className="container">
        <motion.p
          className="text-[11px] text-muted-foreground/60 mb-12 uppercase tracking-[0.15em] font-medium"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          Features
        </motion.p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="relative p-7 rounded-xl border border-border/40 bg-card/50 hover:bg-card/80 shadow-[0_2px_20px_-6px_hsl(0_0%_0%/0.25)] transition-all duration-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
            >
              <feature.icon size={20} className="text-primary mb-5" strokeWidth={1.8} />
              <h3 className="text-[16px] font-semibold mb-2.5 tracking-tight">{feature.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-[1.65]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
