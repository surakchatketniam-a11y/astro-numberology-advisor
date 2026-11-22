import React, { useState } from 'react';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Hash,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import LineShareBox from './LineShareBox';

const CATEGORY_META = {
  zodiac: { label: 'เช็กราศี & ดวงชะตา', icon: Sparkles, color: 'text-amber-300 bg-amber-500/15 border-amber-400/30' },
  numerology: { label: 'วิเคราะห์เลขศาสตร์', icon: Hash, color: 'text-sky-300 bg-sky-500/15 border-sky-400/30' },
  image: { label: 'วิเคราะห์ภาพคำทำนาย', icon: ImageIcon, color: 'text-purple-300 bg-purple-500/15 border-purple-400/30' },
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="glass-card w-full sm:max-w-2xl max-h-[88dvh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <h2 id="history-modal-title" className="text-base font-semibold text-slate-100">
                ประวัติการดูดวงล่าสุด
              </h2>
              <p className="text-xs text-slate-400">
                บันทึกอัตโนมัติบนอุปกรณ์ของคุณ ({history.length} รายการ)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-rose-300 hover:text-rose-200 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/15 transition cursor-pointer"
              >
                ล้างทั้งหมด
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
              aria-label="ปิดหน้าต่างประวัติ"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-35" />
              <p className="text-sm font-medium text-slate-300">ยังไม่มีประวัติการวิเคราะห์</p>
              <p className="text-xs mt-1">
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
                  className="rounded-2xl bg-slate-900/75 border border-slate-800 hover:border-slate-700 transition overflow-hidden"
                >
                  <div className="p-3.5 sm:p-4 flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="flex-1 text-left flex items-start gap-3 cursor-pointer"
                    >
                      <span
                        className={`mt-0.5 h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-amber-300/90">
                            {meta.label}
                          </span>
                          {item.isAI && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-400/30">
                              Gemini AI
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">
                            {formatThaiDateTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-100 mt-1 truncate">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      <span className="text-slate-400 mt-1">
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
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
                      aria-label="ลบรายการนี้"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-3.5 sm:px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3">
                      {item.analysis && (
                        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
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
