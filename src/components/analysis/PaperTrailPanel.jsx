import { Globe, CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "../../lib/utils";

function TrailRow({ label, value, positive, negative }) {
  const isBool = typeof value === "boolean";
  const icon = isBool
    ? value
      ? <CheckCircle2 className={cn("w-4 h-4 flex-shrink-0", positive ? "text-emerald-500" : "text-red-500")} />
      : <XCircle className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
    : <AlertCircle className="w-4 h-4 flex-shrink-0 text-muted-foreground" />;

  return (
    <div className="flex items-start gap-2 py-1.5">
      {icon}
      <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-foreground">
        {isBool ? (value ? "Yes" : "No") : (value ?? "—")}
      </span>
    </div>
  );
}

export default function PaperTrailPanel({ paperTrail }) {
  if (!paperTrail) return null;

  const credibilityColor = {
    high: "text-emerald-600 bg-emerald-500/10",
    medium: "text-amber-600 bg-amber-500/10",
    low: "text-red-600 bg-red-500/10",
  }[paperTrail.source_credibility?.toLowerCase()] ?? "text-muted-foreground bg-muted";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          Internet Presence / Paper Trail
        </h3>
        {paperTrail.source_credibility && (
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", credibilityColor)}>
            {paperTrail.source_credibility} credibility
          </span>
        )}
      </div>

      <div className="bg-muted/40 rounded-xl px-4 py-3 space-y-1 divide-y divide-border/50">
        <TrailRow label="Web presence" value={paperTrail.has_web_presence} positive={true} />
        <TrailRow label="Stock photo sites" value={paperTrail.found_on_stock_sites} positive={true} />
        <TrailRow label="AI art platforms" value={paperTrail.found_on_ai_platforms} positive={false} />
        <TrailRow label="News / official sources" value={paperTrail.found_on_news_or_official} positive={true} />
        {paperTrail.estimated_origin && (
          <TrailRow label="Estimated origin" value={paperTrail.estimated_origin} />
        )}
      </div>

      {paperTrail.sources_found?.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sources Found</p>
          <div className="flex flex-wrap gap-2">
            {paperTrail.sources_found.map((src, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-xs font-medium">
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                {src}
              </span>
            ))}
          </div>
        </div>
      )}

      {paperTrail.paper_trail_summary && (
        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg px-3 py-2 border border-border/50">
          {paperTrail.paper_trail_summary}
        </p>
      )}
    </div>
  );
}
