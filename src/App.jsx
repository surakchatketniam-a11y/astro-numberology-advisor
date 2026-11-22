import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CalendarDays,
  CalendarRange,
  Clock,
  Compass,
  Download,
  Heart,
  Hash,
  Image as ImageIcon,
  Settings,
  WifiOff,
} from 'lucide-react';
import ZodiacTab from './components/ZodiacTab';
import NumerologyTab from './components/NumerologyTab';
import ImageAnalysisTab from './components/ImageAnalysisTab';
import DailyTab from './components/DailyTab';
import MonthlyTab from './components/MonthlyTab';
import CompatibilityTab from './components/CompatibilityTab';
import { ProfilesProvider } from './context/ProfilesContext';
import { GlossaryProvider, useGlossary } from './context/GlossaryContext';
import SettingsModal from './components/SettingsModal';
import HistoryModal from './components/HistoryModal';
import {
  addHistoryEntry,
  clearHistory,
  deleteHistoryEntry,
  deleteProfile,
  importHistory,
  isAIConfigured,
  loadHistory,
  loadProfiles,
  loadSettings,
  saveProfile,
  saveSettings,
} from './utils/storage';
import { checkProxyHealth } from './services/gemini';

const TABS = [
  { id: 'zodiac', enLabel: '01 / ZODIAC', label: 'เช็กราศี & ดวงชะตา', shortLabel: 'เช็กราศี', icon: Compass },
  { id: 'daily', enLabel: '02 / DAILY', label: 'ดวงรายวัน', shortLabel: 'รายวัน', icon: CalendarDays },
  { id: 'monthly', enLabel: '03 / MONTHLY', label: 'ดวงรายเดือน', shortLabel: 'รายเดือน', icon: CalendarRange },
  { id: 'compat', enLabel: '04 / COMPATIBILITY', label: 'ดูคู่ความเข้ากัน', shortLabel: 'ดูคู่', icon: Heart },
  { id: 'numerology', enLabel: '05 / NUMEROLOGY', label: 'วิเคราะห์เลขศาสตร์', shortLabel: 'เลขศาสตร์', icon: Hash },
  { id: 'image', enLabel: '06 / VISION AI', label: 'วิเคราะห์จากภาพคำทำนาย', shortLabel: 'ภาพคำทำนาย', icon: ImageIcon },
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

function AppShell() {
  const { openGlossary } = useGlossary();
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [settings, setSettings] = useState(() => loadSettings());
  const [proxyStatus, setProxyStatus] = useState({
    ok: false,
    serverKeyConfigured: false,
    rateLimit: null,
  });
  const [history, setHistory] = useState(() => loadHistory());
  const [profiles, setProfiles] = useState(() => loadProfiles());
  const [lastZodiacResult, setLastZodiacResult] = useState(null);

  useEffect(() => {
    let active = true;
    checkProxyHealth(settings.proxyUrl).then((status) => {
      if (active) setProxyStatus(status);
    });
    return () => {
      active = false;
    };
  }, [settings.proxyUrl]);

  const effectiveSettings = {
    ...settings,
    serverProxyReady: proxyStatus.serverKeyConfigured,
  };
  const aiReady = isAIConfigured(effectiveSettings);

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

  const handleImportHistory = (text) => {
    const result = importHistory(text);
    setHistory(result.history);
    return result;
  };

  const handleClearHistory = () => {
    setHistory(clearHistory());
  };

  const handleSaveProfile = (profile) => {
    setProfiles(saveProfile(profile));
  };

  const handleDeleteProfile = (id) => {
    setProfiles(deleteProfile(id));
  };

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col pb-24 md:pb-12">
      {/* Minimalist Floating Black Top Bar */}
      <header className="sticky top-0 z-30 bg-black border-b border-[#202020]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/icons/icon.svg"
              alt="Astro & Numerology Advisor"
              className="h-10 w-10 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-display-latin text-sm sm:text-lg text-white leading-tight truncate">
                ASTRO &amp; NUMEROLOGY ADVISOR
              </h1>
              <p className="text-xs text-[#7D7D7D] truncate">
                โหราศาสตร์ไทย–สากล และเลขศาสตร์เชิงจิตวิทยา
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOffline && (
              <span
                title="กำลังใช้งานแบบออฟไลน์"
                className="inline-flex items-center gap-1.5 px-2.5 h-10 bg-[#181818] border border-[#FFC000] text-xs text-[#FFC000]"
              >
                <WifiOff className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ออฟไลน์</span>
              </span>
            )}

            {installPrompt && (
              <button
                type="button"
                onClick={handleInstallPWA}
                className="inline-flex items-center gap-1.5 px-3 h-10 bg-[#FFC000] hover:bg-[#917300] text-black hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ติดตั้งแอป</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => openGlossary()}
              className="relative inline-flex items-center gap-2 px-3 h-10 bg-transparent hover:bg-[#202020] border border-[#333333] hover:border-white/50 text-xs sm:text-sm text-white transition-colors cursor-pointer"
              aria-label="เปิดหน้าคำศัพท์"
            >
              <BookOpen className="h-4 w-4 text-[#FFC000]" />
              <span className="hidden sm:inline">คำศัพท์</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="relative inline-flex items-center gap-2 px-3 h-10 bg-transparent hover:bg-[#202020] border border-[#333333] hover:border-white/50 text-xs sm:text-sm text-white transition-colors cursor-pointer"
              aria-label="เปิดประวัติการดูดวง"
            >
              <Clock className="h-4 w-4 text-[#FFC000]" />
              <span className="hidden sm:inline">ประวัติ</span>
              {history.length > 0 && (
                <span className="min-w-[20px] h-[20px] px-1 bg-[#FFC000] text-black text-[11px] font-semibold flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="relative inline-flex items-center gap-2 px-3 h-10 bg-transparent hover:bg-[#202020] border border-[#333333] hover:border-white/50 text-xs sm:text-sm text-white transition-colors cursor-pointer"
              aria-label="ตั้งค่า Gemini API"
            >
              <Settings className="h-4 w-4 text-white" />
              <span className="hidden sm:inline">ตั้งค่า AI</span>
              <span
                className={`h-2 w-2 ${
                  aiReady ? 'bg-[#4ade80]' : 'bg-[#FFC000]'
                }`}
                title={
                  settings.apiKey
                    ? 'เชื่อมต่อด้วย API Key ส่วนตัวแล้ว'
                    : proxyStatus.serverKeyConfigured
                      ? 'เชื่อมต่อผ่าน Server Proxy พร้อมใช้งาน'
                      : 'ยังไม่ได้ตั้งค่า AI'
                }
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-6 sm:space-y-8">
        {/* Desktop Sharp Architectural Tab Bar */}
        <nav
          aria-label="เมนูหลัก"
          className="hidden md:grid grid-cols-6 border border-[#333333] bg-[#181818]"
        >
          {TABS.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-start gap-1 px-4 py-4 text-left transition-colors cursor-pointer ${
                  index > 0 ? 'border-l border-[#333333]' : ''
                } ${
                  isActive
                    ? 'bg-[#202020] border-b-2 border-b-[#FFC000]'
                    : 'bg-[#181818] hover:bg-[#202020] border-b-2 border-b-transparent'
                }`}
              >
                <span
                  className={`font-display-latin text-[11px] tracking-[0.225px] ${
                    isActive ? 'text-[#FFC000]' : 'text-[#7D7D7D]'
                  }`}
                >
                  {tab.enLabel}
                </span>
                <span
                  className={`flex items-center gap-2 text-base font-medium ${
                    isActive ? 'text-white' : 'text-[#a6a6a6]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#FFC000]' : 'text-[#7D7D7D]'}`} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Keep all tabs mounted to preserve user input & results */}
        <section className={activeTab === 'zodiac' ? 'block' : 'hidden'}>
          <ZodiacTab
            settings={effectiveSettings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSaveHistory={handleAddHistory}
            onZodiacComputed={setLastZodiacResult}
            profiles={profiles}
            onSaveProfile={handleSaveProfile}
            onDeleteProfile={handleDeleteProfile}
          />
        </section>

        <section className={activeTab === 'daily' ? 'block' : 'hidden'}>
          <DailyTab
            settings={effectiveSettings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSaveHistory={handleAddHistory}
            lastZodiacResult={lastZodiacResult}
          />
        </section>

        <section className={activeTab === 'monthly' ? 'block' : 'hidden'}>
          <MonthlyTab
            settings={effectiveSettings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSaveHistory={handleAddHistory}
            lastZodiacResult={lastZodiacResult}
          />
        </section>

        <section className={activeTab === 'compat' ? 'block' : 'hidden'}>
          <CompatibilityTab
            settings={effectiveSettings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSaveHistory={handleAddHistory}
          />
        </section>

        <section className={activeTab === 'numerology' ? 'block' : 'hidden'}>
          <NumerologyTab
            settings={effectiveSettings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSaveHistory={handleAddHistory}
          />
        </section>

        <section className={activeTab === 'image' ? 'block' : 'hidden'}>
          <ImageAnalysisTab
            settings={effectiveSettings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSaveHistory={handleAddHistory}
            lastZodiacResult={lastZodiacResult}
            profiles={profiles}
          />
        </section>

        <footer className="pt-8 pb-4 border-t border-[#202020] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7D7D7D]">
          <span className="font-display-latin tracking-[0.2px]">
            ASTRO &amp; NUMEROLOGY ADVISOR
          </span>
          <span>ออกแบบเพื่อการรับรู้ตนเองและการวางแผนชีวิตอย่างมีเหตุผล</span>
        </footer>
      </main>

      {/* Mobile Sharp Bottom Navigation Bar */}
      <nav
        aria-label="เมนูหลักมือถือ"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[#333333] bg-black safe-pb"
      >
        <div className="grid grid-cols-6 max-w-xl mx-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 py-3 border-t-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-t-[#FFC000] text-white bg-[#181818]'
                    : 'border-t-transparent text-[#7D7D7D] hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-[#FFC000]' : 'text-[#7D7D7D]'}`} />
                <span className="text-xs font-medium">{tab.shortLabel}</span>
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
        proxyStatus={proxyStatus}
        onSave={handleSaveSettings}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearHistory}
        onImport={handleImportHistory}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProfilesProvider>
      <GlossaryProvider>
        <AppShell />
      </GlossaryProvider>
    </ProfilesProvider>
  );
}
