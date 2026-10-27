import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, History, HelpCircle, ChevronDown, LogOut, Search } from 'lucide-react';
import { alerts } from '../../data/seedData';
import { useAuth } from '../../context/useAuth';

interface HeaderActionsProps {
  /** 'light' = header putih global; 'dark' = di dalam box dashboard gelap */
  variant?: 'light' | 'dark';
  /** Tampilkan tombol menu (mobile) di sisi kiri */
  onMenuClick?: () => void;
  /** Sembunyikan kolom pencarian (dipakai di box dashboard utama) */
  hideSearch?: boolean;
}

const ROLE_LABEL: Record<string, string> = {
  verifikator: 'Verifikator',
  admin: 'Administrator',
  viewer: 'Viewer',
};

export default function HeaderActions({ variant = 'light', onMenuClick, hideSearch = false }: HeaderActionsProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const totalAlert = alerts.filter(a => a.type !== 'info').length;

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (!notifRef.current?.contains(event.target as Node)) {
        setNotifOpen(false);
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
    window.dispatchEvent(new CustomEvent('idmap:logout-success'));
    navigate('/', { replace: true });
  };

  const isDark = variant === 'dark';

  return (
    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
      {/* Hamburger (mobile) */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className={`md:hidden p-2 rounded-lg transition-colors flex-shrink-0 ${
            isDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          aria-label="Buka menu"
        >
          <MenuIcon />
        </button>
      )}

      {/* Search bar — bisa disembunyikan (mis. di dalam box dashboard utama) */}
      {!hideSearch && (
        <div className={`relative w-full ${isDark ? 'max-w-md' : 'max-w-xl'}`}>
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/50' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Cari data lingkungan..."
            className={`w-full rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#f06424] focus:ring-1 focus:ring-[#f06424] transition-all ${
              isDark
                ? 'bg-white/15 border border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm'
                : 'bg-gray-50 border border-gray-200'
            }`}
          />
        </div>
      )}

      <div className="flex items-center gap-3 md:gap-4 ml-auto flex-shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(open => !open)}
            aria-expanded={notifOpen}
            aria-haspopup="true"
            className={`relative flex transition-colors active:scale-95 duration-150 ${
              isDark ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-[#f06424]'
            }`}
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {totalAlert > 0 && (
              <span className="pointer-events-none absolute -top-1 -right-1 w-4 h-4 bg-red-500 ring-2 ring-white rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {totalAlert}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/15 bg-[#071520] text-white shadow-xl shadow-black/25 z-30">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="text-sm font-semibold">Notifikasi</p>
                <span className="text-xs text-white/50">{totalAlert} perlu perhatian</span>
              </div>
              <ul className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {alerts.map(a => (
                  <li key={a.id} className="flex gap-3 px-4 py-3 hover:bg-white/5">
                    <span
                      className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                        a.type === 'critical' ? 'bg-red-500' : a.type === 'warning' ? 'bg-amber-400' : 'bg-sky-400'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white">{a.lokasi}</p>
                      <p className="mt-0.5 text-xs text-white/65 leading-snug">{a.pesan}</p>
                      <p className="mt-1 text-[10px] text-white/40">{a.tanggal}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* History */}
        <button
          className={`transition-colors active:scale-95 duration-150 hidden sm:block ${
            isDark ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-[#f06424]'
          }`}
          title="Riwayat"
        >
          <History className="w-5 h-5" />
        </button>

        {/* Help */}
        <button
          className={`transition-colors active:scale-95 duration-150 hidden sm:block ${
            isDark ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-[#f06424]'
          }`}
          title="Bantuan"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className={`h-8 w-px hidden md:block ${isDark ? 'bg-white/20' : 'bg-gray-200'}`} />

        {/* User profile */}
        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
            onClick={() => setAccountMenuOpen(open => !open)}
            className={`flex items-center gap-3 rounded-lg px-2 py-1 transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'
            }`}
          >
            <div className="text-right hidden md:block">
              <p className={`text-sm font-semibold max-w-32 truncate leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.nama ?? 'Pengguna'}</p>
              <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{roleName}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#0d404f] to-[#071520] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-white/10">
              <span className="text-white text-sm font-bold">{initials}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform hidden md:block ${accountMenuOpen ? 'rotate-180' : ''} ${isDark ? 'text-white/60' : 'text-gray-400'}`} />
          </button>

          {accountMenuOpen && (
            <div className={`absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/15 bg-[#071520] text-white shadow-xl shadow-black/25 z-20 ${isDark ? 'mt-2' : ''}`}>
              <div className="border-b border-white/10 px-4 py-3">
                <p className="truncate text-sm font-semibold text-white">{user?.nama ?? 'Pengguna'}</p>
                <p className="text-xs text-white/55">{roleName}</p>
                {user?.email && <p className="mt-1 truncate text-xs text-white/40">{user.email}</p>}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[#ff9a70] transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icon terpisah agar import Menu tidak bentrok dengan nama lain.
function MenuIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
