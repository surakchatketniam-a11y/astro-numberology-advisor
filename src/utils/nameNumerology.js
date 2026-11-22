import { THAI_CHAR_VALUES, interpretTotalSum } from './numerology';

// หมวดอักษรทักษา 8 วรรค (เรียงตามทักษาปกรณ์มาตรฐาน)
const TAKSA_GROUPS = [
  { id: 'sara', chars: 'อะอาอิอีอึอือุอูเอแอโอใอไอเอาออำฤฦ' }, // 1 อาทิตย์ (สระทั้งหมด + อ)
  { id: 'ka', chars: 'กขคฆง' }, // 2 จันทร์
  { id: 'ja', chars: 'จฉชซฌญ' }, // 3 อังคาร
  { id: 'da', chars: 'ฎฏฐฑฒณ' }, // 4 พุธกลางวัน
  { id: 'ba', chars: 'บปผฝพฟภม' }, // 5 พฤหัสบดี
  { id: 'sa', chars: 'ศษสหฬฮ' }, // 6 ศุกร์
  { id: 'ta', chars: 'ดตถทธน' }, // 7 เสาร์
  { id: 'ya', chars: 'ยรลว' }, // 8 ราหู (พุธกลางคืน)
];

// ลำดับตำแหน่งทักษา 8 ภูมิ (เวียนตามเข็มนาฬิกา: อาทิตย์ -> จันทร์ -> อังคาร -> พุธ -> เสาร์ -> พฤหัส -> ราหู -> ศุกร์)
const TAKSA_CYCLE_ORDER = ['sara', 'ka', 'ja', 'da', 'ta', 'ba', 'ya', 'sa'];

export const TAKSA_ROLES = [
  { key: 'boriwan', name: 'บริวาร', desc: 'มิตรภาพ ทีมงาน และคนรอบข้างที่คอยเกื้อหนุน' },
  { key: 'ayu', name: 'อายุ', desc: 'สุขภาพกาย–ใจ ความสม่ำเสมอ และพลังชีวิตที่ยั่งยืน' },
  { key: 'dech', name: 'เดช', desc: 'อำนาจการตัดสินใจ บารมี และความน่าเชื่อถือในสายงาน' },
  { key: 'sri', name: 'ศรี', desc: 'เสน่ห์ โอกาสที่ดี และความราบรื่นในการประสานงาน' },
  { key: 'mula', name: 'มูละ', desc: 'ฐานะ ทรัพย์สิน รากฐานความมั่นคง และความรับผิดชอบ' },
  { key: 'utsaha', name: 'อุตสาหะ', desc: 'ความขยัน ความมุ่งมั่น และการพัฒนาฝีมืออย่างต่อเนื่อง' },
  { key: 'montri', name: 'มนตรี', desc: 'การสนับสนุนจากผู้ใหญ่ ที่ปรึกษา และผู้มีประสบการณ์' },
  { key: 'kalakini', name: 'จุดฝึกสติ (กาลกิณี)', desc: 'จุดเตือนให้ใช้ความรอบคอบและสติในการตัดสินใจ (มองเป็นพื้นที่พัฒนาตนเอง)' },
];

export const BIRTH_DAYS_TAKSA = [
  { id: 'sunday', label: 'วันอาทิตย์', startGroup: 'sara' },
  { id: 'monday', label: 'วันจันทร์', startGroup: 'ka' },
  { id: 'tuesday', label: 'วันอังคาร', startGroup: 'ja' },
  { id: 'wednesday_day', label: 'วันพุธ (กลางวัน 06:00–17:59)', startGroup: 'da' },
  { id: 'wednesday_night', label: 'วันพุธ (กลางคืน 18:00–05:59)', startGroup: 'ya' },
  { id: 'thursday', label: 'วันพฤหัสบดี', startGroup: 'ba' },
  { id: 'friday', label: 'วันศุกร์', startGroup: 'sa' },
  { id: 'saturday', label: 'วันเสาร์', startGroup: 'ta' },
];

const VOWEL_SET = new Set('ะัาำิีึืุูเแโใไฤฦ็่้๊๋์อ'.split(''));

function getCharGroupId(ch) {
  if (VOWEL_SET.has(ch)) return 'sara';
  for (const g of TAKSA_GROUPS) {
    if (g.id !== 'sara' && g.chars.includes(ch)) return g.id;
  }
  return null;
}

function getTaksaRoleForChar(ch, startGroupId) {
  const groupId = getCharGroupId(ch);
  if (!groupId) return null;
  const startIdx = TAKSA_CYCLE_ORDER.indexOf(startGroupId);
  const charIdx = TAKSA_CYCLE_ORDER.indexOf(groupId);
  if (startIdx === -1 || charIdx === -1) return null;
  const offset = (charIdx - startIdx + 8) % 8;
  return TAKSA_ROLES[offset];
}

function scoreThaiWord(word, startGroupId) {
  const chars = [];
  let sum = 0;
  for (const ch of (word || '').trim()) {
    const val = THAI_CHAR_VALUES[ch];
    if (val !== undefined) {
      sum += val;
      const taksa = getTaksaRoleForChar(ch, startGroupId);
      chars.push({ char: ch, value: val, taksa });
    }
  }
  return { sum, chars };
}

export function analyzeThaiName({ firstName, lastName = '', birthDayId = 'sunday' }) {
  const cleanFirst = (firstName || '').trim();
  const cleanLast = (lastName || '').trim();
  if (!cleanFirst) return null;

  const dayMeta = BIRTH_DAYS_TAKSA.find((d) => d.id === birthDayId) || BIRTH_DAYS_TAKSA[0];
  const first = scoreThaiWord(cleanFirst, dayMeta.startGroup);
  const last = scoreThaiWord(cleanLast, dayMeta.startGroup);

  if (first.chars.length === 0) return null;

  const totalSum = first.sum + last.sum;

  // นับการกระจายทักษาเฉพาะชื่อตัว (ตามหลักตั้งชื่อไทย)
  const taksaCounts = {};
  for (const role of TAKSA_ROLES) {
    taksaCounts[role.key] = { ...role, count: 0, chars: [] };
  }
  for (const item of first.chars) {
    if (item.taksa) {
      taksaCounts[item.taksa.key].count += 1;
      taksaCounts[item.taksa.key].chars.push(item.char);
    }
  }

  const taksaSummary = Object.values(taksaCounts).filter((t) => t.count > 0);
  const hasKalakini = taksaCounts.kalakini.count > 0;

  return {
    firstName: cleanFirst,
    lastName: cleanLast,
    dayMeta,
    firstSum: first.sum,
    lastSum: last.sum,
    totalSum,
    firstChars: first.chars,
    lastChars: last.chars,
    firstInterpretation: interpretTotalSum(first.sum),
    lastInterpretation: cleanLast ? interpretTotalSum(last.sum) : null,
    totalInterpretation: interpretTotalSum(totalSum),
    taksaSummary,
    hasKalakini,
    kalakiniChars: taksaCounts.kalakini.chars,
  };
}

export function generateNameLineSummary(result) {
  if (!result) return '';
  const taksaText = result.taksaSummary
    .map((t) => `${t.name} (${t.count})`)
    .join(', ');

  return [
    `สรุปวิเคราะห์เลขศาสตร์ชื่อ–นามสกุล (Astro & Numerology Advisor)`,
    `ชื่อ–นามสกุล: ${result.firstName}${result.lastName ? ' ' + result.lastName : ''}`,
    `วันเกิดอ้างอิงทักษา: ${result.dayMeta.label}`,
    `ผลรวมชื่อตัว: ${result.firstSum} — ${result.firstInterpretation.description}`,
    result.lastName
      ? `ผลรวมนามสกุล: ${result.lastSum} | ผลรวมทั้งหมด: ${result.totalSum} — ${result.totalInterpretation.description}`
      : null,
    `โครงสร้างทักษาชื่อตัว: ${taksaText}`,
    result.hasKalakini
      ? `จุดฝึกสติจากอักษร (${result.kalakiniChars.join(', ')}): ใช้เป็นเครื่องเตือนใจให้รอบคอบและสื่อสารอย่างมีสติ ไม่ใช่เรื่องน่ากังวล`
      : `โครงสร้างอักษรชื่อตัวสมดุลดี ไม่พบอักษรในหมวดกาลกิณีของวันเกิด`,
  ]
    .filter(Boolean)
    .join('\n');
}
