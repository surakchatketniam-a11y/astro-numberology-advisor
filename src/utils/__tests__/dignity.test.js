import { describe, expect, it } from 'vitest';
import { getDignity, oppositeSign } from '../dignity';

describe('getDignity', () => {
  it('detects exaltation and debilitation signs for each classical planet', () => {
    const cases = [
      ['sun', 'aries', 'exalt', 'libra', 'debil'],
      ['moon', 'taurus', 'exalt', 'scorpio', 'debil'],
      ['mars', 'capricorn', 'exalt', 'cancer', 'debil'],
      ['mercury', 'virgo', 'exalt', 'pisces', 'debil'],
      ['jupiter', 'cancer', 'exalt', 'capricorn', 'debil'],
      ['venus', 'pisces', 'exalt', 'virgo', 'debil'],
      ['saturn', 'libra', 'exalt', 'aries', 'debil'],
    ];
    for (const [body, ex, , de] of cases) {
      expect(getDignity(body, ex, 15).type).toBe('exalt');
      expect(getDignity(body, de, 15).type).toBe('debil');
    }
  });

  it('returns null for neutral signs and unknown bodies', () => {
    expect(getDignity('sun', 'gemini', 5)).toBeNull();
    expect(getDignity('rahu', 'taurus', 5)).toBeNull();
  });

  it('marks มหาอุจจ์/มหานิจ only within 1° of the exact degree', () => {
    expect(getDignity('moon', 'taurus', 3.4)).toMatchObject({ type: 'exalt', great: true, label: 'มหาอุจจ์' });
    expect(getDignity('moon', 'taurus', 10)).toMatchObject({ great: false, label: 'อุจจ์' });
    expect(getDignity('sun', 'libra', 10.5)).toMatchObject({ type: 'debil', great: true, label: 'มหานิจ' });
    expect(getDignity('sun', 'libra', 11.8)).toMatchObject({ great: false, label: 'นิจ' });
    expect(getDignity('saturn', 'aries', 21)).toMatchObject({ great: true });
    expect(getDignity('saturn', 'aries', 22.5)).toMatchObject({ great: false });
  });

  it('exaltation and debilitation signs are always opposite', () => {
    expect(oppositeSign('aries')).toBe('libra');
    expect(oppositeSign('pisces')).toBe('virgo');
  });
});
