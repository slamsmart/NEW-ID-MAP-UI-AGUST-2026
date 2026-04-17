import { useState } from 'react';
import {
  ClipboardCheck, Search, Filter, Check, X,
  AlertCircle, Eye, FileText, Camera, Navigation, ExternalLink,
  Leaf, Trees, Turtle, AlertTriangle, Sprout, RefreshCw,
} from 'lucide-react';
import { getSurveys, verifySurvey, getVerificationStats } from '../data/localStore';
import { useAuth } from '../context/useAuth';

type FilterStatus = 'semua' | 'pending' | 'approved' | 'rejected';
type FilterTujuan = 'semua' | 'monitoring' | 'potensi_penanaman' | 'abrasi' | 'vegetasi_mangrove' | 'pendaratan_penyu';

const TUJUAN_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  monitoring: { label: 'Monitoring Mangrove', icon: Leaf, color: 'text-green-700' },
  potensi_penanaman: { label: 'Potensi Penanaman', icon: Sprout, color: 'text-blue-700' },
  abrasi: { label: 'Titik Rawan Abrasi', icon: AlertTriangle, color: 'text-orange-700' },
  vegetasi_mangrove: { label: 'Vegetasi Mangrove', icon: Trees, color: 'text-emerald-700' },
  pendaratan_penyu: { label: 'Pendaratan Penyu', icon: Turtle, color: 'text-teal-700' },
};

const STATUS_CONFIG = {
  pending: { label: 'Menunggu', bg: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  approved: { label: 'Disetujui', bg: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-500' },
  rejected: { label: 'Ditolak', bg: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
};

function buildMultiPointMapsUrl(points: Array<{ lat: string; lng: string }>): string | null {
  const valid = points.filter(p => p.lat && p.lng);
  if (valid.length === 0) return null;
  if (valid.length === 1) return `https://www.google.com/maps?q=${valid[0].lat},${valid[0].lng}`;

  const origin = `${valid[0].lat},${valid[0].lng}`;
  const destination = `${valid[valid.length - 1].lat},${valid[valid.length - 1].lng}`;
  const waypoints = valid.slice(1, -1).map(p => `${p.lat},${p.lng}`).join('|');
  const waypointParam = waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : '';
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypointParam}`;
}

export default function VerifikasiData() {
  const { user } = useAuth();
  const isVerifikator = user?.role === 'verifikator';

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('semua');
  const [filterTujuan, setFilterTujuan] = useState<FilterTujuan>('semua');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [verifyId, setVerifyId] = useState<string | null>(null);
  const [verifyNote, setVerifyNote] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);
  void refreshKey;

  const surveys = (() => {
    const all = getSurveys();
    let filtered = [...all];
    if (filterStatus !== 'semua') filtered = filtered.filter(s => s.verificationStatus === filterStatus);
    if (filterTujuan !== 'semua') filtered = filtered.filter(s => s.tujuanSurvei === filterTujuan);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        (s.locationName || '').toLowerCase().includes(q) ||
        s.namaPetugas.toLowerCase().includes(q) ||
        (s.unit || '').toLowerCase().includes(q) ||
        (s.province || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  })();

  const stats = getVerificationStats();

  const handleVerify = (id: string, status: 'approved' | 'rejected') => {
    if (!isVerifikator) return;
    verifySurvey(id, status, verifyNote, user?.nama ?? 'Verifikator');
    setVerifyId(null);
    setVerifyNote('');
    refresh();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Verifikasi Data</p>
            <p className="text-sm font-bold text-gray-800">Data Input Lapangan</p>
          </div>
        </div>
        <button onClick={refresh} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Data Survei</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-2xl font-bold text-amber-800">{stats.pending}</p>
          </div>
          <p className="text-xs text-amber-600">Menunggu Verifikasi</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
          </div>
          <p className="text-xs text-green-600">Disetujui</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
          </div>
          <p className="text-xs text-red-600">Ditolak</p>
        </div>
      </div>

      {/* Info Banner for Pending */}
      {stats.pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{stats.pending} data menunggu verifikasi</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Data yang masuk dari petugas lapangan perlu diverifikasi sebelum dapat digunakan untuk analisis dan laporan resmi.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari lokasi, petugas, atau unit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-700 outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700">
              <option value="semua">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
          <select value={filterTujuan} onChange={e => setFilterTujuan(e.target.value as FilterTujuan)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700">
            <option value="semua">Semua Tujuan</option>
            {Object.entries(TUJUAN_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">{surveys.length} data ditemukan</p>
          {filterStatus !== 'semua' || filterTujuan !== 'semua' || search ? (
            <button onClick={() => { setFilterStatus('semua'); setFilterTujuan('semua'); setSearch(''); }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium">Reset filter</button>
          ) : null}
        </div>
      </div>

      {/* Survey List */}
      <div className="space-y-3">
        {surveys.map(s => {
          const tujuanCfg = TUJUAN_CONFIG[s.tujuanSurvei ?? 'monitoring'];
          const Icon = tujuanCfg.icon;
          const statusCfg = STATUS_CONFIG[s.verificationStatus ?? 'pending'];
          const isExpanded = expandedId === s.id;
          const isVerifying = verifyId === s.id;

          return (
            <div key={s.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
              {/* Card Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tujuanCfg.color === 'text-green-700' ? 'bg-green-50' : tujuanCfg.color === 'text-blue-700' ? 'bg-blue-50' : tujuanCfg.color === 'text-orange-700' ? 'bg-orange-50' : tujuanCfg.color === 'text-teal-700' ? 'bg-teal-50' : 'bg-emerald-50'}`}>
                      <Icon className={`w-4 h-4 ${tujuanCfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-bold text-gray-800 truncate">{s.locationName}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusCfg.bg} flex items-center gap-1.5 flex-shrink-0`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          {tujuanCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span>Petugas: <strong className="text-gray-700">{s.namaPetugas}</strong></span>
                        <span>{s.unit}</span>
                        <span>{new Date(s.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {s.verificationStatus === 'rejected' && s.verificationNote && (
                        <p className="text-xs text-red-600 mt-1 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
                          <X className="w-3 h-3 inline mr-1" />{s.verificationNote}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {s.verificationStatus === 'pending' && (
                      <button onClick={() => { setVerifyId(s.id); setVerifyNote(''); }}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        <Check className="w-3.5 h-3.5" /> Verifikasi
                      </button>
                    )}
                    <button onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-3">
                  {/* Location & GPS */}
                  {s.koordinatLat && s.koordinatLng && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Navigation className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-mono">{s.koordinatLat}, {s.koordinatLng}</span>
                      </div>
                      <a href={`https://www.google.com/maps?q=${s.koordinatLat},${s.koordinatLng}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                        <ExternalLink className="w-3 h-3" /> Google Maps
                      </a>
                    </div>
                  )}

                  {/* Data fields based on type */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {s.substrat && (
                      <div className="bg-white border border-gray-200 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Substrat</p>
                        <p className="text-xs font-semibold text-gray-700 capitalize">{s.substrat}</p>
                      </div>
                    )}
                    {s.salinitas && (
                      <div className="bg-white border border-gray-200 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Salinitas</p>
                        <p className="text-xs font-semibold text-gray-700">{s.salinitas} ppt</p>
                      </div>
                    )}
                    {s.tutupanTajuk && (
                      <div className="bg-white border border-gray-200 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Tutupan Tajuk</p>
                        <p className="text-xs font-semibold text-gray-700">{s.tutupanTajuk}%</p>
                      </div>
                    )}
                    {s.spesiesDominan && (
                      <div className="bg-white border border-gray-200 rounded-lg p-2 col-span-2 sm:col-span-3">
                        <p className="text-xs text-gray-400">Spesies Dominan</p>
                        <p className="text-xs font-semibold text-gray-700 italic">{s.spesiesDominan}{s.spesiesLain ? ` + ${s.spesiesLain}` : ''}</p>
                      </div>
                    )}
                  </div>

                  {s.kondisiUmum && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Kondisi Umum</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{s.kondisiUmum}</p>
                    </div>
                  )}

                  {s.rekomendasiLapangan && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Rekomendasi Petugas</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{s.rekomendasiLapangan}</p>
                    </div>
                  )}

                  {s.ancamanUtama && s.ancamanUtama.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1.5">Ancaman</p>
                      <div className="flex flex-wrap gap-1">
                        {s.ancamanUtama.map((a, i) => (
                          <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.tujuanSurvei === 'pendaratan_penyu' && s.sarangPoints && s.sarangPoints.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-xs font-semibold text-gray-600">Titik Sarang Terinput</p>
                        {(() => {
                          const mapsUrl = buildMultiPointMapsUrl(s.sarangPoints);
                          return mapsUrl ? (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" /> Lihat semua titik di peta
                            </a>
                          ) : null;
                        })()}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {s.sarangPoints.map((point, idx) => (
                          <div key={`${s.id}-sarang-${idx}`} className="flex gap-3 border border-gray-100 rounded-lg p-2">
                            {point.fotoUrl ? (
                              <img src={point.fotoUrl} alt={`Titik sarang ${idx + 1}`} className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                            ) : (
                              <div className="w-14 h-14 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center flex-shrink-0">
                                <Camera className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Titik {idx + 1}</p>
                              {point.lat && point.lng ? (
                                <a
                                  href={`https://www.google.com/maps?q=${point.lat},${point.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-mono break-all"
                                >
                                  <Navigation className="w-3 h-3 flex-shrink-0" />
                                  <span>{point.lat}, {point.lng}</span>
                                </a>
                              ) : (
                                <p className="text-xs text-gray-400">Koordinat belum diisi</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">{point.waktu || 'Waktu tidak tersedia'}</p>
                              {point.catatan && <p className="text-xs text-gray-600 mt-1">{point.catatan}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.fotoDokumentasi && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                        <Camera className="w-3 h-3" /> Foto Dokumentasi
                      </p>
                      <img src={s.fotoDokumentasi} alt="Foto lapangan" className="w-full max-h-40 object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}

                  {/* Verification History */}
                  {s.verifiedAt && (
                    <div className={`border rounded-lg p-3 ${s.verificationStatus === 'approved' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                        {s.verificationStatus === 'approved' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-red-600" />}
                        Status Verifikasi: <span className={s.verificationStatus === 'approved' ? 'text-green-700' : 'text-red-700'}>{statusCfg.label}</span>
                      </p>
                      <p className="text-xs text-gray-500">Oleh: {s.verifiedBy} · {new Date(s.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      {s.verificationNote && <p className="text-xs text-gray-600 mt-1">Catatan: {s.verificationNote}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Verification Panel */}
              {isVerifying && s.verificationStatus === 'pending' && (
                <div className="border-t border-blue-200 bg-blue-50 p-4 space-y-3">
                  <p className="text-sm font-semibold text-blue-800">Verifikasi Data Survei</p>
                  <p className="text-xs text-blue-700">Periksa detail data di atas, kemudian pilih tindakan verifikasi:</p>
                  <textarea
                    value={verifyNote}
                    onChange={e => setVerifyNote(e.target.value)}
                    placeholder="Catatan verifikasi (opsional): jelaskan alasan jika menolak..."
                    rows={2}
                    className="w-full text-sm border border-blue-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => { setVerifyId(null); setVerifyNote(''); }}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                      Batal
                    </button>
                    <button onClick={() => handleVerify(s.id, 'rejected')}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors">
                      <X className="w-3.5 h-3.5" /> Tolak
                    </button>
                    <button onClick={() => handleVerify(s.id, 'approved')}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                      <Check className="w-3.5 h-3.5" /> Setujui
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {surveys.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">Tidak ada data survei</p>
            <p className="text-xs text-gray-400">Data yang diinput petugas lapangan akan muncul di sini untuk diverifikasi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
