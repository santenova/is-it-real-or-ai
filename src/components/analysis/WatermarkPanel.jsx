import { ShieldCheck, ShieldAlert, ShieldQuestion, Fingerprint, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";

function ScanRow({ label, detected, inverted = false }) {
  const isPositive = inverted ? !detected : detected;
  return (
    <div className="flex items-center gap-2 py-1.5">
      {detected
        ? <CheckCircle2 className={cn("w-4 h-4 flex-shrink-0", isPositive ? "text-emerald-500" : "text-red-500")} />
        : <XCircle className={cn("w-4 h-4 flex-shrink-0", isPositive ? "text-emerald-500" : "text-muted-foreground")} />
      }
      <span className="text-xs text-muted-foreground flex-1">{label}</span>
      <span className={cn("text-xs font-semibold", detected ? (isPositive ? "text-emerald-600" : "text-red-600") : "text-muted-foreground")}>
        {detected ? "Detected" : "Not found"}
      </span>
    </div>
  );
}

export default function WatermarkPanel({ watermarkResult }) {
  if (!watermarkResult) return null;

  const score = watermarkResult.integrity_score ?? watermarkResult.watermark_integrity_score ?? null;
  const risk = watermarkResult.risk_level?.toLowerCase();

  const riskConfig = {
    low:    { icon: ShieldCheck,    cls: "text-emerald-600 bg-emerald-500/10", label: "Low Risk" },
    medium: { icon: ShieldQuestion, cls: "text-amber-600 bg-amber-500/10",   label: "Medium Risk" },
    high:   { icon: ShieldAlert,    cls: "text-red-600 bg-red-500/10",        label: "High Risk" },
  }[risk] ?? { icon: ShieldQuestion, cls: "text-muted-foreground bg-muted", label: risk ?? "Unknown" };

  const RiskIcon = riskConfig.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Fingerprint className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          AI Fingerprint &amp; Watermark Scan
        </h3>
        <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", riskConfig.cls)}>
          <RiskIcon className="w-3 h-3" />
          {riskConfig.label}
        </span>
        {score !== null && (
          <span className="ml-auto text-sm font-bold tabular-nums">
            {score}<span className="text-xs font-normal text-muted-foreground">/100</span>
          </span>
        )}
      </div>

      {/* Score bar */}
      {score !== null && (
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700",
              score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      )}

      <div className="bg-muted/40 rounded-xl px-4 py-3 space-y-1 divide-y divide-border/50">
        <ScanRow label="C2PA / Content Credentials metadata" detected={watermarkResult.has_c2pa_metadata ?? false} inverted={false} />
        <ScanRow label="SynthID / Invisible AI watermark" detected={watermarkResult.has_invisible_watermark ?? false} inverted={true} />
        <ScanRow label="Visible generator signature" detected={watermarkResult.has_visible_signature ?? false} inverted={true} />
        <ScanRow label="Frequency / spectral anomalies" detected={watermarkResult.has_frequency_anomalies ?? false} inverted={true} />
      </div>

      {watermarkResult.signatures_found?.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signatures Detected</p>
          <div className="flex flex-wrap gap-2">
            {watermarkResult.signatures_found.map((sig, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 text-xs font-medium">
                {sig}
              </span>
            ))}
          </div>
        </div>
      )}

      {watermarkResult.summary && (
        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg px-3 py-2 border border-border/50">
          {watermarkResult.summary}
        </p>
      )}
    </div>
  );
}
