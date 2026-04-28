import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History as HistoryIcon, Search, ScanEye, Filter, Download,
  CheckSquare, X, RefreshCw, Trash2, AlertTriangle
} from "lucide-react";
import { listAnalyses, deleteAnalysis, clearAllAnalyses, subscribeToAnalyses } from "../lib/localStore";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "../components/ui/alert-dialog";
import HistoryCard from "../components/analysis/HistoryCard";
import AnalysisResult from "../components/analysis/AnalysisResult";
import HistoryExportPDF from "../components/analysis/HistoryExportPDF";

function exportToCSV(items) {
  const headers = ["id", "verdict", "confidence_score", "image_type_category", "image_type_sub_type", "source_type", "filename", "image_url", "analysis_summary", "created_date"];
  const rows = items.map((a) => {
    const row = { ...a, image_type_category: a.image_type?.category ?? "", image_type_sub_type: a.image_type?.sub_type ?? "" };
    return headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",");
  });
  downloadFile([headers.join(","), ...rows].join("\n"), "verilens-export.csv", "text/csv");
}

function exportToJSON(items) {
  const data = items.map(({ id, verdict, confidence_score, image_type, source_type, filename, image_url, analysis_summary, breakdown, reasoning, created_date }) => ({
    id, verdict, confidence_score, image_type: image_type ?? null, source_type, filename, image_url, analysis_summary, reasoning, breakdown, created_date,
  }));
  downloadFile(JSON.stringify(data, null, 2), "verilens-export.json", "application/json");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const VERDICT_COLORS = {
  real: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  ai_generated: "bg-red-500/10 text-red-600 border-red-500/20",
  inconclusive: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export default function History() {
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [analyses, setAnalyses] = useState(() => listAnalyses());
  const targetAnalysisId = new URLSearchParams(window.location.search).get("analysis");

  const reload = () => setAnalyses(listAnalyses());

  useEffect(() => {
    const unsub = subscribeToAnalyses(setAnalyses);
    return unsub;
  }, []);

  // Auto-open the linked analysis from URL param
  useEffect(() => {
    if (targetAnalysisId && analyses.length > 0) {
      const match = analyses.find((a) => a.id === targetAnalysisId);
      if (match) setSelected(match);
    }
  }, [targetAnalysisId, analyses]);

  const filtered = analyses.filter((a) => {
    const matchesVerdict = verdictFilter === "all" || a.verdict === verdictFilter;
    const matchesSearch =
      !search ||
      a.filename?.toLowerCase().includes(search.toLowerCase()) ||
      a.analysis_summary?.toLowerCase().includes(search.toLowerCase()) ||
      a.reasoning?.toLowerCase().includes(search.toLowerCase()) ||
      a.image_url?.toLowerCase().includes(search.toLowerCase()) ||
      a.image_type?.category?.toLowerCase().includes(search.toLowerCase()) ||
      a.image_type?.sub_type?.toLowerCase().includes(search.toLowerCase());
    return matchesVerdict && matchesSearch;
  });

  const stats = {
    total: analyses.length,
    real: analyses.filter((a) => a.verdict === "real").length,
    ai: analyses.filter((a) => a.verdict === "ai_generated").length,
    inconclusive: analyses.filter((a) => a.verdict === "inconclusive").length,
  };

  const toggleSelectMode = () => { setSelectMode((v) => !v); setSelectedIds(new Set()); };
  const toggleSelectId = (id) => setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => setSelectedIds(new Set(filtered.map((a) => a.id)));
  const deselectAll = () => setSelectedIds(new Set());
  const selectedItems = filtered.filter((a) => selectedIds.has(a.id));

  const handleDelete = (id) => { deleteAnalysis(id); reload(); if (selected?.id === id) setSelected(null); };
  const handleDeleteSelected = () => { selectedIds.forEach((id) => deleteAnalysis(id)); setSelectedIds(new Set()); setSelectMode(false); reload(); };
  const handleClearAll = () => { clearAllAnalyses(); reload(); setSelected(null); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HistoryIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analysis History</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground">{stats.total} total</span>
              {stats.real > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">{stats.real} real</span>}
              {stats.ai > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 font-medium">{stats.ai} AI</span>}
              {stats.inconclusive > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium">{stats.inconclusive} unclear</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={reload} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
          {analyses.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Clear all">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete all {analyses.length} analysis records from your device. This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by filename, type, summary, or reasoning…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-muted/50 border-0"
          />
        </div>
        <Select value={verdictFilter} onValueChange={setVerdictFilter}>
          <SelectTrigger className="w-full sm:w-44 h-11 bg-muted/50 border-0">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="real">Real</SelectItem>
            <SelectItem value="ai_generated">AI Generated</SelectItem>
            <SelectItem value="inconclusive">Inconclusive</SelectItem>
          </SelectContent>
        </Select>
        <Button variant={selectMode ? "default" : "outline"} className="h-11 shrink-0" onClick={toggleSelectMode}>
          {selectMode ? <X className="w-4 h-4 mr-2" /> : <CheckSquare className="w-4 h-4 mr-2" />}
          {selectMode ? "Cancel" : "Select"}
        </Button>
      </div>

      {/* Select toolbar */}
      <AnimatePresence>
        {selectMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 border border-border flex-wrap"
          >
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Button size="sm" variant="ghost" onClick={selectAll}>Select all ({filtered.length})</Button>
            {selectedIds.size > 0 && <Button size="sm" variant="ghost" onClick={deselectAll}>Deselect all</Button>}
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              {selectedIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedIds.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedIds.size} items?</AlertDialogTitle>
                      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button size="sm" variant="outline" disabled={selectedIds.size === 0} onClick={() => exportToCSV(selectedItems)}>
                <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
              </Button>
              <Button size="sm" variant="outline" disabled={selectedIds.size === 0} onClick={() => exportToJSON(selectedItems)}>
                <Download className="w-3.5 h-3.5 mr-1.5" /> JSON
              </Button>
              <HistoryExportPDF items={selectedItems} label="PDF" disabled={selectedIds.size === 0} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <ScanEye className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground mb-1">No analyses found</p>
          <p className="text-sm text-muted-foreground">
            {analyses.length === 0 ? "Start by analyzing your first image on the home page" : "Try adjusting your filters"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}{search || verdictFilter !== "all" ? " (filtered)" : ""} · stored locally on this device</p>
          <AnimatePresence>
            {filtered.map((analysis, idx) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.04 }}
              >
                <HistoryCard
                  analysis={analysis}
                  onClick={selectMode ? null : setSelected}
                  selected={selectedIds.has(analysis.id)}
                  onToggleSelect={selectMode ? toggleSelectId : null}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Analysis Details</span>
              {selected?.verdict && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${VERDICT_COLORS[selected.verdict] ?? ""}`}>
                  {selected.verdict === "real" ? "Likely Real" : selected.verdict === "ai_generated" ? "AI Generated" : "Inconclusive"}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <HistoryExportPDF items={[selected]} label="Export PDF Report" />
              </div>
              <AnalysisResult result={selected} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
