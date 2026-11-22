// สถานะอุจจ์/นิจ/เกษตรของดาว (ตามตำราโหราศาสตร์ไทย/อินเดีย/สากล)
// นิจ = ราศีตรงข้ามกับอุจจ์ที่องศาเดียวกัน, เกษตร = ราศีที่ดาวเป็นเจ้าเรือน
const EXALTATION = {
  sun: ['aries', 10],
  moon: ['taurus', 3],
  mars: ['capricorn', 28],
  mercury: ['virgo', 15],
  jupiter: ['cancer', 5],
  venus: ['pisces', 27],
  saturn: ['libra', 20],
};

// เกษตร: ราศีที่ดาวเป็นเจ้าเรือน (ราหู/เกตุไม่รวม เพราะตำราไม่ตรงกัน)
const OWN_SIGNS = {
  sun: ['leo'],
  moon: ['cancer'],
  mars: ['aries', 'scorpio'],
  mercury: ['gemini', 'virgo'],
  jupiter: ['sagittarius', 'pisces'],
  venus: ['taurus', 'libra'],
  saturn: ['capricorn', 'aquarius'],
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
  own: 'ดาวอยู่ในราศีของตัวเอง มีความมั่นคงและแสดงบทบาทได้อย่างเป็นธรรมชาติ',
};

/** คำเรียกราศีตามสถานะ สำหรับใช้ในประโยค */
export function dignitySignWord(type) {
  return type === 'exalt' ? 'ราศีอุจจ์' : type === 'debil' ? 'ราศีนิจ' : 'ราศีเกษตร';
}

export function oppositeSign(signId) {
  const i = SIGN_ORDER.indexOf(signId);
  return SIGN_ORDER[(i + 6) % 12];
}

/**
 * @param bodyKey sun|moon|mars|mercury|jupiter|venus|saturn
 * @returns null หรือ { type: 'exalt'|'debil'|'own', great, own, label, text }
 */
export function getDignity(bodyKey, signId, degreeInSign) {
  const entry = EXALTATION[bodyKey];
  if (!entry) return null;
  const [exaltSign, exactDeg] = entry;
  const own = (OWN_SIGNS[bodyKey] || []).includes(signId);
  let type = null;
  if (signId === exaltSign) type = 'exalt';
  else if (signId === oppositeSign(exaltSign)) type = 'debil';
  else if (own) type = 'own';
  if (!type) return null;
  if (type === 'own') {
    return { type, great: false, own: true, label: 'เกษตร', text: DIGNITY_TEXT.own };
  }
  const great = Math.abs(degreeInSign - exactDeg) <= GREAT_ORB;
  const label = type === 'exalt' ? (great ? 'มหาอุจจ์' : 'อุจจ์') : great ? 'มหานิจ' : 'นิจ';
  // พุธในราศีกันย์เป็นทั้งอุจจ์และเกษตร
  return { type, great, own, label, text: DIGNITY_TEXT[type] };
}

export function dignitySuffix(d) {
  return d ? ` [${d.label}]` : '';
}
