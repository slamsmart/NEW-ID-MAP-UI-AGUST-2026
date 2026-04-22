import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Leaf,
  ClipboardList, ChevronRight,
  ShieldCheck, User, Globe, Lock, Sprout, Turtle, Trees,
  ClipboardCheck, X,
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

const ROLE_ICON: Record<string, React.ReactNode> = {
  verifikator: <ShieldCheck className="w-3.5 h-3.5" />,
  admin: <User className="w-3.5 h-3.5" />,
  viewer: <Globe className="w-3.5 h-3.5" />,
};

const ROLE_LABEL: Record<string, string> = {
  verifikator: 'Verifikator',
  admin: 'Admin',
  viewer: 'Pengguna Umum',
};

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
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
              isActive
                ? 'bg-green-700 text-white'
                : 'text-green-300 hover:bg-green-900 hover:text-white'
            }`
          }
        >
          {({ isActive }: { isActive: boolean }) => (
            <>
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-green-200' : 'text-green-500 group-hover:text-green-300'}`} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-green-400" />}
            </>
          )}
        </NavLink>
      );
    });

  const sidebarContent = (
    <aside className="w-64 h-full bg-green-950 text-white flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-green-900 flex items-center justify-between">
        <img
          src="/logo.svg"
          alt="ID-MAP"
          className="h-14 w-auto object-contain cursor-pointer"
          draggable={false}
          onClick={() => { navigate('/dashboard'); handleNavClick(); }}
        />
        <button
          onClick={onClose}
          className="md:hidden p-1.5 text-green-500 hover:text-white hover:bg-green-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {user && (
        <div className="px-4 py-3 border-b border-green-900">
          <div className="bg-green-900 rounded-lg px-3 py-2.5 border border-green-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-green-700 rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{user.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-100 truncate">{user.nama}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-green-500">{ROLE_ICON[user.role]}</span>
                  <span className="text-xs text-green-400">{ROLE_LABEL[user.role]}</span>
                </div>
              </div>
            </div>
            {user.provinsi && (
              <p className="text-xs text-green-600 mt-1.5 truncate">{user.provinsi}</p>
            )}
            {user.email && (
              <p className="text-xs text-green-700 mt-0.5 truncate">{user.email}</p>
            )}
          </div>
        </div>
      )}

      <div className="px-4 py-3">
        <div className="bg-green-900 rounded-lg px-3 py-2 border border-green-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-200 font-medium">Sistem Aktif</span>
          </div>
          <p className="text-xs text-green-600 mt-0.5">Wilker Cabdin KP Kab. Malang · Ref. 2024–2025</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="text-xs text-green-600 uppercase tracking-widest font-semibold px-3 py-2">Menu Utama</p>
        {renderNavItems(NAV_MAIN)}

        {user && (user.role === 'verifikator' || user.role === 'admin') && (
          <div className="pt-3">
            <p className="text-xs text-green-600 uppercase tracking-widest font-semibold px-3 py-2">Input Data</p>
            {renderNavItems(NAV_INPUT)}
          </div>
        )}

        {user && (
          <div className="pt-3">
            <p className="text-xs text-green-600 uppercase tracking-widest font-semibold px-3 py-2">Monitoring Pesisir</p>
            {renderNavItems(NAV_MONITORING)}
          </div>
        )}

        {user && user.role === 'verifikator' && (
          <div className="pt-3">
            <p className="text-xs text-green-600 uppercase tracking-widest font-semibold px-3 py-2">Verifikasi</p>
            {renderNavItems(NAV_VERIFIKASI)}
          </div>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-green-900">
        <p className="text-xs text-green-800 text-center">ID-MAP v1.0 · Cabdin KP Kab. Malang</p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always-visible sidebar */}
      <div className="hidden md:flex w-64 min-h-screen flex-shrink-0">
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
