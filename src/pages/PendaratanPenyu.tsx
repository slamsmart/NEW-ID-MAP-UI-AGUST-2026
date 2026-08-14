import { useState, useEffect, useRef } from 'react';
import { Turtle, MapPin, Search, Plus, AlertTriangle, FileDown, Pencil, Check, X, Trash2, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { fetchSurveys, updateSurveyRemote, removeSurvey } from '../data/localStore';
import { downloadCSV, downloadGeoJSON, dateStamp } from '../lib/exportUtils';
import { getCloudinaryUrl } from '../lib/cloudinary';

interface PenyuEntry {
  id: string;
  namaPantai: string;
  koordinat: string;
  lokasi: string;
  jenisPenyu: string;
  jumlahSarang: number;
  tanggalSurvei: string;
  statusPerlindungan: string;
  ancaman: string;
  fotoUrl?: string;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  sarangPoints?: Array<{
    lat: string;
    lng: string;
    catatan?: string;
    waktu?: string;
    fotoUrl?: string;
  }>;
}

const statusColor: Record<string, string> = {
  'Dilindungi': 'bg-green-100 text-green-700 border-green-200',
  'Kritis': 'bg-red-100 text-red-700 border-red-200',
  'Rentan': 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export default function PendaratanPenyu() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'verifikator';
  const [search, setSearch] = useState('');
  const [data, setData] = useState<PenyuEntry[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PenyuEntry | null>(null);
  const [showPdfPanel, setShowPdfPanel] = useState(false);
  const [pdfStartYear, setPdfStartYear] = useState<string>('semua');
  const [pdfEndYear, setPdfEndYear] = useState<string>('semua');
  const [previewEntry, setPreviewEntry] = useState<PenyuEntry | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const scrollToList = () => {
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const fromRecords = (surveys: Awaited<ReturnType<typeof fetchSurveys>>): PenyuEntry[] => {
      return surveys
        .filter(s => s.tujuanSurvei === 'pendaratan_penyu')
        .map(s => ({
          id: s.id,
          namaPantai: s.namaPantai || s.locationName || '',
          koordinat: s.koordinatLat && s.koordinatLng ? `${s.koordinatLat}, ${s.koordinatLng}` : '',
          lokasi: s.locationName || s.namaPantai || '',
          jenisPenyu: s.jenisPenyu || '',
          jumlahSarang: parseInt(s.jumlahSarang || '0'),
          tanggalSurvei: s.timestamp ? s.timestamp.slice(0, 10) : '',
          statusPerlindungan: s.statusPerlindungan || 'dilindungi',
          ancaman: s.ancamanUtama ? s.ancamanUtama.join(', ') : '',
          fotoUrl: s.fotoDokumentasi || '',
          verificationStatus: s.verificationStatus ?? 'pending',
          sarangPoints: s.sarangPoints || [],
        }));
    };

    const loadData = async () => {
      // 1. Load dari localStorage dulu (instant)
      const surveys = await fetchSurveys();
      const entries = fromRecords(surveys);
      entries.sort((a, b) => (b.tanggalSurvei > a.tanggalSurvei ? 1 : -1));
      setData(entries);
    };

    void loadData();
    const handleStorage = () => { void loadData(); };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const filtered = data.filter(d =>
    d.namaPantai.toLowerCase().includes(search.toLowerCase()) ||
    d.jenisPenyu.toLowerCase().includes(search.toLowerCase()) ||
    d.lokasi.toLowerCase().includes(search.toLowerCase())
  );

  const availableYears = Array.from(new Set(
    data.map(d => Number.parseInt((d.tanggalSurvei || '').slice(0, 4), 10)).filter(year => !Number.isNaN(year))
  )).sort((a, b) => b - a);

  const pdfFilteredData = filtered.filter(d => {
    const year = Number.parseInt((d.tanggalSurvei || '').slice(0, 4), 10);
    if (Number.isNaN(year)) return pdfStartYear === 'semua' && pdfEndYear === 'semua';
    const start = pdfStartYear === 'semua' ? -Infinity : Number.parseInt(pdfStartYear, 10);
    const end = pdfEndYear === 'semua' ? Infinity : Number.parseInt(pdfEndYear, 10);
    return year >= Math.min(start, end) && year <= Math.max(start, end);
  });

  const totalSarang = data.reduce((s, d) => s + d.jumlahSarang, 0);

  const startEdit = (entry: PenyuEntry) => {
    if (!isAdmin) return;
    setEditId(entry.id);
    setEditForm({ ...entry });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm(null);
  };

  const saveEdit = async () => {
    if (!isAdmin || !editForm) return;
    const [lat = '', lng = ''] = editForm.koordinat.split(',').map(part => part.trim());
    await updateSurveyRemote(editForm.id, {
      namaPantai: editForm.namaPantai,
      locationName: editForm.lokasi,
      jenisPenyu: editForm.jenisPenyu,
      jumlahSarang: String(editForm.jumlahSarang),
      statusPerlindungan: editForm.statusPerlindungan,
      ancamanUtama: editForm.ancaman ? editForm.ancaman.split(',').map(item => item.trim()).filter(Boolean) : [],
      koordinatLat: lat,
      koordinatLng: lng,
      sarangPoints: editForm.sarangPoints,
    });
    setData(prev => prev.map(d => d.id === editForm.id ? editForm : d));
    setEditId(null);
    setEditForm(null);
  };

  const deleteEntry = async (id: string, namaPantai: string) => {
    if (!isAdmin) return;
    if (window.confirm(`Hapus data "${namaPantai}"?\n\nData yang dihapus tidak dapat dikembalikan.`)) {
      await removeSurvey(id);
      setData(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleExportPDF = () => {
    const exportData = pdfFilteredData;
    const exportTotalSarang = exportData.reduce((sum, item) => sum + item.jumlahSarang, 0);
    const yearLabel = pdfStartYear === 'semua' && pdfEndYear === 'semua'
      ? 'Semua tahun'
      : pdfStartYear === pdfEndYear || pdfEndYear === 'semua'
        ? `Tahun ${pdfStartYear}`
        : `${Math.min(Number(pdfStartYear), Number(pdfEndYear))} - ${Math.max(Number(pdfStartYear), Number(pdfEndYear))}`;
    const printContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"/>
        <title>Titik Pendaratan Penyu — ID-MAP</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 24px; }
          h1 { font-size: 15px; color: #134e4a; margin-bottom: 4px; }
          .subtitle { font-size: 10px; color: #6b7280; margin-bottom: 16px; }
          .meta { font-size: 9px; color: #9ca3af; margin-bottom: 20px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 16px; }
          .kpi { border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; text-align: center; }
          .kpi-val { font-size: 18px; font-weight: bold; color: #134e4a; }
          .kpi-lbl { font-size: 9px; color: #6b7280; }
          .info { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 6px; padding: 8px; font-size: 9px; color: #134e4a; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { background: #f0fdfa; font-size: 9px; text-align: left; padding: 5px 6px; border: 1px solid #ccfbf1; color: #134e4a; }
          td { font-size: 9px; padding: 4px 6px; border: 1px solid #e5e7eb; vertical-align: top; }
          tr:nth-child(even) td { background: #f9fafb; }
          .badge { padding: 1px 6px; border-radius: 8px; font-size: 8px; font-weight: bold; }
          .badge-dilindungi { background: #dcfce7; color: #166534; }
          .badge-kritis { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 24px; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
          @media print { body { padding: 12px; } }
        </style>
      </head>
      <body>
        <h1>Titik Pendaratan Penyu</h1>
        <p class="subtitle">Cabang Dinas Kelautan dan Perikanan Malang — Sistem ID-MAP</p>
        <p class="meta">Tanggal cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div class="info">Semua jenis penyu di Indonesia berstatus dilindungi berdasarkan PP No. 7 Tahun 1999 dan Permen LHK No. P.106/2018.</div>
        <div class="info">Filter tahun: ${yearLabel}</div>

        <div class="kpi-grid">
          <div class="kpi"><div class="kpi-val">${exportData.length}</div><div class="kpi-lbl">Titik Pendaratan</div></div>
          <div class="kpi"><div class="kpi-val">${exportTotalSarang}</div><div class="kpi-lbl">Total Sarang Terdata</div></div>
          <div class="kpi"><div class="kpi-val">${new Set(exportData.map(d => d.jenisPenyu)).size}</div><div class="kpi-lbl">Jenis Penyu</div></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th><th>Nama Pantai</th><th>Lokasi</th><th>Jenis Penyu</th>
              <th>Sarang</th><th>Koordinat</th><th>Status</th><th>Ancaman</th><th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            ${exportData.map((d, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${d.namaPantai}</strong></td>
                <td>${d.lokasi}</td>
                <td><em>${d.jenisPenyu}</em></td>
                <td><strong>${d.jumlahSarang}</strong></td>
                <td>${d.koordinat}</td>
                <td><span class="badge badge-${d.statusPerlindungan.toLowerCase()}">${d.statusPerlindungan}</span></td>
                <td>${d.ancaman}</td>
                <td>${d.tanggalSurvei}</td>
              </tr>`).join('')}
          </tbody>
        </table>

        <div class="footer">
          Dicetak dari Sistem ID-MAP · Data titik pendaratan penyu pesisir selatan wilayah kerja Cabdin KP Malang.
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

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-700 rounded-lg flex items-center justify-center">
            <Turtle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Monitoring Pesisir</p>
            <p className="text-sm font-bold text-gray-800">Titik Pendaratan Penyu</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const csvRows = filtered.flatMap(d => {
                const pts = (d.sarangPoints ?? []).filter(p => p.lat && p.lng);
                if (pts.length > 0) {
                  return pts.map((p, idx) => ({
                    id: d.id,
                    namaPantai: d.namaPantai,
                    lokasi: d.lokasi,
                    nomorSarang: idx + 1,
                    koordinat: `${p.lat}, ${p.lng}`,
                    catatan: p.catatan ?? '',
                    jenisPenyu: d.jenisPenyu,
                    jumlahSarang: d.jumlahSarang,
                    statusPerlindungan: d.statusPerlindungan,
                    ancaman: d.ancaman,
                    tanggalSurvei: d.tanggalSurvei,
                  }));
                }
                return [{ id: d.id, namaPantai: d.namaPantai, lokasi: d.lokasi, nomorSarang: 1, koordinat: d.koordinat, catatan: '', jenisPenyu: d.jenisPenyu, jumlahSarang: d.jumlahSarang, statusPerlindungan: d.statusPerlindungan, ancaman: d.ancaman, tanggalSurvei: d.tanggalSurvei }];
              });
              downloadCSV(
                `idmap-pendaratan-penyu-${dateStamp()}.csv`,
                csvRows,
                [
                  { key: 'id', label: 'ID' },
                  { key: 'namaPantai', label: 'Nama Pantai' },
                  { key: 'lokasi', label: 'Lokasi' },
                  { key: 'nomorSarang', label: 'No. Sarang' },
                  { key: 'koordinat', label: 'Koordinat' },
                  { key: 'catatan', label: 'Catatan' },
                  { key: 'jenisPenyu', label: 'Jenis Penyu' },
                  { key: 'jumlahSarang', label: 'Jumlah Sarang' },
                  { key: 'statusPerlindungan', label: 'Status Perlindungan' },
                  { key: 'ancaman', label: 'Ancaman' },
                  { key: 'tanggalSurvei', label: 'Tanggal Survei' },
                ],
              );
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border bg-white text-teal-700 border-teal-300 hover:bg-teal-50"
            title="Unduh data CSV"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => {
              const points = filtered.flatMap(d => {
                const validPts = (d.sarangPoints ?? []).filter(p => p.lat && p.lng);
                if (validPts.length > 0) {
                  return validPts.map((p, idx) => ({
                    lat: Number.parseFloat(p.lat),
                    lng: Number.parseFloat(p.lng),
                    properties: {
                      id: d.id,
                      nomorSarang: idx + 1,
                      kategori: 'pendaratan_penyu',
                      namaPantai: d.namaPantai,
                      lokasi: d.lokasi,
                      jenisPenyu: d.jenisPenyu,
                      jumlahSarang: d.jumlahSarang,
                      statusPerlindungan: d.statusPerlindungan,
                      ancaman: d.ancaman,
                      tanggalSurvei: d.tanggalSurvei,
                      catatan: p.catatan ?? '',
                    },
                  }));
                }
                const [latStr, lngStr] = (d.koordinat || '').split(',').map(s => s.trim());
                return [{ lat: Number.parseFloat(latStr), lng: Number.parseFloat(lngStr), properties: { id: d.id, nomorSarang: 1, kategori: 'pendaratan_penyu', namaPantai: d.namaPantai, lokasi: d.lokasi, jenisPenyu: d.jenisPenyu, jumlahSarang: d.jumlahSarang, statusPerlindungan: d.statusPerlindungan, ancaman: d.ancaman, tanggalSurvei: d.tanggalSurvei } }];
              });
              downloadGeoJSON(`idmap-pendaratan-penyu-${dateStamp()}.geojson`, points);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border bg-white text-teal-700 border-teal-300 hover:bg-teal-50"
            title="Unduh GeoJSON (peta)"
          >
            <Download className="w-3.5 h-3.5" /> GeoJSON
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowPdfPanel(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                showPdfPanel
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-teal-700 border-teal-300 hover:bg-teal-50'
              }`}
            >
              <FileDown className="w-3.5 h-3.5" /> PDF
            </button>
          )}
          <button
            onClick={() => navigate('/input-lapangan?tujuan=pendaratan_penyu')}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-700 text-white text-xs font-semibold rounded-lg hover:bg-teal-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah
          </button>
        </div>
      </div>

      {/* PDF Panel */}
      {showPdfPanel && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
          <FileDown className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-teal-800 mb-1">Export Data Penyu ke PDF</p>
            <p className="text-xs text-teal-700 mb-3">
              Dokumen berisi tabel hasil sortir tahun untuk {pdfFilteredData.length} titik pendaratan penyu beserta status perlindungan dan ancaman.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <button onClick={() => { setPdfStartYear('semua'); setPdfEndYear('semua'); }}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-teal-300 text-teal-700 hover:bg-teal-100 transition-colors">
                Semua Tahun
              </button>
              <button onClick={() => {
                const latest = availableYears[0];
                if (!latest) return;
                setPdfStartYear(String(latest));
                setPdfEndYear(String(latest));
              }}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-teal-300 text-teal-700 hover:bg-teal-100 transition-colors">
                1 Tahun
              </button>
              <button onClick={() => {
                const latest = availableYears[0];
                if (!latest) return;
                setPdfStartYear(String(Math.max(latest - 1, availableYears[availableYears.length - 1] ?? latest)));
                setPdfEndYear(String(latest));
              }}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-teal-300 text-teal-700 hover:bg-teal-100 transition-colors">
                2 Tahun
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <select value={pdfStartYear} onChange={e => setPdfStartYear(e.target.value)}
                className="w-full text-sm border border-teal-200 rounded-lg px-3 py-2 bg-white">
                <option value="semua">Dari tahun</option>
                {availableYears.map(year => <option key={`penyu-start-${year}`} value={year}>{year}</option>)}
              </select>
              <select value={pdfEndYear} onChange={e => setPdfEndYear(e.target.value)}
                className="w-full text-sm border border-teal-200 rounded-lg px-3 py-2 bg-white">
                <option value="semua">Sampai tahun</option>
                {availableYears.map(year => <option key={`penyu-end-${year}`} value={year}>{year}</option>)}
              </select>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={pdfFilteredData.length === 0}
              className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" /> Cetak / Simpan PDF
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-teal-800">
            Data titik pendaratan penyu di pesisir selatan Malang. Semua jenis penyu di Indonesia berstatus dilindungi
            berdasarkan PP No. 7 Tahun 1999 dan Permen LHK No. P.106/2018.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari pantai, jenis penyu, atau lokasi..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
        />
      </div>

      {/* Cards */}
      <div ref={listRef} className="space-y-3">
        {filtered.map(d => (
          <div key={d.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
            {editId === d.id && editForm ? (
              /* ── Edit Mode ── */
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-teal-700">Edit Data — {d.id}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={saveEdit} className="flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors">
                      <Check className="w-3 h-3" /> Simpan
                    </button>
                    <button onClick={cancelEdit} className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                      <X className="w-3 h-3" /> Batal
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Nama Pantai</label>
                    <input value={editForm.namaPantai} onChange={e => setEditForm({ ...editForm, namaPantai: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Jenis Penyu</label>
                    <input value={editForm.jenisPenyu} onChange={e => setEditForm({ ...editForm, jenisPenyu: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Lokasi</label>
                    <input value={editForm.lokasi} onChange={e => setEditForm({ ...editForm, lokasi: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Koordinat</label>
                    <input value={editForm.koordinat} onChange={e => setEditForm({ ...editForm, koordinat: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Jumlah Sarang</label>
                    <input type="number" value={editForm.jumlahSarang} onChange={e => setEditForm({ ...editForm, jumlahSarang: parseInt(e.target.value) || 0 })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Status Perlindungan</label>
                    <select value={editForm.statusPerlindungan} onChange={e => setEditForm({ ...editForm, statusPerlindungan: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500">
                      <option value="Dilindungi">Dilindungi</option>
                      <option value="Kritis">Kritis</option>
                      <option value="Rentan">Rentan</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ancaman</label>
                    <input value={editForm.ancaman} onChange={e => setEditForm({ ...editForm, ancaman: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Tanggal Survei</label>
                    <input type="date" value={editForm.tanggalSurvei} onChange={e => setEditForm({ ...editForm, tanggalSurvei: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500" />
                  </div>
                </div>
              </div>
            ) : (
              /* ── View Mode ── */
              <div className="p-4">
                {(() => {
                  const validPoints = (d.sarangPoints ?? []).filter(p => p.lat && p.lng);
                  const firstPoint = validPoints[0];
                  const displayKoordinat = firstPoint ? `${firstPoint.lat}, ${firstPoint.lng}` : d.koordinat;
                  const previewPhotos = validPoints.filter(p => p.fotoUrl).slice(0, 4);
                  return (
                    <>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">{d.namaPantai}</h3>
                    <p className="text-xs text-gray-500">{d.lokasi}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    {/* Badge verifikasi */}
                    {d.verificationStatus === 'approved' ? (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3" /> Terverifikasi
                      </span>
                    ) : d.verificationStatus === 'rejected' ? (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200">
                        <XCircle className="w-3 h-3" /> Ditolak
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                        <Clock className="w-3 h-3" /> Menunggu verifikasi
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor[d.statusPerlindungan] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {d.statusPerlindungan}
                    </span>
                    {isAdmin && (
                      <>
                        <button onClick={() => startEdit(d)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-teal-700 px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors" title="Edit data">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => deleteEntry(d.id, d.namaPantai)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors" title="Hapus data">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {d.fotoUrl && (
                  <div className="overflow-hidden rounded-xl mb-3 cursor-pointer" onClick={() => setLightboxImg(d.fotoUrl!)}>
                    <img src={getCloudinaryUrl(d.fotoUrl, 'w_800,c_fill,q_auto,f_auto')} alt={`Foto ${d.namaPantai}`} className="w-full h-44 object-cover hover:opacity-90 transition-opacity" loading="lazy" />
                  </div>
                )}
                {validPoints.length > 0 && (
                  <div className="mb-3 flex items-center gap-3 flex-wrap">
                    {previewPhotos.length > 0 && (
                      <div className="flex -space-x-2">
                        {previewPhotos.map((p, idx) => (
                          <img key={`${d.id}-thumb-${idx}`} src={getCloudinaryUrl(p.fotoUrl, 'w_80,c_fill,q_auto,f_auto')} alt={`Titik ${idx + 1}`} className="w-10 h-10 rounded-lg border-2 border-white object-cover shadow-sm cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" onClick={() => setLightboxImg(p.fotoUrl!)} />
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setPreviewEntry(d)}
                      className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5 hover:bg-teal-100 transition-colors"
                    >
                      Lihat {validPoints.length} titik sarang
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-gray-400">Jenis Penyu</p>
                    <p className="text-xs font-medium text-gray-700 italic">{d.jenisPenyu}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Jumlah Sarang</p>
                    <p className="text-sm font-bold text-teal-700">{d.jumlahSarang} sarang</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Koordinat</p>
                    <a href={displayKoordinat ? `https://www.google.com/maps?q=${displayKoordinat}` : '#'} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-mono text-xs">
                      <MapPin className="w-3 h-3" /> {displayKoordinat || '-'}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Tanggal Survei</p>
                    <p className="text-xs font-medium text-gray-700">{d.tanggalSurvei}</p>
                  </div>
                </div>
                {d.ancaman && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    <p className="text-xs text-orange-700">Ancaman: {d.ancaman}</p>
                  </div>
                )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">Tidak ada data ditemukan</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button type="button" onClick={scrollToList} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center hover:shadow-sm transition-shadow">
          <p className="text-lg font-bold text-teal-700">{data.length}</p>
          <p className="text-xs text-gray-500">Titik Pendaratan</p>
        </button>
        <button type="button" onClick={scrollToList} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center hover:shadow-sm transition-shadow">
          <p className="text-lg font-bold text-teal-700">{totalSarang}</p>
          <p className="text-xs text-gray-500">Total Sarang Terdata</p>
        </button>
        <button type="button" onClick={scrollToList} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center hover:shadow-sm transition-shadow">
          <p className="text-lg font-bold text-teal-700">{new Set(data.map(d => d.jenisPenyu)).size}</p>
          <p className="text-xs text-gray-500">Jenis Penyu</p>
        </button>
      </div>

      {previewEntry && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-bold text-teal-800">{previewEntry.namaPantai}</p>
                <p className="text-xs text-gray-500">{(previewEntry.sarangPoints ?? []).filter(p => p.lat && p.lng).length} titik sarang terdata</p>
              </div>
              <button onClick={() => setPreviewEntry(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh] space-y-3">
              {(previewEntry.sarangPoints ?? []).filter(p => p.lat && p.lng).map((point, idx) => (
                <div key={`${previewEntry.id}-point-${idx}`} className="flex items-center gap-4 border border-gray-100 rounded-xl p-3 hover:bg-teal-50/40 transition-colors">
                  {point.fotoUrl ? (
                    <button
                      type="button"
                      onClick={() => setLightboxImg(point.fotoUrl!)}
                      className="flex-shrink-0"
                    >
                      <img src={getCloudinaryUrl(point.fotoUrl, 'w_160,c_fill,q_auto,f_auto')} alt={`Titik ${idx + 1}`} className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm hover:opacity-90 transition-opacity" loading="lazy" />
                    </button>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 mb-1">Titik {idx + 1}</p>
                    <a
                      href={`https://www.google.com/maps?q=${point.lat},${point.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 font-mono break-all"
                    >
                      {point.lat}, {point.lng}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">{point.waktu || '-'}</p>
                    {point.catatan && <p className="text-xs text-gray-600 mt-1">{point.catatan}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setPreviewImage(null)}>
          <div className="max-w-4xl max-h-[85vh]">
            <img src={previewImage} alt="Preview lokasi sarang" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
          </div>
        </div>
      )}

      {/* Lightbox — klik foto manapun */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/85 flex items-center justify-center z-[70] p-4"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
            <img
              src={getCloudinaryUrl(lightboxImg, 'w_1920,c_limit,q_auto,f_auto')}
              alt="Foto penyu"
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
