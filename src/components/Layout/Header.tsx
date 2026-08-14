import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, History, HelpCircle, ChevronDown, LogOut, Menu, Search } from 'lucide-react';
import { alerts } from '../../data/seedData';
import { useAuth } from '../../context/useAuth';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  verifikator: 'Verifikator',
  admin: 'Administrator',
  viewer: 'Viewer',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const totalAlert = alerts.filter(a => a.type !== 'info').length;

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-4 px-4 md:px-8 flex-shrink-0">
      {/* Left: hamburger (mobile) + Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari data lingkungan..."
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Notifications */}
          <button
            className="relative text-gray-500 hover:text-emerald-600 transition-colors active:scale-95 duration-150"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {totalAlert > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 ring-2 ring-white rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {totalAlert}
              </span>
            )}
          </button>

          {/* History */}
          <button
            className="text-gray-500 hover:text-emerald-600 transition-colors active:scale-95 duration-150 hidden sm:block"
            title="Riwayat"
          >
            <History className="w-5 h-5" />
          </button>

          {/* Help */}
          <button
            className="text-gray-500 hover:text-emerald-600 transition-colors active:scale-95 duration-150 hidden sm:block"
            title="Bantuan"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 hidden md:block" />

        {/* User profile */}
        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
            onClick={() => setAccountMenuOpen(open => !open)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-900 max-w-32 truncate leading-tight">{user?.nama ?? 'Pengguna'}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{roleName}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200">
              <span className="text-white text-sm font-bold">{initials}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform hidden md:block ${accountMenuOpen ? 'rotate-180' : ''}`} />
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
