import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-[60px] md:py-[80px] border-t border-border/40">
      <div className="container">
        <motion.div
          className="max-w-[520px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h2 className="text-[2rem] md:text-[2.75rem] font-bold tracking-tight mb-5 leading-[1.05]">
            Start your next chapter
            <br />
            with clarity.
          </h2>
          <p className="text-muted-foreground text-[15px] mb-10 leading-relaxed">
            Join Relova and get a structured path to your new country.
          </p>
          <Link to="/chat">
            <Button variant="hero" size="lg" className="gap-2.5 text-[14px] h-12 px-7 rounded-[10px]">
              Get my plan <ArrowRight size={15} strokeWidth={2.5} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
