import { useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import { Waves, Thermometer, Droplets, FlaskConical, ChevronDown } from 'lucide-react';
import { mangroveLocations, lingkunganData } from '../data/mockData';
import KPICard from '../components/shared/KPICard';
import StatusBadge from '../components/shared/StatusBadge';

const OPTIMAL_RANGES = {
  salinitas: { min: 10, max: 35, unit: 'ppt', label: 'Salinitas' },
  ph: { min: 6.5, max: 8.0, unit: '', label: 'pH' },
  suhu: { min: 20, max: 30, unit: '°C', label: 'Suhu' },
  kekeruhan: { min: 0, max: 30, unit: 'NTU', label: 'Kekeruhan' },
};

function getStatus(param: keyof typeof OPTIMAL_RANGES, value: number) {
  const range = OPTIMAL_RANGES[param];
  if (value >= range.min && value <= range.max) return 'optimal';
  if (value < range.min * 0.8 || value > range.max * 1.2) return 'kritis';
  return 'peringatan';
}

const STATUS_BG: Record<string, string> = {
  optimal: 'text-green-700 bg-green-100',
  peringatan: 'text-yellow-700 bg-yellow-100',
  kritis: 'text-red-700 bg-red-100',
};

export default function AnalisisLingkungan() {
  const [selectedId, setSelectedId] = useState('LOC-001');

  const loc = mangroveLocations.find(l => l.id === selectedId)!;
  const env = lingkunganData.find(e => e.locationId === selectedId)!;

  const avgSalinitas = Math.round(lingkunganData.reduce((s, e) => s + e.salinitas, 0) / lingkunganData.length * 10) / 10;
  const avgPh = Math.round(lingkunganData.reduce((s, e) => s + e.ph, 0) / lingkunganData.length * 10) / 10;
  const avgSuhu = Math.round(lingkunganData.reduce((s, e) => s + e.suhu, 0) / lingkunganData.length * 10) / 10;
  const avgKekeruhan = Math.round(lingkunganData.reduce((s, e) => s + e.kekeruhan, 0) / lingkunganData.length * 10) / 10;

  const scatterData = lingkunganData.map(e => {
    const l = mangroveLocations.find(m => m.id === e.locationId)!;
    return {
      salinitas: e.salinitas,
      kekeruhan: e.kekeruhan,
      name: l.name,
      status: l.status,
    };
  });

  const barData = lingkunganData.map(e => {
    const l = mangroveLocations.find(m => m.id === e.locationId)!;
    return {
      name: l.name.split(' ').slice(0, 2).join(' '),
      Salinitas: e.salinitas,
      Kekeruhan: e.kekeruhan,
      Suhu: e.suhu,
    };
  });

  const radarData = [
    {
      subject: 'Salinitas',
      value: Math.min((env.salinitas / 35) * 100, 100),
      optimal: 80,
    },
    {
      subject: 'pH Normal',
      value: Math.max(0, 100 - Math.abs(env.ph - 7.2) * 40),
      optimal: 80,
    },
    {
      subject: 'Suhu Ideal',
      value: Math.max(0, 100 - Math.abs(env.suhu - 27) * 8),
      optimal: 80,
    },
    {
      subject: 'Kejernihan',
      value: Math.max(0, 100 - env.kekeruhan * 1.8),
      optimal: 80,
    },
    {
      subject: 'Pasut Optimal',
      value: (env.pasangSurut.max > 1.5 && env.pasangSurut.max < 3.5) ? 85 : 50,
      optimal: 80,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Rata-rata Salinitas"
          value={`${avgSalinitas}`}
          unit="ppt"
          icon={<Droplets className="w-6 h-6 text-blue-600" />}
          colorClass="text-blue-700"
          bgClass="bg-blue-100"
        />
        <KPICard
          label="Rata-rata pH"
          value={`${avgPh}`}
          unit=""
          icon={<FlaskConical className="w-6 h-6 text-purple-600" />}
          colorClass="text-purple-700"
          bgClass="bg-purple-100"
        />
        <KPICard
          label="Rata-rata Suhu"
          value={`${avgSuhu}`}
          unit="°C"
          icon={<Thermometer className="w-6 h-6 text-orange-600" />}
          colorClass="text-orange-700"
          bgClass="bg-orange-100"
        />
        <KPICard
          label="Rata-rata Kekeruhan"
          value={`${avgKekeruhan}`}
          unit="NTU"
          icon={<Waves className="w-6 h-6 text-teal-600" />}
          colorClass={avgKekeruhan > 30 ? 'text-red-700' : 'text-teal-700'}
          bgClass={avgKekeruhan > 30 ? 'bg-red-100' : 'bg-teal-100'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Selector + Detail */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-2">Pilih Lokasi</label>
            <div className="relative">
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 appearance-none focus:outline-none focus:border-green-400 pr-8"
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
              >
                {mangroveLocations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mb-3">{loc.name}</h3>

          {/* Parameter Cards */}
          <div className="space-y-3">
            {(Object.entries(OPTIMAL_RANGES) as [keyof typeof OPTIMAL_RANGES, typeof OPTIMAL_RANGES[keyof typeof OPTIMAL_RANGES]][]).map(([key, range]) => {
              const value = env[key as keyof typeof env] as number;
              const status = getStatus(key, value);
              return (
                <div key={key} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-700">{range.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BG[status]}`}>
                      {status === 'optimal' ? 'Optimal' : status === 'peringatan' ? 'Peringatan' : 'Kritis'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-800">{value}</span>
                    <span className="text-xs text-gray-400">{range.unit}</span>
                    <span className="text-xs text-gray-400 ml-1">
                      (optimal: {range.min}–{range.max})
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === 'optimal' ? 'bg-green-500' : status === 'peringatan' ? 'bg-yellow-400' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((value / (range.max * 1.2)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Substrat & Pasang Surut */}
            <div className="border border-gray-100 rounded-xl p-3">
              <span className="text-xs font-medium text-gray-700">Jenis Substrat</span>
              <div className="mt-1">
                <StatusBadge status={env.substrat} size="md" />
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-3">
              <span className="text-xs font-medium text-gray-700">Pasang Surut</span>
              <p className="text-sm font-bold text-gray-800 mt-1">
                {env.pasangSurut.min}m – {env.pasangSurut.max}m
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Amplitudo: {(env.pasangSurut.max - env.pasangSurut.min).toFixed(1)}m</p>
            </div>
          </div>
        </div>

        {/* Radar Kesesuaian */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-1">Profil Kesesuaian Lingkungan</h3>
          <p className="text-xs text-gray-500 mb-4">{loc.name} — parameter vs kondisi optimal</p>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Radar
                name="Kondisi Aktual"
                dataKey="value"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Ambang Optimal"
                dataKey="optimal"
                stroke="#16a34a"
                fill="transparent"
                strokeWidth={1.5}
                strokeDasharray="5 3"
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </RadarChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Koordinat Lokasi</p>
              <p className="text-sm font-semibold text-blue-800 mt-0.5">
                {loc.lat.toFixed(4)}° {loc.lat >= 0 ? 'LU' : 'LS'}, {loc.lng.toFixed(4)}° BT
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Tanggal Pengukuran</p>
              <p className="text-sm font-semibold text-green-800 mt-0.5">{env.tanggal}</p>
            </div>
          </div>
        </div>

        {/* Scatter Plot */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-1">Korelasi Salinitas vs Kekeruhan</h3>
          <p className="text-xs text-gray-500 mb-4">Semua lokasi pemantauan</p>
          <ResponsiveContainer width="100%" height={230}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="salinitas" name="Salinitas" unit=" ppt" tick={{ fontSize: 11 }} />
              <YAxis dataKey="kekeruhan" name="Kekeruhan" unit=" NTU" tick={{ fontSize: 11 }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                formatter={(val, name) => [val, name]}
              />
              <Scatter
                data={scatterData}
                fill="#16a34a"
                opacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Kekeruhan tinggi umumnya berasosiasi dengan tekanan antropogenik
          </p>
        </div>
      </div>

      {/* Comparison Bar Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-1">Perbandingan Parameter Kualitas Perairan</h3>
        <p className="text-xs text-gray-500 mb-4">Salinitas (ppt), Kekeruhan (NTU), Suhu (°C) — semua lokasi</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} margin={{ left: 10, right: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="Salinitas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Kekeruhan" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Suhu" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
