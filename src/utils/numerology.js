// เลขศาสตร์อักษรไทย (Thai Consonant Numerology Mapping)
export const THAI_CHAR_VALUES = {
  'ก': 1, 'ด': 1, 'ถ': 1, 'ท': 1, 'ภ': 1, 'า': 1, 'ำ': 1, 'ุ': 1, '่': 1,
  'ข': 2, 'ช': 2, 'บ': 2, 'ป': 2, 'ง': 2, 'เ': 2, 'แ': 2, 'ู': 2, '้': 2,
  'ฆ': 3, 'ฑ': 3, 'ฒ': 3, 'ต': 3, '๋': 3,
  'ค': 4, 'ธ': 4, 'ร': 4, 'ญ': 4, 'ษ': 4, 'โ': 4, 'ะ': 4, 'ิ': 4, 'ั': 4,
  'ฉ': 5, 'ณ': 5, 'ฌ': 5, 'น': 5, 'ม': 5, 'ห': 5, 'ฎ': 5, 'ฮ': 5, 'ฬ': 5, 'ึ': 5,
  'จ': 6, 'ล': 6, 'ว': 6, 'อ': 6, 'ใ': 6,
  'ซ': 7, 'ศ': 7, 'ส': 7, 'ี': 7, 'ื': 7, '๊': 7,
  'ย': 8, 'พ': 8, 'ฟ': 8, 'ผ': 8, 'ฝ': 8, '็': 8,
  'ฏ': 9, 'ฐ': 9, 'ไ': 9, '์': 9,
};

const DIGIT_KEYWORDS = {
  '0': 'อิสระและความคิดนอกกรอบ',
  '1': 'ภาวะผู้นำและความเชื่อมั่น',
  '2': 'ความอ่อนโยนและเสน่ห์การประสานงาน',
  '3': 'ความขยัน ความกล้า และพลังลงมือทำ',
  '4': 'การสื่อสาร ไหวพริบ และข้อมูล',
  '5': 'สติปัญญา เหตุผล และความน่าเชื่อถือ',
  '6': 'ศิลปะ ความสุข และการบริหารทรัพย์',
  '7': 'ความอดทน วินัย และความรับผิดชอบระยะยาว',
  '8': 'วิสัยทัศน์กว้าง การเจรจาธุรกิจ และการปรับตัว',
  '9': 'ความคิดสร้างสรรค์ สัญชาตญาณ และเทคโนโลยี',
};

// คู่เลขเด่นที่พบบ่อย พร้อมความหมายเชิงจิตวิทยาและคำแนะนำเชิงสร้างสรรค์
const PAIR_DICTIONARY = {
  '14': { label: 'สติปัญญาและการสื่อสาร', tone: 'high', meaning: 'พูดจามีเหตุผล น่าเชื่อถือ วางแผนเป็นระบบ เหมาะกับงานบริหารและที่ปรึกษา' },
  '41': { label: 'สติปัญญาและการสื่อสาร', tone: 'high', meaning: 'คิดวิเคราะห์เฉียบคม ถ่ายทอดเรื่องยากให้เข้าใจง่าย ได้รับการยอมรับจากผู้ใหญ่' },
  '15': { label: 'ปัญญาและเมตตา', tone: 'high', meaning: 'สุขุม มีหลักการ เป็นที่พึ่งของคนรอบข้าง สร้างความไว้วางใจได้ระยะยาว' },
  '51': { label: 'ปัญญาและเมตตา', tone: 'high', meaning: 'มีเหตุผลและน้ำใจ ตัดสินใจรอบคอบ เหมาะกับการวางแผนชีวิตและการงาน' },
  '16': { label: 'วางแผนการเงินอย่างมีระบบ', tone: 'good', meaning: 'ใส่ใจรายละเอียด รอบคอบเรื่องงบประมาณ ชอบความมั่นคงและมีมาตรฐานสูง' },
  '61': { label: 'วางแผนการเงินอย่างมีระบบ', tone: 'good', meaning: 'รู้จักบริหารทรัพยากร มีเป้าหมายชัดเจนและไม่ประมาทในการใช้จ่าย' },
  '19': { label: 'วิสัยทัศน์และภาวะผู้นำ', tone: 'high', meaning: 'คิดการณ์ไกล โดดเด่นในสายงาน เป็นผู้นำที่เปิดรับนวัตกรรมและแนวคิดใหม่' },
  '91': { label: 'วิสัยทัศน์และภาวะผู้นำ', tone: 'high', meaning: 'มีเอกลักษณ์และความมั่นใจ สร้างชื่อเสียงจากความเชี่ยวชาญเฉพาะด้านได้ดี' },
  '23': { label: 'เสน่ห์และพลังขับเคลื่อน', tone: 'good', meaning: 'ทำงานไว มีแรงจูงใจสูง เข้าสังคมเก่ง แนะนำให้บาลานซ์อารมณ์กับเหตุผลเสมอ' },
  '32': { label: 'เสน่ห์และพลังขับเคลื่อน', tone: 'good', meaning: 'มีมนุษยสัมพันธ์ดีและกล้าลุย เหมาะกับงานขาย การตลาด และงานที่ต้องใช้พลังใจ' },
  '24': { label: 'เมตตามหานิยมและการเจรจา', tone: 'high', meaning: 'สื่อสารนุ่มนวล เป็นมิตร สร้างคอนเนกชันเก่ง ได้รับความร่วมมือจากผู้อื่นง่าย' },
  '42': { label: 'เมตตามหานิยมและการเจรจา', tone: 'high', meaning: 'พูดจาสร้างความสบายใจ ปิดการเจรจาด้วยความเข้าใจทั้งสองฝ่ายได้ดี' },
  '26': { label: 'ความละเมียดละไมและรสนิยม', tone: 'high', meaning: 'ใส่ใจความรู้สึกผู้อื่น มีศิลปะในการสื่อสาร เหมาะกับงานบริการและงานสร้างสรรค์' },
  '62': { label: 'ความละเมียดละไมและรสนิยม', tone: 'high', meaning: 'อบอุ่น มีเสน่ห์ สร้างบรรยากาศที่ดีในทีมและครอบครัวได้ดี' },
  '28': { label: 'การบริหารเครือข่ายและธุรกิจใหญ่', tone: 'good', meaning: 'ใจกว้าง กล้าคิดโปรเจกต์ใหญ่ แนะนำให้วางแผนกระแสเงินสดควบคู่เพื่อความยั่งยืน' },
  '82': { label: 'การบริหารเครือข่ายและธุรกิจใหญ่', tone: 'good', meaning: 'มองเห็นโอกาสทางธุรกิจและเชื่อมโยงผู้คนเก่ง ควรมีระบบตรวจสอบรายละเอียดควบคู่' },
  '29': { label: 'จินตนาการและสุนทรียภาพ', tone: 'good', meaning: 'มีหัวศิลป์ ช่างสังเกต เข้าใจอารมณ์และความสวยงาม เหมาะกับงานออกแบบและคอนเทนต์' },
  '92': { label: 'จินตนาการและสุนทรียภาพ', tone: 'good', meaning: 'อ่อนโยน มีรสนิยมและมุมมองสร้างสรรค์ เข้าถึงใจกลุ่มเป้าหมายได้ดี' },
  '35': { label: 'ความมุ่งมั่นและอำนาจการจัดการ', tone: 'high', meaning: 'ขยัน มีวินัย ลงมือทำจริงพร้อมมีหลักการ เหมาะกับผู้บริหารและเจ้าของกิจการ' },
  '53': { label: 'ความมุ่งมั่นและอำนาจการจัดการ', tone: 'high', meaning: 'กล้าตัดสินใจบนฐานเหตุผล ลุยงานหนักได้อย่างมีระบบและได้รับความเคารพ' },
  '36': { label: 'ความกระตือรือร้นและเสน่ห์', tone: 'high', meaning: 'มีพลังบวก ทำงานเก่งควบคู่กับการสร้างความสัมพันธ์ที่ดีและหาโอกาสใหม่ๆ ได้คล่อง' },
  '63': { label: 'ความกระตือรือร้นและเสน่ห์', tone: 'high', meaning: 'สดใส มั่นใจ ชอบพัฒนาตนเองอยู่เสมอ ดึงดูดโอกาสทางการงานและการเงินได้ดี' },
  '39': { label: 'ความทะเยอทะยานและการแข่งขัน', tone: 'good', meaning: 'ชอบความท้าทายและการพัฒนาให้เหนือขีดจำกัด เหมาะกับสายงานที่ต้องเร่งสร้างผลงาน' },
  '93': { label: 'ความทะเยอทะยานและการแข่งขัน', tone: 'good', meaning: 'กล้าลองสิ่งใหม่ มีไหวพริบในการแก้เกมและปรับกลยุทธ์ได้อย่างรวดเร็ว' },
  '45': { label: 'ปัญญาและโอกาสจากผู้ใหญ่', tone: 'high', meaning: 'เรียนรู้ไว มีเหตุผล น่าเชื่อถือ เหมาะกับการเรียนต่อ งานวิชาการ และการเป็นที่ปรึกษา' },
  '54': { label: 'ปัญญาและโอกาสจากผู้ใหญ่', tone: 'high', meaning: 'สื่อสารอย่างมีหลักการ แก้ปัญหาด้วยข้อมูลและสติ มักได้รับคำแนะนำที่ดีจากผู้มีประสบการณ์' },
  '46': { label: 'การสื่อสารที่สร้างมูลค่า', tone: 'high', meaning: 'พูดจาไพเราะ สร้างบรรยากาศเชิงบวก เหมาะกับงานขาย ประชาสัมพันธ์ และการสร้างแบรนด์' },
  '64': { label: 'การสื่อสารที่สร้างมูลค่า', tone: 'high', meaning: 'คล่องแคล่ว อารมณ์ดี ใช้คำพูดสร้างโอกาสและรายได้ได้อย่างเป็นธรรมชาติ' },
  '49': { label: 'ไหวพริบและเทคโนโลยี', tone: 'high', meaning: 'เรียนรู้เทคโนโลยีและภาษาได้ไว คิดเชื่อมโยงข้อมูลได้เร็ว เหมาะกับยุคดิจิทัล' },
  '94': { label: 'ไหวพริบและเทคโนโลยี', tone: 'high', meaning: 'ทันสมัย สื่อสารได้หลากหลายแพลตฟอร์ม ปรับตัวรับความเปลี่ยนแปลงได้ดีเยี่ยม' },
  '55': { label: 'ความสุขุมและสมดุลชีวิต', tone: 'high', meaning: 'ใจเย็น มีเมตตา ยึดมั่นในความถูกต้อง รู้จักปล่อยวางและมองปัญหาอย่างเป็นกลาง' },
  '56': { label: 'ปัญญาคู่ทรัพย์และความมั่นคง', tone: 'high', meaning: 'วางแผนการเงินและชีวิตได้อย่างลงตัว มีความสุขกับความสำเร็จที่ค่อยๆ เติบโต' },
  '65': { label: 'ปัญญาคู่ทรัพย์และความมั่นคง', tone: 'high', meaning: 'ฉลาดบริหารทรัพยากร สร้างความมั่นคงทางการเงินควบคู่กับคุณภาพชีวิตที่ดี' },
  '59': { label: 'ปัญญาเชิงลึกและวิสัยทัศน์', tone: 'high', meaning: 'มีหลักคิดที่เป็นผู้ใหญ่ สนใจการพัฒนาจิตใจและมองการณ์ไกลได้อย่างแม่นยำ' },
  '95': { label: 'ปัญญาเชิงลึกและวิสัยทัศน์', tone: 'high', meaning: 'คิดอย่างมีสติและสร้างสรรค์ ได้รับความเคารพในมุมมองที่รอบด้าน' },
  '66': { label: 'ความรื่นรมย์และสุนทรียะ', tone: 'high', meaning: 'รักความสวยงาม สร้างความสุขให้คนรอบข้างได้ดี แนะนำให้วางแผนออมควบคู่การใช้จ่าย' },
  '69': { label: 'ความคิดสร้างสรรค์และกระแสเงินหมุนเวียน', tone: 'good', meaning: 'มีรสนิยมดี สร้างรายได้จากไอเดียและงานสร้างสรรค์ได้ดี ควรจัดระบบเก็บออมให้ชัดเจน' },
  '96': { label: 'ความคิดสร้างสรรค์และกระแสเงินหมุนเวียน', tone: 'good', meaning: 'มีเสน่ห์ด้านสไตล์และความคิดทันสมัย เหมาะกับธุรกิจไลฟ์สไตล์และงานสร้างสรรค์' },
  '78': { label: 'พลังเครือข่ายและการบริหารงานใหญ่', tone: 'good', meaning: 'ใจใหญ่ มีบารมีและสายสัมพันธ์กว้างขวาง เหมาะกับงานโครงการขนาดใหญ่ที่ต้องอาศัยทีม' },
  '87': { label: 'พลังเครือข่ายและการบริหารงานใหญ่', tone: 'good', meaning: 'กล้าตัดสินใจระดับมหภาค มีความอึดและรับมือแรงกดดันในงานใหญ่ได้ดี' },
  '79': { label: 'ความอดทนและวิสัยทัศน์ระยะยาว', tone: 'good', meaning: 'เหมาะกับการสะสมทรัพย์สินระยะยาว อสังหาริมทรัพย์ หรืองานที่ต้องใช้ความเชี่ยวชาญเฉพาะ' },
  '97': { label: 'ความอดทนและวิสัยทัศน์ระยะยาว', tone: 'good', meaning: 'วางรากฐานมั่นคง มองเกมยาวได้ดี ควรจัดเวลาพักผ่อนเพื่อคลายความเครียดจากการคิดมาก' },
  '89': { label: 'บารมีและการเปลี่ยนแปลงเชิงบวก', tone: 'high', meaning: 'มีสัญชาตญาณธุรกิจดี ปรับตัวเก่งและมองเห็นโอกาสในสถานการณ์ที่คนอื่นมองข้าม' },
  '98': { label: 'บารมีและการเปลี่ยนแปลงเชิงบวก', tone: 'high', meaning: 'โดดเด่นด้านภาวะผู้นำและความทันสมัย เหมาะกับการขับเคลื่อนองค์กรหรือธุรกิจส่วนตัว' },
  '99': { label: 'สัญชาตญาณและมุมมองเฉพาะตัว', tone: 'good', meaning: 'มีโลกส่วนตัวสูง ชอบเรียนรู้เชิงลึกและเทคโนโลยี แนะนำให้สื่อสารกับทีมให้ชัดเจนขึ้น' },
  // กลุ่มที่เน้น "การบริหารสมดุล" เชิงจิตวิทยา (ไม่ข่มขู่)
  '00': { label: 'พื้นที่อิสระ (ควรวางโครงสร้าง)', tone: 'balance', meaning: 'รักอิสระและมีแนวคิดเฉพาะตัว แนะนำให้กำหนดตารางและเป้าหมายที่เป็นรูปธรรมควบคู่' },
  '13': { label: 'พลังความเร็ว (ควรชะลอเพื่อรอบคอบ)', tone: 'balance', meaning: 'ตัดสินใจไวและกล้าเปลี่ยนแปลง แนะนำให้ตรวจเช็กความเสี่ยงและวางแผนสำรองก่อนลงมือ' },
  '31': { label: 'พลังความเร็ว (ควรชะลอเพื่อรอบคอบ)', tone: 'balance', meaning: 'มีแรงขับเคลื่อนสูง ทำงานเร็ว ควรฝึกหายใจลึกๆ เพื่อลดความใจร้อนในการสื่อสาร' },
  '37': { label: 'ความอึดสูง (ควรแบ่งเวลาพักผ่อน)', tone: 'balance', meaning: 'รับผิดชอบงานหนักได้ดีมาก แนะนำให้กระจายงานและดูแลสุขภาพกาย-ใจไม่ให้ล้าเกินไป' },
  '73': { label: 'ความอึดสูง (ควรแบ่งเวลาพักผ่อน)', tone: 'balance', meaning: 'สู้ไม่ถอยและอดทนเป็นเลิศ ควรวางแผนงานให้ยืดหยุ่นเพื่อลดแรงกดดันสะสม' },
  '38': { label: 'ความกล้าเสี่ยง (ควรคุมความเสี่ยง)', tone: 'balance', meaning: 'กล้าลุยและคิดใหญ่ แนะนำให้ใช้ข้อมูลและงบประมาณจำกัดความเสี่ยงก่อนตัดสินใจลงทุน' },
  '83': { label: 'ความกล้าเสี่ยง (ควรคุมความเสี่ยง)', tone: 'balance', meaning: 'พลังใจสูงและกล้าลองของใหม่ เหมาะกับการตั้งกรอบกติกาที่ชัดเจนเพื่อกันความผิดพลาด' },
  '67': { label: 'บทเรียนการบริหารทรัพยากร', tone: 'balance', meaning: 'มักทุ่มเทเพื่อคนอื่นและแบกรับภาระแทน แนะนำให้ตั้งงบการเงินและขอบเขตการช่วยเหลือให้สมดุล' },
  '76': { label: 'บทเรียนการบริหารทรัพยากร', tone: 'balance', meaning: 'ใส่ใจความรับผิดชอบสูง ควรจัดสรรเงินออมอัตโนมัติและแบ่งเวลาดูแลความสุขของตนเอง' },
  '07': { label: 'ความละเอียดและคิดรอบด้าน', tone: 'balance', meaning: 'มักคิดเผื่อหลายสถานการณ์ แนะนำให้แยกเรื่องที่ควบคุมได้ออกจากเรื่องที่ควบคุมไม่ได้เพื่อลดความกังวล' },
  '70': { label: 'ความละเอียดและคิดรอบด้าน', tone: 'balance', meaning: 'ทำงานหนักและรอบคอบ ควรจัดตารางพักผ่อนอย่างสม่ำเสมอเพื่อให้ความคิดปลอดโปร่ง' },
};

export function interpretPair(pair) {
  if (PAIR_DICTIONARY[pair]) {
    return { pair, ...PAIR_DICTIONARY[pair] };
  }
  const [a, b] = pair.split('');
  const kwA = DIGIT_KEYWORDS[a] || '';
  const kwB = DIGIT_KEYWORDS[b] || '';
  const hasZero = a === '0' || b === '0';
  return {
    pair,
    label: hasZero ? 'พลังอิสระและการปรับสมดุล' : 'พลังผสานสองมิติ',
    tone: hasZero ? 'balance' : 'good',
    meaning: `ผสานระหว่าง${kwA}กับ${kwB} แนะนำให้ดึงจุดแข็งของทั้งสองด้านมาวางแผนใช้งานให้เหมาะกับเป้าหมาย`,
  };
}

export function interpretTotalSum(sum) {
  const reduced = reduceToSingleDigit(sum);
  const specialSums = {
    14: 'สติปัญญาดีเยี่ยม สื่อสารชัดเจน เหมาะกับการเจรจาและการวางแผนระยะยาว',
    15: 'มีเสน่ห์และความน่าเชื่อถือ ผู้ใหญ่เมตตา ชีวิตเติบโตอย่างสมดุล',
    19: 'โดดเด่นด้านภาวะผู้นำและความสำเร็จจากการลงมือทำอย่างมีวิสัยทัศน์',
    24: 'เมตตามหานิยม เจรจาราบรื่น เหมาะกับงานบริการ การค้า และการทำงานร่วมกับผู้อื่น',
    36: 'พลังความขยันผสานเสน่ห์ สร้างโอกาสทางการงานและการเงินได้ดี',
    41: 'ความคิดเป็นระบบ ฉลาดสื่อสาร เหมาะกับงานบริหารและสายวิชาชีพเฉพาะทาง',
    42: 'อ่อนโยน มีมนุษยสัมพันธ์ดี ได้รับความร่วมมือและมิตรภาพที่ดี',
    45: 'ปัญญาและโชคจากการเรียนรู้ เติบโตอย่างมั่นคง มีที่ปรึกษาที่ดีคอยเกื้อหนุน',
    46: 'การสื่อสารสร้างรายได้ ชีวิตรื่นรมย์ มีความคิดสร้างสรรค์และเพื่อนฝูงดี',
    50: 'ใฝ่รู้ มีวิสัยทัศน์กว้างไกล เหมาะกับงานต่างประเทศ เทคโนโลยี หรือการเรียนรู้เชิงลึก',
    51: 'สุขุม มีเหตุผลและคุณธรรม สร้างความไว้วางใจในระยะยาวได้ดี',
    54: 'สติปัญญาและไหวพริบดีเยี่ยม แก้ปัญหาเฉพาะหน้าได้อย่างมีหลักการ',
    55: 'ชีวิตสมดุล ใจเย็น มีความสุขกับความก้าวหน้าที่มั่นคงและยั่งยืน',
    56: 'ปัญญาคู่ทรัพย์ บริหารการงานและการเงินได้อย่างลงตัว',
    59: 'มีวิสัยทัศน์สูง เข้าใจชีวิตอย่างลึกซึ้ง เหมาะกับการเป็นผู้นำหรือผู้ให้คำปรึกษา',
    63: 'มีความกระตือรือร้นและเสน่ห์ ดึงดูดโอกาสที่ดีทั้งเรื่องงานและความสัมพันธ์',
    64: 'พูดจาดี มีรสนิยม คล่องตัวทางการเงินและสังคม',
    65: 'ความมั่นคงทางการเงินควบคู่สติปัญญา รู้จักวางแผนอนาคตอย่างรอบคอบ',
  };

  if (specialSums[sum]) {
    return {
      sum,
      reduced,
      title: `ผลรวม ${sum} (เลขรากฐาน ${reduced})`,
      description: specialSums[sum],
    };
  }

  const rootDescriptions = {
    1: 'เด่นเรื่องการเริ่มต้น ภาวะผู้นำ และความเชื่อมั่นในตนเอง เหมาะกับการวางเป้าหมายที่ชัดเจน',
    2: 'เด่นเรื่องความร่วมมือ การสื่อสารที่อ่อนโยน และการสร้างความสัมพันธ์ที่ดี',
    3: 'เด่นเรื่องความกระตือรือร้น พลังงานสูง และการลงมือปฏิบัติให้เห็นผลเร็ว',
    4: 'เด่นเรื่องการสื่อสาร ข้อมูล ไหวพริบ และการจัดระบบการทำงานให้มีประสิทธิภาพ',
    5: 'เด่นเรื่องสติปัญญา เหตุผล ความน่าเชื่อถือ และการเติบโตอย่างมีหลักการ',
    6: 'เด่นเรื่องสุนทรียภาพ การเงิน ความสัมพันธ์ และการสร้างคุณภาพชีวิตที่ดี',
    7: 'เด่นเรื่องความอดทน วินัย และความเชี่ยวชาญระยะยาว ควรจัดสมดุลเวลาพักผ่อนควบคู่',
    8: 'เด่นเรื่องวิสัยทัศน์ทางธุรกิจ การบริหารเครือข่าย และความกล้าคิดการใหญ่',
    9: 'เด่นเรื่องความคิดสร้างสรรค์ นวัตกรรม และมุมมองที่ก้าวทันความเปลี่ยนแปลง',
  };

  return {
    sum,
    reduced,
    title: `ผลรวม ${sum} (เลขรากฐาน ${reduced})`,
    description: rootDescriptions[reduced] || 'มีเอกลักษณ์เฉพาะตัว แนะนำให้ใช้สติและการวางแผนควบคู่ในการตัดสินใจ',
  };
}

export function reduceToSingleDigit(num) {
  let n = Math.abs(Number(num) || 0);
  while (n > 9) {
    n = String(n)
      .split('')
      .map(Number)
      .reduce((acc, d) => acc + d, 0);
  }
  return n;
}

export function extractPairs(digitString) {
  const pairs = [];
  for (let i = 0; i < digitString.length - 1; i++) {
    pairs.push(digitString.slice(i, i + 2));
  }
  return pairs;
}

export function analyzePhoneNumber(rawInput) {
  const digits = (rawInput || '').replace(/\D/g, '');
  if (digits.length < 4) {
    return null;
  }

  const prefix = digits.length >= 10 ? digits.slice(0, digits.length - 7) : '';
  const core7 = digits.length >= 7 ? digits.slice(-7) : digits;
  const pairsRaw = extractPairs(core7);
  const pairs = pairsRaw.map(interpretPair);

  const totalSumAll = digits.split('').reduce((acc, d) => acc + Number(d), 0);
  const totalSumCore7 = core7.split('').reduce((acc, d) => acc + Number(d), 0);

  const sumSummary = interpretTotalSum(totalSumAll);
  const core7Summary = interpretTotalSum(totalSumCore7);

  const formatted =
    digits.length === 10
      ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
      : digits;

  return {
    type: 'phone',
    rawInput: rawInput.trim(),
    formatted,
    digits,
    prefix,
    core7,
    pairs,
    totalSumAll,
    totalSumCore7,
    sumSummary,
    core7Summary,
  };
}

export function analyzeLicensePlate(rawInput) {
  const cleaned = (rawInput || '').trim().replace(/\s+/g, ' ');
  const digits = cleaned.replace(/\D/g, '');
  if (!cleaned || digits.length === 0) {
    return null;
  }

  const charBreakdown = [];
  let letterSum = 0;
  let digitSum = 0;

  for (const ch of cleaned) {
    if (/[0-9]/.test(ch)) {
      const val = Number(ch);
      digitSum += val;
      charBreakdown.push({ char: ch, value: val, kind: 'digit' });
    } else if (THAI_CHAR_VALUES[ch] !== undefined) {
      const val = THAI_CHAR_VALUES[ch];
      letterSum += val;
      charBreakdown.push({ char: ch, value: val, kind: 'thai' });
    }
  }

  const totalSumAll = letterSum + digitSum;
  // แยกคู่เลขจากเฉพาะกลุ่มตัวเลขท้ายทะเบียน (เช่น 4569 จาก 1กข 4569)
  const trailingNumberMatch = cleaned.match(/(\d+)\s*$/);
  const mainDigits = trailingNumberMatch ? trailingNumberMatch[1] : digits;
  const pairs = extractPairs(mainDigits).map(interpretPair);

  const sumSummary = interpretTotalSum(totalSumAll);
  const digitSumSummary = interpretTotalSum(digitSum);

  return {
    type: 'plate',
    rawInput: cleaned,
    formatted: cleaned,
    digits,
    mainDigits,
    charBreakdown,
    letterSum,
    digitSum,
    totalSumAll,
    pairs,
    sumSummary,
    digitSumSummary,
  };
}

export function generateNumerologyLineSummary(result) {
  if (!result) return '';
  const pairText = result.pairs.length
    ? result.pairs.map((p) => `${p.pair} (${p.label})`).join(', ')
    : 'ไม่มีคู่เลข';

  if (result.type === 'phone') {
    return [
      `สรุปวิเคราะห์เลขศาสตร์เบอร์โทรศัพท์ (Astro & Numerology Advisor)`,
      `เบอร์โทร: ${result.formatted}`,
      `7 ตัวท้ายเด่น: ${result.core7}`,
      `คู่เลขเด่น: ${pairText}`,
      `ผลรวมทั้งหมด (10 หลัก): ${result.totalSumAll} — ${result.sumSummary.description}`,
      `ผลรวม 7 ตัวท้าย: ${result.totalSumCore7} — ${result.core7Summary.description}`,
      ``,
      `ข้อแนะนำเชิงจิตวิทยา: ตัวเลขเป็นเครื่องเตือนใจถึงจุดแข็งและจุดที่ควรจัดสมดุล ผลลัพธ์ที่ดีที่สุดเกิดจากการวางแผนและการลงมือทำจริงควบคู่กัน`,
    ].join('\n');
  }

  return [
    `สรุปวิเคราะห์เลขศาสตร์ทะเบียนรถ (Astro & Numerology Advisor)`,
    `ทะเบียนรถ: ${result.formatted}`,
    `ผลรวมเฉพาะตัวเลข: ${result.digitSum} (${result.digitSumSummary.title})`,
    `ผลรวมอักษรและตัวเลขทั้งหมด: ${result.totalSumAll} — ${result.sumSummary.description}`,
    `คู่เลขเด่น (${result.mainDigits}): ${pairText}`,
    ``,
    `ข้อแนะนำเชิงจิตวิทยา: ขับขี่อย่างมีสติ ตรวจเช็กความพร้อมของรถสม่ำเสมอ และใช้ความหมายดีๆ ของเลขเป็นกำลังใจในการเดินทาง`,
  ].join('\n');
}

export const BALANCE_DIMENSIONS = [
  { key: 'career', label: 'การงานและภาวะผู้นำ', shortLabel: 'การงาน' },
  { key: 'finance', label: 'การเงินและทรัพย์สิน', shortLabel: 'การเงิน' },
  { key: 'communication', label: 'การสื่อสารและเจรจา', shortLabel: 'การสื่อสาร' },
  { key: 'relationship', label: 'ความสัมพันธ์และเสน่ห์', shortLabel: 'ความสัมพันธ์' },
  { key: 'mindfulness', label: 'สติและการบริหารสมดุล', shortLabel: 'สติ-สมดุล' },
];

const DIGIT_WEIGHTS = {
  '0': { career: 4, finance: 3, communication: 5, relationship: 4, mindfulness: 8 },
  '1': { career: 14, finance: 8, communication: 8, relationship: 6, mindfulness: 8 },
  '2': { career: 7, finance: 9, communication: 12, relationship: 14, mindfulness: 9 },
  '3': { career: 13, finance: 9, communication: 8, relationship: 8, mindfulness: 6 },
  '4': { career: 10, finance: 10, communication: 15, relationship: 10, mindfulness: 10 },
  '5': { career: 12, finance: 11, communication: 11, relationship: 10, mindfulness: 15 },
  '6': { career: 8, finance: 15, communication: 10, relationship: 15, mindfulness: 10 },
  '7': { career: 11, finance: 10, communication: 6, relationship: 6, mindfulness: 11 },
  '8': { career: 13, finance: 14, communication: 10, relationship: 8, mindfulness: 7 },
  '9': { career: 11, finance: 10, communication: 12, relationship: 9, mindfulness: 14 },
};

const PAIR_BONUS = {
  career: new Set(['15', '51', '19', '91', '35', '53', '78', '87', '89', '98', '39', '93', '14', '41']),
  finance: new Set(['16', '61', '26', '62', '36', '63', '46', '64', '56', '65', '66', '69', '96', '28', '82', '78', '87']),
  communication: new Set(['14', '41', '24', '42', '45', '54', '46', '64', '49', '94', '26', '62']),
  relationship: new Set(['24', '42', '26', '62', '36', '63', '56', '65', '66', '29', '92', '23', '32']),
  mindfulness: new Set(['15', '51', '45', '54', '55', '56', '65', '59', '95', '49', '94', '79', '97']),
};

export function computeNumerologyBalance(result) {
  if (!result) return null;

  const targetDigits = result.type === 'phone' ? result.core7 : result.mainDigits || result.digits;
  const digitArr = (targetDigits || '').split('').filter((d) => DIGIT_WEIGHTS[d]);
  const count = Math.max(1, digitArr.length);

  const scores = {
    career: 45,
    finance: 45,
    communication: 45,
    relationship: 45,
    mindfulness: 45,
  };

  for (const key of Object.keys(scores)) {
    const avgWeight =
      digitArr.reduce((acc, d) => acc + (DIGIT_WEIGHTS[d]?.[key] || 8), 0) / count;
    scores[key] = Math.round(35 + avgWeight * 3.1);
  }

  // Pair harmony adjustments
  for (const p of result.pairs || []) {
    for (const key of Object.keys(PAIR_BONUS)) {
      if (PAIR_BONUS[key].has(p.pair)) {
        scores[key] += 8;
      }
    }
    if (p.tone === 'balance') {
      scores.mindfulness += 4; // Remind self-awareness rather than penalizing harshly
    }
  }

  // Clamp 35..98 for balanced, realistic visual presentation
  for (const key of Object.keys(scores)) {
    scores[key] = Math.max(35, Math.min(98, scores[key]));
  }

  const overall = Math.round(
    (scores.career +
      scores.finance +
      scores.communication +
      scores.relationship +
      scores.mindfulness) /
      5
  );

  const topDim = BALANCE_DIMENSIONS.reduce((best, dim) =>
    scores[dim.key] > scores[best.key] ? dim : best
  );

  return {
    scores,
    overall,
    topDimension: topDim,
  };
}

export function generateCompareLineSummary(resultA, resultB) {
  if (!resultA || !resultB) return '';
  const balA = computeNumerologyBalance(resultA);
  const balB = computeNumerologyBalance(resultB);
  const typeLabel = resultA.type === 'phone' ? 'เบอร์โทรศัพท์' : 'เลขทะเบียนรถ';

  return [
    `สรุปเปรียบเทียบเลขศาสตร์${typeLabel} A vs B (Astro & Numerology Advisor)`,
    ``,
    `ตัวเลือก A: ${resultA.formatted}`,
    `ผลรวม: ${resultA.totalSumAll} | คะแนนสมดุลเฉลี่ย: ${balA.overall}/100`,
    `จุดเด่นหลัก: ${balA.topDimension.label} (${balA.scores[balA.topDimension.key]}/100)`,
    `คู่เลข: ${resultA.pairs.map((p) => p.pair).join(', ') || '-'}`,
    ``,
    `ตัวเลือก B: ${resultB.formatted}`,
    `ผลรวม: ${resultB.totalSumAll} | คะแนนสมดุลเฉลี่ย: ${balB.overall}/100`,
    `จุดเด่นหลัก: ${balB.topDimension.label} (${balB.scores[balB.topDimension.key]}/100)`,
    `คู่เลข: ${resultB.pairs.map((p) => p.pair).join(', ') || '-'}`,
    ``,
    `แนวทางตัดสินใจ: เลือกชุดตัวเลขที่สอดคล้องกับเป้าหมายชีวิตหรือสายงานในช่วงนี้มากที่สุด โดยใช้เป็นกำลังใจควบคู่กับการวางแผนลงมือทำจริง`,
  ].join('\n');
}
