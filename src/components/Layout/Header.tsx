import { useState, useEffect } from 'react';
import { Bell, Search, Database } from 'lucide-react';
import { alerts } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { getSurveyStats } from '../../data/localStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const ROLE_LABEL: Record<string, string> = {
  admin_nasional: 'Admin Nasional',
  petugas_daerah: 'Petugas Daerah',
  viewer: 'Viewer',
};

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const totalAlert = criticalCount + warningCount;

  const [surveyCount, setSurveyCount] = useState(0);

  useEffect(() => {
    const stats = getSurveyStats();
    setSurveyCount(stats.total);

    // Refresh when localStorage changes (cross-tab or same-tab writes)
    const handleStorage = () => {
      const s = getSurveyStats();
      setSurveyCount(s.total);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const initials = user?.initials ?? 'USR';
  const roleName = user?.role ? ROLE_LABEL[user.role] : 'Pengguna';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari lokasi..."
            className="pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 w-44 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
          />
        </div>

        {/* Data source badge — clarified: reference period, not current date */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600">
          <Database className="w-3.5 h-3.5 text-gray-500" />
          <span className="font-medium">GMW · PMN · KKP</span>
          <span
            className="bg-green-700 text-white rounded px-1.5 py-0.5 font-bold text-xs"
            title="Periode data referensi dari sumber GMW/PMN/KKP. Bukan tanggal sistem saat ini."
          >
            Ref. 2025
          </span>
        </div>

        {/* Survey realtime count */}
        {surveyCount > 0 && (
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-700 font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse inline-block" />
            {surveyCount} survei tercatat
          </div>
        )}

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          {totalAlert > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {totalAlert}
            </span>
          )}
        </button>

        {/* User from auth */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
          <div className="w-7 h-7 bg-green-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 max-w-32 truncate">{user?.nama ?? 'Pengguna'}</p>
            <p className="text-xs text-gray-400">{roleName}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
