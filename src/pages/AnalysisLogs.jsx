import React, { useState, useEffect, useRef } from "react";
import { getAllSessions, clearAllSessions } from "../lib/analysisLogger";
import { listAnalyses } from "../lib/localStore";
import { Trash2, ChevronDown, ChevronRight, Clock, Terminal, CheckCircle2, FileJson, Copy, Database, RefreshCw, History, AlertTriangle, Link2Off, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";

const LS_SEGMENTS = [
  { key: "aiorreal_analyses",     label: "Analysis History",   color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
  { key: "aiorreal_analysis_logs",label: "Pipeline Sessions",  color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { key: "aiorreal_errors",        label: "Error Log",          color: "text-red-500 bg-red-500/10 border-red-500/20" },
  { key: "aiorreal_token_usage",   label: "Token Usage",        color: "text-green-500 bg-green-500/10 border-green-500/20" },
  { key: "aiorreal_settings",      label: "Settings",           color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
];

function readSegment(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return localStorage.getItem(key);
  }
}

function LocalStorageSegments() {
  const [openKey, setOpenKey] = useState(null);
  const [data, setData] = useState({});

  const refresh = () => {
    const next = {};
    LS_SEGMENTS.forEach(({ key }) => { next[key] = readSegment(key); });
    setData(next);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-5 py-3 bg-muted/40 border-b">
        <Database className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">localStorage Segments</span>
        <button onClick={refresh} className="ml-auto text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="divide-y">
        {LS_SEGMENTS.map(({ key, label, color }) => {
          const val = data[key];
          const isOpen = openKey === key;
          const byteSize = localStorage.getItem(key)?.length ?? 0;
          const count = Array.isArray(val) ? val.length : val !== null ? 1 : 0;
          const str = val !== null ? JSON.stringify(val, null, 2) : "null";

          return (
            <div key={key}>
              <button
                onClick={() => setOpenKey(isOpen ? null : key)}
                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-muted/20 transition-colors"
              >
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${color}`}>{key}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
                {val !== null ? (
                  <span className="text-xs text-muted-foreground ml-auto shrink-0">
                    {count > 0 ? `${count} item${count !== 1 ? "s" : ""}` : "object"} · {(byteSize / 1024).toFixed(1)} KB
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground ml-auto shrink-0 italic">empty</span>
                )}
                <span className="text-muted-foreground shrink-0 ml-2">
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <div className="relative group">
                    <pre className="text-xs font-mono bg-black/80 text-green-300 rounded-lg p-4 overflow-x-auto max-h-[400px] whitespace-pre-wrap break-words leading-relaxed">
                      {str}
                    </pre>
                    <button
                      onClick={() => { navigator.clipboard.writeText(str); }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PASS_COLORS = {
  "PRE_ANALYSIS:REVERSE_SEARCH": "text-sky-500 bg-sky-500/10 border-sky-500/20",
  "PRE_ANALYSIS:WATERMARK": "text-teal-500 bg-teal-500/10 border-teal-500/20",
  "PASS_0:IMAGE_TYPE": "text-violet-500 bg-violet-500/10 border-violet-500/20",
  "PASS_1:SCENE": "text-blue-500 bg-blue-500/10 border-blue-500/20",
  "PASS_1B:DESCRIPTION_VERDICT": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "PASS_1C:IMAGE_TYPE_FROM_DESCRIPTION": "text-pink-500 bg-pink-500/10 border-pink-500/20",
  "PASS_2:FORENSIC": "text-red-500 bg-red-500/10 border-red-500/20",
  "POST:EXIF": "text-green-500 bg-green-500/10 border-green-500/20",
  "POST:SCORING": "text-purple-500 bg-purple-500/10 border-purple-500/20",
};

function getPassColor(name) {
  return PASS_COLORS[name] || "text-muted-foreground bg-muted/50 border-border";
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function JsonBlock({ data }) {
  const str = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return (
    <div className="relative group">
      <pre className="text-xs font-mono bg-black/80 text-green-300 rounded-lg p-4 overflow-x-auto max-h-[500px] whitespace-pre-wrap break-words leading-relaxed">
        {str}
      </pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={str} />
      </div>
    </div>
  );
}

function LogEntry({ entry, index }) {
  const [open, setOpen] = useState(false);
  const color = getPassColor(entry.name);

  const sections = [];
  if (entry.prompt) sections.push({ label: "Prompt Sent", data: entry.prompt, isText: true });
  if (entry.schema) sections.push({ label: "Response Schema", data: entry.schema });
  if (entry.input) sections.push({ label: "Input Data", data: entry.input });
  if (entry.result) sections.push({ label: "LLM Response", data: entry.result });
  if (entry.raw_result) sections.push({ label: "Raw Result", data: entry.raw_result });
  if (entry.notes) sections.push({ label: "Notes", data: entry.notes, isText: true });
  if (entry.computed) sections.push({ label: "Computed Values", data: entry.computed });

  return (
    <div className={`border rounded-lg overflow-hidden ${open ? "shadow-md" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">#{index + 1}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${color}`}>
          {entry.name}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3" /> +{entry.elapsed_ms}ms
        </span>
        {entry.verdict && (
          <Badge variant="outline" className={`text-xs shrink-0 ${entry.verdict === "real" ? "text-emerald-600" : entry.verdict === "ai_generated" ? "text-red-500" : "text-amber-500"}`}>
            {entry.verdict}
          </Badge>
        )}
        {entry.score !== undefined && (
          <span className="text-xs text-muted-foreground shrink-0">score: {entry.score}</span>
        )}
        <span className="text-xs text-muted-foreground ml-auto truncate max-w-xs hidden sm:block">
          {entry.summary || ""}
        </span>
        <span className="ml-auto shrink-0 text-muted-foreground">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>

      {open && (
        <div className="border-t px-4 py-4 space-y-4 bg-muted/20">
          <div className="text-xs text-muted-foreground">
            Fired at: <span className="font-mono">{entry.timestamp}</span>
          </div>
          {sections.map((sec, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  {sec.isText ? <Terminal className="w-3 h-3" /> : <FileJson className="w-3 h-3" />}
                  {sec.label}
                </p>
                <CopyButton text={sec.isText ? String(sec.data) : JSON.stringify(sec.data, null, 2)} />
              </div>
              {sec.isText ? (
                <pre className="text-xs font-mono bg-black/80 text-cyan-300 rounded-lg p-4 overflow-x-auto max-h-[400px] whitespace-pre-wrap break-words leading-relaxed">
                  {String(sec.data)}
                </pre>
              ) : (
                <JsonBlock data={sec.data} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionView({ session, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef(null);

  useEffect(() => {
    if (defaultOpen && ref.current) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [defaultOpen]);

  return (
    <div ref={ref} className={`border rounded-xl overflow-hidden shadow-sm ${defaultOpen ? "ring-2 ring-primary" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-card hover:bg-muted/30 transition-colors text-left"
      >
        {session.image_url && (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img
              src={session.image_url}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {session.image_url?.startsWith("data:") ? "Uploaded image (base64)" : session.image_url?.slice(0, 80) || "Unknown image"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(session.timestamp).toLocaleString()} · {session.entries?.length || 0} passes logged
          </p>
        </div>
        {session.analysis_id && (
          <Link
            to={`/history?analysis=${session.analysis_id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors shrink-0 mr-2"
            title="View in History"
          >
            <History className="w-3.5 h-3.5" />
            History
          </Link>
        )}
        <span className="text-muted-foreground shrink-0">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>

      {open && (
        <div className="border-t bg-background px-4 py-4 space-y-2">
          {(session.entries || []).map((entry, i) => (
            <LogEntry key={entry.id || i} entry={entry} index={i} />
          ))}
          {(!session.entries || session.entries.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-6">No log entries recorded.</p>
          )}
        </div>
      )}
    </div>
  );
}

function SyncDiagnostics() {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState(null);

  const compute = () => {
    const analyses = listAnalyses();          // aiorreal_analyses
    const sessions = getAllSessions();        // aiorreal_analysis_logs

    const analysisById = Object.fromEntries(analyses.map((a) => [a.id, a]));
    const sessionByAnalysisId = Object.fromEntries(
      sessions.filter((s) => s.analysis_id).map((s) => [s.analysis_id, s])
    );

    // History records that have NO matching log session
    const historyWithoutLog = analyses.filter(
      (a) => !a.session_id || !sessionByAnalysisId[a.id]
    );

    // Log sessions that have NO matching history record
    const logsWithoutHistory = sessions.filter(
      (s) => s.analysis_id && !analysisById[s.analysis_id]
    );

    // Log sessions with NO analysis_id at all (orphaned, never linked)
    const logsNeverLinked = sessions.filter((s) => !s.analysis_id);

    // History records whose session_id exists but points to a missing session
    const brokenSessionLinks = analyses.filter(
      (a) =>
        a.session_id &&
        !sessions.find((s) => s.id === a.session_id)
    );

    setReport({ historyWithoutLog, logsWithoutHistory, logsNeverLinked, brokenSessionLinks, analyses, sessions });
  };

  useEffect(() => { compute(); }, []);

  if (!report) return null;

  const totalGaps =
    report.historyWithoutLog.length +
    report.logsWithoutHistory.length +
    report.logsNeverLinked.length +
    report.brokenSessionLinks.length;

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => { compute(); setOpen((v) => !v); }}
        className="w-full flex items-center gap-3 px-5 py-3 bg-muted/40 border-b text-left hover:bg-muted/60 transition-colors"
      >
        <AlertTriangle className={`w-4 h-4 ${totalGaps > 0 ? "text-amber-500" : "text-emerald-500"}`} />
        <span className="text-sm font-semibold">Sync Diagnostics — History ↔ Logs</span>
        <span className="text-xs text-muted-foreground ml-2">
          {report.analyses.length} history records · {report.sessions.length} log sessions
        </span>
        {totalGaps > 0 ? (
          <Badge variant="outline" className="ml-auto text-amber-600 border-amber-500/30 bg-amber-500/10 shrink-0">
            {totalGaps} gap{totalGaps !== 1 ? "s" : ""}
          </Badge>
        ) : (
          <Badge variant="outline" className="ml-auto text-emerald-600 border-emerald-500/30 bg-emerald-500/10 shrink-0">
            In sync ✓
          </Badge>
        )}
        <span className="text-muted-foreground shrink-0 ml-1">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>

      {open && (
        <div className="p-4 space-y-5 text-sm">

          {/* ── History records without a log session ── */}
          <GapSection
            title="History records with no log session"
            direction="History → Logs"
            color="amber"
            items={report.historyWithoutLog}
            renderItem={(a) => (
              <div key={a.id} className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{a.id}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs truncate max-w-xs">{a.image_url?.startsWith("data:") ? "base64 image" : a.image_url}</span>
                {a.session_id ? (
                  <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">session_id set but session missing</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">no session_id</Badge>
                )}
                <Link to={`/history?analysis=${a.id}`} className="text-xs text-primary hover:underline ml-auto shrink-0">View in History</Link>
              </div>
            )}
          />

          {/* ── Log sessions without a history record ── */}
          <GapSection
            title="Log sessions with no history record"
            direction="Logs → History"
            color="red"
            items={report.logsWithoutHistory}
            renderItem={(s) => (
              <div key={s.id} className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{s.id}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs truncate max-w-xs">{s.image_url?.startsWith("data:") ? "base64 image" : s.image_url}</span>
                <Badge variant="outline" className="text-[10px] text-red-600 border-red-500/30">analysis_id={s.analysis_id} not in history</Badge>
              </div>
            )}
          />

          {/* ── Orphaned sessions (no analysis_id) ── */}
          <GapSection
            title="Orphaned log sessions (never linked to a history record)"
            direction="Logs only"
            color="violet"
            items={report.logsNeverLinked}
            renderItem={(s) => (
              <div key={s.id} className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{s.id}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs truncate max-w-xs">{s.image_url?.startsWith("data:") ? "base64 image" : s.image_url}</span>
                <Badge variant="outline" className="text-[10px] text-violet-600 border-violet-500/30">no analysis_id</Badge>
              </div>
            )}
          />

          {/* ── Broken session_id links ── */}
          <GapSection
            title="History records with broken session_id links"
            direction="Broken link"
            color="red"
            items={report.brokenSessionLinks}
            renderItem={(a) => (
              <div key={a.id} className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{a.id}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono text-xs text-red-500">{a.session_id}</span>
                <Badge variant="outline" className="text-[10px] text-red-600 border-red-500/30">session not found</Badge>
                <Link to={`/history?analysis=${a.id}`} className="text-xs text-primary hover:underline ml-auto shrink-0">View in History</Link>
              </div>
            )}
          />

          {totalGaps === 0 && (
            <p className="text-center text-sm text-emerald-600 py-2">
              ✓ All history records have matching log sessions and vice versa.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function GapSection({ title, direction, color, items, renderItem }) {
  const colors = {
    amber:  "text-amber-600 bg-amber-500/10 border-amber-500/20",
    red:    "text-red-600 bg-red-500/10 border-red-500/20",
    violet: "text-violet-600 bg-violet-500/10 border-violet-500/20",
  };
  const cls = colors[color] || colors.amber;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Link2Off className={`w-3.5 h-3.5 ${color === "red" ? "text-red-500" : color === "violet" ? "text-violet-500" : "text-amber-500"}`} />
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <Badge variant="outline" className={`text-[10px] ${cls}`}>{items.length}</Badge>
        <span className="text-[10px] text-muted-foreground ml-1">({direction})</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground pl-5">None — all good here.</p>
      ) : (
        <div className="pl-5 space-y-1.5 border-l-2 border-border">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}

export default function AnalysisLogs() {
  const [sessions, setSessions] = useState([]);
  const targetSessionId = new URLSearchParams(window.location.search).get("session");

  useEffect(() => {
    setSessions(getAllSessions());
  }, []);

  const handleClear = () => {
    clearAllSessions();
    setSessions([]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary" />
            Analysis Pipeline Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Full prompt trace, LLM inputs/outputs, and computed values — in firing order.
          </p>
        </div>
        {sessions.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear} className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </Button>
        )}
      </div>

      {/* Sync Diagnostics */}
      <SyncDiagnostics />

      {/* localStorage Segments */}
      <LocalStorageSegments />

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PASS_COLORS).map(([name, cls]) => (
          <span key={name} className={`text-xs font-mono px-2 py-0.5 rounded border ${cls}`}>{name}</span>
        ))}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Terminal className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No analysis sessions logged yet.</p>
          <p className="text-xs mt-1">Run an analysis from the home page to see logs here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{sessions.length} session(s) stored locally</p>
          {sessions.map((s) => (
            <SessionView key={s.id} session={s} defaultOpen={s.id === targetSessionId} />
          ))}
        </div>
      )}
    </div>
  );
}
