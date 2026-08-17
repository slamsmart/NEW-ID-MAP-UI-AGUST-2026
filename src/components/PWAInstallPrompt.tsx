import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 3s delay
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setInstalled(true); setShow(false); });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
    setShow(false);
  };

  if (!show || installed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] sm:left-auto sm:right-4 sm:w-80 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-xl shadow-slate-900/15 p-4 flex items-start gap-3">
        <div className="w-10 h-10 bg-[#071520] rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install ID-MAP</p>
          <p className="text-slate-500 text-xs mt-0.5">Pasang di Android / HP untuk akses offline lebih cepat</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 bg-[#071520] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#0d404f] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Install APK
            </button>
            <button
              onClick={() => setShow(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              Nanti
            </button>
          </div>
        </div>
        <button onClick={() => setShow(false)} className="text-slate-400 hover:text-slate-700 flex-shrink-0 transition-colors" aria-label="Tutup prompt instalasi">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
