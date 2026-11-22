import { ZODIAC_DATA } from './zodiac';

export const ZODIAC_ORDER = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

export const THAI_HOUSES = [
  { num: 1, name: 'ตนุ', en: 'SELF', desc: 'ตัวตน บุคลิกภาพภายนอก วิธีแสดงออก และทิศทางชีวิตหลัก' },
  { num: 2, name: 'กดุมพะ', en: 'WEALTH', desc: 'การเงิน ทรัพย์สิน รายได้ และคุณค่าที่สร้างได้ด้วยตนเอง' },
  { num: 3, name: 'สหัชชะ', en: 'NETWORK', desc: 'การสื่อสาร เพื่อนฝูง พี่น้อง การเจรจา และการเดินทางระยะใกล้' },
  { num: 4, name: 'พันธุ', en: 'ROOTS', desc: 'ครอบครัว บ้าน ที่อยู่อาศัย รากฐานความมั่นคงทางใจ' },
  { num: 5, name: 'ปุตตะ', en: 'CREATION', desc: 'ความคิดสร้างสรรค์ โปรเจกต์ใหม่ การลงทุน บุตรบริวาร' },
  { num: 6, name: 'อริ', en: 'CHALLENGE', desc: 'อุปสรรค การแก้ปัญหา วินัยการทำงาน และการดูแลสุขภาพ' },
  { num: 7, name: 'ปัตนิ', en: 'PARTNER', desc: 'คู่ครอง หุ้นส่วนธุรกิจ ความร่วมมือ และการทำสัญญาระยะยาว' },
  { num: 8, name: 'มรณะ', en: 'TRANSFORM', desc: 'การเปลี่ยนแปลงเชิงลึก การปรับตัว ทรัพย์สินร่วม และการเรียนรู้ใหม่' },
  { num: 9, name: 'ศุภะ', en: 'VISION', desc: 'ความก้าวหน้า การศึกษาชั้นสูง วิสัยทัศน์ ผู้ใหญ่เกื้อหนุน' },
  { num: 10, name: 'กัมมะ', en: 'CAREER', desc: 'อาชีพการงาน บทบาททางสังคม ความรับผิดชอบ และชื่อเสียง' },
  { num: 11, name: 'ลาภะ', en: 'GAIN', desc: 'ผลลัพธ์ โอกาส รายได้เสริม เครือข่ายสนับสนุน และเป้าหมายระยะยาว' },
  { num: 12, name: 'วินาศ', en: 'INNER', desc: 'พื้นที่ส่วนตัว เบื้องหลัง จิตใต้สำนึก การพักฟื้น และงานปิดทองหลังพระ' },
];

// พิกัดจังหวัดสำคัญของประเทศไทย (ค่าเริ่มต้น: กรุงเทพมหานคร)
export const THAI_PROVINCES = [
  { name: 'กรุงเทพมหานคร', lat: 13.7563, lon: 100.5018 },
  { name: 'เชียงใหม่', lat: 18.7883, lon: 98.9853 },
  { name: 'เชียงราย', lat: 19.9105, lon: 99.8406 },
  { name: 'ภูเก็ต', lat: 7.8804, lon: 98.3923 },
  { name: 'ชลบุรี', lat: 13.3611, lon: 100.9847 },
  { name: 'ขอนแก่น', lat: 16.4419, lon: 102.8359 },
  { name: 'นครราชสีมา', lat: 14.9799, lon: 102.0978 },
  { name: 'อุดรธานี', lat: 17.4138, lon: 102.7872 },
  { name: 'อุบลราชธานี', lat: 15.2287, lon: 104.8564 },
  { name: 'สงขลา', lat: 7.1897, lon: 100.5951 },
  { name: 'สุราษฎร์ธานี', lat: 9.1382, lon: 99.3215 },
  { name: 'นครศรีธรรมราช', lat: 8.4304, lon: 99.9631 },
  { name: 'นนทบุรี', lat: 13.8621, lon: 100.5144 },
  { name: 'ปทุมธานี', lat: 14.0208, lon: 100.5250 },
  { name: 'สมุทรปราการ', lat: 13.5991, lon: 100.5998 },
  { name: 'พระนครศรีอยุธยา', lat: 14.3532, lon: 100.5684 },
  { name: 'นครปฐม', lat: 13.8199, lon: 100.0622 },
  { name: 'ระยอง', lat: 12.6833, lon: 101.2372 },
  { name: 'พิษณุโลก', lat: 16.8211, lon: 100.2659 },
  { name: 'ลำปาง', lat: 18.2888, lon: 99.4909 },
  { name: 'นครสวรรค์', lat: 15.7030, lon: 100.1372 },
  { name: 'ราชบุรี', lat: 13.5283, lon: 99.8134 },
  { name: 'กาญจนบุรี', lat: 14.0228, lon: 99.5328 },
  { name: 'ประจวบคีรีขันธ์', lat: 11.8124, lon: 99.7973 },
  { name: 'กระบี่', lat: 8.0863, lon: 98.9063 },
  { name: 'ตรัง', lat: 7.5563, lon: 99.6114 },
  { name: 'บุรีรัมย์', lat: 14.9930, lon: 103.1029 },
  { name: 'สุรินทร์', lat: 14.8829, lon: 103.4937 },
  { name: 'ร้อยเอ็ด', lat: 16.0538, lon: 103.6520 },
  { name: 'มหาสารคาม', lat: 16.1851, lon: 103.3026 },
  { name: 'สระบุรี', lat: 14.5289, lon: 100.9101 },
  { name: 'ฉะเชิงเทรา', lat: 13.6904, lon: 101.0779 },
  { name: 'จันทบุรี', lat: 12.6113, lon: 102.1039 },
  { name: 'เพชรบุรี', lat: 13.1119, lon: 99.9398 },
  { name: 'สุโขทัย', lat: 17.0056, lon: 99.8264 },
  { name: 'แพร่', lat: 18.1446, lon: 100.1403 },
  { name: 'น่าน', lat: 18.7756, lon: 100.7730 },
  { name: 'แม่ฮ่องสอน', lat: 19.3020, lon: 97.9654 },
];

export function resolveProvinceCoords(provinceName) {
  const clean = (provinceName || '').trim();
  if (!clean) return THAI_PROVINCES[0];
  const exact = THAI_PROVINCES.find(
    (p) => p.name === clean || p.name.includes(clean) || clean.includes(p.name)
  );
  return exact || THAI_PROVINCES[0];
}

function normalizeDeg(deg) {
  return ((deg % 360) + 360) % 360;
}

/**
 * คำนวณลัคนาไทย (Thai Sidereal Ascendant) และเรือนชะตา 12 เรือน
 * อ้างอิงเวลาท้องถิ่นไทย (UTC+7) และ Lahiri Ayanamsa
 */
export function calculateThaiAscendant({ yearAD, month, day, birthTime, birthProvince = '' }) {
  if (!birthTime || !/^\d{1,2}:\d{2}/.test(birthTime)) {
    return null;
  }

  const [hhStr, mmStr] = birthTime.split(':');
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  const location = resolveProvinceCoords(birthProvince);

  // แปลงเวลาไทย (UTC+7) เป็น UTC
  const localDecimalHours = hh + mm / 60;
  const utcDate = new Date(Date.UTC(yearAD, month - 1, day, 0, 0, 0));
  utcDate.setTime(utcDate.getTime() + (localDecimalHours - 7) * 3600 * 1000);

  // Julian Day (JD)
  const jd = utcDate.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;

  // Greenwich Mean Sidereal Time (GMST) in degrees
  const gmst = normalizeDeg(
    280.46061837 +
      360.98564736629 * (jd - 2451545.0) +
      0.000387933 * T * T -
      (T * T * T) / 38710000
  );

  // Local Sidereal Time (LST)
  const lstDeg = normalizeDeg(gmst + location.lon);
  const lstRad = (lstDeg * Math.PI) / 180;
  const latRad = (location.lat * Math.PI) / 180;

  // Obliquity of the ecliptic (~23.4393 deg)
  const epsDeg = 23.439291 - 0.0130042 * T;
  const epsRad = (epsDeg * Math.PI) / 180;

  // Tropical Ascendant longitude (standard astronomical formula)
  const y = Math.cos(lstRad);
  const x = -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));
  let tropicalAsc = normalizeDeg((Math.atan2(y, x) * 180) / Math.PI);

  // Lahiri Ayanamsa (~23.85 deg at J2000, precessing ~50.29"/yr)
  const yearsSince2000 = (jd - 2451545.0) / 365.25;
  const ayanamsa = 23.853 + yearsSince2000 * 0.01397;

  const siderealAsc = normalizeDeg(tropicalAsc - ayanamsa);
  const signIndex = Math.floor(siderealAsc / 30);
  const degreeInSign = siderealAsc % 30;
  const ascSignId = ZODIAC_ORDER[signIndex];
  const ascSign = ZODIAC_DATA[ascSignId];

  // Map 12 Thai Houses starting from Ascendant sign (Whole Sign House system — โหราศาสตร์ไทยมาตรฐาน)
  const houses = THAI_HOUSES.map((house, offset) => {
    const zIndex = (signIndex + offset) % 12;
    const zId = ZODIAC_ORDER[zIndex];
    return {
      ...house,
      signIndex: zIndex,
      sign: ZODIAC_DATA[zId],
    };
  });

  const wealthHouse = houses[1]; // กดุมพะ
  const careerHouse = houses[9]; // กัมมะ
  const partnerHouse = houses[6]; // ปัตนิ

  return {
    ascSign,
    signIndex,
    siderealLongitude: siderealAsc,
    degreeInSign: Math.floor(degreeInSign),
    minuteInSign: Math.floor((degreeInSign % 1) * 60),
    location,
    houses,
    wealthHouse,
    careerHouse,
    partnerHouse,
  };
}
