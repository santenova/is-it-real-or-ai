import { useEffect, useState } from "react";
import { Camera } from "lucide-react";

const LABELS = {
  Make: "Camera Make",
  Model: "Camera Model",
  Software: "Software",
  DateTimeOriginal: "Date Taken",
  GPSLatitude: "GPS Latitude",
  GPSLongitude: "GPS Longitude",
  ExposureTime: "Exposure Time",
  FNumber: "F-Number",
  ISO: "ISO",
  Flash: "Flash",
  LensModel: "Lens Model",
  ColorSpace: "Color Space",
  PixelXDimension: "Width (px)",
  PixelYDimension: "Height (px)",
};

function formatValue(key, val) {
  if (val === null || val === undefined) return "—";
  if (key === "DateTimeOriginal") {
    try { return new Date(val).toLocaleString(); } catch { return String(val); }
  }
  if (key === "ExposureTime") return val > 0 ? `1/${Math.round(1 / val)}s` : `${val}s`;
  if (key === "FNumber") return `f/${val}`;
  if (key === "GPSLatitude" || key === "GPSLongitude") return Number(val).toFixed(6) + "°";
  if (key === "Flash") return val === 0 ? "No Flash" : "Flash Fired";
  return String(val);
}

export default function ExifPanel({ metadata, imageUrl }) {
  const [imageDimensions, setImageDimensions] = useState(null);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => setImageDimensions({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imageUrl;
  }, [imageUrl]);

  const entries = Object.entries(LABELS)
    .map(([key, label]) => ({ key, label, value: metadata?.[key] }))
    .filter(({ value }) => value !== undefined && value !== null);

  // Authentic camera data requires: dimensions + date + (make OR model)
  const hasAuthenticCamera = 
    metadata?.PixelXDimension && 
    metadata?.PixelYDimension && 
    metadata?.DateTimeOriginal && 
    (metadata?.Make || metadata?.Model);

  const hasData = entries.length > 0 || !!imageDimensions;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Camera className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          EXIF Metadata
        </h3>
        {hasAuthenticCamera ? (
          <span className="text-xs text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
            ✓ Authentic Camera Data
          </span>
        ) : hasData ? (
          <span className="text-xs text-amber-600 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full">
            ⚠ Partial EXIF Data
          </span>
        ) : (
          <span className="text-xs text-gray-600 font-medium bg-gray-500/10 px-2 py-0.5 rounded-full">
            ✕ No EXIF Data
          </span>
        )}
      </div>
      {hasData ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {imageDimensions && (
            <div className="bg-muted/50 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground">Image Size</p>
              <p className="text-sm font-medium">{imageDimensions.w} × {imageDimensions.h} px</p>
            </div>
          )}
          {entries.map(({ key, label, value }) => (
            <div key={key} className="bg-muted/50 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium truncate">{formatValue(key, value)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-3">
          No EXIF metadata was found in this image. This is common for screenshots, web images, or files that have had metadata stripped — which can itself be a sign of manipulation.
        </p>
      )}
    </div>
  );
}