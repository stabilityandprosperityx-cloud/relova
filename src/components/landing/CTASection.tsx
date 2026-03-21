import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-32 md:py-40 border-t border-border">
      <div className="container">
        <motion.div
          className="max-w-lg"
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-[1.1]">
            Your new country
            <br />
            is waiting.
          </h2>
          <p className="text-muted-foreground text-[15px] mb-8">
            Get a personalized relocation plan in minutes. Free to start.
          </p>
          <Link to="/chat">
            <Button size="lg" className="gap-2 text-[14px] h-11 px-6 rounded-lg">
              Start your relocation plan <ArrowRight size={15} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
