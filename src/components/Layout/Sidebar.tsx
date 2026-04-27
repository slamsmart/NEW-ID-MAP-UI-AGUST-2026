import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Leaf,
  ClipboardList, ChevronRight,
  Lock, Sprout, Turtle, Trees,
  ClipboardCheck, X, Map as MapIcon,
} from 'lucide-react';
import type { UserRole } from '../../context/authModel';
import { useAuth } from '../../context/useAuth';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
  minRole?: UserRole[];
}

const NAV_MAIN: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/peta', icon: MapIcon, label: 'Lihat Peta Interaktif' },
  { to: '/ekosistem', icon: Leaf, label: 'Kondisi Ekosistem' },
];

const NAV_INPUT: NavItem[] = [
  { to: '/input-lapangan', icon: ClipboardList, label: 'Input Data Lapangan', minRole: ['verifikator', 'admin'] },
];

const NAV_MONITORING: NavItem[] = [
  { to: '/rekomendasi-lokasi', icon: Sprout, label: 'Potensi & Rekomendasi' },
  { to: '/vegetasi-mangrove', icon: Trees, label: 'Monitoring Mangrove / Vegetasi' },
  { to: '/pendaratan-penyu', icon: Turtle, label: 'Titik Pendaratan Penyu' },
];

const NAV_VERIFIKASI: NavItem[] = [
  { to: '/verifikasi-data', icon: ClipboardCheck, label: 'Verifikasi Data', minRole: ['verifikator'] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const canAccess = (item: NavItem) => {
    if (!item.minRole) return true;
    return user ? item.minRole.includes(user.role) : false;
  };

  const handleNavClick = () => {
    onClose();
  };

  const renderNavItems = (items: NavItem[]) =>
    items.map(({ to, icon: Icon, label, exact, minRole }) => {
      const allowed = canAccess({ to, icon: Icon, label, minRole });
      if (!allowed) {
        return (
          <div key={to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-green-800 cursor-not-allowed select-none"
            title="Akses terbatas"
          >
            <Icon className="w-4 h-4 text-green-900 flex-shrink-0" />
            <span className="flex-1 line-through">{label}</span>
            <Lock className="w-3 h-3 text-green-900" />
          </div>
        );
      }
      return (
        <NavLink
          key={to}
          to={to}
          end={exact}
          onClick={() => {
            if (to === '/input-lapangan' && location.pathname === '/input-lapangan') {
              window.dispatchEvent(new CustomEvent('idmap:reset-input-lapangan'));
            }
            handleNavClick();
          }}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors group ${
              isActive
                ? 'bg-white/20 text-white shadow-sm border border-white/25 backdrop-blur-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          {({ isActive }: { isActive: boolean }) => (
            <>
              <Icon className={`w-[15px] h-[15px] flex-shrink-0 ${isActive ? 'text-emerald-200' : 'text-white/60 group-hover:text-white'}`} />
              <span className="flex-1 leading-tight">{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-white/80" />}
            </>
          )}
        </NavLink>
      );
    });

  const sidebarContent = (
    <aside
      className="w-64 h-full text-white flex flex-col"
      style={{
        background:
          'linear-gradient(180deg, #064e3b 0%, #065f46 35%, #0e7490 75%, #0369a1 100%)',
      }}
    >
      <div className="px-4 pt-4 pb-3 border-b border-white/15 flex items-center justify-between">
        <img
          src="/logo.svg"
          alt="ID-MAP"
          className="h-14 w-auto object-contain cursor-pointer"
          draggable={false}
          onClick={() => { navigate('/dashboard'); handleNavClick(); }}
        />
        <button
          onClick={onClose}
          className="md:hidden p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="bg-white/10 rounded-lg px-3 py-2 border border-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
            <span className="text-xs text-white font-semibold">Sistem Aktif</span>
          </div>
          <p className="text-[11px] text-white/70 mt-0.5 leading-snug">Wilker Cabdin KP Kab. Malang · Ref. 2024–2025</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] text-white/55 uppercase tracking-[0.18em] font-semibold px-3 pt-1 pb-2">Menu Utama</p>
        {renderNavItems(NAV_MAIN)}

        {user && (user.role === 'verifikator' || user.role === 'admin') && (
          <div className="pt-4">
            <p className="text-[10px] text-white/55 uppercase tracking-[0.18em] font-semibold px-3 pb-2">Input Data</p>
            {renderNavItems(NAV_INPUT)}
          </div>
        )}

        {user && (
          <div className="pt-4">
            <p className="text-[10px] text-white/55 uppercase tracking-[0.18em] font-semibold px-3 pb-2">Monitoring Pesisir</p>
            {renderNavItems(NAV_MONITORING)}
          </div>
        )}

        {user && user.role === 'verifikator' && (
          <div className="pt-4">
            <p className="text-[10px] text-white/55 uppercase tracking-[0.18em] font-semibold px-3 pb-2">Verifikasi</p>
            {renderNavItems(NAV_VERIFIKASI)}
          </div>
        )}
      </nav>

      <div className="px-4 py-3 border-t border-white/15">
        <p className="text-[10px] text-white/55 text-center">ID-MAP v1.0 · Cabdin KP Kab. Malang</p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always-visible sidebar (h-full = match parent h-dvh) */}
      <div className="hidden md:flex w-64 h-full flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile: slide-over drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative z-10 h-full flex-shrink-0">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
