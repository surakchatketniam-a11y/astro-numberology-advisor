import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Moon,
  Palette,
  Sparkles,
  Square,
} from 'lucide-react';
import { ZODIAC_DATA } from '../utils/zodiac';
import { SIGN_IDS, formatDegree } from '../utils/ephemeris';
import { getDailyForecast, shiftDate, thaiToday } from '../utils/daily';
import { callGeminiAdvisor } from '../services/gemini';
import FormattedAnalysis from './FormattedAnalysis';
import LineShareBox from './LineShareBox';

const SIGN_KEY = 'astro_advisor_daily_sign_v1';

function loadSavedSign() {
  try {
    const v = localStorage.getItem(SIGN_KEY);
    return SIGN_IDS.includes(v) ? v : null;
  } catch {
    return null;
  }
}

function saveSign(id) {
  try {
    localStorage.setItem(SIGN_KEY, id);
  } catch {
    // ignore
  }
}

function ScoreBar({ score }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`คะแนน ${score} จาก 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-2 w-6 ${n <= score ? 'bg-[#FFC000]' : 'bg-[#333333]'}`} />
      ))}
    </div>
  );
}

export default function DailyTab({ settings, onOpenSettings, onSaveHistory, lastZodiacResult }) {
  const [signId, setSignId] = useState(() => loadSavedSign() || 'aries');
  const [hasChosen, setHasChosen] = useState(() => Boolean(loadSavedSign()));
  const [date, setDate] = useState(() => thaiToday());
  const [aiResult, setAiResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  // ถ้ายังไม่เคยเลือกราศี ให้ใช้ราศีไทยจากผลเช็กราศีล่าสุด
  useEffect(() => {
    if (!hasChosen && lastZodiacResult?.thaiSign?.id) {
      setSignId(lastZodiacResult.thaiSign.id);
    }
  }, [lastZodiacResult, hasChosen]);

  const forecast = useMemo(
    () => getDailyForecast({ signId, year: date.year, month: date.month, day: date.day }),
    [signId, date]
  );

  const today = thaiToday();
  const isToday = today.year === date.year && today.month === date.month && today.day === date.day;

  const changeSign = (id) => {
    setSignId(id);
    setHasChosen(true);
    saveSign(id);
    setAiResult(null);
    setAiError('');
  };

  const changeDate = (next) => {
    setDate(next);
    setAiResult(null);
    setAiError('');
  };

  const handleStop = () => abortRef.current?.abort();

  const handleDeepAnalyze = async () => {
    if (!settings.apiKey) {
      onOpenSettings();
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoadingAI(true);
    setAiError('');
    try {
      const f = forecast;
      const prompt = [
        `กรุณาให้คำแนะนำดวงรายวันเชิงจิตวิทยาและการวางแผนวัน สำหรับผู้ที่มีราศีกำเนิดแบบไทย: ${f.sign.thName}`,
        `- วันที่: ${f.dateLabel} (${f.dayOfWeek.name})`,
        `- จันทร์จรอยู่${f.moon.sign.thName} ${formatDegree(f.moon.degreeInSign)} (เรือนที่ ${f.moon.house} นับจากราศีกำเนิด: ${f.headline})`,
        `- อาทิตย์จรอยู่${f.sun.sign.thName}`,
        `- ดาวจรอื่นๆ: ${f.planets
          .map((p) => `${p.label}${p.sign.thName} เรือน ${p.house}${p.retrograde ? ' (ถอยหลัง)' : ''}`)
          .join(', ')}`,
        `- คะแนนเบื้องต้นรายด้าน: ${f.areas.map((a) => `${a.label} ${a.score}/5`).join(', ')}`,
        `ขอให้อธิบายภาพรวมของวัน เปรียบเทียบมุมมองโหราศาสตร์ไทยกับสากลสั้นๆ เชื่อมโยงกับการจัดการอารมณ์และการบริหารความเสี่ยง พร้อมแนวทางปฏิบัติ 3-5 ข้อ และสรุปสำหรับส่งต่อใน LINE`,
      ].join('\n');

      const response = await callGeminiAdvisor({
        apiKey: settings.apiKey,
        model: settings.model,
        prompt,
        onPartial: setAiResult,
        signal: controller.signal,
      });
      setAiResult(response);
      onSaveHistory({
        category: 'daily',
        isAI: true,
        title: `AI ดวงรายวัน ${f.sign.thName} — ${f.dateLabel}`,
        subtitle: f.headline,
        analysis: response.analysis,
        lineSummary: response.lineSummary,
      });
    } catch (err) {
      setAiResult(null);
      if (controller.signal.aborted) return;
      setAiError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini API');
    } finally {
      setLoadingAI(false);
    }
  };

  const showAiSummary = aiResult && !aiResult.streaming;

  return (
    <div className="space-y-6">
      <div className="lambo-panel p-5 sm:p-8 space-y-6">
        <div className="border-b border-[#333333] pb-4">
          <p className="font-display-latin text-xs text-[#FFC000] tracking-[0.225px] mb-1">
            DAILY TRANSIT ENGINE
          </p>
          <h2 className="text-xl sm:text-2xl font-medium text-white flex items-center gap-2.5">
            <CalendarDays className="h-5 w-5 text-[#FFC000] shrink-0" />
            ดวงรายวันจากดาวจรจริง
          </h2>
          <p className="text-sm sm:text-base text-[#7D7D7D] mt-1">
            คำนวณตำแหน่งดาวของวันนั้นเทียบกับราศีกำเนิดของคุณ (ราศีไทยนิรายนะ) แบบออฟไลน์
          </p>
        </div>

        <div>
          <p className="text-sm text-[#a6a6a6] mb-2">
            ราศีกำเนิด (ไทย)
            {!hasChosen && lastZodiacResult && (
              <span className="text-[#7D7D7D]"> — ใช้จากผลเช็กราศีล่าสุด</span>
            )}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {SIGN_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => changeSign(id)}
                aria-pressed={signId === id}
                className={`px-2 py-2.5 text-sm border transition-colors cursor-pointer ${
                  signId === id
                    ? 'bg-[#2e2300] border-[#FFC000] text-[#FFC000]'
                    : 'bg-[#181818] border-[#333333] text-[#a6a6a6] hover:border-[#494949] hover:text-white'
                }`}
              >
                {ZODIAC_DATA[id].thName.replace('ราศี', '')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border border-[#333333] bg-[#181818]">
          <button
            type="button"
            onClick={() => changeDate(shiftDate(date, -1))}
            className="h-12 w-12 flex items-center justify-center text-[#a6a6a6] hover:text-white hover:bg-[#202020] cursor-pointer"
            aria-label="วันก่อนหน้า"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center min-w-0">
            <p className="text-base font-medium text-white">{forecast.dateLabel}</p>
            <p className="text-xs text-[#7D7D7D]">
              {forecast.dayOfWeek.name}
              {isToday && ' • วันนี้'}
            </p>
          </div>
          <div className="flex items-center">
            {!isToday && (
              <button
                type="button"
                onClick={() => changeDate(thaiToday())}
                className="h-12 px-3 text-xs text-[#FFC000] hover:bg-[#202020] cursor-pointer"
              >
                วันนี้
              </button>
            )}
            <button
              type="button"
              onClick={() => changeDate(shiftDate(date, 1))}
              className="h-12 w-12 flex items-center justify-center text-[#a6a6a6] hover:text-white hover:bg-[#202020] cursor-pointer"
              aria-label="วันถัดไป"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="lambo-card border-t-2 border-t-[#FFC000] p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 bg-[#202020] border border-[#333333] flex items-center justify-center text-[#FFC000] shrink-0">
            <Moon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-display-latin text-[11px] text-[#FFCE3E] tracking-[0.225px]">
              MOON TRANSIT • HOUSE {forecast.moon.house}
            </p>
            <h3 className="text-lg sm:text-xl font-medium text-white mt-0.5">{forecast.headline}</h3>
            <p className="text-sm text-[#7D7D7D] mt-0.5">
              จันทร์อยู่{forecast.moon.sign.thName} {formatDegree(forecast.moon.degreeInSign)} (เที่ยงวัน)
              {forecast.moon.changesSign && ' • ย้ายราศีในวันนี้'}
            </p>
          </div>
        </div>
        <p className="text-base text-[#F5F5F5] leading-[1.7]">{forecast.summary}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {forecast.areas.map((a) => (
            <div key={a.id} className="bg-black border border-[#333333] p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white">{a.label}</span>
                <ScoreBar score={a.score} />
              </div>
              <p className="text-sm text-[#a6a6a6] leading-[1.6]">{a.text}</p>
            </div>
          ))}
        </div>

        {forecast.mercuryRetrograde && (
          <div className="bg-[#181400] border border-[#594300] p-4 text-sm text-[#FFCE3E] flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              พุธเดินถอยหลัง: ตรวจทานเอกสาร ข้อความ และนัดหมายซ้ำก่อนยืนยัน (เป็นจังหวะให้รอบคอบ ไม่ใช่เรื่องน่ากังวล)
            </span>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-[#FFCE3E] mb-2">แนวทางสำหรับวันนี้</p>
          <ol className="space-y-1.5 text-base text-[#F5F5F5] list-decimal pl-5 leading-[1.6]">
            {forecast.advice.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>

        <div className="bg-black border border-[#333333] px-4 py-2.5 text-sm flex items-center justify-between gap-3">
          <span className="text-[#7D7D7D] flex items-center gap-1.5">
            <Palette className="h-4 w-4" /> สีประจำวัน
          </span>
          <span className="text-white font-medium">{forecast.luckyColor}</span>
        </div>
      </div>

      <div className="lambo-panel p-5 sm:p-6">
        <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px] mb-3">
          ดาวจรวันนี้ (นิรายนะ)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#7D7D7D] border-b border-[#333333]">
                <th className="py-2 pr-3 font-normal">ดาว</th>
                <th className="py-2 pr-3 font-normal">ราศี</th>
                <th className="py-2 pr-3 font-normal">เรือนที่</th>
                <th className="py-2 font-normal">สถานะ</th>
              </tr>
            </thead>
            <tbody className="text-[#F5F5F5]">
              <tr className="border-b border-[#202020]">
                <td className="py-2 pr-3">อาทิตย์</td>
                <td className="py-2 pr-3">
                  {forecast.sun.sign.thName} {formatDegree(forecast.sun.degreeInSign)}
                </td>
                <td className="py-2 pr-3">—</td>
                <td className="py-2 text-[#7D7D7D]">เดินหน้า</td>
              </tr>
              {forecast.planets.map((p) => (
                <tr key={p.key} className="border-b border-[#202020] last:border-0">
                  <td className="py-2 pr-3">{p.label}</td>
                  <td className="py-2 pr-3">
                    {p.sign.thName} {formatDegree(p.degreeInSign)}
                  </td>
                  <td className="py-2 pr-3">{p.house}</td>
                  <td className={`py-2 ${p.retrograde ? 'text-[#FFC000]' : 'text-[#7D7D7D]'}`}>
                    {p.retrograde ? 'ถอยหลัง' : 'เดินหน้า'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lambo-panel p-5 sm:p-6 space-y-4">
        <button
          type="button"
          onClick={handleDeepAnalyze}
          disabled={loadingAI}
          className="lambo-btn-ghost w-full px-5 py-3.5 text-base font-medium flex items-center justify-center gap-2 cursor-pointer"
        >
          {loadingAI ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังวิเคราะห์ดวงรายวันด้วย {settings.model}...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-[#FFC000]" />
              {settings.apiKey
                ? `ขอคำแนะนำเชิงลึกด้วย AI (${settings.model})`
                : 'ตั้งค่า Gemini API Key เพื่อขอคำแนะนำเชิงลึก'}
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

      {aiResult && <FormattedAnalysis content={aiResult.analysis} model={settings.model} />}

      <LineShareBox
        text={showAiSummary ? aiResult.lineSummary : forecast.lineSummary}
        title={
          showAiSummary
            ? 'ข้อความสรุปดวงรายวันจาก AI สำหรับส่งต่อใน LINE'
            : 'ข้อความสรุปดวงรายวันสำหรับส่งต่อใน LINE'
        }
      />
    </div>
  );
}
