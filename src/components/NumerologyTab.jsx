import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  Car,
  Columns2,
  Hash,
  Loader2,
  Phone,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  analyzeLicensePlate,
  analyzePhoneNumber,
  computeNumerologyBalance,
  generateCompareLineSummary,
  generateNumerologyLineSummary,
} from '../utils/numerology';
import {
  BIRTH_DAYS_TAKSA,
  analyzeThaiName,
  generateNameLineSummary,
} from '../utils/nameNumerology';
import { callGeminiAdvisor } from '../services/gemini';
import { isAIConfigured } from '../utils/storage';
import { renderCompareCardPng, renderNumerologyCardPng } from '../utils/shareCard';
import FormattedAnalysis from './FormattedAnalysis';
import FollowUpChat from './FollowUpChat';
import LineShareBox from './LineShareBox';
import NumerologyBalanceChart from './NumerologyBalanceChart';
import ShareCardButton from './ShareCardButton';

const TONE_BADGE = {
  high: { label: 'พลังโดดเด่น', cls: 'bg-[#2e2300] text-[#FFC000] border border-[#594300]' },
  good: { label: 'พลังส่งเสริม', cls: 'bg-[#0b222e] text-[#29ABE2] border border-[#1b4f68]' },
  balance: { label: 'จุดบริหารสมดุล', cls: 'bg-[#121212] text-[#a6a6a6] border border-[#494949]' },
};

export default function NumerologyTab({ settings, onOpenSettings, onSaveHistory }) {
  const [mode, setMode] = useState('phone'); // 'phone' | 'plate' | 'name'
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'compare'
  const [inputValue, setInputValue] = useState('');
  const [inputB, setInputB] = useState('');

  // Name numerology inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDayId, setBirthDayId] = useState('sunday');
  const [nameResult, setNameResult] = useState(null);

  const [userGoal, setUserGoal] = useState('');
  const [result, setResult] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [inputError, setInputError] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [lastAiPrompt, setLastAiPrompt] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  const balanceA = useMemo(() => (result ? computeNumerologyBalance(result) : null), [result]);
  const balanceB = useMemo(() => (resultB ? computeNumerologyBalance(resultB) : null), [resultB]);

  const resetResults = () => {
    setResult(null);
    setResultB(null);
    setNameResult(null);
    setInputError('');
    setAiResult(null);
    setAiError('');
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    if (nextMode === 'name') setViewMode('single');
    setInputValue('');
    setInputB('');
    resetResults();
  };

  const handleViewModeChange = (nextView) => {
    setViewMode(nextView);
    resetResults();
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    setInputError('');
    setAiResult(null);
    setAiError('');

    if (mode === 'name') {
      const computed = analyzeThaiName({ firstName, lastName, birthDayId });
      if (!computed) {
        setNameResult(null);
        setInputError('กรุณากรอกชื่อตัวภาษาไทย (เช่น สมชาย, นภัสสร)');
        return;
      }
      setNameResult(computed);
      const summary = generateNameLineSummary(computed);
      onSaveHistory({
        category: 'numerology',
        isAI: false,
        title: `ชื่อ–นามสกุล: ${computed.firstName}${computed.lastName ? ' ' + computed.lastName : ''}`,
        subtitle: `ผลรวมชื่อ ${computed.firstSum}${computed.lastName ? ` | รวมทั้งหมด ${computed.totalSum}` : ''} • ${computed.dayMeta.label}`,
        lineSummary: summary,
      });
      return;
    }

    const analyzer = mode === 'phone' ? analyzePhoneNumber : analyzeLicensePlate;

    if (viewMode === 'single') {
      const computed = analyzer(inputValue);
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
      setResultB(null);
      const offlineSummary = generateNumerologyLineSummary(computed);
      onSaveHistory({
        category: 'numerology',
        isAI: false,
        title: `${mode === 'phone' ? 'เบอร์โทร' : 'ทะเบียนรถ'}: ${computed.formatted}`,
        subtitle: `ผลรวม ${computed.totalSumAll} • คู่เลข: ${computed.pairs.map((p) => p.pair).join(', ')}`,
        lineSummary: offlineSummary,
      });
      return;
    }

    // Compare A vs B
    const computedA = analyzer(inputValue);
    const computedB = analyzer(inputB);
    if (!computedA || !computedB) {
      setResult(null);
      setResultB(null);
      setInputError(
        mode === 'phone'
          ? 'กรุณากรอกเบอร์โทรศัพท์ทั้งตัวเลือก A และตัวเลือก B ให้ครบถ้วน (อย่างน้อย 4 หลัก)'
          : 'กรุณากรอกเลขทะเบียนรถทั้งตัวเลือก A และตัวเลือก B ให้ครบถ้วน'
      );
      return;
    }

    setResult(computedA);
    setResultB(computedB);
    const compareSummary = generateCompareLineSummary(computedA, computedB);
    onSaveHistory({
      category: 'numerology',
      isAI: false,
      title: `เปรียบเทียบ ${mode === 'phone' ? 'เบอร์โทร' : 'ทะเบียนรถ'}: ${computedA.formatted} vs ${computedB.formatted}`,
      subtitle: `ผลรวม A: ${computedA.totalSumAll} | ผลรวม B: ${computedB.totalSumAll}`,
      lineSummary: compareSummary,
    });
  };

  const handleDeepAnalyze = async () => {
    if (mode === 'name' && !nameResult) return;
    if (mode !== 'name' && !result) return;
    if (!isAIConfigured(settings)) {
      onOpenSettings();
      return;
    }

    setLoadingAI(true);
    setAiError('');
    try {
      let prompt = '';
      if (mode === 'name' && nameResult) {
        const taksaText = nameResult.taksaSummary.map((t) => `${t.name} (${t.count})`).join(', ');
        prompt = [
          `กรุณาวิเคราะห์เลขศาสตร์และทักษาชื่อ–นามสกุลภาษาไทยเชิงลึกอย่างมีเหตุผลและไม่ข่มขู่:`,
          `- ชื่อ–นามสกุล: ${nameResult.firstName}${nameResult.lastName ? ' ' + nameResult.lastName : ''}`,
          `- วันเกิดอ้างอิงทักษา: ${nameResult.dayMeta.label}`,
          `- ผลรวมเลขศาสตร์ชื่อตัว: ${nameResult.firstSum}`,
          nameResult.lastName ? `- ผลรวมนามสกุล: ${nameResult.lastSum} | ผลรวมทั้งหมด: ${nameResult.totalSum}` : '',
          `- การกระจายทักษาชื่อตัว: ${taksaText}`,
          nameResult.hasKalakini
            ? `- มีอักษรหมวดจุดฝึกสติ (กาลกิณี): ${nameResult.kalakiniChars.join(', ')} (กรุณาอธิบายเชิงจิตวิทยาและการบริหารตนเองโดยไม่สร้างความกังวล)`
            : `- ไม่พบอักษรในหมวดกาลกิณี`,
          userGoal.trim() ? `- อาชีพหรือเป้าหมายของผู้ใช้: ${userGoal.trim()}` : '',
          ``,
          `ขอให้วิเคราะห์จุดแข็งด้านบุคลิกภาพ การสื่อสาร และการวางแผนชีวิตจริง (Actionable Advice) พร้อมปิดท้ายด้วยข้อความสรุปสำหรับส่งต่อใน LINE`,
        ]
          .filter(Boolean)
          .join('\n');
      } else if (viewMode === 'compare' && resultB && balanceA && balanceB) {
        const typeLabel = result.type === 'phone' ? 'เบอร์โทรศัพท์' : 'เลขทะเบียนรถ';
        prompt = [
          `กรุณาเปรียบเทียบเลขศาสตร์${typeLabel} 2 ตัวเลือกต่อไปนี้เพื่อช่วยผู้ใช้ตัดสินใจอย่างมีเหตุผล:`,
          ``,
          `ตัวเลือก A: ${result.formatted}`,
          `- ผลรวมทั้งหมด: ${result.totalSumAll} (เลขรากฐาน ${result.sumSummary.reduced})`,
          `- คู่เลขเด่น: ${result.pairs.map((p) => `${p.pair} (${p.label})`).join(', ')}`,
          `- คะแนนสมดุล 5 ด้าน: การงาน ${balanceA.scores.career}, การเงิน ${balanceA.scores.finance}, สื่อสาร ${balanceA.scores.communication}, ความสัมพันธ์ ${balanceA.scores.relationship}, สติ-สมดุล ${balanceA.scores.mindfulness}`,
          ``,
          `ตัวเลือก B: ${resultB.formatted}`,
          `- ผลรวมทั้งหมด: ${resultB.totalSumAll} (เลขรากฐาน ${resultB.sumSummary.reduced})`,
          `- คู่เลขเด่น: ${resultB.pairs.map((p) => `${p.pair} (${p.label})`).join(', ')}`,
          `- คะแนนสมดุล 5 ด้าน: การงาน ${balanceB.scores.career}, การเงิน ${balanceB.scores.finance}, สื่อสาร ${balanceB.scores.communication}, ความสัมพันธ์ ${balanceB.scores.relationship}, สติ-สมดุล ${balanceB.scores.mindfulness}`,
          ``,
          userGoal.trim() ? `อาชีพหรือเป้าหมายของผู้ใช้: ${userGoal.trim()}` : '',
          `ขอให้เปรียบเทียบจุดแข็งและจุดที่ควรบริหารสมดุลของ A และ B อย่างเป็นกลาง ไม่ข่มขู่ แนะนำว่าแต่ละตัวเลือกเหมาะกับบริบทชีวิตแบบใด และสรุปข้อความสั้นๆ สำหรับส่งต่อใน LINE`,
        ]
          .filter(Boolean)
          .join('\n');
      } else {
        const pairList = result.pairs.map((p) => `${p.pair} (${p.label})`).join(', ');
        prompt =
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
      }

      setLastAiPrompt(prompt);
      const response = await callGeminiAdvisor({
        apiKey: settings.apiKey,
        model: settings.model,
        proxyUrl: settings.proxyUrl,
        useServerProxy: settings.useServerProxy,
        prompt,
      });

      setAiResult(response);
      onSaveHistory({
        category: 'numerology',
        isAI: true,
        title:
          mode === 'name' && nameResult
            ? `AI วิเคราะห์ชื่อ: ${nameResult.firstName}${nameResult.lastName ? ' ' + nameResult.lastName : ''}`
            : viewMode === 'compare' && resultB
              ? `AI เปรียบเทียบ: ${result.formatted} vs ${resultB.formatted}`
              : `AI วิเคราะห์${result.type === 'phone' ? 'เบอร์โทร' : 'ทะเบียนรถ'}: ${result.formatted}`,
        subtitle:
          mode === 'name' && nameResult
            ? `ผลรวม ${nameResult.totalSum}`
            : viewMode === 'compare' && resultB
              ? `ผลรวม A: ${result.totalSumAll} | B: ${resultB.totalSumAll}`
              : `ผลรวม ${result.totalSumAll}`,
        analysis: response.analysis,
        lineSummary: response.lineSummary,
      });
    } catch (err) {
      setAiError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini API');
    } finally {
      setLoadingAI(false);
    }
  };

  const offlineLineSummary =
    mode === 'name' && nameResult
      ? generateNameLineSummary(nameResult)
      : viewMode === 'compare' && result && resultB
        ? generateCompareLineSummary(result, resultB)
        : result
          ? generateNumerologyLineSummary(result)
          : '';

  const hasActiveResult =
    (mode === 'name' && Boolean(nameResult)) ||
    (mode !== 'name' && Boolean(result) && (viewMode === 'single' || Boolean(resultB)));

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <form onSubmit={handleAnalyze} className="lambo-panel p-5 sm:p-8 space-y-6">
        <div className="border-b border-[#333333] pb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display-latin text-xs text-[#FFC000] tracking-[0.225px] mb-1">
              NUMEROLOGY &amp; TAKSA ENGINE
            </p>
            <h2 className="text-xl sm:text-2xl font-medium text-white flex items-center gap-2.5">
              <Hash className="h-5 w-5 text-[#FFC000] shrink-0" />
              วิเคราะห์เลขศาสตร์ เบอร์โทร ทะเบียนรถ และชื่อ–นามสกุล
            </h2>
            <p className="text-sm sm:text-base text-[#7D7D7D] mt-1">
              แยกคู่เลขเด่น กราฟสมดุล 5 ด้าน เปรียบเทียบ A vs B และถอดทักษาอักษรไทยได้ทันทีแบบออฟไลน์
            </p>
          </div>

          {/* Single vs Compare Toggle (Phone & Plate only) */}
          {mode !== 'name' && (
            <div className="inline-flex border border-[#333333] bg-black shrink-0">
              <button
                type="button"
                onClick={() => handleViewModeChange('single')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'single'
                    ? 'bg-[#FFC000] text-black'
                    : 'text-[#a6a6a6] hover:text-white'
                }`}
              >
                วิเคราะห์เดี่ยว
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('compare')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-l border-[#333333] inline-flex items-center gap-1.5 ${
                  viewMode === 'compare'
                    ? 'bg-[#FFC000] text-black'
                    : 'text-[#a6a6a6] hover:text-white'
                }`}
              >
                <Columns2 className="h-3.5 w-3.5" />
                เทียบ A vs B
              </button>
            </div>
          )}
        </div>

        {/* 3-Mode Selector: Phone | License Plate | Thai Name */}
        <div className="grid grid-cols-3 border border-[#333333] bg-black">
          <button
            type="button"
            onClick={() => handleModeChange('phone')}
            className={`flex items-center justify-center gap-2 py-3.5 text-xs sm:text-base font-medium transition-colors cursor-pointer ${
              mode === 'phone'
                ? 'bg-[#202020] text-white border-b-2 border-b-[#FFC000]'
                : 'text-[#7D7D7D] hover:text-white border-b-2 border-b-transparent'
            }`}
          >
            <Phone className="h-4 w-4 shrink-0" />
            <span>เบอร์โทร</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('plate')}
            className={`flex items-center justify-center gap-2 py-3.5 text-xs sm:text-base font-medium transition-colors cursor-pointer border-l border-[#333333] ${
              mode === 'plate'
                ? 'bg-[#202020] text-white border-b-2 border-b-[#FFC000]'
                : 'text-[#7D7D7D] hover:text-white border-b-2 border-b-transparent'
            }`}
          >
            <Car className="h-4 w-4 shrink-0" />
            <span>ทะเบียนรถ</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('name')}
            className={`flex items-center justify-center gap-2 py-3.5 text-xs sm:text-base font-medium transition-colors cursor-pointer border-l border-[#333333] ${
              mode === 'name'
                ? 'bg-[#202020] text-white border-b-2 border-b-[#FFC000]'
                : 'text-[#7D7D7D] hover:text-white border-b-2 border-b-transparent'
            }`}
          >
            <UserCheck className="h-4 w-4 shrink-0" />
            <span>ชื่อ–นามสกุล</span>
          </button>
        </div>

        {/* Inputs */}
        {mode === 'name' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-[#a6a6a6] mb-2">ชื่อตัว (ภาษาไทย)</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="เช่น กฤตเมธ, นภัสสร"
                className="lambo-input"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a6a6a6] mb-2">นามสกุล (ไม่บังคับ)</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="เช่น วัฒนากูล"
                className="lambo-input"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a6a6a6] mb-2">วันเกิดอ้างอิงทักษา</label>
              <select
                value={birthDayId}
                onChange={(e) => setBirthDayId(e.target.value)}
                className="lambo-input"
              >
                {BIRTH_DAYS_TAKSA.map((d) => (
                  <option key={d.id} value={d.id} className="bg-black text-white">
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : viewMode === 'single' ? (
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
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#FFC000] font-medium mb-2">
                ตัวเลือก A ({mode === 'phone' ? 'เบอร์โทรศัพท์' : 'เลขทะเบียนรถ'})
              </label>
              <input
                type={mode === 'phone' ? 'tel' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={mode === 'phone' ? 'เช่น 089-456-1595' : 'เช่น 1กข 4569'}
                className="lambo-input text-lg py-3.5 border-l-2 border-l-[#FFC000]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#29ABE2] font-medium mb-2">
                ตัวเลือก B ({mode === 'phone' ? 'เบอร์โทรศัพท์' : 'เลขทะเบียนรถ'})
              </label>
              <input
                type={mode === 'phone' ? 'tel' : 'text'}
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                placeholder={mode === 'phone' ? 'เช่น 082-246-5659' : 'เช่น กท 5959'}
                className="lambo-input text-lg py-3.5 border-l-2 border-l-[#29ABE2]"
              />
            </div>
          </div>
        )}

        {inputError && (
          <p className="text-sm text-[#ff8a80] flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {inputError}
          </p>
        )}

        <button
          type="submit"
          className="lambo-btn-gold w-full px-6 py-4 text-base flex items-center justify-center gap-2 cursor-pointer"
        >
          {mode === 'name' ? (
            <>
              <UserCheck className="h-4 w-4" />
              วิเคราะห์เลขศาสตร์และทักษาชื่อทันที
            </>
          ) : viewMode === 'compare' ? (
            <>
              <Columns2 className="h-4 w-4" />
              เปรียบเทียบตัวเลือก A vs B ทันที
            </>
          ) : (
            <>
              <Hash className="h-4 w-4" />
              วิเคราะห์คู่เลขและผลรวมทันที
            </>
          )}
        </button>
      </form>

      {/* THAI NAME NUMEROLOGY & TAKSA RESULT */}
      {mode === 'name' && nameResult && (
        <div className="space-y-6">
          <div className="lambo-card border-t-2 border-t-[#FFC000] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#333333] pb-4">
              <div>
                <p className="font-display-latin text-[11px] text-[#FFC000] tracking-[0.225px]">
                  THAI NAME &amp; TAKSA REPORT
                </p>
                <h3 className="text-2xl sm:text-3xl font-medium text-white mt-1">
                  {nameResult.firstName} {nameResult.lastName}
                </h3>
              </div>
              <span className="lambo-badge bg-black border border-[#494949] text-[#FFCE3E]">
                {nameResult.dayMeta.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black border border-[#333333] p-4">
                <span className="text-xs text-[#7D7D7D] block">เลขศาสตร์ชื่อตัว</span>
                <span className="text-3xl font-semibold text-[#FFC000] mt-1 block">
                  {nameResult.firstSum}
                </span>
                <p className="text-sm text-[#a6a6a6] mt-2 leading-[1.7]">
                  {nameResult.firstInterpretation.description}
                </p>
              </div>

              <div className="bg-black border border-[#333333] p-4">
                <span className="text-xs text-[#7D7D7D] block">เลขศาสตร์นามสกุล</span>
                <span className="text-3xl font-semibold text-[#29ABE2] mt-1 block">
                  {nameResult.lastName ? nameResult.lastSum : '-'}
                </span>
                <p className="text-sm text-[#a6a6a6] mt-2 leading-[1.7]">
                  {nameResult.lastInterpretation
                    ? nameResult.lastInterpretation.description
                    : 'ไม่ได้ระบุนามสกุล'}
                </p>
              </div>

              <div className="bg-black border border-[#333333] p-4">
                <span className="text-xs text-[#7D7D7D] block">ผลรวมชื่อ + นามสกุล</span>
                <span className="text-3xl font-semibold text-white mt-1 block">
                  {nameResult.totalSum}
                </span>
                <p className="text-sm text-[#a6a6a6] mt-2 leading-[1.7]">
                  {nameResult.totalInterpretation.description}
                </p>
              </div>
            </div>

            {/* Character-by-character table */}
            <div>
              <p className="text-xs text-[#7D7D7D] mb-2.5">ตารางถอดค่าอักษรและทักษา (ชื่อตัว)</p>
              <div className="flex flex-wrap gap-2">
                {nameResult.firstChars.map((item, idx) => {
                  const isKalakini = item.taksa?.key === 'kalakini';
                  return (
                    <div
                      key={idx}
                      className={`px-3 py-2 border text-center min-w-[60px] ${
                        isKalakini
                          ? 'bg-[#281f06] border-[#FFC000]'
                          : 'bg-black border-[#333333]'
                      }`}
                    >
                      <div className="text-base font-semibold text-white">{item.char}</div>
                      <div className="text-xs text-[#FFC000]">= {item.value}</div>
                      {item.taksa && (
                        <div className="text-[10px] text-[#a6a6a6] mt-0.5">
                          {item.taksa.key === 'kalakini' ? 'ฝึกสติ' : item.taksa.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Taksa Distribution */}
            <div className="pt-3 border-t border-[#333333] space-y-3">
              <h4 className="text-base font-medium text-white">โครงสร้างทักษาอักษรไทย</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nameResult.taksaSummary.map((t) => (
                  <div key={t.key} className="bg-black border border-[#333333] p-3.5 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-medium ${
                          t.key === 'kalakini' ? 'text-[#FFCE3E]' : 'text-white'
                        }`}
                      >
                        {t.name} ({t.chars.join(', ')})
                      </span>
                      <span className="lambo-badge bg-[#202020] text-[#FFC000]">
                        {t.count} อักษร
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#a6a6a6] leading-[1.6]">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE RESULT VIEW (Phone / Plate) */}
      {mode !== 'name' && viewMode === 'single' && result && balanceA && (
        <div className="space-y-6">
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

          <NumerologyBalanceChart primary={balanceA} />

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

          <ShareCardButton
            onGenerateDataUrl={() => renderNumerologyCardPng(result, balanceA)}
            fileName={`numerology-${result.digits}.png`}
            label="บันทึกการ์ดภาพสรุปเลขศาสตร์ (PNG)"
          />
        </div>
      )}

      {/* COMPARE A vs B RESULT VIEW */}
      {mode !== 'name' && viewMode === 'compare' && result && resultB && balanceA && balanceB && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="lambo-card border-t-2 border-t-[#FFC000] p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display-latin text-[11px] text-[#FFC000] tracking-[0.225px]">
                    OPTION A
                  </p>
                  <p className="text-xl sm:text-2xl font-medium text-white mt-1">
                    {result.formatted}
                  </p>
                </div>
                <span className="px-3 py-1 bg-black border border-[#FFC000] text-[#FFC000] font-semibold text-sm">
                  สมดุล {balanceA.overall}/100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-sm">
                <div className="bg-black border border-[#333333] p-3">
                  <span className="text-xs text-[#7D7D7D] block">ผลรวมทั้งหมด</span>
                  <span className="text-xl font-semibold text-[#FFC000]">{result.totalSumAll}</span>
                </div>
                <div className="bg-black border border-[#333333] p-3">
                  <span className="text-xs text-[#7D7D7D] block">จุดเด่นหลัก</span>
                  <span className="text-sm font-medium text-white">{balanceA.topDimension.shortLabel}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {result.pairs.map((p, idx) => (
                  <span
                    key={`${p.pair}-${idx}`}
                    className="px-2.5 py-1 bg-black border border-[#333333] text-xs text-[#F5F5F5]"
                  >
                    <strong className="text-[#FFC000]">{p.pair}</strong> {p.label}
                  </span>
                ))}
              </div>

              <p className="text-sm text-[#a6a6a6] leading-[1.7]">{result.sumSummary.description}</p>
            </div>

            <div className="lambo-card border-t-2 border-t-[#29ABE2] p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display-latin text-[11px] text-[#29ABE2] tracking-[0.225px]">
                    OPTION B
                  </p>
                  <p className="text-xl sm:text-2xl font-medium text-white mt-1">
                    {resultB.formatted}
                  </p>
                </div>
                <span className="px-3 py-1 bg-black border border-[#29ABE2] text-[#29ABE2] font-semibold text-sm">
                  สมดุล {balanceB.overall}/100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-sm">
                <div className="bg-black border border-[#333333] p-3">
                  <span className="text-xs text-[#7D7D7D] block">ผลรวมทั้งหมด</span>
                  <span className="text-xl font-semibold text-[#29ABE2]">{resultB.totalSumAll}</span>
                </div>
                <div className="bg-black border border-[#333333] p-3">
                  <span className="text-xs text-[#7D7D7D] block">จุดเด่นหลัก</span>
                  <span className="text-sm font-medium text-white">{balanceB.topDimension.shortLabel}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {resultB.pairs.map((p, idx) => (
                  <span
                    key={`${p.pair}-${idx}`}
                    className="px-2.5 py-1 bg-black border border-[#333333] text-xs text-[#F5F5F5]"
                  >
                    <strong className="text-[#29ABE2]">{p.pair}</strong> {p.label}
                  </span>
                ))}
              </div>

              <p className="text-sm text-[#a6a6a6] leading-[1.7]">{resultB.sumSummary.description}</p>
            </div>
          </div>

          <NumerologyBalanceChart
            primary={balanceA}
            secondary={balanceB}
            primaryLabel={`A (${result.formatted})`}
            secondaryLabel={`B (${resultB.formatted})`}
          />

          <ShareCardButton
            onGenerateDataUrl={() => renderCompareCardPng(result, resultB, balanceA, balanceB)}
            fileName={`numerology-compare-${result.digits}-vs-${resultB.digits}.png`}
            label="บันทึกการ์ดภาพเปรียบเทียบ A vs B (PNG)"
          />
        </div>
      )}

      {/* Deep AI Analysis, Follow-up Chat & LINE Share */}
      {hasActiveResult && (
        <div className="space-y-6">
          <div className="lambo-panel p-5 sm:p-6 space-y-4">
            <div>
              <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px]">
                DEEP ADVISORY
              </p>
              <h3 className="text-base sm:text-lg font-medium text-white flex items-center gap-2 mt-0.5">
                <Sparkles className="h-4 w-4 text-[#FFC000]" />
                {mode === 'name'
                  ? 'วิเคราะห์ชื่อ–นามสกุลเชิงลึกด้วย Gemini AI'
                  : viewMode === 'compare'
                    ? 'ให้ Gemini AI ช่วยเปรียบเทียบและเลือกตัวเลือกที่เหมาะกับคุณ'
                    : 'วิเคราะห์ความเหมาะสมเชิงลึกด้วย Gemini AI'}
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
                  กำลังวิเคราะห์ด้วย {settings.model}...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#FFC000]" />
                  {isAIConfigured(settings)
                    ? `วิเคราะห์เชิงลึกด้วย AI (${settings.model})`
                    : 'ตั้งค่า Gemini API เพื่อวิเคราะห์เชิงลึก'}
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
            <>
              <FormattedAnalysis content={aiResult.analysis} model={settings.model} />
              <FollowUpChat
                settings={settings}
                onOpenSettings={onOpenSettings}
                baseContext={lastAiPrompt}
                baseAnalysis={aiResult.analysis}
              />
            </>
          )}

          <LineShareBox
            text={aiResult ? aiResult.lineSummary : offlineLineSummary}
            title={
              aiResult
                ? 'ข้อความสรุปเลขศาสตร์จาก AI สำหรับส่งต่อใน LINE'
                : mode === 'name'
                  ? 'ข้อความสรุปวิเคราะห์ชื่อ–นามสกุลสำหรับส่งต่อใน LINE'
                  : viewMode === 'compare'
                    ? 'ข้อความสรุปเปรียบเทียบ A vs B สำหรับส่งต่อใน LINE'
                    : 'ข้อความสรุปเลขศาสตร์เบื้องต้นสำหรับส่งต่อใน LINE'
            }
          />
        </div>
      )}
    </div>
  );
}
