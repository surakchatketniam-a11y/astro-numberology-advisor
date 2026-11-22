import { describe, expect, it } from 'vitest';
import {
  AREAS,
  getDailyForecast,
  houseFrom,
  scoreArea,
  shiftDate,
  thaiToday,
} from '../daily';
import { siderealPlanets } from '../ephemeris';

describe('houseFrom', () => {
  it('counts the natal sign as house 1 and wraps around', () => {
    expect(houseFrom(0, 0)).toBe(1);
    expect(houseFrom(0, 11)).toBe(12);
    expect(houseFrom(5, 2)).toBe(10);
  });
});

describe('scoreArea', () => {
  const work = AREAS.find((a) => a.id === 'work');
  it('stays within 1..5', () => {
    for (let moonHouse = 1; moonHouse <= 12; moonHouse++) {
      for (let j = 1; j <= 12; j++) {
        for (let s = 1; s <= 12; s++) {
          for (const area of AREAS) {
            const sc = scoreArea(area, { moonHouse, jupiterHouse: j, saturnHouse: s });
            expect(sc).toBeGreaterThanOrEqual(1);
            expect(sc).toBeLessThanOrEqual(5);
          }
        }
      }
    }
  });
  it('rewards a favorable Moon on the area theme and penalises an unfavorable one', () => {
    const good = scoreArea(work, { moonHouse: 10, jupiterHouse: 5, saturnHouse: 6 });
    const bad = scoreArea(work, { moonHouse: 8, jupiterHouse: 3, saturnHouse: 1 });
    expect(good).toBe(5);
    expect(bad).toBeLessThan(3);
  });
});

describe('siderealPlanets', () => {
  it('detects Mercury retrograde / direct on known dates', () => {
    // พุธถอยหลัง 1–25 เม.ย. 2024 (UT) และเดินหน้าในกลางเดือนพฤษภาคม
    expect(siderealPlanets(new Date(Date.UTC(2024, 3, 10, 5))).mercury.retrograde).toBe(true);
    expect(siderealPlanets(new Date(Date.UTC(2024, 4, 20, 5))).mercury.retrograde).toBe(false);
  });
  it('puts Jupiter in sidereal Aries/Taurus range in mid-2024 (tropical Taurus/Gemini − ayanamsa)', () => {
    const j = siderealPlanets(new Date(Date.UTC(2024, 5, 1, 5))).jupiter;
    expect(['aries', 'taurus']).toContain(j.signId);
  });
});

describe('getDailyForecast', () => {
  const f = getDailyForecast({ signId: 'aries', year: 2026, month: 11, day: 22 });

  it('returns a complete forecast', () => {
    expect(f.moon.house).toBeGreaterThanOrEqual(1);
    expect(f.moon.house).toBeLessThanOrEqual(12);
    expect(f.areas).toHaveLength(4);
    expect(f.planets).toHaveLength(5);
    expect(f.advice.length).toBeGreaterThanOrEqual(1);
    expect(f.dayOfWeek.name).toBe('วันอาทิตย์'); // 22 Nov 2026 is Sunday
  });

  it('house numbers are consistent with moon/natal signs', () => {
    expect(f.moon.house).toBe(houseFrom(0, ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'].indexOf(f.moon.sign.id)));
  });

  it('produces plain-text LINE summary without markdown/emoji', () => {
    expect(f.lineSummary).toContain('ดวงรายวัน');
    expect(f.lineSummary).not.toMatch(/[*#_`]|\p{Extended_Pictographic}/u);
  });

  it('different signs give different house numbers for the same moon', () => {
    const g = getDailyForecast({ signId: 'leo', year: 2026, month: 11, day: 22 });
    expect(g.moon.sign.id).toBe(f.moon.sign.id);
    expect(g.moon.house).not.toBe(f.moon.house);
  });

  it('rejects unknown signs', () => {
    expect(() => getDailyForecast({ signId: 'x', year: 2026, month: 1, day: 1 })).toThrow();
  });
});

describe('date helpers', () => {
  it('shifts across month/year boundaries', () => {
    expect(shiftDate({ year: 2026, month: 12, day: 31 }, 1)).toEqual({ year: 2027, month: 1, day: 1 });
    expect(shiftDate({ year: 2026, month: 3, day: 1 }, -1)).toEqual({ year: 2026, month: 2, day: 28 });
  });
  it('uses Thai time for today', () => {
    expect(thaiToday(new Date(Date.UTC(2026, 10, 21, 18, 0)))).toEqual({ year: 2026, month: 11, day: 22 });
  });
});

describe('dignity in transits', () => {
  it('attaches dignity to planets, Sun and Moon and summarises it', () => {
    // 22 ต.ค. 2026: อาทิตย์อยู่ราศีตุลย์ (นิรายนะ) = นิจ
    const f = getDailyForecast({ signId: 'aries', year: 2026, month: 10, day: 22 });
    expect(f.sun.sign.id).toBe('libra');
    expect(f.sun.dignity).toMatchObject({ type: 'debil' });
    f.planets.forEach((p) => expect(p).toHaveProperty('dignity'));
    expect(f.dignityNotes.join(' ')).toContain('อาทิตย์อยู่ราศีตุลย์');
    expect(f.lineSummary).toContain('สถานะดาว');
  });

  it('has no dignity note for a Sun in a neutral sign', () => {
    const f = getDailyForecast({ signId: 'aries', year: 2026, month: 11, day: 22 }); // อาทิตย์พิจิก
    expect(f.sun.dignity).toBeNull();
  });
});
