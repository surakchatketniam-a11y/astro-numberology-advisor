import React, { useState } from 'react';
import { Check, Copy, MessageCircle, Share2 } from 'lucide-react';

export default function LineShareBox({ text, title = 'ข้อความสรุปสำหรับส่งต่อใน LINE' }) {
  const [copied, setCopied] = useState(false);

  if (!text) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older mobile webviews
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`;

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-900/95 to-emerald-950/20 p-4 sm:p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-emerald-300">{title}</h3>
            <p className="text-xs text-slate-400">
              รูปแบบข้อความล้วน อ่านง่ายบนมือถือ พร้อมส่งต่อทันที
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[#0b1120]/90 border border-slate-700/70 p-3.5 sm:p-4 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words max-h-80 overflow-y-auto font-normal">
        {text}
      </div>

      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all cursor-pointer border ${
            copied
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
              : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-600/70 text-slate-100'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span>คัดลอกข้อความสำเร็จแล้ว!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-amber-300" />
              <span>คัดลอกข้อความ (Copy)</span>
            </>
          )}
        </button>

        <a
          href={lineShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] active:scale-[0.99] px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-md shadow-emerald-950/50"
        >
          <Share2 className="h-4 w-4" />
          <span>แชร์ไปยัง LINE</span>
        </a>
      </div>
    </div>
  );
}
