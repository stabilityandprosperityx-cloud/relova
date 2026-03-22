import { motion } from "framer-motion";
import { MessageSquare, Globe, FileText, Shield, Briefcase, Home } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Find the right country",
    description: "Based on your income, goals, and lifestyle.",
  },
  {
    icon: Globe,
    title: "Build your relocation plan",
    description: "Step-by-step, tailored to your situation.",
  },
  {
    icon: FileText,
    title: "Understand the legal path",
    description: "Clear visa options and requirements — no confusion.",
  },
  {
    icon: Shield,
    title: "Compare countries",
    description: "Costs, taxes, and lifestyle — side by side.",
  },
  {
    icon: Briefcase,
    title: "Jobs & Opportunities",
    description: "Explore work opportunities in your destination country.",
  },
  {
    icon: Home,
    title: "Housing & Community",
    description: "Find housing options and connect with local communities.",
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
