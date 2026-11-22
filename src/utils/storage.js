const SETTINGS_KEY = 'astro_advisor_settings_v1';
const HISTORY_KEY = 'astro_advisor_history_v1';
const PROFILES_KEY = 'astro_advisor_profiles_v1';
const MAX_HISTORY_ITEMS = 100;
const MAX_PROFILES = 12;

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

function persistHistory(next) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ถ้าพื้นที่เต็ม ลดจำนวนรายการที่เก็บ
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 20)));
    } catch {
      // Ignore
    }
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
  persistHistory(next);
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

export function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProfile(profile) {
  const current = loadProfiles();
  const cleanName = (profile.name || '').trim() || 'โปรไฟล์ของฉัน';
  const entry = {
    id: profile.id || `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: cleanName,
    day: Number(profile.day),
    month: Number(profile.month),
    yearAD: Number(profile.yearAD),
    birthTime: (profile.birthTime || '').trim(),
    birthProvince: (profile.birthProvince || '').trim(),
    thaiSignName: profile.thaiSignName || '',
    westernSignName: profile.westernSignName || '',
    updatedAt: new Date().toISOString(),
  };

  const filtered = current.filter(
    (p) => p.id !== entry.id && p.name.toLowerCase() !== cleanName.toLowerCase()
  );
  const next = [entry, ...filtered].slice(0, MAX_PROFILES);

  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
  } catch {
    // Ignore
  }
  return next;
}

export function deleteProfile(id) {
  const current = loadProfiles();
  const next = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
  } catch {
    // Ignore
  }
  return next;
}

// ---------- สำรอง / นำเข้าประวัติ ----------
// ไฟล์สำรองเก็บเฉพาะประวัติการวิเคราะห์ ไม่รวม API Key เพื่อไม่ให้ความลับหลุดไปกับไฟล์

export const BACKUP_FORMAT = 'astro-numerology-advisor-history';
export const BACKUP_VERSION = 1;
export const MAX_BACKUP_CHARS = 5 * 1024 * 1024;

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

export function buildBackup(history, now = new Date()) {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    history,
  };
}

/** ตรวจและทำความสะอาดรายการเดียว คืน null ถ้าใช้ไม่ได้ */
export function sanitizeHistoryItem(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const title = str(raw.title, 300).trim();
  if (!title) return null;
  const created = new Date(raw.createdAt);
  const item = {
    id: str(raw.id, 100) || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Number.isNaN(created.getTime()) ? new Date().toISOString() : created.toISOString(),
    category: str(raw.category, 30) || 'zodiac',
    isAI: raw.isAI === true,
    title,
  };
  const subtitle = str(raw.subtitle, 300);
  const analysis = str(raw.analysis, 30000);
  const lineSummary = str(raw.lineSummary, 5000);
  if (subtitle) item.subtitle = subtitle;
  if (analysis) item.analysis = analysis;
  if (lineSummary) item.lineSummary = lineSummary;
  return item;
}

/** แปลงข้อความไฟล์เป็นรายการประวัติ throw Error ภาษาไทยถ้าไฟล์ไม่ถูกต้อง */
export function parseBackup(text) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('ไฟล์ว่างเปล่า');
  if (text.length > MAX_BACKUP_CHARS) throw new Error('ไฟล์ใหญ่เกินไป (จำกัด 5 MB)');
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('ไฟล์ไม่ใช่ JSON ที่ถูกต้อง');
  }
  const list = Array.isArray(data) ? data : data && Array.isArray(data.history) ? data.history : null;
  if (!list) throw new Error('ไม่พบข้อมูลประวัติในไฟล์นี้');
  if (!Array.isArray(data) && data.format && data.format !== BACKUP_FORMAT) {
    throw new Error('ไฟล์นี้ไม่ใช่ไฟล์สำรองของแอปนี้');
  }
  const items = [];
  let skipped = 0;
  for (const raw of list) {
    const item = sanitizeHistoryItem(raw);
    if (item) items.push(item);
    else skipped += 1;
  }
  return { items, skipped };
}

/** รวมรายการ: ไม่ซ้ำตาม id เรียงใหม่ไปเก่า จำกัดจำนวนสูงสุด */
export function mergeHistory(current, incoming) {
  const seen = new Set(current.map((i) => i.id));
  const fresh = [];
  let duplicates = 0;
  for (const item of incoming) {
    if (seen.has(item.id)) {
      duplicates += 1;
    } else {
      seen.add(item.id);
      fresh.push(item);
    }
  }
  const merged = [...current, ...fresh]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, MAX_HISTORY_ITEMS);
  return { merged, added: fresh.length, duplicates };
}

export function importHistory(text) {
  const { items, skipped } = parseBackup(text);
  const { merged, added, duplicates } = mergeHistory(loadHistory(), items);
  if (added > 0) persistHistory(merged);
  return { history: merged, added, duplicates, skipped };
}
