import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_PROFILES,
  deleteProfile,
  loadProfiles,
  profileSignId,
  sanitizeProfile,
  upsertProfile,
} from '../profiles';

beforeEach(() => {
  const store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  });
});
afterEach(() => vi.unstubAllGlobals());

const base = { name: 'แม่', day: 15, month: 4, yearAD: 1995, birthTime: '08:30', birthProvince: 'เชียงใหม่' };

describe('sanitizeProfile', () => {
  it('accepts valid data and trims text', () => {
    expect(sanitizeProfile({ ...base, name: '  แม่  ' })).toMatchObject({ name: 'แม่', day: 15, birthTime: '08:30' });
  });
  it('accepts numeric strings for date parts', () => {
    expect(sanitizeProfile({ ...base, day: '15', month: '4', yearAD: '1995' })).toMatchObject({ day: 15, month: 4, yearAD: 1995 });
  });
  it('rejects impossible dates, missing names and out-of-range years', () => {
    expect(sanitizeProfile({ ...base, day: 31, month: 4 })).toBeNull();
    expect(sanitizeProfile({ ...base, day: 29, month: 2, yearAD: 2023 })).toBeNull();
    expect(sanitizeProfile({ ...base, day: 29, month: 2, yearAD: 2024 })).not.toBeNull();
    expect(sanitizeProfile({ ...base, name: '   ' })).toBeNull();
    expect(sanitizeProfile({ ...base, yearAD: 1800 })).toBeNull();
    expect(sanitizeProfile({ ...base, month: 13 })).toBeNull();
    expect(sanitizeProfile(null)).toBeNull();
    expect(sanitizeProfile({ ...base, day: 1.5 })).toBeNull();
  });
  it('drops malformed time and truncates long text', () => {
    expect(sanitizeProfile({ ...base, birthTime: '25:99' }).birthTime).toBe('');
    expect(sanitizeProfile({ ...base, name: 'ก'.repeat(80) }).name).toHaveLength(30);
  });
});

describe('upsert / load / delete', () => {
  it('saves, reloads and overwrites by name without duplicating', () => {
    const { saved } = upsertProfile(base);
    expect(loadProfiles()).toHaveLength(1);
    const again = upsertProfile({ ...base, name: 'แม่', day: 20 });
    expect(again.saved.id).toBe(saved.id);
    expect(loadProfiles()).toHaveLength(1);
    expect(loadProfiles()[0].day).toBe(20);
  });
  it('treats names case-insensitively', () => {
    upsertProfile({ ...base, name: 'Mom' });
    upsertProfile({ ...base, name: 'mom', day: 3 });
    expect(loadProfiles()).toHaveLength(1);
  });
  it('rejects invalid data with a Thai error and enforces the cap', () => {
    expect(() => upsertProfile({ ...base, day: 40 })).toThrow('ข้อมูลโปรไฟล์ไม่ถูกต้อง');
    for (let i = 0; i < MAX_PROFILES; i++) upsertProfile({ ...base, name: `คน${i}` });
    expect(() => upsertProfile({ ...base, name: 'เกิน' })).toThrow('สูงสุด');
    // อัปเดตของเดิมยังทำได้เมื่อเต็ม
    expect(() => upsertProfile({ ...base, name: 'คน3', day: 5 })).not.toThrow();
  });
  it('deletes by id', () => {
    const { saved } = upsertProfile(base);
    upsertProfile({ ...base, name: 'พ่อ' });
    expect(deleteProfile(saved.id).map((p) => p.name)).toEqual(['พ่อ']);
  });
  it('ignores corrupted storage', () => {
    localStorage.setItem('astro_advisor_profiles_v1', '{oops');
    expect(loadProfiles()).toEqual([]);
    localStorage.setItem('astro_advisor_profiles_v1', JSON.stringify([base, { name: 'x' }, 5]));
    expect(loadProfiles()).toHaveLength(1);
  });
});

describe('profileSignId', () => {
  it('returns the Thai sidereal sign', () => {
    expect(profileSignId({ day: 15, month: 4, yearAD: 1995, birthTime: '' })).toBe('aries');
    expect(profileSignId({ day: 29, month: 10, yearAD: 1977, birthTime: '05:00' })).toBe('libra');
  });
});
