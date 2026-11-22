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
    <div className="lambo-panel border-t-2 border-t-[#FFC000] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center bg-[#202020] border border-[#333333] text-[#FFC000] shrink-0">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px]">
              LINE SHARE SUMMARY
            </p>
            <h3 className="text-base font-medium text-white">{title}</h3>
          </div>
        </div>
      </div>

      <div className="bg-black border border-[#333333] p-4 sm:p-5 text-base text-[#F5F5F5] leading-[1.7] whitespace-pre-wrap break-words max-h-80 overflow-y-auto">
        {text}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-medium cursor-pointer transition-colors min-h-[48px] border ${
            copied
              ? 'bg-[#0c2414] border-[#4ade80] text-[#4ade80]'
              : 'lambo-btn-ghost'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>คัดลอกข้อความสำเร็จแล้ว</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>คัดลอกข้อความ (Copy)</span>
            </>
          )}
        </button>

        <a
          href={lineShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="lambo-btn-gold flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base"
        >
          <Share2 className="h-4 w-4" />
          <span>แชร์ไปยัง LINE</span>
        </a>
      </div>
    </div>
  );
}
