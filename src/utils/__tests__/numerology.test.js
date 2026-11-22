import { describe, expect, it } from 'vitest';
import {
  THAI_CHAR_VALUES,
  analyzeLicensePlate,
  analyzePhoneNumber,
  extractPairs,
  generateNumerologyLineSummary,
  interpretPair,
  interpretTotalSum,
  reduceToSingleDigit,
} from '../numerology';

describe('reduceToSingleDigit', () => {
  it.each([
    [0, 0],
    [9, 9],
    [10, 1],
    [38, 2],
    [99, 9],
    [-38, 2],
    ['27', 9],
  ])('%s -> %i', (input, out) => {
    expect(reduceToSingleDigit(input)).toBe(out);
  });

  it('treats invalid input as 0', () => {
    expect(reduceToSingleDigit('abc')).toBe(0);
    expect(reduceToSingleDigit(undefined)).toBe(0);
  });
});

describe('extractPairs', () => {
  it('returns overlapping pairs', () => {
    expect(extractPairs('12345')).toEqual(['12', '23', '34', '45']);
  });
  it('returns empty for short input', () => {
    expect(extractPairs('1')).toEqual([]);
    expect(extractPairs('')).toEqual([]);
  });
});

describe('interpretPair', () => {
  it('uses the dictionary entry when present', () => {
    const r = interpretPair('14');
    expect(r.pair).toBe('14');
    expect(r.tone).toBe('high');
    expect(r.label).toBeTruthy();
  });

  it('falls back to a composed meaning for unknown pairs', () => {
    const r = interpretPair('12');
    expect(r.pair).toBe('12');
    expect(r.label).toBe('พลังผสานสองมิติ');
    expect(r.meaning).toContain('ภาวะผู้นำและความเชื่อมั่น');
  });

  it('marks unknown pairs containing zero as balance', () => {
    const r = interpretPair('10');
    expect(r.tone).toBe('balance');
  });

  it('always returns pair, label, tone and meaning for every 2-digit pair', () => {
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        const r = interpretPair(`${a}${b}`);
        expect(r.label).toBeTruthy();
        expect(r.tone).toBeTruthy();
        expect(r.meaning).toBeTruthy();
        expect(r.meaning).not.toContain('undefined');
      }
    }
  });
});

describe('interpretTotalSum', () => {
  it('uses special descriptions and reduced root', () => {
    const r = interpretTotalSum(14);
    expect(r.reduced).toBe(5);
    expect(r.title).toBe('ผลรวม 14 (เลขรากฐาน 5)');
    expect(r.description).toContain('สติปัญญา');
  });

  it('falls back to the root description', () => {
    const r = interpretTotalSum(17); // not special -> root 8
    expect(r.reduced).toBe(8);
    expect(r.description).toContain('วิสัยทัศน์ทางธุรกิจ');
  });

  it('never returns undefined description (including sum 0 and 9-multiples)', () => {
    for (const s of [0, 1, 9, 18, 27, 100]) {
      expect(interpretTotalSum(s).description).toBeTruthy();
    }
  });
});

describe('analyzePhoneNumber', () => {
  it('returns null for too-short input', () => {
    expect(analyzePhoneNumber('123')).toBeNull();
    expect(analyzePhoneNumber('')).toBeNull();
    expect(analyzePhoneNumber(undefined)).toBeNull();
  });

  it('analyzes a 10-digit number', () => {
    const r = analyzePhoneNumber('081-234-5678');
    expect(r.digits).toBe('0812345678');
    expect(r.formatted).toBe('081-234-5678');
    expect(r.prefix).toBe('081');
    expect(r.core7).toBe('2345678');
    expect(r.pairs.map((p) => p.pair)).toEqual(['23', '34', '45', '56', '67', '78']);
    expect(r.totalSumAll).toBe(0 + 8 + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8);
    expect(r.totalSumCore7).toBe(35);
  });

  it('handles 4-6 digit input without prefix', () => {
    const r = analyzePhoneNumber('4569');
    expect(r.prefix).toBe('');
    expect(r.core7).toBe('4569');
    expect(r.pairs).toHaveLength(3);
  });

  it('ignores non-digit characters', () => {
    expect(analyzePhoneNumber('+66 81 234 5678').digits).toBe('66812345678');
  });
});

describe('analyzeLicensePlate', () => {
  it('returns null when there are no digits', () => {
    expect(analyzeLicensePlate('กข')).toBeNull();
    expect(analyzeLicensePlate('')).toBeNull();
    expect(analyzeLicensePlate(null)).toBeNull();
  });

  it('sums Thai letters and digits separately', () => {
    const r = analyzeLicensePlate('1กข 4569');
    // ก=1, ข=2 ; digits 1+4+5+6+9 = 25
    expect(r.letterSum).toBe(3);
    expect(r.digitSum).toBe(25);
    expect(r.totalSumAll).toBe(28);
    expect(r.mainDigits).toBe('4569');
    expect(r.pairs.map((p) => p.pair)).toEqual(['45', '56', '69']);
  });

  it('normalizes whitespace', () => {
    expect(analyzeLicensePlate('  กข   1234 ').formatted).toBe('กข 1234');
  });

  it('skips characters with no numerology value', () => {
    const r = analyzeLicensePlate('A 99');
    expect(r.charBreakdown.every((c) => c.kind === 'digit')).toBe(true);
    expect(r.letterSum).toBe(0);
  });
});

describe('THAI_CHAR_VALUES', () => {
  it('only contains values 1-9', () => {
    for (const v of Object.values(THAI_CHAR_VALUES)) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(9);
    }
  });
});

describe('generateNumerologyLineSummary', () => {
  it('returns empty string for null', () => {
    expect(generateNumerologyLineSummary(null)).toBe('');
  });

  it('formats phone and plate summaries', () => {
    const phone = generateNumerologyLineSummary(analyzePhoneNumber('0812345678'));
    expect(phone).toContain('เบอร์โทร: 081-234-5678');
    const plate = generateNumerologyLineSummary(analyzeLicensePlate('กข 4569'));
    expect(plate).toContain('ทะเบียนรถ: กข 4569');
  });
});
