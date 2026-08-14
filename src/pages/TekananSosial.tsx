import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ScatterChart, Scatter,
} from 'recharts';
import { AlertTriangle, Home, Fish, Sprout, ChevronDown, Shield } from 'lucide-react';
import { mangroveLocations, tekananSosialData, ekosistemData } from '../data/seedData';
import KPICard from '../components/shared/KPICard';
import StatusBadge from '../components/shared/StatusBadge';

export default function TekananSosial() {
  const [selectedId, setSelectedId] = useState('LOC-004');

  const loc = mangroveLocations.find(l => l.id === selectedId)!;
  const sos = tekananSosialData.find(e => e.locationId === selectedId)!;

  const avgAncaman = Math.round(tekananSosialData.reduce((s, e) => s + e.indeksAncaman, 0) / tekananSosialData.length * 10) / 10;
  const totalBibit = tekananSosialData.reduce((s, e) => s + e.stokBibit, 0);
  const bersengketa = tekananSosialData.filter(e => e.statusTenurial === 'bersengketa').length;
  const totalTambak = tekananSosialData.reduce((s, e) => s + e.luasTambak, 0);

  const barData = tekananSosialData.map(e => {
    const l = mangroveLocations.find(m => m.id === e.locationId)!;
    return {
      name: l.name.split(' ').slice(0, 2).join(' '),
      ancaman: e.indeksAncaman,
      tambak: e.luasTambak,
      status: l.status,
      tenurial: e.statusTenurial,
    };
  });

  const scatterData = tekananSosialData.map(e => {
    const eco = ekosistemData.find(m => m.locationId === e.locationId)!;
    return {
      ancaman: e.indeksAncaman,
      skor: eco.skorKesehatan,
      bibit: e.stokBibit,
      name: mangroveLocations.find(l => l.id === e.locationId)?.name,
    };
  });

  const riskLevel = (score: number) => {
    if (score >= 7) return { label: 'Risiko Tinggi', cls: 'bg-red-100 text-red-800 border-red-200' };
    if (score >= 4) return { label: 'Risiko Sedang', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { label: 'Risiko Rendah', cls: 'bg-green-100 text-green-800 border-green-200' };
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Rata-rata Indeks Ancaman"
          value={`${avgAncaman}`}
          unit="/ 10"
          icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
          colorClass={avgAncaman >= 5 ? 'text-red-700' : 'text-yellow-700'}
          bgClass={avgAncaman >= 5 ? 'bg-red-100' : 'bg-yellow-100'}
        />
        <KPICard
          label="Total Stok Bibit"
          value={(totalBibit / 1000).toFixed(0)}
          unit="ribu bibit"
          icon={<Sprout className="w-6 h-6 text-green-600" />}
          colorClass="text-green-700"
          bgClass="bg-green-100"
        />
        <KPICard
          label="Legalitas dan Sengketa Kawasan"
          value={`${bersengketa}`}
          unit="lokasi"
          icon={<Shield className="w-6 h-6 text-orange-500" />}
          colorClass="text-orange-700"
          bgClass="bg-orange-100"
        />
        <KPICard
          label="Total Luas Tambak"
          value={totalTambak.toLocaleString('id-ID')}
          unit="ha"
          icon={<Fish className="w-6 h-6 text-blue-500" />}
          colorClass="text-blue-700"
          bgClass="bg-blue-100"
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

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">{loc.name}</h3>
              <StatusBadge status={loc.status} />
            </div>
          </div>

          {/* Risk Meter */}
          <div className="border border-gray-100 rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Indeks Ancaman</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${riskLevel(sos.indeksAncaman).cls}`}>
                {riskLevel(sos.indeksAncaman).label}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className={`text-3xl font-black ${
                sos.indeksAncaman >= 7 ? 'text-red-600' : sos.indeksAncaman >= 4 ? 'text-yellow-600' : 'text-green-600'
              }`}>{sos.indeksAncaman}</span>
              <span className="text-sm text-gray-400">/ 10</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${
                  sos.indeksAncaman >= 7 ? 'bg-red-500' : sos.indeksAncaman >= 4 ? 'bg-yellow-400' : 'bg-green-500'
                }`}
                style={{ width: `${sos.indeksAncaman * 10}%` }}
              />
            </div>
          </div>

          {/* Detail Items */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Home className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Jarak Pemukiman</p>
                <p className="text-sm font-semibold text-gray-800">{sos.jarakPemukiman} km</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Fish className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Luas Tambak Sekitar</p>
                <p className={`text-sm font-semibold ${sos.luasTambak > 200 ? 'text-red-600' : 'text-gray-800'}`}>
                  {sos.luasTambak > 0 ? `${sos.luasTambak.toLocaleString()} ha` : 'Tidak Ada'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Shield className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Status Tenurial</p>
                <StatusBadge status={sos.statusTenurial} size="md" />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Sprout className="w-4 h-4 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Nursery Terdekat</p>
                <p className="text-sm font-semibold text-gray-800">{sos.nurseryTerdekat}</p>
              </div>
            </div>

            <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-xs text-gray-500">Stok Bibit Tersedia</p>
              <p className="text-lg font-bold text-green-700">{sos.stokBibit.toLocaleString()} bibit</p>
              <div className="w-full bg-green-100 rounded-full h-2 mt-1.5">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${Math.min((sos.stokBibit / 80000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Indeks Ancaman Bar Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-1">Indeks Ancaman Antropogenik</h3>
          <p className="text-xs text-gray-500 mb-4">Perbandingan semua lokasi (skala 0–10)</p>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={85} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                formatter={v => [v, 'Indeks Ancaman']}
              />
              <Bar dataKey="ancaman" radius={[0, 6, 6, 0]} name="Indeks Ancaman">
                {barData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.ancaman >= 7 ? '#ef4444'
                      : entry.ancaman >= 4 ? '#f59e0b'
                      : '#22c55e'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter: Ancaman vs Kesehatan */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-1">Korelasi Ancaman vs Kesehatan Ekosistem</h3>
          <p className="text-xs text-gray-500 mb-4">Semakin tinggi ancaman, skor cenderung menurun</p>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="ancaman"
                name="Indeks Ancaman"
                tick={{ fontSize: 11 }}
                label={{ value: 'Indeks Ancaman', position: 'bottom', fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                dataKey="skor"
                name="Skor Kesehatan"
                tick={{ fontSize: 11 }}
                label={{ value: 'Skor Kesehatan', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
                        <p className="font-semibold text-gray-800">{d.name}</p>
                        <p className="text-gray-600">Ancaman: <strong>{d.ancaman}</strong></p>
                        <p className="text-gray-600">Skor: <strong>{d.skor}</strong></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={scatterData} fill="#ef4444" opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Rekapitulasi Tekanan Sosial-Ekonomi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3 text-left font-semibold">Lokasi</th>
                <th className="px-4 py-3 text-center font-semibold">Indeks Ancaman</th>
                <th className="px-4 py-3 text-center font-semibold">Jarak Pemukiman</th>
                <th className="px-4 py-3 text-center font-semibold">Luas Tambak</th>
                <th className="px-4 py-3 text-center font-semibold">Status Tenurial</th>
                <th className="px-4 py-3 text-center font-semibold">Nursery</th>
                <th className="px-4 py-3 text-center font-semibold">Stok Bibit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tekananSosialData.map(sos => {
                const l = mangroveLocations.find(m => m.id === sos.locationId)!;
                const risk = riskLevel(sos.indeksAncaman);
                return (
                  <tr
                    key={sos.locationId}
                    className={`hover:bg-green-50/30 cursor-pointer transition-colors ${
                      sos.locationId === selectedId ? 'bg-green-50' : ''
                    }`}
                    onClick={() => setSelectedId(sos.locationId)}
                  >
                    <td className="px-5 py-3 font-medium text-gray-800">{l.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold text-sm ${
                        sos.indeksAncaman >= 7 ? 'text-red-600' : sos.indeksAncaman >= 4 ? 'text-yellow-600' : 'text-green-600'
                      }`}>{sos.indeksAncaman}</span>
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full border font-medium ${risk.cls}`}>
                        {risk.label.split(' ')[1]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{sos.jarakPemukiman} km</td>
                    <td className="px-4 py-3 text-center">
                      <span className={sos.luasTambak > 200 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                        {sos.luasTambak > 0 ? `${sos.luasTambak.toLocaleString()} ha` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={sos.statusTenurial} />
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs">{sos.nurseryTerdekat}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{sos.stokBibit.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
