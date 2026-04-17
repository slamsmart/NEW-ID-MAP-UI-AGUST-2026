import { useState } from 'react';
import { Trees, MapPin, Search, Plus, FileDown, Pencil, Check, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

interface VegetasiEntry {
  id: string;
  nama: string;
  jenis: string;
  koordinat: string;
  lokasi: string;
  tanggal: string;
  kondisi: string;
  luasArea?: string;
}

const INITIAL_DATA: VegetasiEntry[] = [
  { id: 'VG-001', nama: 'Cemara Udang Pantai Sendangbiru', jenis: 'Casuarina equisetifolia (Cemara Udang)', koordinat: '-8.4312, 112.6845', lokasi: 'Sendangbiru, Sumbermanjing Wetan', tanggal: '2025-11-15', kondisi: 'Baik', luasArea: '2.5 ha' },
  { id: 'VG-002', nama: 'Mangrove Muara Tamban', jenis: 'Rhizophora apiculata', koordinat: '-8.3876, 112.7123', lokasi: 'Tamban, Sumbermanjing Wetan', tanggal: '2025-11-10', kondisi: 'Sedang', luasArea: '4.8 ha' },
  { id: 'VG-003', nama: 'Pandan Laut Pantai Modangan', jenis: 'Pandanus tectorius (Pandan Laut)', koordinat: '-8.4156, 112.4523', lokasi: 'Modangan, Donomulyo', tanggal: '2025-10-28', kondisi: 'Baik', luasArea: '1.2 ha' },
  { id: 'VG-004', nama: 'Cemara Udang Pantai Balekambang', jenis: 'Casuarina equisetifolia (Cemara Udang)', koordinat: '-8.3945, 112.5234', lokasi: 'Balekambang, Bantur', tanggal: '2025-10-20', kondisi: 'Sedang', luasArea: '3.1 ha' },
  { id: 'VG-005', nama: 'Bakau Muara Sungai Ringin', jenis: 'Avicennia marina', koordinat: '-8.4023, 112.6456', lokasi: 'Sitiarjo, Sumbermanjing Wetan', tanggal: '2025-09-15', kondisi: 'Kritis', luasArea: '1.8 ha' },
  { id: 'VG-006', nama: 'Ketapang Laut Pantai Nganteb', jenis: 'Terminalia catappa (Ketapang)', koordinat: '-8.3712, 112.4891', lokasi: 'Nganteb, Gedangan', tanggal: '2025-09-05', kondisi: 'Baik', luasArea: '0.9 ha' },
];

const kondisiColor: Record<string, string> = {
  'Baik': 'bg-green-100 text-green-700 border-green-200',
  'Sedang': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Kritis': 'bg-red-100 text-red-700 border-red-200',
};

export default function VegetasiMangrove() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'verifikator';
  const [search, setSearch] = useState('');
  const [data, setData] = useState<VegetasiEntry[]>(INITIAL_DATA);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<VegetasiEntry | null>(null);
  const [showPdfPanel, setShowPdfPanel] = useState(false);
  const [pdfStartYear, setPdfStartYear] = useState<string>('semua');
  const [pdfEndYear, setPdfEndYear] = useState<string>('semua');
  const navigate = useNavigate();

  const filtered = data.filter(d =>
    d.nama.toLowerCase().includes(search.toLowerCase()) ||
    d.jenis.toLowerCase().includes(search.toLowerCase()) ||
    d.lokasi.toLowerCase().includes(search.toLowerCase())
  );

  const availableYears = Array.from(new Set(
    data.map(d => Number.parseInt((d.tanggal || '').slice(0, 4), 10)).filter(year => !Number.isNaN(year))
  )).sort((a, b) => b - a);

  const pdfFilteredData = filtered.filter(d => {
    const year = Number.parseInt((d.tanggal || '').slice(0, 4), 10);
    if (Number.isNaN(year)) return pdfStartYear === 'semua' && pdfEndYear === 'semua';
    const start = pdfStartYear === 'semua' ? -Infinity : Number.parseInt(pdfStartYear, 10);
    const end = pdfEndYear === 'semua' ? Infinity : Number.parseInt(pdfEndYear, 10);
    return year >= Math.min(start, end) && year <= Math.max(start, end);
  });

  const startEdit = (entry: VegetasiEntry) => {
    if (!isAdmin) return;
    setEditId(entry.id);
    setEditForm({ ...entry });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!isAdmin || !editForm) return;
    setData(prev => prev.map(d => d.id === editForm.id ? editForm : d));
    setEditId(null);
    setEditForm(null);
  };

  const deleteEntry = (id: string, nama: string) => {
    if (!isAdmin) return;
    if (window.confirm(`Hapus data "${nama}"?\n\nData yang dihapus tidak dapat dikembalikan.`)) {
      setData(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleExportPDF = () => {
    const exportData = pdfFilteredData;
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
        <title>Lokasi Vegetasi Mangrove — ID-MAP</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 24px; }
          h1 { font-size: 15px; color: #14532d; margin-bottom: 4px; }
          .subtitle { font-size: 10px; color: #6b7280; margin-bottom: 16px; }
          .meta { font-size: 9px; color: #9ca3af; margin-bottom: 20px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 16px; }
          .kpi { border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; text-align: center; }
          .kpi-val { font-size: 18px; font-weight: bold; color: #14532d; }
          .kpi-lbl { font-size: 9px; color: #6b7280; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { background: #f0fdf4; font-size: 9px; text-align: left; padding: 5px 6px; border: 1px solid #d1fae5; color: #166534; }
          td { font-size: 9px; padding: 4px 6px; border: 1px solid #e5e7eb; vertical-align: top; }
          tr:nth-child(even) td { background: #f9fafb; }
          .badge { padding: 1px 6px; border-radius: 8px; font-size: 8px; font-weight: bold; }
          .badge-baik { background: #dcfce7; color: #166534; }
          .badge-sedang { background: #fef9c3; color: #854d0e; }
          .badge-kritis { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 24px; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
          @media print { body { padding: 12px; } }
        </style>
      </head>
      <body>
        <h1>Lokasi Vegetasi Mangrove & Pesisir</h1>
        <p class="subtitle">Cabang Dinas Kelautan dan Perikanan Malang — Sistem ID-MAP</p>
        <p class="meta">Tanggal cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p class="meta">Filter tahun: ${yearLabel}</p>

        <div class="kpi-grid">
          <div class="kpi"><div class="kpi-val">${exportData.length}</div><div class="kpi-lbl">Total Titik Vegetasi</div></div>
          <div class="kpi"><div class="kpi-val">${exportData.filter(d => d.kondisi === 'Baik').length}</div><div class="kpi-lbl">Kondisi Baik</div></div>
          <div class="kpi"><div class="kpi-val">${exportData.filter(d => d.kondisi === 'Kritis').length}</div><div class="kpi-lbl">Perlu Perhatian</div></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th><th>Nama</th><th>Jenis Vegetasi</th><th>Lokasi</th>
              <th>Koordinat</th><th>Luas</th><th>Kondisi</th><th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            ${exportData.map((d, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${d.nama}</strong></td>
                <td><em>${d.jenis}</em></td>
                <td>${d.lokasi}</td>
                <td>${d.koordinat}</td>
                <td>${d.luasArea ?? '-'}</td>
                <td><span class="badge badge-${d.kondisi.toLowerCase()}">${d.kondisi}</span></td>
                <td>${d.tanggal}</td>
              </tr>`).join('')}
          </tbody>
        </table>

        <div class="footer">
          Dicetak dari Sistem ID-MAP · Data vegetasi pesisir wilayah kerja Cabdin KP Malang.
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
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-700 rounded-lg flex items-center justify-center">
            <Trees className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Monitoring Pesisir</p>
            <p className="text-sm font-bold text-gray-800">Lokasi Vegetasi Mangrove</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowPdfPanel(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                showPdfPanel
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white text-green-700 border-green-300 hover:bg-green-50'
              }`}
            >
              <FileDown className="w-3.5 h-3.5" /> PDF
            </button>
          )}
          <button
            onClick={() => navigate('/input-lapangan?tujuan=vegetasi_mangrove')}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah
          </button>
        </div>
      </div>

      {/* PDF Panel */}
      {showPdfPanel && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <FileDown className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800 mb-1">Export Data Vegetasi ke PDF</p>
            <p className="text-xs text-green-700 mb-3">
              Dokumen berisi tabel hasil sortir tahun untuk {pdfFilteredData.length} titik vegetasi pesisir beserta kondisi dan koordinat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <button onClick={() => { setPdfStartYear('semua'); setPdfEndYear('semua'); }}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-green-300 text-green-700 hover:bg-green-100 transition-colors">
                Semua Tahun
              </button>
              <button onClick={() => {
                const latest = availableYears[0];
                if (!latest) return;
                setPdfStartYear(String(latest));
                setPdfEndYear(String(latest));
              }}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-green-300 text-green-700 hover:bg-green-100 transition-colors">
                1 Tahun
              </button>
              <button onClick={() => {
                const latest = availableYears[0];
                if (!latest) return;
                setPdfStartYear(String(Math.max(latest - 1, availableYears[availableYears.length - 1] ?? latest)));
                setPdfEndYear(String(latest));
              }}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-green-300 text-green-700 hover:bg-green-100 transition-colors">
                2 Tahun
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <select value={pdfStartYear} onChange={e => setPdfStartYear(e.target.value)}
                className="w-full text-sm border border-green-200 rounded-lg px-3 py-2 bg-white">
                <option value="semua">Dari tahun</option>
                {availableYears.map(year => <option key={`veg-start-${year}`} value={year}>{year}</option>)}
              </select>
              <select value={pdfEndYear} onChange={e => setPdfEndYear(e.target.value)}
                className="w-full text-sm border border-green-200 rounded-lg px-3 py-2 bg-white">
                <option value="semua">Sampai tahun</option>
                {availableYears.map(year => <option key={`veg-end-${year}`} value={year}>{year}</option>)}
              </select>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={pdfFilteredData.length === 0}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" /> Cetak / Simpan PDF
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <p className="text-xs text-green-800">
          Data lokasi vegetasi mangrove, cemara udang, pandan laut, ketapang dan vegetasi pesisir lainnya
          di wilayah kerja Cabang Dinas Kelautan dan Perikanan Malang.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, jenis, atau lokasi..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
        />
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map(d => (
          <div key={d.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
            {editId === d.id && editForm ? (
              /* ── Edit Mode ── */
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-green-700">Edit Data — {d.id}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={saveEdit} className="flex items-center gap-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors">
                      <Check className="w-3 h-3" /> Simpan
                    </button>
                    <button onClick={cancelEdit} className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                      <X className="w-3 h-3" /> Batal
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Nama</label>
                    <input value={editForm.nama} onChange={e => setEditForm({ ...editForm, nama: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Jenis Vegetasi</label>
                    <input value={editForm.jenis} onChange={e => setEditForm({ ...editForm, jenis: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Lokasi</label>
                    <input value={editForm.lokasi} onChange={e => setEditForm({ ...editForm, lokasi: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Koordinat</label>
                    <input value={editForm.koordinat} onChange={e => setEditForm({ ...editForm, koordinat: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Luas Area</label>
                    <input value={editForm.luasArea ?? ''} onChange={e => setEditForm({ ...editForm, luasArea: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Kondisi</label>
                    <select value={editForm.kondisi} onChange={e => setEditForm({ ...editForm, kondisi: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                      <option value="Baik">Baik</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Kritis">Kritis</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Tanggal</label>
                    <input type="date" value={editForm.tanggal} onChange={e => setEditForm({ ...editForm, tanggal: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                  </div>
                </div>
              </div>
            ) : (
              /* ── View Mode ── */
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-gray-800 truncate">{d.nama}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${kondisiColor[d.kondisi] ?? 'bg-gray-100 text-gray-600'}`}>
                        {d.kondisi}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 italic">{d.jenis}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(d)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors" title="Edit data">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => deleteEntry(d.id, d.nama)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors" title="Hapus data">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-gray-400">Lokasi</p>
                    <p className="text-xs font-medium text-gray-700">{d.lokasi}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Koordinat</p>
                    <a href={`https://www.google.com/maps?q=${d.koordinat}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-mono text-xs">
                      <MapPin className="w-3 h-3" /> {d.koordinat}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Luas Area</p>
                    <p className="text-xs font-medium text-gray-700">{d.luasArea ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Tanggal</p>
                    <p className="text-xs font-medium text-gray-700">{d.tanggal}</p>
                  </div>
                </div>
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
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center">
          <p className="text-lg font-bold text-green-700">{data.length}</p>
          <p className="text-xs text-gray-500">Total Titik Vegetasi</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center">
          <p className="text-lg font-bold text-green-700">{data.filter(d => d.kondisi === 'Baik').length}</p>
          <p className="text-xs text-gray-500">Kondisi Baik</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center">
          <p className="text-lg font-bold text-red-600">{data.filter(d => d.kondisi === 'Kritis').length}</p>
          <p className="text-xs text-gray-500">Perlu Perhatian</p>
        </div>
      </div>
    </div>
  );
}
