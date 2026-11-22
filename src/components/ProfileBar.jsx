import React, { useState } from 'react';
import { Check, Save, Trash2, UserRound } from 'lucide-react';
import { useProfiles } from '../context/ProfilesContext';

/**
 * เลือก/บันทึก/ลบโปรไฟล์วันเกิด
 * @param current ข้อมูลในฟอร์มตอนนี้ { day, month, yearAD, birthTime, birthProvince }
 * @param defaultName ชื่อตั้งต้นเมื่อบันทึก (เช่น ชื่อที่กรอกไว้)
 * @param onPick เรียกเมื่อเลือกโปรไฟล์ ส่งข้อมูลโปรไฟล์เต็ม
 */
export default function ProfileBar({ current, defaultName = '', onPick, label = 'โปรไฟล์ที่บันทึกไว้' }) {
  const { profiles, saveProfile, removeProfile } = useProfiles();
  const [selectedId, setSelectedId] = useState('');
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState(null); // { kind, text }

  const selected = profiles.find((p) => p.id === selectedId) || null;

  const handlePick = (id) => {
    setSelectedId(id);
    setMessage(null);
    const p = profiles.find((x) => x.id === id);
    if (p) onPick(p);
  };

  const openSave = () => {
    setName(selected?.name || defaultName || '');
    setSaving(true);
    setMessage(null);
  };

  // ใช้ div ไม่ใช่ form เพราะ ProfileBar ถูกวางอยู่ใน form ของแท็บอยู่แล้ว (form ซ้อนกันไม่ได้)
  const handleSave = () => {
    try {
      const saved = saveProfile({ ...current, name });
      setSelectedId(saved.id);
      setSaving(false);
      setMessage({ kind: 'ok', text: `บันทึก "${saved.name}" แล้ว` });
    } catch (err) {
      setMessage({ kind: 'error', text: err.message });
    }
  };

  const handleDelete = () => {
    if (!selected) return;
    removeProfile(selected.id);
    setMessage({ kind: 'ok', text: `ลบ "${selected.name}" แล้ว` });
    setSelectedId('');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <UserRound className="h-4 w-4 text-[#FFC000] shrink-0" aria-hidden="true" />
        <select
          aria-label={label}
          value={selectedId}
          onChange={(e) => handlePick(e.target.value)}
          className="lambo-input flex-1 min-w-[10rem] text-sm"
        >
          <option value="" className="bg-black text-white">
            {profiles.length ? `${label} (${profiles.length})` : 'ยังไม่มีโปรไฟล์ที่บันทึกไว้'}
          </option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id} className="bg-black text-white">
              {p.name} — {p.day}/{p.month}/{p.yearAD + 543}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={openSave}
          className="h-11 px-3 inline-flex items-center gap-1.5 text-sm text-[#a6a6a6] hover:text-white hover:bg-[#202020] border border-[#333333] cursor-pointer"
        >
          <Save className="h-4 w-4" /> บันทึกเป็นโปรไฟล์
        </button>
        {selected && (
          <button
            type="button"
            onClick={handleDelete}
            className="h-11 w-11 inline-flex items-center justify-center text-[#7D7D7D] hover:text-[#ff8a80] hover:bg-[#291614] border border-[#333333] cursor-pointer"
            aria-label={`ลบโปรไฟล์ ${selected.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {saving && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ตั้งชื่อโปรไฟล์ เช่น ฉัน, แม่, แฟน"
            maxLength={30}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
            className="lambo-input flex-1 min-w-[10rem] text-sm"
          />
          <button type="button" onClick={handleSave} className="lambo-btn-gold h-11 px-4 text-sm inline-flex items-center gap-1.5 cursor-pointer">
            <Check className="h-4 w-4" /> บันทึก
          </button>
          <button
            type="button"
            onClick={() => setSaving(false)}
            className="h-11 px-3 text-sm text-[#7D7D7D] hover:text-white cursor-pointer"
          >
            ยกเลิก
          </button>
        </div>
      )}

      {message && (
        <p role="status" className={`text-sm ${message.kind === 'ok' ? 'text-[#4ade80]' : 'text-[#ff8a80]'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
