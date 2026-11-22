import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Compass,
  Loader2,
  MapPin,
  Scale,
  Sparkles,
  Square,
  Sun,
  AlertCircle,
} from 'lucide-react';
import {
  THAI_MONTHS,
  calculateZodiacComparison,
  generateZodiacLineSummary,
} from '../utils/zodiac';
import { callGeminiAdvisor } from '../services/gemini';
import { PROVINCE_NAMES } from '../utils/provinces';
import { formatDegree } from '../utils/ephemeris';
import FormattedAnalysis from './FormattedAnalysis';

function PositionRows({ chart, accent }) {
  const rows = [
    ['อาทิตย์', chart.sun],
    ['จันทร์', chart.moon],
    ['ลัคนา', chart.asc],
  ].filter(([, body]) => body);
  return (
    <div className="bg-black border border-[#333333] divide-y divide-[#202020] text-sm">
      {rows.map(([label, body]) => (
        <div key={label} className="px-4 py-2.5 flex items-center justify-between gap-3">
          <span className="text-[#7D7D7D]">{label}</span>
          <span className="text-white font-medium text-right">
            <span className={accent}>{body.sign.thName}</span> {formatDegree(body.degreeInSign)}
            {body.uncertain && <span className="text-[#7D7D7D] font-normal"> (โดยประมาณ)</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
import LineShareBox from './LineShareBox';

function positionText(chart) {
  return [
    ['อาทิตย์', chart.sun],
    ['จันทร์', chart.moon],
    ['ลัคนา', chart.asc],
  ]
    .filter(([, b]) => b)
    .map(([label, b]) => `${label}${b.sign.thName} ${formatDegree(b.degreeInSign)}`)
    .join(', ');
}

export default function ZodiacTab({
  settings,
  onOpenSettings,
  onSaveHistory,
  onZodiacComputed,
}) {
  const currentYearAD = new Date().getFullYear();
  const [day, setDay] = useState(15);
  const [month, setMonth] = useState(4);
  const [yearAD, setYearAD] = useState(1995);
  const [birthTime, setBirthTime] = useState('');
  const [birthProvince, setBirthProvince] = useState('');
  const [focusTopic, setFocusTopic] = useState('');

  const [result, setResult] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  const years = useMemo(() => {
    const list = [];
    for (let y = currentYearAD; y >= 1935; y--) {
      list.push(y);
    }
    return list;
  }, [currentYearAD]);

  const maxDayInMonth = useMemo(() => {
    return new Date(yearAD, month, 0).getDate();
  }, [yearAD, month]);

  const safeDay = Math.min(day, maxDayInMonth);

  const handleCalculate = (e) => {
    e.preventDefault();
    const computed = calculateZodiacComparison({
      day: safeDay,
      month,
      yearAD,
      birthTime: birthTime.trim(),
      birthProvince: birthProvince.trim(),
    });
    setResult(computed);
    setAiResult(null);
    setAiError('');
    if (onZodiacComputed) onZodiacComputed(computed);

    const offlineSummary = generateZodiacLineSummary(computed);
    onSaveHistory({
      category: 'zodiac',
      isAI: false,
      title: `${computed.formattedDateTH} — ไทย: ${computed.thaiSign.thName} / สากล: ${computed.westernSign.thName}`,
      subtitle: `${computed.dayOfWeek.name} • เลขรหัสชีวิต ${computed.lifePathNumber}`,
      lineSummary: offlineSummary,
    });
  };

  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleStop = () => abortRef.current?.abort();

  const handleDeepAnalyze = async () => {
    if (!result) return;
    if (!settings.apiKey) {
      onOpenSettings();
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoadingAI(true);
    setAiError('');
    try {
      const prompt = [
        `กรุณาวิเคราะห์ดวงชะตาและบุคลิกภาพเชิงเปรียบเทียบให้ผู้ใช้ท่านนี้:`,
        `- วัน/เดือน/ปีเกิด: ${result.formattedDateTH} (${result.dayOfWeek.name})`,
        result.birthTime ? `- เวลาเกิด: ${result.birthTime} น.` : `- เวลาเกิด: ไม่ระบุ`,
        result.birthProvince ? `- จังหวัดที่เกิด: ${result.birthProvince}` : `- จังหวัดที่เกิด: ไม่ระบุ`,
        `- โหราศาสตร์ไทย (นิรายนะวิธี): ${result.thaiSign.thName} (${result.thaiSign.element}, ดาวประจำตัว: ${result.thaiSign.thaiRuler})`,
        `- โหราศาสตร์สากล (สายนะวิธี): ${result.westernSign.thName} / ${result.westernSign.enName} (${result.westernSign.element}, ดาวประจำตัว: ${result.westernSign.westernRuler})`,
        `- ตำแหน่งดาวจริง (นิรายนะ Lahiri ${result.ayanamsa.toFixed(2)}°): ${positionText(result.thai)}`,
        `- ตำแหน่งดาวจริง (สายนะ): ${positionText(result.western)}`,
        result.thaiAscRuler ? `- ตนุลัคน์ (เจ้าเรือนลัคนาไทย): ${result.thaiAscRuler}` : '',
        result.notes.length ? `- ข้อจำกัดของข้อมูล: ${result.notes.join(' / ')}` : '',
        `- เลขรหัสชีวิต (Life Path Number): ${result.lifePathNumber}`,
        focusTopic.trim() ? `- ประเด็นที่ผู้ใช้อยากปรึกษาเป็นพิเศษ: ${focusTopic.trim()}` : '',
        ``,
        `ขอให้วิเคราะห์เปรียบเทียบจุดร่วมและจุดต่างระหว่างราศีไทยกับราศีสากล เชื่อมโยงเข้ากับหลักจิตวิทยา (Self-Awareness และ Risk Management) และให้แนวทางวางแผนชีวิตที่ลงมือทำได้จริง (Actionable Advice) พร้อมปิดท้ายด้วยข้อความสรุปสำหรับส่งต่อใน LINE`,
      ]
        .filter(Boolean)
        .join('\n');

      const response = await callGeminiAdvisor({
        apiKey: settings.apiKey,
        model: settings.model,
        prompt,
        onPartial: setAiResult,
        signal: controller.signal,
      });

      setAiResult(response);
      onSaveHistory({
        category: 'zodiac',
        isAI: true,
        title: `วิเคราะห์เชิงลึก: ${result.thaiSign.thName} (ไทย) vs ${result.westernSign.thName} (สากล)`,
        subtitle: result.formattedDateTH,
        analysis: response.analysis,
        lineSummary: response.lineSummary,
      });
    } catch (err) {
      setAiResult(null);
      if (controller.signal.aborted) return; // ผู้ใช้กดหยุดเอง
      setAiError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini API');
    } finally {
      setLoadingAI(false);
    }
  };

  const offlineLineSummary = result ? generateZodiacLineSummary(result) : '';

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <form onSubmit={handleCalculate} className="lambo-panel p-5 sm:p-8 space-y-6">
        <div className="border-b border-[#333333] pb-4">
          <p className="font-display-latin text-xs text-[#FFC000] tracking-[0.225px] mb-1">
            ZODIAC COMPARISON ENGINE
          </p>
          <h2 className="text-xl sm:text-2xl font-medium text-white flex items-center gap-2.5">
            <Compass className="h-5 w-5 text-[#FFC000] shrink-0" />
            เปรียบเทียบราศีไทยและสากล
          </h2>
          <p className="text-sm sm:text-base text-[#7D7D7D] mt-1">
            คำนวณจากตำแหน่งดาวจริงแบบออฟไลน์ เทียบโหราศาสตร์ไทย (นิรายนะ Lahiri) กับสากล (สายนะ)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-[#a6a6a6] mb-2 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#FFC000]" /> วันที่
            </label>
            <select
              value={safeDay}
              onChange={(e) => setDay(Number(e.target.value))}
              className="lambo-input"
            >
              {Array.from({ length: maxDayInMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} className="bg-black text-white">
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#a6a6a6] mb-2">เดือนเกิด</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="lambo-input"
            >
              {THAI_MONTHS.map((mName, idx) => (
                <option key={mName} value={idx + 1} className="bg-black text-white">
                  {mName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#a6a6a6] mb-2">ปีเกิด (พ.ศ.)</label>
            <select
              value={yearAD}
              onChange={(e) => setYearAD(Number(e.target.value))}
              className="lambo-input"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-black text-white">
                  {y + 543} ({y})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-sm text-[#7D7D7D] mb-2 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#7D7D7D]" /> เวลาเกิด (ไม่บังคับ — ใช้คำนวณจันทร์และลัคนา)
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="lambo-input"
            />
          </div>

          <div>
            <label className="block text-sm text-[#7D7D7D] mb-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#7D7D7D]" /> จังหวัดที่เกิด (ไม่บังคับ — ใช้คำนวณลัคนา)
            </label>
            <input
              type="text"
              value={birthProvince}
              onChange={(e) => setBirthProvince(e.target.value)}
              placeholder="เช่น กรุงเทพมหานคร, เชียงใหม่"
              list="th-province-list"
              className="lambo-input"
            />
            <datalist id="th-province-list">
              {PROVINCE_NAMES.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>
        </div>

        <button
          type="submit"
          className="lambo-btn-gold w-full px-6 py-4 text-base flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          คำนวณเปรียบเทียบราศีทันที
        </button>
      </form>

      {/* Instant Client-side Comparison Result */}
      {result && (
        <div className="space-y-6">
          {/* Summary Strip */}
          <div className="lambo-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="lambo-badge bg-[#2e2300] border border-[#594300] text-[#FFC000]">
                {result.dayOfWeek.name}
              </span>
              <span className="text-base text-white font-medium">{result.formattedDateTH}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm text-[#7D7D7D]">เลขรหัสชีวิต</span>
              <span className="px-3 py-1 bg-black border border-[#FFC000] text-[#FFC000] font-semibold text-base">
                {result.lifePathNumber}
              </span>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thai Sidereal Card */}
            <div className="lambo-card border-t-2 border-t-[#FFC000] p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display-latin text-[11px] text-[#FFCE3E] tracking-[0.225px]">
                    THAI SIDEREAL
                  </p>
                  <h3 className="text-2xl font-medium text-white mt-1">
                    {result.thaiSign.thName}
                  </h3>
                  <p className="text-sm text-[#7D7D7D] mt-0.5">
                    ช่วงวันที่โดยประมาณ: {result.thaiSign.thaiRange}
                  </p>
                </div>
                <span className="lambo-badge bg-black border border-[#494949] text-[#FFCE3E]">
                  {result.thaiSign.element}
                </span>
              </div>

              <PositionRows chart={result.thai} accent="text-[#FFCE3E]" />

              <div className="bg-black border border-[#333333] divide-y divide-[#202020] text-sm">
                <div className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <span className="text-[#7D7D7D]">ดาวประจำราศีเกิด</span>
                  <span className="text-white font-medium">{result.thaiSign.thaiRuler}</span>
                </div>
                {result.thaiAscRuler && (
                  <div className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <span className="text-[#7D7D7D]">ตนุลัคน์ (เจ้าเรือนลัคนา)</span>
                    <span className="text-white font-medium">{result.thaiAscRuler}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-base leading-[1.7]">
                <div>
                  <p className="text-xs font-medium text-[#FFCE3E] mb-1">จุดเด่นเชิงจิตวิทยา</p>
                  <p className="text-[#F5F5F5]">{result.thaiSign.psychology}</p>
                </div>
                <div className="pt-3 border-t border-[#333333]">
                  <p className="text-xs font-medium text-[#a6a6a6] mb-1">แนวทางพัฒนาตนเอง</p>
                  <p className="text-[#a6a6a6]">{result.thaiSign.growthTip}</p>
                </div>
              </div>
            </div>

            {/* Western Tropical Card */}
            <div className="lambo-card border-t-2 border-t-[#29ABE2] p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display-latin text-[11px] text-[#29ABE2] tracking-[0.225px]">
                    WESTERN TROPICAL
                  </p>
                  <h3 className="text-2xl font-medium text-white mt-1">
                    {result.westernSign.thName} ({result.westernSign.enName})
                  </h3>
                  <p className="text-sm text-[#7D7D7D] mt-0.5">
                    ช่วงวันที่โดยประมาณ: {result.westernSign.westernRange}
                  </p>
                </div>
                <span className="lambo-badge bg-black border border-[#494949] text-[#29ABE2]">
                  {result.westernSign.element}
                </span>
              </div>

              <PositionRows chart={result.western} accent="text-[#29ABE2]" />

              <div className="bg-black border border-[#333333] divide-y divide-[#202020] text-sm">
                <div className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <span className="text-[#7D7D7D]">ดาวประจำราศีเกิด</span>
                  <span className="text-white font-medium">{result.westernSign.westernRuler}</span>
                </div>
                {result.westernAscRuler && (
                  <div className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <span className="text-[#7D7D7D]">ดาวประจำลัคนา</span>
                    <span className="text-white font-medium">{result.westernAscRuler}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-base leading-[1.7]">
                <div>
                  <p className="text-xs font-medium text-[#29ABE2] mb-1">จุดเด่นเชิงจิตวิทยา</p>
                  <p className="text-[#F5F5F5]">{result.westernSign.psychology}</p>
                </div>
                <div className="pt-3 border-t border-[#333333]">
                  <p className="text-xs font-medium text-[#a6a6a6] mb-1">แนวทางพัฒนาตนเอง</p>
                  <p className="text-[#a6a6a6]">{result.westernSign.growthTip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Note */}
          <div className="lambo-panel p-5 flex items-start gap-3.5">
            <Scale className="h-5 w-5 text-[#FFC000] shrink-0 mt-1" />
            <div className="text-base text-[#F5F5F5] leading-[1.7]">
              <p className="font-medium text-white mb-1">
                {result.isSameSign
                  ? 'ทั้งสองระบบตรงกัน — พลังธาตุชัดเจน'
                  : 'มุมมองเปรียบเทียบ 2 ระบบ (ไทย vs สากล)'}
              </p>
              <p className="text-[#a6a6a6]">{result.comparisonNote}</p>
              {result.notes.map((note) => (
                <p key={note} className="text-sm text-[#7D7D7D] mt-2">
                  * {note}
                </p>
              ))}
            </div>
          </div>

          {/* Deep AI Analysis Trigger */}
          <div className="lambo-panel p-5 sm:p-6 space-y-4">
            <div>
              <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px]">
                DEEP ADVISORY
              </p>
              <h3 className="text-base sm:text-lg font-medium text-white flex items-center gap-2 mt-0.5">
                <Sparkles className="h-4 w-4 text-[#FFC000]" />
                ต่อยอดวิเคราะห์เชิงลึกด้วย Gemini AI
              </h3>
            </div>
            <input
              type="text"
              value={focusTopic}
              onChange={(e) => setFocusTopic(e.target.value)}
              placeholder="คำถามเพิ่มเติม (ไม่บังคับ) เช่น อยากวางแผนเปลี่ยนงานช่วงครึ่งปีหลัง หรือบริหารการเงิน"
              className="lambo-input"
            />
            <button
              type="button"
              onClick={handleDeepAnalyze}
              disabled={loadingAI}
              className="lambo-btn-ghost w-full px-5 py-3.5 text-base font-medium flex items-center justify-center gap-2 cursor-pointer"
            >
              {loadingAI ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังวิเคราะห์เชิงลึกด้วย {settings.model}...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#FFC000]" />
                  {settings.apiKey
                    ? `วิเคราะห์เชิงลึกด้วย AI (${settings.model})`
                    : 'ตั้งค่า Gemini API Key เพื่อวิเคราะห์เชิงลึก'}
                </>
              )}
            </button>
            {loadingAI && (
              <button
                type="button"
                onClick={handleStop}
                className="lambo-btn-ghost w-full px-5 py-3 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <Square className="h-3.5 w-3.5 text-[#ff8a80]" />
                หยุดการวิเคราะห์
              </button>
            )}

            {aiError && (
              <div className="bg-[#291614] border border-[#59302d] p-4 text-sm text-[#ff8a80] flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}
          </div>

          {/* AI Analysis Output */}
          {aiResult && (
            <FormattedAnalysis content={aiResult.analysis} model={settings.model} />
          )}

          {/* LINE Share Box */}
          <LineShareBox
            text={aiResult && !aiResult.streaming ? aiResult.lineSummary : offlineLineSummary}
            title={
              aiResult && !aiResult.streaming
                ? 'ข้อความสรุปจาก AI สำหรับส่งต่อใน LINE'
                : 'ข้อความสรุปผลเบื้องต้นสำหรับส่งต่อใน LINE'
            }
          />
        </div>
      )}
    </div>
  );
}
