import React, { useState } from 'react';
import { AlertCircle, Check, Copy, Loader2, MessageSquare, Send } from 'lucide-react';
import { callGeminiFollowUp } from '../services/gemini';

const DEFAULT_SUGGESTIONS = [
  'ช่วยวางแผนการงานและการเงิน 3 เดือนข้างหน้าเป็นขั้นเป็นตอน',
  'จุดที่ควรบริหารความเสี่ยงและระวังอคติทางความคิดคืออะไร',
  'สรุปเป็นเช็กลิสต์ลงมือทำได้จริง 3 ข้อสำหรับสัปดาห์นี้',
];

export default function FollowUpChat({
  settings,
  onOpenSettings,
  baseContext,
  baseAnalysis,
  suggestions = DEFAULT_SUGGESTIONS,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!baseAnalysis) return null;

  const sendQuestion = async (questionText) => {
    const cleanQ = (questionText || '').trim();
    if (!cleanQ || loading) return;

    if (!settings.apiKey) {
      onOpenSettings();
      return;
    }

    setError('');
    setInput('');
    const nextHistory = [...messages, { role: 'user', text: cleanQ }];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const response = await callGeminiFollowUp({
        apiKey: settings.apiKey,
        model: settings.model,
        baseContext,
        baseAnalysis,
        messages,
        question: cleanQ,
      });

      setMessages([
        ...nextHistory,
        {
          role: 'model',
          text: response.analysis,
          lineSummary: response.lineSummary,
        },
      ]);
    } catch (err) {
      setError(err.message || 'ไม่สามารถส่งคำถามต่อเนื่องได้');
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuestion(input);
  };

  const handleCopySummary = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <div className="lambo-panel p-5 sm:p-6 space-y-4">
      <div className="border-b border-[#333333] pb-3.5">
        <p className="font-display-latin text-[11px] text-[#FFC000] tracking-[0.225px]">
          FOLLOW-UP ADVISOR CHAT
        </p>
        <h3 className="text-base sm:text-lg font-medium text-white flex items-center gap-2 mt-0.5">
          <MessageSquare className="h-4 w-4 text-[#FFC000]" />
          ถาม-ตอบต่อเนื่องจากบทวิเคราะห์นี้
        </h3>
        <p className="text-sm text-[#7D7D7D] mt-0.5">
          AI จดจำบริบทดวงชะตาและบทวิเคราะห์ด้านบนไว้แล้ว สามารถถามเจาะลึกเพิ่มเติมได้ทันที
        </p>
      </div>

      {/* Quick Suggestion Chips */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendQuestion(q)}
              disabled={loading}
              className="text-left text-xs sm:text-sm px-3 py-2 bg-black hover:bg-[#202020] border border-[#333333] hover:border-[#FFC000] text-[#F5F5F5] transition-colors cursor-pointer"
            >
              + {q}
            </button>
          ))}
        </div>
      )}

      {/* Conversation Thread */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 border ${
                msg.role === 'user'
                  ? 'bg-[#202020] border-[#494949] border-l-2 border-l-[#29ABE2]'
                  : 'bg-black border-[#333333] border-l-2 border-l-[#FFC000]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={`font-display-latin text-[11px] tracking-[0.2px] ${
                    msg.role === 'user' ? 'text-[#29ABE2]' : 'text-[#FFC000]'
                  }`}
                >
                  {msg.role === 'user' ? 'YOU' : 'AI ADVISOR'}
                </span>
                {msg.role === 'model' && msg.lineSummary && (
                  <button
                    type="button"
                    onClick={() => handleCopySummary(msg.lineSummary, idx)}
                    className="inline-flex items-center gap-1 text-xs text-[#a6a6a6] hover:text-[#FFC000] cursor-pointer"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#4ade80]" />
                        <span className="text-[#4ade80]">คัดลอกสรุปแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>คัดลอกสรุป LINE</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="text-sm sm:text-base text-[#F5F5F5] whitespace-pre-wrap leading-[1.7]">
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-[#291614] border border-[#59302d] p-3.5 text-sm text-[#ff8a80] flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Row */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="พิมพ์คำถามเพิ่มเติม เช่น แล้วถ้าเริ่มลงทุนเดือนหน้าควรวางแผนอย่างไร..."
          className="lambo-input flex-1"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="lambo-btn-gold px-5 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>กำลังตอบ...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>ส่งคำถาม</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
