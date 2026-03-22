import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  planRequired?: "pro" | "full";
}

export default function LockedOverlay({ planRequired = "full" }: Props) {
  const navigate = useNavigate();
  const label = planRequired === "pro" ? "Pro" : "Full";
  const price = planRequired === "pro" ? "$19" : "$49";

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm bg-[#0a0a0a]/70">
      <div className="text-center space-y-3">
        <Lock size={28} className="mx-auto text-[#9CA3AF]/50" />
        <p className="text-[13px] text-[#9CA3AF]">Available in {label} Plan</p>
        <Button
          size="sm"
          className="text-[12px] bg-[#38BDF8] hover:bg-[#38BDF8]/80"
          onClick={() => navigate("/pricing")}
        >
          Upgrade to {label} {price} →
        </Button>
      </div>
    </div>
  );
}
