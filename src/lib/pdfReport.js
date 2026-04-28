import jsPDF from "jspdf";

export const BREAKDOWN_LABELS = {
  texture_consistency: "Texture Consistency",
  lighting_analysis: "Lighting Analysis",
  edge_detection: "Edge Detection",
  noise_pattern: "Noise Pattern",
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
  clone_detection: "Clone / Repeated Elements",
  scale_proportion: "Scale & Proportion",
  optical_anomalies: "Optical Anomalies",
  exif_manipulation: "EXIF Manipulation",
  semantic_consistency: "Semantic Consistency",
  internet_presence: "Internet Presence",
  watermark_integrity: "Watermark Integrity",
  image_description_analysis: "Image Description Analysis",
};

export const VERDICT_LABELS = {
  real: "LIKELY AUTHENTIC",
  ai_generated: "AI GENERATED",
  inconclusive: "INCONCLUSIVE",
};

export function scoreColor(score) {
  if (score >= 70) return [16, 185, 129];
  if (score >= 40) return [245, 158, 11];
  return [239, 68, 68];
}

export function verdictRGB(verdict) {
  if (verdict === "real") return [16, 185, 129];
  if (verdict === "ai_generated") return [239, 68, 68];
  return [245, 158, 11];
}

export function checkPage(doc, yPos, needed = 20) {
  const pageH = doc.internal.pageSize.getHeight();
  if (yPos + needed > pageH - 15) {
    doc.addPage();
    return 18;
  }
  return yPos;
}

export function drawSectionHeader(doc, text, yPos) {
  doc.setFillColor(245, 245, 250);
  doc.rect(12, yPos - 5, doc.internal.pageSize.getWidth() - 24, 10, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 120);
  doc.text(text.toUpperCase(), 15, yPos + 1);
  return yPos + 10;
}

export function generateReportForItem(doc, analysis, isFirst) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;

  if (!isFirst) doc.addPage();
  let y = 18;

  // ── Header bar ──────────────────────────────────────────────────
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageW, 14, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("VeriLens · Image Forensics Report", margin, 9.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - margin, 9.5, { align: "right" });

  y = 22;

  // ── Verdict banner ───────────────────────────────────────────────
  const [vr, vg, vb] = verdictRGB(analysis.verdict);
  doc.setFillColor(vr, vg, vb);
  doc.roundedRect(margin, y, contentW, 30, 3, 3, "F");

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(VERDICT_LABELS[analysis.verdict] || "UNKNOWN", margin + 6, y + 9);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Confidence Score: ${analysis.confidence_score}%`, margin + 6, y + 17);

  // Build line 3: type + optional model name
  const line3Parts = [];
  if (analysis.image_type?.category) {
    const typeStr = analysis.image_type.sub_type
      ? `${analysis.image_type.category} · ${analysis.image_type.sub_type}`
      : analysis.image_type.category;
    line3Parts.push(`Type: ${typeStr}`);
  }
  if (analysis.lms_model) {
    line3Parts.push(`Model: ${analysis.lms_model}`);
  }
  if (line3Parts.length > 0) {
    doc.setFontSize(8);
    doc.text(line3Parts.join("   ·   "), margin + 6, y + 25);
  }

  doc.setFontSize(8);
  const dateStr = analysis.created_date ? new Date(analysis.created_date).toLocaleString() : "";
  doc.text(`Source: ${analysis.source_type === "url" ? "URL" : "Upload"}`, pageW - margin, y + 9, { align: "right" });
  doc.text(dateStr, pageW - margin, y + 17, { align: "right" });

  y += 36;

  // ── Filename / URL ───────────────────────────────────────────────
  if (analysis.filename || analysis.image_url) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const label = analysis.filename ? `File: ${analysis.filename}` : `URL: ${analysis.image_url}`;
    const lines = doc.splitTextToSize(label, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 4;
  }

  // ── Analysis Summary ─────────────────────────────────────────────
  if (analysis.analysis_summary) {
    y = checkPage(doc, y, 30);
    y = drawSectionHeader(doc, "Analysis Summary", y);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(analysis.analysis_summary, contentW - 6);
    doc.text(lines, margin + 3, y);
    y += lines.length * 5 + 6;
  }

  // ── Reasoning ───────────────────────────────────────────────────
  if (analysis.reasoning) {
    y = checkPage(doc, y, 25);
    y = drawSectionHeader(doc, "Key Decisive Signals", y);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(60, 60, 90);
    const lines = doc.splitTextToSize(analysis.reasoning, contentW - 6);
    doc.text(lines, margin + 3, y);
    y += lines.length * 5 + 6;
  }

  // ── 26-Criterion Breakdown ───────────────────────────────────────
  if (analysis.breakdown && Object.keys(analysis.breakdown).length > 0) {
    y = checkPage(doc, y, 40);
    y = drawSectionHeader(doc, "Forensic Breakdown (26 Criteria)", y);

    const barH = 3;
    const rowH = 11;
    const col1W = contentW * 0.45;
    const col2W = contentW * 0.45;
    const colGap = contentW * 0.1;

    const entries = Object.entries(BREAKDOWN_LABELS)
      .map(([key, label]) => ({ key, label, score: analysis.breakdown[key] }))
      .filter((e) => typeof e.score === "number");

    const half = Math.ceil(entries.length / 2);
    const leftCol = entries.slice(0, half);
    const rightCol = entries.slice(half);

    const startY = y;
    const renderCol = (items, xOff, colW) => {
      let cy = startY;
      items.forEach((item) => {
        cy = checkPage(doc, cy, rowH + 2);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(70, 70, 70);
        doc.text(item.label, xOff, cy);
        const [sr, sg, sb] = scoreColor(item.score);
        doc.setTextColor(sr, sg, sb);
        doc.setFont("helvetica", "bold");
        doc.text(`${item.score}`, xOff + colW, cy, { align: "right" });
        doc.setFillColor(230, 230, 235);
        doc.rect(xOff, cy + 1.5, colW, barH, "F");
        doc.setFillColor(sr, sg, sb);
        doc.rect(xOff, cy + 1.5, colW * (item.score / 100), barH, "F");
        cy += rowH;
      });
      return cy;
    };

    const leftEnd = renderCol(leftCol, margin + 2, col1W - 4);
    renderCol(rightCol, margin + col1W + colGap, col2W - 4);
    y = leftEnd + 6;
  }

  // ── AI Fingerprint / Watermark Scan ─────────────────────────────
  const wm = analysis.watermark_result;
  if (wm) {
    y = checkPage(doc, y, 40);
    y = drawSectionHeader(doc, "AI Fingerprint & Watermark Scan", y);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);

    const fields = [
      ["Integrity Score", `${wm.integrity_score ?? "N/A"} / 100`],
      ["Risk Level", wm.risk_level ?? "N/A"],
      ["C2PA Metadata", wm.has_c2pa_metadata ? "Detected" : "Not detected"],
      ["Synthid / Invisible Watermark", wm.has_invisible_watermark ? "Detected" : "Not detected"],
      ["Visible Generator Signature", wm.has_visible_signature ? "Detected" : "Not detected"],
      ["Frequency Anomalies", wm.has_frequency_anomalies ? "Detected" : "Not detected"],
    ];

    fields.forEach(([label, val]) => {
      y = checkPage(doc, y, 7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(`${label}:`, margin + 3, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(val, margin + 70, y);
      y += 6;
    });

    if (wm.signatures_found?.length > 0) {
      y = checkPage(doc, y, 10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text("Signatures Found:", margin + 3, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      const sigLines = doc.splitTextToSize(wm.signatures_found.join(", "), contentW - 76);
      doc.text(sigLines, margin + 70, y);
      y += sigLines.length * 5 + 2;
    }

    if (wm.summary) {
      y = checkPage(doc, y, 15);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(60, 60, 90);
      const sumLines = doc.splitTextToSize(`Summary: ${wm.summary}`, contentW - 6);
      doc.text(sumLines, margin + 3, y);
      y += sumLines.length * 5 + 4;
    }
    y += 4;
  }

  // ── Image Metadata (EXIF) ────────────────────────────────────────
  const meta = analysis.image_metadata;
  if (meta && Object.keys(meta).length > 0) {
    y = checkPage(doc, y, 30);
    y = drawSectionHeader(doc, "Image Metadata (EXIF)", y);

    const metaFields = [
      ["Camera Make", meta.Make],
      ["Camera Model", meta.Model],
      ["Date Taken", meta.DateTimeOriginal],
      ["Dimensions", meta.PixelXDimension && meta.PixelYDimension
        ? `${meta.PixelXDimension} × ${meta.PixelYDimension}`
        : undefined],
    ].filter(([, v]) => v);

    if (metaFields.length === 0) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120, 120, 120);
      doc.text("No EXIF data found.", margin + 3, y);
      y += 6;
    } else {
      metaFields.forEach(([label, val]) => {
        y = checkPage(doc, y, 6);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(80, 80, 80);
        doc.text(`${label}:`, margin + 3, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(String(val), margin + 50, y);
        y += 6;
      });
    }
    y += 4;
  }

  // ── Flagged Regions ──────────────────────────────────────────────
  if (analysis.flagged_regions?.length > 0) {
    y = checkPage(doc, y, 30);
    y = drawSectionHeader(doc, `Flagged Regions (${analysis.flagged_regions.length})`, y);

    analysis.flagged_regions.forEach((region, idx) => {
      y = checkPage(doc, y, 10);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(`${idx + 1}. ${region.label || "Unnamed Region"}`, margin + 3, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Category: ${region.category || "N/A"}  ·  Position: (${Math.round(region.x)}%, ${Math.round(region.y)}%)`,
        margin + 6,
        y + 5
      );
      y += 12;
    });
    y += 2;
  }

  // ── Paper Trail ──────────────────────────────────────────────────
  const pt = analysis.paper_trail;
  if (pt?.paper_trail_summary) {
    y = checkPage(doc, y, 40);
    y = drawSectionHeader(doc, "Internet Presence / Paper Trail", y);

    const ptFields = [
      ["Estimated Origin", pt.estimated_origin],
      ["Source Credibility", pt.source_credibility],
      ["Found on Stock Sites", pt.found_on_stock_sites ? "Yes" : "No"],
      ["Found on AI Platforms", pt.found_on_ai_platforms ? "Yes" : "No"],
      ["Found on News / Official", pt.found_on_news_or_official ? "Yes" : "No"],
    ].filter(([, v]) => v != null);

    ptFields.forEach(([label, val]) => {
      y = checkPage(doc, y, 6);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(`${label}:`, margin + 3, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(String(val), margin + 60, y);
      y += 6;
    });

    if (pt.sources_found?.length > 0) {
      y = checkPage(doc, y, 10);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text("Sources:", margin + 3, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      const srcLines = doc.splitTextToSize(pt.sources_found.join(", "), contentW - 40);
      doc.text(srcLines, margin + 35, y);
      y += srcLines.length * 5 + 2;
    }

    y = checkPage(doc, y, 15);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(60, 60, 90);
    const sumLines = doc.splitTextToSize(`Summary: ${pt.paper_trail_summary}`, contentW - 6);
    doc.text(sumLines, margin + 3, y);
    y += sumLines.length * 5 + 4;
  }

  // ── Footer on every page ─────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text(
      "VeriLens — AI Image Forensics · verilens.app",
      margin,
      doc.internal.pageSize.getHeight() - 8
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageW - margin,
      doc.internal.pageSize.getHeight() - 8,
      { align: "right" }
    );
  }
}

export function buildAndSavePDF(items, filename) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  items.forEach((analysis, idx) => generateReportForItem(doc, analysis, idx === 0));
  doc.save(filename || `verilens-report-${Date.now()}.pdf`);
}