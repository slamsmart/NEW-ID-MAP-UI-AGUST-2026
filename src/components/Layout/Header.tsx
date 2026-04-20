import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Database, Wifi, WifiOff, RefreshCw, ChevronDown, LogOut } from 'lucide-react';
import { alerts } from '../../data/mockData';
import { useAuth } from '../../context/useAuth';
import { fetchSurveyStats } from '../../data/localStore';
import { syncPendingQueue, getPendingCount } from '../../lib/offlineQueue';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const ROLE_LABEL: Record<string, string> = {
  verifikator: 'Verifikator',
  admin: 'Admin',
  viewer: 'Viewer',
};

export default function Header({ title, subtitle }: HeaderProps) {
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
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari lokasi..."
            className="pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 w-44 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600">
          <Database className="w-3.5 h-3.5 text-gray-500" />
          <span className="font-medium">Cabdin KP Kab. Malang</span>
          <span
            className="bg-green-700 text-white rounded px-1.5 py-0.5 font-bold text-xs"
            title="Periode data referensi dari sumber GMW/PMN/MonMang. Bukan tanggal sistem saat ini."
          >
            Ref. 2025
          </span>
        </div>

        <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border ${
          isOnline
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          {syncing
            ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            : isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />
          }
          {syncing ? 'Sinkronisasi...' : isOnline ? 'Online' : 'Offline'}
          {pendingSync > 0 && !isOnline && (
            <span className="bg-amber-600 text-white rounded-full px-1.5 font-bold">{pendingSync}</span>
          )}
        </div>

        {surveyCount > 0 && (
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-700 font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse inline-block" />
            {surveyCount} survei
          </div>
        )}

        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          {totalAlert > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {totalAlert}
            </span>
          )}
        </button>

        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
            onClick={() => setAccountMenuOpen(open => !open)}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 bg-green-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-800 max-w-32 truncate">{user?.nama ?? 'Pengguna'}</p>
              <p className="text-xs text-gray-400">{roleName}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {accountMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
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
