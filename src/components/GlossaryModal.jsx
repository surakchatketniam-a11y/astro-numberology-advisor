import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { GLOSSARY_BY_ID, GLOSSARY_CATEGORIES, searchGlossary } from '../data/glossary';

function Detail({ text }) {
  const blocks = text.split('\n\n');
  return (
    <div className="space-y-3 text-sm sm:text-base text-[#F5F5F5] leading-[1.7]">
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        const isList = lines.every((l) => l.startsWith('• '));
        if (isList) {
          return (
            <ul key={i} className="space-y-1 list-disc pl-5">
              {lines.map((l) => (
                <li key={l}>{l.slice(2)}</li>
              ))}
            </ul>
          );
        }
        // ย่อหน้าที่ตามด้วยรายการ (เช่น "ราศีอุจจ์ของแต่ละดาว:" ตามด้วยบรรทัด •)
        const bullets = lines.filter((l) => l.startsWith('• '));
        if (bullets.length) {
          const heads = lines.filter((l) => !l.startsWith('• '));
          return (
            <div key={i} className="space-y-1">
              {heads.map((h) => (
                <p key={h}>{h}</p>
              ))}
              <ul className="space-y-1 list-disc pl-5">
                {bullets.map((l) => (
                  <li key={l}>{l.slice(2)}</li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {block}
          </p>
        );
      })}
    </div>
  );
}

export default function GlossaryModal({ isOpen, onClose, initialTermId }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const itemRefs = useRef({});
  const closeRef = useRef(null);

  // เปิดใหม่: รีเซ็ตตัวกรอง และเปิดคำที่ลิงก์มา
  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setCategory('all');
    setExpandedId(initialTermId || null);
  }, [isOpen, initialTermId]);

  useEffect(() => {
    if (!isOpen) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && expandedId && itemRefs.current[expandedId]) {
      itemRefs.current[expandedId].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isOpen, expandedId]);

  const results = useMemo(() => searchGlossary(query, category), [query, category]);

  if (!isOpen) return null;

  const jumpTo = (id) => {
    setQuery('');
    setCategory('all');
    setExpandedId(id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="lambo-panel border-t-2 border-t-[#FFC000] w-full sm:max-w-2xl max-h-[90dvh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333] bg-[#181818]">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 bg-[#202020] border border-[#333333] flex items-center justify-center text-[#FFC000]">
              <BookOpen className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display-latin text-[11px] text-[#7D7D7D] tracking-[0.2px]">GLOSSARY</p>
              <h2 id="glossary-modal-title" className="text-base sm:text-lg font-medium text-white">
                คำศัพท์โหราศาสตร์และเลขศาสตร์ ({results.length}/{Object.keys(GLOSSARY_BY_ID).length})
              </h2>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center text-[#969696] hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
            aria-label="ปิดหน้าคำศัพท์"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-[#333333] bg-[#181818] space-y-3">
          <div className="relative">
            <Search className="h-4 w-4 text-[#7D7D7D] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาคำศัพท์ เช่น ลัคนา, อุจจ์, retrograde"
              aria-label="ค้นหาคำศัพท์"
              className="lambo-input pl-9 text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="หมวดคำศัพท์">
            {[{ id: 'all', label: 'ทั้งหมด' }, ...GLOSSARY_CATEGORIES].map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={category === c.id}
                onClick={() => setCategory(c.id)}
                className={`shrink-0 px-3 py-1.5 text-xs border transition-colors cursor-pointer ${
                  category === c.id
                    ? 'bg-[#2e2300] border-[#FFC000] text-[#FFC000]'
                    : 'bg-black border-[#333333] text-[#a6a6a6] hover:text-white hover:border-[#494949]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-black">
          {results.length === 0 ? (
            <div className="lambo-panel p-10 text-center text-[#7D7D7D]">
              <Search className="h-8 w-8 mx-auto mb-3 text-[#494949]" />
              <p className="text-base font-medium text-white">ไม่พบคำศัพท์ที่ค้นหา</p>
              <p className="text-sm mt-1">ลองใช้คำอื่น หรือเลือกหมวด "ทั้งหมด"</p>
            </div>
          ) : (
            results.map((g) => {
              const open = expandedId === g.id;
              return (
                <div
                  key={g.id}
                  ref={(el) => {
                    itemRefs.current[g.id] = el;
                  }}
                  className={`bg-[#181818] border ${open ? 'border-[#594300]' : 'border-[#333333]'}`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : g.id)}
                    aria-expanded={open}
                    className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-base font-medium text-white">{g.term}</span>
                        <span className="text-xs text-[#7D7D7D]">{g.en}</span>
                      </span>
                      <span className="block text-sm text-[#a6a6a6] mt-0.5">{g.short}</span>
                    </span>
                    <span className="text-[#969696] mt-1 shrink-0">
                      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>

                  {open && (
                    <div className="px-4 pb-4 pt-3 border-t border-[#262626] space-y-4">
                      <Detail text={g.detail} />
                      {g.related.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-[#7D7D7D]">ดูเพิ่ม:</span>
                          {g.related.map((id) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => jumpTo(id)}
                              className="px-2.5 py-1 text-xs border border-[#333333] text-[#FFCE3E] hover:bg-[#202020] cursor-pointer"
                            >
                              {GLOSSARY_BY_ID[id].term}
                            </button>
                          ))}
                        </div>
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
