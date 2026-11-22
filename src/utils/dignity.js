// สถานะอุจจ์/นิจของดาว (ราศีอุจจ์และองศาอุจจ์สูงสุดตามตำราโหราศาสตร์ไทย/อินเดีย/สากล)
// นิจ = ราศีตรงข้ามกับอุจจ์ที่องศาเดียวกัน
const EXALTATION = {
  sun: ['aries', 10],
  moon: ['taurus', 3],
  mars: ['capricorn', 28],
  mercury: ['virgo', 15],
  jupiter: ['cancer', 5],
  venus: ['pisces', 27],
  saturn: ['libra', 20],
};

const SIGN_ORDER = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

/** ช่วงองศาที่ถือว่า "มหาอุจจ์/มหานิจ" คือใกล้องศาสูงสุดไม่เกินค่านี้ */
export const GREAT_ORB = 1;

export const DIGNITY_TEXT = {
  exalt: 'ดาวมีกำลังเด่น แสดงคุณสมบัติด้านบวกของตัวเองได้เต็มที่',
  debil: 'ดาวมีกำลังอ่อนลง ควรเสริมด้วยการวางแผนและวินัย เป็นจุดที่ควรดูแลมากกว่าเป็นเรื่องน่ากังวล',
};

export function oppositeSign(signId) {
  const i = SIGN_ORDER.indexOf(signId);
  return SIGN_ORDER[(i + 6) % 12];
}

/**
 * @param bodyKey sun|moon|mars|mercury|jupiter|venus|saturn
 * @returns null หรือ { type: 'exalt'|'debil', great, label, text }
 */
export function getDignity(bodyKey, signId, degreeInSign) {
  const entry = EXALTATION[bodyKey];
  if (!entry) return null;
  const [exaltSign, exactDeg] = entry;
  let type = null;
  if (signId === exaltSign) type = 'exalt';
  else if (signId === oppositeSign(exaltSign)) type = 'debil';
  if (!type) return null;
  const great = Math.abs(degreeInSign - exactDeg) <= GREAT_ORB;
  const label = type === 'exalt' ? (great ? 'มหาอุจจ์' : 'อุจจ์') : great ? 'มหานิจ' : 'นิจ';
  return { type, great, label, text: DIGNITY_TEXT[type] };
}

export function dignitySuffix(d) {
  return d ? ` [${d.label}]` : '';
}
