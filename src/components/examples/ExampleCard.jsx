import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ShieldCheck, ShieldAlert, Share2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

function MetricBar({ label, value }) {
  const isHigh = value >= 70;
  const isMid = value >= 35 && value < 70;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn(
          "text-xs font-bold",
          isHigh ? "text-emerald-600" : isMid ? "text-amber-600" : "text-red-600"
        )}>
          {value}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            isHigh ? "bg-emerald-500" : isMid ? "bg-amber-500" : "bg-red-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function ExampleCard({ example, onShare }) {
  const [copied, setCopied] = useState(false);
  const isReal = example.verdict === "real";
  const config = isReal
    ? { icon: ShieldCheck, color: "emerald", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
    : { icon: ShieldAlert, color: "red", bg: "bg-red-500/10", border: "border-red-500/20" };

  const Icon = config.icon;

  const handleShare = () => {
    if (onShare) {
      onShare();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate metrics
  const metadataIntegrity = example.breakdown?.metadata_integrity ?? 0;
  const patternAnalysis = (() => {
    const scores = [
      example.breakdown?.texture_consistency,
      example.breakdown?.edge_detection,
      example.breakdown?.noise_pattern,
      example.breakdown?.artifact_detection,
    ].filter(s => typeof s === "number");
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })();
  const aiProbability = 100 - example.confidence_score;

  return (
    <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Image Section */}
      <div className="relative h-48 bg-muted overflow-hidden group">
        <img
          src={example.image_url}
          alt="Example"
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        {onShare && (
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            onClick={handleShare}
            className="absolute top-2 right-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 text-white transition-colors"
            title="Share this analysis"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-5 space-y-4">
        {/* Verdict Header */}
        <div className={cn(
          "rounded-lg p-3 flex items-center gap-2",
          config.bg
        )}>
          <Icon className={cn("w-4 h-4", `text-${config.color}-600`)} />
          <div className="flex-1">
            <p className={cn("font-semibold text-sm", `text-${config.color}-700`)}>
              {isReal ? "Authentic Image" : "AI Generated"}
            </p>
            <p className={cn("text-xs", `text-${config.color}-600`)}>
              {example.confidence_score}% confidence
            </p>
          </div>
          <Badge variant="outline" className={cn("text-xs", config.border)}>
            {example.source_type === "url" ? "URL" : "Upload"}
          </Badge>
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground/80 leading-relaxed">
          {example.analysis_summary}
        </p>

        {/* Metrics */}
        <div className="space-y-3 bg-muted/50 rounded-lg p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pattern Breakdown
          </p>
          <MetricBar label="Metadata Integrity" value={metadataIntegrity} />
          <MetricBar label="Pattern Analysis" value={patternAnalysis} />
          <MetricBar label="AI Probability" value={aiProbability} />
        </div>

        {/* Key Findings */}
        {example.breakdown && (
          <div className="space-y-2 text-xs">
            <p className="font-semibold uppercase tracking-wider text-muted-foreground">Key Metrics</p>
            <div className="grid grid-cols-2 gap-2">
              {example.breakdown.texture_consistency !== undefined && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-muted-foreground">Texture</p>
                  <p className="font-bold">{example.breakdown.texture_consistency}%</p>
                </div>
              )}
              {example.breakdown.lighting_analysis !== undefined && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-muted-foreground">Lighting</p>
                  <p className="font-bold">{example.breakdown.lighting_analysis}%</p>
                </div>
              )}
              {example.breakdown.facial_analysis !== undefined && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-muted-foreground">Faces</p>
                  <p className="font-bold">{example.breakdown.facial_analysis}%</p>
                </div>
              )}
              {example.breakdown.artifact_detection !== undefined && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-muted-foreground">Artifacts</p>
                  <p className="font-bold">{example.breakdown.artifact_detection}%</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
