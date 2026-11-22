import * as Astronomy from 'astronomy-engine';

export const SIGN_IDS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

export const THAI_UTC_OFFSET_HOURS = 7;

const norm360 = (deg) => ((deg % 360) + 360) % 360;
const rad = (deg) => (deg * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

/** อายนางศะแบบ Lahiri (องศา) — แม่นราว 0.01° ในช่วงปี 1900-2100 */
export function lahiriAyanamsa(date) {
  const year = 2000 + (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * 86400000);
  return 23.85306 + 0.0139697 * (year - 2000);
}

export function meanObliquity(date) {
  const T = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (36525 * 86400000);
  return 23.439291 - 0.0130042 * T;
}

/** ลองจิจูดสุริยวิถีแบบ tropical (ตามวสันตวิษุวัตของวันนั้น) */
export function tropicalLongitudes(date) {
  return {
    sun: norm360(Astronomy.SunPosition(date).elon),
    moon: norm360(Astronomy.EclipticGeoMoon(date).lon),
  };
}

/**
 * ลัคนา (Ascendant) แบบ tropical
 * @param ramc ไรต์แอสเซนชันของเมริเดียน (องศา) = เวลาดาราคติท้องถิ่น × 15
 */
export function ascendantLongitude(ramc, latitude, obliquity) {
  const th = rad(ramc);
  const eps = rad(obliquity);
  const y = Math.cos(th);
  const x = -(Math.sin(th) * Math.cos(eps) + Math.tan(rad(latitude)) * Math.sin(eps));
  return norm360(deg(Math.atan2(y, x)));
}

export function tropicalAscendant(date, latitude, longitude) {
  const gast = Astronomy.SiderealTime(date); // ชั่วโมง
  const ramc = norm360(gast * 15 + longitude);
  return ascendantLongitude(ramc, latitude, meanObliquity(date));
}

/** แปลงเวลาไทย (UTC+7) เป็น Date; ไม่ระบุเวลา = เที่ยงวัน */
export function thaiLocalToDate(yearAD, month, day, hour = 12, minute = 0) {
  return new Date(Date.UTC(yearAD, month - 1, day, hour - THAI_UTC_OFFSET_HOURS, minute));
}

export function parseBirthTime(text) {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(text || '').trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return { hour: h, minute: min };
}

function describe(lon) {
  const l = norm360(lon);
  const index = Math.floor(l / 30);
  return { longitude: l, signIndex: index, signId: SIGN_IDS[index], degreeInSign: l - index * 30 };
}

function positionsAt(date, location) {
  const trop = tropicalLongitudes(date);
  const ay = lahiriAyanamsa(date);
  const out = {
    ayanamsa: ay,
    tropical: { sun: describe(trop.sun), moon: describe(trop.moon) },
    sidereal: { sun: describe(trop.sun - ay), moon: describe(trop.moon - ay) },
  };
  if (location) {
    const asc = tropicalAscendant(date, location.lat, location.lon);
    out.tropical.asc = describe(asc);
    out.sidereal.asc = describe(asc - ay);
  }
  return out;
}

/**
 * คำนวณตำแหน่งดาวจริงของวันเกิด
 * - ไม่ระบุเวลา: ใช้เที่ยงวันไทย และตรวจว่า "ภายในวันนั้น" ราศีเปลี่ยนหรือไม่ (uncertain)
 * - ระบุเวลา + พิกัดจังหวัด: คำนวณลัคนาด้วย
 */
export function computeBirthChart({ yearAD, month, day, birthTime = '', location = null }) {
  const time = parseBirthTime(birthTime);
  const date = thaiLocalToDate(yearAD, month, day, time ? time.hour : 12, time ? time.minute : 0);
  const positions = positionsAt(date, time ? location : null);

  const uncertain = { sun: false, moon: false };
  if (!time) {
    const start = positionsAt(thaiLocalToDate(yearAD, month, day, 0, 0), null);
    const end = positionsAt(thaiLocalToDate(yearAD, month, day, 23, 59), null);
    for (const body of ['sun', 'moon']) {
      uncertain[body] =
        start.sidereal[body].signIndex !== end.sidereal[body].signIndex ||
        start.tropical[body].signIndex !== end.tropical[body].signIndex;
    }
  }

  return {
    date,
    hasTime: Boolean(time),
    hasAscendant: Boolean(time && location),
    ayanamsa: positions.ayanamsa,
    tropical: positions.tropical,
    sidereal: positions.sidereal,
    uncertain,
  };
}

export function formatDegree(deg, digits = 1) {
  return `${deg.toFixed(digits)}°`;
}

const LAHIRI_J2000 = 23.85306;

export const PLANET_BODIES = {
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
};

function planetEclipticJ2000(body, date) {
  return norm360(Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon);
}

/**
 * ตำแหน่งดาวเคราะห์แบบนิรายนะ (Lahiri) และสถานะพักตร (retrograde)
 * ลองจิจูดสุริยวิถี J2000 ลบอายนางศะ ณ J2000 เท่ากับ tropical-of-date ลบอายนางศะ ณ วันนั้นพอดี
 * เพราะอายนางศะที่ใช้เพิ่มตามอัตราการเคลื่อนของวิษุวัต
 */
export function siderealPlanets(date) {
  const dayMs = 86400000;
  const out = {};
  for (const [key, body] of Object.entries(PLANET_BODIES)) {
    const lon = norm360(planetEclipticJ2000(body, date) - LAHIRI_J2000);
    const before = planetEclipticJ2000(body, new Date(date.getTime() - dayMs));
    const after = planetEclipticJ2000(body, new Date(date.getTime() + dayMs));
    const delta = ((after - before + 540) % 360) - 180; // -180..180
    out[key] = { ...describe(lon), retrograde: delta < 0 };
  }
  return out;
}

export function siderealMoonSun(date) {
  const trop = tropicalLongitudes(date);
  const ay = lahiriAyanamsa(date);
  return { sun: describe(trop.sun - ay), moon: describe(trop.moon - ay) };
}
