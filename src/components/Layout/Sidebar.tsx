import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Leaf,
  ClipboardList,
  Lock, Sprout, Turtle, Trees,
  ClipboardCheck, X, Map as MapIcon, Users,
  FlaskConical, AlertTriangle, BarChart3, Globe, Flower2,
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
  { to: '/data-pokmaswas', icon: Users, label: 'Data Pokmaswas', minRole: ['admin', 'verifikator'] },
  { to: '/ekosistem', icon: Leaf, label: 'Kondisi Ekosistem' },
];

const NAV_INPUT: NavItem[] = [
  { to: '/input-lapangan', icon: ClipboardList, label: 'Input Data Lapangan', minRole: ['verifikator', 'admin'] },
];

const NAV_MONITORING: NavItem[] = [
  { to: '/rekomendasi-lokasi', icon: Sprout, label: 'Potensi & Rekomendasi' },
  { to: '/vegetasi-mangrove', icon: Trees, label: 'Monitoring Vegetasi' },
  { to: '/pendaratan-penyu', icon: Turtle, label: 'Titik Pendaratan Penyu' },
  { to: '/pembibitan-mangrove', icon: Flower2, label: 'Pembibitan Mangrove' },
  { to: '/lingkungan', icon: FlaskConical, label: 'Analisis Lingkungan' },
  { to: '/tekanan-sosial', icon: AlertTriangle, label: 'Tekanan Sosial' },
  { to: '/laporan', icon: BarChart3, label: 'Laporan & Analitik' },
];

const NAV_DATA: NavItem[] = [
  { to: '/mangrove-nasional', icon: Globe, label: 'Mangrove Nasional', minRole: ['admin'] },
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
            className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-white/40 cursor-not-allowed select-none"
            title="Akses terbatas"
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span className="flex-1 line-through">{label}</span>
            <Lock className="w-3 h-3" />
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
            `flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-all ${
              isActive
                ? 'bg-white/10 text-white border-l-4 border-[#f06424]'
                : 'text-white/75 hover:bg-white/10 hover:text-white border-l-4 border-transparent'
            }`
          }
        >
          {({ isActive }: { isActive: boolean }) => (
            <>
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[#f06424]' : 'text-white/50'}`} />
              <span className="flex-1 leading-tight">{label}</span>
            </>
          )}
        </NavLink>
      );
    });

  const sidebarContent = (
    <aside
      className="relative w-[220px] h-full flex flex-col overflow-hidden border-r border-white/15 bg-[#071520] bg-[linear-gradient(160deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_45%,rgba(255,255,255,0.05)_100%)]"
    >
      {/* Logo / Brand */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div
          className="cursor-pointer"
          onClick={() => { navigate('/'); handleNavClick(); }}
        >
          <h1 className="text-xl font-bold text-white tracking-tight">ID-MAP</h1>
          <p className="text-[11px] text-white/70 font-medium mt-0.5">Integrasi Data Mangrove dan Pesisir</p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {renderNavItems(NAV_MAIN)}

        {user && (user.role === 'verifikator' || user.role === 'admin') && (
          <div className="mt-4">
            <p className="text-[10px] text-white/60 uppercase tracking-[0.15em] font-semibold px-5 pb-1.5">Input Data</p>
            {renderNavItems(NAV_INPUT)}
          </div>
        )}

        {user && (
          <div className="mt-4">
            <p className="text-[10px] text-white/60 uppercase tracking-[0.15em] font-semibold px-5 pb-1.5">Monitoring Pesisir</p>
            {renderNavItems(NAV_MONITORING)}
          </div>
        )}

        {user && user.role === 'verifikator' && (
          <div className="mt-4">
            <p className="text-[10px] text-white/60 uppercase tracking-[0.15em] font-semibold px-5 pb-1.5">Verifikasi</p>
            {renderNavItems(NAV_VERIFIKASI)}
          </div>
        )}

        {user && user.role === 'admin' && (
          <div className="mt-4">
            <p className="text-[10px] text-white/60 uppercase tracking-[0.15em] font-semibold px-5 pb-1.5">Data Nasional</p>
            {renderNavItems(NAV_DATA)}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-[10px] text-white/50 text-center font-medium">ID-MAP v1.1 · Cabdin KP Kab. Malang</p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always-visible sidebar */}
      <div className="hidden md:flex w-[220px] h-full flex-shrink-0">
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
