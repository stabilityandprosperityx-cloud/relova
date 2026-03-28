import { motion } from "framer-motion";

interface BlogHeroVisualProps {
  variant?: "journey" | "compare" | "ranking";
}

export default function BlogHeroVisual({ variant = "journey" }: BlogHeroVisualProps) {
  return (
    <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-12 bg-[hsl(220,15%,5%)] border border-border/20">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(200,60%,52%) 1px, transparent 1px), linear-gradient(90deg, hsl(200,60%,52%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,hsl(200,60%,52%,0.06),transparent)]" />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 260" fill="none" preserveAspectRatio="xMidYMid meet">
        {variant === "journey" && <JourneyVisual />}
        {variant === "compare" && <CompareVisual />}
        {variant === "ranking" && <RankingVisual />}
      </svg>
    </div>
  );
}

function JourneyVisual() {
  return (
    <g>
      {/* Connection line */}
      <motion.line
        x1="200" y1="130" x2="600" y2="130"
        stroke="hsl(200,60%,52%)"
        strokeWidth="1"
        strokeDasharray="4 6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Point A */}
      <motion.circle
        cx="200" cy="130" r="6"
        fill="hsl(200,60%,52%)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.circle
        cx="200" cy="130" r="16"
        stroke="hsl(200,60%,52%)"
        strokeWidth="1"
        fill="none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      <motion.text
        x="200" y="170"
        textAnchor="middle"
        fill="hsl(220,10%,45%)"
        fontSize="11"
        fontFamily="Inter, sans-serif"
        letterSpacing="0.08em"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ORIGIN
      </motion.text>

      {/* Midpoint nodes */}
      {[330, 400, 470].map((x, i) => (
        <motion.circle
          key={x}
          cx={x} cy={130} r="2"
          fill="hsl(200,60%,52%)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.8 + i * 0.15 }}
        />
      ))}

      {/* Arrow */}
      <motion.path
        d="M580 130 L600 130 M592 122 L600 130 L592 138"
        stroke="hsl(200,60%,52%)"
        strokeWidth="1.5"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2 }}
      />

      {/* Point B */}
      <motion.circle
        cx="600" cy="130" r="6"
        fill="hsl(200,60%,52%)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      />
      <motion.circle
        cx="600" cy="130" r="16"
        stroke="hsl(200,60%,52%)"
        strokeWidth="1"
        fill="none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 0.6, delay: 1.1 }}
      />
      <motion.text
        x="600" y="170"
        textAnchor="middle"
        fill="hsl(220,10%,45%)"
        fontSize="11"
        fontFamily="Inter, sans-serif"
        letterSpacing="0.08em"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        DESTINATION
      </motion.text>

      {/* Pulse on point B */}
      <motion.circle
        cx="600" cy="130" r="6"
        fill="hsl(200,60%,52%)"
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.8 }}
      />
    </g>
  );
}

function CompareVisual() {
  return (
    <g>
      {/* Left node */}
      <motion.rect
        x="220" y="90" width="80" height="80" rx="8"
        stroke="hsl(200,60%,52%)"
        strokeWidth="1"
        fill="hsl(200,60%,52%,0.04)"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      />
      <motion.text
        x="260" y="136"
        textAnchor="middle"
        fill="hsl(220,10%,55%)"
        fontSize="10"
        fontFamily="Inter, sans-serif"
        letterSpacing="0.1em"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        A
      </motion.text>

      {/* VS divider */}
      <motion.line
        x1="400" y1="95" x2="400" y2="165"
        stroke="hsl(200,60%,52%)"
        strokeWidth="1"
        strokeDasharray="2 4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 0.3 }}
      />
      <motion.text
        x="400" y="134"
        textAnchor="middle"
        fill="hsl(200,60%,52%)"
        fontSize="10"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        letterSpacing="0.15em"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.6 }}
      >
        VS
      </motion.text>

      {/* Right node */}
      <motion.rect
        x="500" y="90" width="80" height="80" rx="8"
        stroke="hsl(200,60%,52%)"
        strokeWidth="1"
        fill="hsl(200,60%,52%,0.04)"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      />
      <motion.text
        x="540" y="136"
        textAnchor="middle"
        fill="hsl(220,10%,55%)"
        fontSize="10"
        fontFamily="Inter, sans-serif"
        letterSpacing="0.1em"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        B
      </motion.text>

      {/* Connecting arcs */}
      {[105, 125, 145, 165].map((y, i) => (
        <motion.line
          key={y}
          x1="305" y1={y} x2="495" y2={y}
          stroke="hsl(200,60%,52%)"
          strokeWidth="0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ delay: 0.7 + i * 0.1 }}
        />
      ))}
    </g>
  );
}

function RankingVisual() {
  const bars = [
    { w: 280, y: 75 },
    { w: 240, y: 105 },
    { w: 200, y: 135 },
    { w: 160, y: 165 },
    { w: 120, y: 195 },
  ];

  return (
    <g>
      {bars.map((bar, i) => (
        <g key={i}>
          <motion.rect
            x={400 - bar.w / 2}
            y={bar.y}
            width={bar.w}
            height="20"
            rx="4"
            fill="hsl(200,60%,52%)"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 0.08 + (bars.length - i) * 0.04, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.15 * i }}
            style={{ transformOrigin: `${400}px ${bar.y + 10}px` }}
          />
          <motion.text
            x={400 - bar.w / 2 + 10}
            y={bar.y + 14}
            fill="hsl(200,60%,52%)"
            fontSize="9"
            fontFamily="Inter, sans-serif"
            letterSpacing="0.08em"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 - i * 0.06 }}
            transition={{ delay: 0.4 + i * 0.15 }}
          >
            {`#${i + 1}`}
          </motion.text>
        </g>
      ))}
    </g>
  );
}
