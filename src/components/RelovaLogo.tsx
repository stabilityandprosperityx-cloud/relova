import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RelovaLogoProps {
  size?: number;
  pulse?: boolean;
  glow?: boolean;
  className?: string;
}

export default function RelovaLogo({ size = 28, pulse = true, glow = false, className }: RelovaLogoProps) {
  const cx = size / 2;
  const cy = size / 2;
  const dotR = size * 0.13;
  const ringR = size * 0.38;
  const strokeW = size * 0.04;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={cn("shrink-0", className)}
    >
      {glow && (
        <defs>
          <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={size * 0.06} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* Ring */}
      {pulse ? (
        <motion.circle
          cx={cx}
          cy={cy}
          r={ringR}
          stroke="currentColor"
          strokeWidth={strokeW}
          animate={{ opacity: [0.4, 0.55, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <circle cx={cx} cy={cy} r={ringR} stroke="currentColor" strokeWidth={strokeW} opacity={0.5} />
      )}

      {/* Dot with expanding pulse */}
      {pulse ? (
        <motion.circle
          cx={cx}
          cy={cy}
          fill="currentColor"
          filter={glow ? "url(#dot-glow)" : undefined}
          animate={{
            r: [dotR, dotR * 1.35, dotR],
            opacity: [0.85, 1, 0.85],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <circle cx={cx} cy={cy} r={dotR} fill="currentColor" />
      )}
    </svg>
  );
}
