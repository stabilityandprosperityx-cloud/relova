import { motion } from "framer-motion";
import { MessageSquare, ClipboardCheck, Map, FileText, Globe, Calculator } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI relocation advisor",
    description: "Unlimited personalized answers about visas, taxes, banking — specific to your passport and situation.",
    color: "rgba(139,92,246,0.1)",
    iconColor: "#8b5cf6",
  },
  {
    icon: ClipboardCheck,
    title: "Personalized checklist",
    description: "A tailored checklist with clear next steps and progress tracking from start to stable life.",
    color: "rgba(99,102,241,0.1)",
    iconColor: "#6366f1",
  },
  {
    icon: Map,
    title: "Step-by-step move plan",
    description: "51 steps organized by phase: Preparation → Arrival → Legal setup → Settlement.",
    color: "rgba(139,92,246,0.1)",
    iconColor: "#8b5cf6",
  },
  {
    icon: FileText,
    title: "Documents & visa letter",
    description: "Manage required documents and generate a visa cover letter — saves $300+ on lawyers.",
    color: "rgba(99,102,241,0.1)",
    iconColor: "#6366f1",
  },
  {
    icon: Globe,
    title: "Countries explorer",
    description: "Compare 70+ destinations with visas, stability, climate, and language context.",
    color: "rgba(139,92,246,0.1)",
    iconColor: "#8b5cf6",
  },
  {
    icon: Calculator,
    title: "Relocation cost calculator",
    description: "Real monthly costs for 70+ cities. Rent, visa fees, insurance — adjusted for your family size.",
    color: "rgba(99,102,241,0.1)",
    iconColor: "#6366f1",
  },
];

export default function FeaturesSection() {
  return (
    <section className="pt-0 pb-[60px] md:pb-[80px]">
      <div className="container">
        <p className="text-[11px] text-muted-foreground/60 mb-10 uppercase tracking-[0.15em] font-medium">Features</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="card-premium p-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.color }}
              >
                <f.icon size={18} style={{ color: f.iconColor }} />
              </div>
              <h3 className="text-[15px] font-semibold tracking-tight mb-2">{f.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
