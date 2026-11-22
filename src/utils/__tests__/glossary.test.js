import { describe, expect, it } from 'vitest';
import {
  GLOSSARY,
  GLOSSARY_BY_ID,
  GLOSSARY_CATEGORIES,
  dignityTermId,
  searchGlossary,
} from '../../data/glossary';
import { getDignity } from '../dignity';

describe('glossary data integrity', () => {
  it('has unique ids and complete entries', () => {
    const ids = GLOSSARY.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of GLOSSARY) {
      expect(g.term).toBeTruthy();
      expect(g.en).toBeTruthy();
      expect(g.short.length).toBeGreaterThan(10);
      expect(g.detail.length).toBeGreaterThan(20);
      expect(Array.isArray(g.related)).toBe(true);
    }
  });

  it('uses only declared categories and every category has entries', () => {
    const cats = new Set(GLOSSARY_CATEGORIES.map((c) => c.id));
    for (const g of GLOSSARY) expect(cats.has(g.category)).toBe(true);
    for (const c of cats) expect(GLOSSARY.some((g) => g.category === c)).toBe(true);
  });

  it('related links point to existing terms and never to themselves', () => {
    for (const g of GLOSSARY) {
      for (const r of g.related) {
        expect(GLOSSARY_BY_ID[r], `${g.id} -> ${r}`).toBeDefined();
        expect(r).not.toBe(g.id);
      }
    }
  });

  it('covers every term the app shows to users', () => {
    for (const id of [
      'sidereal', 'tropical', 'ayanamsa', 'ascendant', 'tanu', 'moon-sign', 'exalt', 'great-exalt',
      'debil', 'great-debil', 'own', 'rahu', 'ketu', 'retrograde', 'mercury-retro', 'moon-transit',
      'life-path', 'number-pair', 'compat-score', 'house', 'transit', 'approx',
    ]) {
      expect(GLOSSARY_BY_ID[id], id).toBeDefined();
    }
  });

  it('builds dynamic sections from app data (rulers, houses, aspects)', () => {
    expect(GLOSSARY_BY_ID.ruler.detail).toContain('ราศีกุมภ์: ดาวราหู (๘)');
    expect(GLOSSARY_BY_ID.house.detail).toContain('เรือนที่ 10');
    expect(GLOSSARY_BY_ID['sign-distance'].detail).toContain('ราศีตรงข้าม');
    expect(GLOSSARY_BY_ID['sign-distance'].detail).not.toContain('undefined');
  });
});

describe('glossary facts match the app logic', () => {
  it('life path example in the text is correct', () => {
    // 15 เม.ย. 1995 -> 34 -> 7
    expect(GLOSSARY_BY_ID['life-path'].detail).toContain('= 34 → 3+4 = 7');
  });
  it('dignity links map every dignity kind to an existing term', () => {
    const cases = [
      getDignity('sun', 'aries', 10.2), // มหาอุจจ์
      getDignity('sun', 'aries', 20), // อุจจ์
      getDignity('sun', 'libra', 10.5), // มหานิจ
      getDignity('sun', 'libra', 20), // นิจ
      getDignity('sun', 'leo', 5), // เกษตร
    ];
    const ids = cases.map(dignityTermId);
    expect(ids).toEqual(['great-exalt', 'exalt', 'great-debil', 'debil', 'own']);
    ids.forEach((id) => expect(GLOSSARY_BY_ID[id]).toBeDefined());
    expect(dignityTermId(null)).toBeNull();
  });
});

describe('searchGlossary', () => {
  it('returns everything with an empty query', () => {
    expect(searchGlossary('')).toHaveLength(GLOSSARY.length);
  });
  it('matches Thai and English terms case-insensitively', () => {
    expect(searchGlossary('อุจจ์').map((g) => g.id)).toContain('exalt');
    expect(searchGlossary('ascendant').map((g) => g.id)).toContain('ascendant');
    expect(searchGlossary('SIDEREAL').map((g) => g.id)).toContain('sidereal');
  });
  it('filters by category and combines with query', () => {
    const dignity = searchGlossary('', 'dignity');
    expect(dignity.length).toBeGreaterThanOrEqual(5);
    expect(dignity.every((g) => g.category === 'dignity')).toBe(true);
    expect(searchGlossary('ราหู', 'dignity').map((g) => g.id)).toEqual(['own']);
  });
  it('returns an empty list when nothing matches', () => {
    expect(searchGlossary('ไม่มีคำนี้แน่นอน123')).toEqual([]);
  });
});
