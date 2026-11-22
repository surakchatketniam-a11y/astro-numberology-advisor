import React, { useState, useMemo } from 'react';
import {
  BookmarkPlus,
  Calendar,
  Clock,
  Compass,
  Loader2,
  MapPin,
  Scale,
  Sparkles,
  Sun,
  User,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  THAI_MONTHS,
  calculateZodiacComparison,
  generateZodiacLineSummary,
} from '../utils/zodiac';
import { callGeminiAdvisor } from '../services/gemini';
import { calculateThaiAscendant, THAI_PROVINCES } from '../utils/ascendant';
import { renderZodiacCardPng } from '../utils/shareCard';
import FormattedAnalysis from './FormattedAnalysis';
import FollowUpChat from './FollowUpChat';
import LineShareBox from './LineShareBox';
import ShareCardButton from './ShareCardButton';
import ThaiZodiacWheel from './ThaiZodiacWheel';

export default function ZodiacTab({
  settings,
  onOpenSettings,
  onSaveHistory,
  onZodiacComputed,
  profiles = [],
  onSaveProfile,
  onDeleteProfile,
}) {
  const currentYearAD = new Date().getFullYear();
  const [day, setDay] = useState(15);
  const [month, setMonth] = useState(4);
  const [yearAD, setYearAD] = useState(1995);
  const [birthTime, setBirthTime] = useState('');
  const [birthProvince, setBirthProvince] = useState('');
  const [focusTopic, setFocusTopic] = useState('');

  const [profileName, setProfileName] = useState('');
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  const [result, setResult] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [lastAiPrompt, setLastAiPrompt] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  const ascendant = useMemo(() => {
    if (!result || !result.birthTime) return null;
    return calculateThaiAscendant({
      yearAD: result.yearAD,
      month: result.month,
      day: result.day,
      birthTime: result.birthTime,
      birthProvince: result.birthProvince,
    });
  }, [result]);

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

  const runCalculation = (params, recordHistory = true) => {
    const computed = calculateZodiacComparison(params);
    setResult(computed);
    setAiResult(null);
    setAiError('');
    if (onZodiacComputed) onZodiacComputed(computed);

    if (recordHistory) {
      const offlineSummary = generateZodiacLineSummary(computed);
      onSaveHistory({
        category: 'zodiac',
        isAI: false,
        title: `${computed.formattedDateTH} — ไทย: ${computed.thaiSign.thName} / สากล: ${computed.westernSign.thName}`,
        subtitle: `${computed.dayOfWeek.name} • เลขรหัสชีวิต ${computed.lifePathNumber}`,
        lineSummary: offlineSummary,
      });
    }
    return computed;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    runCalculation({
      day: safeDay,
      month,
      yearAD,
      birthTime: birthTime.trim(),
      birthProvince: birthProvince.trim(),
    });
  };

  const handleSelectProfile = (profile) => {
    setActiveProfileId(profile.id);
    setDay(profile.day);
    setMonth(profile.month);
    setYearAD(profile.yearAD);
    setBirthTime(profile.birthTime || '');
    setBirthProvince(profile.birthProvince || '');
    setProfileName(profile.name);
    runCalculation(
      {
        day: profile.day,
        month: profile.month,
        yearAD: profile.yearAD,
        birthTime: profile.birthTime || '',
        birthProvince: profile.birthProvince || '',
      },
      false
    );
  };

  const handleSaveCurrentProfile = () => {
    if (!onSaveProfile) return;
    const computed = calculateZodiacComparison({
      day: safeDay,
      month,
      yearAD,
      birthTime: birthTime.trim(),
      birthProvince: birthProvince.trim(),
    });
    const label = profileName.trim() || `โปรไฟล์ ${computed.thaiSign.thName}`;
    onSaveProfile({
      name: label,
      day: safeDay,
      month,
      yearAD,
      birthTime: birthTime.trim(),
      birthProvince: birthProvince.trim(),
      thaiSignName: computed.thaiSign.thName,
      westernSignName: computed.westernSign.thName,
    });
    setProfileName('');
    setProfileSavedNotice(true);
    setTimeout(() => setProfileSavedNotice(false), 2000);
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
        ascendant
          ? `- ลัคนาไทย (Ascendant): ลัคนา${ascendant.ascSign.thName} (${ascendant.degreeInSign}°${String(ascendant.minuteInSign).padStart(2, '0')}') | เรือนการงาน (กัมมะ): ${ascendant.careerHouse.sign.thName} | เรือนการเงิน (กดุมพะ): ${ascendant.wealthHouse.sign.thName}`
          : '',
        `- โหราศาสตร์สากล (สายนะวิธี): ${result.westernSign.thName} / ${result.westernSign.enName} (${result.westernSign.element}, ดาวประจำตัว: ${result.westernSign.westernRuler})`,
        `- เลขรหัสชีวิต (Life Path Number): ${result.lifePathNumber}`,
        focusTopic.trim() ? `- ประเด็นที่ผู้ใช้อยากปรึกษาเป็นพิเศษ: ${focusTopic.trim()}` : '',
        ``,
        `ขอให้วิเคราะห์เปรียบเทียบจุดร่วมและจุดต่างระหว่างราศีไทยกับราศีสากล เชื่อมโยงเข้ากับหลักจิตวิทยา (Self-Awareness และ Risk Management) และให้แนวทางวางแผนชีวิตที่ลงมือทำได้จริง (Actionable Advice) พร้อมปิดท้ายด้วยข้อความสรุปสำหรับส่งต่อใน LINE`,
      ]
        .filter(Boolean)
        .join('\n');

      setLastAiPrompt(prompt);
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
    <div className="space-y-6">
      {/* Saved Profiles Bar */}
      <div className="lambo-panel p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#FFC000]" />
            <span className="text-sm font-medium text-white">โปรไฟล์ดวงที่บันทึกไว้</span>
            <span className="text-xs text-[#7D7D7D]">({profiles.length})</span>
          </div>
          {profileSavedNotice && (
            <span className="text-xs text-[#4ade80]">บันทึกโปรไฟล์เรียบร้อยแล้ว</span>
          )}
        </div>

        {profiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profiles.map((p) => {
              const isSelected = activeProfileId === p.id;
              return (
                <div
                  key={p.id}
                  className={`inline-flex items-center border transition-colors ${
                    isSelected
                      ? 'bg-[#2e2300] border-[#FFC000] text-[#FFC000]'
                      : 'bg-black border-[#333333] text-[#F5F5F5] hover:border-[#707070]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectProfile(p)}
                    className="px-3 py-1.5 text-sm cursor-pointer flex items-center gap-2"
                  >
                    <span className="font-medium">{p.name}</span>
                    {p.thaiSignName && (
                      <span className="text-xs text-[#7D7D7D]">{p.thaiSignName}</span>
                    )}
                  </button>
                  {onDeleteProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeProfileId === p.id) setActiveProfileId(null);
                        onDeleteProfile(p.id);
                      }}
                      className="px-2 py-1.5 border-l border-[#333333] text-[#7D7D7D] hover:text-[#ff8a80] cursor-pointer"
                      aria-label={`ลบโปรไฟล์ ${p.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <input
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="ตั้งชื่อโปรไฟล์เพื่อบันทึกข้อมูลเกิดด้านล่าง เช่น ของฉัน, แฟน, คุณแม่"
            className="lambo-input flex-1 text-sm min-h-[42px] py-2"
          />
          <button
            type="button"
            onClick={handleSaveCurrentProfile}
            className="lambo-btn-ghost px-4 min-h-[42px] text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <BookmarkPlus className="h-4 w-4 text-[#FFC000]" />
            <span>บันทึกโปรไฟล์</span>
          </button>
        </div>
      </div>

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
            คำนวณทันทีแบบออฟไลน์ เทียบโหราศาสตร์ไทย (กลางเดือน) กับสากล (19–23 ของเดือน)
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
              <Clock className="h-4 w-4 text-[#7D7D7D]" /> เวลาเกิด (ไม่บังคับ — เสริมวิเคราะห์ AI)
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
              <MapPin className="h-4 w-4 text-[#7D7D7D]" /> จังหวัดที่เกิด (ไม่บังคับ)
            </label>
            <input
              type="text"
              list="thai-provinces-list"
              value={birthProvince}
              onChange={(e) => setBirthProvince(e.target.value)}
              placeholder="เช่น กรุงเทพมหานคร, เชียงใหม่"
              className="lambo-input"
            />
            <datalist id="thai-provinces-list">
              {THAI_PROVINCES.map((p) => (
                <option key={p.name} value={p.name} />
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
                    ช่วงวันที่: {result.thaiSign.thaiRange}
                  </p>
                </div>
                <span className="lambo-badge bg-black border border-[#494949] text-[#FFCE3E]">
                  {result.thaiSign.element}
                </span>
              </div>

              <div className="bg-black border border-[#333333] px-4 py-2.5 text-sm flex items-center justify-between">
                <span className="text-[#7D7D7D]">ดาวประจำตัว</span>
                <span className="text-white font-medium">{result.thaiSign.thaiRuler}</span>
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
                    ช่วงวันที่: {result.westernSign.westernRange}
                  </p>
                </div>
                <span className="lambo-badge bg-black border border-[#494949] text-[#29ABE2]">
                  {result.westernSign.element}
                </span>
              </div>

              <div className="bg-black border border-[#333333] px-4 py-2.5 text-sm flex items-center justify-between">
                <span className="text-[#7D7D7D]">ดาวประจำตัว</span>
                <span className="text-white font-medium">{result.westernSign.westernRuler}</span>
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
            </div>
          </div>

          {/* Thai Ascendant & 12-House Wheel */}
          {ascendant ? (
            <ThaiZodiacWheel ascendant={ascendant} sunSignId={result.thaiSign.id} />
          ) : (
            <div className="lambo-inset p-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[#a6a6a6]">
              <span>
                ต้องการดู <strong className="text-white">ลัคนาไทยและผังจักรราศี 12 เรือน (SVG)</strong>?
                กรอก <strong className="text-[#FFC000]">เวลาเกิด</strong> ด้านบนแล้วกดคำนวณอีกครั้ง
              </span>
            </div>
          )}

          {/* Shareable PNG Card Export */}
          <ShareCardButton
            onGenerateDataUrl={() => renderZodiacCardPng(result)}
            fileName={`zodiac-${result.thaiSign.id}-${result.westernSign.id}.png`}
            label="บันทึกการ์ดภาพสรุปผลราศี (PNG)"
          />

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

            {aiError && (
              <div className="bg-[#291614] border border-[#59302d] p-4 text-sm text-[#ff8a80] flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}
          </div>

          {/* AI Analysis Output & Follow-up Chat */}
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
