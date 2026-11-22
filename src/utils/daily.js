import { SIGN_IDS, siderealMoonSun, siderealPlanets, thaiLocalToDate, formatDegree } from './ephemeris';
import { THAI_DAYS, THAI_MONTHS, ZODIAC_DATA } from './zodiac';
import { getDignity } from './dignity';

export const PLANET_LABELS = {
  mercury: 'พุธ',
  venus: 'ศุกร์',
  mars: 'อังคาร',
  jupiter: 'พฤหัสบดี',
  saturn: 'เสาร์',
};

export const AREAS = [
  { id: 'work', label: 'การงาน', houses: [6, 10, 11] },
  { id: 'money', label: 'การเงิน', houses: [2, 5, 11] },
  { id: 'love', label: 'ความรัก/ความสัมพันธ์', houses: [1, 5, 7] },
  { id: 'health', label: 'สุขภาพ/พลังใจ', houses: [1, 6, 8, 12] },
];

// ตำราดาวจร: จันทร์ส่งผลดีเมื่ออยู่เรือนที่ 1,3,6,7,10,11 นับจากราศีกำเนิด
export const MOON_FAVORABLE = [1, 3, 6, 7, 10, 11];
export const JUPITER_FAVORABLE = [1, 2, 5, 7, 9, 11];
export const SATURN_FAVORABLE = [3, 6, 11];

export const HOUSE_THEMES = {
  1: { theme: 'ตัวตนและสุขภาพ', text: 'จังหวะกลับมาโฟกัสที่ตัวเอง อารมณ์ไวขึ้นเล็กน้อย เหมาะกับการดูแลร่างกายและตั้งเป้าหมายของวันให้ชัด', tip: 'เริ่มวันด้วยการจดสิ่งสำคัญ 3 ข้อที่อยากทำให้เสร็จ' },
  2: { theme: 'การเงินและคำพูด', text: 'ความสนใจไปที่เรื่องเงินและการใช้จ่าย ควรระวังการซื้อตามอารมณ์และคำพูดที่หลุดเร็วเกินไป', tip: 'ทบทวนรายจ่ายก่อนตัดสินใจซื้อของชิ้นใหญ่ และพักหายใจก่อนตอบข้อความที่ตึงเครียด' },
  3: { theme: 'การสื่อสารและความพยายาม', text: 'พลังด้านการสื่อสารและการลงมือทำเด่น เหมาะกับการติดต่อประสานงาน เรียนรู้ และเดินทางระยะสั้น', tip: 'เลือกงานที่ค้างไว้ 1 อย่างแล้วทำให้จบวันนี้' },
  4: { theme: 'บ้านและความสบายใจ', text: 'ใจโหยหาความสงบและความอบอุ่น อาจรู้สึกเหนื่อยง่ายกว่าปกติ ควรจัดสรรเวลาอยู่กับครอบครัวหรือพื้นที่ส่วนตัว', tip: 'จัดมุมพักผ่อนเล็กๆ และเลี่ยงการนัดหมายแน่นเกินไป' },
  5: { theme: 'ความคิดสร้างสรรค์และความรัก', text: 'ไอเดียและความรู้สึกพลุ่งพล่าน เหมาะกับงานสร้างสรรค์ แต่ควรบริหารความเสี่ยงเรื่องการลงทุนด้วยอารมณ์', tip: 'ใช้พลังสร้างสรรค์กับงานที่ชอบ และตั้งงบจำกัดสำหรับเรื่องเสี่ยง' },
  6: { theme: 'งานประจำและการแก้ปัญหา', text: 'จัดการงานและปัญหาค้างคาได้ดี มีสมาธิกับรายละเอียด เหมาะกับการเคลียร์งานและวางระบบ', tip: 'ไล่เช็กลิสต์งานที่ค้างและปิดงานเล็กๆ ให้ได้มากที่สุด' },
  7: { theme: 'คู่ความสัมพันธ์และการเจรจา', text: 'เด่นด้านความร่วมมือ การพบปะ และการเจรจา คนรอบตัวมีบทบาทกับวันนี้มาก', tip: 'รับฟังอีกฝ่ายให้ครบก่อนสรุป และสื่อสารความต้องการของตัวเองอย่างสุภาพ' },
  8: { theme: 'การเปลี่ยนแปลงและความลึกของใจ', text: 'ความรู้สึกลึกและไวต่อแรงกดดัน อาจมีเรื่องที่ต้องปล่อยวางหรือจัดการภาระที่ซ่อนอยู่', tip: 'หลีกเลี่ยงการตัดสินใจใหญ่ตอนอารมณ์ขึ้นลง และให้เวลากับการพักผ่อน' },
  9: { theme: 'การเรียนรู้และมุมมองกว้าง', text: 'ใจเปิดรับความรู้ใหม่และมุมมองที่กว้างขึ้น เหมาะกับการวางแผนระยะยาว การเรียน และการปรึกษาผู้ใหญ่', tip: 'ใช้เวลาอ่านหรือคุยกับคนที่มีประสบการณ์เรื่องที่กำลังสงสัย' },
  10: { theme: 'หน้าที่การงานและชื่อเสียง', text: 'งานและหน้าที่เป็นจุดเด่นของวัน มีโอกาสแสดงฝีมือ เหมาะกับการนำเสนอและตัดสินใจเรื่องงาน', tip: 'เตรียมข้อมูลให้พร้อมแล้วนำเสนอผลงานอย่างมั่นใจ' },
  11: { theme: 'เพื่อนฝูงและผลตอบแทน', text: 'เครือข่ายคนรู้จักเอื้อประโยชน์ มีโอกาสได้รับข่าวดีหรือความช่วยเหลือ เหมาะกับการติดต่อสานสัมพันธ์', tip: 'ทักทายคนที่ไม่ได้คุยนานหรือขอคำแนะนำจากเพื่อนร่วมงาน' },
  12: { theme: 'การพักผ่อนและปล่อยวาง', text: 'พลังงานลดลงเล็กน้อย เหมาะกับการพักใจ ทบทวนตัวเอง และลดภาระที่ไม่จำเป็น', tip: 'เว้นเวลาเงียบๆ ให้ตัวเอง และเลี่ยงการใช้จ่ายหรือรับปากเกินกำลัง' },
};

export const AREA_TEXT = {
  work: {
    low: 'งานอาจเดินช้าหรือมีเรื่องแทรก เหมาะกับการทำงานเป็นขั้นตอนและเผื่อเวลา',
    mid: 'งานเดินไปตามปกติ รักษาจังหวะและโฟกัสเรื่องสำคัญ',
    high: 'จังหวะดีสำหรับการลงมือ นำเสนอ หรือสรุปงานที่ค้างอยู่',
  },
  money: {
    low: 'ควรคุมรายจ่ายและเลี่ยงการตัดสินใจทางการเงินตามอารมณ์',
    mid: 'การเงินทรงตัว วางแผนรายรับรายจ่ายให้ชัดเจน',
    high: 'เป็นช่วงที่มองเห็นโอกาสทางการเงินได้ชัดขึ้น แต่ยังควรมีเพดานงบเสมอ',
  },
  love: {
    low: 'ความรู้สึกอาจไวต่อคำพูด พูดช้าลงและฟังให้มากขึ้นช่วยได้มาก',
    mid: 'ความสัมพันธ์เป็นไปตามปกติ ใส่ใจกันด้วยเรื่องเล็กๆ',
    high: 'บรรยากาศความสัมพันธ์อบอุ่น เหมาะกับการพูดคุยและใช้เวลาร่วมกัน',
  },
  health: {
    low: 'พลังกายและใจอาจตกง่าย พักให้พอและดื่มน้ำเพียงพอ',
    mid: 'พลังงานทั่วไปปกติ รักษาตารางพักผ่อนให้สม่ำเสมอ',
    high: 'พลังกายและใจดี เหมาะกับการออกกำลังกายเบาๆ หรือเริ่มนิสัยดีๆ',
  },
};

export const DAY_MS = 86400000;

export function houseFrom(natalSignIndex, signIndex) {
  return ((signIndex - natalSignIndex + 12) % 12) + 1;
}

export function scoreArea(area, { moonHouse, jupiterHouse, saturnHouse }) {
  const moonEffect = MOON_FAVORABLE.includes(moonHouse) ? 1 : -1;
  const emphasis = area.houses.includes(moonHouse) ? 1 : 0.5;
  let score = 3 + moonEffect * emphasis;
  if (JUPITER_FAVORABLE.includes(jupiterHouse)) score += 0.5;
  if ((area.id === 'work' || area.id === 'health') && !SATURN_FAVORABLE.includes(saturnHouse)) {
    score -= 0.5;
  }
  return Math.max(1, Math.min(5, Math.round(score)));
}

export function tier(score) {
  if (score <= 2) return 'low';
  if (score >= 4) return 'high';
  return 'mid';
}

/**
 * ดวงรายวันแบบดาวจร: ดูตำแหน่งดาวจริงของวันนั้น เทียบกับราศีกำเนิด (นับเป็นเรือนที่ 1)
 * ใช้ราศีไทยนิรายนะ (Lahiri) เป็นฐาน ผลเป็นแนวทางสะท้อนตัวเองและวางแผนวัน ไม่ใช่การฟันธง
 */
export function getDailyForecast({ signId, year, month, day }) {
  const natalIndex = SIGN_IDS.indexOf(signId);
  if (natalIndex === -1) throw new Error(`Unknown sign: ${signId}`);

  const noon = thaiLocalToDate(year, month, day, 12, 0);
  const { sun, moon } = siderealMoonSun(noon);
  const planets = siderealPlanets(noon);

  const moonStart = siderealMoonSun(thaiLocalToDate(year, month, day, 0, 0)).moon;
  const moonEnd = siderealMoonSun(new Date(thaiLocalToDate(year, month, day, 0, 0).getTime() + DAY_MS - 60000)).moon;
  const moonChangesSign = moonStart.signIndex !== moonEnd.signIndex;

  const moonHouse = houseFrom(natalIndex, moon.signIndex);
  const planetRows = Object.entries(planets).map(([key, p]) => ({
    key,
    label: PLANET_LABELS[key],
    sign: ZODIAC_DATA[p.signId],
    degreeInSign: p.degreeInSign,
    house: houseFrom(natalIndex, p.signIndex),
    retrograde: p.retrograde,
    dignity: getDignity(key, p.signId, p.degreeInSign),
  }));
  const jupiterHouse = planetRows.find((r) => r.key === 'jupiter').house;
  const saturnHouse = planetRows.find((r) => r.key === 'saturn').house;

  const areas = AREAS.map((area) => {
    const score = scoreArea(area, { moonHouse, jupiterHouse, saturnHouse });
    return { id: area.id, label: area.label, score, text: AREA_TEXT[area.id][tier(score)] };
  });

  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const dayInfo = THAI_DAYS[dow];
  const mercuryRetrograde = planets.mercury.retrograde;
  const houseInfo = HOUSE_THEMES[moonHouse];

  const advice = [houseInfo.tip];
  const best = [...areas].sort((a, b) => b.score - a.score)[0];
  const weakest = [...areas].sort((a, b) => a.score - b.score)[0];
  if (best.score >= 4) advice.push(`ใช้ช่วงที่พลังด้าน${best.label}ดี ลงมือเรื่องสำคัญในด้านนี้ก่อน`);
  if (weakest.score <= 2) advice.push(`ด้าน${weakest.label}ควรเผื่อเวลาและไม่เร่งตัดสินใจ`);
  if (mercuryRetrograde) advice.push('พุธเดินถอยหลัง: ตรวจทานเอกสาร ข้อความ และนัดหมายซ้ำอีกครั้งก่อนยืนยัน');
  if (moonChangesSign) advice.push('จันทร์ย้ายราศีในวันนี้ อารมณ์อาจเปลี่ยนช่วงบ่ายถึงเย็น เผื่อพื้นที่พักใจไว้');

  const forecast = {
    signId,
    sign: ZODIAC_DATA[signId],
    date: { year, month, day },
    dateLabel: `${day} ${THAI_MONTHS[month - 1]} พ.ศ. ${year + 543}`,
    dayOfWeek: dayInfo,
    sun: { sign: ZODIAC_DATA[sun.signId], degreeInSign: sun.degreeInSign, dignity: getDignity('sun', sun.signId, sun.degreeInSign) },
    moon: { sign: ZODIAC_DATA[moon.signId], degreeInSign: moon.degreeInSign, house: moonHouse, changesSign: moonChangesSign, dignity: getDignity('moon', moon.signId, moon.degreeInSign) },
    planets: planetRows,
    mercuryRetrograde,
    headline: `จันทร์จรเรือนที่ ${moonHouse}: ${houseInfo.theme}`,
    summary: houseInfo.text,
    areas,
    advice,
    luckyColor: dayInfo.color,
  };
  forecast.dignityNotes = [
    { label: 'อาทิตย์', body: forecast.sun },
    { label: 'จันทร์', body: forecast.moon },
    ...planetRows.map((p) => ({ label: p.label, body: p })),
  ]
    .filter((x) => x.body.dignity)
    .map((x) => `${x.label}อยู่${x.body.sign.thName} (${x.body.dignity.label})`);
  forecast.lineSummary = generateDailyLineSummary(forecast);
  return forecast;
}

export function generateDailyLineSummary(f) {
  const bar = (n) => `${n}/5`;
  return [
    `ดวงรายวัน ${f.dateLabel} (${f.dayOfWeek.name})`,
    `ราศีกำเนิด: ${f.sign.thName}`,
    `${f.headline}`,
    f.summary,
    ``,
    ...f.areas.map((a) => `• ${a.label} ${bar(a.score)}: ${a.text}`),
    f.mercuryRetrograde ? `• พุธเดินถอยหลัง: ตรวจทานเอกสารและนัดหมายซ้ำก่อนยืนยัน` : null,
    f.dignityNotes.length ? `• สถานะดาว: ${f.dignityNotes.join(', ')}` : null,
    ``,
    `แนวทางวันนี้:`,
    ...f.advice.map((t, i) => `${i + 1}) ${t}`),
    `สีประจำวัน: ${f.dayOfWeek.color}`,
    ``,
    `(คำนวณจากตำแหน่งดาวจริง เป็นแนวทางสะท้อนตัวเองและวางแผน ไม่ใช่คำฟันธง)`,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

/** วันที่ปัจจุบันตามเวลาไทย (UTC+7) */
export function thaiToday(now = new Date()) {
  const t = new Date(now.getTime() + 7 * 3600000);
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

export function shiftDate({ year, month, day }, deltaDays) {
  const d = new Date(Date.UTC(year, month - 1, day) + deltaDays * DAY_MS);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export { formatDegree };
