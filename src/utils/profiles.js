import { calculateZodiacComparison } from './zodiac';

const PROFILES_KEY = 'astro_advisor_profiles_v1';
export const MAX_PROFILES = 20;

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function daysIn(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** ตรวจและทำความสะอาดโปรไฟล์ คืน null ถ้าไม่ถูกต้อง */
export function sanitizeProfile(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const name = str(raw.name, 30);
  const day = Number(raw.day);
  const month = Number(raw.month);
  const yearAD = Number(raw.yearAD);
  if (!name) return null;
  if (![day, month, yearAD].every(Number.isInteger)) return null;
  if (yearAD < 1900 || yearAD > 2100 || month < 1 || month > 12) return null;
  if (day < 1 || day > daysIn(yearAD, month)) return null;
  const time = str(raw.birthTime, 5);
  return {
    id: str(raw.id, 60) || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    day,
    month,
    yearAD,
    birthTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : '',
    birthProvince: str(raw.birthProvince, 40),
  };
}

export function loadProfiles() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeProfile).filter(Boolean).slice(0, MAX_PROFILES);
  } catch {
    return [];
  }
}

function persist(list) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
  } catch {
    // ignore quota errors
  }
}

/**
 * บันทึกโปรไฟล์ ถ้ามีชื่อเดียวกันอยู่แล้วจะอัปเดตทับ (ไม่สร้างซ้ำ)
 * คืน { profiles, saved } หรือ throw Error ภาษาไทยถ้าข้อมูลไม่ถูกต้อง/เต็ม
 */
export function upsertProfile(data) {
  const clean = sanitizeProfile(data);
  if (!clean) throw new Error('ข้อมูลโปรไฟล์ไม่ถูกต้อง กรุณาตั้งชื่อและตรวจสอบวันเกิด');
  const current = loadProfiles();
  const sameName = current.find((p) => p.name.toLowerCase() === clean.name.toLowerCase());
  const id = sameName ? sameName.id : clean.id;
  const saved = { ...clean, id };
  let next;
  if (sameName) {
    next = current.map((p) => (p.id === id ? saved : p));
  } else {
    if (current.length >= MAX_PROFILES) {
      throw new Error(`เก็บโปรไฟล์ได้สูงสุด ${MAX_PROFILES} รายการ กรุณาลบรายการเดิมก่อน`);
    }
    next = [...current, saved];
  }
  persist(next);
  return { profiles: next, saved };
}

export function deleteProfile(id) {
  const next = loadProfiles().filter((p) => p.id !== id);
  persist(next);
  return next;
}

/** ราศีไทย (นิรายนะ) ของโปรไฟล์ ใช้เป็นราศีกำเนิดในแท็บรายวัน/รายเดือน */
export function profileSignId(profile) {
  return calculateZodiacComparison({
    day: profile.day,
    month: profile.month,
    yearAD: profile.yearAD,
    birthTime: profile.birthTime,
  }).thaiSign.id;
}
