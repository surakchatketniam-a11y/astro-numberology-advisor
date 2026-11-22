import React, { useState, useRef } from 'react';
import {
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { callGeminiAdvisor, prepareImageForGemini } from '../services/gemini';
import FormattedAnalysis from './FormattedAnalysis';
import LineShareBox from './LineShareBox';

export default function ImageAnalysisTab({
  settings,
  onOpenSettings,
  onSaveHistory,
  lastZodiacResult,
}) {
  const fileInputRef = useRef(null);
  const [imageData, setImageData] = useState(null); // { base64, mimeType, previewUrl, fileName }
  const [userContext, setUserContext] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');
  const [aiResult, setAiResult] = useState(null);

  const handleFileChange = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WEBP)');
      return;
    }

    setLoadingImage(true);
    setError('');
    setAiResult(null);
    try {
      const prepared = await prepareImageForGemini(file);
      setImageData({ ...prepared, fileName: file.name });
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดรูปภาพได้');
    } finally {
      setLoadingImage(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleClearImage = () => {
    setImageData(null);
    setAiResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyLastZodiac = () => {
    if (!lastZodiacResult) return;
    const snippet = `ฉันเกิดวันที่ ${lastZodiacResult.formattedDateTH} (โหราศาสตร์ไทย: ${lastZodiacResult.thaiSign.thName}, โหราศาสตร์สากล: ${lastZodiacResult.westernSign.thName}) ช่วยวิเคราะห์ภาพคำทำนายนี้ให้ตรงกับราศีของฉัน`;
    setUserContext(snippet);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!imageData) {
      setError('กรุณาอัปโหลดรูปภาพคำทำนายก่อนเริ่มการวิเคราะห์');
      return;
    }
    if (!settings.apiKey) {
      onOpenSettings();
      return;
    }

    setLoadingAI(true);
    setError('');
    try {
      const prompt = [
        `กรุณาอ่านและวิเคราะห์เนื้อหาในรูปภาพคำทำนายที่แนบมานี้ (เช่น โพสต์ดวงรายปักษ์ ดาวใหญ่ย้าย หรือคำทำนายจากโซเชียลมีเดีย):`,
        userContext.trim() ? `- ข้อมูลเพิ่มเติมจากผู้ใช้: ${userContext.trim()}` : '',
        ``,
        `สิ่งที่ต้องการ:`,
        `1. สรุปสาระสำคัญจากภาพคำทำนายอย่างชัดเจน (หากในภาพมีข้อความที่อาจทำให้กังวลหรือดูรุนแรง ให้ช่วยคลี่คลายด้วยเหตุผลโดยไม่ข่มขู่)`,
        `2. อธิบายเชิงเปรียบเทียบมุมมองโหราศาสตร์ไทยและสากลที่เกี่ยวข้อง`,
        `3. เชื่อมโยงเข้ากับหลักจิตวิทยา (Self-Awareness และการบริหารความเสี่ยง) และให้แนวทางวางแผนรับมือในชีวิตจริง (Actionable Advice)`,
        `4. ปิดท้ายด้วยข้อความสรุปสั้นๆ อ่านง่ายบนมือถือ (ไม่มีสัญลักษณ์ Markdown) เพื่อส่งต่อใน LINE`,
      ]
        .filter(Boolean)
        .join('\n');

      const response = await callGeminiAdvisor({
        apiKey: settings.apiKey,
        model: settings.model,
        prompt,
        image: {
          base64: imageData.base64,
          mimeType: imageData.mimeType,
        },
      });

      setAiResult(response);
      onSaveHistory({
        category: 'image',
        isAI: true,
        title: `วิเคราะห์ภาพคำทำนาย: ${imageData.fileName || 'รูปภาพอัปโหลด'}`,
        subtitle: userContext.trim() || 'วิเคราะห์ภาพคำทำนายด้วย Gemini Vision',
        analysis: response.analysis,
        lineSummary: response.lineSummary,
      });
    } catch (err) {
      setError(err.message || 'ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleAnalyze} className="glass-card rounded-2xl p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-amber-200 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-amber-400" />
            วิเคราะห์จากภาพคำทำนาย (Gemini Vision)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            อัปโหลดภาพโพสต์ดวงรายปักษ์ ดาวใหญ่ย้าย หรือภาพคำทำนาย เพื่อให้ AI ช่วยตีความอย่างมีเหตุผลและไม่สร้างความกังวล
          </p>
        </div>

        {/* Upload Zone */}
        {!imageData ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-400/60 bg-slate-900/60 hover:bg-slate-900/90 transition p-7 sm:p-9 text-center cursor-pointer group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            {loadingImage ? (
              <div className="flex flex-col items-center gap-2 text-amber-300">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">กำลังเตรียมรูปภาพ...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5">
                <span className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 group-hover:scale-105 transition">
                  <UploadCloud className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    แตะเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    รองรับ JPG, PNG, WEBP (ระบบปรับขนาดอัตโนมัติให้อัปโหลดเร็วบนมือถือ)
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-950/80">
            <img
              src={imageData.previewUrl}
              alt="ตัวอย่างภาพคำทำนาย"
              className="w-full max-h-80 object-contain mx-auto"
            />
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/95 border-t border-slate-800">
              <span className="text-xs text-slate-300 truncate max-w-[70%]">
                {imageData.fileName}
              </span>
              <button
                type="button"
                onClick={handleClearImage}
                className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 px-2.5 py-1 rounded-lg hover:bg-rose-500/15 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                เปลี่ยนรูป
              </button>
            </div>
          </div>
        )}

        {/* Optional User Context */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs text-slate-300">
              บริบทเพิ่มเติมหรือราศีของคุณ (ไม่บังคับ)
            </label>
            {lastZodiacResult && (
              <button
                type="button"
                onClick={handleApplyLastZodiac}
                className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 transition cursor-pointer"
              >
                + ดึงข้อมูลราศีล่าสุด ({lastZodiacResult.thaiSign.thName})
              </button>
            )}
          </div>
          <textarea
            rows={2}
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            placeholder="เช่น ฉันราศีเมษ (ไทย) / ราศีพฤษภ (สากล) อยากรู้ว่าควรวางแผนงานและการเงินอย่างไรจากภาพนี้"
            className="w-full rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400/70 focus:outline-none px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 resize-none"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loadingAI || !imageData}
          className="gold-button w-full rounded-xl py-3 px-4 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingAI ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังอ่านและวิเคราะห์ภาพด้วย {settings.model}...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {settings.apiKey
                ? `วิเคราะห์ภาพคำทำนายด้วย AI (${settings.model})`
                : 'ตั้งค่า Gemini API Key เพื่อวิเคราะห์ภาพ'}
            </>
          )}
        </button>
      </form>

      {aiResult && (
        <div className="space-y-4">
          <FormattedAnalysis content={aiResult.analysis} model={settings.model} />
          <LineShareBox
            text={aiResult.lineSummary}
            title="ข้อความสรุปจากภาพคำทำนาย (พร้อมส่งต่อใน LINE)"
          />
        </div>
      )}
    </div>
  );
}
