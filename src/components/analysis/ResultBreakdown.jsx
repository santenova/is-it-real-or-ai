import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { cn } from "../../lib/utils";

const MINI_VERDICT_CONFIG = {
  real:          { label: "Real",      icon: ShieldCheck,    cls: "text-emerald-600 bg-emerald-500/10" },
  ai_generated:  { label: "AI",        icon: ShieldAlert,    cls: "text-red-600 bg-red-500/10" },
  uncertain:     { label: "Uncertain", icon: ShieldQuestion, cls: "text-amber-600 bg-amber-500/10" },
};

function BreakdownBar({ label, score, miniVerdict, delay = 0 }) {
  const barColor = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";
  const vc = miniVerdict ? MINI_VERDICT_CONFIG[miniVerdict] : null;
  const VIcon = vc?.icon;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm gap-2">
        <span className="text-muted-foreground font-medium flex-1">{label}</span>
        {vc && (
          <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0", vc.cls)}>
            <VIcon className="w-3 h-3" />
            {vc.label}
          </span>
        )}
        <span className="font-semibold tabular-nums flex-shrink-0">{score}/100</span>
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

export default function ResultBreakdown({ breakdown, criteriaVerdicts }) {
  if (!breakdown) return null;

  const items = [
    { key: "texture_consistency", label: "Texture Consistency" },
    { key: "lighting_analysis", label: "Lighting Analysis" },
    { key: "edge_detection", label: "Edge Detection" },
    { key: "noise_pattern", label: "Noise Pattern" },
    { key: "facial_analysis", label: "Facial Features" },
    { key: "metadata_integrity", label: "Metadata Integrity" },
    { key: "color_distribution", label: "Color Distribution" },
    { key: "artifact_detection", label: "Artifact Detection" },
    { key: "shading_analysis", label: "Shading Analysis" },
    { key: "depth_of_field", label: "Depth of Field" },
    { key: "motion_blur", label: "Motion Blur" },
    { key: "background_consistency", label: "Background Consistency" },
    { key: "shadow_analysis", label: "Shadow Analysis" },
    { key: "perspective_correctness", label: "Perspective Correctness" },
    { key: "compression_artifacts", label: "Compression Artifacts" },
    { key: "image_text_indication", label: "Text Indication" },
    { key: "contents_reality", label: "Contents Reality" },
    { key: "ai_fingerprint", label: "AI Fingerprint / Watermark" },
    { key: "clone_detection", label: "Clone / Repeated Elements" },
    { key: "scale_proportion", label: "Scale & Proportion" },
    { key: "optical_anomalies", label: "Optical Anomalies & Reflections" },
    { key: "exif_manipulation", label: "EXIF Manipulation" },
    { key: "semantic_consistency", label: "Semantic / Contextual Consistency" },
    { key: "internet_presence", label: "Internet Presence / Paper Trail" },
    { key: "watermark_integrity", label: "Watermark Integrity" },
    { key: "image_description_analysis", label: "Image Description Analysis" },
  ];

  const availableItems = items.filter((item) => breakdown[item.key] !== undefined);
  const tooFewSignals = availableItems.length < 3;

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
        Detailed Breakdown
        <span className="ml-2 text-xs font-normal normal-case text-muted-foreground">
          ({availableItems.length}/26 criteria scored)
        </span>
      </h3>
      {tooFewSignals && (
        <div className="text-xs text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          ⚠️ Only {availableItems.length} of 26 criteria could be evaluated — the image may be too small, low-resolution, or heavily compressed for a reliable analysis. Verdict defaulted to <strong>Inconclusive</strong>.
        </div>
      )}
      <div className="space-y-3">
        {availableItems.map((item, idx) => (
          <BreakdownBar
            key={item.key}
            label={item.label}
            score={breakdown[item.key]}
            miniVerdict={criteriaVerdicts?.[item.key]}
            delay={0.1 * idx}
          />
        ))}
      </div>
    </motion.div>
  );
}
