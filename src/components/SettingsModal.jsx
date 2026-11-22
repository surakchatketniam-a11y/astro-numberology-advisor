import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Save,
  Server,
  ShieldCheck,
  Trash2,
  X,
  ExternalLink,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { AVAILABLE_MODELS, DEFAULT_SETTINGS } from '../utils/storage';
import { testGeminiConnection } from '../services/gemini';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  proxyStatus = { ok: false, serverKeyConfigured: false, rateLimit: null },
  onSave,
}) {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [model, setModel] = useState(settings.model || DEFAULT_SETTINGS.model);
  const [useServerProxy, setUseServerProxy] = useState(settings.useServerProxy !== false);
  const [proxyUrl, setProxyUrl] = useState(settings.proxyUrl || '');
  const [showKey, setShowKey] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok: boolean, message: string }

  useEffect(() => {
    if (isOpen) {
      setApiKey(settings.apiKey || '');
      setModel(settings.model || DEFAULT_SETTINGS.model);
      setUseServerProxy(settings.useServerProxy !== false);
      setProxyUrl(settings.proxyUrl || '');
      setSavedToast(false);
      setTestResult(null);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      apiKey: apiKey.trim(),
      model: model.trim() || DEFAULT_SETTINGS.model,
      useServerProxy,
      proxyUrl: proxyUrl.trim(),
    });
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 550);
  };

  const handleClearKey = () => {
    setApiKey('');
    setTestResult(null);
    onSave({
      apiKey: '',
      model: model.trim() || DEFAULT_SETTINGS.model,
      useServerProxy: true,
      proxyUrl: proxyUrl.trim(),
    });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testGeminiConnection({
        apiKey: apiKey.trim(),
        model: model.trim() || DEFAULT_SETTINGS.model,
        proxyUrl: proxyUrl.trim(),
        useServerProxy,
      });
      setTestResult({
        ok: true,
        message:
          res.mode === 'byok'
            ? `เชื่อมต่อด้วย API Key ส่วนตัวสำเร็จ (${res.model})`
            : `เชื่อมต่อผ่าน Server Proxy สำเร็จ (${res.model})`,
      });
    } catch (err) {
      setTestResult({
        ok: false,
        message: err.message || 'ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบการตั้งค่า',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="lambo-panel border-t-2 border-t-[#FFC000] w-full max-w-lg max-h-[90dvh] overflow-y-auto p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center text-[#969696] hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
          aria-label="ปิดหน้าต่างตั้งค่า"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 bg-[#202020] border border-[#333333] flex items-center justify-center text-[#FFC000] shrink-0">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px]">
              API &amp; SERVER PROXY
            </p>
            <h2 id="settings-modal-title" className="text-lg font-medium text-white">
              ตั้งค่าการเชื่อมต่อ Gemini AI
            </h2>
          </div>
        </div>

        {/* Server Proxy Live Status Banner */}
        <div
          className={`p-3.5 mb-5 border flex items-start gap-3 ${
            proxyStatus.serverKeyConfigured
              ? 'bg-[#0c2414] border-[#1a4e2d]'
              : 'bg-[#121212] border-[#333333]'
          }`}
        >
          <Server
            className={`h-4 w-4 shrink-0 mt-1 ${
              proxyStatus.serverKeyConfigured ? 'text-[#4ade80]' : 'text-[#7D7D7D]'
            }`}
          />
          <div className="text-xs sm:text-sm leading-[1.6]">
            <p
              className={`font-medium ${
                proxyStatus.serverKeyConfigured ? 'text-[#4ade80]' : 'text-white'
              }`}
            >
              {proxyStatus.serverKeyConfigured
                ? 'Server Proxy พร้อมใช้งาน (ซ่อน API Key ฝั่งเซิร์ฟเวอร์แล้ว)'
                : 'Server Proxy ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์'}
            </p>
            <p className="text-[#a6a6a6] mt-0.5">
              {proxyStatus.serverKeyConfigured
                ? `ใช้งานได้ทันทีโดยไม่ต้องกรอก Key เอง${
                    proxyStatus.rateLimit
                      ? ` (โควตา ${proxyStatus.rateLimit.max} ครั้ง / ${Math.round(
                          proxyStatus.rateLimit.windowSeconds / 60
                        )} นาที)`
                      : ''
                  }`
                : 'ตั้งค่า GEMINI_API_KEY ใน Vercel / Cloudflare Worker / .env หรือกรอก API Key ส่วนตัวด้านล่าง'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal API Key (BYOK — optional when Server Proxy is ready) */}
          <div>
            <label htmlFor="gemini-api-key" className="block text-sm text-[#a6a6a6] mb-1.5">
              Gemini API Key ส่วนตัว{' '}
              <span className="text-xs text-[#7D7D7D]">
                (ไม่บังคับหากใช้ Server Proxy — กรอกเพื่อไม่ติด Rate Limit)
              </span>
            </label>
            <div className="relative">
              <input
                id="gemini-api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (เว้นว่างเพื่อใช้ Server Proxy)"
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
            <div className="mt-1.5 flex items-center justify-between text-xs text-[#7D7D7D]">
              <span>สร้างคีย์ฟรีได้ที่ Google AI Studio</span>
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

          {/* Model Selector */}
          <div>
            <label htmlFor="gemini-model" className="block text-sm text-[#a6a6a6] mb-1.5">
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

          {/* Optional Custom Proxy URL (Cloudflare Worker / External Server) */}
          <div>
            <label htmlFor="custom-proxy-url" className="block text-sm text-[#a6a6a6] mb-1.5">
              Custom Proxy URL{' '}
              <span className="text-xs text-[#7D7D7D]">(ไม่บังคับ — ค่าเริ่มต้นใช้ /api/gemini)</span>
            </label>
            <input
              id="custom-proxy-url"
              type="url"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="เช่น https://astro-proxy.your-name.workers.dev"
              className="lambo-input text-sm"
            />
          </div>

          {/* Test Connection Result */}
          {testResult && (
            <div
              className={`p-3.5 border text-sm flex items-start gap-2.5 ${
                testResult.ok
                  ? 'bg-[#0c2414] border-[#1a4e2d] text-[#4ade80]'
                  : 'bg-[#291614] border-[#59302d] text-[#ff8a80]'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="lambo-inset p-3.5 flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-[#FFC000] shrink-0 mt-1" />
            <p className="text-xs text-[#a6a6a6] leading-[1.6]">
              เมื่อใช้ <strong className="text-white">Server Proxy</strong> คีย์จะถูกซ่อนไว้ฝั่งเซิร์ฟเวอร์ทั้งหมด ส่วน{' '}
              <strong className="text-white">API Key ส่วนตัว</strong> จะเก็บไว้เฉพาะใน{' '}
              <code className="text-white">localStorage</code> บนเครื่องของคุณเท่านั้น
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="lambo-btn-ghost px-4 text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 text-[#FFC000]" />
              )}
              <span>ทดสอบเชื่อมต่อ</span>
            </button>

            {settings.apiKey && (
              <button
                type="button"
                onClick={handleClearKey}
                className="inline-flex items-center justify-center gap-1.5 border border-[#59302d] bg-[#291614] hover:border-[#ff8a80] px-3.5 min-h-[48px] text-sm font-medium text-[#ff8a80] transition-colors cursor-pointer"
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
