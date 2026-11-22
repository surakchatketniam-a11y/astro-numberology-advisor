import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Compass,
  Flame,
  Loader2,
  MapPin,
  Scale,
  Sparkles,
  Sun,
  AlertCircle,
} from 'lucide-react';
import {
  THAI_MONTHS,
  calculateZodiacComparison,
  generateZodiacLineSummary,
} from '../utils/zodiac';
import { callGeminiAdvisor } from '../services/gemini';
import FormattedAnalysis from './FormattedAnalysis';
import LineShareBox from './LineShareBox';

const ELEMENT_BADGE = {
  Fire: 'bg-orange-500/15 text-orange-300 border-orange-400/30',
  Earth: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  Air: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  Water: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
};

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

  const handleDeepAnalyze = async () => {
    if (!result) return;
    if (!settings.apiKey) {
      onOpenSettings();
      return;
    }

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
      setAiError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini API');
    } finally {
      setLoadingAI(false);
    }
  };

  const offlineLineSummary = result ? generateZodiacLineSummary(result) : '';

  return (
    <div className="space-y-5">
      {/* Input Card */}
      <form onSubmit={handleCalculate} className="glass-card rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-amber-200 flex items-center gap-2">
              <Compass className="h-5 w-5 text-amber-400" />
              เปรียบเทียบราศีไทย &amp; สากล
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              คำนวณทันทีแบบออฟไลน์ เทียบโหราศาสตร์ไทย (กลางเดือน) กับสากล (19–23 ของเดือน)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-amber-400" /> วันที่
            </label>
            <select
              value={safeDay}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400/70 focus:outline-none px-3 py-2.5 text-sm text-slate-100"
            >
              {Array.from({ length: maxDayInMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} className="bg-slate-900">
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">เดือนเกิด</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400/70 focus:outline-none px-3 py-2.5 text-sm text-slate-100"
            >
              {THAI_MONTHS.map((mName, idx) => (
                <option key={mName} value={idx + 1} className="bg-slate-900">
                  {mName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">ปีเกิด (พ.ศ.)</label>
            <select
              value={yearAD}
              onChange={(e) => setYearAD(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400/70 focus:outline-none px-3 py-2.5 text-sm text-slate-100"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-slate-900">
                  {y + 543} ({y})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional fields for deeper AI analysis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" /> เวลาเกิด (ไม่บังคับ — ใช้เสริมวิเคราะห์ AI)
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-amber-400/70 focus:outline-none px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> จังหวัดที่เกิด (ไม่บังคับ)
            </label>
            <input
              type="text"
              value={birthProvince}
              onChange={(e) => setBirthProvince(e.target.value)}
              placeholder="เช่น กรุงเทพมหานคร, เชียงใหม่"
              className="w-full rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-amber-400/70 focus:outline-none px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="gold-button w-full rounded-xl py-3 px-4 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          คำนวณเปรียบเทียบราศีทันที
        </button>
      </form>

      {/* Instant Client-side Comparison Result */}
      {result && (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="glass-card-subtle rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 font-medium">
                {result.dayOfWeek.name}
              </span>
              <span className="text-slate-300">{result.formattedDateTH}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">เลขรหัสชีวิต:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-amber-500/30 text-amber-300 font-semibold">
                {result.lifePathNumber}
              </span>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thai Sidereal Card */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3 border-amber-500/30">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-amber-400/90 font-medium">
                    โหราศาสตร์ไทย (Thai Sidereal)
                  </span>
                  <h3 className="text-xl font-bold text-slate-50 mt-0.5">
                    {result.thaiSign.thName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ช่วงวันที่: {result.thaiSign.thaiRange}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    ELEMENT_BADGE[result.thaiSign.elementEn]
                  }`}
                >
                  {result.thaiSign.element}
                </span>
              </div>

              <div className="rounded-xl bg-slate-900/75 border border-slate-800 px-3 py-2 text-xs flex items-center justify-between">
                <span className="text-slate-400">ดาวประจำตัว</span>
                <span className="text-amber-200 font-medium">{result.thaiSign.thaiRuler}</span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
                <div>
                  <p className="text-amber-300/90 font-medium text-xs mb-0.5">จุดเด่นเชิงจิตวิทยา</p>
                  <p className="text-slate-200">{result.thaiSign.psychology}</p>
                </div>
                <div className="pt-1 border-t border-slate-800/80">
                  <p className="text-emerald-300/90 font-medium text-xs mb-0.5">แนวทางพัฒนาตนเอง</p>
                  <p className="text-slate-300">{result.thaiSign.growthTip}</p>
                </div>
              </div>
            </div>

            {/* Western Tropical Card */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3 border-sky-400/25">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-sky-400 font-medium">
                    โหราศาสตร์สากล (Western Tropical)
                  </span>
                  <h3 className="text-xl font-bold text-slate-50 mt-0.5">
                    {result.westernSign.thName} ({result.westernSign.enName})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ช่วงวันที่: {result.westernSign.westernRange}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    ELEMENT_BADGE[result.westernSign.elementEn]
                  }`}
                >
                  {result.westernSign.element}
                </span>
              </div>

              <div className="rounded-xl bg-slate-900/75 border border-slate-800 px-3 py-2 text-xs flex items-center justify-between">
                <span className="text-slate-400">ดาวประจำตัว</span>
                <span className="text-sky-200 font-medium">{result.westernSign.westernRuler}</span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
                <div>
                  <p className="text-sky-300/90 font-medium text-xs mb-0.5">จุดเด่นเชิงจิตวิทยา</p>
                  <p className="text-slate-200">{result.westernSign.psychology}</p>
                </div>
                <div className="pt-1 border-t border-slate-800/80">
                  <p className="text-emerald-300/90 font-medium text-xs mb-0.5">แนวทางพัฒนาตนเอง</p>
                  <p className="text-slate-300">{result.westernSign.growthTip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Note */}
          <div className="rounded-2xl bg-slate-900/80 border border-amber-500/20 p-4 flex items-start gap-3">
            <Scale className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p className="font-semibold text-amber-200 mb-1">
                {result.isSameSign
                  ? 'ทั้งสองระบบตรงกัน — พลังธาตุชัดเจน'
                  : 'มุมมองเปรียบเทียบ 2 ระบบ (ไทย vs สากล)'}
              </p>
              <p>{result.comparisonNote}</p>
            </div>
          </div>

          {/* Deep AI Analysis Trigger */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                ต่อยอดวิเคราะห์เชิงลึกด้วย Gemini AI
              </h3>
            </div>
            <input
              type="text"
              value={focusTopic}
              onChange={(e) => setFocusTopic(e.target.value)}
              placeholder="คำถามเพิ่มเติม (ไม่บังคับ) เช่น อยากวางแผนเปลี่ยนงานช่วงครึ่งปีหลัง หรือบริหารการเงิน"
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400/70 focus:outline-none px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={handleDeepAnalyze}
              disabled={loadingAI}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-400/40 text-amber-200 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
            >
              {loadingAI ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังวิเคราะห์เชิงลึกด้วย {settings.model}...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {settings.apiKey
                    ? `วิเคราะห์เชิงลึกด้วย AI (${settings.model})`
                    : 'ตั้งค่า Gemini API Key เพื่อวิเคราะห์เชิงลึก'}
                </>
              )}
            </button>

            {aiError && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
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
            text={aiResult ? aiResult.lineSummary : offlineLineSummary}
            title={
              aiResult
                ? 'ข้อความสรุปจาก AI สำหรับส่งต่อใน LINE'
                : 'ข้อความสรุปผลเบื้องต้นสำหรับส่งต่อใน LINE'
            }
          />
        </div>
      )}
    </div>
  );
}
