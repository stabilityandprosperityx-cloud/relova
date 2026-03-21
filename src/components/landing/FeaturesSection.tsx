import { MessageSquare, Map, ClipboardList, Users } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: MessageSquare,
    title: "AI Relocation Assistant",
    description: "Ask anything about visas, documents, taxes, and local regulations. Get instant, contextual answers.",
  },
  {
    icon: Map,
    title: "Country Intelligence",
    description: "Detailed dashboards with visa options, cost of living, tax regimes, and step-by-step relocation checklists.",
  },
  {
    icon: ClipboardList,
    title: "Personalized Plans",
    description: "Answer a few questions about your goals. Our AI builds a custom relocation roadmap tailored to your situation.",
  },
  {
    icon: Users,
    title: "Service Marketplace",
    description: "Connect with vetted immigration lawyers, relocation agents, and real estate professionals in your target country.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything you need to relocate
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            One platform replaces dozens of tabs, spreadsheets, and WhatsApp groups.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative p-8 rounded-xl border border-border bg-card hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
