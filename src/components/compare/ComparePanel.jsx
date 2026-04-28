import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldQuestion, FileText } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import ScoreGauge from "../../components/analysis/ScoreGauge";
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

const VERDICT_CONFIG = {
  real:         { icon: ShieldCheck,    text: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Likely Real" },
  ai_generated: { icon: ShieldAlert,   text: "text-red-600",     bg: "bg-red-500/10",     border: "border-red-500/20",     label: "AI Generated" },
  inconclusive: { icon: ShieldQuestion, text: "text-amber-600",  bg: "bg-amber-500/10",   border: "border-amber-500/20",   label: "Inconclusive" },
};

function ScoreBar({ score, otherScore, label, delay }) {
  const diff = score - otherScore;
  const barColor = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";
  const isWinner = diff > 0;
  const isTie = diff === 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground text-xs font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold tabular-nums text-sm">{score}</span>
          {!isTie && (
            <span className={cn("text-xs font-bold", isWinner ? "text-emerald-500" : "text-red-500")}>
              {isWinner ? `+${diff}` : diff}
            </span>
          )}
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function ComparePanel({ analysis, otherAnalysis, side }) {
  const cfg = VERDICT_CONFIG[analysis.verdict] || VERDICT_CONFIG.inconclusive;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Image */}
      <div className="rounded-2xl overflow-hidden bg-muted aspect-video">
        <img
          src={analysis.image_url}
          alt="Analyzed"
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>

      {/* Verdict badge */}
      <div className={cn("flex items-center gap-2.5 p-3 rounded-xl", cfg.bg)}>
        <Icon className={cn("w-5 h-5 flex-shrink-0", cfg.text)} />
        <div>
          <p className={cn("font-bold text-sm", cfg.text)}>{cfg.label}</p>
          <p className="text-xs text-muted-foreground">
            Source: {analysis.source_type === "url" ? "URL" : "Upload"}
          </p>
        </div>
        <Badge variant="outline" className={cn("ml-auto text-xs", cfg.border, cfg.text)}>
          {analysis.confidence_score}%
        </Badge>
      </div>

      {/* Score gauge */}
      <div className="flex justify-center py-2">
        <ScoreGauge score={analysis.confidence_score} verdict={analysis.verdict} />
      </div>

      {/* Summary */}
      {analysis.analysis_summary && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</p>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {analysis.analysis_summary}
          </p>
        </div>
      )}

      {/* Breakdown bars */}
      {analysis.breakdown && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Forensic Breakdown
          </p>
          {BREAKDOWN_ITEMS.filter((i) => analysis.breakdown[i.key] !== undefined).map((item, idx) => (
            <ScoreBar
              key={item.key}
              label={item.label}
              score={analysis.breakdown[item.key]}
              otherScore={otherAnalysis?.breakdown?.[item.key] ?? analysis.breakdown[item.key]}
              delay={0.08 * idx}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
