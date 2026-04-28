import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { format } from "date-fns";
import { ShieldCheck, ShieldAlert, ShieldQuestion, Upload, Link as LinkIcon, AlertTriangle, ZoomIn, CheckSquare, Square, Globe, Tag, Trash2, Terminal } from "lucide-react";
import ScoreGauge from "./ScoreGauge";
import ImageLightbox from "./ImageLightbox";
import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";

const DV_CONFIG = {
  real:         { icon: ShieldCheck,    cls: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", label: "Desc: Real" },
  ai_generated: { icon: ShieldAlert,    cls: "text-red-600 bg-red-500/10 border-red-500/20",             label: "Desc: AI" },
  uncertain:    { icon: ShieldQuestion, cls: "text-amber-600 bg-amber-500/10 border-amber-500/20",        label: "Desc: Uncertain" },
};

const BREAKDOWN_ITEMS = [
  { key: "texture_consistency", label: "Texture" },
  { key: "lighting_analysis", label: "Lighting" },
  { key: "edge_detection", label: "Edges" },
  { key: "noise_pattern", label: "Noise" },
  { key: "facial_analysis", label: "Faces" },
  { key: "metadata_integrity", label: "Metadata" },
  { key: "color_distribution", label: "Color" },
  { key: "artifact_detection", label: "Artifacts" },
  { key: "shading_analysis", label: "Shading" },
  { key: "depth_of_field", label: "DOF" },
  { key: "motion_blur", label: "Motion" },
  { key: "background_consistency", label: "BG" },
  { key: "shadow_analysis", label: "Shadows" },
  { key: "perspective_correctness", label: "Persp." },
  { key: "compression_artifacts", label: "Compress." },
  { key: "image_text_indication", label: "Text" },
  { key: "contents_reality", label: "Reality" },
  { key: "internet_presence", label: "Web" },
];

function MiniBar({ label, score }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";
  const textColor = score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-red-500";
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center text-[10px] text-muted-foreground gap-1">
        <span className="truncate leading-tight">{label}</span>
        <span className={cn("font-bold tabular-nums flex-shrink-0", textColor)}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function HistoryCard({ analysis, onClick, selected, onToggleSelect, onDelete }) {
  const verdictIcons = {
    real: ShieldCheck,
    ai_generated: ShieldAlert,
    inconclusive: ShieldQuestion,
  };
  const verdictColors = {
    real: "text-emerald-600 bg-emerald-500/10",
    ai_generated: "text-red-600 bg-red-500/10",
    inconclusive: "text-amber-600 bg-amber-500/10",
  };

  const [imgSize, setImgSize] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const Icon = verdictIcons[analysis.verdict] || ShieldQuestion;
  const breakdownItems = BREAKDOWN_ITEMS.filter(
    (i) => analysis.breakdown?.[i.key] !== undefined
  );
  const flaggedCount = analysis.flagged_regions?.length ?? 0;

  return (
    <>
    <Card
      onClick={() => onClick?.(analysis)}
      className={cn(
        "overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-black/5 transition-all duration-300 border-0 shadow-md shadow-black/3 group",
        selected && "ring-2 ring-primary"
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image thumbnail */}
        <div className="relative w-full sm:w-40 h-40 bg-muted flex-shrink-0 overflow-hidden">
          <img
            src={analysis.image_url}
            alt="Analyzed"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onLoad={(e) => setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          {imgSize && (
            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-medium leading-none">
              {imgSize.w}×{imgSize.h}
            </div>
          )}
          {/* Zoom button */}
          <button
            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white p-1 rounded transition-opacity opacity-0 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
            title="View full resolution"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {/* Select checkbox */}
          {onToggleSelect && (
            <button
              className="absolute top-1 left-1 bg-black/60 hover:bg-black/80 text-white p-1 rounded"
              onClick={(e) => { e.stopPropagation(); onToggleSelect(analysis.id); }}
            >
              {selected ? <CheckSquare className="w-3.5 h-3.5 text-primary" /> : <Square className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-4 flex flex-col justify-between gap-3 min-w-0">
        {/* Top row: verdict + score + delete */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", verdictColors[analysis.verdict])}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm">
                {analysis.verdict === "real" ? "Likely Authentic"
                  : analysis.verdict === "ai_generated" ? "AI Generated"
                  : "Inconclusive"}
              </span>
              {analysis.filename && (
                <span className="text-xs text-muted-foreground truncate hidden sm:block">— {analysis.filename}</span>
              )}
            </div>
            {/* Reasoning — the decisive signal */}
            {analysis.reasoning && (
              <p className="text-xs font-medium text-foreground/80 line-clamp-2 leading-relaxed border-l-2 border-primary/30 pl-2">
                {analysis.reasoning}
              </p>
            )}
            {/* Summary */}
            {analysis.analysis_summary && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {analysis.analysis_summary}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ScoreGauge score={analysis.confidence_score} verdict={analysis.verdict} size="sm" />
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(analysis.id); }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

          {/* Mini breakdown bars */}
          {breakdownItems.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-3 gap-y-1.5">
              {breakdownItems.map((item) => (
                <MiniBar key={item.key} label={item.label} score={analysis.breakdown[item.key]} />
              ))}
            </div>
          )}

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                {analysis.source_type === "url" ? (
                  <><LinkIcon className="w-3 h-3" /> URL</>
                ) : (
                  <><Upload className="w-3 h-3" /> Upload</>
                )}
              </Badge>
              {flaggedCount > 0 && (
                <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-500/30 bg-amber-500/10">
                  <AlertTriangle className="w-3 h-3" />
                  {flaggedCount} region{flaggedCount > 1 ? "s" : ""} flagged
                </Badge>
              )}
              {analysis.image_type?.category && (
                <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/30 bg-primary/5">
                  <Tag className="w-3 h-3" />
                  {analysis.image_type.category}
                  {analysis.image_type.sub_type ? ` · ${analysis.image_type.sub_type}` : ""}
                </Badge>
              )}
              {analysis.description_verdict?.verdict && (() => {
                const dvc = DV_CONFIG[analysis.description_verdict.verdict];
                if (!dvc) return null;
                const DVIcon = dvc.icon;
                return (
                  <Badge variant="outline" className={cn("gap-1 text-xs", dvc.cls)}>
                    <DVIcon className="w-3 h-3" />
                    {dvc.label} · {analysis.description_verdict.score}/100
                  </Badge>
                );
              })()}
              {analysis.paper_trail?.paper_trail_summary && (
                <Badge variant="outline" className="gap-1 text-xs text-blue-600 border-blue-500/30 bg-blue-500/10 max-w-xs truncate" title={analysis.paper_trail.paper_trail_summary}>
                  <Globe className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{analysis.paper_trail.paper_trail_summary}</span>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {analysis.session_id && (
                <Link
                  to={`/analysis-logs?session=${analysis.session_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  title="View pipeline logs for this analysis"
                >
                  <Terminal className="w-3 h-3" />
                  Logs
                </Link>
              )}
              <span className="text-xs text-muted-foreground">
                {analysis.created_date && format(new Date(analysis.created_date), "MMM d, yyyy · h:mm a")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
    {lightboxOpen && (
      <ImageLightbox imageUrl={analysis.image_url} onClose={() => setLightboxOpen(false)} />
    )}
    </>
  );
}
