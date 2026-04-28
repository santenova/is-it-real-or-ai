import React, { useState } from "react";
import { apiClient } from "../../api/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldQuestion, Search, Plus } from "lucide-react";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import { format } from "date-fns";

const VERDICT_CONFIG = {
  real:          { icon: ShieldCheck,    color: "text-emerald-500",  bg: "bg-emerald-500/10" },
  ai_generated:  { icon: ShieldAlert,   color: "text-red-500",      bg: "bg-red-500/10" },
  inconclusive:  { icon: ShieldQuestion, color: "text-amber-500",   bg: "bg-amber-500/10" },
};

export default function ImagePicker({ slot, selected, onSelect, exclude }) {
  const [search, setSearch] = useState("");

  const { data: analyses = [] } = useQuery({
    queryKey: ["analyses"],
    queryFn: () => apiClient.entities.ImageAnalysis.list("-created_date", 100),
  });

  const filtered = analyses
    .filter((a) => a.id !== exclude)
    .filter((a) =>
      !search ||
      a.filename?.toLowerCase().includes(search.toLowerCase()) ||
      a.image_url?.toLowerCase().includes(search.toLowerCase())
    );

  if (selected) {
    const cfg = VERDICT_CONFIG[selected.verdict] || VERDICT_CONFIG.inconclusive;
    const Icon = cfg.icon;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group rounded-2xl overflow-hidden bg-muted cursor-pointer border-2 border-primary/20"
        onClick={() => onSelect(null)}
      >
        <img
          src={selected.image_url}
          alt="Selected"
          className="w-full h-48 object-cover"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">
            Change image
          </span>
        </div>
        <div className={cn("absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm", cfg.bg, cfg.color)}>
          <Icon className="w-3 h-3" />
          {selected.confidence_score}%
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center cursor-default"
      >
        <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <Plus className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Select Image {slot} from history
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 bg-muted/50 border-0 text-sm"
        />
      </div>

      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        <AnimatePresence>
          {filtered.map((a, idx) => {
            const cfg = VERDICT_CONFIG[a.verdict] || VERDICT_CONFIG.inconclusive;
            const Icon = cfg.icon;
            return (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => onSelect(a)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition-colors text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  <img
                    src={a.image_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-foreground">
                    {a.filename || "URL image"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={cn("w-4 h-4 rounded flex items-center justify-center", cfg.bg)}>
                      <Icon className={cn("w-2.5 h-2.5", cfg.color)} />
                    </div>
                    <span className={cn("text-xs font-medium", cfg.color)}>
                      {a.verdict === "ai_generated" ? "AI" : a.verdict === "real" ? "Real" : "Unclear"} · {a.confidence_score}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {a.created_date && format(new Date(a.created_date), "MMM d")}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No analyses found</p>
        )}
      </div>
    </div>
  );
}
