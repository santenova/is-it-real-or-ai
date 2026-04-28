import { useState } from "react";
import { Button } from "../../components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";

const BREAKDOWN_LABELS = {
  texture_consistency: "Texture Consistency",
  lighting_analysis: "Lighting & Shadows",
  edge_detection: "Edge Sharpness",
  noise_pattern: "Noise Patterns",
  facial_analysis: "Facial Features",
  metadata_integrity: "Metadata Integrity",
  color_distribution: "Color Distribution",
  artifact_detection: "Artifact Detection",
  shading_analysis: "Shading Analysis",
  depth_of_field: "Depth of Field",
  motion_blur: "Motion Blur",
  background_consistency: "Background Consistency",
  shadow_analysis: "Shadow Analysis",
  perspective_correctness: "Perspective Correctness",
  compression_artifacts: "Compression Artifacts",
  image_text_indication: "Text Indication",
  contents_reality: "Contents Reality",
  ai_fingerprint: "AI Fingerprint",
  clone_detection: "Clone Detection",
  scale_proportion: "Scale & Proportion",
  optical_anomalies: "Optical Anomalies",
  exif_manipulation: "EXIF Manipulation",
  semantic_consistency: "Semantic Consistency",
  internet_presence: "Internet Presence",
};

function getVerdictLabel(verdict) {
  if (verdict === "real") return "Likely Authentic";
  if (verdict === "ai_generated") return "AI Generated";
  return "Inconclusive";
}

function getVerdictColor(verdict) {
  if (verdict === "real") return [16, 185, 129];   // emerald
  if (verdict === "ai_generated") return [239, 68, 68]; // red
  return [245, 158, 11]; // amber
}

function getDisplayScore(score, verdict) {
  if (verdict === "ai_generated") return 100 - score;
  if (verdict === "inconclusive") return Math.round(Math.abs(score - 50) * 2);
  return score;
}

function getScoreLabel(verdict) {
  if (verdict === "ai_generated") return "AI Confidence";
  if (verdict === "inconclusive") return "Uncertainty";
  return "Authenticity Confidence";
}

export default function ExportPDFButton({ result }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;
    const pageH = 297;
    const margin = 18;
    const contentW = pageW - margin * 2;

    // ── Background ──────────────────────────────────────────────────────────
    doc.setFillColor(248, 248, 252);
    doc.rect(0, 0, pageW, pageH, "F");

    // ── Header bar ──────────────────────────────────────────────────────────
    doc.setFillColor(79, 55, 195);
    doc.rect(0, 0, pageW, 22, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("VeriLens", margin, 14);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("AI Image Forensics Report", margin + 28, 14);

    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    doc.text(dateStr, pageW - margin, 14, { align: "right" });

    // ── Section helper ───────────────────────────────────────────────────────
    let y = 34;

    const sectionTitle = (label) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(130, 120, 170);
      doc.text(label.toUpperCase(), margin, y);
      y += 1;
      doc.setDrawColor(220, 215, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 5;
    };

    // ── Verdict card ─────────────────────────────────────────────────────────
    const verdictColor = getVerdictColor(result.verdict);
    const displayScore = getDisplayScore(result.confidence_score, result.verdict);
    const scoreLabel = getScoreLabel(result.verdict);

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, contentW, 32, 3, 3, "F");
    doc.setDrawColor(...verdictColor);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin, y + 32);

    // Verdict label
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...verdictColor);
    doc.text(getVerdictLabel(result.verdict), margin + 6, y + 11);

    // Score pill
    doc.setFillColor(...verdictColor);
    doc.roundedRect(pageW - margin - 36, y + 5, 36, 13, 6, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`${displayScore}%`, pageW - margin - 18, y + 14, { align: "center" });

    doc.setTextColor(100, 100, 120);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(scoreLabel, margin + 6, y + 20);

    if (result.filename) {
      doc.setTextColor(140, 130, 160);
      doc.setFontSize(7.5);
      doc.text(`File: ${result.filename}`, margin + 6, y + 27);
    }

    y += 40;

    // ── Analysis Summary ─────────────────────────────────────────────────────
    if (result.analysis_summary) {
      sectionTitle("Analysis Summary");
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, y, contentW, 1, 2, 2, "F"); // measure first

      const lines = doc.splitTextToSize(result.analysis_summary, contentW - 10);
      const boxH = lines.length * 5 + 8;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, y, contentW, boxH, 2, 2, "F");

      doc.setTextColor(60, 55, 80);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(lines, margin + 5, y + 6);
      y += boxH + 8;
    }

    // ── Breakdown ────────────────────────────────────────────────────────────
    sectionTitle("Forensic Criteria Breakdown");

    const breakdown = result.breakdown ?? {};
    const keys = Object.keys(BREAKDOWN_LABELS);
    const barH = 8;
    const barGap = 5;
    const labelW = 50;
    const barAreaW = contentW - labelW - 18;

    keys.forEach((key) => {
      const score = typeof breakdown[key] === "number" ? breakdown[key] : null;
      if (score === null) return;

      // Row background
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, y, contentW, barH + 2, 1.5, 1.5, "F");

      // Label
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 55, 80);
      doc.text(BREAKDOWN_LABELS[key], margin + 4, y + 6.5);

      // Bar track
      const barX = margin + labelW;
      doc.setFillColor(230, 228, 240);
      doc.roundedRect(barX, y + 2.5, barAreaW, barH - 3, 1.5, 1.5, "F");

      // Bar fill — color by score
      let r, g, b;
      if (score >= 70) { r = 16; g = 185; b = 129; }
      else if (score >= 45) { r = 245; g = 158; b = 11; }
      else { r = 239; g = 68; b = 68; }

      const fillW = Math.max((score / 100) * barAreaW, 2);
      doc.setFillColor(r, g, b);
      doc.roundedRect(barX, y + 2.5, fillW, barH - 3, 1.5, 1.5, "F");

      // Score text
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 55, 80);
      doc.text(`${score}`, pageW - margin - 2, y + 6.5, { align: "right" });

      y += barH + barGap;
    });

    y += 4;

    // ── Paper Trail ──────────────────────────────────────────────────────────
    const pt = result.paper_trail;
    if (pt?.paper_trail_summary) {
      if (y > pageH - 60) { doc.addPage(); y = margin; }

      sectionTitle("Internet Presence / Paper Trail");

      const ptFields = [
        ["Estimated Origin", pt.estimated_origin ?? "unknown"],
        ["Source Credibility", pt.source_credibility ?? "unknown"],
        ["Found on Stock Sites", pt.found_on_stock_sites ? "Yes" : "No"],
        ["Found on AI Platforms", pt.found_on_ai_platforms ? "Yes" : "No"],
        ["Found on News / Official", pt.found_on_news_or_official ? "Yes" : "No"],
      ];

      doc.setFillColor(255, 255, 255);
      const ptBoxLines = doc.splitTextToSize(pt.paper_trail_summary, contentW - 12);
      const ptBoxH = ptFields.length * 6 + ptBoxLines.length * 5 + 14;
      doc.roundedRect(margin, y, contentW, ptBoxH, 2, 2, "F");

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 55, 80);
      ptFields.forEach(([label, val]) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, margin + 4, y + 6);
        doc.setFont("helvetica", "normal");
        doc.text(val, margin + 52, y + 6);
        y += 6;
      });

      if (pt.sources_found?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Sources:", margin + 4, y + 6);
        doc.setFont("helvetica", "normal");
        const srcLines = doc.splitTextToSize(pt.sources_found.join(", "), contentW - 60);
        doc.text(srcLines, margin + 52, y + 6);
        y += srcLines.length * 5 + 6;
      }

      y += 4;
      doc.setFont("helvetica", "italic");
      doc.setTextColor(90, 85, 110);
      doc.text(ptBoxLines, margin + 4, y + 5);
      y += ptBoxLines.length * 5 + 12;
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.setFillColor(79, 55, 195);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setTextColor(200, 195, 230);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Generated by VeriLens · AI Image Forensics · For reference only — not a definitive judgment",
      pageW / 2,
      pageH - 4.5,
      { align: "center" }
    );

    // ── Save ─────────────────────────────────────────────────────────────────
    const filename = result.filename
      ? `verilens-${result.filename.replace(/\.[^/.]+$/, "")}.pdf`
      : `verilens-report-${Date.now()}.pdf`;

    doc.save(filename);
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      Export PDF
    </Button>
  );
}
