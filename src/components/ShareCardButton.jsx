import React, { useState } from 'react';
import { Check, Download, Loader2 } from 'lucide-react';

export default function ShareCardButton({
  onGenerateDataUrl,
  fileName = 'astro-advisor-card.png',
  label = 'บันทึกการ์ดภาพสรุปผล (PNG)',
}) {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = async () => {
    if (!onGenerateDataUrl || generating) return;
    setGenerating(true);
    try {
      const dataUrl = await onGenerateDataUrl();
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 text-sm sm:text-base font-medium cursor-pointer transition-colors min-h-[48px] border ${
        done
          ? 'bg-[#0c2414] border-[#4ade80] text-[#4ade80]'
          : 'lambo-btn-white'
      }`}
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>กำลังสร้างการ์ดภาพ PNG...</span>
        </>
      ) : done ? (
        <>
          <Check className="h-4 w-4" />
          <span>บันทึกการ์ดภาพเรียบร้อย</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
