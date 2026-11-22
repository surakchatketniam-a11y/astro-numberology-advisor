const SETTINGS_KEY = 'astro_advisor_settings_v1';
const HISTORY_KEY = 'astro_advisor_history_v1';
const MAX_HISTORY_ITEMS = 30;

export const DEFAULT_SETTINGS = {
  apiKey: '',
  model: 'gemini-2.5-flash',
};

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash (แนะนำ — เร็วและแม่นยำ)' },
  { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro (วิเคราะห์เชิงลึกขั้นสูง)' },
  { id: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite (ประหยัดและรวดเร็วมาก)' },
  { id: 'gemini-2.0-flash', label: 'gemini-2.0-flash (รุ่นเสถียร)' },
];

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model: typeof parsed.model === 'string' && parsed.model.trim() ? parsed.model.trim() : DEFAULT_SETTINGS.model,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        apiKey: (settings.apiKey || '').trim(),
        model: (settings.model || DEFAULT_SETTINGS.model).trim(),
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry) {
  const current = loadHistory();
  const newItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  const next = [newItem, ...current].slice(0, MAX_HISTORY_ITEMS);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // If quota exceeded, keep fewer items
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 10)));
    } catch {
      // Ignore
    }
  }
  return next;
}

export function deleteHistoryEntry(id) {
  const current = loadHistory();
  const next = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Ignore
  }
  return next;
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore
  }
  return [];
}
