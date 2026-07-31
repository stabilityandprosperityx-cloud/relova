import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const MATCH_REASONS = [
  "High quality of life",
  "Welcoming residence options",
  "Low cost of living",
  "Great for remote work",
];

export default function BestMatchCard() {
  return (
    <div
      className="bg-card rounded-2xl shadow-xl overflow-hidden w-[240px]"
      style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.14)" }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[9px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2">
          Your best match
        </p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🇵🇹</span>
          <span className="font-serif text-[17px] font-semibold text-foreground">Portugal</span>
        </div>

        {/* Why it's a great match */}
        <p className="text-[10px] font-medium text-muted-foreground mb-2">
          Why it's a great match:
        </p>
        <ul className="space-y-1.5 mb-3">
          {MATCH_REASONS.map((reason) => (
            <li key={reason} className="flex items-center gap-2">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Check size={9} className="text-primary" strokeWidth={2.5} />
              </span>
              <span className="text-[11px] text-foreground/80">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Plan progress */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium text-foreground">Your Relocation Plan</span>
          <span className="text-[10px] text-muted-foreground">29%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mb-3">
          <div className="h-full w-[29%] rounded-full bg-primary" />
        </div>
        <Link
          to="/chat"
          className="flex items-center justify-between w-full text-[11px] font-medium text-primary hover:opacity-80 transition-opacity"
        >
          <span>View your plan</span>
          <ArrowRight size={11} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}
