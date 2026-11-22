import { moonPhasesInRange, thaiLocalToDate } from './ephemeris';
import {
  AREAS,
  AREA_TEXT,
  HOUSE_THEMES,
  JUPITER_FAVORABLE,
  SATURN_FAVORABLE,
  getDailyForecast,
  houseFrom,
  shiftDate,
  tier,
} from './daily';
import { SIGN_IDS } from './ephemeris';
import { THAI_MONTHS, ZODIAC_DATA } from './zodiac';

// ตำราดาวจร (แบบย่อ): เรือนที่ดาวให้คุณเมื่อจรผ่าน นับจากราศีกำเนิด
const SUN_FAVORABLE = [3, 6, 10, 11];
const VENUS_FAVORABLE = [1, 2, 3, 4, 5, 8, 9, 11, 12];
const MARS_FAVORABLE = [3, 6, 11];

const PLANET_HINT = {
  sun: 'จุดโฟกัสหลักของเดือน',
  mercury: 'การสื่อสาร เอกสาร และการเดินทาง',
  venus: 'ความสัมพันธ์ การเงิน และความสุนทรีย์',
  mars: 'พลังลงมือทำและอารมณ์ร้อน',
  jupiter: 'โอกาสและการเติบโต',
  saturn: 'ความรับผิดชอบและวินัย',
};

const MONTH_TIPS = {
  1: 'ตั้งเป้าหมายประจำเดือนที่ชัดเจน 1-3 ข้อ และดูแลสุขภาพเป็นพิเศษ',
  2: 'วางงบรายเดือนและทบทวนรายจ่ายประจำ เลือกใช้คำพูดอย่างระมัดระวัง',
  3: 'เร่งงานสื่อสาร ติดต่อประสานงาน และเรียนรู้ทักษะเล็กๆ ที่ใช้ได้จริง',
  4: 'จัดบ้านและสภาพแวดล้อมให้สงบ ใช้เวลากับครอบครัวและพักใจให้พอ',
  5: 'ลงมือกับงานสร้างสรรค์ที่รัก แต่ตั้งเพดานงบสำหรับเรื่องเสี่ยงหรือการลงทุน',
  6: 'เคลียร์งานค้างและวางระบบการทำงาน เหมาะกับการแก้ปัญหาเรื้อรัง',
  7: 'ให้ความสำคัญกับคู่ความสัมพันธ์และการเจรจา รับฟังก่อนสรุป',
  8: 'ทบทวนภาระและสิ่งที่ควรปล่อยวาง เลี่ยงการตัดสินใจใหญ่ตอนอารมณ์ขึ้นลง',
  9: 'วางแผนระยะยาว เรียนรู้เพิ่มเติม และปรึกษาผู้มีประสบการณ์',
  10: 'เดือนเด่นเรื่องงานและชื่อเสียง เตรียมผลงานให้พร้อมแล้วนำเสนอ',
  11: 'ขยายเครือข่ายและขอความช่วยเหลือ มีโอกาสได้ผลตอบแทนจากความสัมพันธ์เดิม',
  12: 'พักผ่อนและทบทวนตัวเอง ลดภาระที่ไม่จำเป็น เลี่ยงการรับปากเกินกำลัง',
};

export function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** คะแนนด้านต่างๆ ของ "วันหนึ่ง" จากดาวช้า (ไม่รวมจันทร์) ใช้เฉลี่ยทั้งเดือน */
export function scoreMonthArea(area, h) {
  const sunEffect = SUN_FAVORABLE.includes(h.sun) ? 1 : -1;
  const emphasis = area.houses.includes(h.sun) ? 1 : 0.5;
  let score = 3 + sunEffect * emphasis;
  if (JUPITER_FAVORABLE.includes(h.jupiter)) score += 0.5;
  if ((area.id === 'work' || area.id === 'health') && !SATURN_FAVORABLE.includes(h.saturn)) score -= 0.5;
  if ((area.id === 'love' || area.id === 'money') && VENUS_FAVORABLE.includes(h.venus)) score += 0.5;
  if ((area.id === 'work' || area.id === 'health') && MARS_FAVORABLE.includes(h.mars)) score += 0.5;
  return score;
}

function thaiDay(date) {
  return new Date(date.getTime() + 7 * 3600000).getUTCDate();
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const clampRound = (x) => Math.max(1, Math.min(5, Math.round(x)));

/**
 * ดวงรายเดือน: เฉลี่ยตำแหน่งดาวจรตลอดเดือนเทียบราศีกำเนิด (ไทยนิรายนะ)
 * พร้อมสัปดาห์ วันเด่น/วันควรเผื่อเวลา และเหตุการณ์ (ดาวย้ายราศี พุธถอยหลัง จันทร์ดับ/เพ็ญ)
 */
export function getMonthlyForecast({ signId, year, month }) {
  const natalIndex = SIGN_IDS.indexOf(signId);
  if (natalIndex === -1) throw new Error(`Unknown sign: ${signId}`);

  const n = daysInMonth(year, month);
  const prev = getDailyForecast({ signId, ...shiftDate({ year, month, day: 1 }, -1) });
  const days = [];
  for (let d = 1; d <= n; d++) days.push(getDailyForecast({ signId, year, month, day: d }));

  const planetOf = (f, key) => f.planets.find((p) => p.key === key);
  const houseOf = (f) => ({
    sun: houseFrom(natalIndex, SIGN_IDS.indexOf(f.sun.sign.id)),
    jupiter: planetOf(f, 'jupiter').house,
    saturn: planetOf(f, 'saturn').house,
    venus: planetOf(f, 'venus').house,
    mars: planetOf(f, 'mars').house,
  });

  const dayHouses = days.map((f) => ({ ...houseOf(f), sunSign: f.sun.sign }));
  const areas = AREAS.map((area) => {
    const score = clampRound(mean(dayHouses.map((h) => scoreMonthArea(area, h))));
    return { id: area.id, label: area.label, score, text: AREA_TEXT[area.id][tier(score)] };
  });

  // ธีมหลักของเดือนจากเรือนของอาทิตย์ (อาจเปลี่ยนกลางเดือน)
  const sunHouses = [];
  for (const h of dayHouses) if (!sunHouses.includes(h.sun)) sunHouses.push(h.sun);
  const mainHouse = dayHouses[Math.floor(n / 2)].sun;
  const headline =
    sunHouses.length > 1
      ? `อาทิตย์จรเรือนที่ ${sunHouses[0]} → ${sunHouses[1]}: ${HOUSE_THEMES[sunHouses[0]].theme} สู่ ${HOUSE_THEMES[sunHouses[1]].theme}`
      : `อาทิตย์จรเรือนที่ ${sunHouses[0]}: ${HOUSE_THEMES[sunHouses[0]].theme}`;
  const summary = HOUSE_THEMES[mainHouse].text;

  // สัปดาห์
  const ranges = [[1, 7], [8, 14], [15, 21], [22, n]];
  const dayScores = days.map((f) => mean(f.areas.map((a) => a.score)));
  const weeks = ranges.map(([from, to], i) => {
    const idx = days.slice(from - 1, to);
    const byArea = AREAS.map((a) => ({
      id: a.id,
      label: a.label,
      avg: mean(idx.map((f) => f.areas.find((x) => x.id === a.id).score)),
    }));
    const best = [...byArea].sort((x, y) => y.avg - x.avg)[0];
    const low = [...byArea].sort((x, y) => x.avg - y.avg)[0];
    const overall = clampRound(mean(byArea.map((x) => x.avg)));
    return { index: i + 1, from, to, score: overall, best: best.label, care: low.label };
  });

  const ranked = dayScores.map((score, i) => ({ day: i + 1, score })).sort((a, b) => b.score - a.score || a.day - b.day);
  const bestDays = ranked.slice(0, 3).map((x) => x.day).sort((a, b) => a - b);
  const calmDays = ranked.slice(-3).map((x) => x.day).sort((a, b) => a - b);

  // เหตุการณ์
  const events = [];
  const series = [prev, ...days];
  for (let i = 1; i < series.length; i++) {
    const before = series[i - 1];
    const now = series[i];
    const day = i;
    if (before.sun.sign.id !== now.sun.sign.id) {
      const h = houseFrom(natalIndex, SIGN_IDS.indexOf(now.sun.sign.id));
      events.push({
        day,
        type: 'ingress',
        title: `อาทิตย์ย้ายเข้า${now.sun.sign.thName}`,
        text: `เข้าสู่เรือนที่ ${h} (${HOUSE_THEMES[h].theme}) — ${PLANET_HINT.sun}เปลี่ยนไปตามธีมนี้${now.sun.dignity ? ` • อาทิตย์เข้าราศี${now.sun.dignity.type === 'exalt' ? 'อุจจ์' : 'นิจ'}` : ''}`,
      });
    }
    for (const p of now.planets) {
      const b = planetOf(before, p.key);
      if (b.sign.id !== p.sign.id) {
        events.push({
          day,
          type: 'ingress',
          title: `${p.label}ย้ายเข้า${p.sign.thName}`,
          text: `เข้าสู่เรือนที่ ${p.house} (${HOUSE_THEMES[p.house].theme}) — เกี่ยวกับ${PLANET_HINT[p.key]}${p.dignity ? ` • ${p.label}เข้าราศี${p.dignity.type === 'exalt' ? 'อุจจ์' : 'นิจ'}` : ''}`,
        });
      }
    }
    const mb = planetOf(before, 'mercury');
    const mn = planetOf(now, 'mercury');
    if (!mb.retrograde && mn.retrograde) {
      events.push({
        day,
        type: 'retro',
        title: 'พุธเริ่มเดินถอยหลัง',
        text: 'ตรวจทานเอกสาร ข้อความ และนัดหมายซ้ำก่อนยืนยัน เลี่ยงการเซ็นสัญญาด่วน',
      });
    } else if (mb.retrograde && !mn.retrograde) {
      events.push({
        day,
        type: 'direct',
        title: 'พุธกลับเดินหน้า',
        text: 'การสื่อสารและเรื่องเอกสารเริ่มลื่นไหลขึ้น เหมาะกับการสรุปเรื่องที่ค้างไว้',
      });
    }
  }
  for (const ph of moonPhasesInRange(thaiLocalToDate(year, month, 1, 0, 0), n)) {
    events.push({
      day: thaiDay(ph.date),
      type: ph.type === 'new' ? 'newmoon' : 'fullmoon',
      title: ph.type === 'new' ? 'จันทร์ดับ (เริ่มรอบใหม่)' : 'จันทร์เพ็ญ (เต็มดวง)',
      text:
        ph.type === 'new'
          ? 'จังหวะตั้งเป้าหมายและเริ่มต้นสิ่งใหม่เล็กๆ'
          : 'จังหวะทบทวนผลลัพธ์ อารมณ์อาจเด่นขึ้น ควรพักใจและเลี่ยงการตัดสินใจรีบร้อน',
    });
  }
  events.sort((a, b) => a.day - b.day);

  const mercuryRetroInMonth = days.some((f) => f.mercuryRetrograde);
  const best = [...areas].sort((a, b) => b.score - a.score)[0];
  const weakest = [...areas].sort((a, b) => a.score - b.score)[0];
  const advice = [MONTH_TIPS[mainHouse]];
  if (best.score >= 4) advice.push(`เดือนนี้พลังด้าน${best.label}ดี วางเรื่องสำคัญด้านนี้ไว้ในช่วงวันเด่น`);
  if (weakest.score <= 2) advice.push(`ด้าน${weakest.label}ควรเผื่อเวลาและไม่เร่งตัดสินใจ`);
  if (mercuryRetroInMonth) advice.push('มีช่วงพุธถอยหลังในเดือนนี้ เก็บหลักฐานและยืนยันนัดหมายซ้ำเสมอ');
  advice.push('ใช้วันจันทร์ดับตั้งเป้าหมาย และวันจันทร์เพ็ญทบทวนความคืบหน้า');

  const forecast = {
    signId,
    sign: ZODIAC_DATA[signId],
    year,
    month,
    monthLabel: `${THAI_MONTHS[month - 1]} พ.ศ. ${year + 543}`,
    daysInMonth: n,
    headline,
    summary,
    areas,
    weeks,
    bestDays,
    calmDays,
    events,
    mercuryRetroInMonth,
    advice,
  };
  forecast.lineSummary = generateMonthlyLineSummary(forecast);
  return forecast;
}

export function shiftMonth({ year, month }, delta) {
  const idx = year * 12 + (month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

export function generateMonthlyLineSummary(f) {
  const range = (w) => `${w.from}-${w.to}`;
  return [
    `ดวงรายเดือน ${f.monthLabel}`,
    `ราศีกำเนิด: ${f.sign.thName}`,
    f.headline,
    f.summary,
    ``,
    ...f.areas.map((a) => `• ${a.label} ${a.score}/5: ${a.text}`),
    ``,
    `สัปดาห์:`,
    ...f.weeks.map((w) => `วันที่ ${range(w)}: ${w.score}/5 (เด่น ${w.best}, ควรดูแล ${w.care})`),
    `วันเด่น: ${f.bestDays.join(', ')}`,
    `วันควรเผื่อเวลา: ${f.calmDays.join(', ')}`,
    ``,
    `แนวทางประจำเดือน:`,
    ...f.advice.map((t, i) => `${i + 1}) ${t}`),
    ``,
    `(คำนวณจากตำแหน่งดาวจริง เป็นแนวทางสะท้อนตัวเองและวางแผน ไม่ใช่คำฟันธง)`,
  ].join('\n');
}

