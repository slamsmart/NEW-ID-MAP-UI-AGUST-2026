import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Database, Wifi, WifiOff, RefreshCw, ChevronDown, LogOut, Menu } from 'lucide-react';
import { alerts } from '../../data/mockData';
import { useAuth } from '../../context/useAuth';
import { fetchSurveyStats } from '../../data/localStore';
import { syncPendingQueue, getPendingCount } from '../../lib/offlineQueue';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  verifikator: 'Verifikator',
  admin: 'Admin',
  viewer: 'Viewer',
};

export default function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const totalAlert = criticalCount + warningCount;

  const [surveyCount, setSurveyCount] = useState(0);
  const [pendingSync, setPendingSync] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const refresh = async () => {
      const stats = await fetchSurveyStats();
      setSurveyCount(stats.total);
      setPendingSync(getPendingCount());
    };
    void refresh();

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncing(true);
      await syncPendingQueue();
      setSyncing(false);
      await refresh();
    };
    const handleOffline = () => setIsOnline(false);
    const handleStorage = () => { void refresh(); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.initials ?? 'USR';
  const roleName = user?.role ? ROLE_LABEL[user.role] : 'Pengguna';

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <header
      className="px-3 md:px-6 py-3 flex items-center justify-between gap-2 flex-shrink-0 border-b border-white/15 text-white"
      style={{
        background:
          'linear-gradient(120deg, #064e3b 0%, #047857 30%, #0e7490 70%, #0369a1 100%)',
      }}
    >
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-sm md:text-lg font-bold text-white truncate drop-shadow-sm">{title}</h2>
          {subtitle && <p className="text-xs text-white/75 mt-0.5 hidden md:block truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Desktop-only: DB badge */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white/15 border border-white/25 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs text-white/90">
          <Database className="w-3.5 h-3.5 text-white/80" />
          <span className="font-medium">Cabdin KP Kab. Malang</span>
          <span className="bg-emerald-400 text-emerald-950 rounded px-1.5 py-0.5 font-bold text-xs shadow-sm">Ref. 2025</span>
        </div>

        {/* Online status — icon only on mobile */}
        <div className={`flex items-center gap-1.5 rounded-lg px-2 md:px-2.5 py-1.5 text-xs font-medium border backdrop-blur-sm ${
          isOnline
            ? 'bg-emerald-400/20 border-emerald-300/40 text-emerald-50'
            : 'bg-amber-400/20 border-amber-300/40 text-amber-50'
        }`}>
          {syncing
            ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            : isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />
          }
          <span className="hidden sm:inline">
            {syncing ? 'Sinkronisasi...' : isOnline ? 'Online' : 'Offline'}
          </span>
          {pendingSync > 0 && !isOnline && (
            <span className="bg-amber-500 text-white rounded-full px-1.5 font-bold">{pendingSync}</span>
          )}
        </div>

        {/* Survey count — hide on small screens */}
        {surveyCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 bg-sky-400/20 border border-sky-300/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs text-sky-50 font-medium">
            <span className="w-2 h-2 bg-sky-300 rounded-full animate-pulse inline-block" />
            {surveyCount} survei
          </div>
        )}

        {/* Bell */}
        <button className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          {totalAlert > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 ring-2 ring-white/30 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {totalAlert}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
            onClick={() => setAccountMenuOpen(open => !open)}
            className="flex items-center gap-1.5 md:gap-2 bg-white/15 border border-white/25 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1.5 hover:bg-white/25 transition-colors"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-sky-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-white max-w-28 truncate">{user?.nama ?? 'Pengguna'}</p>
              <p className="text-xs text-white/70">{roleName}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/70 transition-transform hidden md:block ${accountMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {accountMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20 text-gray-800">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.nama ?? 'Pengguna'}</p>
                <p className="text-xs text-gray-500">{roleName}</p>
                {user?.email && <p className="text-xs text-gray-400 mt-1 truncate">{user.email}</p>}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
