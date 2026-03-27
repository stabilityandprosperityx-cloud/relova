import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RelovaLogo from "@/components/RelovaLogo";

const lines = [
  "Analyzing your profile",
  "Matching countries",
  "Comparing legal pathways",
  "Estimating time to stability",
  "Preparing your next steps",
];

interface Props {
  onFinished: () => void;
}

export default function LoadingTransition({ onFinished }: Props) {
  const [activeLine, setActiveLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLine((prev) => {
        if (prev >= lines.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    const timeout = setTimeout(() => {
      onFinished();
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onFinished]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0b]"
    >
      <div className="flex flex-col items-center gap-8 max-w-sm mx-4">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <RelovaLogo size={48} pulse glow className="text-[#38BDF8]" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-[18px] font-semibold text-[#EDEDED] text-center tracking-tight"
        >
          Building your relocation strategy
        </motion.h2>

        {/* Animated lines */}
        <div className="space-y-3 w-full">
          {lines.map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -12 }}
              animate={{
                opacity: i <= activeLine ? 1 : 0.15,
                x: i <= activeLine ? 0 : -12,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-3"
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                animate={{
                  backgroundColor: i <= activeLine ? "#38BDF8" : "rgba(138,143,152,0.3)",
                  scale: i === activeLine ? [1, 1.4, 1] : 1,
                }}
                transition={{
                  scale: { duration: 0.6, repeat: i === activeLine ? Infinity : 0, ease: "easeInOut" },
                  backgroundColor: { duration: 0.3 },
                }}
              />
              <span
                className={`text-[13px] transition-colors duration-300 ${
                  i <= activeLine ? "text-[#EDEDED]" : "text-[#8A8F98]/30"
                } ${i === activeLine ? "font-medium" : ""}`}
              >
                {line}
              </span>
              {i < activeLine && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[#38BDF8] text-[11px] ml-auto"
                >
                  ✓
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Subtle progress bar */}
        <div className="w-full h-[2px] bg-white/[0.04] rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-[#38BDF8]/60 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
