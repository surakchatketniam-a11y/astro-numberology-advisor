import React, { useState, useEffect } from 'react';
import {
  Clock,
  Compass,
  Download,
  Hash,
  Image as ImageIcon,
  Settings,
  WifiOff,
} from 'lucide-react';
import ZodiacTab from './components/ZodiacTab';
import NumerologyTab from './components/NumerologyTab';
import ImageAnalysisTab from './components/ImageAnalysisTab';
import SettingsModal from './components/SettingsModal';
import HistoryModal from './components/HistoryModal';
import {
  addHistoryEntry,
  clearHistory,
  deleteHistoryEntry,
  loadHistory,
  loadSettings,
  saveSettings,
} from './utils/storage';

const TABS = [
  { id: 'zodiac', label: 'เช็กราศี & ดวงชะตา', shortLabel: 'เช็กราศี', icon: Compass },
  { id: 'numerology', label: 'วิเคราะห์เลขศาสตร์', shortLabel: 'เลขศาสตร์', icon: Hash },
  { id: 'image', label: 'วิเคราะห์จากภาพคำทำนาย', shortLabel: 'ภาพคำทำนาย', icon: ImageIcon },
];

function getInitialTab() {
  try {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (TABS.some((t) => t.id === tab)) return tab;
  } catch {
    // Ignore
  }
  return 'zodiac';
}

export default function App() {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [settings, setSettings] = useState(() => loadSettings());
  const [history, setHistory] = useState(() => loadHistory());
  const [lastZodiacResult, setLastZodiacResult] = useState(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const handleAppInstalled = () => setInstallPrompt(null);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleSaveSettings = (nextSettings) => {
    saveSettings(nextSettings);
    setSettings(nextSettings);
  };

  const handleAddHistory = (entry) => {
    const updated = addHistoryEntry(entry);
    setHistory(updated);
  };

  const handleDeleteHistory = (id) => {
    setHistory(deleteHistoryEntry(id));
  };

  const handleClearHistory = () => {
    setHistory(clearHistory());
  };

  return (
    <div className="min-h-dvh flex flex-col pb-24 md:pb-10">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-amber-500/15 bg-[#0b1120]/85 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/icons/icon.svg"
              alt="Astro & Numerology Advisor"
              className="h-9 w-9 rounded-xl border border-amber-400/30 shadow-md shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-display text-sm sm:text-base font-bold tracking-wide gold-gradient-text truncate">
                Astro &amp; Numerology Advisor
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                โหราศาสตร์ไทย–สากล &amp; เลขศาสตร์เชิงจิตวิทยา
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isOffline && (
              <span
                title="กำลังใช้งานแบบออฟไลน์"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-400/30 text-[11px] text-amber-200"
              >
                <WifiOff className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ออฟไลน์</span>
              </span>
            )}

            {installPrompt && (
              <button
                type="button"
                onClick={handleInstallPWA}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-xs font-medium text-amber-200 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ติดตั้งแอป</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="relative inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition cursor-pointer"
              aria-label="เปิดประวัติการดูดวง"
            >
              <Clock className="h-4 w-4 text-amber-300" />
              <span className="hidden sm:inline">ประวัติ</span>
              {history.length > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500/25 border border-amber-400/40 text-[10px] font-semibold text-amber-200 flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="relative inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition cursor-pointer"
              aria-label="ตั้งค่า Gemini API"
            >
              <Settings className="h-4 w-4 text-slate-300" />
              <span className="hidden sm:inline">ตั้งค่า AI</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  settings.apiKey ? 'bg-emerald-400' : 'bg-amber-400/70'
                }`}
                title={settings.apiKey ? 'เชื่อมต่อ API Key แล้ว' : 'ยังไม่ได้ตั้งค่า API Key'}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-5 space-y-5">
        {/* Desktop Pill Tabs */}
        <nav
          aria-label="เมนูหลัก"
          className="hidden md:grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-400/15 text-amber-200 border border-amber-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Keep all 3 tabs mounted to preserve user input & results when switching */}
        <section className={activeTab === 'zodiac' ? 'block' : 'hidden'}>
          <ZodiacTab
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSaveHistory={handleAddHistory}
            onZodiacComputed={setLastZodiacResult}
          />
        </section>

        <section className={activeTab === 'numerology' ? 'block' : 'hidden'}>
          <NumerologyTab
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSaveHistory={handleAddHistory}
          />
        </section>

        <section className={activeTab === 'image' ? 'block' : 'hidden'}>
          <ImageAnalysisTab
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSaveHistory={handleAddHistory}
            lastZodiacResult={lastZodiacResult}
          />
        </section>

        <footer className="pt-4 pb-2 text-center text-[11px] text-slate-500">
          Astro &amp; Numerology Advisor • ออกแบบเพื่อการรับรู้ตนเองและการวางแผนชีวิตอย่างมีเหตุผล
        </footer>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="เมนูหลักมือถือ"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-amber-500/15 bg-[#0b1120]/95 backdrop-blur-lg safe-pb"
      >
        <div className="grid grid-cols-3 max-w-md mx-auto px-2 pt-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition cursor-pointer ${
                  isActive ? 'text-amber-300 bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span className="text-[11px] font-medium">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearHistory}
      />
    </div>
  );
}
