import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { buildAndSavePDF } from "../../lib/pdfReport";

export default function HistoryExportPDF({ items, label = "Export PDF", disabled }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!items || items.length === 0) return;
    setLoading(true);
    try {
      const filename =
        items.length === 1
          ? `verilens-report-${Date.now()}.pdf`
          : `verilens-batch-${items.length}-${Date.now()}.pdf`;
      buildAndSavePDF(items, filename);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={disabled || loading || !items?.length}
      onClick={handleExport}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <FileText className="w-3.5 h-3.5" />
      )}
      {label}
    </Button>
  );
}
