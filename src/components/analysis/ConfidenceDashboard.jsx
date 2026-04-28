import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { ShieldCheck, ShieldAlert, BarChart3 } from "lucide-react";
import { cn } from "../../lib/utils";

export default function ConfidenceDashboard({ breakdown, confidenceScore, verdict }) {
  // Calculate metrics
  const metadataIntegrity = breakdown?.metadata_integrity ?? 0;
  
  const patternAnalysis = (() => {
    const scores = [
      breakdown?.texture_consistency,
      breakdown?.edge_detection,
      breakdown?.noise_pattern,
      breakdown?.artifact_detection,
      breakdown?.shading_analysis,
      breakdown?.shadow_analysis,
      breakdown?.background_consistency,
      breakdown?.perspective_correctness,
    ].filter(s => typeof s === "number");
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })();
  
  const aiProbability = 100 - confidenceScore;

  const metrics = [
    {
      label: "Metadata Integrity",
      value: metadataIntegrity,
      color: "from-blue-500 to-cyan-500",
      icon: ShieldCheck,
    },
    {
      label: "Pattern Analysis",
      value: patternAnalysis,
      color: "from-purple-500 to-pink-500",
      icon: BarChart3,
    },
    {
      label: "AI Probability",
      value: aiProbability,
      color: "from-red-500 to-orange-500",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          const isHigh = metric.value >= 70;
          const isMid = metric.value >= 35 && metric.value < 70;
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                        `bg-gradient-to-r ${metric.color}`
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    </div>

                    {/* Circular Progress */}
                    <div className="flex items-center justify-center py-3">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-muted"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            strokeWidth="3"
                            className={cn(
                              "transition-all",
                              isHigh ? "stroke-emerald-500" : isMid ? "stroke-amber-500" : "stroke-red-500"
                            )}
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            initial={{ strokeDashoffset: `${2 * Math.PI * 45}` }}
                            animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - metric.value / 100)}` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                            <p className="text-xs text-muted-foreground">%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <p className="text-xs text-center text-muted-foreground">
                      {isHigh ? "Strong Signal" : isMid ? "Moderate" : "Weak Signal"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className={cn(
        "rounded-lg p-4 text-sm",
        verdict === "real"
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700"
          : verdict === "ai_generated"
          ? "bg-red-500/10 border border-red-500/20 text-red-700"
          : "bg-amber-500/10 border border-amber-500/20 text-amber-700"
      )}>
        <p className="font-medium">
          {verdict === "real"
            ? "✓ Likely Authentic Image"
            : verdict === "ai_generated"
            ? "⚠ AI Generation Detected"
            : "? Analysis Inconclusive"}
        </p>
        <p className="text-xs mt-1 opacity-80">
          {verdict === "real"
            ? "Strong metadata and pattern consistency indicates genuine capture."
            : verdict === "ai_generated"
            ? "Pattern anomalies and artifacts suggest synthetic generation."
            : "Insufficient signals to determine authenticity with confidence."}
        </p>
      </div>
    </div>
  );
}
