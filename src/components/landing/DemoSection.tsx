import { motion } from "framer-motion";
import ChatWidget from "@/components/chat/ChatWidget";

export default function DemoSection() {
  return (
    <section className="py-[60px] md:py-[80px] border-t border-border/40">
      <div className="container">
        <motion.p
          className="text-[11px] text-muted-foreground/60 mb-12 uppercase tracking-[0.15em] font-medium"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          See it in action
        </motion.p>

        <motion.div
          className="max-w-[780px] mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <ChatWidget maxHeight="420px" />
        </motion.div>
      </div>
    </section>
  );
}
