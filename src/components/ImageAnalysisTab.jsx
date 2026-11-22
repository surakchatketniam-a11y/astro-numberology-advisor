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
  const [imageData, setImageData] = useState(null);
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
    <div className="space-y-6">
      <form onSubmit={handleAnalyze} className="lambo-panel p-5 sm:p-8 space-y-6">
        <div className="border-b border-[#333333] pb-4">
          <p className="font-display-latin text-xs text-[#FFC000] tracking-[0.225px] mb-1">
            VISION ADVISORY ENGINE
          </p>
          <h2 className="text-xl sm:text-2xl font-medium text-white flex items-center gap-2.5">
            <ImageIcon className="h-5 w-5 text-[#FFC000] shrink-0" />
            วิเคราะห์จากภาพคำทำนาย (Gemini Vision)
          </h2>
          <p className="text-sm sm:text-base text-[#7D7D7D] mt-1">
            อัปโหลดภาพโพสต์ดวงรายปักษ์ ดาวใหญ่ย้าย หรือภาพคำทำนาย เพื่อให้ AI ช่วยตีความอย่างมีเหตุผลและไม่สร้างความกังวล
          </p>
        </div>

        {/* Upload Zone */}
        {!imageData ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-[#494949] hover:border-[#FFC000] bg-black hover:bg-[#121212] transition-colors p-8 sm:p-10 text-center cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            {loadingImage ? (
              <div className="flex flex-col items-center gap-3 text-[#FFC000]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-base">กำลังเตรียมรูปภาพ...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <span className="h-14 w-14 bg-[#181818] border border-[#333333] flex items-center justify-center text-[#FFC000]">
                  <UploadCloud className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-base font-medium text-white">
                    แตะเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่
                  </p>
                  <p className="text-sm text-[#7D7D7D] mt-1">
                    รองรับ JPG, PNG, WEBP (ระบบปรับขนาดอัตโนมัติให้อัปโหลดเร็วบนมือถือ)
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-[#333333] bg-black">
            <img
              src={imageData.previewUrl}
              alt="ตัวอย่างภาพคำทำนาย"
              className="w-full max-h-80 object-contain mx-auto"
            />
            <div className="flex items-center justify-between px-4 py-3 bg-[#181818] border-t border-[#333333]">
              <span className="text-sm text-[#F5F5F5] truncate max-w-[70%]">
                {imageData.fileName}
              </span>
              <button
                type="button"
                onClick={handleClearImage}
                className="inline-flex items-center gap-1.5 text-sm text-[#ff8a80] hover:bg-[#291614] px-3 py-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                เปลี่ยนรูป
              </button>
            </div>
          </div>
        )}

        {/* Optional User Context */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm text-[#a6a6a6]">
              บริบทเพิ่มเติมหรือราศีของคุณ (ไม่บังคับ)
            </label>
            {lastZodiacResult && (
              <button
                type="button"
                onClick={handleApplyLastZodiac}
                className="text-xs px-3 py-1.5 bg-[#202020] hover:bg-[#2e2300] border border-[#494949] hover:border-[#FFC000] text-[#FFCE3E] transition-colors cursor-pointer"
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
            className="lambo-input resize-none"
          />
        </div>

        {error && (
          <div className="bg-[#291614] border border-[#59302d] p-4 text-sm text-[#ff8a80] flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loadingAI || !imageData}
          className="lambo-btn-gold w-full px-6 py-4 text-base flex items-center justify-center gap-2 cursor-pointer"
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
        <div className="space-y-6">
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
