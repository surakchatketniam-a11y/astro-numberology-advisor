import React from 'react';
import { AlertCircle, Loader2, Sparkles, Square } from 'lucide-react';
import { ZODIAC_DATA } from '../utils/zodiac';
import { SIGN_IDS } from '../utils/ephemeris';
import { useProfiles } from '../context/ProfilesContext';
import { profileSignId } from '../utils/profiles';
import { useGlossary } from '../context/GlossaryContext';
import { dignityTermId } from '../data/glossary';

const SIGN_KEY = 'astro_advisor_daily_sign_v1';

export function loadSavedSign() {
  try {
    const v = localStorage.getItem(SIGN_KEY);
    return SIGN_IDS.includes(v) ? v : null;
  } catch {
    return null;
  }
}

export function saveSign(id) {
  try {
    localStorage.setItem(SIGN_KEY, id);
  } catch {
    // ignore
  }
}

export function ScoreBar({ score }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`คะแนน ${score} จาก 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-2 w-6 ${n <= score ? 'bg-[#FFC000]' : 'bg-[#333333]'}`} />
      ))}
    </div>
  );
}

export function SignPicker({ signId, onChange, note }) {
  const { profiles } = useProfiles();
  return (
    <div>
      <p className="text-sm text-[#a6a6a6] mb-2">
        ราศีกำเนิด (ไทย)
        {note && <span className="text-[#7D7D7D]"> — {note}</span>}
      </p>
      {profiles.length > 0 && (
        <select
          aria-label="ใช้ราศีจากโปรไฟล์"
          value=""
          onChange={(e) => {
            const p = profiles.find((x) => x.id === e.target.value);
            if (p) onChange(profileSignId(p));
          }}
          className="lambo-input text-sm mb-3"
        >
          <option value="" className="bg-black text-white">
            ใช้ราศีจากโปรไฟล์ที่บันทึกไว้...
          </option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id} className="bg-black text-white">
              {p.name} ({ZODIAC_DATA[profileSignId(p)].thName})
            </option>
          ))}
        </select>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {SIGN_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={signId === id}
            className={`px-2 py-2.5 text-sm border transition-colors cursor-pointer ${
              signId === id
                ? 'bg-[#2e2300] border-[#FFC000] text-[#FFC000]'
                : 'bg-[#181818] border-[#333333] text-[#a6a6a6] hover:border-[#494949] hover:text-white'
            }`}
          >
            {ZODIAC_DATA[id].thName.replace('ราศี', '')}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AiActionBlock({ settings, loadingAI, aiError, onRun, onStop, runLabel, loadingLabel }) {
  return (
    <div className="lambo-panel p-5 sm:p-6 space-y-4">
      <button
        type="button"
        onClick={onRun}
        disabled={loadingAI}
        className="lambo-btn-ghost w-full px-5 py-3.5 text-base font-medium flex items-center justify-center gap-2 cursor-pointer"
      >
        {loadingAI ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingLabel} {settings.model}...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-[#FFC000]" />
            {settings.apiKey
              ? `${runLabel} (${settings.model})`
              : 'ตั้งค่า Gemini API Key เพื่อขอคำแนะนำเชิงลึก'}
          </>
        )}
      </button>

      {loadingAI && (
        <button
          type="button"
          onClick={onStop}
          className="lambo-btn-ghost w-full px-5 py-3 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
        >
          <Square className="h-3.5 w-3.5 text-[#ff8a80]" />
          หยุดการวิเคราะห์
        </button>
      )}

      {aiError && (
        <div className="bg-[#291614] border border-[#59302d] p-4 text-sm text-[#ff8a80] flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{aiError}</span>
        </div>
      )}
    </div>
  );
}

export function DignityBadge({ dignity }) {
  const { openGlossary } = useGlossary();
  if (!dignity) return null;
  const style =
    dignity.type === 'exalt'
      ? 'text-[#4ade80] border-[#1f5c3a] bg-[#0d1f15]'
      : dignity.type === 'debil'
        ? 'text-[#ff8a80] border-[#59302d] bg-[#291614]'
        : 'text-[#FFC000] border-[#594300] bg-[#2e2300]';
  return (
    <button
      type="button"
      onClick={() => openGlossary(dignityTermId(dignity))}
      title={`${dignity.text} (กดเพื่อดูความหมาย)`}
      aria-label={`${dignity.label} — ดูความหมายในหน้าคำศัพท์`}
      className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium border cursor-pointer hover:brightness-125 ${style}`}
    >
      {dignity.label}
    </button>
  );
}

/** ลิงก์คำศัพท์ในข้อความ: กดแล้วเปิดหน้าคำศัพท์ที่คำนั้น */
export function TermLink({ id, children }) {
  const { openGlossary } = useGlossary();
  return (
    <button
      type="button"
      onClick={() => openGlossary(id)}
      className="underline decoration-dotted underline-offset-4 text-[#FFCE3E] hover:text-white cursor-pointer"
    >
      {children}
    </button>
  );
}
