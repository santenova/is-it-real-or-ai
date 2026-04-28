import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export default function ScoreGauge({ score, verdict, size = "lg" }) {
  const displayScore = score;

  const radius = size === "lg" ? 80 : 50;
  const stroke = size === "lg" ? 10 : 7;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;
  const viewBox = size === "lg" ? "0 0 200 200" : "0 0 130 130";
  const center = size === "lg" ? 100 : 65;

  const getColor = () => {
    if (verdict === "real") return "text-emerald-500";
    if (verdict === "ai_generated") return "text-red-500";
    return "text-amber-500";
  };

  const getStrokeColor = () => {
    if (verdict === "real") return "#10b981";
    if (verdict === "ai_generated") return "#ef4444";
    return "#f59e0b";
  };

  const getLabel = () => {
    if (verdict === "real") return "Likely Real";
    if (verdict === "ai_generated") return "AI Generated";
    return "Inconclusive";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg viewBox={viewBox} className={size === "lg" ? "w-48 h-48" : "w-28 h-28"}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn("font-bold", getColor(), size === "lg" ? "text-4xl" : "text-xl")}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {displayScore}
          </motion.span>
          {size === "lg" && (
            <span className="text-xs text-muted-foreground mt-0.5">
              / 100
            </span>
          )}
        </div>
      </div>
      <motion.div
        className={cn("font-semibold text-center", getColor(), size === "lg" ? "text-lg" : "text-sm")}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {getLabel()}
      </motion.div>
    </div>
  );
}
