import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BACKUP_FORMAT,
  addHistoryEntry,
  buildBackup,
  importHistory,
  loadHistory,
  mergeHistory,
  parseBackup,
  sanitizeHistoryItem,
} from '../storage';

function stubLocalStorage() {
  const store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  });
  return store;
}

const item = (id, title, createdAt = '2026-01-01T00:00:00.000Z', extra = {}) => ({
  id,
  title,
  createdAt,
  category: 'zodiac',
  isAI: false,
  ...extra,
});

beforeEach(() => stubLocalStorage());
afterEach(() => vi.unstubAllGlobals());

describe('sanitizeHistoryItem', () => {
  it('keeps valid fields and drops unknown ones', () => {
    const r = sanitizeHistoryItem({ ...item('a', 'หัวข้อ'), subtitle: 's', evil: '<script>', apiKey: 'SECRET' });
    expect(r).toMatchObject({ id: 'a', title: 'หัวข้อ', subtitle: 's', category: 'zodiac', isAI: false });
    expect(r).not.toHaveProperty('evil');
    expect(r).not.toHaveProperty('apiKey');
  });
  it('rejects items without a title or non-objects', () => {
    expect(sanitizeHistoryItem({ id: 'x' })).toBeNull();
    expect(sanitizeHistoryItem(null)).toBeNull();
    expect(sanitizeHistoryItem('text')).toBeNull();
    expect(sanitizeHistoryItem([1])).toBeNull();
  });
  it('repairs a bad date, generates a missing id, truncates long text and coerces isAI', () => {
    const r = sanitizeHistoryItem({ title: 't', createdAt: 'not a date', isAI: 'yes', analysis: 'x'.repeat(40000) });
    expect(Number.isNaN(new Date(r.createdAt).getTime())).toBe(false);
    expect(r.id).toBeTruthy();
    expect(r.isAI).toBe(false);
    expect(r.analysis).toHaveLength(30000);
  });
});

describe('parseBackup', () => {
  it('accepts the app format and a bare array', () => {
    const backup = JSON.stringify(buildBackup([item('a', 'A'), item('b', 'B')]));
    expect(parseBackup(backup).items).toHaveLength(2);
    expect(parseBackup(JSON.stringify([item('a', 'A')])).items).toHaveLength(1);
  });
  it('counts skipped invalid entries', () => {
    const r = parseBackup(JSON.stringify({ history: [item('a', 'A'), { nope: 1 }, 5] }));
    expect(r.items).toHaveLength(1);
    expect(r.skipped).toBe(2);
  });
  it('throws friendly errors for bad files', () => {
    expect(() => parseBackup('')).toThrow('ว่างเปล่า');
    expect(() => parseBackup('{not json')).toThrow('JSON');
    expect(() => parseBackup('{"foo":1}')).toThrow('ไม่พบข้อมูลประวัติ');
    expect(() => parseBackup(JSON.stringify({ format: 'other-app', history: [] }))).toThrow('ไม่ใช่ไฟล์สำรอง');
    expect(() => parseBackup('x'.repeat(6 * 1024 * 1024))).toThrow('ใหญ่เกินไป');
  });
  it('never exports secrets: buildBackup only has history metadata', () => {
    const b = buildBackup([item('a', 'A')]);
    expect(b.format).toBe(BACKUP_FORMAT);
    expect(Object.keys(b).sort()).toEqual(['exportedAt', 'format', 'history', 'version']);
  });
});

describe('mergeHistory', () => {
  it('dedupes by id, sorts newest first and caps the length', () => {
    const current = [item('a', 'A', '2026-03-01T00:00:00.000Z')];
    const incoming = [
      item('a', 'A dup', '2026-03-01T00:00:00.000Z'),
      item('b', 'B', '2026-05-01T00:00:00.000Z'),
      item('c', 'C', '2026-01-01T00:00:00.000Z'),
    ];
    const r = mergeHistory(current, incoming);
    expect(r.added).toBe(2);
    expect(r.duplicates).toBe(1);
    expect(r.merged.map((i) => i.id)).toEqual(['b', 'a', 'c']);

    const many = Array.from({ length: 150 }, (_, i) => item(`i${i}`, `T${i}`, new Date(2026, 0, 1 + (i % 28), i).toISOString()));
    expect(mergeHistory([], many).merged).toHaveLength(100);
  });
});

describe('importHistory (with storage)', () => {
  it('merges into existing history and persists; re-importing adds nothing', () => {
    addHistoryEntry({ category: 'zodiac', isAI: false, title: 'เดิม' });
    const file = JSON.stringify(buildBackup([item('imp-1', 'นำเข้า 1'), item('imp-2', 'นำเข้า 2')]));
    const first = importHistory(file);
    expect(first).toMatchObject({ added: 2, duplicates: 0, skipped: 0 });
    expect(loadHistory()).toHaveLength(3);

    const second = importHistory(file);
    expect(second).toMatchObject({ added: 0, duplicates: 2 });
    expect(loadHistory()).toHaveLength(3);
  });

  it('does not touch storage when the file is invalid', () => {
    addHistoryEntry({ category: 'zodiac', isAI: false, title: 'เดิม' });
    expect(() => importHistory('{bad')).toThrow();
    expect(loadHistory()).toHaveLength(1);
  });
});
