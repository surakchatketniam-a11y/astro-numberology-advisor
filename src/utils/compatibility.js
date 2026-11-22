import { SIGN_IDS } from './ephemeris';
import { calculateZodiacComparison } from './zodiac';

// ระยะห่างของราศี (0-6 หลังพับสมมาตร) -> ลักษณะความสัมพันธ์
export const ASPECTS = {
  0: {
    name: 'ราศีเดียวกัน',
    kind: 'harmony',
    score: 78,
    sun: 'นิสัยและวิธีมองโลกคล้ายกัน เข้าใจกันเร็ว แต่ข้อจำกัดก็คล้ายกันด้วย จึงควรช่วยเตือนกันในจุดที่ทั้งคู่มักพลาด',
    moon: 'อารมณ์และความต้องการทางใจคล้ายกันมาก รู้ใจกันง่าย ระวังการสะท้อนอารมณ์ตึงๆ ใส่กัน',
    tip: 'แบ่งบทบาทให้ชัด เพื่อไม่ให้ทั้งคู่ถนัดและพลาดเรื่องเดียวกัน',
  },
  1: {
    name: 'ราศีติดกัน',
    kind: 'neutral',
    score: 58,
    sun: 'อยู่ใกล้กันแต่จังหวะและค่านิยมต่างกัน มักมองเรื่องเดียวกันคนละมุม ต้องใช้เวลาทำความเข้าใจ',
    moon: 'ความต้องการทางใจต่างกันเล็กน้อย อีกฝ่ายอาจไม่เห็นว่าอะไรสำคัญกับเราจนกว่าจะบอกตรงๆ',
    tip: 'ถามกันตรงๆ ว่าอะไรสำคัญกับอีกฝ่ายในเรื่องนั้น แทนการเดาใจ',
  },
  2: {
    name: 'ราศีเกื้อหนุน (ห่าง 2 ราศี)',
    kind: 'harmony',
    score: 80,
    sun: 'พลังเข้ากันและช่วยเสริมกันโดยธรรมชาติ ทำงานหรือวางแผนร่วมกันได้ลื่นไหล',
    moon: 'อารมณ์เกื้อกูลกัน สื่อสารความรู้สึกได้ไม่ยากและให้กำลังใจกันได้ดี',
    tip: 'ใช้จุดแข็งที่เสริมกันตั้งเป้าหมายร่วม เช่น วางแผนการเงินหรืองานอดิเรกด้วยกัน',
  },
  3: {
    name: 'ราศีท้าทายกัน (ห่าง 3 ราศี)',
    kind: 'tension',
    score: 50,
    sun: 'ต่างกันในหลายเรื่อง อาจเกิดแรงเสียดทานเวลาตัดสินใจ แต่เป็นความสัมพันธ์ที่ผลักให้ทั้งคู่เติบโตได้',
    moon: 'วิธีจัดการอารมณ์ต่างกัน คนหนึ่งอาจอยากพูด อีกคนอยากเงียบ ควรตกลงจังหวะพูดคุยเมื่อมีเรื่องไม่สบายใจ',
    tip: 'ตกลงกฎเล็กๆ ร่วมกันเวลาไม่เห็นด้วย เช่น พักก่อน 20 นาทีแล้วค่อยคุยต่อ',
  },
  4: {
    name: 'ราศีส่งเสริมกัน (ห่าง 4 ราศี)',
    kind: 'harmony',
    score: 92,
    sun: 'เป็นคู่ที่พลังหนุนกันมากที่สุดแบบหนึ่ง ธาตุเดียวกัน เข้าใจแรงจูงใจของกันและกัน ผลักดันกันไปข้างหน้าได้',
    moon: 'ใจเข้ากันได้ลึก รู้สึกปลอดภัยเมื่ออยู่ด้วยกัน ความรู้สึกไหลไปในทิศเดียวกัน',
    tip: 'อย่าชะล่าใจเพราะเข้ากันง่าย ยังควรเช็กความคาดหวังของกันและกันเป็นระยะ',
  },
  5: {
    name: 'ราศีต้องปรับจูน (ห่าง 5 ราศี)',
    kind: 'neutral',
    score: 52,
    sun: 'ไม่ค่อยมีจุดร่วมโดยธรรมชาติ ต้องปรับตัวเข้าหากัน แต่เมื่อเข้าใจแล้วจะเติมเต็มกันในเรื่องที่อีกฝ่ายไม่ถนัด',
    moon: 'ความต้องการทางใจต่างกันพอสมควร ต้องใช้ความอดทนและการสื่อสารมากกว่าคู่อื่น',
    tip: 'ฝึกเล่าความรู้สึกด้วยประโยค "ฉันรู้สึก..." แทนการตัดสินอีกฝ่าย',
  },
  6: {
    name: 'ราศีตรงข้าม (ห่าง 6 ราศี)',
    kind: 'attraction',
    score: 66,
    sun: 'ดึงดูดกันเพราะต่างกัน คนหนึ่งมีสิ่งที่อีกคนขาด ทำให้เติมเต็มกันได้ แต่ก็อาจดึงกันไปคนละทางถ้าไม่ปรับสมดุล',
    moon: 'ความต้องการทางใจอยู่คนละขั้ว เสน่ห์สูงแต่เกิดความเข้าใจผิดได้ง่าย ต้องสื่อสารให้ชัด',
    tip: 'ยอมรับว่าความต่างคือส่วนเติมเต็ม ไม่ใช่ส่วนที่ต้องแก้',
  },
};

const ELEMENT_PAIRS = {
  harmony: [['Fire', 'Air'], ['Earth', 'Water']],
};

export function signDistance(idA, idB) {
  const a = SIGN_IDS.indexOf(idA);
  const b = SIGN_IDS.indexOf(idB);
  if (a === -1 || b === -1) throw new Error('Unknown sign');
  const d = (b - a + 12) % 12;
  return d > 6 ? 12 - d : d;
}

export function aspectBetween(idA, idB) {
  const d = signDistance(idA, idB);
  return { distance: d, ...ASPECTS[d] };
}

export function elementCompatibility(elA, elB) {
  if (elA === elB) {
    return { score: 80, text: 'ธาตุเดียวกัน เข้าใจจังหวะชีวิตและแรงจูงใจของกันได้ง่าย' };
  }
  const isComplement = ELEMENT_PAIRS.harmony.some(
    ([x, y]) => (x === elA && y === elB) || (x === elB && y === elA)
  );
  if (isComplement) {
    return { score: 88, text: 'ธาตุเกื้อหนุนกัน ช่วยเติมพลังและความสมดุลให้กันได้ดี' };
  }
  return { score: 55, text: 'ธาตุต่างกัน ต้องเรียนรู้จังหวะและวิธีแสดงออกของกันและกัน แต่ช่วยเปิดมุมมองใหม่ๆ ได้' };
}

const LIFE_PATH_GROUPS = [[1, 5, 7], [2, 4, 8], [3, 6, 9]];
const MASTER_BASE = { 11: 2, 22: 4, 33: 6 };

export function lifePathCompatibility(a, b) {
  const ra = MASTER_BASE[a] || a;
  const rb = MASTER_BASE[b] || b;
  if (ra === rb) {
    return { score: 80, text: `เลขรหัสชีวิตเดียวกัน (${a} และ ${b}) เข้าใจเป้าหมายชีวิตของกันและกัน` };
  }
  const same = LIFE_PATH_GROUPS.some((g) => g.includes(ra) && g.includes(rb));
  return same
    ? { score: 85, text: `เลขรหัสชีวิต ${a} และ ${b} อยู่กลุ่มพลังเดียวกัน แนวคิดและจังหวะชีวิตเข้ากันได้ดี` }
    : { score: 60, text: `เลขรหัสชีวิต ${a} และ ${b} ต่างกลุ่มพลัง ต้องเปิดใจรับวิธีคิดที่ต่างกัน` };
}

export function overallLabel(percent) {
  if (percent >= 82) return 'เข้ากันได้ดีมาก';
  if (percent >= 70) return 'เกื้อหนุนกันดี';
  if (percent >= 58) return 'เติมเต็มกันได้ ถ้าเข้าใจกัน';
  return 'ต้องปรับจูนกันมากหน่อย แต่เติบโตไปด้วยกันได้';
}

function personProfile(input) {
  const z = calculateZodiacComparison({
    day: input.day,
    month: input.month,
    yearAD: input.yearAD,
    birthTime: input.birthTime || '',
  });
  return {
    name: (input.name || '').trim(),
    formattedDateTH: z.formattedDateTH,
    dayOfWeek: z.dayOfWeek,
    sunSign: z.thai.sun.sign,
    moonSign: z.thai.moon.sign,
    moonUncertain: z.thai.moon.uncertain,
    sunUncertain: z.thai.sun.uncertain,
    lifePath: z.lifePathNumber,
  };
}

/**
 * วิเคราะห์ความเข้ากันของสองคนจากวันเกิด (ราศีไทยนิรายนะ, ราศีจันทร์, ธาตุ, เลขรหัสชีวิต)
 * เป็นแนวทางทำความเข้าใจกัน ไม่ใช่การตัดสินว่า "คู่ควร" หรือไม่
 */
export function analyzeCompatibility(inputA, inputB) {
  const a = personProfile(inputA);
  const b = personProfile(inputB);

  const sun = aspectBetween(a.sunSign.id, b.sunSign.id);
  const moon = aspectBetween(a.moonSign.id, b.moonSign.id);
  const element = elementCompatibility(a.sunSign.elementEn, b.sunSign.elementEn);
  const life = lifePathCompatibility(a.lifePath, b.lifePath);

  const percent = Math.round(
    moon.score * 0.35 + sun.score * 0.25 + element.score * 0.15 + life.score * 0.25
  );
  const personality = Math.round((sun.score * 25 + element.score * 15) / 40);

  const dimensions = [
    { id: 'heart', label: 'ใจและอารมณ์', score: moon.score, note: moon.moon, approx: a.moonUncertain || b.moonUncertain },
    { id: 'personality', label: 'บุคลิกและพลังธาตุ', score: personality, note: `${sun.sun} ${element.text}` },
    { id: 'life', label: 'เป้าหมายชีวิต (เลขรหัสชีวิต)', score: life.score, note: life.text },
  ];

  const harmonious = (x) => x.kind === 'harmony' || x.kind === 'attraction';
  const strengths = [];
  const cares = [];
  (harmonious(moon) ? strengths : cares).push(`ใจ (${moon.name}): ${moon.moon}`);
  (harmonious(sun) ? strengths : cares).push(`บุคลิก (${sun.name}): ${sun.sun}`);
  (element.score >= 80 ? strengths : cares).push(`ธาตุ: ${element.text}`);
  (life.score >= 80 ? strengths : cares).push(`เป้าหมายชีวิต: ${life.text}`);

  const tips = [...new Set([moon.tip, sun.tip])];
  tips.push('ใช้ผลนี้เป็นหัวข้อพูดคุยเพื่อเข้าใจกัน ความสัมพันธ์จริงขึ้นกับการสื่อสารและการลงมือของทั้งสองคนมากกว่าดวง');

  const notes = [];
  if (a.moonUncertain || b.moonUncertain) {
    notes.push('ไม่ได้ระบุเวลาเกิด (หรือดวงจันทร์ย้ายราศีในวันเกิด) ราศีจันทร์จึงเป็นค่าโดยประมาณ ใส่เวลาเกิดเพื่อความแม่นยำ');
  }
  if (a.sunUncertain || b.sunUncertain) {
    notes.push('มีวันเกิดตรงกับวันที่อาทิตย์ย้ายราศี ควรระบุเวลาเกิดเพื่อยืนยันราศี');
  }

  const result = {
    a,
    b,
    percent,
    label: overallLabel(percent),
    sun,
    moon,
    element,
    life,
    dimensions,
    strengths,
    cares,
    tips,
    notes,
  };
  result.lineSummary = generateCompatibilityLineSummary(result);
  return result;
}

export function displayName(p, fallback) {
  return p.name || fallback;
}

export function generateCompatibilityLineSummary(r) {
  const na = displayName(r.a, 'คนที่ 1');
  const nb = displayName(r.b, 'คนที่ 2');
  return [
    `สรุปความเข้ากัน ${na} และ ${nb} (Astro & Numerology Advisor)`,
    `${na}: ${r.a.formattedDateTH} ราศี${r.a.sunSign.thName.replace('ราศี', '')} จันทร์${r.a.moonSign.thName.replace('ราศี', '')} เลขชีวิต ${r.a.lifePath}`,
    `${nb}: ${r.b.formattedDateTH} ราศี${r.b.sunSign.thName.replace('ราศี', '')} จันทร์${r.b.moonSign.thName.replace('ราศี', '')} เลขชีวิต ${r.b.lifePath}`,
    ``,
    `ภาพรวม: ${r.percent}% — ${r.label}`,
    ...r.dimensions.map((d) => `• ${d.label}: ${d.score}%${d.approx ? ' (โดยประมาณ)' : ''}`),
    ``,
    `จุดเกื้อหนุน:`,
    ...(r.strengths.length ? r.strengths.map((t, i) => `${i + 1}) ${t}`) : ['-']),
    `จุดที่ควรเข้าใจกัน:`,
    ...(r.cares.length ? r.cares.map((t, i) => `${i + 1}) ${t}`) : ['-']),
    ``,
    `(เป็นแนวทางทำความเข้าใจกัน ไม่ใช่คำตัดสินความสัมพันธ์)`,
  ].join('\n');
}
