import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Download, Chrome, AlertCircle, Zap, Shield, Lightbulb } from "lucide-react";

export default function BrowserPlugin() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Chrome className="w-4 h-4" />
          Browser Extension
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Analyze Images <span className="text-primary">Instantly</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-base">
          Install the VeriLens browser extension to check image authenticity directly from your browser with a single click.
        </p>
      </motion.div>

      {/* Download Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-xl shadow-black/5 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Preview */}
              <div className="flex-1 flex items-center justify-center">
                <div className="rounded-xl overflow-hidden bg-muted w-full max-w-xs shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400&h=500&fit=crop"
                    alt="Extension preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Quick & Easy Install</h2>
                  <p className="text-muted-foreground">
                    Add VeriLens to your browser and start analyzing images instantly. Right-click any image to check its authenticity.
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">One-Click Analysis</p>
                      <p className="text-xs text-muted-foreground">Right-click any image and analyze instantly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Privacy Focused</p>
                      <p className="text-xs text-muted-foreground">No image data is stored locally</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Smart Detection</p>
                      <p className="text-xs text-muted-foreground">AI-powered analysis with detailed reports</p>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  size="lg"
                  className="w-full gap-2 shadow-lg shadow-primary/20 h-11"
                  onClick={() => window.open("https://chrome.google.com/webstore", "_blank")}
                >
                  <Download className="w-4 h-4" />
                  Add to Chrome
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Available on Chrome Web Store. Firefox coming soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold">What You Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Right-Click Context Menu",
              description: "Analyze any image on any website with a single right-click",
            },
            {
              title: "Detailed Reports",
              description: "Get comprehensive authenticity scores and confidence metrics",
            },
            {
              title: "Quick Verdict",
              description: "See if an image is real, AI-generated, or inconclusive at a glance",
            },
            {
              title: "Flagged Regions",
              description: "View highlighted suspicious areas with detailed explanations",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
            >
              <Card className="border-0 shadow-md h-full">
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 flex gap-3"
      >
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Privacy Notice</p>
          <p>The extension analyzes images using our cloud AI service. Images are processed securely and not stored.</p>
        </div>
      </motion.div>

      {/* Requirements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold">System Requirements</h2>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex-shrink-0">Chrome</Badge>
              <span className="text-sm">Version 90 or later</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex-shrink-0">Firefox</Badge>
              <span className="text-sm">Coming soon</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex-shrink-0">Safari</Badge>
              <span className="text-sm">Coming soon</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
