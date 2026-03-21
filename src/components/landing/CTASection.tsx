import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-24 md:py-32 border-t border-border">
      <div className="container">
        <motion.div
          className="relative rounded-2xl border border-primary/20 bg-card p-12 md:p-20 text-center overflow-hidden glow-md"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative">
            <p className="text-sm text-primary font-medium mb-4">Stop researching. Start moving.</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Your new country is waiting.
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
              Get a personalized relocation plan in under 5 minutes. Free to start. No credit card.
            </p>
            <Link to="/chat">
              <Button variant="hero" size="lg" className="gap-2 text-base h-12 px-7">
                Start your relocation plan <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
