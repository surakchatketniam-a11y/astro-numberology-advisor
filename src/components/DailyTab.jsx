import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Moon,
  Palette,
} from 'lucide-react';
import { formatDegree } from '../utils/ephemeris';
import { getDailyForecast, shiftDate, thaiToday } from '../utils/daily';
import { useAiAdvisor } from '../hooks/useAiAdvisor';
import { AiActionBlock, DignityBadge, ScoreBar, SignPicker, loadSavedSign, saveSign } from './common';
import FormattedAnalysis from './FormattedAnalysis';
import LineShareBox from './LineShareBox';

export default function DailyTab({ settings, onOpenSettings, onSaveHistory, lastZodiacResult }) {
  const [signId, setSignId] = useState(() => loadSavedSign() || 'aries');
  const [hasChosen, setHasChosen] = useState(() => Boolean(loadSavedSign()));
  const [date, setDate] = useState(() => thaiToday());
  const ai = useAiAdvisor({ settings, onOpenSettings });

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
    ai.reset();
  };

  const changeDate = (next) => {
    setDate(next);
    ai.reset();
  };

  const handleDeepAnalyze = async () => {
    const f = forecast;
    const prompt = [
      `กรุณาให้คำแนะนำดวงรายวันเชิงจิตวิทยาและการวางแผนวัน สำหรับผู้ที่มีราศีกำเนิดแบบไทย: ${f.sign.thName}`,
      `- วันที่: ${f.dateLabel} (${f.dayOfWeek.name})`,
      `- จันทร์จรอยู่${f.moon.sign.thName} ${formatDegree(f.moon.degreeInSign)} (เรือนที่ ${f.moon.house} นับจากราศีกำเนิด: ${f.headline})`,
      `- อาทิตย์จรอยู่${f.sun.sign.thName}`,
      `- ดาวจรอื่นๆ: ${f.planets
        .map((p) => `${p.label}${p.sign.thName} เรือน ${p.house}${p.retrograde ? ' (ถอยหลัง)' : ''}`)
        .join(', ')}`,
      f.dignityNotes.length ? `- สถานะอุจจ์/นิจของดาวจร: ${f.dignityNotes.join(', ')}` : '',
      `- คะแนนเบื้องต้นรายด้าน: ${f.areas.map((a) => `${a.label} ${a.score}/5`).join(', ')}`,
      `ขอให้อธิบายภาพรวมของวัน เปรียบเทียบมุมมองโหราศาสตร์ไทยกับสากลสั้นๆ เชื่อมโยงกับการจัดการอารมณ์และการบริหารความเสี่ยง พร้อมแนวทางปฏิบัติ 3-5 ข้อ และสรุปสำหรับส่งต่อใน LINE`,
    ]
      .filter(Boolean)
      .join('\n');
    const response = await ai.run(prompt);
    if (response) {
      onSaveHistory({
        category: 'daily',
        isAI: true,
        title: `AI ดวงรายวัน ${f.sign.thName} — ${f.dateLabel}`,
        subtitle: f.headline,
        analysis: response.analysis,
        lineSummary: response.lineSummary,
      });
    }
  };

  const showAiSummary = ai.aiResult && !ai.aiResult.streaming;

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

        <SignPicker
          signId={signId}
          onChange={changeSign}
          note={!hasChosen && lastZodiacResult ? 'ใช้จากผลเช็กราศีล่าสุด' : null}
        />

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
              {forecast.moon.changesSign && ' • ย้ายราศีในวันนี้'}{' '}
              <DignityBadge dignity={forecast.moon.dignity} />
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
                <td className="py-2 text-[#7D7D7D]">
                  เดินหน้า <DignityBadge dignity={forecast.sun.dignity} />
                </td>
              </tr>
              {forecast.planets.map((p) => (
                <tr key={p.key} className="border-b border-[#202020] last:border-0">
                  <td className="py-2 pr-3">{p.label}</td>
                  <td className="py-2 pr-3">
                    {p.sign.thName} {formatDegree(p.degreeInSign)}
                  </td>
                  <td className="py-2 pr-3">{p.house}</td>
                  <td className={`py-2 ${p.retrograde ? 'text-[#FFC000]' : 'text-[#7D7D7D]'}`}>
                    {p.retrograde ? 'ถอยหลัง' : 'เดินหน้า'} <DignityBadge dignity={p.dignity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AiActionBlock
        settings={settings}
        loadingAI={ai.loadingAI}
        aiError={ai.aiError}
        onRun={handleDeepAnalyze}
        onStop={ai.stop}
        runLabel="ขอคำแนะนำเชิงลึกด้วย AI"
        loadingLabel="กำลังวิเคราะห์ดวงรายวันด้วย"
      />

      {ai.aiResult && <FormattedAnalysis content={ai.aiResult.analysis} model={settings.model} />}

      <LineShareBox
        text={showAiSummary ? ai.aiResult.lineSummary : forecast.lineSummary}
        title={
          showAiSummary
            ? 'ข้อความสรุปดวงรายวันจาก AI สำหรับส่งต่อใน LINE'
            : 'ข้อความสรุปดวงรายวันสำหรับส่งต่อใน LINE'
        }
      />
    </div>
  );
}
