import { useEffect, useState, useMemo } from 'react';
import {
  Sprout, AlertTriangle, MapPin, Filter, ChevronDown, ChevronUp,
  Leaf, Droplets, Layers, Camera, ClipboardCheck, BarChart2, Info,
  TrendingUp, CheckCircle2, Clock, Search, FileDown, ExternalLink,
  Pencil, Check, X, Trash2,
} from 'lucide-react';
import {
  titikAbrasiData as abrasiDataImport, getPrioritasColor, getSkorColor,
  rekomendasiSpesiesBySubstrat, hitungSkorPotensi,
  type PrioritasLevel, type TitikAbrasi,
} from '../data/abrasiData';
import { fetchSurveys, updateSurveyRemote, removeSurvey, type SurveyRecord } from '../data/localStore';
import { useAuth } from '../context/useAuth';

// ─── Types ──────────────────────────────────────────────────────────────────

type TabId = 'abrasi' | 'potensi' | 'ringkasan';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatLuasan(min: number, max: number, satuan: string): string {
  if (min === max) return `${min.toLocaleString('id-ID')} ${satuan}`;
  return `${min.toLocaleString('id-ID')}–${max.toLocaleString('id-ID')} ha`;
}

function estimateAbrasiLuasan(panjangTerdampak?: string): { min: number; max: number; satuan: string } {
  const angka = Number.parseFloat(panjangTerdampak ?? '');
  if (Number.isNaN(angka) || angka <= 0) {
    return { min: 0, max: 0, satuan: 'ha' };
  }

  const estimasi = angka / 100;
  return {
    min: Math.max(1, Math.round(estimasi)),
    max: Math.max(1, Math.round(estimasi * 2)),
    satuan: 'ha',
  };
}

function mapSurveyAbrasiToRow(survey: SurveyRecord): TitikAbrasi | null {
  const hasAbrasiSignal = Boolean(
    survey.tingkatAbrasi || survey.prioritasAbrasi || survey.kondisiSesudah || survey.namaPantai
  );

  if (!hasAbrasiSignal) return null;

  const lat = Number.parseFloat(survey.koordinatLat ?? '');
  const lng = Number.parseFloat(survey.koordinatLng ?? '');
  const tingkatToSkor: Record<string, number> = {
    ringan: 3,
    sedang: 5,
    parah: 7,
    sangat_parah: 9,
  };
  const tingkatToIndikasi: Record<string, string> = {
    ringan: 'Abrasi ringan',
    sedang: 'Abrasi sedang',
    parah: 'Abrasi parah',
    sangat_parah: 'Abrasi sangat parah',
  };

  return {
    id: survey.id,
    namaPantai: survey.namaPantai || survey.locationName || 'Lokasi Survei',
    kecamatan: survey.locationName || '-',
    kabKota: survey.province || '-',
    provinsi: survey.province || '-',
    koordinat: {
      lat: Number.isNaN(lat) ? 0 : lat,
      lng: Number.isNaN(lng) ? 0 : lng,
    },
    googleMapsUrl: survey.googleMapsUrl ?? (Number.isNaN(lat) || Number.isNaN(lng) ? undefined : `https://www.google.com/maps?q=${lat},${lng}`),
    indikasi: survey.tingkatAbrasi ? tingkatToIndikasi[survey.tingkatAbrasi] ?? 'Abrasi teridentifikasi' : 'Abrasi teridentifikasi',
    kondisiSebelum: survey.kondisiSebelum || '-',
    kondisiSesudah: survey.kondisiSesudah || '-',
    tanamanRekomendasi: rekomendasiSpesiesBySubstrat(survey.substrat ?? 'campuran'),
    luasanRestorasi: estimateAbrasiLuasan(survey.panjangTerdampak),
    prioritas: (survey.prioritasAbrasi ?? 'Sedang') as PrioritasLevel,
    substrat: (survey.substrat as TitikAbrasi['substrat']) ?? 'campuran',
    ancamanUtama: survey.ancamanUtama ?? [],
    skorRisiko: tingkatToSkor[survey.tingkatAbrasi ?? 'sedang'] ?? 5,
  };
}

function SubstratBadge({ substrat }: { substrat: string }) {
  const map: Record<string, string> = {
    lumpur: 'bg-amber-100 text-amber-800 border-amber-200',
    campuran: 'bg-teal-100 text-teal-800 border-teal-200',
    pasir: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    berbatu: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  const labels: Record<string, string> = { lumpur: 'Lumpur', campuran: 'Campuran', pasir: 'Pasir', berbatu: 'Berbatu' };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${map[substrat] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {labels[substrat] ?? substrat}
    </span>
  );
}

function SkorBar({ skor, max = 10 }: { skor: number; max?: number }) {
  const pct = Math.min((skor / max) * 100, 100);
  const color = skor >= 8 ? 'bg-green-500' : skor >= 6 ? 'bg-yellow-400' : skor >= 4 ? 'bg-orange-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold w-6 text-right text-gray-700">{skor}</span>
    </div>
  );
}

function SurveyPotensiCard({ survey, isAdmin, onEdit, onDelete }: {
  survey: SurveyRecord;
  isAdmin: boolean;
  onEdit: (s: SurveyRecord) => void;
  onDelete: (id: string, nama: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const skor = survey.skorPotensi ?? hitungSkorPotensi(survey.substrat ?? '', survey.salinitas, survey.tutupanTajuk);
  const spesiesRek = rekomendasiSpesiesBySubstrat(survey.substrat ?? 'lumpur');

  const vStatus = survey.verificationStatus ?? 'pending';
  const vStyle = vStatus === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200'
    : vStatus === 'approved' ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';
  const vLabel = vStatus === 'pending' ? 'Menunggu'
    : vStatus === 'approved' ? 'Disetujui' : 'Ditolak';
  const vDot = vStatus === 'pending' ? 'bg-amber-500'
    : vStatus === 'approved' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-800 truncate">{survey.locationName}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full border ${getSkorColor(skor)}`}>
                Skor {skor}/10
              </span>
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${vStyle} flex-shrink-0`}>
                <span className={`w-1.5 h-1.5 rounded-full ${vDot}`} />{vLabel}
              </span>
            </div>
            <p className="text-xs text-gray-500">{survey.province} · {new Date(survey.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isAdmin && (
              <>
                <button onClick={() => onEdit(survey)} className="text-gray-400 hover:text-green-700 p-1 rounded hover:bg-green-50 transition-colors" title="Edit data">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(survey.id, survey.locationName)} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors" title="Hapus data">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button onClick={() => setExpanded(e => !e)} className="text-gray-400 hover:text-gray-600 p-1 transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Skor Potensi Penanaman</p>
          <SkorBar skor={skor} />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {survey.substrat && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <Layers className="w-3.5 h-3.5 text-amber-600 mx-auto mb-0.5" />
              <p className="text-xs text-gray-500">Substrat</p>
              <p className="text-xs font-semibold text-gray-700 capitalize">{survey.substrat}</p>
            </div>
          )}
          {survey.salinitas && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <Droplets className="w-3.5 h-3.5 text-blue-600 mx-auto mb-0.5" />
              <p className="text-xs text-gray-500">Salinitas</p>
              <p className="text-xs font-semibold text-gray-700">{survey.salinitas} ppt</p>
            </div>
          )}
          {survey.tutupanTajuk && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <Leaf className="w-3.5 h-3.5 text-green-600 mx-auto mb-0.5" />
              <p className="text-xs text-gray-500">Tutupan</p>
              <p className="text-xs font-semibold text-gray-700">{survey.tutupanTajuk}%</p>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-3 bg-green-50/30">
          {survey.spesiesDominan && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Spesies Dominan di Lapangan</p>
              <p className="text-xs text-gray-700 italic">{survey.spesiesDominan}</p>
              {survey.spesiesLain && <p className="text-xs text-gray-500 mt-0.5">+ {survey.spesiesLain}</p>}
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Rekomendasi Spesies Penanaman</p>
            <div className="flex flex-wrap gap-1.5">
              {spesiesRek.map((sp, i) => (
                <span key={i} className="text-xs bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full italic">
                  {sp}
                </span>
              ))}
            </div>
          </div>
          {survey.rekomendasiLapangan && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Rekomendasi Petugas</p>
              <p className="text-xs text-gray-700 leading-relaxed">{survey.rekomendasiLapangan}</p>
            </div>
          )}
          {survey.ancamanUtama && survey.ancamanUtama.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Ancaman Teridentifikasi</p>
              <div className="flex flex-wrap gap-1">
                {survey.ancamanUtama.map((a, i) => (
                  <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-100 px-1.5 py-0.5 rounded">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
          {survey.koordinatLat && survey.koordinatLng && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="font-mono">{survey.koordinatLat}, {survey.koordinatLng}</span>
              </div>
              <a
                href={survey.googleMapsUrl ?? `https://www.google.com/maps?q=${survey.koordinatLat},${survey.koordinatLng}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg"
              >
                <ExternalLink className="w-3 h-3" /> Buka Google Maps
              </a>
            </div>
          )}
          {survey.fotoDokumentasi && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Foto Lapangan</p>
              <img src={survey.fotoDokumentasi} alt="Dokumentasi lapangan" className="w-full max-h-48 object-cover rounded-lg border border-gray-200" />
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Camera className="w-3 h-3" />
            <span>Petugas: {survey.namaPetugas} · {survey.unit}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RekomendasiLokasi() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'verifikator' || user?.role === 'admin';
  const isAbrasiEditor = user?.role === 'verifikator';
  const [activeTab, setActiveTab] = useState<TabId>('abrasi');
  const [filterPrioritas, setFilterPrioritas] = useState<string>('semua');
  const [filterSubstrat, setFilterSubstrat] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAbrasi, setExpandedAbrasi] = useState<string | null>(null);
  const [showPdfPanel, setShowPdfPanel] = useState(false);
  const [abrasiData, setAbrasiData] = useState<TitikAbrasi[]>(() => [...abrasiDataImport]);
  const [editAbrasiId, setEditAbrasiId] = useState<string | null>(null);
  const [editAbrasiForm, setEditAbrasiForm] = useState<TitikAbrasi | null>(null);

  const startEditAbrasi = (row: TitikAbrasi) => {
    setEditAbrasiId(row.id);
    setEditAbrasiForm({ ...row, koordinat: { ...row.koordinat }, luasanRestorasi: { ...row.luasanRestorasi }, tanamanRekomendasi: [...row.tanamanRekomendasi], ancamanUtama: [...row.ancamanUtama] });
  };
  const cancelEditAbrasi = () => { setEditAbrasiId(null); setEditAbrasiForm(null); };
  const saveEditAbrasi = () => {
    if (!editAbrasiForm) return;
    if (editAbrasiForm.id.startsWith('ABR-')) {
      setAbrasiData(prev => prev.map(d => d.id === editAbrasiForm.id ? editAbrasiForm : d));
    } else {
      void updateSurveyRemote(editAbrasiForm.id, {
        namaPantai: editAbrasiForm.namaPantai,
        locationName: editAbrasiForm.kecamatan,
        province: editAbrasiForm.provinsi,
        googleMapsUrl: editAbrasiForm.googleMapsUrl || (
          editAbrasiForm.koordinat.lat && editAbrasiForm.koordinat.lng
            ? `https://www.google.com/maps?q=${editAbrasiForm.koordinat.lat},${editAbrasiForm.koordinat.lng}`
            : undefined
        ),
        tingkatAbrasi: editAbrasiForm.skorRisiko >= 9 ? 'sangat_parah'
          : editAbrasiForm.skorRisiko >= 7 ? 'parah'
          : editAbrasiForm.skorRisiko >= 5 ? 'sedang'
          : 'ringan',
        prioritasAbrasi: editAbrasiForm.prioritas === 'Tinggi'
          ? 'Tinggi'
          : editAbrasiForm.prioritas === 'Sedang'
            ? 'Sedang'
            : 'Rendah',
        kondisiSebelum: editAbrasiForm.kondisiSebelum,
        kondisiSesudah: editAbrasiForm.kondisiSesudah,
        substrat: editAbrasiForm.substrat,
        ancamanUtama: editAbrasiForm.ancamanUtama,
        koordinatLat: String(editAbrasiForm.koordinat.lat || ''),
        koordinatLng: String(editAbrasiForm.koordinat.lng || ''),
      });
      void refreshSurveys();
    }
    setEditAbrasiId(null);
    setEditAbrasiForm(null);
  };
  const deleteAbrasi = (id: string, namaPantai: string) => {
    if (!isAbrasiEditor) return;
    if (window.confirm(`Hapus data "${namaPantai}"?\n\nData yang dihapus tidak dapat dikembalikan.`)) {
      if (id.startsWith('ABR-')) {
        setAbrasiData(prev => prev.filter(d => d.id !== id));
      } else {
        void removeSurvey(id);
        void refreshSurveys();
      }
    }
  };

  // ── Surveys state (refreshable) ──
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [editSurvey, setEditSurvey] = useState<SurveyRecord | null>(null);
  const [editSurveyForm, setEditSurveyForm] = useState<SurveyRecord | null>(null);

  const refreshSurveys = async () => setSurveys(await fetchSurveys());

  useEffect(() => {
    void refreshSurveys();
    const handleStorage = () => { void refreshSurveys(); };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const startEditSurvey = (s: SurveyRecord) => {
    if (!isAdmin) return;
    setEditSurvey(s);
    setEditSurveyForm({ ...s });
  };
  const cancelEditSurvey = () => { setEditSurvey(null); setEditSurveyForm(null); };
  const saveEditSurvey = () => {
    if (!isAdmin || !editSurveyForm) return;
    void updateSurveyRemote(editSurveyForm.id, editSurveyForm);
    void refreshSurveys();
    setEditSurvey(null);
    setEditSurveyForm(null);
  };
  const deleteSurveyFn = (id: string, nama: string) => {
    if (!isAdmin) return;
    if (window.confirm(`Hapus data survei "${nama}"?\n\nData yang dihapus tidak dapat dikembalikan.`)) {
      void removeSurvey(id);
      void refreshSurveys();
    }
  };

  // Load surveys from localStorage (for potentialSurveys, use the reactive state)
  const allSurveys = useMemo(() => surveys, [surveys]);

  // Filter surveys yang punya data relevan untuk potensi penanaman
  const potentialSurveys = useMemo(() =>
    allSurveys.filter(s =>
      s.tujuanSurvei !== 'pendaratan_penyu' &&
      s.tujuanSurvei !== 'abrasi' &&
      (s.substrat || s.salinitas || s.tutupanTajuk)
    ),
    [allSurveys]
  );

  const surveyAbrasiData = useMemo(
    () => allSurveys.map(mapSurveyAbrasiToRow).filter((row): row is TitikAbrasi => row !== null),
    [allSurveys]
  );

  const combinedAbrasiData = useMemo(
    () => [...surveyAbrasiData, ...abrasiData],
    [surveyAbrasiData, abrasiData]
  );

  // Filter abrasi data
  const filteredAbrasi = useMemo(() => {
    let d = [...combinedAbrasiData];
    if (filterPrioritas !== 'semua') d = d.filter(r => r.prioritas === filterPrioritas);
    if (filterSubstrat !== 'semua') d = d.filter(r => r.substrat === filterSubstrat);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      d = d.filter(r =>
        r.namaPantai.toLowerCase().includes(q) ||
        r.kecamatan.toLowerCase().includes(q) ||
        r.kabKota.toLowerCase().includes(q)
      );
    }
    return d;
  }, [filterPrioritas, filterSubstrat, searchQuery, combinedAbrasiData]);

  // Sort potential surveys by skor descending
  const sortedPotential = useMemo(() =>
    [...potentialSurveys].sort((a, b) => {
      const sa = a.skorPotensi ?? hitungSkorPotensi(a.substrat ?? '', a.salinitas, a.tutupanTajuk);
      const sb = b.skorPotensi ?? hitungSkorPotensi(b.substrat ?? '', b.salinitas, b.tutupanTajuk);
      return sb - sa;
    }),
    [potentialSurveys]
  );

  // Stats
  const totalLuasan = combinedAbrasiData.reduce((s, d) => s + d.luasanRestorasi.max, 0);
  const prioritasTinggi = combinedAbrasiData.filter(d => d.prioritas === 'Tinggi').length;
  // PDF Export
  const handleExportPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"/>
        <title>Rekomendasi Lokasi Penanaman Mangrove — ID-MAP</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 24px; }
          h1 { font-size: 15px; color: #14532d; margin-bottom: 4px; }
          .subtitle { font-size: 10px; color: #6b7280; margin-bottom: 16px; }
          .meta { font-size: 9px; color: #9ca3af; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 12px; font-weight: bold; color: #14532d; border-bottom: 1.5px solid #bbf7d0; padding-bottom: 4px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f0fdf4; font-size: 9px; text-align: left; padding: 5px 6px; border: 1px solid #d1fae5; color: #166534; }
          td { font-size: 9px; padding: 4px 6px; border: 1px solid #e5e7eb; vertical-align: top; }
          tr:nth-child(even) td { background: #f9fafb; }
          .badge-tinggi { background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 8px; font-size: 8px; font-weight: bold; }
          .badge-sedang { background: #fef9c3; color: #854d0e; padding: 1px 6px; border-radius: 8px; font-size: 8px; font-weight: bold; }
          .badge-rendah { background: #dbeafe; color: #1e3a5f; padding: 1px 6px; border-radius: 8px; font-size: 8px; font-weight: bold; }
          .survey-row { margin-bottom: 8px; padding: 6px; border: 1px solid #d1fae5; border-radius: 4px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 16px; }
          .kpi { border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; text-align: center; }
          .kpi-val { font-size: 18px; font-weight: bold; color: #14532d; }
          .kpi-lbl { font-size: 9px; color: #6b7280; }
          .footer { margin-top: 24px; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
          @media print { body { padding: 12px; } }
        </style>
      </head>
      <body>
        <h1>Rekomendasi Lokasi Penanaman Mangrove</h1>
        <p class="subtitle">Sistem ID-MAP — Integrasi Data Mangrove Pesisir</p>
        <p class="meta">Tanggal cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · Sumber: Survey lapangan DKP + analisis citra satelit + data BRGM 2025</p>

        <div class="kpi-grid">
          <div class="kpi"><div class="kpi-val">${combinedAbrasiData.length}</div><div class="kpi-lbl">Titik Rawan Abrasi</div></div>
          <div class="kpi"><div class="kpi-val">${prioritasTinggi}</div><div class="kpi-lbl">Prioritas Tinggi</div></div>
          <div class="kpi"><div class="kpi-val">±${totalLuasan.toLocaleString('id-ID')}</div><div class="kpi-lbl">Target Luasan (ha)</div></div>
          <div class="kpi"><div class="kpi-val">${potentialSurveys.length}</div><div class="kpi-lbl">Data Survei Lapangan</div></div>
        </div>

        <div class="section">
          <div class="section-title">A. Titik Rawan Abrasi — Rekomendasi Lokasi Penanaman</div>
          <table>
            <thead>
              <tr>
                <th>No</th><th>Nama Pantai</th><th>Kecamatan / Kab</th>
                <th>Indikasi Abrasi</th><th>Kondisi Sesudah</th>
                <th>Substrat</th><th>Luasan (ha)</th>
                <th>Prioritas</th><th>Tanaman Rekomendasi</th>
              </tr>
            </thead>
            <tbody>
              ${combinedAbrasiData.map((r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${r.namaPantai}</strong></td>
                  <td>${r.kecamatan}, ${r.kabKota}</td>
                  <td>${r.indikasi}</td>
                  <td>${r.kondisiSesudah}</td>
                  <td style="text-transform:capitalize">${r.substrat}</td>
                  <td>${r.luasanRestorasi.min === r.luasanRestorasi.max ? r.luasanRestorasi.min : `${r.luasanRestorasi.min}–${r.luasanRestorasi.max}`} ${r.luasanRestorasi.satuan}</td>
                  <td><span class="badge-${r.prioritas === 'Tinggi' ? 'tinggi' : r.prioritas === 'Sedang' ? 'sedang' : 'rendah'}">${r.prioritas}</span></td>
                  <td><em>${r.tanamanRekomendasi.join(', ')}</em></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>

        ${potentialSurveys.length > 0 ? `
        <div class="section">
          <div class="section-title">B. Titik Potensi Penanaman dari Data Survei Lapangan (${potentialSurveys.length} titik)</div>
          <table>
            <thead>
              <tr>
                <th>No</th><th>Lokasi</th><th>Provinsi</th><th>Substrat</th>
                <th>Salinitas (ppt)</th><th>Tutupan Tajuk (%)</th>
                <th>Skor Potensi</th><th>Spesies Dominan</th><th>Rekomendasi Petugas</th><th>Tanggal Survei</th>
              </tr>
            </thead>
            <tbody>
              ${sortedPotential.map((s, i) => {
                const skor = s.skorPotensi ?? hitungSkorPotensi(s.substrat ?? '', s.salinitas, s.tutupanTajuk);
                return `<tr>
                  <td>${i + 1}</td>
                  <td><strong>${s.locationName}</strong></td>
                  <td>${s.province}</td>
                  <td style="text-transform:capitalize">${s.substrat ?? '—'}</td>
                  <td>${s.salinitas || '—'}</td>
                  <td>${s.tutupanTajuk || '—'}</td>
                  <td><strong>${skor}/10</strong></td>
                  <td><em>${s.spesiesDominan || '—'}</em></td>
                  <td>${s.rekomendasiLapangan || '—'}</td>
                  <td>${new Date(s.timestamp).toLocaleDateString('id-ID')}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>` : ''}

        <div class="footer">
          Dicetak dari Sistem ID-MAP · Data bersifat referensi lapangan. Verifikasi lapangan tetap diperlukan sebelum implementasi program penanaman.
        </div>
      </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=1000,height=750');
    if (!win) return;
    win.document.write(printContent);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'abrasi', label: 'Titik Rawan Abrasi', icon: AlertTriangle },
    { id: 'potensi', label: 'Data dari Survei Lapangan (Potensi Penanaman)', icon: ClipboardCheck },
    { id: 'ringkasan', label: 'Ringkasan & Analisis', icon: BarChart2 },
  ];

  return (
    <div className="space-y-6">

      {/* PDF Export Toggle — admin only */}
      {isAdmin && (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowPdfPanel(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all shadow-sm ${
              showPdfPanel
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white text-green-700 border-green-300 hover:bg-green-50'
            }`}
          >
            <FileDown className="w-4 h-4" />
            {showPdfPanel ? 'Tutup Panel PDF' : 'Export PDF'}
          </button>
        </div>
      )}

      {/* PDF Export Panel */}
      {showPdfPanel && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileDown className="w-5 h-5 text-green-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800 mb-0.5">Export Data Referensi ke PDF</p>
            <p className="text-xs text-green-700 mb-3 leading-relaxed">
              Dokumen PDF berisi: tabel titik rawan abrasi + rekomendasi tanaman, serta titik potensi penanaman
              dari data survei lapangan yang tersimpan. Cocok untuk laporan lapangan dan referensi program rehabilitasi.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Cetak / Simpan PDF
              </button>
              <div className="text-xs text-green-600 space-y-0.5">
                <p>✓ {combinedAbrasiData.length} titik rawan abrasi</p>
                <p>✓ {potentialSurveys.length} data survei lapangan</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Titik Rawan</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{combinedAbrasiData.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">lokasi teridentifikasi</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Prioritas Tinggi</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{prioritasTinggi}</p>
          <p className="text-xs text-gray-400 mt-0.5">lokasi kritis</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Sprout className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Target Luasan</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">±{totalLuasan.toLocaleString('id-ID')}</p>
          <p className="text-xs text-gray-400 mt-0.5">ha area restorasi</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Data Survei</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{potentialSurveys.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">titik berpotensi</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">Rekomendasi Lokasi Penanaman Mangrove</p>
          <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
            Titik rawan abrasi diidentifikasi dari survey lapangan dan analisis citra satelit. Data input lapangan petugas
            (substrat, salinitas, tutupan tajuk) digunakan sebagai dasar skor potensi penanaman mangrove secara otomatis.
            Semakin tinggi skor, semakin cocok lokasi untuk penanaman.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors flex-1 justify-center
                ${activeTab === tab.id
                  ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Titik Rawan Abrasi ── */}
        {activeTab === 'abrasi' && (
          <div className="p-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pantai / kecamatan..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 outline-none w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={filterPrioritas}
                  onChange={e => setFilterPrioritas(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700"
                >
                  <option value="semua">Semua Prioritas</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Rendah–Sedang">Rendah–Sedang</option>
                </select>
              </div>
              <select
                value={filterSubstrat}
                onChange={e => setFilterSubstrat(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700"
              >
                <option value="semua">Semua Substrat</option>
                <option value="lumpur">Lumpur</option>
                <option value="pasir">Pasir</option>
                <option value="campuran">Campuran</option>
                <option value="berbatu">Berbatu</option>
              </select>
              <span className="text-xs text-gray-400 self-center">{filteredAbrasi.length} lokasi</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">No</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Nama Pantai</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Kecamatan</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Indikasi Abrasi</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Kondisi Sesudah</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Substrat</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Luasan (ha)</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Prioritas</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Skor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAbrasi.map((row, idx) => (
                    <>
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">{row.namaPantai}</p>
                          {(row.koordinat.lat !== 0 || row.koordinat.lng !== 0) && (
                            <a
                              href={row.googleMapsUrl ?? `https://www.google.com/maps?q=${row.koordinat.lat},${row.koordinat.lng}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium mt-0.5"
                            >
                              <ExternalLink className="w-3 h-3" /> Maps
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{row.kecamatan}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-48">
                          <p className="text-xs leading-relaxed">{row.indikasi}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-48">
                          <p className="text-xs leading-relaxed">{row.kondisiSesudah}</p>
                        </td>
                        <td className="px-4 py-3">
                          <SubstratBadge substrat={row.substrat} />
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium text-xs">
                          {formatLuasan(row.luasanRestorasi.min, row.luasanRestorasi.max, row.luasanRestorasi.satuan)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPrioritasColor(row.prioritas as PrioritasLevel)}`}>
                            {row.prioritas}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-16">
                            <SkorBar skor={row.skorRisiko} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedAbrasi(expandedAbrasi === row.id ? null : row.id)}
                              className="text-green-600 hover:text-green-800 text-xs font-medium flex items-center gap-1"
                            >
                              {expandedAbrasi === row.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {expandedAbrasi === row.id ? 'Tutup' : 'Detail'}
                            </button>
                            {isAbrasiEditor && (
                              <>
                                <button
                                  onClick={() => startEditAbrasi(row)}
                                  className="text-gray-400 hover:text-green-700 text-xs flex items-center gap-0.5"
                                  title="Edit data"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteAbrasi(row.id, row.namaPantai)}
                                  className="text-gray-400 hover:text-red-600 text-xs flex items-center gap-0.5"
                                  title="Hapus data"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {editAbrasiId === row.id && editAbrasiForm && (
                        <tr key={`${row.id}-edit`}>
                          <td colSpan={10} className="px-4 py-4 bg-yellow-50/50 border-t border-yellow-200">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs font-semibold text-green-700">Edit Data Abrasi — {row.id}</p>
                              <div className="flex items-center gap-2">
                                <button onClick={saveEditAbrasi} className="flex items-center gap-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors">
                                  <Check className="w-3 h-3" /> Simpan
                                </button>
                                <button onClick={cancelEditAbrasi} className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                                  <X className="w-3 h-3" /> Batal
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Nama Pantai</label>
                                <input value={editAbrasiForm.namaPantai} onChange={e => setEditAbrasiForm({ ...editAbrasiForm, namaPantai: e.target.value })}
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Kecamatan</label>
                                <input value={editAbrasiForm.kecamatan} onChange={e => setEditAbrasiForm({ ...editAbrasiForm, kecamatan: e.target.value })}
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Prioritas</label>
                                <select value={editAbrasiForm.prioritas} onChange={e => setEditAbrasiForm({ ...editAbrasiForm, prioritas: e.target.value as PrioritasLevel })}
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                                  <option value="Tinggi">Tinggi</option>
                                  <option value="Sedang">Sedang</option>
                                  <option value="Rendah–Sedang">Rendah-Sedang</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Indikasi Abrasi</label>
                                <input value={editAbrasiForm.indikasi} onChange={e => setEditAbrasiForm({ ...editAbrasiForm, indikasi: e.target.value })}
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
                                <input
                                  type="number"
                                  step="any"
                                  value={editAbrasiForm.koordinat.lat}
                                  onChange={e => setEditAbrasiForm({ ...editAbrasiForm, koordinat: { ...editAbrasiForm.koordinat, lat: Number.parseFloat(e.target.value) || 0 } })}
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
                                <input
                                  type="number"
                                  step="any"
                                  value={editAbrasiForm.koordinat.lng}
                                  onChange={e => setEditAbrasiForm({ ...editAbrasiForm, koordinat: { ...editAbrasiForm.koordinat, lng: Number.parseFloat(e.target.value) || 0 } })}
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Kondisi Sesudah</label>
                                <input value={editAbrasiForm.kondisiSesudah} onChange={e => setEditAbrasiForm({ ...editAbrasiForm, kondisiSesudah: e.target.value })}
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Link Google Maps</label>
                                <input value={editAbrasiForm.googleMapsUrl ?? ''} onChange={e => setEditAbrasiForm({ ...editAbrasiForm, googleMapsUrl: e.target.value })}
                                  placeholder="https://maps.google.com/..."
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Skor Risiko (1-10)</label>
                                <input type="number" min={1} max={10} value={editAbrasiForm.skorRisiko} onChange={e => setEditAbrasiForm({ ...editAbrasiForm, skorRisiko: parseInt(e.target.value) || 1 })}
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {expandedAbrasi === row.id && (
                        <tr key={`${row.id}-detail`}>
                          <td colSpan={10} className="px-4 py-4 bg-green-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">Rekomendasi Tanaman</p>
                                <div className="space-y-1">
                                  {row.tanamanRekomendasi.map((t, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <Sprout className="w-3 h-3 text-green-600 flex-shrink-0" />
                                      <span className="text-xs text-gray-700 italic">{t}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">Ancaman Utama</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {row.ancamanUtama.map((a, i) => (
                                    <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full">
                                      {a}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-xs font-semibold text-gray-600 mb-1">Kondisi Sebelum Abrasi</p>
                                <p className="text-xs text-gray-700">{row.kondisiSebelum}</p>
                              </div>
                              {row.koordinat && (
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    <span className="font-mono">{row.koordinat.lat}, {row.koordinat.lng}</span>
                                  </div>
                                  <a
                                    href={`https://www.google.com/maps?q=${row.koordinat.lat},${row.koordinat.lng}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg"
                                  >
                                    <ExternalLink className="w-3 h-3" /> Buka Google Maps
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                  {filteredAbrasi.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-400 text-sm">
                        Tidak ada lokasi sesuai filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: Potensi dari Survei Lapangan ── */}
        {activeTab === 'potensi' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Lokasi Berpotensi dari Input Data Lapangan</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>{sortedPotential.length} titik</span>
              </div>
            </div>

            {sortedPotential.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <ClipboardCheck className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">Belum ada data survei lapangan</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Data input lapangan dari menu <strong>Input Data Lapangan</strong> akan otomatis muncul di sini
                  sebagai titik potensi penanaman berdasarkan kondisi substrat dan lingkungan yang tercatat.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedPotential.map(s => (
                  <SurveyPotensiCard
                    key={s.id}
                    survey={s}
                    isAdmin={isAdmin}
                    onEdit={startEditSurvey}
                    onDelete={deleteSurveyFn}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Ringkasan & Analisis ── */}
        {activeTab === 'ringkasan' && (
          <div className="p-4 space-y-6">
            {/* Prioritas breakdown */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">Distribusi Prioritas Lokasi Abrasi</p>
              <div className="space-y-2">
                {(['Tinggi', 'Sedang', 'Rendah–Sedang'] as PrioritasLevel[]).map(p => {
                  const count = combinedAbrasiData.filter(d => d.prioritas === p).length;
                  const pct = combinedAbrasiData.length ? Math.round((count / combinedAbrasiData.length) * 100) : 0;
                  return (
                    <div key={p} className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-28 text-center ${getPrioritasColor(p)}`}>
                        {p}
                      </span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${p === 'Tinggi' ? 'bg-red-400' : p === 'Sedang' ? 'bg-yellow-400' : 'bg-blue-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-12">{count} lok. ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Substrat breakdown */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">Distribusi Tipe Substrat</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['lumpur', 'pasir', 'campuran', 'berbatu'].map(sub => {
                  const count = combinedAbrasiData.filter(d => d.substrat === sub).length;
                  return (
                    <div key={sub} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                      <SubstratBadge substrat={sub} />
                      <p className="text-2xl font-bold text-gray-800 mt-2">{count}</p>
                      <p className="text-xs text-gray-400">lokasi</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rekomendasi Spesies per Substrat */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">Spesies Rekomendasi per Tipe Substrat</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { substrat: 'lumpur', label: 'Substrat Lumpur' },
                  { substrat: 'pasir', label: 'Substrat Pasir' },
                  { substrat: 'campuran', label: 'Substrat Campuran' },
                  { substrat: 'berbatu', label: 'Substrat Berbatu' },
                ].map(({ substrat, label }) => (
                  <div key={substrat} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <SubstratBadge substrat={substrat} />
                      <span className="text-xs font-semibold text-gray-700">{label}</span>
                    </div>
                    <div className="space-y-1.5">
                      {rekomendasiSpesiesBySubstrat(substrat).map((sp, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Leaf className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-700 italic">{sp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status restorasi */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">Status Program Restorasi</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Berjalan', val: abrasiData.filter(d => d.id === 'ABR-006' || d.id === 'ABR-007' || d.id === 'ABR-008').length, color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
                  { label: 'Perencanaan', val: abrasiData.filter(d => d.id === 'ABR-001' || d.id === 'ABR-005').length, color: 'bg-blue-100 text-blue-800', icon: Clock },
                  { label: 'Belum Dimulai', val: abrasiData.filter(d => ['ABR-002', 'ABR-003', 'ABR-004'].includes(d.id)).length, color: 'bg-gray-100 text-gray-600', icon: AlertTriangle },
                  { label: 'Total Lokasi', val: combinedAbrasiData.length, color: 'bg-purple-100 text-purple-800', icon: MapPin },
                ].map(item => (
                  <div key={item.label} className={`${item.color} rounded-xl p-3 text-center`}>
                    <item.icon className="w-4 h-4 mx-auto mb-1 opacity-70" />
                    <p className="text-xl font-bold">{item.val}</p>
                    <p className="text-xs font-medium mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Metode penilaian */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">Metodologi Penilaian Potensi</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Layers, label: 'Substrat', desc: 'Lumpur (+4), Campuran (+3), Pasir (+1). Lumpur ideal untuk akar nafas Avicennia & Rhizophora.' },
                  { icon: Droplets, label: 'Salinitas', desc: '10–30 ppt optimal (+3). Di bawah 10 atau di atas 35 ppt mengurangi skor.' },
                  { icon: Leaf, label: 'Tutupan Tajuk', desc: '<30% (+3): lahan terbuka ideal. 30–60% (+2): sebagian terbuka. >60% (+1): sudah padat.' },
                ].map(m => (
                  <div key={m.label} className="flex gap-2">
                    <m.icon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-800">{m.label}</p>
                      <p className="text-xs text-blue-700 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Survey Modal ── */}
      {editSurvey && editSurveyForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="text-sm font-bold text-green-700">Edit Data Survei — {editSurvey.id}</p>
              <button onClick={cancelEditSurvey} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nama Lokasi</label>
                  <input value={editSurveyForm.locationName} onChange={e => setEditSurveyForm({ ...editSurveyForm, locationName: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Provinsi</label>
                  <input value={editSurveyForm.province} onChange={e => setEditSurveyForm({ ...editSurveyForm, province: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Substrat</label>
                  <select value={editSurveyForm.substrat ?? ''} onChange={e => setEditSurveyForm({ ...editSurveyForm, substrat: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                    <option value="">—</option>
                    <option value="lumpur">Lumpur</option>
                    <option value="pasir">Pasir</option>
                    <option value="campuran">Campuran</option>
                    <option value="berbatu">Berbatu</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Salinitas (ppt)</label>
                  <input value={editSurveyForm.salinitas ?? ''} onChange={e => setEditSurveyForm({ ...editSurveyForm, salinitas: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tutupan Tajuk (%)</label>
                  <input value={editSurveyForm.tutupanTajuk ?? ''} onChange={e => setEditSurveyForm({ ...editSurveyForm, tutupanTajuk: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Koordinat</label>
                  <input value={editSurveyForm.koordinatLat ?? ''} onChange={e => setEditSurveyForm({ ...editSurveyForm, koordinatLat: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Rekomendasi Lapangan</label>
                <textarea value={editSurveyForm.rekomendasiLapangan ?? ''} onChange={e => setEditSurveyForm({ ...editSurveyForm, rekomendasiLapangan: e.target.value })}
                  rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Kondisi Umum</label>
                <textarea value={editSurveyForm.kondisiUmum ?? ''} onChange={e => setEditSurveyForm({ ...editSurveyForm, kondisiUmum: e.target.value })}
                  rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button onClick={cancelEditSurvey} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
              <button onClick={saveEditSurvey} className="px-4 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1">
                <Check className="w-3 h-3" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

