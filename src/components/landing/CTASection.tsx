import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <motion.div
          className="relative rounded-2xl border border-border bg-card p-12 md:p-20 text-center overflow-hidden"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Decorative gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/5 rounded-full blur-[100px]" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to make your move?
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
              Start with a free AI consultation. Get your personalized relocation plan in minutes.
            </p>
            <Link to="/chat">
              <Button variant="hero" size="lg" className="gap-2 text-base">
                Talk to RelocateAI <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
