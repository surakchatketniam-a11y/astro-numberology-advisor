import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, KeyRound, Save, ShieldCheck, Trash2, X, ExternalLink } from 'lucide-react';
import { AVAILABLE_MODELS, DEFAULT_SETTINGS } from '../utils/storage';

export default function SettingsModal({ isOpen, onClose, settings, onSave }) {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [model, setModel] = useState(settings.model || DEFAULT_SETTINGS.model);
  const [showKey, setShowKey] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(settings.apiKey || '');
      setModel(settings.model || DEFAULT_SETTINGS.model);
      setSavedToast(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ apiKey: apiKey.trim(), model: model.trim() || DEFAULT_SETTINGS.model });
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  const handleClearKey = () => {
    setApiKey('');
    onSave({ apiKey: '', model: model.trim() || DEFAULT_SETTINGS.model });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="glass-card w-full max-w-md rounded-2xl p-5 sm:p-6 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition cursor-pointer"
          aria-label="ปิดหน้าต่างตั้งค่า"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 id="settings-modal-title" className="text-base sm:text-lg font-semibold text-slate-100">
              ตั้งค่า Gemini AI
            </h2>
            <p className="text-xs text-slate-400">
              ใช้สำหรับวิเคราะห์เชิงลึกและอ่านภาพคำทำนาย
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="gemini-api-key" className="block text-xs font-medium text-slate-300 mb-1.5">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                id="gemini-api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                autoComplete="off"
                className="w-full rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400/70 focus:outline-none px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                aria-label={showKey ? 'ซ่อน API Key' : 'แสดง API Key'}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>ไม่มีคีย์? สร้างฟรีได้ที่ Google AI Studio</span>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 underline underline-offset-2"
              >
                รับ API Key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div>
            <label htmlFor="gemini-model" className="block text-xs font-medium text-slate-300 mb-1.5">
              เลือกโมเดล Gemini
            </label>
            <select
              id="gemini-model"
              value={AVAILABLE_MODELS.some((m) => m.id === model) ? model : 'custom'}
              onChange={(e) => {
                if (e.target.value !== 'custom') setModel(e.target.value);
              }}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400/70 focus:outline-none px-3.5 py-2.5 text-sm text-slate-100"
            >
              {AVAILABLE_MODELS.map((item) => (
                <option key={item.id} value={item.id} className="bg-slate-900">
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              API Key จะถูกบันทึกไว้ใน <code className="text-slate-300">localStorage</code>{' '}
              บนอุปกรณ์ของคุณเท่านั้น ไม่มีการส่งไปยังเซิร์ฟเวอร์อื่นนอกจาก Google Gemini API โดยตรง
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            {settings.apiKey && (
              <button
                type="button"
                onClick={handleClearKey}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2.5 text-xs font-medium text-rose-300 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                ล้างคีย์
              </button>
            )}
            <button
              type="submit"
              className="gold-button flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {savedToast ? 'บันทึกเรียบร้อย!' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
