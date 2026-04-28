import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function FlaggedRegionHeatmap({ imageUrl, flaggedRegions }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    // Only set crossOrigin for hosted URLs — base64 data URLs don't need it
    if (!imageUrl.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      drawHeatmap(img);
    };
    img.onerror = () => setLoading(false);
    img.src = imageUrl;
  }, [imageUrl, flaggedRegions, showHeatmap]);

  const drawHeatmap = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image
    ctx.drawImage(img, 0, 0);

    if (!showHeatmap || !flaggedRegions || flaggedRegions.length === 0) {
      setLoading(false);
      return;
    }

    // Create a heatmap layer
    const heatmapCanvas = document.createElement("canvas");
    heatmapCanvas.width = img.width;
    heatmapCanvas.height = img.height;
    const heatCtx = heatmapCanvas.getContext("2d");

    // Create gradient colors for severity (red = high severity, yellow = medium, transparent = low)
    const categoryIntensity = {
      artifact: 1.0,
      texture: 0.8,
      lighting: 0.7,
      edge: 0.7,
      noise: 0.6,
      geometry: 0.9,
      face: 0.85,
      color: 0.6,
    };

    // Draw each flagged region as a gradient circle/blur
    flaggedRegions.forEach((region) => {
      const x = (region.x / 100) * img.width;
      const y = (region.y / 100) * img.height;
      const w = (region.width / 100) * img.width;
      const h = (region.height / 100) * img.height;
      const centerX = x + w / 2;
      const centerY = y + h / 2;
      const radius = Math.max(w, h) / 2;
      const intensity = categoryIntensity[region.category] || 0.7;

      // Create radial gradient
      const gradient = heatCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
      gradient.addColorStop(0, `rgba(255, 0, 0, ${0.4 * intensity})`);
      gradient.addColorStop(0.5, `rgba(255, 165, 0, ${0.2 * intensity})`);
      gradient.addColorStop(1, `rgba(255, 165, 0, 0)`);

      heatCtx.fillStyle = gradient;
      heatCtx.beginPath();
      heatCtx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      heatCtx.fill();
    });

    // Blend heatmap with original image
    ctx.globalAlpha = 0.5;
    ctx.drawImage(heatmapCanvas, 0, 0);
    ctx.globalAlpha = 1.0;

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden bg-muted h-64 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          AI Detection Heatmap
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="gap-1.5 text-xs"
        >
          {showHeatmap ? (
            <>
              <EyeOff className="w-3 h-3" />
              Hide Heatmap
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              Show Heatmap
            </>
          )}
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden bg-muted max-h-96 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain max-h-96"
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">High severity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400" />
          <span className="text-muted-foreground">Medium severity</span>
        </div>
      </div>
    </motion.div>
  );
}
