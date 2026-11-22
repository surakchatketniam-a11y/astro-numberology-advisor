import { describe, expect, it } from 'vitest';
import {
  ASPECTS,
  analyzeCompatibility,
  aspectBetween,
  elementCompatibility,
  lifePathCompatibility,
  overallLabel,
  signDistance,
} from '../compatibility';

const A = { day: 15, month: 4, yearAD: 1995 };
const B = { day: 20, month: 8, yearAD: 1996 };

describe('signDistance', () => {
  it('folds distances symmetrically into 0..6', () => {
    expect(signDistance('aries', 'aries')).toBe(0);
    expect(signDistance('aries', 'taurus')).toBe(1);
    expect(signDistance('aries', 'pisces')).toBe(1);
    expect(signDistance('aries', 'leo')).toBe(4);
    expect(signDistance('leo', 'aries')).toBe(4);
    expect(signDistance('aries', 'libra')).toBe(6);
    expect(signDistance('aries', 'sagittarius')).toBe(4);
  });
  it('rejects unknown signs', () => {
    expect(() => signDistance('x', 'aries')).toThrow();
  });
  it('has a definition for every distance', () => {
    for (let d = 0; d <= 6; d++) {
      expect(ASPECTS[d].sun).toBeTruthy();
      expect(ASPECTS[d].moon).toBeTruthy();
      expect(ASPECTS[d].tip).toBeTruthy();
    }
  });
  it('is symmetric through aspectBetween', () => {
    expect(aspectBetween('gemini', 'scorpio').score).toBe(aspectBetween('scorpio', 'gemini').score);
  });
});

describe('elementCompatibility', () => {
  it('scores same and complementary elements higher than others', () => {
    expect(elementCompatibility('Fire', 'Fire').score).toBe(80);
    expect(elementCompatibility('Fire', 'Air').score).toBe(88);
    expect(elementCompatibility('Water', 'Earth').score).toBe(88);
    expect(elementCompatibility('Fire', 'Water').score).toBe(55);
  });
});

describe('lifePathCompatibility', () => {
  it('groups numbers and maps master numbers to their base', () => {
    expect(lifePathCompatibility(3, 3).score).toBe(80);
    expect(lifePathCompatibility(1, 5).score).toBe(85);
    expect(lifePathCompatibility(2, 8).score).toBe(85);
    expect(lifePathCompatibility(1, 2).score).toBe(60);
    expect(lifePathCompatibility(11, 2).score).toBe(80);
    expect(lifePathCompatibility(22, 4).score).toBe(80);
  });
});

describe('overallLabel', () => {
  it('has distinct tiers', () => {
    const labels = [90, 75, 62, 40].map(overallLabel);
    expect(new Set(labels).size).toBe(4);
  });
});

describe('analyzeCompatibility', () => {
  it('returns a bounded percentage and complete structure', () => {
    const r = analyzeCompatibility({ ...A, name: 'เอ' }, { ...B, name: 'บี' });
    expect(r.percent).toBeGreaterThanOrEqual(40);
    expect(r.percent).toBeLessThanOrEqual(100);
    expect(r.dimensions).toHaveLength(3);
    expect(r.strengths.length + r.cares.length).toBe(4);
    expect(r.tips.length).toBeGreaterThanOrEqual(2);
    expect(r.a.name).toBe('เอ');
  });

  it('is symmetric in the overall score', () => {
    expect(analyzeCompatibility(A, B).percent).toBe(analyzeCompatibility(B, A).percent);
  });

  it('flags approximate moon when no birth time is given and not when given', () => {
    const noTime = analyzeCompatibility(A, B);
    expect(noTime.notes.join(' ')).toContain('เวลาเกิด');
    const day = analyzeCompatibility(
      { day: 20, month: 11, yearAD: 2026, birthTime: '12:00' },
      { day: 21, month: 11, yearAD: 2026, birthTime: '12:00' }
    );
    expect(day.dimensions[0].approx).toBe(false);
  });

  it('self-comparison is the same sign, element and life path', () => {
    const r = analyzeCompatibility(A, A);
    expect(r.sun.distance).toBe(0);
    expect(r.moon.distance).toBe(0);
    expect(r.life.score).toBe(80);
  });

  it('LINE summary is plain text with both names and the percent', () => {
    const r = analyzeCompatibility({ ...A, name: 'เอ' }, { ...B, name: 'บี' });
    expect(r.lineSummary).toContain('เอ');
    expect(r.lineSummary).toContain('บี');
    expect(r.lineSummary).toContain(`${r.percent}%`);
    expect(r.lineSummary).not.toMatch(/[*#_`]|\p{Extended_Pictographic}/u);
  });
});
