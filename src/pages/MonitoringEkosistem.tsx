import { useState, useEffect } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';
import { Leaf, TreePine, Sprout, Activity, ChevronDown } from 'lucide-react';
import { mangroveLocations as seedLocations, ekosistemData } from '../data/seedData';
import { fetchAllLocations } from '../data/locations';
import type { MangroveLocation } from '../types';
import StatusBadge from '../components/shared/StatusBadge';
import KPICard from '../components/shared/KPICard';

const SPECIES_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

export default function MonitoringEkosistem() {
  const [selectedId, setSelectedId] = useState('LOC-001');
  const [mangroveLocations, setMangroveLocations] = useState<MangroveLocation[]>(seedLocations);

  useEffect(() => {
    void fetchAllLocations().then(setMangroveLocations);
  }, []);

  const selectedLoc = mangroveLocations.find(l => l.id === selectedId) ?? mangroveLocations[0];
  const selectedEco = ekosistemData.find(e => e.locationId === selectedId) ?? ekosistemData[0];
  const healthScore = selectedEco.skorKesehatan;

  const radarData = [
    { subject: 'Tutupan Tajuk', value: selectedEco.tutupanTajuk, fullMark: 100 },
    { subject: 'Kerapatan', value: Math.min((selectedEco.kerapatanPohon / 2500) * 100, 100), fullMark: 100 },
    { subject: 'Regenerasi', value: selectedEco.lajuRegenerasi === 'tinggi' ? 90 : selectedEco.lajuRegenerasi === 'sedang' ? 55 : 20, fullMark: 100 },
    { subject: 'Skor Kesehatan', value: selectedEco.skorKesehatan, fullMark: 100 },
    { subject: 'Keanekaragaman', value: selectedEco.komposisiJenis.length * 22, fullMark: 100 },
  ];

  const allHealthData = ekosistemData.map(e => {
    const loc = mangroveLocations.find(l => l.id === e.locationId)!;
    return {
      name: loc.name.split(' ').slice(0, 2).join(' '),
      skor: e.skorKesehatan,
      tutupan: e.tutupanTajuk,
      status: loc.status,
    };
  });

  return (
    <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Skor Kesehatan"
              value={`${healthScore}`}
              unit="/ 100"
              icon={<Activity className="w-6 h-6 text-blue-600" />}
              colorClass={healthScore >= 75 ? 'text-green-700' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'}
              bgClass={healthScore >= 75 ? 'bg-green-100' : healthScore >= 50 ? 'bg-yellow-100' : 'bg-red-100'}
            />
            <KPICard
              label="Tutupan Tajuk"
              value={`${selectedEco.tutupanTajuk}`}
              unit="%"
              icon={<Leaf className="w-6 h-6 text-green-600" />}
              colorClass="text-green-700"
              bgClass="bg-green-100"
            />
            <KPICard
              label="Kerapatan Pohon"
              value={selectedEco.kerapatanPohon.toLocaleString('id-ID')}
              unit="pohon/ha"
              icon={<TreePine className="w-6 h-6 text-teal-600" />}
              colorClass="text-teal-700"
              bgClass="bg-teal-100"
            />
            <KPICard
              label="Jumlah Spesies"
              value={`${selectedEco.komposisiJenis.length}`}
              unit="spesies"
              icon={<Sprout className="w-6 h-6 text-emerald-600" />}
              colorClass="text-emerald-700"
              bgClass="bg-emerald-100"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Selector + Radar */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Pilih Lokasi</label>
                <div className="relative">
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 appearance-none focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 pr-8"
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                  >
                    {mangroveLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Profil Lokasi</h3>
                  <StatusBadge status={selectedLoc.status} />
                </div>
                <p className="text-xs text-gray-500">{selectedLoc.district}, {selectedLoc.province}</p>
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Radar dataKey="value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Skor Kesehatan Keseluruhan</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      healthScore >= 75 ? 'bg-green-500' : healthScore >= 50 ? 'bg-yellow-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">0</span>
                  <span className={`text-xs font-bold ${healthScore >= 75 ? 'text-green-600' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{healthScore}/100</span>
                  <span className="text-xs text-gray-400">100</span>
                </div>
              </div>
            </div>

            {/* Komposisi Spesies */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-1">Komposisi Jenis Mangrove</h3>
              <p className="text-xs text-gray-500 mb-4">{selectedLoc.name}</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={selectedEco.komposisiJenis} dataKey="persentase" nameKey="spesies" cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
                    {selectedEco.komposisiJenis.map((_, i) => (
                      <Cell key={i} fill={SPECIES_COLORS[i % SPECIES_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} formatter={(val, name) => [`${val}%`, name]} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-2">
                {selectedEco.komposisiJenis.map((k, i) => (
                  <div key={k.spesies}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: SPECIES_COLORS[i % SPECIES_COLORS.length] }} />
                        <span className="text-xs text-gray-600 italic">{k.spesies}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{k.persentase}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${k.persentase}%`, background: SPECIES_COLORS[i % SPECIES_COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Spesies Dominan</p>
                  <p className="text-sm font-semibold text-green-800 italic mt-0.5">{selectedEco.komposisiJenis[0].spesies.split(' ')[0]}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Laju Regenerasi</p>
                  <StatusBadge status={selectedEco.lajuRegenerasi} size="md" />
                </div>
              </div>
            </div>

            {/* Perbandingan Tutupan */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-1">Perbandingan Tutupan Tajuk</h3>
              <p className="text-xs text-gray-500 mb-4">Semua lokasi pemantauan (%)</p>
              <ResponsiveContainer width="100%" height={310}>
                <BarChart data={allHealthData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} formatter={v => [`${v}%`, 'Tutupan Tajuk']} />
                  <Bar dataKey="tutupan" radius={[0, 6, 6, 0]}>
                    {allHealthData.map((entry, i) => (
                      <Cell key={i} fill={entry.status === 'lebat' ? '#16a34a' : entry.status === 'sedang' ? '#eab308' : entry.status === 'jarang' ? '#f97316' : '#ef4444'} opacity={entry.name === allHealthData.find(d => d.skor === selectedEco.skorKesehatan)?.name ? 1 : 0.7} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detail Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Tabel Kondisi Ekosistem — Semua Lokasi</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 text-left font-semibold">Lokasi</th>
                    <th className="px-4 py-3 text-center font-semibold">Tutupan (%)</th>
                    <th className="px-4 py-3 text-center font-semibold">Kerapatan (pohon/ha)</th>
                    <th className="px-4 py-3 text-center font-semibold">Spesies</th>
                    <th className="px-4 py-3 text-center font-semibold">Regenerasi</th>
                    <th className="px-4 py-3 text-center font-semibold">Skor</th>
                    <th className="px-4 py-3 text-center font-semibold">Tahun Survey</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ekosistemData.map(eco => {
                    const loc = mangroveLocations.find(l => l.id === eco.locationId)!;
                    return (
                      <tr key={eco.locationId} className={`hover:bg-green-50/30 cursor-pointer transition-colors ${eco.locationId === selectedId ? 'bg-green-50' : ''}`} onClick={() => setSelectedId(eco.locationId)}>
                        <td className="px-5 py-3 font-medium text-gray-800">{loc.name}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 bg-gray-100 rounded-full h-2">
                              <div className="h-2 rounded-full" style={{ width: `${eco.tutupanTajuk}%`, background: eco.tutupanTajuk >= 70 ? '#16a34a' : eco.tutupanTajuk >= 50 ? '#eab308' : '#ef4444' }} />
                            </div>
                            <span className="text-xs font-medium">{eco.tutupanTajuk}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">{eco.kerapatanPohon.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{eco.komposisiJenis.length} spesies</td>
                        <td className="px-4 py-3 text-center"><StatusBadge status={eco.lajuRegenerasi} /></td>
                        <td className="px-4 py-3 text-center"><span className={`font-bold ${eco.skorKesehatan >= 75 ? 'text-green-600' : eco.skorKesehatan >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{eco.skorKesehatan}</span></td>
                        <td className="px-4 py-3 text-center text-gray-500">{eco.tahun}</td>
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
