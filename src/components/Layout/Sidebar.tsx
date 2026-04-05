import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, Leaf, Waves, Users,
  FileText, ClipboardList, ChevronRight, LogOut, ShieldCheck, User, Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/peta', icon: Map, label: 'Peta Interaktif' },
  { to: '/ekosistem', icon: Leaf, label: 'Kondisi Ekosistem' },
  { to: '/lingkungan', icon: Waves, label: 'Analisis Lingkungan' },
  { to: '/tekanan-sosial', icon: Users, label: 'Tekanan & Sosial' },
  { to: '/laporan', icon: FileText, label: 'Laporan & Analitik' },
];

const ROLE_ICON: Record<string, React.ReactNode> = {
  admin_nasional: <ShieldCheck className="w-3.5 h-3.5" />,
  petugas_daerah: <User className="w-3.5 h-3.5" />,
  viewer: <Globe className="w-3.5 h-3.5" />,
};

const ROLE_LABEL: Record<string, string> = {
  admin_nasional: 'Admin Nasional',
  petugas_daerah: 'Petugas Daerah',
  viewer: 'Viewer Publik',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 min-h-screen bg-green-950 text-white flex flex-col">
      {/* Logo */}
      <div className="px-4 pt-4 pb-3 border-b border-green-900">
        <img
          src="/logo.svg"
          alt="ID-MAP — Integrasi Data Mangrove Pesisir"
          className="w-full h-auto max-h-20 object-contain"
          draggable={false}
        />
      </div>

      {/* User info */}
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
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="px-4 py-3">
        <div className="bg-green-900 rounded-lg px-3 py-2 border border-green-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-200 font-medium">Sistem Aktif</span>
          </div>
          {/* Clarified: this is the reference data period, not the current date */}
          <p className="text-xs text-green-600 mt-0.5">Sumber: GMW/KKP · Ref. 2024–2025</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <p className="text-xs text-green-600 uppercase tracking-widest font-semibold px-3 py-2">Menu Utama</p>
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? 'bg-green-700 text-white'
                  : 'text-green-300 hover:bg-green-900 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-green-200' : 'text-green-500 group-hover:text-green-300'}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-green-400" />}
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-3">
          <p className="text-xs text-green-600 uppercase tracking-widest font-semibold px-3 py-2">Input Data</p>
          <NavLink
            to="/input-lapangan"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                isActive ? 'bg-green-700 text-white' : 'text-green-300 hover:bg-green-900 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ClipboardList className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-green-200' : 'text-green-500 group-hover:text-green-300'}`} />
                <span className="flex-1">Input Data Lapangan</span>
                {isActive && <ChevronRight className="w-3 h-3 text-green-400" />}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Footer + Logout */}
      <div className="px-4 py-4 border-t border-green-900 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-green-400 hover:text-white hover:bg-green-900 rounded-lg text-xs font-medium transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar dari Sistem
        </button>
        <p className="text-xs text-green-700 text-center">Kementerian Kelautan & Perikanan RI</p>
        <p className="text-xs text-green-800 text-center">ID-MAP v1.0 · Hackathon 2025</p>
      </div>
    </aside>
  );
}
