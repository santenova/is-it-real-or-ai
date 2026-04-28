import { useState, useEffect } from "react";
import { Server, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";


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




const DEFAULT = {
  use_local_lms: false,
  local_lms_endpoint: result,
  lms_model: "llava:7b",
};

const KNOWN_MODELS = [
  "llava:7b", "llava:13b", "llava:34b", "llava-phi3", "llava-llama3",
  "llama3.2-vision", "minicpm-v", "moondream", "bakllava", "custom",
];

function load() {
  const raw = localStorage.getItem("verilens_settings");
  const saved = raw ? JSON.parse(raw) : {};
  return { ...DEFAULT, ...saved };
}

function save(patch) {
  const current = load();
  localStorage.setItem("verilens_settings", JSON.stringify({ ...current, ...patch }));
}

export default function LmsConfigPopover() {
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) setCfg(load());
  }, [open]);

  const handleSave = () => {
    save(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="LMS Endpoint Settings"
          className={cfg.use_local_lms ? "text-primary" : "text-muted-foreground hover:text-foreground"}
        >
          <Server className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4 p-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold">LMS Endpoint</p>
          <p className="text-xs text-muted-foreground">Configure your local AI model server</p>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={cfg.use_local_lms}
            onChange={(e) => setCfg((p) => ({ ...p, use_local_lms: e.target.checked }))}
            className="w-4 h-4 rounded"
          />
          Use Local LMS Endpoint
        </label>

        {cfg.use_local_lms && (
          <div className="space-y-3 bg-muted/50 rounded-lg p-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Endpoint URL</label>
              <Input
                value={cfg.local_lms_endpoint}
                onChange={(e) => setCfg((p) => ({ ...p, local_lms_endpoint: e.target.value }))}
                className="font-mono text-xs h-8"
                placeholder="http://localhost:11434"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Model</label>
              <select
                value={KNOWN_MODELS.includes(cfg.lms_model) ? cfg.lms_model : "custom"}
                onChange={(e) => {
                  if (e.target.value !== "custom") setCfg((p) => ({ ...p, lms_model: e.target.value }));
                  else setCfg((p) => ({ ...p, lms_model: "" }));
                }}
                className="w-full px-2 py-1.5 rounded-md border border-input bg-background text-xs font-mono"
              >
                {KNOWN_MODELS.map((m) => (
                  <option key={m} value={m}>{m === "custom" ? "Custom…" : m}</option>
                ))}
              </select>
              {(!KNOWN_MODELS.includes(cfg.lms_model) || cfg.lms_model === "") && (
                <Input
                  value={cfg.lms_model}
                  onChange={(e) => setCfg((p) => ({ ...p, lms_model: e.target.value }))}
                  className="font-mono text-xs h-8 mt-1"
                  placeholder="e.g. my-custom-model"
                />
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" onClick={handleSave} className="w-full">Save</Button>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 whitespace-nowrap">
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
