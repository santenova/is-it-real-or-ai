import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

const CATEGORY_COLORS = {
  texture: { border: "border-orange-400", bg: "bg-orange-400/20", dot: "bg-orange-400", label: "text-orange-300" },
  lighting: { border: "border-yellow-400", bg: "bg-yellow-400/20", dot: "bg-yellow-400", label: "text-yellow-300" },
  edge: { border: "border-blue-400", bg: "bg-blue-400/20", dot: "bg-blue-400", label: "text-blue-300" },
  noise: { border: "border-purple-400", bg: "bg-purple-400/20", dot: "bg-purple-400", label: "text-purple-300" },
  face: { border: "border-pink-400", bg: "bg-pink-400/20", dot: "bg-pink-400", label: "text-pink-300" },
  artifact: { border: "border-red-400", bg: "bg-red-400/20", dot: "bg-red-400", label: "text-red-300" },
  geometry: { border: "border-cyan-400", bg: "bg-cyan-400/20", dot: "bg-cyan-400", label: "text-cyan-300" },
  color: { border: "border-green-400", bg: "bg-green-400/20", dot: "bg-green-400", label: "text-green-300" },
};

const DEFAULT_COLOR = { border: "border-red-400", bg: "bg-red-400/20", dot: "bg-red-400", label: "text-red-300" };

export default function ImageOverlay({ imageUrl, regions = [] }) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  if (!regions || regions.length === 0) return null;

  const getColor = (category) => CATEGORY_COLORS[category?.toLowerCase()] || DEFAULT_COLOR;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Flagged Regions
          </h3>
          <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
            {regions.length} area{regions.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => setShowOverlay((v) => !v)}
        >
          {showOverlay ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showOverlay ? "Hide" : "Show"}
        </Button>
      </div>

      {/* Image with overlays */}
      <div className="relative rounded-xl overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt="Analyzed"
          className="w-full object-contain max-h-96"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <AnimatePresence>
          {showOverlay && regions.map((region, i) => {
            const color = getColor(region.category);
            const isHovered = hoveredRegion === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "absolute border-2 rounded cursor-pointer transition-all duration-200",
                  color.border,
                  isHovered ? "bg-opacity-40" : "bg-opacity-20",
                  color.bg
                )}
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.width}%`,
                  height: `${region.height}%`,
                }}
                onMouseEnter={() => setHoveredRegion(i)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                {/* Label badge */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-7 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none"
                    >
                      {region.label || region.category}
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Corner indicator */}
                <div className={cn("absolute top-1 left-1 w-2 h-2 rounded-full", color.dot)} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {regions.map((region, i) => {
          const color = getColor(region.category);
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border cursor-pointer transition-colors",
                color.border,
                hoveredRegion === i ? color.bg : "bg-transparent"
              )}
              onMouseEnter={() => setHoveredRegion(i)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <div className={cn("w-2 h-2 rounded-full", color.dot)} />
              <span className="text-foreground/80">{region.label || region.category}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
