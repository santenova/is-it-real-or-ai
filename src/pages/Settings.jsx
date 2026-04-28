import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { useTheme } from "../lib/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Settings as SettingsIcon, Moon, Sun, Sliders, CheckCircle, Server, LogIn, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "../api/client";

const port = window.location.port;
const hostname = window.location.hostname;

// Custom String.format function
function formatString(template, ...args) {
    return template.replace(/{(\d+)}/g, (match, index) => {
        return typeof args[index] !== 'undefined' ? args[index] : match;
    });
}


let template = "";
let result = "";
if (port) {
    template = "http://{0}:{1}/proxy";
    result = formatString(template, hostname, port);
} else {
    template = "http://{0}/proxy";
    result = formatString(template, hostname);
}

console.log(result);




const DEFAULT_SETTINGS = {
  use_local_lms: true,
  local_mode: false,
  local_lms_endpoint: result,
  lms_model: "llava:7b",
  llm_temperature: 0,
  queue_sleep_ms: 500,
};

const KNOWN_MODELS = [
  "llava:7b",
  "llava:13b",
  "llava:34b",
  "llava-phi3",
  "llava-llama3",
  "llama3.2-vision",
  "minicpm-v",
  "moondream",
  "bakllava",
  "custom",
];

function loadSettings() {
  const raw = localStorage.getItem("verilens_settings");
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
}

function saveSettings(patch) {
  const current = loadSettings();
  localStorage.setItem("verilens_settings", JSON.stringify({ ...current, ...patch }));
}

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [temperature, setTemperature] = useState(0);
  const [queueSleep, setQueueSleep] = useState(500);
  const [lmsSettings, setLmsSettings] = useState({
    use_local_lms: false,
    local_mode: false,
    local_lms_endpoint: DEFAULT_SETTINGS.local_lms_endpoint,
    lms_model: DEFAULT_SETTINGS.lms_model,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setQueueSleep(s.queue_sleep_ms);
    setLmsSettings({
      use_local_lms: s.use_local_lms,
      local_mode: s.local_mode ?? false,
      local_lms_endpoint: s.local_lms_endpoint,
      lms_model: s.lms_model,
    });

    if (user?.email) {
      const t = localStorage.getItem(`user_temp_${user.email}`);
      if (t) setTemperature(parseFloat(t));
    }
  }, [user]);

  const handleTemperatureChange = (value) => {
    setTemperature(value);
    if (user?.email) {
      localStorage.setItem(`user_temp_${user.email}`, value.toString());
    }
  };

  const handleSave = () => {
    saveSettings({ queue_sleep_ms: queueSleep, ...lmsSettings });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Guest view — shown when not logged in
  if (!isAuthenticated) {
    return (
      <div className="space-y-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">Configure local model endpoint</p>
        </motion.div>

        {/* LMS Endpoint — available without login */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="w-5 h-5" />
                LMS Endpoint Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={lmsSettings.use_local_lms}
                    onChange={(e) => setLmsSettings((p) => ({ ...p, use_local_lms: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  Use Local LMS Endpoint
                </label>
                <p className="text-xs text-muted-foreground">
                  {lmsSettings.use_local_lms ? "Using local LMS endpoint for image analysis" : "Using ? default (OpenAI API) for image analysis"}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <label className="text-sm font-medium flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={lmsSettings.local_mode}
                    onChange={(e) => setLmsSettings((p) => ({ ...p, local_mode: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                  Local-Only Mode
                </label>
                <p className="text-xs text-muted-foreground">
                  When enabled: images are kept as base64 (never uploaded to cloud) and remote-dependent features like reverse image search are disabled. Ideal when running fully offline with a local model server.
                </p>
              </div>

              {lmsSettings.use_local_lms && (
                <div className="space-y-2 bg-blue-500/5 border border-blue-200/30 rounded-lg p-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Local Endpoint URL</label>
                    <Input
                      value={lmsSettings.local_lms_endpoint}
                      onChange={(e) => setLmsSettings((p) => ({ ...p, local_lms_endpoint: e.target.value }))}
                      className="font-mono text-xs"
                      placeholder="http://localhost:11434"
                    />
                  </div>
                  <div className="space-y-1 pt-2">
                    <label className="text-sm font-medium">Model</label>
                    <select
                      value={KNOWN_MODELS.includes(lmsSettings.lms_model) ? lmsSettings.lms_model : "custom"}
                      onChange={(e) => {
                        if (e.target.value !== "custom") setLmsSettings((p) => ({ ...p, lms_model: e.target.value }));
                        else setLmsSettings((p) => ({ ...p, lms_model: "" }));
                      }}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
                    >
                      {KNOWN_MODELS.map((m) => (
                        <option key={m} value={m}>{m === "custom" ? "Custom model name…" : m}</option>
                      ))}
                    </select>
                    {(!KNOWN_MODELS.includes(lmsSettings.lms_model) || lmsSettings.lms_model === "") && (
                      <Input
                        value={lmsSettings.lms_model}
                        onChange={(e) => setLmsSettings((p) => ({ ...p, lms_model: e.target.value }))}
                        className="font-mono text-xs mt-1"
                        placeholder="e.g. my-custom-vision-model"
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
          <Button onClick={handleSave} className="shadow-lg">Save Settings</Button>
          {saved && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Settings saved
            </motion.div>
          )}
        </motion.div>

        <div className="rounded-lg bg-muted/50 border border-border p-4 flex gap-3 items-start">
          <LogIn className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Sign in for more options</p>
            <p>Log in to access appearance settings, analysis temperature, and queue controls.</p>
            <Button size="sm" className="mt-3" onClick={() => apiClient.auth.redirectToLogin(window.location.href)}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground">Manage your personal preferences</p>
      </motion.div>

      {/* Theme Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Theme</p>
                <p className="text-xs text-muted-foreground mt-1">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === "dark" ? "Light" : "Dark"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analysis Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              Analysis Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Temperature: {temperature.toFixed(1)}</label>
              <p className="text-xs text-muted-foreground">Controls randomness in analysis (0 = consistent, 1 = creative)</p>
              <input
                type="range" min="0" max="1" step="0.1"
                value={temperature}
                onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2 pt-4 border-t">
              <label className="text-sm font-medium">Queue Processing Sleep: {queueSleep}ms</label>
              <p className="text-xs text-muted-foreground">Delay between processing queue items (prevents API rate limiting)</p>
              <input
                type="number" min="100" step="100"
                value={queueSleep}
                onChange={(e) => setQueueSleep(parseInt(e.target.value) || 500)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* LMS Endpoint Configuration */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="w-5 h-5" />
              LMS Endpoint Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={lmsSettings.use_local_lms}
                  onChange={(e) => setLmsSettings((p) => ({ ...p, use_local_lms: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                Use Local LMS Endpoint
              </label>
              <p className="text-xs text-muted-foreground">
                {lmsSettings.use_local_lms ? "Using local LMS endpoint for image analysis" : "Using ? default (OpenAI API) for image analysis"}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t">
              <label className="text-sm font-medium flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={lmsSettings.local_mode}
                  onChange={(e) => setLmsSettings((p) => ({ ...p, local_mode: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                Local-Only Mode
              </label>
              <p className="text-xs text-muted-foreground">
                When enabled: images are kept as base64 (never uploaded to cloud) and remote-dependent features like reverse image search are disabled. Ideal when running fully offline with a local model server.
              </p>
            </div>

            {lmsSettings.use_local_lms && (
              <div className="space-y-4 bg-blue-500/5 border border-blue-200/30 rounded-lg p-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Local Endpoint URL</label>
                  <p className="text-xs text-muted-foreground">Base URL of your local LMS server (e.g., http://localhost:11434)</p>
                  <Input
                    value={lmsSettings.local_lms_endpoint}
                    onChange={(e) => setLmsSettings((p) => ({ ...p, local_lms_endpoint: e.target.value }))}
                    className="font-mono text-xs"
                    placeholder="http://localhost:11434"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Model</label>
                  <p className="text-xs text-muted-foreground">Select a known vision-capable model or enter a custom name</p>
                  <select
                    value={KNOWN_MODELS.includes(lmsSettings.lms_model) ? lmsSettings.lms_model : "custom"}
                    onChange={(e) => {
                      if (e.target.value !== "custom") setLmsSettings((p) => ({ ...p, lms_model: e.target.value }));
                      else setLmsSettings((p) => ({ ...p, lms_model: "" }));
                    }}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
                  >
                    {KNOWN_MODELS.map((m) => (
                      <option key={m} value={m}>{m === "custom" ? "Custom model name…" : m}</option>
                    ))}
                  </select>
                  {(!KNOWN_MODELS.includes(lmsSettings.lms_model) || lmsSettings.lms_model === "") && (
                    <Input
                      value={lmsSettings.lms_model}
                      onChange={(e) => setLmsSettings((p) => ({ ...p, lms_model: e.target.value }))}
                      className="font-mono text-xs mt-1"
                      placeholder="e.g. my-custom-vision-model"
                    />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-3">
        <Button onClick={handleSave} className="shadow-lg">Save Settings</Button>
        {saved && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Settings saved
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
