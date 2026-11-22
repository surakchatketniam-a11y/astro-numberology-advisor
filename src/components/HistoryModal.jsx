import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  ChevronDown,
  ChevronUp,
  Hash,
  Heart,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import LineShareBox from './LineShareBox';

const CATEGORY_META = {
  zodiac: { label: 'เช็กราศี & ดวงชะตา', icon: Sparkles },
  daily: { label: 'ดวงรายวัน', icon: CalendarDays },
  compat: { label: 'ดูคู่ความเข้ากัน', icon: Heart },
  numerology: { label: 'วิเคราะห์เลขศาสตร์', icon: Hash },
  image: { label: 'วิเคราะห์ภาพคำทำนาย', icon: ImageIcon },
};

function formatThaiDateTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function HistoryModal({ isOpen, onClose, history, onDelete, onClearAll }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="lambo-panel border-t-2 border-t-[#FFC000] w-full sm:max-w-2xl max-h-[88dvh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333] bg-[#181818]">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 bg-[#202020] border border-[#333333] flex items-center justify-center text-[#FFC000]">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px]">
                ARCHIVE LOG
              </p>
              <h2 id="history-modal-title" className="text-base sm:text-lg font-medium text-white">
                ประวัติการดูดวงล่าสุด ({history.length} รายการ)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs sm:text-sm text-[#ff8a80] hover:bg-[#291614] border border-transparent hover:border-[#59302d] px-3 py-1.5 transition-colors cursor-pointer"
              >
                ล้างทั้งหมด
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center text-[#969696] hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
              aria-label="ปิดหน้าต่างประวัติ"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-black">
          {history.length === 0 ? (
            <div className="lambo-panel p-12 text-center text-[#7D7D7D]">
              <Clock className="h-10 w-10 mx-auto mb-3 text-[#494949]" />
              <p className="text-base font-medium text-white">ยังไม่มีประวัติการวิเคราะห์</p>
              <p className="text-sm text-[#7D7D7D] mt-1">
                เมื่อคุณคำนวณราศี เลขศาสตร์ หรือวิเคราะห์ด้วย AI ระบบจะบันทึกไว้ที่นี่โดยอัตโนมัติ
              </p>
            </div>
          ) : (
            history.map((item) => {
              const meta = CATEGORY_META[item.category] || CATEGORY_META.zodiac;
              const Icon = meta.icon;
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-[#181818] border border-[#333333] hover:border-[#494949] transition-colors"
                >
                  <div className="p-4 flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="flex-1 text-left flex items-start gap-3 cursor-pointer min-w-0"
                    >
                      <span className="mt-0.5 h-9 w-9 bg-[#202020] border border-[#333333] flex items-center justify-center shrink-0 text-[#FFC000]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-[#FFCE3E]">
                            {meta.label}
                          </span>
                          {item.isAI && (
                            <span className="lambo-badge bg-[#2e2300] text-[#FFC000] border border-[#594300]">
                              Gemini AI
                            </span>
                          )}
                          <span className="text-xs text-[#7D7D7D]">
                            {formatThaiDateTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-base font-medium text-white mt-1 break-words">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-sm text-[#a6a6a6] mt-0.5 break-words">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      <span className="text-[#969696] mt-1 shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="h-9 w-9 flex items-center justify-center text-[#7D7D7D] hover:text-[#ff8a80] hover:bg-[#291614] transition-colors cursor-pointer shrink-0"
                      aria-label="ลบรายการนี้"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-3 border-t border-[#262626] space-y-4">
                      {item.analysis && (
                        <div className="bg-black border border-[#333333] p-4 text-sm sm:text-base text-[#F5F5F5] whitespace-pre-wrap leading-[1.7] max-h-64 overflow-y-auto">
                          {item.analysis}
                        </div>
                      )}
                      {item.lineSummary && (
                        <LineShareBox
                          text={item.lineSummary}
                          title="ข้อความสรุปที่บันทึกไว้ (พร้อมส่งต่อ LINE)"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
