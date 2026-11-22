// Cloudflare Worker — Gemini API Proxy with Rate Limiting
// Deploy: npx wrangler deploy workers/gemini-proxy.js --config workers/wrangler.toml
// Secret: npx wrangler secret put GEMINI_API_KEY --config workers/wrangler.toml

const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
]);

const rateBuckets = new Map();

function checkRateLimit(ip, maxReq, windowMs) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (rateBuckets.get(ip) || []).filter((ts) => ts > windowStart);

  if (timestamps.length >= maxReq) {
    const retryAfterSec = Math.max(1, Math.ceil((timestamps[0] + windowMs - now) / 1000));
    rateBuckets.set(ip, timestamps);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  timestamps.push(now);
  rateBuckets.set(ip, timestamps);
  return { allowed: true, remaining: maxReq - timestamps.length, retryAfterSec: 0 };
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '*';
  const allowed = (env.ALLOWED_ORIGIN || '*').trim();
  const allowOrigin =
    allowed === '*' || allowed.split(',').map((s) => s.trim()).includes(origin) ? origin : '';

  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
  if (allowOrigin) headers['Access-Control-Allow-Origin'] = allowOrigin;
  return headers;
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/api/gemini' && url.pathname !== '/') {
      return new Response(JSON.stringify({ error: { message: 'Not Found' } }), {
        status: 404,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const serverKey = (env.GEMINI_API_KEY || '').trim();
    const maxReq = Number(env.RATE_LIMIT_MAX || 20);
    const windowMs = Number(env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);

    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({
          ok: true,
          serverKeyConfigured: Boolean(serverKey),
          allowedModels: Array.from(ALLOWED_MODELS),
          rateLimit: { max: maxReq, windowSeconds: Math.round(windowMs / 1000) },
        }),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
        status: 405,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (!serverKey) {
      return new Response(
        JSON.stringify({
          error: { message: 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า GEMINI_API_KEY' },
        }),
        { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rl = checkRateLimit(ip, maxReq, windowMs);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({
          error: {
            message: `ใช้งานเกินโควตาชั่วคราว กรุณารออีก ${rl.retryAfterSec} วินาที หรือใช้ API Key ส่วนตัวในหน้าตั้งค่า`,
          },
        }),
        {
          status: 429,
          headers: {
            ...cors,
            'Content-Type': 'application/json',
            'Retry-After': String(rl.retryAfterSec),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const model = typeof body.model === 'string' ? body.model.trim() : 'gemini-2.5-flash';
    if (!ALLOWED_MODELS.has(model)) {
      return new Response(
        JSON.stringify({ error: { message: `โมเดล "${model}" ไม่ได้รับอนุญาต` } }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const useStream = Boolean(body.stream);
    const action = useStream ? 'streamGenerateContent?alt=sse' : 'generateContent';
    const upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:${action}`;

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': serverKey,
      },
      body: JSON.stringify(body.payload),
    });

    const contentType = useStream
      ? 'text/event-stream; charset=utf-8'
      : 'application/json; charset=utf-8';

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: {
        ...cors,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      },
    });
  },
};
