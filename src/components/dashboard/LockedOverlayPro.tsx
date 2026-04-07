import { Lock, X, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openPaddleCheckout } from "@/config/paddle";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface Props {
  onClose?: () => void;
}

export default function LockedOverlayPro({ onClose }: Props) {
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
      <div className="relative z-10 w-full max-w-[440px] bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl">
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
        <h3 className="text-lg font-bold tracking-tight text-center mb-2">
          Unlock your relocation checklist
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-5">
          Get a personalized step-by-step action plan for your move
        </p>
        <div className="space-y-2.5 mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Pro plan includes:
          </p>
          {[
            "Unlimited AI Advisor questions",
            "Personalized relocation checklist",
            "Move timeline with deadlines",
            "Cost calculator for 70+ countries",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <ShieldCheck size={15} className="text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-foreground">{item}</span>
            </div>
          ))}
        </div>
        <div className="h-px bg-border mb-5" />
        <div className="space-y-2 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Without Pro:
          </p>
          {[
            "Only 3 questions to your AI Advisor",
            "No action plan or checklist",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-xl font-bold text-foreground">$19</span>/month
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">Cancel anytime</p>
        </div>
        <Button
          className="w-full h-12 text-sm font-semibold"
          onClick={() => openPaddleCheckout("pro", user?.email ?? undefined, user?.id)}
        >
          Start with Pro →
        </Button>
        <button
          onClick={onClose}
          className="block w-full text-center text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
        >
          Continue with limited access
        </button>
      </div>
    </div>
  );
}
