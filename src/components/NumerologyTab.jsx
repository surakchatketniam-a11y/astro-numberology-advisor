import React, { useState } from 'react';
import {
  AlertCircle,
  Car,
  Hash,
  Loader2,
  Phone,
  Sparkles,
} from 'lucide-react';
import {
  analyzeLicensePlate,
  analyzePhoneNumber,
  generateNumerologyLineSummary,
} from '../utils/numerology';
import { callGeminiAdvisor } from '../services/gemini';
import FormattedAnalysis from './FormattedAnalysis';
import LineShareBox from './LineShareBox';

const TONE_BADGE = {
  high: { label: 'พลังโดดเด่น', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' },
  good: { label: 'พลังส่งเสริม', cls: 'bg-sky-500/15 text-sky-300 border-sky-400/30' },
  balance: { label: 'จุดบริหารสมดุล', cls: 'bg-amber-500/15 text-amber-300 border-amber-400/30' },
};

export default function NumerologyTab({ settings, onOpenSettings, onSaveHistory }) {
  const [mode, setMode] = useState('phone'); // 'phone' | 'plate'
  const [inputValue, setInputValue] = useState('');
  const [userGoal, setUserGoal] = useState('');

  const [result, setResult] = useState(null);
  const [inputError, setInputError] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setInputValue('');
    setResult(null);
    setInputError('');
    setAiResult(null);
    setAiError('');
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    setInputError('');
    setAiResult(null);
    setAiError('');

    const computed =
      mode === 'phone'
        ? analyzePhoneNumber(inputValue)
        : analyzeLicensePlate(inputValue);

    if (!computed) {
      setResult(null);
      setInputError(
        mode === 'phone'
          ? 'กรุณากรอกเบอร์โทรศัพท์อย่างน้อย 4 หลัก (แนะนำ 10 หลัก เช่น 089-456-1595)'
          : 'กรุณากรอกเลขทะเบียนรถที่มีตัวเลข (เช่น 1กข 4569 หรือ กข 5959)'
      );
      return;
    }

    setResult(computed);
    const offlineSummary = generateNumerologyLineSummary(computed);
    onSaveHistory({
      category: 'numerology',
      isAI: false,
      title: `${mode === 'phone' ? 'เบอร์โทร' : 'ทะเบียนรถ'}: ${computed.formatted}`,
      subtitle: `ผลรวม ${computed.totalSumAll} • คู่เลข: ${computed.pairs.map((p) => p.pair).join(', ')}`,
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
      const pairList = result.pairs.map((p) => `${p.pair} (${p.label})`).join(', ');
      const prompt =
        result.type === 'phone'
          ? [
              `กรุณาวิเคราะห์เลขศาสตร์เบอร์โทรศัพท์เชิงลึก:`,
              `- เบอร์โทรศัพท์: ${result.formatted}`,
              `- เลข 7 ตัวท้ายเด่น: ${result.core7}`,
              `- คู่เลขเด่น (เรียงตามลำดับ): ${pairList}`,
              `- ผลรวมทั้งหมด (10 หลัก): ${result.totalSumAll} (เลขรากฐาน ${result.sumSummary.reduced})`,
              `- ผลรวม 7 ตัวท้าย: ${result.totalSumCore7}`,
              userGoal.trim() ? `- อาชีพหรือเป้าหมายของผู้ใช้: ${userGoal.trim()}` : '',
              ``,
              `ขอให้วิเคราะห์ภาพรวมของโครงสร้างตัวเลขอย่างมีเหตุผล ไม่ข่มขู่ เชื่อมโยงเข้ากับหลักจิตวิทยาการรับรู้ตนเองและพฤติกรรมการทำงาน พร้อมคำแนะนำที่นำไปปรับใช้ได้จริง (Actionable Advice) และสรุปข้อความสำหรับส่งต่อใน LINE`,
            ]
              .filter(Boolean)
              .join('\n')
          : [
              `กรุณาวิเคราะห์เลขศาสตร์ทะเบียนรถเชิงลึก:`,
              `- เลขทะเบียนรถ: ${result.formatted}`,
              `- ผลรวมเฉพาะตัวเลข: ${result.digitSum}`,
              `- ผลรวมอักษรไทยและตัวเลขทั้งหมด: ${result.totalSumAll} (เลขรากฐาน ${result.sumSummary.reduced})`,
              `- คู่เลขเด่น (${result.mainDigits}): ${pairList}`,
              userGoal.trim() ? `- ลักษณะการใช้งานรถ/อาชีพ: ${userGoal.trim()}` : '',
              ``,
              `ขอให้วิเคราะห์ความหมายอย่างมีเหตุผล ไม่สร้างความกลัว เชื่อมโยงกับการบริหารความเสี่ยงในการเดินทางและจิตวิทยาการใช้ชีวิต พร้อมแนวทางปฏิบัติจริง และสรุปข้อความสำหรับส่งต่อใน LINE`,
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
        category: 'numerology',
        isAI: true,
        title: `AI วิเคราะห์${result.type === 'phone' ? 'เบอร์โทร' : 'ทะเบียนรถ'}: ${result.formatted}`,
        subtitle: `ผลรวม ${result.totalSumAll}`,
        analysis: response.analysis,
        lineSummary: response.lineSummary,
      });
    } catch (err) {
      setAiError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini API');
    } finally {
      setLoadingAI(false);
    }
  };

  const offlineLineSummary = result ? generateNumerologyLineSummary(result) : '';

  return (
    <div className="space-y-5">
      {/* Input Card */}
      <form onSubmit={handleAnalyze} className="glass-card rounded-2xl p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-amber-200 flex items-center gap-2">
            <Hash className="h-5 w-5 text-amber-400" />
            วิเคราะห์เลขศาสตร์เบื้องต้น (Offline Instant)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            แยกคู่เลขเด่น คำนวณผลรวม และแปลความหมายเชิงจิตวิทยาได้ทันที
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
          <button
            type="button"
            onClick={() => handleModeChange('phone')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
              mode === 'phone'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="h-4 w-4" />
            เบอร์โทรศัพท์
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('plate')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
              mode === 'plate'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="h-4 w-4" />
            เลขทะเบียนรถ
          </button>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1.5">
            {mode === 'phone' ? 'กรอกเบอร์โทรศัพท์ (10 หลัก)' : 'กรอกเลขทะเบียนรถ (รองรับอักษรไทยและตัวเลข)'}
          </label>
          <input
            type={mode === 'phone' ? 'tel' : 'text'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={mode === 'phone' ? 'เช่น 089-456-1595' : 'เช่น 1กข 4569 หรือ กท 5959'}
            className="w-full rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400/70 focus:outline-none px-4 py-3 text-base sm:text-lg tracking-wider text-slate-100 placeholder:text-slate-500 placeholder:tracking-normal placeholder:text-sm"
          />
          {inputError && (
            <p className="mt-1.5 text-xs text-rose-300 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {inputError}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="gold-button w-full rounded-xl py-3 px-4 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
        >
          <Hash className="h-4 w-4" />
          วิเคราะห์คู่เลขและผลรวมทันที
        </button>
      </form>

      {/* Instant Results */}
      {result && (
        <div className="space-y-4">
          {/* Number Breakdown & Sums */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <p className="text-xs text-slate-400">
                  {result.type === 'phone' ? 'เบอร์โทรศัพท์ที่วิเคราะห์' : 'เลขทะเบียนรถที่วิเคราะห์'}
                </p>
                <p className="text-xl sm:text-2xl font-bold tracking-wider text-amber-200 mt-0.5">
                  {result.type === 'phone' && result.prefix ? (
                    <>
                      <span className="text-slate-500">{result.prefix}-</span>
                      <span>{result.core7.slice(0, 3)}-{result.core7.slice(3)}</span>
                    </>
                  ) : (
                    result.formatted
                  )}
                </p>
              </div>
              {result.type === 'phone' && (
                <span className="text-xs px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200">
                  7 ตัวท้ายเด่น: {result.core7}
                </span>
              )}
            </div>

            {/* Sum Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-900/80 border border-amber-500/25 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {result.type === 'phone' ? 'ผลรวมทั้งหมด (10 หลัก)' : 'ผลรวมอักษร + ตัวเลขทั้งหมด'}
                  </span>
                  <span className="text-2xl font-bold text-amber-300">{result.totalSumAll}</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {result.sumSummary.description}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900/80 border border-sky-400/20 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {result.type === 'phone' ? 'ผลรวม 7 ตัวท้าย' : 'ผลรวมเฉพาะตัวเลข'}
                  </span>
                  <span className="text-2xl font-bold text-sky-300">
                    {result.type === 'phone' ? result.totalSumCore7 : result.digitSum}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {result.type === 'phone'
                    ? result.core7Summary.description
                    : result.digitSumSummary.description}
                </p>
              </div>
            </div>

            {/* Thai Character Breakdown for License Plates */}
            {result.type === 'plate' && result.charBreakdown.length > 0 && (
              <div className="pt-1">
                <p className="text-xs text-slate-400 mb-2">ตารางถอดค่าอักษรและตัวเลข</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.charBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className={`px-2.5 py-1.5 rounded-lg border text-center min-w-[44px] ${
                        item.kind === 'thai'
                          ? 'bg-amber-500/10 border-amber-400/30'
                          : 'bg-slate-800/80 border-slate-700'
                      }`}
                    >
                      <div className="text-sm font-semibold text-slate-100">{item.char}</div>
                      <div className="text-[11px] text-amber-300">= {item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pairs Breakdown */}
          {result.pairs.length > 0 && (
            <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                  คู่เลขเด่น ({result.pairs.length} คู่)
                </h3>
                <span className="text-xs text-slate-400">เรียงตามลำดับจากหน้าไปหลัง</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.pairs.map((p, idx) => {
                  const tone = TONE_BADGE[p.tone] || TONE_BADGE.good;
                  return (
                    <div
                      key={`${p.pair}-${idx}`}
                      className="rounded-xl bg-slate-900/75 border border-slate-800 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-10 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 font-bold text-base">
                            {p.pair}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-slate-100">
                            {p.label}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tone.cls}`}>
                          {tone.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{p.meaning}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deep AI Analysis */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              วิเคราะห์ความเหมาะสมเชิงลึกด้วย Gemini AI
            </h3>
            <input
              type="text"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="ระบุอาชีพหรือเป้าหมาย (ไม่บังคับ) เช่น งานขาย/การตลาด, เจ้าของธุรกิจ, วิศวกร"
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
                  กำลังวิเคราะห์โครงสร้างตัวเลขด้วย {settings.model}...
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

          {aiResult && (
            <FormattedAnalysis content={aiResult.analysis} model={settings.model} />
          )}

          <LineShareBox
            text={aiResult ? aiResult.lineSummary : offlineLineSummary}
            title={
              aiResult
                ? 'ข้อความสรุปเลขศาสตร์จาก AI สำหรับส่งต่อใน LINE'
                : 'ข้อความสรุปเลขศาสตร์เบื้องต้นสำหรับส่งต่อใน LINE'
            }
          />
        </div>
      )}
    </div>
  );
}
