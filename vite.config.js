import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import geminiHandler from './api/gemini.js';

function localGeminiProxyPlugin(env) {
  const attachMiddleware = (middlewares) => {
    middlewares.use('/api/gemini', async (req, res) => {
      // Inject server-only env vars from .env (never exposed to browser bundle)
      if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
      }
      if (env.RATE_LIMIT_MAX && !process.env.RATE_LIMIT_MAX) {
        process.env.RATE_LIMIT_MAX = env.RATE_LIMIT_MAX;
      }
      if (env.RATE_LIMIT_WINDOW_MS && !process.env.RATE_LIMIT_WINDOW_MS) {
        process.env.RATE_LIMIT_WINDOW_MS = env.RATE_LIMIT_WINDOW_MS;
      }

      // Express-like helpers expected by Vercel handler
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (obj) => {
        if (!res.getHeader('Content-Type')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
        res.end(JSON.stringify(obj));
      };

      if (req.method === 'POST') {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const raw = Buffer.concat(chunks).toString('utf8');
        try {
          req.body = raw ? JSON.parse(raw) : {};
        } catch {
          req.body = {};
        }
      }

      await geminiHandler(req, res);
    });
  };

  return {
    name: 'local-gemini-proxy',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      localGeminiProxyPlugin(env),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: false,
        includeAssets: ['icons/*', 'manifest.json'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'google-fonts-styles' },
            },
            {
              urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-files',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    test: {
      environment: 'node',
    },
  };
});
