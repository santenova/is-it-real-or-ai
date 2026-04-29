import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { apiClient } from "../../apis/client";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ShieldCheck, ShieldAlert, ShieldQuestion, FileText, Search, AlertTriangle, MapPin, Tag } from "lucide-react";
import ExportAnalysisButton from "./ExportAnalysisButton";
import ScoreGauge from "./ScoreGauge";
import ResultBreakdown from "./ResultBreakdown";
import ExifPanel from "./ExifPanel";
import ImageOverlay from "./ImageOverlay";
import NoiseHeatmap from "./NoiseHeatmap";
import FlaggedRegionHeatmap from "./FlaggedRegionHeatmap";
import AnnotationCanvas from "./AnnotationCanvas";
import PaperTrailPanel from "./PaperTrailPanel";
import WatermarkPanel from "./WatermarkPanel";
import { cn } from "../../lib/utils";
import ImageLightbox from "./ImageLightbox";

export default function AnalysisResult({ result, queueResults }) {
  const [annotations, setAnnotations] = useState([]);
  const [isLoadingAnnotations, setIsLoadingAnnotations] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authChecked = useRef(false);

  useEffect(() => {
    apiClient.auth.isAuthenticated().then((auth) => {
      setIsAuthenticated(auth);
      authChecked.current = true;
      if (auth && result?.id && !result.id.startsWith("local_")) {
        loadAnnotations();
      }
    });
  }, [result?.id]);

  const loadAnnotations = async () => {
    try {
      setIsLoadingAnnotations(true);
      const data = await apiClient.entities.ImageAnnotation.filter({ analysis_id: result.id });
      setAnnotations(data);
    } catch (err) {
      console.error("Failed to load annotations:", err);
    } finally {
      setIsLoadingAnnotations(false);
    }
  };

  const handleAddAnnotation = async (annotation) => {
    if (!isAuthenticated) return;
    try {
      await apiClient.entities.ImageAnnotation.create({
        ...annotation,
        analysis_id: result.id,
      });
      await loadAnnotations();
    } catch (err) {
      console.error("Failed to save annotation:", err);
    }
  };

  const handleRemoveAnnotation = async (index) => {
    if (!isAuthenticated) return;
    try {
      const ann = annotations[index];
      if (ann?.id) {
        await apiClient.entities.ImageAnnotation.delete(ann.id);
        await loadAnnotations();
      }
    } catch (err) {
      console.error("Failed to delete annotation:", err);
    }
  };

  if (!result) return null;

  const verdictConfig = {
    real: {
      icon: ShieldCheck,
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-600",
    },
    ai_generated: {
      icon: ShieldAlert,
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-600",
    },
    inconclusive: {
      icon: ShieldQuestion,
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-600",
    },
  };

  const config = verdictConfig[result.verdict] || verdictConfig.inconclusive;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-0 shadow-xl shadow-black/5">
        {/* Verdict banner */}
        <div className={cn("px-6 py-4 flex items-center gap-3", config.bg)}>
          <Icon className={cn("w-6 h-6", config.text)} />
          <div>
            {result.image_type?.category && (
              <div className="flex items-center gap-1.5 mb-1">
                <Tag className="w-3 h-3 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {result.image_type.category}
                  {result.image_type.sub_type ? ` · ${result.image_type.sub_type}` : ""}
                </span>
              </div>
            )}
            <p className={cn("font-bold text-lg", config.text)}>
              {result.verdict === "real"
                ? "Likely Authentic"
                : result.verdict === "ai_generated"
                ? "AI Generated Detected"
                : "Analysis Inconclusive"}
            </p>
            <p className="text-sm text-muted-foreground">
              {result.verdict === "ai_generated"
                ? `AI Confidence: ${100 - result.confidence_score}%`
                : result.verdict === "inconclusive"
                ? `Uncertainty: ${Math.round(Math.abs(result.confidence_score - 50) * 2)}%`
                : `Confidence: ${result.confidence_score}%`}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
            <ExportAnalysisButton result={result} queueResults={queueResults} />
            {!result.image_url?.startsWith("data:") && (
              <a
                href={`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(result.image_url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors hover:bg-accent",
                  config.border, config.text
                )}
              >
                <Search className="w-3.5 h-3.5" />
                Reverse Search
              </a>
            )}
            <Badge variant="outline" className={cn(config.border, config.text)}>
              {result.source_type === "url" ? "URL" : "Upload"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 space-y-8">
          {/* Score + Image */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-shrink-0">
              <ScoreGauge score={result.confidence_score} verdict={result.verdict} />
            </div>
            <div className="flex-1 w-full">
              {result.flagged_regions?.length > 0 ? (
                <div className="cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                  <ImageOverlay imageUrl={result.image_url} regions={result.flagged_regions} />
                </div>
              ) : (
                <div
                  className="rounded-xl overflow-hidden bg-muted max-h-64 cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                >
                  <img
                    src={result.image_url}
                    alt="Analyzed"
                    className="w-full h-full object-contain max-h-64"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              )}
              {lightboxOpen && (
                <ImageLightbox imageUrl={result.image_url} onClose={() => setLightboxOpen(false)} />
              )}
            </div>
          </div>

          <Separator />

          {/* Flagged Region Heatmap */}
          {result.flagged_regions && result.flagged_regions.length > 0 && (
            <>
              <FlaggedRegionHeatmap 
                imageUrl={result.image_url} 
                flaggedRegions={result.flagged_regions}
              />
              <Separator />
            </>
          )}

          {/* Noise heatmap */}
          <NoiseHeatmap imageUrl={result.image_url} />

          <Separator />

          {/* Flagged Regions list */}
          {result.flagged_regions?.length > 0 && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Flagged Regions ({result.flagged_regions.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.flagged_regions.map((region, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{region.label || "Unnamed Region"}</p>
                        <p className="text-xs text-muted-foreground">
                          {region.category && <span className="capitalize">{region.category}</span>}
                          {region.category && " · "}
                          Position: ({Math.round(region.x)}%, {Math.round(region.y)}%)
                          {region.width && region.height && ` · ${Math.round(region.width)}×${Math.round(region.height)}%`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Annotations — only for authenticated users with server-stored analyses */}
          {isAuthenticated && !result.id?.startsWith("local_") && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Custom Annotations
                </h3>
                <AnnotationCanvas
                  imageUrl={result.image_url}
                  annotations={annotations}
                  onAddAnnotation={handleAddAnnotation}
                  onRemoveAnnotation={handleRemoveAnnotation}
                  disabled={isLoadingAnnotations}
                />
              </div>
              <Separator />
            </>
          )}

          {/* Reasoning */}
          {result.reasoning && (
            <div className={cn("rounded-lg px-4 py-3 text-sm border flex items-start gap-2", config.bg, config.border)}>
              <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", config.text)} />
              <p className={cn("font-medium leading-relaxed", config.text)}>{result.reasoning}</p>
            </div>
          )}

          {/* Image Description */}
          {result.image_description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Image Description
                </h3>
                {result.description_verdict && (() => {
                  const dv = result.description_verdict;
                  const dvConfig = {
                    real:          { icon: ShieldCheck,    cls: "text-emerald-600 bg-emerald-500/10", label: "Real" },
                    ai_generated:  { icon: ShieldAlert,    cls: "text-red-600 bg-red-500/10",         label: "AI" },
                    uncertain:     { icon: ShieldQuestion, cls: "text-amber-600 bg-amber-500/10",     label: "Uncertain" },
                  }[dv.verdict] ?? { icon: ShieldQuestion, cls: "text-muted-foreground bg-muted", label: dv.verdict };
                  const DVIcon = dvConfig.icon;
                  return (
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", dvConfig.cls)}>
                      <DVIcon className="w-3 h-3" />
                      {dvConfig.label} · {dv.score}/100
                    </span>
                  );
                })()}
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{result.image_description}</p>
              {result.description_verdict?.reasoning && (
                <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-3">
                  {result.description_verdict.reasoning}
                </p>
              )}
            </div>
          )}

          {/* Detected Objects */}
          {result.detected_objects?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Detected Objects
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.detected_objects.map((obj, i) => (
                  <div key={i} className="px-3 py-1.5 rounded-lg bg-muted text-sm" title={obj.item_description}>
                    <span className="font-medium">{obj.item}</span>
                    {obj.item_description && (
                      <span className="text-muted-foreground ml-1.5">— {obj.item_description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Summary */}
          {result.analysis_summary && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Analysis Summary
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">
                {result.analysis_summary}
              </p>
            </div>
          )}

          <Separator />

          {/* Breakdown */}
          <ResultBreakdown breakdown={result.breakdown} criteriaVerdicts={result.criteria_verdicts} />

          {/* Paper Trail */}
          {result.paper_trail && (
            <>
              <Separator />
              <PaperTrailPanel paperTrail={result.paper_trail} />
            </>
          )}

          {/* Watermark / AI Fingerprint */}
          {result.watermark_result && (
            <>
              <Separator />
              <WatermarkPanel watermarkResult={result.watermark_result} />
            </>
          )}

          <Separator />
          <ExifPanel metadata={result.image_metadata} imageUrl={result.image_url} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
