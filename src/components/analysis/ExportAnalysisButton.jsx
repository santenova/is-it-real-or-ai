import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import { buildAndSavePDF } from "../../lib/pdfReport";

export default function ExportAnalysisButton({ result, queueResults }) {
  const [loading, setLoading] = useState(false);

  const exportJSON = () => {
    const jsonData = {
      verdict: result.verdict,
      confidence_score: result.confidence_score,
      analysis_summary: result.analysis_summary,
      source_type: result.source_type,
      breakdown: result.breakdown,
      flagged_regions: result.flagged_regions || [],
      image_metadata: result.image_metadata || {},
      paper_trail: result.paper_trail || null,
      watermark_result: result.watermark_result || null,
      criteria_verdicts: result.criteria_verdicts || {},
      image_type: result.image_type || null,
      lms_model: result.lms_model || null,
      filename: result.filename,
      created_date: result.created_date,
      image_url: result.image_url,
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSinglePDF = () => {
    setLoading(true);
    try {
      buildAndSavePDF([result], `verilens-report-${Date.now()}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  const exportBatchPDF = () => {
    if (!queueResults?.length) return;
    setLoading(true);
    try {
      buildAndSavePDF(queueResults, `verilens-batch-${queueResults.length}-${Date.now()}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  const hasBatch = queueResults && queueResults.length > 1;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" disabled={loading}>
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportSinglePDF} disabled={loading}>
          <FileText className="w-3.5 h-3.5 mr-2" />
          <span>PDF Report</span>
        </DropdownMenuItem>
        {hasBatch && (
          <DropdownMenuItem onClick={exportBatchPDF} disabled={loading}>
            <FileText className="w-3.5 h-3.5 mr-2" />
            <span>Combined PDF ({queueResults.length} images)</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={exportJSON} disabled={loading}>
          <FileJson className="w-3.5 h-3.5 mr-2" />
          <span>JSON Data</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
