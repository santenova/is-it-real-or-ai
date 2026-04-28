import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ExternalLink } from "lucide-react";
import { Button } from "../../components/ui/button";

function downloadBase64(dataUrl) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "image.jpg";
  a.click();
}

export default function ImageLightbox({ imageUrl, onClose }) {
  const isBase64 = imageUrl?.startsWith("data:");

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        {/* Toolbar */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {!isBase64 && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="icon" variant="ghost" className="bg-white/10 hover:bg-white/20 text-white">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
          {isBase64 ? (
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 text-white"
              onClick={(e) => { e.stopPropagation(); downloadBase64(imageUrl); }}
            >
              <Download className="w-4 h-4" />
            </Button>
          ) : (
            <a href={imageUrl} download onClick={(e) => e.stopPropagation()}>
              <Button size="icon" variant="ghost" className="bg-white/10 hover:bg-white/20 text-white">
                <Download className="w-4 h-4" />
              </Button>
            </a>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Image */}
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          src={imageUrl}
          alt="Full resolution"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-default"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    </AnimatePresence>
  );
}
