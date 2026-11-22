import { computeBirthChart, formatDegree } from './ephemeris';
import { findProvince } from './provinces';
import { dignitySuffix, getDignity } from './dignity';

export const ZODIAC_DATA = {
  aries: {
    id: 'aries',
    thName: 'ราศีเมษ',
    enName: 'Aries',
    element: 'ธาตุไฟ',
    elementEn: 'Fire',
    thaiRuler: 'ดาวอังคาร (๓)',
    westernRuler: 'ดาวอังคาร (Mars)',
    thaiRange: '13 เม.ย. – 13 พ.ค.',
    westernRange: '21 มี.ค. – 19 เม.ย.',
    psychology:
      'มีความกล้าคิดกล้าตัดสินใจ เป็นนักบุกเบิกที่มีพลังขับเคลื่อนสูง ชอบความท้าทายและเรียนรู้ผ่านการลงมือทำจริง',
    growthTip:
      'ฝึกชะลอจังหวะก่อนตัดสินใจเรื่องใหญ่ เพื่อให้พลังความกล้าเดินคู่กับแผนรองรับความเสี่ยงที่รอบคอบ',
  },
  taurus: {
    id: 'taurus',
    thName: 'ราศีพฤษภ',
    enName: 'Taurus',
    element: 'ธาตุดิน',
    elementEn: 'Earth',
    thaiRuler: 'ดาวศุกร์ (๖)',
    westernRuler: 'ดาวศุกร์ (Venus)',
    thaiRange: '14 พ.ค. – 13 มิ.ย.',
    westernRange: '20 เม.ย. – 20 พ.ค.',
    psychology:
      'มั่นคง อดทน ให้คุณค่ากับความน่าเชื่อถือและความสวยงาม มีความสามารถในการสะสมทรัพยากรและสร้างผลลัพธ์ระยะยาว',
    growthTip:
      'เปิดพื้นที่ให้ความยืดหยุ่นเมื่อสภาพแวดล้อมเปลี่ยน เพื่อไม่ให้ยึดติดกับความเคยชินเดิมมากเกินไป',
  },
  gemini: {
    id: 'gemini',
    thName: 'ราศีเมถุน',
    enName: 'Gemini',
    element: 'ธาตุลม',
    elementEn: 'Air',
    thaiRuler: 'ดาวพุธ (๔)',
    westernRuler: 'ดาวพุธ (Mercury)',
    thaiRange: '14 มิ.ย. – 14 ก.ค.',
    westernRange: '21 พ.ค. – 20 มิ.ย.',
    psychology:
      'สื่อสารคล่องแคล่ว หัวไว ปรับตัวเก่ง ช่างสังเกตและเชื่อมโยงข้อมูลหลากหลายมุมมองได้อย่างรวดเร็ว',
    growthTip:
      'จัดลำดับความสำคัญทีละ 1–2 เป้าหมายหลัก เพื่อป้องกันภาวะพลังงานกระจายจากความสนใจหลายด้านพร้อมกัน',
  },
  cancer: {
    id: 'cancer',
    thName: 'ราศีกรกฎ',
    enName: 'Cancer',
    element: 'ธาตุน้ำ',
    elementEn: 'Water',
    thaiRuler: 'ดาวจันทร์ (๒)',
    westernRuler: 'ดวงจันทร์ (Moon)',
    thaiRange: '15 ก.ค. – 16 ส.ค.',
    westernRange: '21 มิ.ย. – 22 ก.ค.',
    psychology:
      'เข้าใจอารมณ์ผู้อื่นได้ดี มีความเห็นอกเห็นใจสูง ใส่ใจความปลอดภัยทางใจและเป็นหลักยึดที่ดีของคนใกล้ชิด',
    growthTip:
      'ตั้งขอบเขตทางอารมณ์อย่างอ่อนโยน แยกแยะความรับผิดชอบของตนเองออกจากความคาดหวังของคนรอบข้าง',
  },
  leo: {
    id: 'leo',
    thName: 'ราศีสิงห์',
    enName: 'Leo',
    element: 'ธาตุไฟ',
    elementEn: 'Fire',
    thaiRuler: 'ดาวอาทิตย์ (๑)',
    westernRuler: 'ดวงอาทิตย์ (Sun)',
    thaiRange: '17 ส.ค. – 16 ก.ย.',
    westernRange: '23 ก.ค. – 22 ส.ค.',
    psychology:
      'มีภาวะผู้นำ อบอุ่น จริงใจ ชอบสร้างแรงบันดาลใจและมีความภูมิใจในคุณค่าของผลงานที่ตนเองลงแรงสร้าง',
    growthTip:
      'รับฟังข้อเสนอแนะเชิงสร้างสรรค์อย่างเปิดใจ โดยไม่ผูกคุณค่าทั้งหมดของตนเองไว้กับคำชมจากภายนอก',
  },
  virgo: {
    id: 'virgo',
    thName: 'ราศีกันย์',
    enName: 'Virgo',
    element: 'ธาตุดิน',
    elementEn: 'Earth',
    thaiRuler: 'ดาวพุธ (๔)',
    westernRuler: 'ดาวพุธ (Mercury)',
    thaiRange: '17 ก.ย. – 16 ต.ค.',
    westernRange: '23 ส.ค. – 22 ก.ย.',
    psychology:
      'ละเอียดรอบคอบ คิดเป็นระบบ ชอบปรับปรุงกระบวนการให้มีประสิทธิภาพและแก้ปัญหาเชิงปฏิบัติได้ดีเยี่ยม',
    growthTip:
      'ลดความสมบูรณ์แบบนิยม (Perfectionism) ในเรื่องเล็กน้อย และให้รางวัลตนเองกับความก้าวหน้าระหว่างทาง',
  },
  libra: {
    id: 'libra',
    thName: 'ราศีตุลย์',
    enName: 'Libra',
    element: 'ธาตุลม',
    elementEn: 'Air',
    thaiRuler: 'ดาวศุกร์ (๖)',
    westernRuler: 'ดาวศุกร์ (Venus)',
    thaiRange: '17 ต.ค. – 15 พ.ย.',
    westernRange: '23 ก.ย. – 22 ต.ค.',
    psychology:
      'รักความยุติธรรม ประสานงานเก่ง มองเห็นทั้งสองด้านของปัญหา มีรสนิยมและทักษะการสร้างความร่วมมือที่ดี',
    growthTip:
      'กล้าตัดสินใจและสื่อสารความต้องการของตนเองอย่างตรงไปตรงมา แม้อาจไม่ถูกใจทุกคนพร้อมกัน',
  },
  scorpio: {
    id: 'scorpio',
    thName: 'ราศีพิจิก',
    enName: 'Scorpio',
    element: 'ธาตุน้ำ',
    elementEn: 'Water',
    thaiRuler: 'ดาวอังคาร (๓)',
    westernRuler: 'ดาวพลูโต / อังคาร (Pluto / Mars)',
    thaiRange: '16 พ.ย. – 15 ธ.ค.',
    westernRange: '23 ต.ค. – 21 พ.ย.',
    psychology:
      'มุ่งมั่น ลึกซึ้ง มองทะลุแก่นของสถานการณ์ มีพลังใจในการฟื้นตัวจากวิกฤตและซื่อสัตย์ต่อเป้าหมายอย่างยิ่ง',
    growthTip:
      'ฝึกปล่อยวางสิ่งที่ควบคุมไม่ได้ และสื่อสารความรู้สึกแทนการเก็บความกังวลไว้เงียบๆ เพียงลำพัง',
  },
  sagittarius: {
    id: 'sagittarius',
    thName: 'ราศีธนู',
    enName: 'Sagittarius',
    element: 'ธาตุไฟ',
    elementEn: 'Fire',
    thaiRuler: 'ดาวพฤหัสบดี (๕)',
    westernRuler: 'ดาวพฤหัสบดี (Jupiter)',
    thaiRange: '16 ธ.ค. – 13 ม.ค.',
    westernRange: '22 พ.ย. – 21 ธ.ค.',
    psychology:
      'มองโลกกว้าง รักการเรียนรู้ อิสระทางความคิด มีมุมมองเชิงปรัชญาและมองเห็นโอกาสใหม่ๆ ได้ดีกว่าคนทั่วไป',
    growthTip:
      'แปลงวิสัยทัศน์ใหญ่ให้เป็นขั้นตอนรายสัปดาห์ที่วัดผลได้ เพื่อไม่ให้ไอเดียดีๆ ค้างอยู่แค่ระดับแนวคิด',
  },
  capricorn: {
    id: 'capricorn',
    thName: 'ราศีมังกร',
    enName: 'Capricorn',
    element: 'ธาตุดิน',
    elementEn: 'Earth',
    thaiRuler: 'ดาวเสาร์ (๗)',
    westernRuler: 'ดาวเสาร์ (Saturn)',
    thaiRange: '14 ม.ค. – 12 ก.พ.',
    westernRange: '22 ธ.ค. – 19 ม.ค.',
    psychology:
      'มีวินัยสูง รับผิดชอบ มองการณ์ไกล วางแผนเป็นขั้นเป็นตอน และมีความอึดในการสร้างความสำเร็จที่ยั่งยืน',
    growthTip:
      'จัดเวลาพักผ่อนและผ่อนคลายอย่างมีคุณภาพ เพราะความยั่งยืนต้องอาศัยการฟื้นฟูพลังงานควบคู่กับความขยัน',
  },
  aquarius: {
    id: 'aquarius',
    thName: 'ราศีกุมภ์',
    enName: 'Aquarius',
    element: 'ธาตุลม',
    elementEn: 'Air',
    thaiRuler: 'ดาวราหู (๘)',
    westernRuler: 'ดาวยูเรนัส / เสาร์ (Uranus / Saturn)',
    thaiRange: '13 ก.พ. – 13 มี.ค.',
    westernRange: '20 ม.ค. – 18 ก.พ.',
    psychology:
      'คิดนอกกรอบ มีวิสัยทัศน์ล้ำสมัย ให้ความสำคัญกับเหตุผล อิสรภาพ และแนวคิดที่สร้างประโยชน์ต่อส่วนรวม',
    growthTip:
      'เชื่อมโยงความคิดเชิงเหตุผลเข้ากับความรู้สึกของผู้ร่วมงาน เพื่อให้ไอเดียใหม่ๆ ได้รับการยอมรับได้ง่ายขึ้น',
  },
  pisces: {
    id: 'pisces',
    thName: 'ราศีมีน',
    enName: 'Pisces',
    element: 'ธาตุน้ำ',
    elementEn: 'Water',
    thaiRuler: 'ดาวพฤหัสบดี (๕)',
    westernRuler: 'ดาวเนปจูน / พฤหัสบดี (Neptune / Jupiter)',
    thaiRange: '14 มี.ค. – 12 เม.ย.',
    westernRange: '19 ก.พ. – 20 มี.ค.',
    psychology:
      'จินตนาการสูง อ่อนโยน มีสัญชาตญาณเฉียบคม เข้าใจศิลปะและความหมายลึกซึ้งของชีวิตได้อย่างเป็นธรรมชาติ',
    growthTip:
      'ใช้โครงสร้างเวลาและเช็กลิสต์ง่ายๆ ช่วยประคองแรงบันดาลใจให้กลายเป็นผลงานที่จับต้องได้จริง',
  },
};

export const THAI_DAYS = [
  { name: 'วันอาทิตย์', planet: 'ดาวอาทิตย์ (๑)', color: 'โทนแดง-ทอง', trait: 'เชื่อมั่น โดดเด่น รักศักดิ์ศรี' },
  { name: 'วันจันทร์', planet: 'ดาวจันทร์ (๒)', color: 'โทนเหลืองนวล-ครีม', trait: 'อ่อนโยน ช่างเอาใจใส่ มีเสน่ห์ทางการสื่อสาร' },
  { name: 'วันอังคาร', planet: 'ดาวอังคาร (๓)', color: 'โทนชมพู-กุหลาบ', trait: 'กล้าหาญ ตรงไปตรงมา ลุยงานจริงจัง' },
  { name: 'วันพุธ', planet: 'ดาวพุธ (๔)', color: 'โทนเขียว-มรกต', trait: 'ปรับตัวเก่ง เจรจาดี มีไหวพริบทางการค้า' },
  { name: 'วันพฤหัสบดี', planet: 'ดาวพฤหัสบดี (๕)', color: 'โทนส้ม-ทองอำพัน', trait: 'มีเหตุผล ใฝ่รู้ ยึดมั่นในหลักการและคุณธรรม' },
  { name: 'วันศุกร์', planet: 'ดาวศุกร์ (๖)', color: 'โทนฟ้า-น้ำเงิน', trait: 'รักความงดงาม มีรสนิยม สร้างบรรยากาศที่ดี' },
  { name: 'วันเสาร์', planet: 'ดาวเสาร์ (๗)', color: 'โทนม่วง-กรมท่า', trait: 'อดทน รอบคอบ หนักแน่น และพึ่งพาได้' },
];

export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

function toMonthDayNumber(month, day) {
  return month * 100 + day;
}

export function getThaiSiderealSign(month, day) {
  const md = toMonthDayNumber(month, day);
  if (md >= 413 && md <= 513) return ZODIAC_DATA.aries;
  if (md >= 514 && md <= 613) return ZODIAC_DATA.taurus;
  if (md >= 614 && md <= 714) return ZODIAC_DATA.gemini;
  if (md >= 715 && md <= 816) return ZODIAC_DATA.cancer;
  if (md >= 817 && md <= 916) return ZODIAC_DATA.leo;
  if (md >= 917 && md <= 1016) return ZODIAC_DATA.virgo;
  if (md >= 1017 && md <= 1115) return ZODIAC_DATA.libra;
  if (md >= 1116 && md <= 1215) return ZODIAC_DATA.scorpio;
  if (md >= 1216 || md <= 113) return ZODIAC_DATA.sagittarius;
  if (md >= 114 && md <= 212) return ZODIAC_DATA.capricorn;
  if (md >= 213 && md <= 313) return ZODIAC_DATA.aquarius;
  return ZODIAC_DATA.pisces;
}

export function getWesternTropicalSign(month, day) {
  const md = toMonthDayNumber(month, day);
  if (md >= 321 && md <= 419) return ZODIAC_DATA.aries;
  if (md >= 420 && md <= 520) return ZODIAC_DATA.taurus;
  if (md >= 521 && md <= 620) return ZODIAC_DATA.gemini;
  if (md >= 621 && md <= 722) return ZODIAC_DATA.cancer;
  if (md >= 723 && md <= 822) return ZODIAC_DATA.leo;
  if (md >= 823 && md <= 922) return ZODIAC_DATA.virgo;
  if (md >= 923 && md <= 1022) return ZODIAC_DATA.libra;
  if (md >= 1023 && md <= 1121) return ZODIAC_DATA.scorpio;
  if (md >= 1122 && md <= 1221) return ZODIAC_DATA.sagittarius;
  if (md >= 1222 || md <= 119) return ZODIAC_DATA.capricorn;
  if (md >= 120 && md <= 218) return ZODIAC_DATA.aquarius;
  return ZODIAC_DATA.pisces;
}

export function calculateLifePathNumber(yearAD, month, day) {
  const digits = `${yearAD}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`
    .split('')
    .map(Number);
  let sum = digits.reduce((acc, n) => acc + n, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum)
      .split('')
      .map(Number)
      .reduce((acc, n) => acc + n, 0);
  }
  return sum;
}

function describeBody(position, uncertain = false, bodyKey = null) {
  if (!position) return null;
  return {
    dignity: bodyKey ? getDignity(bodyKey, position.signId, position.degreeInSign) : null,
    sign: ZODIAC_DATA[position.signId],
    degreeInSign: position.degreeInSign,
    longitude: position.longitude,
    uncertain,
  };
}

/**
 * เปรียบเทียบราศีไทย (นิรายนะ, Lahiri) กับราศีสากล (สายนะ) จากตำแหน่งดาวจริง
 * ราศีอาทิตย์: คำนวณจากเวลาเกิด (หรือเที่ยงวันถ้าไม่ระบุ)
 * ราศีจันทร์/ลัคนา: แม่นเมื่อมีเวลาเกิด (ลัคนาต้องรู้จังหวัดที่เกิดด้วย)
 */
export function calculateZodiacComparison({ day, month, yearAD, birthTime = '', birthProvince = '' }) {
  const d = Number(day);
  const m = Number(month);
  const y = Number(yearAD);

  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = THAI_DAYS[dateObj.getDay()];
  const province = findProvince(birthProvince);
  const chart = computeBirthChart({ yearAD: y, month: m, day: d, birthTime, location: province });

  const thai = {
    sun: describeBody(chart.sidereal.sun, chart.uncertain.sun, 'sun'),
    moon: describeBody(chart.sidereal.moon, chart.uncertain.moon, 'moon'),
    asc: describeBody(chart.sidereal.asc),
  };
  const western = {
    sun: describeBody(chart.tropical.sun, chart.uncertain.sun, 'sun'),
    moon: describeBody(chart.tropical.moon, chart.uncertain.moon, 'moon'),
    asc: describeBody(chart.tropical.asc),
  };

  const thaiSign = thai.sun.sign;
  const westernSign = western.sun.sign;
  const isSameSign = thaiSign.id === westernSign.id;
  const lifePathNumber = calculateLifePathNumber(y, m, d);
  const ayanamsaText = `${chart.ayanamsa.toFixed(2)}°`;

  const comparisonNote = isSameSign
    ? `ทั้งโหราศาสตร์ไทยและโหราศาสตร์สากลชี้ไปที่${thaiSign.thName} (${thaiSign.enName}) ตรงกัน แสดงถึงเอกลักษณ์ของ${thaiSign.element}ที่ชัดเจนและสอดคล้องกันทั้งมุมมองภายในและบุคลิกที่แสดงออก`
    : `โหราศาสตร์ไทยตรงกับ${thaiSign.thName} (${thaiSign.element}) ขณะที่โหราศาสตร์สากลตรงกับ${westernSign.thName} (${westernSign.element}) ความต่างนี้เกิดจากจุดอ้างอิงดวงดาวต่างกันราว ${ayanamsaText} (อายนางศะ Lahiri ณ ปีเกิด) ในเชิงจิตวิทยาสามารถมองเป็น "จุดแข็งสองมิติ" ที่เสริมกันได้`;

  const formattedDateTH = `${d} ${THAI_MONTHS[m - 1]} พ.ศ. ${y + 543} (${y})`;

  const notes = [];
  if (!chart.hasTime) {
    notes.push('ไม่ได้ระบุเวลาเกิด: ราศีจันทร์คำนวณที่เที่ยงวัน และไม่สามารถคำนวณลัคนาได้');
  } else if (!province) {
    notes.push(
      birthProvince.trim()
        ? `ไม่พบจังหวัด "${birthProvince.trim()}" ในรายชื่อ จึงยังไม่คำนวณลัคนา`
        : 'ไม่ได้ระบุจังหวัดที่เกิด จึงยังไม่คำนวณลัคนา'
    );
  }
  if (thai.sun.uncertain || western.sun.uncertain) {
    notes.push('วันเกิดตรงกับวันที่ดาวอาทิตย์ย้ายราศี ควรระบุเวลาเกิดเพื่อความแม่นยำ');
  }
  if (thai.moon.uncertain || western.moon.uncertain) {
    notes.push('ดวงจันทร์ย้ายราศีในวันเกิด ควรระบุเวลาเกิดเพื่อยืนยันราศีจันทร์');
  }

  return {
    day: d,
    month: m,
    yearAD: y,
    yearBE: y + 543,
    formattedDateTH,
    birthTime,
    birthProvince,
    province,
    dayOfWeek,
    thaiSign,
    westernSign,
    isSameSign,
    lifePathNumber,
    comparisonNote,
    ayanamsa: chart.ayanamsa,
    thai,
    western,
    // ตนุลัคน์ = เจ้าเรือนของราศีลัคนา (มีเมื่อรู้เวลาเกิดและจังหวัด)
    thaiAscRuler: thai.asc ? thai.asc.sign.thaiRuler : null,
    westernAscRuler: western.asc ? western.asc.sign.westernRuler : null,
    notes,
  };
}

function bodyLine(label, body) {
  if (!body) return null;
  const flag = body.uncertain ? ' (โดยประมาณ)' : '';
  return `${label}: ${body.sign.thName} ${formatDegree(body.degreeInSign)}${flag}${dignitySuffix(body.dignity)}`;
}

export function generateZodiacLineSummary(result) {
  const lines = [
    `สรุปผลเปรียบเทียบราศี (Astro & Numerology Advisor)`,
    `วันเกิด: ${result.formattedDateTH} (${result.dayOfWeek.name})`,
    result.birthTime ? `เวลาเกิด: ${result.birthTime} น.` : null,
    result.birthProvince ? `จังหวัดเกิด: ${result.birthProvince}` : null,
    ``,
    `1) โหราศาสตร์ไทย (นิรายนะวิธี): ${result.thaiSign.thName} (${result.thaiSign.element})`,
    bodyLine('อาทิตย์', result.thai.sun),
    bodyLine('จันทร์', result.thai.moon),
    bodyLine('ลัคนา', result.thai.asc),
    `ดาวประจำราศีเกิด: ${result.thaiSign.thaiRuler}`,
    result.thaiAscRuler ? `ตนุลัคน์ (เจ้าเรือนลัคนา): ${result.thaiAscRuler}` : null,
    `จุดเด่น: ${result.thaiSign.psychology}`,
    ``,
    `2) โหราศาสตร์สากล (สายนะวิธี): ${result.westernSign.thName} / ${result.westernSign.enName} (${result.westernSign.element})`,
    bodyLine('อาทิตย์', result.western.sun),
    bodyLine('จันทร์', result.western.moon),
    bodyLine('ลัคนา', result.western.asc),
    `ดาวประจำราศีเกิด: ${result.westernSign.westernRuler}`,
    result.westernAscRuler ? `ดาวประจำลัคนา: ${result.westernAscRuler}` : null,
    `จุดเด่น: ${result.westernSign.psychology}`,
    ``,
    `มุมมองเชิงจิตวิทยา: ${result.comparisonNote}`,
    `แนวทางพัฒนาตนเอง: ${result.thaiSign.growthTip}`,
    `เลขรหัสชีวิต (Life Path): ${result.lifePathNumber}`,
  ].filter((line) => line !== null);

  return lines.join('\n');
}
