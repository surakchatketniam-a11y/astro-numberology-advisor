// Vercel Serverless Function — Gemini API Proxy with Rate Limiting
// Endpoint: GET /api/gemini (health) | POST /api/gemini (proxy)

const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
]);

const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 20);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000); // 10 minutes
const MAX_BODY_BYTES = 6 * 1024 * 1024; // 6 MB (allows compressed images)

// In-memory sliding window store per serverless instance
const rateBuckets = new Map();

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateBuckets.get(ip) || []).filter((ts) => ts > windowStart);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    const oldest = timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));
    rateBuckets.set(ip, timestamps);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  timestamps.push(now);
  rateBuckets.set(ip, timestamps);

  // Periodic cleanup to prevent unbounded map growth
  if (rateBuckets.size > 1000) {
    for (const [key, list] of rateBuckets.entries()) {
      if (!list.some((ts) => ts > windowStart)) rateBuckets.delete(key);
    }
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX - timestamps.length, retryAfterSec: 0 };
}

function applyCors(req, res) {
  const allowedOrigin = (process.env.ALLOWED_ORIGIN || '').trim();
  const origin = req.headers.origin || '';
  if (allowedOrigin) {
    const list = allowedOrigin.split(',').map((s) => s.trim());
    if (list.includes('*') || list.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', list.includes('*') ? '*' : origin);
    }
  } else if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const serverKey = (process.env.GEMINI_API_KEY || '').trim();

  // Health / Capability Check
  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      serverKeyConfigured: Boolean(serverKey),
      allowedModels: Array.from(ALLOWED_MODELS),
      rateLimit: {
        max: RATE_LIMIT_MAX,
        windowSeconds: Math.round(RATE_LIMIT_WINDOW_MS / 1000),
      },
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Method not allowed' } });
    return;
  }

  if (!serverKey) {
    res.status(503).json({
      error: {
        message: 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า GEMINI_API_KEY กรุณาตั้งค่า Environment Variable หรือกรอก API Key ส่วนตัวในหน้าตั้งค่า',
      },
    });
    return;
  }

  // Rate limit check
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
  res.setHeader('X-RateLimit-Remaining', String(rl.remaining));

  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfterSec));
    res.status(429).json({
      error: {
        message: `ใช้งานเกินโควตาชั่วคราว (จำกัด ${RATE_LIMIT_MAX} ครั้งต่อ ${Math.round(
          RATE_LIMIT_WINDOW_MS / 60000
        )} นาที) กรุณารออีกประมาณ ${rl.retryAfterSec} วินาที หรือกรอก API Key ส่วนตัวในหน้าตั้งค่า`,
      },
    });
    return;
  }

  // Parse body safely
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const bodySize = Buffer.byteLength(JSON.stringify(body), 'utf8');
  if (bodySize > MAX_BODY_BYTES) {
    res.status(413).json({
      error: { message: 'ขนาดข้อมูลหรือรูปภาพใหญ่เกินกำหนด (สูงสุด 6MB)' },
    });
    return;
  }

  const model = typeof body.model === 'string' ? body.model.trim() : 'gemini-2.5-flash';
  if (!ALLOWED_MODELS.has(model)) {
    res.status(400).json({
      error: { message: `โมเดล "${model}" ไม่ได้รับอนุญาตบนเซิร์ฟเวอร์นี้` },
    });
    return;
  }

  const payload = body.payload;
  if (!payload || !Array.isArray(payload.contents)) {
    res.status(400).json({ error: { message: 'รูปแบบคำขอไม่ถูกต้อง (missing contents)' } });
    return;
  }

  const useStream = Boolean(body.stream);
  const action = useStream ? 'streamGenerateContent?alt=sse' : 'generateContent';
  const upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:${action}`;

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': serverKey,
      },
      body: JSON.stringify(payload),
    });

    if (!upstreamRes.ok) {
      const errData = await upstreamRes.json().catch(() => ({}));
      res.status(upstreamRes.status).json(errData);
      return;
    }

    if (useStream) {
      res.status(200);
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');

      if (upstreamRes.body && upstreamRes.body.getReader) {
        const reader = upstreamRes.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
      } else {
        const text = await upstreamRes.text();
        res.end(text);
      }
      return;
    }

    const json = await upstreamRes.json();
    res.status(200).json(json);
  } catch (err) {
    res.status(502).json({
      error: { message: `ไม่สามารถเชื่อมต่อ Google Gemini API จากเซิร์ฟเวอร์ได้: ${err.message}` },
    });
  }
}
