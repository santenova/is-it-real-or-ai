const MAX_SESSIONS = 30;
const STORAGE_KEY = "verilens_analysis_logs";

export function createLogger() {
  const entries = [];
  const startTime = Date.now();

  function log(name, data) {
    entries.push({
      id: `${name}-${Date.now()}`,
      name,
      timestamp: new Date().toISOString(),
      elapsed_ms: Date.now() - startTime,
      ...data,
    });
  }

  function getLogs() {
    return [...entries];
  }

  return { log, getLogs };
}

export function saveSession(imageUrl, logs, analysisId = null) {
  const session = {
    id: `session-${Date.now()}`,
    timestamp: new Date().toISOString(),
    image_url: imageUrl,
    analysis_id: analysisId,
    entries: logs,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const sessions = raw ? JSON.parse(raw) : [];
    sessions.unshift(session);
    if (sessions.length > MAX_SESSIONS) sessions.length = MAX_SESSIONS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn("Failed to save analysis log session:", e);
  }

  return session.id;
}

export function getAllSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearAllSessions() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Error log (replaces logAnalysisError entity) ──────────────────────────────
const ERROR_KEY = "verilens_errors";
const MAX_ERRORS = 50;

export function logErrorLocally({ image_url, error, source_type }) {
  try {
    const raw = localStorage.getItem(ERROR_KEY);
    const errors = raw ? JSON.parse(raw) : [];
    errors.unshift({ image_url: image_url || "unknown", error_message: error, source_type: source_type || "unknown", timestamp: new Date().toISOString() });
    if (errors.length > MAX_ERRORS) errors.length = MAX_ERRORS;
    localStorage.setItem(ERROR_KEY, JSON.stringify(errors));
  } catch (e) {
    console.warn("Failed to save error log:", e);
  }
}

// ── Token usage log (replaces logTokenUsage entity) ──────────────────────────
const TOKEN_KEY = "verilens_token_usage";
const MAX_TOKEN_LOGS = 100;

export function logTokenUsageLocally({ operation, tokens_used, image_url, verdict, user_email }) {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift({ operation, tokens_used, image_url, verdict, user_email: user_email || "local", timestamp: new Date().toISOString() });
    if (logs.length > MAX_TOKEN_LOGS) logs.length = MAX_TOKEN_LOGS;
    localStorage.setItem(TOKEN_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn("Failed to save token usage log:", e);
  }
}