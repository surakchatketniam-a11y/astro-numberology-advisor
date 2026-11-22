import { describe, expect, it } from 'vitest';
import { daysInMonth, getMonthlyForecast, scoreMonthArea, shiftMonth } from '../monthly';
import { AREAS } from '../daily';
import { moonPhasesInRange, thaiLocalToDate } from '../ephemeris';

describe('daysInMonth / shiftMonth', () => {
  it('handles leap years and boundaries', () => {
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2026, 12)).toBe(31);
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth({ year: 2026, month: 5 }, 14)).toEqual({ year: 2027, month: 7 });
  });
});

describe('scoreMonthArea', () => {
  it('rewards a Sun in a favorable house on the theme and stays bounded after rounding', () => {
    const work = AREAS.find((a) => a.id === 'work');
    const good = scoreMonthArea(work, { sun: 10, jupiter: 5, saturn: 6, venus: 1, mars: 3 });
    const bad = scoreMonthArea(work, { sun: 8, jupiter: 3, saturn: 1, venus: 6, mars: 1 });
    expect(good).toBeGreaterThan(4);
    expect(bad).toBeLessThan(2.5);
  });
});

describe('moonPhasesInRange', () => {
  it('finds about one new and one full moon per month', () => {
    const phases = moonPhasesInRange(thaiLocalToDate(2026, 11, 1, 0, 0), 30);
    const newCount = phases.filter((p) => p.type === 'new').length;
    const fullCount = phases.filter((p) => p.type === 'full').length;
    expect(newCount).toBeGreaterThanOrEqual(1);
    expect(newCount).toBeLessThanOrEqual(2);
    expect(fullCount).toBeGreaterThanOrEqual(1);
    expect(fullCount).toBeLessThanOrEqual(2);
  });
  it('matches the known full moon of 24 Nov 2026 within a day', () => {
    // จันทร์เพ็ญ พ.ย. 2026 ประมาณวันที่ 24 (UT)
    const full = moonPhasesInRange(thaiLocalToDate(2026, 11, 1, 0, 0), 30).find((p) => p.type === 'full');
    const day = full.date.getUTCDate();
    expect(Math.abs(day - 24)).toBeLessThanOrEqual(1);
  });
});

describe('getMonthlyForecast', () => {
  const f = getMonthlyForecast({ signId: 'aries', year: 2026, month: 11 });

  it('returns a complete forecast', () => {
    expect(f.daysInMonth).toBe(30);
    expect(f.areas).toHaveLength(4);
    f.areas.forEach((a) => {
      expect(a.score).toBeGreaterThanOrEqual(1);
      expect(a.score).toBeLessThanOrEqual(5);
    });
    expect(f.weeks).toHaveLength(4);
    expect(f.weeks[3].to).toBe(30);
    expect(f.bestDays).toHaveLength(3);
    expect(f.calmDays).toHaveLength(3);
    expect(f.advice.length).toBeGreaterThanOrEqual(2);
    expect(f.monthLabel).toContain('2569');
  });

  it('events are within the month and sorted', () => {
    const days = f.events.map((e) => e.day);
    days.forEach((d) => {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(30);
    });
    expect([...days].sort((a, b) => a - b)).toEqual(days);
    expect(f.events.some((e) => e.type === 'newmoon')).toBe(true);
    expect(f.events.some((e) => e.type === 'fullmoon')).toBe(true);
  });

  it('detects exactly one Sun sidereal ingress in each month of 2026', () => {
    for (let m = 1; m <= 12; m++) {
      const mf = getMonthlyForecast({ signId: 'leo', year: 2026, month: m });
      const sunIngress = mf.events.filter((e) => e.type === 'ingress' && e.title.startsWith('อาทิตย์'));
      expect(sunIngress).toHaveLength(1);
    }
  });

  it('detects the April 2024 Mercury retrograde start and end', () => {
    const mf = getMonthlyForecast({ signId: 'aries', year: 2024, month: 4 });
    const start = mf.events.find((e) => e.type === 'retro');
    const end = mf.events.find((e) => e.type === 'direct');
    expect(start.day).toBeGreaterThanOrEqual(1);
    expect(start.day).toBeLessThanOrEqual(3);
    expect(end.day).toBeGreaterThanOrEqual(24);
    expect(end.day).toBeLessThanOrEqual(27);
    expect(mf.mercuryRetroInMonth).toBe(true);
  });

  it('handles February in a leap year', () => {
    const mf = getMonthlyForecast({ signId: 'pisces', year: 2028, month: 2 });
    expect(mf.daysInMonth).toBe(29);
    expect(mf.weeks[3]).toMatchObject({ from: 22, to: 29 });
  });

  it('LINE summary is plain text', () => {
    expect(f.lineSummary).toContain('ดวงรายเดือน');
    expect(f.lineSummary).not.toMatch(/[*#_`]|\p{Extended_Pictographic}/u);
  });

  it('rejects unknown signs', () => {
    expect(() => getMonthlyForecast({ signId: 'x', year: 2026, month: 1 })).toThrow();
  });
});
