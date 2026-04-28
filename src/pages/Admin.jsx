import React, { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Settings, AlertCircle, CheckCircle, Trash2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Skeleton } from "../components/ui/skeleton";
import TokenUsageStats from "../components/admin/TokenUsageStats";
import { format } from "date-fns";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    confidence_threshold: 50,
    small_image_threshold: 800,
    enable_flagging: true,
    queue_sleep_ms: 500,
    use_local_lms: false,
    local_lms_endpoint: "https://christy-ramentaceous-verbatim.ngrok-free.dev",
    lms_model: "llava:7b",
    llm_temperature: 0,
    reverse_search_penalty_ai: false,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const currentUser = await apiClient.auth.me();
      if (currentUser?.role !== "admin") {
        window.location.href = "/";
        return;
      }
      setUser(currentUser);
      
      // Load settings from localStorage (simple storage)
      const saved = localStorage.getItem("aiorreal_settings");
      if (saved) {
        setSettings(JSON.parse(saved));
      } else {
        setSettings({
          confidence_threshold: 50,
          small_image_threshold: 800,
          enable_flagging: true,
          queue_sleep_ms: 500,
          use_local_lms: false,
          local_lms_endpoint: "https://christy-ramentaceous-verbatim.ngrok-free.dev",
          lms_model: "llava:7b",
          llm_temperature: 0,
          reverse_search_penalty_ai: false,
        });
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSave = () => {
    localStorage.setItem("aiorreal_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Fetch error logs
  const { data: errorLogs = [], isLoading: errorsLoading } = useQuery({
    queryKey: ["analysisErrors"],
    queryFn: () => apiClient.entities.AnalysisError.list("-created_date", 50).catch(() => []),
  });

  const handleDeleteError = async (id) => {
    await apiClient.entities.AnalysisError.delete(id);
    // Trigger refetch
    const logs = await apiClient.entities.AnalysisError.list("-created_date", 50).catch(() => []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin Settings</h1>
        </div>
        <p className="text-muted-foreground">Configure system behavior and monitor usage</p>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="prompt">Analysis Prompt</TabsTrigger>
          <TabsTrigger value="usage">Token Usage</TabsTrigger>
          <TabsTrigger value="errors">Error Logs ({errorLogs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-8 max-w-2xl">

      {/* System Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Admin User</p>
                <p className="text-sm font-medium">{user?.full_name || user?.email}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium capitalize">{user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analysis Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Analysis Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confidence Threshold */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confidence Score Threshold (%)
              </label>
              <p className="text-xs text-muted-foreground">
                Minimum confidence required for "Real" or "AI Generated" verdicts
              </p>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.confidence_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    confidence_threshold: parseInt(e.target.value) || 0,
                  })
                }
                className="max-w-xs"
              />
            </div>

            {/* Small Image Threshold */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Small Image Threshold (pixels)
              </label>
              <p className="text-xs text-muted-foreground">
                Images smaller than this dimension may skip visual analysis if EXIF data is authentic
              </p>
              <Input
                type="number"
                min="100"
                value={settings.small_image_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    small_image_threshold: parseInt(e.target.value) || 0,
                  })
                }
                className="max-w-xs"
              />
            </div>

            {/* Flagging */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enable_flagging}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enable_flagging: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded"
                />
                Enable Region Flagging
              </label>
              <p className="text-xs text-muted-foreground">
                Flag suspicious regions detected in analyzed images
              </p>
            </div>

            {/* Reverse Search Penalty */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.reverse_search_penalty_ai}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      reverse_search_penalty_ai: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded"
                />
                Google Reverse Search: +10% AI if Zero Matches
              </label>
              <p className="text-xs text-muted-foreground">
                Increase AI probability by 10% when reverse image search returns zero results
              </p>
            </div>

            {/* Queue Sleep Pause */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Queue Sleep Pause (milliseconds)
              </label>
              <p className="text-xs text-muted-foreground">
                Delay between processing queue items to avoid API rate limiting (default: 500ms)
              </p>
              <Input
                type="number"
                min="100"
                step="100"
                value={settings.queue_sleep_ms}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    queue_sleep_ms: parseInt(e.target.value) || 100,
                  })
                }
                className="max-w-xs"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3"
      >
        <Button onClick={handleSave} className="shadow-lg">
          Save Settings
        </Button>

        {saved && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-emerald-600 text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Settings saved
          </motion.div>
        )}
      </motion.div>

          {/* Info */}
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Settings stored locally</p>
              <p>These settings are currently stored in your browser. Consider implementing a backend settings service for production use.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prompt" className="space-y-4 max-w-4xl">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Analysis Prompt</h2>
            <p className="text-sm text-muted-foreground">This is the system prompt sent to the LLM for image analysis</p>
          </div>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed font-mono text-foreground/80 max-h-96 overflow-y-auto whitespace-pre-wrap break-words">
{`You are an expert image forensics analyst. Analyze this image and determine if it is a real photograph or AI-generated.
Display each criteria sub score

Evaluate the following criteria and give each a score from 0-100
Important all criterias get a score 0-100 (where 100 means "definitely real/authentic" and 0 means "definitely AI-generated/fake") display criteria score too
1. texture_consistency - High if textures look natural, low if suspiciously smooth or repetitive.
2. lighting_analysis - High if lighting is physically plausible, low if inconsistent or impossible.
3. edge_detection - High if edges look natural, low if unnaturally sharp or soft.
4. noise_pattern - High if noise matches real camera sensors, low if too clean or patterned.
5. facial_analysis - High if faces look natural (50 if no faces present), low if uncanny or malformed.
6. metadata_integrity - High if image appears to have authentic compression/origin markers, low if suspicious.
7. color_distribution - High if colors look natural, low if too uniform or impossible.
8. artifact_detection - High if no AI artifacts, low if malformed text/hands/geometry/seamlines present.
9. shading_analysis - High if shading is consistent with lighting and object form, low if inconsistent.
10. depth_of_field - High if the depth of field effect is realistic, low if unnatural or missing.
11. motion_blur - High if motion blur is consistent with implied movement, low if unnatural or misplaced.
12. background_consistency - High if background matches foreground elements and lighting, low if inconsistent.
13. shadow_analysis - High if shadows are consistent with light sources and object positions, low if incorrect.
14. perspective_correctness - High if perspective is realistic, low if distorted or inconsistent.
15. compression_artifacts - High if no visible compression artifacts, low if present (e.g., blockiness in JPEG).
16. image_text_indication - High 100 if no text is detected, low 50 if text is present; extensive text lowers the score unless logical and pro authentic.
17. contents_reality - Evaluate image contents; score 100 if all appears logical, drops if things don't reflect reality.

Provide:
- verdict: "real", "ai_generated", or "inconclusive"
- confidence_score: overall authenticity score 0-100. Use HIGH values (70-100) for real images, LOW values (0-30) for AI-generated images, and MID values (35-65) for inconclusive.
- analysis_summary: A 2-3 sentence explanation of your findings.
- flagged_regions: An array of suspicious areas. Each region must have x, y, width, height (as % of image), category, and label.

IMPORTANT: confidence_score must MATCH the verdict. If verdict is "ai_generated", confidence_score should be LOW (0-30). If verdict is "real", it should be HIGH (70-100).

Be thorough. Look for unnatural symmetry, impossible geometry, texture inconsistencies, lighting anomalies, unusual blending, or perfect smoothness.`}
              </pre>
            </CardContent>
          </Card>
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Prompt is hardcoded</p>
              <p>To modify this prompt, edit the ANALYSIS_PROMPT constant in pages/Home.jsx</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <TokenUsageStats />
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Analysis Error Logs</h2>
            {errorLogs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  errorLogs.forEach(log => {
                    apiClient.entities.AnalysisError.delete(log.id).catch(() => {});
                  });
                }}
                className="gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </Button>
            )}
          </div>

          {errorsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          ) : errorLogs.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground">No errors recorded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {errorLogs.map(log => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 bg-red-500/5 border-red-500/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <p className="font-medium text-sm text-foreground">
                          {log.error_message}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>User: {log.user_email || "Unknown"}</p>
                        <p>Source: {log.source_type} · Time: {log.timestamp ? format(new Date(log.timestamp), "PPpp") : "Unknown"}</p>
                        {log.image_url && (
                          <p className="truncate">Image: {log.image_url}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteError(log.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
