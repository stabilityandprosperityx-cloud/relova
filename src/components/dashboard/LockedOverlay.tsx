import { Lock, X, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openPaddleCheckout } from "@/config/paddle";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface Props {
  onClose?: () => void;
}

export default function LockedOverlay({ onClose }: Props) {
  const { user } = useAuth();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[440px] bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Close */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Lock icon */}
        <div className="flex justify-center mb-5">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock size={20} className="text-primary" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold tracking-tight text-center mb-5">
          Your relocation plan is ready
        </h3>

        {/* Value */}
        <div className="space-y-2.5 mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Unlock full access:
          </p>
          {[
            "Full step-by-step relocation plan",
            "Complete checklist",
            "Required documents",
            "Risk analysis",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <ShieldCheck size={15} className="text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-foreground">{item}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-5" />

        {/* Warning */}
        <div className="space-y-2 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Without this:
          </p>
          {[
            "You may choose the wrong country",
            "You may lose time and money",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <p className="text-center text-sm text-muted-foreground mb-4">
          <span className="text-xl font-bold text-foreground">$49</span>{" "}
          one-time
        </p>

        {/* CTA */}
        <Button
          className="w-full h-12 text-sm font-semibold"
          onClick={() => openPaddleCheckout("full", user?.email ?? undefined, user?.id)}
        >
          Unlock your plan →
        </Button>

        {/* Secondary */}
        {onClose && (
          <button
            onClick={onClose}
            className="block w-full text-center text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
          >
            Continue with limited access
          </button>
        )}
      </div>
    </div>
  );
}
