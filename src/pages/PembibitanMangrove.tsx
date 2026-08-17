import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Sprout, MapPin, CheckCircle, XCircle, Building2, Phone,
  Filter, Search, ChevronDown, ChevronUp, Leaf, X, Info,
  Plus, ShieldCheck, Trash2, ExternalLink,
} from 'lucide-react';
import {
  pembibitanData, pembibitanSummary, getStatusColor, getStatusLabel,
  countSertified, type PembibitanMangrove, type StatusPembibitan, type PulauPembibitan,
  getCustomNurseries, saveCustomNursery, deleteCustomNursery, type CustomNursery,
} from '../data/pembibitanData';
import { useAuth } from '../context/useAuth';

// ── Map fit bounds helper ─────────────────────────────────────────────────────
function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 10, { duration: 1.2 }); }, [lat, lng, map]);
  return null;
}

// ── Detail Panel (static nurseries) ──────────────────────────────────────────
function DetailPanel({ item, onClose }: { item: PembibitanMangrove; onClose: () => void }) {
  const sertCount = countSertified(item.sertifikasi);
  const sertTotal = item.sertifikasi.length;
  const pct = Math.round((sertCount / sertTotal) * 100);
  const statusColor = getStatusColor(item.status);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: statusColor + '20' }}>
          <Sprout className="w-5 h-5" style={{ color: statusColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-800 leading-tight">{item.nama}</h3>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {item.kabKota}, {item.provinsi}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
            <p className="text-xs text-gray-500 mb-0.5">Status</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: statusColor }}>
              {getStatusLabel(item.status)}
            </span>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
            <p className="text-xs text-gray-500 mb-0.5">Kapasitas/Tahun</p>
            <p className="text-sm font-bold text-gray-800">{item.kapasitasBibit.toLocaleString('id-ID')}</p>
            <p className="text-xs text-gray-400">bibit</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
            <p className="text-xs text-gray-500 mb-0.5">Berdiri</p>
            <p className="text-sm font-bold text-gray-800">{item.tahunBerdiri}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs">
          <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-gray-500">Institusi: </span>
            <span className="font-semibold text-gray-700">{item.institusi}</span>
          </div>
        </div>

        {/* Google Maps link */}
        <a
          href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg w-fit"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Lihat Lokasi di Google Maps
        </a>

        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-green-600" /> Spesies Unggulan
          </p>
          <div className="flex flex-wrap gap-1.5">
            {item.spesiesUnggulan.map((sp, i) => (
              <span key={i} className="text-xs italic bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded-full">
                {sp}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700">Checklist Sertifikasi</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              pct === 100 ? 'bg-green-100 text-green-700' :
              pct >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>{sertCount}/{sertTotal} terpenuhi</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div className={`h-full rounded-full transition-all ${
              pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'
            }`} style={{ width: `${pct}%` }} />
          </div>
          <div className="space-y-1.5">
            {item.sertifikasi.map(sert => (
              <div key={sert.kode} className="flex items-center gap-2">
                {sert.terpenuhi
                  ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                <span className={`text-xs ${sert.terpenuhi ? 'text-gray-700' : 'text-gray-400'}`}>
                  {sert.label}
                </span>
                <span className="text-xs text-gray-300 font-mono ml-auto">{sert.kode}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
          <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
            <Info className="w-3 h-3" /> Catatan
          </p>
          <p className="text-xs text-blue-800 leading-relaxed">{item.catatan}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Phone className="w-3 h-3 flex-shrink-0" />
          <span>{item.kontak}</span>
        </div>

        <p className="text-xs text-gray-400 border-t border-gray-100 pt-2">
          Sumber: {item.sumberData}
        </p>
      </div>
    </div>
  );
}

// ── Custom Nursery Detail Panel ───────────────────────────────────────────────
function CustomDetailPanel({
  item, onClose, onDelete, isAdmin,
}: { item: CustomNursery; onClose: () => void; onDelete: (id: string) => void; isAdmin: boolean }) {
  return (
    <div className="bg-white border-2 border-purple-300 rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-purple-100 flex items-start gap-3 bg-purple-50">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-purple-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-800 leading-tight">{item.nama}</h3>
          <p className="text-xs text-purple-600 mt-0.5">Ditambahkan Admin</p>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {item.kabKota}, {item.provinsi}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
            <p className="text-xs text-gray-500 mb-0.5">Kapasitas/Tahun</p>
            <p className="text-sm font-bold text-gray-800">{item.kapasitasBibit.toLocaleString('id-ID')}</p>
            <p className="text-xs text-gray-400">bibit</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
            <p className="text-xs text-gray-500 mb-0.5">Institusi</p>
            <p className="text-xs font-semibold text-gray-700 leading-tight">{item.institusi || '—'}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
          <p className="text-xs font-semibold text-[#0d404f] mb-1">Sertifikat Bibit</p>
          <p className="text-xs text-green-800">{item.sertifikat}</p>
        </div>
        <a
          href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg w-fit"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Lihat Lokasi di Google Maps
        </a>
        <div className="text-xs text-gray-400 border-t border-gray-100 pt-2 flex justify-between">
          <span>Ditambahkan oleh: {item.addedBy}</span>
          <span>{new Date(item.addedAt).toLocaleDateString('id-ID')}</span>
        </div>
        {isAdmin && (
          <button
            onClick={() => { onDelete(item.id); onClose(); }}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-medium border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus Lokasi Ini
          </button>
        )}
      </div>
    </div>
  );
}

// ── Admin Add Form ────────────────────────────────────────────────────────────
interface AddForm {
  nama: string; institusi: string; sertifikat: string;
  kapasitas: string; provinsi: string; kabKota: string;
  lat: string; lng: string;
}
const INIT_FORM: AddForm = {
  nama: '', institusi: '', sertifikat: '', kapasitas: '',
  provinsi: '', kabKota: '', lat: '', lng: '',
};

function AdminAddPanel({ onAdd, onClose, adminNama }: {
  onAdd: (n: CustomNursery) => void; onClose: () => void; adminNama: string;
}) {
  const [form, setForm] = useState<AddForm>(INIT_FORM);
  const [err, setErr] = useState('');
  const f = (k: keyof AddForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const cls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600';

  const handleSave = () => {
    if (!form.nama.trim()) { setErr('Nama lokasi wajib diisi.'); return; }
    if (!form.sertifikat.trim()) { setErr('Keterangan sertifikat wajib diisi.'); return; }
    if (!form.kapasitas || isNaN(Number(form.kapasitas))) { setErr('Kapasitas harus berupa angka.'); return; }
    if (!form.lat || !form.lng || isNaN(parseFloat(form.lat)) || isNaN(parseFloat(form.lng))) {
      setErr('Koordinat (lat/lng) wajib diisi dengan angka valid.'); return;
    }
    const nursery: CustomNursery = {
      id: `CUSTOM-${Date.now()}`,
      nama: form.nama.trim(),
      institusi: form.institusi.trim(),
      sertifikat: form.sertifikat.trim(),
      kapasitasBibit: Math.round(Number(form.kapasitas)),
      provinsi: form.provinsi.trim(),
      kabKota: form.kabKota.trim(),
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      addedBy: adminNama,
      addedAt: new Date().toISOString(),
    };
    saveCustomNursery(nursery);
    onAdd(nursery);
  };

  return (
    <div className="bg-white border-2 border-purple-300 rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-purple-100 bg-purple-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-700" />
          <p className="text-sm font-bold text-purple-800">Tambah Lokasi Pembibitan</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {err && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>
        )}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lokasi *</label>
          <input value={form.nama} onChange={f('nama')} placeholder="cth: Nursery Mangrove Desa Sidoarjo" className={cls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Institusi / Pengelola</label>
          <input value={form.institusi} onChange={f('institusi')} placeholder="cth: Dinas LHK Kab. Sidoarjo" className={cls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Sertifikat Bibit (dari mana) *</label>
          <input value={form.sertifikat} onChange={f('sertifikat')}
            placeholder="cth: Sertifikat BRGM No. 012/2024, SNI 7604:2011 verified Dinas LHK Jatim"
            className={cls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kapasitas Bibit/Tahun *</label>
            <input type="number" min="0" value={form.kapasitas} onChange={f('kapasitas')}
              placeholder="cth: 50000" className={cls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Provinsi</label>
            <input value={form.provinsi} onChange={f('provinsi')} placeholder="cth: Jawa Timur" className={cls} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Kabupaten / Kota</label>
          <input value={form.kabKota} onChange={f('kabKota')} placeholder="cth: Kab. Sidoarjo" className={cls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Koordinat Lat *</label>
            <input type="number" step="any" value={form.lat} onChange={f('lat')} placeholder="-7.4583" className={cls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Koordinat Lng *</label>
            <input type="number" step="any" value={form.lng} onChange={f('lng')} placeholder="112.7164" className={cls} />
          </div>
        </div>
        {form.lat && form.lng && !isNaN(parseFloat(form.lat)) && !isNaN(parseFloat(form.lng)) && (
          <a
            href={`https://www.google.com/maps?q=${form.lat},${form.lng}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            <ExternalLink className="w-3 h-3" /> Verifikasi koordinat di Google Maps
          </a>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Simpan Lokasi
          </button>
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type SelectedItem =
  | { type: 'static'; item: PembibitanMangrove }
  | { type: 'custom'; item: CustomNursery };

export default function PembibitanMangroveePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'verifikator';

  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [customNurseries, setCustomNurseries] = useState<CustomNursery[]>(() => getCustomNurseries());
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusPembibitan | 'semua'>('semua');
  const [filterPulau, setFilterPulau] = useState<PulauPembibitan | 'semua'>('semua');
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = pembibitanData.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.nama.toLowerCase().includes(q)
      || p.provinsi.toLowerCase().includes(q)
      || p.kabKota.toLowerCase().includes(q)
      || p.institusi.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'semua' || p.status === filterStatus;
    const matchPulau = filterPulau === 'semua' || p.pulau === filterPulau;
    return matchSearch && matchStatus && matchPulau;
  });

  const filteredCustom = customNurseries.filter(p => {
    const q = search.toLowerCase();
    return !q || p.nama.toLowerCase().includes(q) || p.provinsi.toLowerCase().includes(q);
  });

  const pulauList: PulauPembibitan[] = ['Sumatera', 'Jawa', 'Kalimantan', 'Sulawesi', 'Papua', 'Bali & NTT'];

  const handleSelectStatic = (item: PembibitanMangrove) => {
    setSelectedItem({ type: 'static', item });
    setFlyTarget({ lat: item.lat, lng: item.lng });
    setShowAddForm(false);
  };

  const handleSelectCustom = (item: CustomNursery) => {
    setSelectedItem({ type: 'custom', item });
    setFlyTarget({ lat: item.lat, lng: item.lng });
    setShowAddForm(false);
  };

  const handleAdded = (n: CustomNursery) => {
    setCustomNurseries(getCustomNurseries());
    setFlyTarget({ lat: n.lat, lng: n.lng });
    setShowAddForm(false);
    setSelectedItem({ type: 'custom', item: n });
  };

  const handleDeleteCustom = (id: string) => {
    deleteCustomNursery(id);
    setCustomNurseries(getCustomNurseries());
    setSelectedItem(null);
  };

  const totalCapacity = pembibitanSummary.totalKapasitas
    + customNurseries.reduce((s, n) => s + n.kapasitasBibit, 0);
  const totalCount = pembibitanSummary.total + customNurseries.length;

  return (
    <div className="space-y-4">
      {/* KPI bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Nursery', value: totalCount, sub: 'terdaftar', color: 'text-[#0d404f]', bg: 'bg-[#0d404f]/10 border-[#0d404f]/25' },
          { label: 'Aktif Tersertifikasi', value: pembibitanSummary.aktif, sub: 'nursery resmi', color: 'text-[#0d404f]', bg: 'bg-[#0d404f]/10 border-[#0d404f]/25' },
          { label: 'Total Kapasitas', value: (totalCapacity / 1000000).toFixed(1) + ' Jt', sub: 'bibit/tahun', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Provinsi Tercakup', value: pembibitanSummary.provinsiCount, sub: 'provinsi', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
        ].map(k => (
          <div key={k.label} className={`border rounded-xl px-4 py-3 ${k.bg}`}>
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-400">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Source note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          Data pembibitan bersumber dari <strong>BRGM, KLHK Ditjen PDASRH, KKP, dan UPT Daerah</strong> per 2025.
          Sertifikasi mengacu pada SNI 7604:2011 dan regulasi BRGM (Perpres 120/2020).
          {isAdmin && <span className="ml-1 text-purple-700 font-semibold">Admin dapat menambah lokasi yang dipercaya via tombol + di bawah.</span>}
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama nursery, provinsi, institusi..."
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            />
          </div>
          <button onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters ? 'bg-[#071520] text-white border-[#071520]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            <Filter className="w-3.5 h-3.5" />
            Filter
            {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {isAdmin && (
            <button
              onClick={() => { setShowAddForm(p => !p); setSelectedItem(null); }}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-bold transition-colors ${
                showAddForm ? 'bg-purple-700 text-white border-purple-700' : 'border-purple-300 text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah
            </button>
          )}
        </div>
        {showFilters && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
              <select value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as StatusPembibitan | 'semua')}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-green-600">
                <option value="semua">Semua Status</option>
                <option value="aktif">Aktif Tersertifikasi</option>
                <option value="dalam_verifikasi">Dalam Verifikasi</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Pulau</label>
              <select value={filterPulau}
                onChange={e => setFilterPulau(e.target.value as PulauPembibitan | 'semua')}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-green-600">
                <option value="semua">Semua Pulau</option>
                {pulauList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400">
          Menampilkan {filtered.length} dari {pembibitanData.length} nursery resmi
          {filteredCustom.length > 0 && ` + ${filteredCustom.length} ditambahkan admin`}
        </p>
      </div>

      {/* Map + Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* MAP */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden h-72 sm:h-96 lg:h-[520px]">
            <MapContainer
              center={[-2.5, 118]}
              zoom={4}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {flyTarget && <MapFlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}

              {/* Static nurseries */}
              {filtered.map(item => {
                const color = getStatusColor(item.status);
                const isSelected = selectedItem?.type === 'static' && selectedItem.item.id === item.id;
                return (
                  <CircleMarker
                    key={item.id}
                    center={[item.lat, item.lng]}
                    radius={isSelected ? 14 : 9}
                    pathOptions={{
                      color: isSelected ? '#fff' : color,
                      fillColor: color,
                      fillOpacity: isSelected ? 1 : 0.75,
                      weight: isSelected ? 3 : 1.5,
                    }}
                    eventHandlers={{ click: () => handleSelectStatic(item) }}
                  >
                    <Popup maxWidth={260}>
                      <div className="space-y-1 py-1">
                        <p className="font-bold text-sm text-gray-800 leading-tight">{item.nama}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{item.kabKota}, {item.provinsi}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: color }}>
                            {getStatusLabel(item.status)}
                          </span>
                          <span className="text-xs text-gray-500">{countSertified(item.sertifikasi)}/{item.sertifikasi.length} sertifikat</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Kapasitas: <strong>{item.kapasitasBibit.toLocaleString('id-ID')}</strong> bibit/tahun
                        </p>
                        <a href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline">
                          <ExternalLink className="w-3 h-3" /> Google Maps
                        </a>
                        <button onClick={() => handleSelectStatic(item)}
                          className="text-xs text-[#0d404f] font-semibold hover:text-[#f06424] hover:underline">
                          Lihat Detail →
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* Custom nurseries — purple markers */}
              {filteredCustom.map(item => {
                const isSelected = selectedItem?.type === 'custom' && selectedItem.item.id === item.id;
                return (
                  <CircleMarker
                    key={item.id}
                    center={[item.lat, item.lng]}
                    radius={isSelected ? 14 : 9}
                    pathOptions={{
                      color: isSelected ? '#fff' : '#7c3aed',
                      fillColor: '#7c3aed',
                      fillOpacity: isSelected ? 1 : 0.8,
                      weight: isSelected ? 3 : 2,
                      dashArray: '4 2',
                    }}
                    eventHandlers={{ click: () => handleSelectCustom(item) }}
                  >
                    <Popup maxWidth={240}>
                      <div className="space-y-1 py-1">
                        <p className="font-bold text-sm text-gray-800 leading-tight">{item.nama}</p>
                        <p className="text-xs text-purple-600 font-medium">Ditambahkan Admin</p>
                        <p className="text-xs text-gray-500">{item.kabKota}, {item.provinsi}</p>
                        <p className="text-xs text-gray-500">
                          Kapasitas: <strong>{item.kapasitasBibit.toLocaleString('id-ID')}</strong> bibit/tahun
                        </p>
                        <p className="text-xs text-gray-600 italic">{item.sertifikat}</p>
                        <a href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline">
                          <ExternalLink className="w-3 h-3" /> Google Maps
                        </a>
                        <button onClick={() => handleSelectCustom(item)}
                          className="text-xs text-purple-700 font-semibold hover:underline">
                          Detail →
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="mt-2 flex items-center gap-4 flex-wrap px-1">
            {[
              { color: '#16a34a', label: 'Aktif Tersertifikasi' },
              { color: '#d97706', label: 'Dalam Verifikasi' },
              { color: '#6b7280', label: 'Tidak Aktif' },
              { color: '#7c3aed', label: 'Ditambahkan Admin', dash: true },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${l.dash ? 'border-2 border-dashed' : ''}`}
                  style={{ backgroundColor: l.color, borderColor: l.dash ? l.color : undefined }} />
                <span className="text-xs text-gray-500">{l.label}</span>
              </div>
            ))}
            <span className="text-xs text-gray-400 ml-auto">Klik marker untuk detail</span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-3">
          {/* Admin add form */}
          {showAddForm && isAdmin && (
            <AdminAddPanel
              onAdd={handleAdded}
              onClose={() => setShowAddForm(false)}
              adminNama={user?.nama ?? 'Admin'}
            />
          )}

          {/* Detail: static */}
          {!showAddForm && selectedItem?.type === 'static' && (
            <DetailPanel item={selectedItem.item} onClose={() => setSelectedItem(null)} />
          )}

          {/* Detail: custom */}
          {!showAddForm && selectedItem?.type === 'custom' && (
            <CustomDetailPanel
              item={selectedItem.item}
              onClose={() => setSelectedItem(null)}
              onDelete={handleDeleteCustom}
              isAdmin={isAdmin}
            />
          )}

          {/* Default list */}
          {!showAddForm && !selectedItem && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-700">Daftar Nursery</p>
                <span className="text-xs text-gray-400">{filtered.length + filteredCustom.length} lokasi</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-[470px] overflow-y-auto">
                {/* Custom nurseries first */}
                {filteredCustom.map(item => (
                  <button key={item.id} onClick={() => handleSelectCustom(item)}
                    className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-purple-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{item.nama}</p>
                        <p className="text-xs text-purple-500 mt-0.5">Admin · {item.provinsi}</p>
                        <p className="text-xs text-gray-400">{(item.kapasitasBibit / 1000).toFixed(0)}k bibit/thn</p>
                      </div>
                    </div>
                  </button>
                ))}
                {/* Static nurseries */}
                {filtered.length === 0 && filteredCustom.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-gray-400">Tidak ada data sesuai filter</div>
                )}
                {filtered.map(item => {
                  const color = getStatusColor(item.status);
                  return (
                    <button key={item.id} onClick={() => handleSelectStatic(item)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{item.nama}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.kabKota}, {item.provinsi}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{countSertified(item.sertifikasi)}/{item.sertifikasi.length} sertifikat</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500">{(item.kapasitasBibit / 1000).toFixed(0)}k bibit/thn</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mini list when detail is open */}
          {!showAddForm && selectedItem && filtered.length + filteredCustom.length > 1 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500">Lokasi Lainnya</p>
              </div>
              <div className="divide-y divide-gray-100 max-h-52 overflow-y-auto">
                {filteredCustom.filter(p => !(selectedItem.type === 'custom' && p.id === selectedItem.item.id)).map(item => (
                  <button key={item.id} onClick={() => handleSelectCustom(item)}
                    className="w-full text-left px-3 py-2.5 hover:bg-purple-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0 bg-purple-600" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{item.nama}</p>
                        <p className="text-xs text-purple-400">Admin</p>
                      </div>
                    </div>
                  </button>
                ))}
                {filtered.filter(p => !(selectedItem.type === 'static' && p.id === selectedItem.item.id)).map(item => {
                  const color = getStatusColor(item.status);
                  return (
                    <button key={item.id} onClick={() => handleSelectStatic(item)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">{item.nama}</p>
                          <p className="text-xs text-gray-400">{item.provinsi}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary by pulau */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-bold text-gray-700 mb-3">Distribusi per Pulau</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pulauList.map(pulau => {
            const items = pembibitanData.filter(p => p.pulau === pulau);
            const aktifCount = items.filter(p => p.status === 'aktif').length;
            const kapasitas = items.reduce((sum, p) => sum + p.kapasitasBibit, 0);
            return (
              <button key={pulau}
                onClick={() => setFilterPulau(pulau === filterPulau ? 'semua' : pulau)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  filterPulau === pulau
                    ? 'bg-green-50 border-green-300 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                <p className="text-xs font-semibold text-gray-700 leading-tight">{pulau}</p>
                <p className="text-xl font-bold text-[#0d404f] mt-1">{items.length}</p>
                <p className="text-xs text-gray-400">nursery</p>
                <p className="text-xs text-gray-500 mt-0.5">{aktifCount} aktif</p>
                <p className="text-xs text-gray-400">{(kapasitas / 1000).toFixed(0)}k bibit/thn</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
