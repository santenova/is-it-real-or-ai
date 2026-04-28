import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { MessageSquare, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

const COLORS = {
  artifact: "bg-red-500",
  suspicious: "bg-orange-500",
  texture: "bg-yellow-500",
  lighting: "bg-blue-500",
  face: "bg-purple-500",
  geometry: "bg-pink-500",
  other: "bg-slate-500",
};

export default function AnnotationCanvas({
  imageUrl,
  annotations = [],
  onAddAnnotation,
  onRemoveAnnotation,
  disabled = false,
}) {
  const containerRef = useRef(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newCategory, setNewCategory] = useState("suspicious");
  const [pendingPin, setPendingPin] = useState(null);
  const [hoveredPin, setHoveredPin] = useState(null);

  const handleCanvasClick = (e) => {
    if (disabled || !isAdding) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPendingPin({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleSaveAnnotation = () => {
    if (!pendingPin || !newNote.trim()) return;

    onAddAnnotation({
      x: pendingPin.x,
      y: pendingPin.y,
      note: newNote.trim(),
      category: newCategory,
    });

    setPendingPin(null);
    setNewNote("");
    setNewCategory("suspicious");
    setIsAdding(false);
  };

  const handleCancel = () => {
    setPendingPin(null);
    setNewNote("");
    setNewCategory("suspicious");
    setIsAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsAdding(!isAdding)}
          disabled={disabled}
          variant={isAdding ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {isAdding ? "Stop Adding" : "Add Annotations"}
        </Button>
        <p className="text-xs text-muted-foreground">
          {isAdding ? "Click on image to place pins" : annotations.length > 0 && `${annotations.length} annotation${annotations.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "relative rounded-xl overflow-hidden bg-muted max-h-80 cursor-crosshair",
          isAdding && "ring-2 ring-primary ring-offset-2",
          !isAdding && "cursor-default"
        )}
        onClick={handleCanvasClick}
      >
        <img
          src={imageUrl}
          alt="Annotatable"
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />

        {/* Annotation Pins */}
        <AnimatePresence>
          {annotations.map((ann, idx) => (
            <motion.div
              key={`${ann.x}-${ann.y}-${idx}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute"
              style={{
                left: `${ann.x}%`,
                top: `${ann.y}%`,
              }}
              onMouseEnter={() => setHoveredPin(idx)}
              onMouseLeave={() => setHoveredPin(null)}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg cursor-pointer",
                COLORS[ann.category] || COLORS.other,
                "hover:scale-125 transition-transform"
              )}>
                {idx + 1}
              </div>

              {hoveredPin === idx && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-8 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap"
                >
                  <Card className="p-2 bg-card shadow-lg max-w-xs">
                    <p className="text-xs font-medium text-foreground mb-1">{ann.note}</p>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-muted-foreground capitalize">{ann.category}</span>
                      {!disabled && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveAnnotation(idx);
                          }}
                          className="text-destructive hover:bg-destructive/10 rounded p-0.5 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pending Pin */}
        {pendingPin && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute"
            style={{
              left: `${pendingPin.x}%`,
              top: `${pendingPin.y}%`,
            }}
          >
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white border-2 border-white shadow-lg animate-pulse" />
          </motion.div>
        )}
      </div>

      {/* Add Annotation Form */}
      <AnimatePresence>
        {isAdding && pendingPin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border"
          >
            <p className="text-sm font-medium">Add Annotation</p>
            <Input
              placeholder="Describe what you see (e.g., unnatural blur, misaligned pixels)..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="h-10 bg-card border-border"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveAnnotation();
              }}
            />
            <div>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="h-9 bg-card border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artifact">Artifact</SelectItem>
                  <SelectItem value="suspicious">Suspicious</SelectItem>
                  <SelectItem value="texture">Texture</SelectItem>
                  <SelectItem value="lighting">Lighting</SelectItem>
                  <SelectItem value="face">Face</SelectItem>
                  <SelectItem value="geometry">Geometry</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveAnnotation}
                size="sm"
                className="flex-1"
                disabled={!newNote.trim()}
              >
                Save Annotation
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      {annotations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-muted/50 rounded-lg p-3 space-y-2 border border-border"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Annotations ({annotations.length})
          </p>
          <div className="space-y-1.5">
            {annotations.map((ann, idx) => (
              <div key={`${ann.x}-${ann.y}-${idx}`} className="flex items-start gap-2 text-xs">
                <div className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5",
                  COLORS[ann.category] || COLORS.other
                )}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground/80">{ann.note}</p>
                  <p className="text-muted-foreground capitalize">{ann.category}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
