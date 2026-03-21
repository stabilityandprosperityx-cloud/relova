import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PaywallOverlay() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center py-12 px-6"
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
        <Lock size={20} className="text-primary" />
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-2">
        Get your full relocation plan
      </h3>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm">
        Unlock personalized answers, step-by-step guidance, and your full relocation roadmap.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link to="/pricing" className="flex-1">
          <Button variant="hero" className="w-full gap-1.5 text-[13px]">
            Upgrade to Pro — $19 <ArrowRight size={13} />
          </Button>
        </Link>
        <Link to="/pricing" className="flex-1">
          <Button variant="outline" className="w-full text-[13px]">
            Full Plan — $49
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
