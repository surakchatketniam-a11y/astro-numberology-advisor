import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  callGeminiAdvisor,
  parseGeminiAdvisorResponse,
  parsePartialAdvisorText,
  stripMarkdownForLine,
} from '../gemini';

const enc = new TextEncoder();

function sseResponse(events, { chunkSize = 17 } = {}) {
  const text = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');
  const bytes = enc.encode(text);
  const stream = new ReadableStream({
    start(controller) {
      for (let i = 0; i < bytes.length; i += chunkSize) {
        controller.enqueue(bytes.slice(i, i + chunkSize)); // แบ่งกลาง event/ตัวอักษรไทยโดยตั้งใจ
      }
      controller.close();
    },
  });
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
}

const chunk = (text, finishReason) => ({
  candidates: [{ content: { parts: [{ text }] }, ...(finishReason ? { finishReason } : {}) }],
});

afterEach(() => vi.unstubAllGlobals());

describe('stripMarkdownForLine', () => {
  it('removes markdown but keeps snake_case and arithmetic asterisks', () => {
    const out = stripMarkdownForLine('**หนา** *เอน* snake_case_name 2*3*4\n* รายการ');
    expect(out).toBe('หนา เอน snake_case_name 2*3*4\n• รายการ');
  });
});

describe('parsePartialAdvisorText', () => {
  it('hides a partially received start tag', () => {
    expect(parsePartialAdvisorText('บทวิเคราะห์\n===LINE_SUM').analysis).toBe('บทวิเคราะห์');
  });
  it('cuts everything after a full start tag', () => {
    const r = parsePartialAdvisorText('A\n===LINE_SUMMARY_START===\nสรุป');
    expect(r.analysis).toBe('A');
    expect(r.streaming).toBe(true);
  });
  it('leaves normal text alone', () => {
    expect(parsePartialAdvisorText('สวัสดี = ok').analysis).toBe('สวัสดี = ok');
  });
});

describe('callGeminiAdvisor (streaming)', () => {
  it('requires an API key', async () => {
    await expect(callGeminiAdvisor({ apiKey: ' ', prompt: 'x' })).rejects.toThrow('API Key');
  });

  it('streams partials, sends key via header, and returns the final parse', async () => {
    const fetchMock = vi.fn(async () =>
      sseResponse([
        chunk('บทวิเคราะห์ส่วนแรก '),
        chunk('ส่วนที่สอง\n===LINE_SUMMARY_START===\nสรุป LINE'),
        chunk('\n===LINE_SUMMARY_END===', 'STOP'),
      ])
    );
    vi.stubGlobal('fetch', fetchMock);

    const partials = [];
    const result = await callGeminiAdvisor({
      apiKey: 'KEY123',
      prompt: 'hi',
      onPartial: (p) => partials.push(p.analysis),
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain(':streamGenerateContent?alt=sse');
    expect(url).not.toContain('KEY123');
    expect(init.headers['x-goog-api-key']).toBe('KEY123');

    expect(partials.length).toBeGreaterThanOrEqual(2);
    expect(partials.at(-1)).toBe('บทวิเคราะห์ส่วนแรก ส่วนที่สอง');
    expect(result.analysis).toBe('บทวิเคราะห์ส่วนแรก ส่วนที่สอง');
    expect(result.lineSummary).toBe('สรุป LINE');
  });

  it('flags MAX_TOKENS truncation', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => sseResponse([chunk('ข้อความยาว', 'MAX_TOKENS')])));
    const r = await callGeminiAdvisor({ apiKey: 'k', prompt: 'x' });
    expect(r.truncated).toBe(true);
    expect(r.analysis).toContain('ถูกตัด');
  });

  it('maps HTTP errors to Thai messages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: { message: 'quota' } }), { status: 429 }))
    );
    await expect(callGeminiAdvisor({ apiKey: 'k', prompt: 'x' })).rejects.toThrow('Rate Limit');
  });

  it('reports prompt blocks', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => sseResponse([{ promptFeedback: { blockReason: 'SAFETY' } }]))
    );
    await expect(callGeminiAdvisor({ apiKey: 'k', prompt: 'x' })).rejects.toThrow('ระงับ');
  });

  it('reports network failure and cancellation', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    await expect(callGeminiAdvisor({ apiKey: 'k', prompt: 'x' })).rejects.toThrow('อินเทอร์เน็ต');

    const ctrl = new AbortController();
    ctrl.abort();
    vi.stubGlobal('fetch', vi.fn(async (_u, init) => {
      if (init.signal.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
    }));
    await expect(callGeminiAdvisor({ apiKey: 'k', prompt: 'x', signal: ctrl.signal })).rejects.toThrow('ยกเลิก');
  });
});

describe('parseGeminiAdvisorResponse', () => {
  it('handles a missing end tag', () => {
    const r = parseGeminiAdvisorResponse('A\n===LINE_SUMMARY_START===\nB');
    expect(r.lineSummary).toBe('B');
  });
});
