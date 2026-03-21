import { motion } from "framer-motion";
import { MessageSquare, Globe, FileText, Shield, Briefcase, Home } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Relocation Advisor",
    description: "Ask questions about moving and get structured, country-specific answers.",
  },
  {
    icon: Globe,
    title: "Country Guides",
    description: "Compare countries, costs, legal realities, and lifestyle — side by side.",
  },
  {
    icon: FileText,
    title: "Documents & Visas",
    description: "Understand required documents and process steps for your destination.",
  },
  {
    icon: Shield,
    title: "Residency & Citizenship Paths",
    description: "See the legal pathway more clearly, country by country.",
  },
  {
    icon: Briefcase,
    title: "Jobs & Opportunities",
    description: "Explore work opportunities in your destination country.",
    comingSoon: true,
  },
  {
    icon: Home,
    title: "Housing & Community",
    description: "Find housing options and connect with local communities.",
    comingSoon: true,
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-28 md:py-36 border-t border-border/40">
      <div className="container">
        <motion.p
          className="text-[11px] text-muted-foreground/60 mb-12 uppercase tracking-[0.15em] font-medium"
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Features
        </motion.p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="relative p-7 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors duration-300"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              {feature.comingSoon && (
                <span className="absolute top-5 right-5 text-[10px] text-muted-foreground/50 font-medium uppercase tracking-[0.1em]">Coming soon</span>
              )}
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
