import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

function flattenBreakdown(breakdown) {
  if (!breakdown) return {};
  return Object.fromEntries(
    Object.entries(breakdown).map(([k, v]) => [`breakdown_${k}`, v])
  );
}

function flattenExif(metadata) {
  if (!metadata) return {};
  return Object.fromEntries(
    Object.entries(metadata).map(([k, v]) => [`exif_${k}`, v])
  );
}

function queueToRows(queue) {
  return queue
    .filter((item) => item.status === "done" && item.result)
    .map((item) => {
      const r = item.result;
      return {
        filename: item.filename,
        verdict: r.verdict,
        confidence_score: r.confidence_score,
        source_type: r.source_type,
        analysis_summary: r.analysis_summary ?? "",
        flagged_regions_count: r.flagged_regions?.length ?? 0,
        image_url: r.image_url,
        ...flattenBreakdown(r.breakdown),
        ...flattenExif(r.image_metadata),
      };
    });
}

function exportCSV(rows) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  download(new Blob([csv], { type: "text/csv" }), "verilens_report.csv");
}

function exportJSON(rows) {
  if (rows.length === 0) return;
  download(new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" }), "verilens_report.json");
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportQueueButton({ queue }) {
  const doneItems = queue.filter((i) => i.status === "done" && i.result);
  if (doneItems.length === 0) return null;

  const rows = queueToRows(queue);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" />
          Export ({doneItems.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportCSV(rows)}>
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportJSON(rows)}>
          Download as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
