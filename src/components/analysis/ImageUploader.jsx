import React, { useState, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Upload, Link as LinkIcon, X, ImageIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "./apis/client";

export default function ImageUploader({ onAnalyze, isAnalyzing }) {
  const [tab, setTab] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    const { file_url } = await apiClient.integrations.Core.UploadFile({ file });
    setUploadedUrl(file_url);
  };

  const handleSubmit = () => {
    if (tab === "upload" && uploadedUrl) {
      onAnalyze(uploadedUrl, "upload");
    } else if (tab === "url" && imageUrl.trim()) {
      setPreview(imageUrl.trim());
      onAnalyze(imageUrl.trim(), "url");
    }
  };

  const clearImage = () => {
    setPreview(null);
    setUploadedUrl(null);
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-4 h-4" /> Upload Image
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2">
            <LinkIcon className="w-4 h-4" /> Paste URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center cursor-pointer hover:border-primary/60 hover:bg-accent/30 transition-all duration-300 group"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Click to upload an image
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-2xl overflow-hidden bg-muted"
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-80 object-contain"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="url" className="mt-4 space-y-4">
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="h-12 text-base bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
          />
          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden bg-muted"
            >
              <img
                src={imageUrl}
                alt="URL Preview"
                className="w-full max-h-80 object-contain"
                onError={(e) => (e.target.style.display = "none")}
              />
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleSubmit}
        disabled={isAnalyzing || (tab === "upload" ? !uploadedUrl : !imageUrl.trim())}
        className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <ImageIcon className="w-5 h-5 mr-2" />
            Analyze Image
          </>
        )}
      </Button>
    </div>
  );
}
