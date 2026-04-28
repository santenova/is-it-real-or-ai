import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Loader2, Activity, EyeOff, Eye } from "lucide-react";

// Computes a noise floor heatmap by analyzing local pixel variance in blocks.
// Areas with suspiciously LOW variance (too smooth) are flagged as warm colors —
// a common signature of AI-generated images which lack natural sensor noise.
function computeNoiseHeatmap(imageData, blockSize = 12) {
  const { data, width, height } = imageData;
  const cols = Math.ceil(width / blockSize);
  const rows = Math.ceil(height / blockSize);
  const heatmap = new Float32Array(cols * rows);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x0 = col * blockSize;
      const y0 = row * blockSize;
      const x1 = Math.min(x0 + blockSize, width);
      const y1 = Math.min(y0 + blockSize, height);

      const values = [];
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * width + x) * 4;
          // Luminance
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          values.push(lum);
        }
      }

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
      heatmap[row * cols + col] = Math.sqrt(variance); // std dev = noise level
    }
  }

  return { heatmap, cols, rows };
}

function drawHeatmapOverlay(canvas, imageData, blockSize = 12) {
  const { width, height } = imageData;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Draw original image pixels
  ctx.putImageData(imageData, 0, 0);

  const { heatmap, cols, rows } = computeNoiseHeatmap(imageData, blockSize);

  // Normalize
  const max = Math.max(...heatmap);
  const min = Math.min(...heatmap);
  const range = max - min || 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const noise = heatmap[row * cols + col];
      // Normalized: 0 = very smooth (suspicious), 1 = noisy (natural)
      const normalized = (noise - min) / range;

      // Only highlight suspiciously smooth areas (low noise = potential AI artifact)
      if (normalized < 0.3) {
        const intensity = 1 - normalized / 0.3; // 0→1 as area gets smoother
        const alpha = intensity * 0.55;
        // Cool blue-to-red: smooth = red/orange, slightly noisy = yellow
        const r = Math.round(255 * intensity);
        const g = Math.round(80 * (1 - intensity));
        const b = 30;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
      }
    }
  }

  // Draw legend label
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(8, height - 28, 180, 22);
  ctx.fillStyle = "#fff";
  ctx.font = "11px sans-serif";
  ctx.fillText("🔴 Suspiciously smooth (low noise)", 14, height - 12);
}

export default function NoiseHeatmap({ imageUrl }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!imageUrl) return;
    setStatus("loading");

    const img = new Image();
    // Only set crossOrigin for hosted URLs — base64 data URLs don't need it and it can cause issues
    if (!imageUrl.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => {
      const offscreen = document.createElement("canvas");
      offscreen.width = img.naturalWidth;
      offscreen.height = img.naturalHeight;
      const offCtx = offscreen.getContext("2d");
      offCtx.drawImage(img, 0, 0);

      let imageData;
      try {
        imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
      } catch {
        setStatus("error");
        return;
      }

      if (canvasRef.current) {
        drawHeatmapOverlay(canvasRef.current, imageData);
        setStatus("done");
      }
    };
    img.onerror = () => setStatus("error");
    img.src = imageUrl;
  }, [imageUrl]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Noise Floor Analysis
          </h3>
        </div>
        {status === "done" && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setVisible((v) => !v)}>
            {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {visible ? "Hide overlay" : "Show overlay"}
          </Button>
        )}
      </div>

      <div className="relative rounded-xl overflow-hidden bg-muted">
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {status === "error" && (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Unable to load image for noise analysis (CORS restriction).
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-xl"
          style={{ display: status === "done" && visible ? "block" : status === "done" && !visible ? "none" : "none" }}
        />
        {status === "done" && !visible && (
          <img src={imageUrl} alt="Original" className="w-full h-auto rounded-xl" />
        )}
      </div>

      {status === "done" && (
        <p className="text-xs text-muted-foreground">
          Red/orange areas indicate suspiciously low sensor noise — regions that are unnaturally smooth, often a hallmark of AI-generated content.
        </p>
      )}
    </div>
  );
}
