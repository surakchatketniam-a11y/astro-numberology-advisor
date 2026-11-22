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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="lambo-panel border-t-2 border-t-[#FFC000] w-full max-w-md p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center text-[#969696] hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
          aria-label="ปิดหน้าต่างตั้งค่า"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 bg-[#202020] border border-[#333333] flex items-center justify-center text-[#FFC000] shrink-0">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px]">
              SYSTEM CONFIGURATION
            </p>
            <h2 id="settings-modal-title" className="text-lg font-medium text-white">
              ตั้งค่า Gemini AI
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="gemini-api-key" className="block text-sm text-[#a6a6a6] mb-2">
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
                className="lambo-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center text-[#969696] hover:text-white cursor-pointer"
                aria-label={showKey ? 'ซ่อน API Key' : 'แสดง API Key'}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[#7D7D7D]">
              <span>ยังไม่มีคีย์? สร้างได้ที่ Google AI Studio</span>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-white underline underline-offset-4 hover:text-[#3860BE] transition-colors"
              >
                รับ API Key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div>
            <label htmlFor="gemini-model" className="block text-sm text-[#a6a6a6] mb-2">
              เลือกโมเดล Gemini
            </label>
            <select
              id="gemini-model"
              value={AVAILABLE_MODELS.some((m) => m.id === model) ? model : 'custom'}
              onChange={(e) => {
                if (e.target.value !== 'custom') setModel(e.target.value);
              }}
              className="lambo-input"
            >
              {AVAILABLE_MODELS.map((item) => (
                <option key={item.id} value={item.id} className="bg-black text-white">
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lambo-inset p-3.5 flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-[#FFC000] shrink-0 mt-1" />
            <p className="text-xs sm:text-sm text-[#a6a6a6] leading-[1.7]">
              API Key จะถูกบันทึกไว้ใน <code className="text-white">localStorage</code>{' '}
              บนอุปกรณ์ของคุณเท่านั้น ไม่มีการส่งไปยังเซิร์ฟเวอร์อื่นนอกจาก Google Gemini API โดยตรง
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {settings.apiKey && (
              <button
                type="button"
                onClick={handleClearKey}
                className="inline-flex items-center justify-center gap-1.5 border border-[#59302d] bg-[#291614] hover:border-[#ff8a80] px-4 min-h-[48px] text-sm font-medium text-[#ff8a80] transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                ล้างคีย์
              </button>
            )}
            <button
              type="submit"
              className="lambo-btn-gold flex-1 inline-flex items-center justify-center gap-2 px-5 text-base cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {savedToast ? 'บันทึกเรียบร้อย' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
