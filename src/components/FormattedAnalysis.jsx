import React from 'react';
import { Sparkles } from 'lucide-react';

function renderInlineBold(line) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-amber-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default function FormattedAnalysis({ content, model }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300 border border-amber-400/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-amber-200">
              บทวิเคราะห์เชิงลึกโดยที่ปรึกษา AI
            </h3>
            <p className="text-xs text-slate-400">
              เชื่อมโยงโหราศาสตร์ จิตวิทยา และการวางแผนชีวิตจริง
            </p>
          </div>
        </div>
        {model && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300">
            {model}
          </span>
        )}
      </div>

      <div className="space-y-2.5 text-sm sm:text-[15px] leading-relaxed text-slate-200">
        {lines.map((rawLine, idx) => {
          const line = rawLine.trim();
          if (!line) return <div key={idx} className="h-1.5" />;

          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm sm:text-base font-semibold text-amber-300 pt-2">
                {renderInlineBold(line.replace(/^###\s+/, ''))}
              </h4>
            );
          }

          if (line.startsWith('## ') || line.startsWith('# ')) {
            return (
              <h3 key={idx} className="text-base sm:text-lg font-semibold text-amber-200 pt-2.5">
                {renderInlineBold(line.replace(/^#{1,2}\s+/, ''))}
              </h3>
            );
          }

          if (/^[-*•]\s+/.test(line)) {
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                <p className="flex-1">{renderInlineBold(line.replace(/^[-*•]\s+/, ''))}</p>
              </div>
            );
          }

          return <p key={idx}>{renderInlineBold(line)}</p>;
        })}
      </div>
    </div>
  );
}
