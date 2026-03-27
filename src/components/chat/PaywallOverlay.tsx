import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck, AlertTriangle, X } from "lucide-react";
import { openPayment } from "@/config/payments";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface Props {
  onClose?: () => void;
}

export default function PaywallOverlay({ onClose }: Props) {
  const { user } = useAuth();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handleEsc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handleEsc); };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-[440px] bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        )}

        <div className="flex justify-center mb-5">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock size={20} className="text-primary" />
          </div>
        </div>

        <h3 className="text-lg font-bold tracking-tight text-center mb-5">
          Your relocation plan is ready
        </h3>

        <div className="space-y-2.5 mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Unlock full access:</p>
          {["Full step-by-step relocation plan", "Complete checklist", "Required documents", "Risk analysis"].map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <ShieldCheck size={15} className="text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-foreground">{item}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-border mb-5" />

        <div className="space-y-2 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Without this:</p>
          {["You may choose the wrong country", "You may lose time and money"].map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mb-4">
          <span className="text-xl font-bold text-foreground">$49</span> one-time
        </p>

        <Button className="w-full h-12 text-sm font-semibold" onClick={() => openPayment("full", user?.email ?? undefined, user?.id)}>
          Unlock your plan →
        </Button>

        {onClose && (
          <button onClick={onClose} className="block w-full text-center text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors">
            Continue with limited access
          </button>
        )}
      </motion.div>
    </div>
  );
}
