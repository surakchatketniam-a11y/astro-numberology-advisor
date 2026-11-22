import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Clock,
  Heart,
  Loader2,
  Sparkles,
  Square,
  ThumbsUp,
  Users,
} from 'lucide-react';
import { THAI_MONTHS } from '../utils/zodiac';
import { analyzeCompatibility, displayName } from '../utils/compatibility';
import { callGeminiAdvisor } from '../services/gemini';
import ProfileBar from './ProfileBar';
import FormattedAnalysis from './FormattedAnalysis';
import LineShareBox from './LineShareBox';

function PersonCard({ title, accent, value, onChange }) {
  const currentYearAD = new Date().getFullYear();
  const years = useMemo(() => {
    const list = [];
    for (let y = currentYearAD; y >= 1935; y--) list.push(y);
    return list;
  }, [currentYearAD]);
  const maxDay = new Date(value.yearAD, value.month, 0).getDate();
  const day = Math.min(value.day, maxDay);
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className={`lambo-card border-t-2 ${accent} p-5 space-y-4`}>
      <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px]">{title}</p>
      <ProfileBar
        current={{ day, month: value.month, yearAD: value.yearAD, birthTime: value.birthTime, birthProvince: '' }}
        defaultName={value.name}
        onPick={(p) => set({ name: p.name, day: p.day, month: p.month, yearAD: p.yearAD, birthTime: p.birthTime })}
      />
      <input
        type="text"
        value={value.name}
        onChange={(e) => set({ name: e.target.value })}
        placeholder="ชื่อ/ชื่อเล่น (ไม่บังคับ)"
        maxLength={30}
        className="lambo-input"
      />
      <div className="grid grid-cols-[3.75rem_1fr_5.25rem] gap-2">
        <select
          aria-label={`${title} วันที่เกิด`}
          value={day}
          onChange={(e) => set({ day: Number(e.target.value) })}
          className="lambo-input px-2! text-sm"
        >
          {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d} className="bg-black text-white">
              {d}
            </option>
          ))}
        </select>
        <select
          aria-label={`${title} เดือนเกิด`}
          value={value.month}
          onChange={(e) => set({ month: Number(e.target.value) })}
          className="lambo-input px-2! text-sm"
        >
          {THAI_MONTHS.map((m, i) => (
            <option key={m} value={i + 1} className="bg-black text-white">
              {m}
            </option>
          ))}
        </select>
        <select
          aria-label={`${title} ปีเกิด`}
          value={value.yearAD}
          onChange={(e) => set({ yearAD: Number(e.target.value) })}
          className="lambo-input px-2! text-sm"
        >
          {years.map((y) => (
            <option key={y} value={y} className="bg-black text-white">
              {y + 543}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-[#7D7D7D] mb-2 flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> เวลาเกิด (ไม่บังคับ — ให้ราศีจันทร์แม่นขึ้น)
        </label>
        <input
          type="time"
          value={value.birthTime}
          onChange={(e) => set({ birthTime: e.target.value })}
          className="lambo-input"
        />
      </div>
    </div>
  );
}

function Meter({ score }) {
  return (
    <div className="h-2 bg-[#333333] w-full" role="img" aria-label={`${score}%`}>
      <div className="h-2 bg-[#FFC000]" style={{ width: `${score}%` }} />
    </div>
  );
}

export default function CompatibilityTab({ settings, onOpenSettings, onSaveHistory }) {
  const [a, setA] = useState({ name: '', day: 15, month: 4, yearAD: 1995, birthTime: '' });
  const [b, setB] = useState({ name: '', day: 20, month: 8, yearAD: 1996, birthTime: '' });
  const [result, setResult] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const normalize = (p) => ({ ...p, day: Math.min(p.day, new Date(p.yearAD, p.month, 0).getDate()) });

  const handleAnalyze = (e) => {
    e.preventDefault();
    abortRef.current?.abort();
    const r = analyzeCompatibility(normalize(a), normalize(b));
    setResult(r);
    setAiResult(null);
    setAiError('');
    onSaveHistory({
      category: 'compat',
      isAI: false,
      title: `ความเข้ากัน ${displayName(r.a, 'คนที่ 1')} & ${displayName(r.b, 'คนที่ 2')} — ${r.percent}%`,
      subtitle: `${r.a.sunSign.thName} + ${r.b.sunSign.thName} • ${r.label}`,
      lineSummary: r.lineSummary,
    });
  };

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
      const { a: pa, b: pb } = result;
      const describePerson = (p, fallback) =>
        `${displayName(p, fallback)}: เกิด ${p.formattedDateTH} (${p.dayOfWeek.name}) ราศีไทย${p.sunSign.thName} (${p.sunSign.element}) ราศีจันทร์${p.moonSign.thName}${p.moonUncertain ? ' (โดยประมาณ)' : ''} เลขรหัสชีวิต ${p.lifePath}`;
      const prompt = [
        `กรุณาวิเคราะห์ความเข้ากันของสองคนเชิงจิตวิทยาความสัมพันธ์:`,
        `- ${describePerson(pa, 'คนที่ 1')}`,
        `- ${describePerson(pb, 'คนที่ 2')}`,
        `- คะแนนเบื้องต้นจากระบบ: ภาพรวม ${result.percent}% (${result.label}); ${result.dimensions
          .map((d) => `${d.label} ${d.score}%`)
          .join(', ')}`,
        ``,
        `ขอให้อธิบายจุดเกื้อหนุนและจุดที่ควรเข้าใจกัน เปรียบเทียบมุมมองโหราศาสตร์ไทยกับสากลสั้นๆ ห้ามตัดสินว่าคู่ใดไม่คู่ควรหรือสร้างความหวาดกลัว เชื่อมโยงกับการสื่อสาร การจัดการอารมณ์ และการตั้งขอบเขตที่ดี พร้อมแนวทางปฏิบัติที่ทั้งคู่ทำได้จริง 3-5 ข้อ และสรุปสำหรับส่งต่อใน LINE`,
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
        category: 'compat',
        isAI: true,
        title: `AI วิเคราะห์ความเข้ากัน ${displayName(pa, 'คนที่ 1')} & ${displayName(pb, 'คนที่ 2')}`,
        subtitle: `${result.percent}% • ${result.label}`,
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
  const nameA = result ? displayName(result.a, 'คนที่ 1') : '';
  const nameB = result ? displayName(result.b, 'คนที่ 2') : '';

  return (
    <div className="space-y-6">
      <form onSubmit={handleAnalyze} className="lambo-panel p-5 sm:p-8 space-y-6">
        <div className="border-b border-[#333333] pb-4">
          <p className="font-display-latin text-xs text-[#FFC000] tracking-[0.225px] mb-1">
            COMPATIBILITY ENGINE
          </p>
          <h2 className="text-xl sm:text-2xl font-medium text-white flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-[#FFC000] shrink-0" />
            ดูคู่ความเข้ากัน
          </h2>
          <p className="text-sm sm:text-base text-[#7D7D7D] mt-1">
            เทียบราศีอาทิตย์ ราศีจันทร์ ธาตุ และเลขรหัสชีวิตของสองคน คำนวณจากตำแหน่งดาวจริงแบบออฟไลน์
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PersonCard title="PERSON 01" accent="border-t-[#FFC000]" value={a} onChange={setA} />
          <PersonCard title="PERSON 02" accent="border-t-[#29ABE2]" value={b} onChange={setB} />
        </div>

        <button
          type="submit"
          className="lambo-btn-gold w-full px-6 py-4 text-base flex items-center justify-center gap-2 cursor-pointer"
        >
          <Users className="h-4 w-4" />
          วิเคราะห์ความเข้ากัน
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="lambo-card border-t-2 border-t-[#FFC000] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-[#7D7D7D]">
                  {nameA} &amp; {nameB}
                </p>
                <h3 className="text-xl sm:text-2xl font-medium text-white mt-1">{result.label}</h3>
              </div>
              <div className="px-5 py-3 bg-black border border-[#FFC000] text-center">
                <span className="text-3xl font-semibold text-[#FFC000]">{result.percent}</span>
                <span className="text-sm text-[#FFC000]">%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[result.a, result.b].map((p, i) => (
                <div key={i} className="bg-black border border-[#333333] p-4 space-y-1">
                  <p className="font-medium text-white">{i === 0 ? nameA : nameB}</p>
                  <p className="text-[#a6a6a6]">
                    {p.sunSign.thName} ({p.sunSign.element}) • จันทร์{p.moonSign.thName.replace('ราศี', '')}
                    {p.moonUncertain ? ' (โดยประมาณ)' : ''} • เลขชีวิต {p.lifePath}
                  </p>
                  <p className="text-[#7D7D7D]">
                    {p.formattedDateTH} • {p.dayOfWeek.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {result.dimensions.map((d) => (
                <div key={d.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white">
                      {d.label}
                      {d.approx && <span className="text-[#7D7D7D] font-normal"> (โดยประมาณ)</span>}
                    </span>
                    <span className="text-[#FFC000]">{d.score}%</span>
                  </div>
                  <Meter score={d.score} />
                  <p className="text-sm text-[#a6a6a6] leading-[1.6]">{d.note}</p>
                </div>
              ))}
            </div>

            {result.notes.map((n) => (
              <p key={n} className="text-sm text-[#7D7D7D]">
                * {n}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="lambo-card p-5 space-y-3">
              <p className="text-sm font-medium text-[#4ade80] flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" /> จุดเกื้อหนุน
              </p>
              {result.strengths.length ? (
                <ul className="space-y-2 text-sm text-[#F5F5F5] leading-[1.6] list-disc pl-5">
                  {result.strengths.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#7D7D7D]">ความต่างคือโอกาสเรียนรู้ที่จะเติบโตไปด้วยกัน</p>
              )}
            </div>
            <div className="lambo-card p-5 space-y-3">
              <p className="text-sm font-medium text-[#FFCE3E] flex items-center gap-2">
                <Heart className="h-4 w-4" /> จุดที่ควรเข้าใจกัน
              </p>
              {result.cares.length ? (
                <ul className="space-y-2 text-sm text-[#F5F5F5] leading-[1.6] list-disc pl-5">
                  {result.cares.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#7D7D7D]">ไม่พบจุดที่ต้องระวังเป็นพิเศษ</p>
              )}
            </div>
          </div>

          <div className="lambo-panel p-5 sm:p-6">
            <p className="text-xs font-medium text-[#FFCE3E] mb-2">แนวทางสำหรับทั้งคู่</p>
            <ol className="space-y-1.5 text-base text-[#F5F5F5] list-decimal pl-5 leading-[1.6]">
              {result.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
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
                  กำลังวิเคราะห์ความเข้ากันด้วย {settings.model}...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#FFC000]" />
                  {settings.apiKey
                    ? `วิเคราะห์ความสัมพันธ์เชิงลึกด้วย AI (${settings.model})`
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

          {aiResult && <FormattedAnalysis content={aiResult.analysis} model={settings.model} />}

          <LineShareBox
            text={showAiSummary ? aiResult.lineSummary : result.lineSummary}
            title={
              showAiSummary
                ? 'ข้อความสรุปความเข้ากันจาก AI สำหรับส่งต่อใน LINE'
                : 'ข้อความสรุปความเข้ากันสำหรับส่งต่อใน LINE'
            }
          />
        </div>
      )}
    </div>
  );
}
