import { describe, expect, it } from 'vitest';
import {
  ascendantLongitude,
  computeBirthChart,
  lahiriAyanamsa,
  parseBirthTime,
  thaiLocalToDate,
  tropicalLongitudes,
} from '../ephemeris';
import { findProvince, PROVINCES } from '../provinces';

describe('tropicalLongitudes', () => {
  it('matches known J2000 positions', () => {
    const { sun, moon } = tropicalLongitudes(new Date(Date.UTC(2000, 0, 1, 12)));
    expect(sun).toBeCloseTo(280.37, 1);
    expect(moon).toBeCloseTo(223.32, 1);
  });

  it('puts the Sun at ~0° at the March 2024 equinox', () => {
    const { sun } = tropicalLongitudes(new Date(Date.UTC(2024, 2, 20, 3, 6)));
    const diff = Math.min(sun, 360 - sun);
    expect(diff).toBeLessThan(0.05);
  });
});

describe('lahiriAyanamsa', () => {
  it('is ~23.85° at J2000 and grows ~50"/year', () => {
    expect(lahiriAyanamsa(new Date(Date.UTC(2000, 0, 1, 12)))).toBeCloseTo(23.853, 2);
    expect(lahiriAyanamsa(new Date(Date.UTC(2026, 0, 1, 12)))).toBeCloseTo(24.216, 1);
  });
});

describe('ascendantLongitude', () => {
  it('is 90° at the equator when 0° Aries culminates', () => {
    expect(ascendantLongitude(0, 0, 23.44)).toBeCloseTo(90, 5);
  });
  it('is 0° when 270° (0° Capricorn) culminates at the equator', () => {
    expect(ascendantLongitude(270, 0, 23.44)).toBeCloseTo(0, 5);
  });
});

describe('time helpers', () => {
  it('parses HH:MM and rejects bad input', () => {
    expect(parseBirthTime('08:30')).toEqual({ hour: 8, minute: 30 });
    expect(parseBirthTime('')).toBeNull();
    expect(parseBirthTime('25:00')).toBeNull();
  });
  it('converts Thai local time (UTC+7) to UTC', () => {
    expect(thaiLocalToDate(2000, 1, 1, 7, 0).toISOString()).toBe('2000-01-01T00:00:00.000Z');
    expect(thaiLocalToDate(2000, 1, 1).toISOString()).toBe('2000-01-01T05:00:00.000Z');
  });
});

describe('computeBirthChart', () => {
  it('moves the sidereal Sun into Aries around 13 April 2024 (late evening Thai time)', () => {
    expect(computeBirthChart({ yearAD: 2024, month: 4, day: 12 }).sidereal.sun.signId).toBe('pisces');
    expect(computeBirthChart({ yearAD: 2024, month: 4, day: 15 }).sidereal.sun.signId).toBe('aries');
  });

  it('flags the Sun as uncertain on an ingress day without birth time', () => {
    const chart = computeBirthChart({ yearAD: 2024, month: 4, day: 13 });
    expect(chart.uncertain.sun).toBe(true);
    expect(computeBirthChart({ yearAD: 2024, month: 4, day: 20 }).uncertain.sun).toBe(false);
  });

  it('resolves the ingress day when time is given', () => {
    const early = computeBirthChart({ yearAD: 2024, month: 4, day: 13, birthTime: '08:00' });
    const late = computeBirthChart({ yearAD: 2024, month: 4, day: 13, birthTime: '23:55' });
    expect(early.sidereal.sun.signId).toBe('pisces');
    expect(late.sidereal.sun.signId).toBe('aries');
    expect(early.uncertain.sun).toBe(false);
  });

  it('computes the ascendant only with time and location', () => {
    const bkk = findProvince('กรุงเทพ');
    expect(computeBirthChart({ yearAD: 1995, month: 4, day: 15, location: bkk }).hasAscendant).toBe(false);
    const chart = computeBirthChart({ yearAD: 1995, month: 4, day: 15, birthTime: '08:30', location: bkk });
    expect(chart.hasAscendant).toBe(true);
    // ~2.5 ชม. หลังอาทิตย์ขึ้น ลัคนาอยู่ห่างอาทิตย์ราว 35-50°
    const gap = (chart.tropical.asc.longitude - chart.tropical.sun.longitude + 360) % 360;
    expect(gap).toBeGreaterThan(30);
    expect(gap).toBeLessThan(55);
  });
});

describe('findProvince', () => {
  it('has 77 provinces with plausible Thai coordinates', () => {
    const entries = Object.entries(PROVINCES);
    expect(entries).toHaveLength(77);
    for (const [, [lat, lon]] of entries) {
      expect(lat).toBeGreaterThan(5.5);
      expect(lat).toBeLessThan(20.5);
      expect(lon).toBeGreaterThan(97.3);
      expect(lon).toBeLessThan(105.7);
    }
  });
  it('resolves aliases and prefixes', () => {
    expect(findProvince('กทม.').name).toBe('กรุงเทพมหานคร');
    expect(findProvince('จ.เชียงใหม่').name).toBe('เชียงใหม่');
    expect(findProvince('จังหวัดอยุธยา').name).toBe('พระนครศรีอยุธยา');
    expect(findProvince('โคราช').name).toBe('นครราชสีมา');
  });
  it('returns null for unknown or empty', () => {
    expect(findProvince('เมืองลับแล')).toBeNull();
    expect(findProvince('')).toBeNull();
  });
});
