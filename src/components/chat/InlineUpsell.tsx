import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { openPayment } from "@/config/payments";

interface InlineUpsellProps {
  questionsUsed: number;
  questionsLimit: number;
}

export default function InlineUpsell({ questionsUsed, questionsLimit }: InlineUpsellProps) {
  return (
    <motion.div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-primary/15 bg-primary/[0.03] mt-2"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Sparkles size={14} className="text-primary shrink-0" />
        <span className="text-xs text-muted-foreground truncate">
          {questionsUsed}/{questionsLimit} free questions used · Get a personalized plan
        </span>
      </div>
      <Button variant="hero" size="sm" className="text-[11px] h-7 px-3 shrink-0 rounded-md" onClick={() => openPayment("pro")}>
        Unlock Pro
      </Button>
    </motion.div>
  );
}
