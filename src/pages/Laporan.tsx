import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell,
} from 'recharts';
import {
  FileText, Download, TrendingUp, Target, CheckCircle, Scale,
  AlertTriangle, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { timeSeriesData, mangroveLocations, ekosistemData, tekananSosialData } from '../data/mockData';
import { kebijakanData } from '../data/kebijakan';
import StatusBadge from '../components/shared/StatusBadge';
import DataSourcesPanel from '../components/shared/DataSourcesPanel';

function handlePrint() {
  window.print();
}

export default function Laporan() {
  const [expandedKebijakan, setExpandedKebijakan] = useState<string | null>(null);
  const totalArea = mangroveLocations.reduce((s, l) => s + l.areaHa, 0);
  const avgHealth = Math.round(ekosistemData.reduce((s, e) => s + e.skorKesehatan, 0) / ekosistemData.length);
  const totalBibit = tekananSosialData.reduce((s, e) => s + e.stokBibit, 0);
  const kritisCount = mangroveLocations.filter(l => l.status === 'kritis').length;
  const lebatCount = mangroveLocations.filter(l => l.status === 'lebat').length;
  const amanCount = tekananSosialData.filter(e => e.statusTenurial === 'aman').length;

  const trendData = timeSeriesData.map(d => ({
    tahun: String(d.tahun),
    'Luas Mangrove (rb ha)': Math.round(d.luasMangrove / 1000),
    'Restorasi (ha)': d.luasRestorasi,
    '% Tutupan': d.persenTutupan,
  }));

  const restorasiData = timeSeriesData.map(d => ({
    tahun: String(d.tahun),
    target: Math.round(d.luasRestorasi * 1.15),
    realisasi: d.luasRestorasi,
  }));

  const rekomendasi = [
    {
      prioritas: 'SANGAT TINGGI',
      lokasi: 'Pantai Selatan Kalimantan & Pantai Timur Sumatera',
      tindakan: 'Intervensi restorasi darurat — tutupan < 30%, indeks ancaman > 9',
      target: 'Restorasi 500 ha dalam 6 bulan pertama',
      cls: 'border-red-200 bg-red-50',
      badgeCls: 'bg-red-100 text-red-800',
    },
    {
      prioritas: 'TINGGI',
      lokasi: 'Muara Sungai Mahakam & Teluk Palu',
      tindakan: 'Pengendalian sedimentasi dan pengurangan tekanan tambak ilegal',
      target: 'Rehabilitasi 300 ha, penyuluhan masyarakat 2 desa',
      cls: 'border-orange-200 bg-orange-50',
      badgeCls: 'bg-orange-100 text-orange-800',
    },
    {
      prioritas: 'SEDANG',
      lokasi: 'Segara Anakan Cilacap',
      tindakan: 'Percepatan proses legal tenurial lahan & penguatan kelembagaan lokal',
      target: 'Penyelesaian status tenurial Q2 2025',
      cls: 'border-yellow-200 bg-yellow-50',
      badgeCls: 'bg-yellow-100 text-yellow-800',
    },
    {
      prioritas: 'PEMANTAUAN',
      lokasi: 'TN Baluran, Teluk Bintuni, Raja Ampat',
      tindakan: 'Pertahankan kondisi eksisting, monitoring rutin 2x/tahun',
      target: 'Survey monitoring terjadwal Feb & Agustus 2025',
      cls: 'border-green-200 bg-green-50',
      badgeCls: 'bg-green-100 text-green-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-green-950 rounded-xl p-6 text-white border border-green-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-green-400">Laporan Komprehensif · ID-MAP</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Evaluasi Program Restorasi Mangrove Nasional</h2>
            <p className="text-green-400 text-sm">Periode: 2018 – Q1 2025 | Kementerian Kelautan dan Perikanan RI</p>
          </div>
          <button
            onClick={handlePrint}
            className="flex-shrink-0 flex items-center gap-2 bg-green-700 hover:bg-green-600 border border-green-600 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF + Kebijakan
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Total Area Dipantau', value: `${totalArea.toLocaleString('id-ID')} ha`, icon: Target },
            { label: 'Skor Kesehatan Rata-rata', value: `${avgHealth}/100`, icon: CheckCircle },
            { label: 'Total Stok Bibit', value: `${(totalBibit / 1000).toFixed(0)}K bibit`, icon: TrendingUp },
            { label: 'Lokasi Perlu Intervensi', value: `${kritisCount} lokasi`, icon: AlertTriangle },
          ].map(item => (
            <div key={item.label} className="bg-green-900 rounded-lg p-4 border border-green-800">
              <item.icon className="w-4 h-4 text-green-400 mb-2" />
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-xs text-green-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-1">Tren Luas Mangrove Nasional (2018–2024)</h3>
          <p className="text-xs text-gray-500 mb-4">Dalam ribuan hektar (×1000 ha)</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="tahun" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Area
                type="monotone"
                dataKey="Luas Mangrove (rb ha)"
                stroke="#16a34a"
                strokeWidth={2.5}
                fill="url(#greenGrad)"
                dot={{ fill: '#16a34a', r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-1">Target vs Realisasi Restorasi</h3>
          <p className="text-xs text-gray-500 mb-4">Dalam hektar (ha) per tahun</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={restorasiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="tahun" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realisasi" name="Realisasi" radius={[4, 4, 0, 0]}>
                {restorasiData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.realisasi >= entry.target * 0.9 ? '#16a34a' : '#f59e0b'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Persentase Tutupan Trend */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-1">Persentase Tutupan Mangrove Nasional</h3>
        <p className="text-xs text-gray-500 mb-4">Tren peningkatan tutupan 2018–2024</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="tahun" tick={{ fontSize: 12 }} />
            <YAxis domain={[45, 56]} tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
              formatter={v => [`${v}%`, 'Tutupan Mangrove']}
            />
            <Line
              type="monotone"
              dataKey="% Tutupan"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ fill: '#2563eb', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Ringkasan Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Status Seluruh Lokasi</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Tutupan Lebat', value: lebatCount, total: mangroveLocations.length, color: 'green' },
              { label: 'Tutupan Sedang', value: mangroveLocations.filter(l => l.status === 'sedang').length, total: mangroveLocations.length, color: 'yellow' },
              { label: 'Tutupan Jarang', value: mangroveLocations.filter(l => l.status === 'jarang').length, total: mangroveLocations.length, color: 'orange' },
              { label: 'Status Kritis', value: kritisCount, total: mangroveLocations.length, color: 'red' },
            ].map(item => (
              <div key={item.label} className={`bg-${item.color}-50 rounded-xl p-4 border border-${item.color}-100`}>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className={`text-2xl font-bold text-${item.color}-700 mt-1`}>{item.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">dari {item.total} lokasi</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full bg-${item.color}-500`}
                    style={{ width: `${(item.value / item.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs text-gray-500">Tenurial Aman</p>
              <p className="text-xl font-bold text-blue-700">{amanCount}/{mangroveLocations.length}</p>
              <p className="text-xs text-gray-400">lokasi</p>
            </div>
            <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
              <p className="text-xs text-gray-500">Kawasan Konservasi</p>
              <p className="text-xl font-bold text-teal-700">
                {mangroveLocations.filter(l => l.kawasan === 'konservasi').length}/{mangroveLocations.length}
              </p>
              <p className="text-xs text-gray-400">lokasi</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Rekomendasi Tindakan Prioritas</h3>
          <div className="space-y-3">
            {rekomendasi.map((r, i) => (
              <div key={i} className={`border rounded-xl p-3 ${r.cls}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${r.badgeCls}`}>
                    {r.prioritas}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-800 mb-0.5">{r.lokasi}</p>
                <p className="text-xs text-gray-600 mb-1">{r.tindakan}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {r.target}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table Lengkap */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Rekap Data Komprehensif Semua Lokasi</h3>
            <p className="text-xs text-gray-500 mt-0.5">Integrasi data spasial, ekosistem, lingkungan, dan sosial-ekonomi</p>
          </div>
          <button className="flex items-center gap-2 text-sm text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 rounded-lg px-3 py-1.5 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3 text-left font-semibold">Lokasi</th>
                <th className="px-3 py-3 text-center font-semibold">Status</th>
                <th className="px-3 py-3 text-center font-semibold">Luas (ha)</th>
                <th className="px-3 py-3 text-center font-semibold">Skor</th>
                <th className="px-3 py-3 text-center font-semibold">Tutupan</th>
                <th className="px-3 py-3 text-center font-semibold">Ancaman</th>
                <th className="px-3 py-3 text-center font-semibold">Tenurial</th>
                <th className="px-3 py-3 text-center font-semibold">Prioritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mangroveLocations.map(loc => {
                const eco = ekosistemData.find(e => e.locationId === loc.id)!;
                const sos = tekananSosialData.find(e => e.locationId === loc.id)!;
                const priority = eco.skorKesehatan < 40 ? 'critical' : eco.skorKesehatan < 65 ? 'warning' : 'info';
                return (
                  <tr key={loc.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{loc.name}</td>
                    <td className="px-3 py-3 text-center"><StatusBadge status={loc.status} /></td>
                    <td className="px-3 py-3 text-center text-gray-700">{loc.areaHa.toLocaleString()}</td>
                    <td className="px-3 py-3 text-center font-bold text-sm">
                      <span className={
                        eco.skorKesehatan >= 75 ? 'text-green-600'
                        : eco.skorKesehatan >= 50 ? 'text-yellow-600'
                        : 'text-red-500'
                      }>{eco.skorKesehatan}</span>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-700">{eco.tutupanTajuk}%</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`font-semibold ${
                        sos.indeksAncaman >= 7 ? 'text-red-600' : sos.indeksAncaman >= 4 ? 'text-yellow-600' : 'text-green-600'
                      }`}>{sos.indeksAncaman}</span>
                    </td>
                    <td className="px-3 py-3 text-center"><StatusBadge status={sos.statusTenurial} /></td>
                    <td className="px-3 py-3 text-center"><StatusBadge status={priority} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== REKOMENDASI KEBIJAKAN PER LOKASI ===== */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-green-700" />
            <div>
              <h3 className="font-bold text-gray-900">Rekomendasi Kebijakan per Lokasi</h3>
              <p className="text-xs text-gray-500 mt-0.5">Klik lokasi untuk detail rekomendasi jangka pendek, menengah, panjang + dasar hukum</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-sm text-white bg-green-700 hover:bg-green-800 rounded-lg px-3 py-1.5 transition-colors font-semibold"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {kebijakanData
            .sort((a, b) => a.prioritas - b.prioritas)
            .map(keb => {
              const loc = mangroveLocations.find(l => l.id === keb.locationId)!;
              const eco = ekosistemData.find(e => e.locationId === keb.locationId)!;
              const isOpen = expandedKebijakan === keb.locationId;
              return (
                <div key={keb.locationId}>
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                    onClick={() => setExpandedKebijakan(isOpen ? null : keb.locationId)}
                  >
                    {/* Priority Badge */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0 ${
                      keb.statusRisiko === 'kritis' ? 'bg-red-600' :
                      keb.statusRisiko === 'perhatian' ? 'bg-amber-500' : 'bg-green-600'
                    }`}>{keb.prioritas}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{loc.name}</span>
                        <StatusBadge status={loc.status} />
                        <StatusBadge status={keb.statusRisiko === 'kritis' ? 'critical' : keb.statusRisiko === 'perhatian' ? 'warning' : 'info'} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{keb.ringkasan}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-500">
                      <span>{loc.areaHa.toLocaleString()} ha</span>
                      <span className="font-semibold text-gray-700">{keb.estimasiAnggaran.split('(')[0]}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100">
                      {/* Ringkasan */}
                      <div className={`rounded-lg p-3 mb-4 mt-4 text-sm border ${
                        keb.statusRisiko === 'kritis' ? 'bg-red-50 border-red-200 text-red-900' :
                        keb.statusRisiko === 'perhatian' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                        'bg-green-50 border-green-200 text-green-900'
                      }`}>
                        <AlertTriangle className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                        {keb.ringkasan}
                      </div>

                      {/* 3 Horizons */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
                        {[
                          { title: 'Jangka Pendek (0–6 bln)', items: keb.rekomendasiPendek, color: 'border-red-300', hdr: 'bg-red-600', icon: '⚡' },
                          { title: 'Jangka Menengah (6–24 bln)', items: keb.rekomendasiMenengah, color: 'border-amber-300', hdr: 'bg-amber-500', icon: '📅' },
                          { title: 'Jangka Panjang (> 24 bln)', items: keb.rekomendasiPanjang, color: 'border-blue-300', hdr: 'bg-blue-600', icon: '🎯' },
                        ].map(h => (
                          <div key={h.title} className={`border rounded-lg overflow-hidden ${h.color}`}>
                            <div className={`${h.hdr} px-3 py-2`}>
                              <p className="text-xs font-bold text-white">{h.icon} {h.title}</p>
                            </div>
                            <ul className="p-3 space-y-1.5">
                              {h.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                                  <span className="text-gray-400 font-bold flex-shrink-0">{i+1}.</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Metadata bawah */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <p className="text-xs font-bold text-gray-700 mb-2">📋 Dasar Hukum</p>
                          <ul className="space-y-1">
                            {keb.dasarHukum.map(d => (
                              <li key={d.nomor} className="text-xs text-gray-600">
                                <span className="font-semibold text-gray-800">{d.nomor}</span>
                                <span className="text-gray-500"> — {d.keterangan}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <p className="text-xs font-bold text-gray-700 mb-1">🎯 Target Capaian</p>
                            <p className="text-xs text-gray-600">{keb.targetCapaian}</p>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <p className="text-xs font-bold text-gray-700 mb-1">🏛️ Instansi Penanggung Jawab</p>
                            <div className="flex flex-wrap gap-1">
                              {keb.instansiPJ.map(inst => (
                                <span key={inst} className="text-xs bg-green-50 text-green-800 border border-green-200 rounded px-1.5 py-0.5">{inst}</span>
                              ))}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <p className="text-xs font-bold text-gray-700 mb-1">💰 Estimasi Anggaran</p>
                            <p className="text-xs text-gray-600">{keb.estimasiAnggaran}</p>
                          </div>
                        </div>
                      </div>

                      {keb.catatanKhusus && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                          <Clock className="w-3.5 h-3.5 inline mr-1" />
                          <strong>Catatan Khusus:</strong> {keb.catatanKhusus}
                        </div>
                      )}

                      {/* Skor Kesehatan Mini */}
                      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                        <span>Skor Kesehatan Ekosistem:</span>
                        <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${eco.skorKesehatan >= 75 ? 'bg-green-500' : eco.skorKesehatan >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                            style={{ width: `${eco.skorKesehatan}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-700">{eco.skorKesehatan}/100</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Data Sources Panel */}
      <DataSourcesPanel />
    </div>
  );
}
