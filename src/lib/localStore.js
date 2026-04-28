/**
 * Local-storage backed store for ImageAnalysis records.
 * All data stays on-device — nothing is sent to or stored on the server.
 */

const STORAGE_KEY = "aiorreal_analyses";

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/** Resize a base64 data URL to a small thumbnail to save localStorage space. */
async function makeThumbnail(dataUrl, maxWidth = 240) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

/** Create a new analysis record and persist it. Returns the saved record (with original image_url for in-memory use). */
export async function createAnalysis(data) {
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const created_date = new Date().toISOString();

  // In-memory record keeps the original image URL (including base64) for display
  const record = { ...data, id, created_date };

  // For base64 images, store a small thumbnail instead of stripping entirely
  let storedImageUrl = data.image_url;
  if (data.image_url?.startsWith("data:")) {
    const thumb = await makeThumbnail(data.image_url);
    storedImageUrl = thumb ?? "[local-image]";
  }

  const storedRecord = {
    ...data,
    image_url: storedImageUrl,
    id,
    created_date,
    session_id: data.session_id ?? null,
  };

  const all = loadAll();
  all.unshift(storedRecord); // newest first
  try {
    saveAll(all);
  } catch {
    // If storage is still full, evict oldest records until it fits
    while (all.length > 1) {
      all.pop();
      try { saveAll(all); break; } catch { /* keep evicting */ }
    }
  }
  return record; // return the full in-memory record with original image_url
}

/** Return all analysis records, newest first. */
export function listAnalyses() {
  return loadAll();
}

/** Delete a single record by id. */
export function deleteAnalysis(id) {
  const all = loadAll().filter((r) => r.id !== id);
  saveAll(all);
}

/** Delete ALL records. */
export function clearAllAnalyses() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Subscribe to storage changes from other tabs.
 * Returns an unsubscribe function.
 */
export function subscribeToAnalyses(callback) {
  const handler = (e) => {
    if (e.key === STORAGE_KEY) callback(listAnalyses());
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
