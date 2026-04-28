import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Clock, XCircle, X, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import ExportQueueButton from "./ExportQueueButton";

const STATUS_CONFIG = {
  pending:    { icon: Clock,        color: "text-muted-foreground", bg: "bg-muted/50",        label: "Waiting" },
  uploading:  { icon: Loader2,      color: "text-primary",          bg: "bg-primary/10",      label: "Uploading", spin: true },
  analyzing:  { icon: Loader2,      color: "text-primary",          bg: "bg-primary/10",      label: "Analyzing", spin: true },
  done_real:  { icon: ShieldCheck,  color: "text-emerald-600",      bg: "bg-emerald-500/10",  label: "Real" },
  done_ai:    { icon: ShieldAlert,  color: "text-red-600",          bg: "bg-red-500/10",      label: "AI Generated" },
  done_inc:   { icon: ShieldQuestion, color: "text-amber-600",      bg: "bg-amber-500/10",    label: "Inconclusive" },
  error:      { icon: XCircle,      color: "text-destructive",      bg: "bg-destructive/10",  label: "Error" },
};

function getStatusKey(item) {
  if (item.status === "done") {
    if (item.result?.verdict === "real") return "done_real";
    if (item.result?.verdict === "ai_generated") return "done_ai";
    return "done_inc";
  }
  return item.status;
}

export default function QueueProgress({ queue, onRemove, onClearAll }) {
  if (queue.length === 0) return null;

  const doneCount = queue.filter((i) => i.status === "done").length;
  const totalCount = queue.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          Queue — {doneCount}/{totalCount} complete
        </p>
        <div className="flex items-center gap-2">
          <ExportQueueButton queue={queue} />
          <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={onClearAll}>
            Clear all
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(doneCount / totalCount) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Items */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        <AnimatePresence>
          {queue.map((item) => {
            const key = getStatusKey(item);
            const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {item.preview && (
                    <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.filename}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <div className={cn("w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0", cfg.bg)}>
                      <Icon className={cn("w-3 h-3", cfg.color, cfg.spin && "animate-spin")} />
                    </div>
                    <span className={cn("text-xs font-medium", cfg.color)}>{cfg.label}</span>
                    {item.result?.confidence_score != null && (
                      <span className="text-xs text-muted-foreground">
                        · {item.result.confidence_score}%
                      </span>
                    )}
                    {item.result?.image_type?.category && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {item.result.image_type.category}
                        {item.result.image_type.sub_type ? ` · ${item.result.image_type.sub_type}` : ""}
                      </span>
                    )}
                  </div>
                  {item.result?.image_description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {item.result.image_description}
                    </p>
                  )}
                </div>

                {/* Remove */}
                {(item.status === "pending" || item.status === "done" || item.status === "error") && (
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
