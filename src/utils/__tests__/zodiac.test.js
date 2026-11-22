import { describe, expect, it } from 'vitest';
import {
  THAI_MONTHS,
  ZODIAC_DATA,
  calculateLifePathNumber,
  calculateZodiacComparison,
  generateZodiacLineSummary,
  getThaiSiderealSign,
  getWesternTropicalSign,
} from '../zodiac';

describe('getThaiSiderealSign', () => {
  it.each([
    [4, 13, 'aries'],
    [5, 13, 'aries'],
    [5, 14, 'taurus'],
    [6, 14, 'gemini'],
    [7, 15, 'cancer'],
    [8, 17, 'leo'],
    [9, 17, 'virgo'],
    [10, 17, 'libra'],
    [11, 16, 'scorpio'],
    [12, 15, 'scorpio'],
    [12, 16, 'sagittarius'],
    [12, 31, 'sagittarius'],
    [1, 1, 'sagittarius'],
    [1, 13, 'sagittarius'],
    [1, 14, 'capricorn'],
    [2, 12, 'capricorn'],
    [2, 13, 'aquarius'],
    [3, 13, 'aquarius'],
    [3, 14, 'pisces'],
    [4, 12, 'pisces'],
  ])('%i/%i -> %s', (m, d, id) => {
    expect(getThaiSiderealSign(m, d).id).toBe(id);
  });
});

describe('getWesternTropicalSign', () => {
  it.each([
    [3, 21, 'aries'],
    [4, 19, 'aries'],
    [4, 20, 'taurus'],
    [5, 21, 'gemini'],
    [6, 21, 'cancer'],
    [7, 23, 'leo'],
    [8, 23, 'virgo'],
    [9, 23, 'libra'],
    [10, 23, 'scorpio'],
    [11, 22, 'sagittarius'],
    [12, 22, 'capricorn'],
    [1, 19, 'capricorn'],
    [1, 20, 'aquarius'],
    [2, 18, 'aquarius'],
    [2, 19, 'pisces'],
    [3, 20, 'pisces'],
  ])('%i/%i -> %s', (m, d, id) => {
    expect(getWesternTropicalSign(m, d).id).toBe(id);
  });

  it('covers every day of a leap year with a valid sign (both systems)', () => {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    daysInMonth.forEach((n, i) => {
      for (let d = 1; d <= n; d++) {
        expect(ZODIAC_DATA[getThaiSiderealSign(i + 1, d).id]).toBeDefined();
        expect(ZODIAC_DATA[getWesternTropicalSign(i + 1, d).id]).toBeDefined();
      }
    });
  });
});

describe('calculateLifePathNumber', () => {
  it('reduces to a single digit', () => {
    // 1995-04-15 -> 1+9+9+5+0+4+1+5 = 34 -> 7
    expect(calculateLifePathNumber(1995, 4, 15)).toBe(7);
  });

  it('reduces ordinary sums fully', () => {
    expect(calculateLifePathNumber(1985, 11, 2)).toBe(9); // 27
    expect(calculateLifePathNumber(1992, 9, 1)).toBe(4); // 31
    expect(calculateLifePathNumber(2000, 1, 9)).toBe(3); // 12
  });

  it('keeps master number 11', () => {
    expect(calculateLifePathNumber(1980, 9, 2)).toBe(11); // digit sum 29
  });
});

describe('calculateZodiacComparison', () => {
  it('returns Thai and Western signs, weekday, and BE year', () => {
    const r = calculateZodiacComparison({ day: 15, month: 4, yearAD: 1995 });
    expect(r.thaiSign.id).toBe('aries');
    expect(r.westernSign.id).toBe('aries');
    expect(r.isSameSign).toBe(true);
    expect(r.yearBE).toBe(2538);
    expect(r.dayOfWeek.name).toBe('วันเสาร์'); // 15 Apr 1995 was a Saturday
    expect(r.formattedDateTH).toBe(`15 ${THAI_MONTHS[3]} พ.ศ. 2538 (1995)`);
  });

  it('flags differing signs', () => {
    const r = calculateZodiacComparison({ day: 5, month: 5, yearAD: 2000 });
    expect(r.thaiSign.id).toBe('aries');
    expect(r.westernSign.id).toBe('taurus');
    expect(r.isSameSign).toBe(false);
  });

  it('accepts string inputs', () => {
    const r = calculateZodiacComparison({ day: '1', month: '1', yearAD: '2000' });
    expect(r.day).toBe(1);
    expect(r.thaiSign.id).toBe('sagittarius');
    expect(r.westernSign.id).toBe('capricorn');
  });
});

describe('generateZodiacLineSummary', () => {
  it('includes the key facts and omits empty optional fields', () => {
    const r = calculateZodiacComparison({ day: 15, month: 4, yearAD: 1995 });
    const text = generateZodiacLineSummary(r);
    expect(text).toContain(r.formattedDateTH);
    expect(text).toContain(r.thaiSign.thName);
    expect(text).not.toContain('เวลาเกิด');
    expect(text).not.toContain('จังหวัดเกิด');

    const full = generateZodiacLineSummary(
      calculateZodiacComparison({ day: 15, month: 4, yearAD: 1995, birthTime: '08:30', birthProvince: 'เชียงใหม่' })
    );
    expect(full).toContain('เวลาเกิด: 08:30');
    expect(full).toContain('จังหวัดเกิด: เชียงใหม่');
  });
});

describe('calculateZodiacComparison — real positions', () => {
  it('uses the true Sun position for the Thai sign (Apr 2024 boundary)', () => {
    expect(calculateZodiacComparison({ day: 12, month: 4, yearAD: 2024 }).thaiSign.id).toBe('pisces');
    expect(calculateZodiacComparison({ day: 15, month: 4, yearAD: 2024 }).thaiSign.id).toBe('aries');
  });

  it('provides Sun and Moon always, ascendant only with time + known province', () => {
    const base = calculateZodiacComparison({ day: 15, month: 4, yearAD: 1995 });
    expect(base.thai.sun.sign.id).toBe('aries');
    expect(base.thai.moon).toBeTruthy();
    expect(base.thai.asc).toBeNull();
    expect(base.notes.join(' ')).toContain('ไม่ได้ระบุเวลาเกิด');

    const full = calculateZodiacComparison({
      day: 15, month: 4, yearAD: 1995, birthTime: '08:30', birthProvince: 'เชียงใหม่',
    });
    expect(full.thai.asc.sign).toBeTruthy();
    expect(full.western.asc.sign).toBeTruthy();
    expect(full.province.name).toBe('เชียงใหม่');

    const unknown = calculateZodiacComparison({
      day: 15, month: 4, yearAD: 1995, birthTime: '08:30', birthProvince: 'ที่ไหนสักแห่ง',
    });
    expect(unknown.thai.asc).toBeNull();
    expect(unknown.notes.join(' ')).toContain('ไม่พบจังหวัด');
  });

  it('includes Sun/Moon/Ascendant lines in the LINE summary', () => {
    const text = generateZodiacLineSummary(
      calculateZodiacComparison({ day: 15, month: 4, yearAD: 1995, birthTime: '08:30', birthProvince: 'กรุงเทพ' })
    );
    expect(text).toContain('อาทิตย์:');
    expect(text).toContain('จันทร์:');
    expect(text).toContain('ลัคนา:');
  });
});
