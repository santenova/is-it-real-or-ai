import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, ArrowLeftRight } from "lucide-react";
import { Button } from "../components/ui/button";
import ImagePicker from "../components/compare/ImagePicker";
import ComparePanel from "../components/compare/ComparePanel";
import CompareStats from "../components/compare/CompareStats";

export default function Compare() {
  const [leftImage, setLeftImage] = useState(null);
  const [rightImage, setRightImage] = useState(null);

  const canCompare = leftImage && rightImage;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <GitCompare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compare Mode</h1>
          <p className="text-sm text-muted-foreground">
            Select two analyzed images to compare forensic scores side-by-side
          </p>
        </div>
      </div>

      {/* Pickers */}
      <AnimatePresence>
        {!canCompare && (
          <motion.div
            key="pickers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Left picker */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">A</span>
                </div>
                <h2 className="font-semibold text-sm">Image A</h2>
              </div>
              <ImagePicker
                slot="A"
                selected={leftImage}
                onSelect={setLeftImage}
                exclude={rightImage?.id}
              />
            </div>

            {/* Right picker */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/70 flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">B</span>
                </div>
                <h2 className="font-semibold text-sm">Image B</h2>
              </div>
              <ImagePicker
                slot="B"
                selected={rightImage}
                onSelect={setRightImage}
                exclude={leftImage?.id}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active comparison */}
      <AnimatePresence>
        {canCompare && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Change images button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => { setLeftImage(null); setRightImage(null); }}
              >
                <ArrowLeftRight className="w-4 h-4" />
                Change Images
              </Button>
            </div>

            {/* Stats bar */}
            <CompareStats left={leftImage} right={rightImage} />

            {/* Split panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left label */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">A</span>
                  </div>
                  <h2 className="font-semibold">
                    {leftImage.filename || "Image A"}
                  </h2>
                </div>
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-5">
                  <ComparePanel analysis={leftImage} otherAnalysis={rightImage} side="left" />
                </div>
              </div>

              {/* Right label */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/70 flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">B</span>
                  </div>
                  <h2 className="font-semibold">
                    {rightImage.filename || "Image B"}
                  </h2>
                </div>
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-5">
                  <ComparePanel analysis={rightImage} otherAnalysis={leftImage} side="right" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!canCompare && !leftImage && !rightImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 text-sm text-muted-foreground"
        >
          Select an image from each panel above to start comparing
        </motion.div>
      )}
    </div>
  );
}
