import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RelovaLogoProps {
  size?: number;
  pulse?: boolean;
  className?: string;
}

export default function RelovaLogo({ size = 28, pulse = true, className }: RelovaLogoProps) {
  const dotR = size * 0.14;
  const ringR = size * 0.38;
  const strokeW = size * 0.045;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={ringR}
        stroke="currentColor"
        strokeWidth={strokeW}
        opacity={0.5}
      />
      {/* Dot */}
      {pulse ? (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={dotR}
          fill="currentColor"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <circle cx={size / 2} cy={size / 2} r={dotR} fill="currentColor" />
      )}
    </svg>
  );
}
