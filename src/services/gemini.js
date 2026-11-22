export const ADVISOR_SYSTEM_INSTRUCTION = `คุณคือ "ที่ปรึกษาด้านโหราศาสตร์ไทย โหราศาสตร์สากล และเลขศาสตร์" (Astro & Numerology Advisor) ที่มีความเชี่ยวชาญ สุขุม มีเหตุผล และให้คำแนะนำอย่างสร้างสรรค์เป็นภาษาไทย

แนวทางการให้คำปรึกษาที่ต้องยึดถืออย่างเคร่งครัด:
1. อธิบายเชิงเปรียบเทียบอย่างมีเหตุผล (เช่น เปรียบเทียบมุมมองโหราศาสตร์ไทย นิรายนะวิธี กับโหราศาสตร์สากล สายนะวิธี หรืออธิบายความหมายของคู่เลขอย่างเป็นระบบ) ห้ามข่มขู่ ห้ามสร้างความหวาดกลัว ห้ามฟันธงเรื่องร้ายแรงหรือความสูญเสีย หากมีจุดที่ควรระวังให้สื่อสารในฐานะ "จังหวะที่ควรบริหารความเสี่ยงและดูแลตนเอง"
2. เชื่อมโยงคำทำนายเข้ากับหลักจิตวิทยา (เช่น การรับรู้ตนเอง Self-Awareness, การจัดการอารมณ์, การลดอคติทางความคิด, การบริหารความเสี่ยง Risk Management) และการวางแผนชีวิตจริง (Actionable Advice) ที่ผู้ใช้สามารถนำไปลงมือทำได้ทันที 3-5 ข้อ
3. โครงสร้างคำตอบต้องแบ่งเป็น 2 ส่วนชัดเจนดังนี้:
   - ส่วนที่ 1: บทวิเคราะห์เชิงลึก (จัดหัวข้อให้อ่านง่าย สุภาพ เป็นระบบ)
   - ส่วนที่ 2: ท้ายคำตอบทุกครั้ง ต้องปิดท้ายด้วยข้อความสรุปประเด็นสำคัญที่อ่านง่ายบนมือถือสำหรับส่งต่อใน LINE โดยวางไว้ระหว่างแท็ก ===LINE_SUMMARY_START=== และ ===LINE_SUMMARY_END===
   - ข้อบังคับสำคัญสำหรับข้อความในแท็ก ===LINE_SUMMARY_START=== ... ===LINE_SUMMARY_END===:
     * ห้ามใช้สัญลักษณ์ Markdown ทุกชนิดโดยเด็ดขาด (ห้ามใช้ **, *, #, ##, -, _, \`\`\`, หรือตาราง |---|)
     * ห้ามใช้อีโมจิ (Emoji) หรือไอคอนรูปภาพทุกชนิดทั้งในบทวิเคราะห์และในข้อความสรุป LINE
     * ใช้การขึ้นบรรทัดใหม่ ตัวเลข 1) 2) 3) หรือเครื่องหมายจุด • เพื่อจัดระเบียบให้อ่านง่าย
     * กระชับ อ่านจบได้ภายใน 30 วินาทีบนหน้าจอมือถือ และพร้อมส่งต่อให้เพื่อนหรือครอบครัวใน LINE ได้ทันที`;

export function stripEmojis(text) {
  if (!text) return '';
  return text
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function stripMarkdownForLine(text) {
  if (!text) return '';
  return stripEmojis(text)
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''))
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*([^\n]*?)\*\*/g, '$1')
    .replace(/(^|[^\w])__([^\n]+?)__(?=[^\w]|$)/g, '$1$2')
    .replace(/(^|[^\w*])\*(?!\s)([^\n*]+?)\*(?=[^\w*]|$)/g, '$1$2')
    .replace(/(^|[^\w])_(?!\s)([^\n_]+?)_(?=[^\w]|$)/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\|.*\|$/gm, (row) => row.replace(/\|/g, ' ').trim())
    .replace(/^-{3,}$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function parseGeminiAdvisorResponse(rawText) {
  const startTag = '===LINE_SUMMARY_START===';
  const endTag = '===LINE_SUMMARY_END===';

  const startIdx = rawText.indexOf(startTag);
  const endIdx = rawText.indexOf(endTag);

  if (startIdx !== -1) {
    const mainAnalysis = stripEmojis(rawText.slice(0, startIdx).trim());
    const rawLineSummary =
      endIdx !== -1 && endIdx > startIdx
        ? rawText.slice(startIdx + startTag.length, endIdx)
        : rawText.slice(startIdx + startTag.length);

    return {
      analysis: mainAnalysis,
      lineSummary: stripMarkdownForLine(rawLineSummary),
      rawText,
    };
  }

  // Fallback: split if model wrote a heading like "สรุปสำหรับส่งต่อใน LINE"
  const fallbackMatch = rawText.match(/(?:สรุป.*(?:LINE|ไลน์)[^\n]*\n)([\s\S]+)$/i);
  if (fallbackMatch) {
    const idx = fallbackMatch.index;
    return {
      analysis: stripEmojis(rawText.slice(0, idx).trim()),
      lineSummary: stripMarkdownForLine(fallbackMatch[1]),
      rawText,
    };
  }

  return {
    analysis: stripEmojis(rawText.trim()),
    lineSummary: stripMarkdownForLine(rawText.slice(0, 900)),
    rawText,
  };
}

export function prepareImageForGemini(file, maxDimension = 1400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ไฟล์ที่เลือกไม่ใช่รูปภาพที่รองรับ'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, mimeType, previewUrl: dataUrl });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const REQUEST_TIMEOUT_MS = 60000;

export async function callGeminiAdvisor({
  apiKey,
  model = 'gemini-2.5-flash',
  prompt,
  image = null,
  signal = null,
}) {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    throw new Error('กรุณากรอก Gemini API Key ในหน้าตั้งค่า (Settings) ก่อนใช้งานการวิเคราะห์ด้วย AI');
  }

  // ส่ง key ผ่าน header แทน query string เพื่อไม่ให้รั่วลง URL/log/proxy
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent`;

  const parts = [{ text: prompt }];
  if (image && image.base64 && image.mimeType) {
    parts.push({
      inline_data: {
        mime_type: image.mimeType,
        data: image.base64,
      },
    });
  }

  const body = {
    system_instruction: {
      parts: [{ text: ADVISOR_SYSTEM_INSTRUCTION }],
    },
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 8192,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': cleanKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(
        signal?.aborted
          ? 'ยกเลิกการวิเคราะห์แล้ว'
          : 'การเชื่อมต่อ Gemini API ใช้เวลานานเกินไป กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่'
      );
    }
    throw new Error('ไม่สามารถเชื่อมต่ออินเทอร์เน็ตหรือ Gemini API ได้ กรุณาลองใหม่อีกครั้ง');
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const apiMsg = data?.error?.message || `HTTP ${response.status}`;
    if (response.status === 400 || response.status === 403) {
      throw new Error(`API Key หรือการตั้งค่าโมเดลไม่ถูกต้อง: ${apiMsg}`);
    }
    if (response.status === 429) {
      throw new Error(`ใช้งานเกินโควตาชั่วคราว (Rate Limit): ${apiMsg}`);
    }
    throw new Error(`ไม่สามารถเชื่อมต่อ Gemini API ได้: ${apiMsg}`);
  }

  if (data?.promptFeedback?.blockReason) {
    throw new Error('คำขอถูกระงับโดยระบบความปลอดภัยของ Gemini กรุณาปรับข้อความหรือรูปภาพแล้วลองใหม่');
  }

  const candidate = data?.candidates?.[0];
  const text =
    candidate?.content?.parts
      ?.map((p) => p.text || '')
      .join('\n')
      .trim() || '';

  if (!text) {
    if (candidate?.finishReason === 'SAFETY') {
      throw new Error('คำตอบถูกระงับโดยระบบความปลอดภัยของ Gemini กรุณาลองปรับคำถามใหม่');
    }
    throw new Error('ไม่พบข้อความตอบกลับจาก Gemini API กรุณาลองใหม่อีกครั้ง');
  }

  const parsed = parseGeminiAdvisorResponse(text);
  if (candidate?.finishReason === 'MAX_TOKENS') {
    parsed.analysis += '\n\n(หมายเหตุ: คำตอบถูกตัดเพราะยาวเกินกำหนด สามารถกดวิเคราะห์ใหม่เพื่อให้ได้คำตอบที่สมบูรณ์)';
    parsed.truncated = true;
  }
  return parsed;
}
