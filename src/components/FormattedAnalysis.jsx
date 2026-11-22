import React from 'react';
import { Sparkles } from 'lucide-react';

function renderInlineBold(line) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[#FFCE3E]">
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
    <div className="lambo-panel border-t-2 border-t-[#FFC000] p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#333333]">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center bg-[#202020] border border-[#333333] text-[#FFC000] shrink-0">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px]">
              AI ADVISORY REPORT
            </p>
            <h3 className="text-base sm:text-lg font-medium text-white">
              บทวิเคราะห์เชิงลึกโดยที่ปรึกษา AI
            </h3>
          </div>
        </div>
        {model && (
          <span className="lambo-badge bg-[#202020] border border-[#494949] text-[#F5F5F5]">
            {model}
          </span>
        )}
      </div>

      <div className="space-y-3 text-base leading-[1.7] text-[#F5F5F5]">
        {lines.map((rawLine, idx) => {
          const line = rawLine.trim();
          if (!line) return <div key={idx} className="h-2" />;

          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-base sm:text-lg font-semibold text-[#FFCE3E] pt-3">
                {renderInlineBold(line.replace(/^###\s+/, ''))}
              </h4>
            );
          }

          if (line.startsWith('## ') || line.startsWith('# ')) {
            return (
              <h3 key={idx} className="text-lg sm:text-xl font-semibold text-white pt-4 border-t border-[#262626]">
                {renderInlineBold(line.replace(/^#{1,2}\s+/, ''))}
              </h3>
            );
          }

          if (/^[-*•]\s+/.test(line)) {
            return (
              <div key={idx} className="flex items-start gap-3 pl-1">
                <span className="mt-2.5 h-1.5 w-1.5 bg-[#FFC000] shrink-0" />
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
