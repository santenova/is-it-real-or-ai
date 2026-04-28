import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Upload } from "lucide-react";
import { cn } from "../../lib/utils";

export default function MultiImageDropzone({ onFilesSelected, disabled }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length > 0) onFilesSelected(imageFiles);
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group select-none",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-primary/30 hover:border-primary/60 hover:bg-accent/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <AnimatePresence mode="wait">
        {isDragging ? (
          <motion.div
            key="dragging"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-3"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-semibold text-primary">Drop images here!</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Drag & drop images here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Multiple images supported · PNG, JPG, WEBP up to 10MB each
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
