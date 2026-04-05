import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface KPICardProps {
  label: string;
  value: string;
  unit: string;
  trend?: number;
  icon: ReactNode;
  colorClass: string;
  bgClass: string;
}

export default function KPICard({ label, value, unit, trend, icon, colorClass, bgClass }: KPICardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
            <span className="text-sm text-gray-400">{unit}</span>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(trend)}% vs tahun lalu</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${bgClass} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
