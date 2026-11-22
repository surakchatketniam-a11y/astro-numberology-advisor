import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarRange, ChevronLeft, ChevronRight, Moon, Sparkles, Star } from 'lucide-react';
import { getMonthlyForecast, shiftMonth } from '../utils/monthly';
import { thaiToday } from '../utils/daily';
import { useAiAdvisor } from '../hooks/useAiAdvisor';
import { AiActionBlock, ScoreBar, SignPicker, loadSavedSign, saveSign } from './common';
import FormattedAnalysis from './FormattedAnalysis';
import LineShareBox from './LineShareBox';

const EVENT_STYLE = {
  ingress: { label: 'ย้ายราศี', color: 'text-[#29ABE2]' },
  retro: { label: 'ถอยหลัง', color: 'text-[#FFC000]' },
  direct: { label: 'เดินหน้า', color: 'text-[#4ade80]' },
  newmoon: { label: 'จันทร์ดับ', color: 'text-[#a6a6a6]' },
  fullmoon: { label: 'จันทร์เพ็ญ', color: 'text-[#FFCE3E]' },
};

export default function MonthlyTab({ settings, onOpenSettings, onSaveHistory, lastZodiacResult }) {
  const [signId, setSignId] = useState(() => loadSavedSign() || 'aries');
  const [hasChosen, setHasChosen] = useState(() => Boolean(loadSavedSign()));
  const [ym, setYm] = useState(() => {
    const t = thaiToday();
    return { year: t.year, month: t.month };
  });
  const ai = useAiAdvisor({ settings, onOpenSettings });

  useEffect(() => {
    if (!hasChosen && lastZodiacResult?.thaiSign?.id) setSignId(lastZodiacResult.thaiSign.id);
  }, [lastZodiacResult, hasChosen]);

  const forecast = useMemo(() => getMonthlyForecast({ signId, ...ym }), [signId, ym]);

  const now = thaiToday();
  const isCurrent = now.year === ym.year && now.month === ym.month;

  const changeSign = (id) => {
    setSignId(id);
    setHasChosen(true);
    saveSign(id);
    ai.reset();
  };
  const changeMonth = (next) => {
    setYm(next);
    ai.reset();
  };

  const handleDeepAnalyze = async () => {
    const f = forecast;
    const prompt = [
      `กรุณาให้คำแนะนำดวงรายเดือนเชิงจิตวิทยาและการวางแผนชีวิต สำหรับผู้ที่มีราศีกำเนิดแบบไทย: ${f.sign.thName}`,
      `- เดือน: ${f.monthLabel}`,
      `- ภาพรวม: ${f.headline}`,
      `- คะแนนเบื้องต้นรายด้าน: ${f.areas.map((a) => `${a.label} ${a.score}/5`).join(', ')}`,
      `- วันเด่น: ${f.bestDays.join(', ')} | วันควรเผื่อเวลา: ${f.calmDays.join(', ')}`,
      `- เหตุการณ์ทางดาวที่สำคัญ: ${f.events.map((e) => `วันที่ ${e.day} ${e.title}`).join('; ')}`,
      ``,
      `ขอให้อธิบายภาพรวมของเดือนและรายสัปดาห์ เปรียบเทียบมุมมองโหราศาสตร์ไทยกับสากลสั้นๆ เชื่อมโยงกับการจัดการอารมณ์ การบริหารความเสี่ยง และการตั้งเป้าหมาย พร้อมแนวทางปฏิบัติที่ทำได้จริง 3-5 ข้อ และสรุปสำหรับส่งต่อใน LINE`,
    ].join('\n');
    const response = await ai.run(prompt);
    if (response) {
      onSaveHistory({
        category: 'monthly',
        isAI: true,
        title: `AI ดวงรายเดือน ${f.sign.thName} — ${f.monthLabel}`,
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
            MONTHLY TRANSIT ENGINE
          </p>
          <h2 className="text-xl sm:text-2xl font-medium text-white flex items-center gap-2.5">
            <CalendarRange className="h-5 w-5 text-[#FFC000] shrink-0" />
            ดวงรายเดือนจากดาวจรจริง
          </h2>
          <p className="text-sm sm:text-base text-[#7D7D7D] mt-1">
            เฉลี่ยตำแหน่งดาวตลอดเดือนเทียบราศีกำเนิด พร้อมสัปดาห์ วันเด่น และเหตุการณ์ทางดาว (ออฟไลน์)
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
            onClick={() => changeMonth(shiftMonth(ym, -1))}
            className="h-12 w-12 flex items-center justify-center text-[#a6a6a6] hover:text-white hover:bg-[#202020] cursor-pointer"
            aria-label="เดือนก่อนหน้า"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center min-w-0">
            <p className="text-base font-medium text-white">{forecast.monthLabel}</p>
            {isCurrent && <p className="text-xs text-[#7D7D7D]">เดือนนี้</p>}
          </div>
          <div className="flex items-center">
            {!isCurrent && (
              <button
                type="button"
                onClick={() => changeMonth({ year: now.year, month: now.month })}
                className="h-12 px-3 text-xs text-[#FFC000] hover:bg-[#202020] cursor-pointer"
              >
                เดือนนี้
              </button>
            )}
            <button
              type="button"
              onClick={() => changeMonth(shiftMonth(ym, 1))}
              className="h-12 w-12 flex items-center justify-center text-[#a6a6a6] hover:text-white hover:bg-[#202020] cursor-pointer"
              aria-label="เดือนถัดไป"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="lambo-card border-t-2 border-t-[#FFC000] p-5 sm:p-6 space-y-4">
        <div>
          <p className="font-display-latin text-[11px] text-[#FFCE3E] tracking-[0.225px]">MONTH THEME</p>
          <h3 className="text-lg sm:text-xl font-medium text-white mt-0.5">{forecast.headline}</h3>
        </div>
        <p className="text-base text-[#F5F5F5] leading-[1.7]">{forecast.summary}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {forecast.mercuryRetroInMonth && (
          <div className="bg-[#181400] border border-[#594300] p-4 text-sm text-[#FFCE3E] flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              มีช่วงพุธเดินถอยหลังในเดือนนี้: ตรวจทานเอกสารและนัดหมายซ้ำ (เป็นจังหวะให้รอบคอบ ไม่ใช่เรื่องน่ากังวล)
            </span>
          </div>
        )}
      </div>

      <div className="lambo-panel p-5 sm:p-6 space-y-4">
        <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px]">WEEKLY OUTLOOK</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {forecast.weeks.map((w) => (
            <div key={w.index} className="bg-black border border-[#333333] p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white">
                  สัปดาห์ที่ {w.index} (วันที่ {w.from}–{w.to})
                </span>
                <ScoreBar score={w.score} />
              </div>
              <p className="text-sm text-[#a6a6a6]">
                เด่น: {w.best} • ควรดูแล: {w.care}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-black border border-[#333333] px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-[#7D7D7D] flex items-center gap-1.5">
              <Star className="h-4 w-4 text-[#FFC000]" /> วันเด่น
            </span>
            <span className="text-white font-medium">วันที่ {forecast.bestDays.join(', ')}</span>
          </div>
          <div className="bg-black border border-[#333333] px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-[#7D7D7D] flex items-center gap-1.5">
              <Moon className="h-4 w-4" /> วันควรเผื่อเวลา
            </span>
            <span className="text-white font-medium">วันที่ {forecast.calmDays.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="lambo-panel p-5 sm:p-6 space-y-3">
        <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px]">SKY EVENTS</p>
        {forecast.events.length === 0 ? (
          <p className="text-sm text-[#7D7D7D]">ไม่มีเหตุการณ์สำคัญในเดือนนี้</p>
        ) : (
          <ul className="divide-y divide-[#202020]">
            {forecast.events.map((e, i) => {
              const st = EVENT_STYLE[e.type];
              return (
                <li key={`${e.day}-${e.title}-${i}`} className="py-3 flex gap-4">
                  <span className="w-10 shrink-0 text-center">
                    <span className="block text-xl font-semibold text-white leading-none">{e.day}</span>
                    <span className={`block text-[10px] mt-1 ${st.color}`}>{st.label}</span>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{e.title}</p>
                    <p className="text-sm text-[#a6a6a6] leading-[1.6]">{e.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="lambo-panel p-5 sm:p-6">
        <p className="text-xs font-medium text-[#FFCE3E] mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> แนวทางประจำเดือน
        </p>
        <ol className="space-y-1.5 text-base text-[#F5F5F5] list-decimal pl-5 leading-[1.6]">
          {forecast.advice.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </div>

      <AiActionBlock
        settings={settings}
        loadingAI={ai.loadingAI}
        aiError={ai.aiError}
        onRun={handleDeepAnalyze}
        onStop={ai.stop}
        runLabel="ขอคำแนะนำรายเดือนเชิงลึกด้วย AI"
        loadingLabel="กำลังวิเคราะห์ดวงรายเดือนด้วย"
      />

      {ai.aiResult && <FormattedAnalysis content={ai.aiResult.analysis} model={settings.model} />}

      <LineShareBox
        text={showAiSummary ? ai.aiResult.lineSummary : forecast.lineSummary}
        title={
          showAiSummary
            ? 'ข้อความสรุปดวงรายเดือนจาก AI สำหรับส่งต่อใน LINE'
            : 'ข้อความสรุปดวงรายเดือนสำหรับส่งต่อใน LINE'
        }
      />
    </div>
  );
}
