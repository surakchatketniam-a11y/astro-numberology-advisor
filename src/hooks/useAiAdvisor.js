import { useCallback, useEffect, useRef, useState } from 'react';
import { callGeminiAdvisor } from '../services/gemini';
import { isAIConfigured } from '../utils/storage';

/**
 * จัดการการเรียก Gemini แบบสตรีม: สถานะ loading/error/ผลลัพธ์, ยกเลิกได้, ยกเลิกอัตโนมัติเมื่อ unmount
 * run() คืน response เมื่อสำเร็จ และคืน null เมื่อล้มเหลวหรือผู้ใช้กดหยุด
 */
export function useAiAdvisor({ settings, onOpenSettings }) {
  const [aiResult, setAiResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setAiResult(null);
    setAiError('');
  }, []);

  const run = useCallback(
    async (prompt, { image = null } = {}) => {
      if (!isAIConfigured(settings)) {
        onOpenSettings();
        return null;
      }
      const controller = new AbortController();
      abortRef.current = controller;
      setLoadingAI(true);
      setAiError('');
      try {
        const response = await callGeminiAdvisor({
          apiKey: settings.apiKey,
          model: settings.model,
          proxyUrl: settings.proxyUrl,
          useServerProxy: settings.useServerProxy,
          prompt,
          image,
          onPartial: setAiResult,
          signal: controller.signal,
        });
        setAiResult(response);
        return response;
      } catch (err) {
        setAiResult(null);
        if (!controller.signal.aborted) {
          setAiError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini API');
        }
        return null;
      } finally {
        setLoadingAI(false);
      }
    },
    [
      settings.apiKey,
      settings.model,
      settings.proxyUrl,
      settings.useServerProxy,
      settings.serverProxyReady,
      onOpenSettings,
    ]
  );

  return { aiResult, loadingAI, aiError, run, stop, reset };
}
