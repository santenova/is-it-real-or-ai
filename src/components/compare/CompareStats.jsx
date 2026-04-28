import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../lib/utils";

const BREAKDOWN_ITEMS = [
  { key: "texture_consistency",  label: "Texture Consistency" },
  { key: "lighting_analysis",    label: "Lighting & Shadows" },
  { key: "edge_detection",       label: "Edge Sharpness" },
  { key: "noise_pattern",        label: "Noise Patterns" },
  { key: "facial_analysis",      label: "Facial Features" },
  { key: "metadata_integrity",   label: "Metadata Integrity" },
  { key: "color_distribution",   label: "Color Distribution" },
  { key: "artifact_detection",   label: "Artifact Detection" },
];

export default function CompareStats({ left, right }) {
  const overallDiff = left.confidence_score - right.confidence_score;

  const winnerLabel = (diff) => {
    if (diff > 5) return { label: "A wins", Icon: TrendingUp, color: "text-emerald-500" };
    if (diff < -5) return { label: "B wins", Icon: TrendingDown, color: "text-red-500" };
    return { label: "Tie", Icon: Minus, color: "text-amber-500" };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 space-y-5"
    >
      <h3 className="font-semibold text-sm text-center">Head-to-Head Comparison</h3>

      {/* Overall */}
      <div className="flex items-center gap-3">
        <div className="flex-1 text-right">
          <span className={cn("text-2xl font-extrabold", left.confidence_score >= right.confidence_score ? "text-primary" : "text-muted-foreground")}>
            {left.confidence_score}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-muted-foreground font-medium">Overall</span>
          {(() => {
            const { label, Icon, color } = winnerLabel(overallDiff);
            return (
              <div className={cn("flex items-center gap-1 text-xs font-bold", color)}>
                <Icon className="w-3.5 h-3.5" />{label}
              </div>
            );
          })()}
        </div>
        <div className="flex-1 text-left">
          <span className={cn("text-2xl font-extrabold", right.confidence_score > left.confidence_score ? "text-primary" : "text-muted-foreground")}>
            {right.confidence_score}
          </span>
        </div>
      </div>

      {/* Per-criterion comparison */}
      <div className="space-y-2">
        {BREAKDOWN_ITEMS.filter(
          (i) => left.breakdown?.[i.key] !== undefined && right.breakdown?.[i.key] !== undefined
        ).map((item) => {
          const lScore = left.breakdown[item.key];
          const rScore = right.breakdown[item.key];
          const diff = lScore - rScore;
          const pctL = (lScore / (lScore + rScore)) * 100 || 50;

          return (
            <div key={item.key} className="space-y-1">
              <p className="text-xs text-muted-foreground text-center">{item.label}</p>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-bold w-7 text-right tabular-nums", diff >= 0 ? "text-emerald-500" : "text-muted-foreground")}>
                  {lScore}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
                  <motion.div
                    className="h-full bg-primary rounded-l-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pctL}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <motion.div
                    className="h-full bg-primary/30 rounded-r-full flex-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span className={cn("text-xs font-bold w-7 tabular-nums", diff <= 0 ? "text-emerald-500" : "text-muted-foreground")}>
                  {rScore}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
