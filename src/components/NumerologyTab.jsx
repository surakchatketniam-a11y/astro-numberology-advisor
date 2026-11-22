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
  high: { label: 'พลังโดดเด่น', cls: 'bg-[#2e2300] text-[#FFC000] border border-[#594300]' },
  good: { label: 'พลังส่งเสริม', cls: 'bg-[#0b222e] text-[#29ABE2] border border-[#1b4f68]' },
  balance: { label: 'จุดบริหารสมดุล', cls: 'bg-[#121212] text-[#a6a6a6] border border-[#494949]' },
};

export default function NumerologyTab({ settings, onOpenSettings, onSaveHistory }) {
  const [mode, setMode] = useState('phone');
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
          : 'กรุณากรอกเลขทะเบียนรถที่มีตัวเลข (เช่น 1กข 4569 หรือ กท 5959)'
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
        onPartial: setAiResult,
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
      setAiResult(null);
      setAiError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini API');
    } finally {
      setLoadingAI(false);
    }
  };

  const offlineLineSummary = result ? generateNumerologyLineSummary(result) : '';

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <form onSubmit={handleAnalyze} className="lambo-panel p-5 sm:p-8 space-y-6">
        <div className="border-b border-[#333333] pb-4">
          <p className="font-display-latin text-xs text-[#FFC000] tracking-[0.225px] mb-1">
            NUMEROLOGY ENGINE
          </p>
          <h2 className="text-xl sm:text-2xl font-medium text-white flex items-center gap-2.5">
            <Hash className="h-5 w-5 text-[#FFC000] shrink-0" />
            วิเคราะห์เลขศาสตร์เบื้องต้น
          </h2>
          <p className="text-sm sm:text-base text-[#7D7D7D] mt-1">
            แยกคู่เลขเด่น คำนวณผลรวม และแปลความหมายเชิงจิตวิทยาได้ทันทีแบบออฟไลน์
          </p>
        </div>

        {/* Sharp Segmented Toggle */}
        <div className="grid grid-cols-2 border border-[#333333] bg-black">
          <button
            type="button"
            onClick={() => handleModeChange('phone')}
            className={`flex items-center justify-center gap-2 py-3.5 text-sm sm:text-base font-medium transition-colors cursor-pointer ${
              mode === 'phone'
                ? 'bg-[#202020] text-white border-b-2 border-b-[#FFC000]'
                : 'text-[#7D7D7D] hover:text-white border-b-2 border-b-transparent'
            }`}
          >
            <Phone className="h-4 w-4" />
            เบอร์โทรศัพท์
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('plate')}
            className={`flex items-center justify-center gap-2 py-3.5 text-sm sm:text-base font-medium transition-colors cursor-pointer border-l border-[#333333] ${
              mode === 'plate'
                ? 'bg-[#202020] text-white border-b-2 border-b-[#FFC000]'
                : 'text-[#7D7D7D] hover:text-white border-b-2 border-b-transparent'
            }`}
          >
            <Car className="h-4 w-4" />
            เลขทะเบียนรถ
          </button>
        </div>

        <div>
          <label className="block text-sm text-[#a6a6a6] mb-2">
            {mode === 'phone'
              ? 'กรอกเบอร์โทรศัพท์ (10 หลัก)'
              : 'กรอกเลขทะเบียนรถ (รองรับอักษรไทยและตัวเลข)'}
          </label>
          <input
            type={mode === 'phone' ? 'tel' : 'text'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={mode === 'phone' ? 'เช่น 089-456-1595' : 'เช่น 1กข 4569 หรือ กท 5959'}
            className="lambo-input text-lg py-3.5"
          />
          {inputError && (
            <p className="mt-2 text-sm text-[#ff8a80] flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {inputError}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="lambo-btn-gold w-full px-6 py-4 text-base flex items-center justify-center gap-2 cursor-pointer"
        >
          <Hash className="h-4 w-4" />
          วิเคราะห์คู่เลขและผลรวมทันที
        </button>
      </form>

      {/* Instant Results */}
      {result && (
        <div className="space-y-6">
          {/* Number Breakdown & Sums */}
          <div className="lambo-card border-t-2 border-t-[#FFC000] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#333333]">
              <div>
                <p className="text-xs text-[#7D7D7D]">
                  {result.type === 'phone' ? 'เบอร์โทรศัพท์ที่วิเคราะห์' : 'เลขทะเบียนรถที่วิเคราะห์'}
                </p>
                <p className="text-2xl sm:text-3xl font-medium text-white mt-1">
                  {result.type === 'phone' && result.prefix ? (
                    <>
                      <span className="text-[#666666]">{result.prefix}-</span>
                      <span className="text-[#FFC000]">
                        {result.core7.slice(0, 3)}-{result.core7.slice(3)}
                      </span>
                    </>
                  ) : (
                    result.formatted
                  )}
                </p>
              </div>
              {result.type === 'phone' && (
                <span className="lambo-badge bg-black border border-[#FFC000] text-[#FFC000]">
                  7 ตัวท้ายเด่น: {result.core7}
                </span>
              )}
            </div>

            {/* Sum KPI Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black border border-[#333333] p-4 sm:p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-[#7D7D7D]">
                    {result.type === 'phone' ? 'ผลรวมทั้งหมด (10 หลัก)' : 'ผลรวมอักษร + ตัวเลขทั้งหมด'}
                  </span>
                  <span className="text-3xl font-semibold text-[#FFC000]">{result.totalSumAll}</span>
                </div>
                <p className="text-sm sm:text-base text-[#F5F5F5] mt-3 leading-[1.7]">
                  {result.sumSummary.description}
                </p>
              </div>

              <div className="bg-black border border-[#333333] p-4 sm:p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-[#7D7D7D]">
                    {result.type === 'phone' ? 'ผลรวม 7 ตัวท้าย' : 'ผลรวมเฉพาะตัวเลข'}
                  </span>
                  <span className="text-3xl font-semibold text-[#29ABE2]">
                    {result.type === 'phone' ? result.totalSumCore7 : result.digitSum}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-[#F5F5F5] mt-3 leading-[1.7]">
                  {result.type === 'phone'
                    ? result.core7Summary.description
                    : result.digitSumSummary.description}
                </p>
              </div>
            </div>

            {/* Thai Character Breakdown for License Plates */}
            {result.type === 'plate' && result.charBreakdown.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-[#7D7D7D] mb-2.5">ตารางถอดค่าอักษรและตัวเลข</p>
                <div className="flex flex-wrap gap-2">
                  {result.charBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 border text-center min-w-[48px] ${
                        item.kind === 'thai'
                          ? 'bg-[#2e2300] border-[#594300]'
                          : 'bg-black border-[#333333]'
                      }`}
                    >
                      <div className="text-base font-semibold text-white">{item.char}</div>
                      <div className="text-xs text-[#FFC000]">= {item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pairs Breakdown */}
          {result.pairs.length > 0 && (
            <div className="lambo-panel p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#333333] pb-3">
                <h3 className="text-base sm:text-lg font-medium text-white">
                  คู่เลขเด่น ({result.pairs.length} คู่)
                </h3>
                <span className="text-xs text-[#7D7D7D]">เรียงตามลำดับจากหน้าไปหลัง</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {result.pairs.map((p, idx) => {
                  const tone = TONE_BADGE[p.tone] || TONE_BADGE.good;
                  return (
                    <div
                      key={`${p.pair}-${idx}`}
                      className="bg-[#202020] border border-[#333333] p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-12 items-center justify-center bg-black border border-[#FFC000] text-[#FFC000] font-semibold text-lg">
                            {p.pair}
                          </span>
                          <span className="text-sm sm:text-base font-medium text-white">
                            {p.label}
                          </span>
                        </div>
                        <span className={`lambo-badge shrink-0 ${tone.cls}`}>
                          {tone.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#a6a6a6] leading-[1.7]">{p.meaning}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deep AI Analysis */}
          <div className="lambo-panel p-5 sm:p-6 space-y-4">
            <div>
              <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px]">
                DEEP ADVISORY
              </p>
              <h3 className="text-base sm:text-lg font-medium text-white flex items-center gap-2 mt-0.5">
                <Sparkles className="h-4 w-4 text-[#FFC000]" />
                วิเคราะห์ความเหมาะสมเชิงลึกด้วย Gemini AI
              </h3>
            </div>
            <input
              type="text"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="ระบุอาชีพหรือเป้าหมาย (ไม่บังคับ) เช่น งานขาย/การตลาด, เจ้าของธุรกิจ, วิศวกร"
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
                  กำลังวิเคราะห์โครงสร้างตัวเลขด้วย {settings.model}...
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

            {aiError && (
              <div className="bg-[#291614] border border-[#59302d] p-4 text-sm text-[#ff8a80] flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}
          </div>

          {aiResult && (
            <FormattedAnalysis content={aiResult.analysis} model={settings.model} />
          )}

          <LineShareBox
            text={aiResult && !aiResult.streaming ? aiResult.lineSummary : offlineLineSummary}
            title={
              aiResult && !aiResult.streaming
                ? 'ข้อความสรุปเลขศาสตร์จาก AI สำหรับส่งต่อใน LINE'
                : 'ข้อความสรุปเลขศาสตร์เบื้องต้นสำหรับส่งต่อใน LINE'
            }
          />
        </div>
      )}
    </div>
  );
}
