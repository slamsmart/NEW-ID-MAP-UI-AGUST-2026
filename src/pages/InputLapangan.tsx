import { useState, useEffect, useRef } from 'react';
import {
  ClipboardList, MapPin, Leaf, Waves, Users, Camera,
  CheckCircle, ChevronRight, ChevronLeft, Save, AlertCircle, Plus, X,
  Navigation, Loader2, Upload, WifiOff, Wifi, Trash2,
} from 'lucide-react';
import { mangroveLocations } from '../data/mockData';
import { kkpdLocations } from '../data/kkpdData';
import { PROVINSI_LIST, KABKOTA_BY_PROVINSI } from '../data/wilayahIndonesia';
import { getCustomLocations, saveCustomLocation, saveSurvey } from '../data/localStore';
import { useAuth } from '../context/AuthContext';
import { uploadPhoto, fileToDataUrl, isCloudinaryConfigured } from '../lib/cloudinary';
import { enqueueSurvey, enqueueLocation } from '../lib/offlineQueue';
import type { MangroveLocation } from '../types';
import type { DbLocation } from '../lib/supabase';

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  namaPetugas: string;
  nip: string;
  unitKerja: string;
  tanggal: string;
  locationId: string;
  metodeSurvei: string;
  koordinatLat: string;
  koordinatLng: string;
  tutupanTajuk: string;
  kerapatanEstimasi: string;
  spesiesDominan: string;
  spesiesLain: string;
  lajuRegenerasi: string;
  kondisiSerasah: string;
  salinitas: string;
  ph: string;
  suhu: string;
  kekeruhan: string;
  substrat: string;
  elevasi: string;
  pasangSurut: string;
  ancamanUtama: string[];
  jarakPemukiman: string;
  luasTambakEstimasi: string;
  aktivitasManusia: string;
  statusTenurial: string;
  kondisiUmum: string;
  rekomendasiLapangan: string;
  fotoDokumentasi: string;
}

interface NewLocForm {
  name: string;
  district: string;
  province: string;
  areaHa: string;
  kawasan: MangroveLocation['kawasan'];
}

const INIT_FORM: FormData = {
  namaPetugas: '', nip: '', unitKerja: 'Tim Survei Lapangan',
  tanggal: new Date().toISOString().split('T')[0],
  locationId: '', metodeSurvei: 'ground_check',
  koordinatLat: '', koordinatLng: '',
  tutupanTajuk: '', kerapatanEstimasi: '',
  spesiesDominan: 'Rhizophora apiculata', spesiesLain: '',
  lajuRegenerasi: 'sedang', kondisiSerasah: 'normal',
  salinitas: '', ph: '', suhu: '', kekeruhan: '',
  substrat: 'lumpur', elevasi: '', pasangSurut: '',
  ancamanUtama: [], jarakPemukiman: '', luasTambakEstimasi: '',
  aktivitasManusia: '', statusTenurial: 'aman',
  kondisiUmum: '', rekomendasiLapangan: '', fotoDokumentasi: '',
};

const INIT_NEW_LOC: NewLocForm = {
  name: '', district: '', province: '', areaHa: '', kawasan: 'apl',
};

const ANCAMAN_OPTIONS = [
  'Konversi tambak', 'Penebangan liar', 'Pembuangan sampah',
  'Abrasi pantai', 'Sedimentasi tinggi', 'Pencemaran industri',
  'Perambahan pemukiman', 'Penangkapan ikan destruktif',
];

const STEPS = [
  { id: 1, label: 'Identitas', icon: ClipboardList },
  { id: 2, label: 'Ekosistem', icon: Leaf },
  { id: 3, label: 'Lingkungan', icon: Waves },
  { id: 4, label: 'Tekanan', icon: Users },
  { id: 5, label: 'Dokumentasi', icon: Camera },
];

function InputGroup({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Inp({ value, onChange, placeholder, type = 'text', min, max, step }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; min?: string; max?: string; step?: string;
}) {
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} min={min} max={max} step={step}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
    />
  );
}

function Sel({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
    >
      {children}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none"
    />
  );
}

interface PhotoEntry {
  file?: File;
  preview: string;       // data URL untuk preview
  url?: string;          // Cloudinary URL setelah upload
  tag: string;
  uploading: boolean;
  error?: string;
}

export default function InputLapangan() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    ...INIT_FORM,
    namaPetugas: user?.nama ?? '',
    nip: user?.nip ?? '',
    unitKerja: user?.unit ?? 'Tim Survei Lapangan',
  });
  const [submitted, setSubmitted] = useState(false);
  const [customLocs, setCustomLocs] = useState<MangroveLocation[]>([]);
  const [showNewLoc, setShowNewLoc] = useState(false);
  const [newLoc, setNewLoc] = useState<NewLocForm>(INIT_NEW_LOC);
  const [newLocError, setNewLocError] = useState('');

  // GPS state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState('');

  // Photo state
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved_online' | 'saved_offline'>('idle');

  useEffect(() => {
    setCustomLocs(getCustomLocations());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // GPS: ambil koordinat dari satelit (tidak butuh internet)
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Browser tidak mendukung GPS.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          koordinatLat: pos.coords.latitude.toFixed(6),
          koordinatLng: pos.coords.longitude.toFixed(6),
        }));
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(
          err.code === 1 ? 'Izin GPS ditolak. Aktifkan di pengaturan browser.' :
          err.code === 2 ? 'Sinyal GPS lemah. Pindah ke luar ruangan.' :
          'Timeout GPS. Coba lagi di area terbuka.'
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  // Foto: tambah dari file picker
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (photos.length + files.length > 5) {
      alert('Maksimum 5 foto.');
      return;
    }
    for (const file of files) {
      const preview = await fileToDataUrl(file);
      const entry: PhotoEntry = { file, preview, tag: 'Kondisi Umum', uploading: false };
      setPhotos(prev => [...prev, entry]);

      // Upload ke Cloudinary jika online
      if (isOnline && isCloudinaryConfigured()) {
        setPhotos(prev => prev.map(p => p.preview === preview ? { ...p, uploading: true } : p));
        try {
          const result = await uploadPhoto(file);
          setPhotos(prev => prev.map(p => p.preview === preview ? { ...p, url: result.url, uploading: false } : p));
        } catch (err) {
          setPhotos(prev => prev.map(p => p.preview === preview ? { ...p, uploading: false, error: 'Upload gagal — akan dicoba saat online' } : p));
        }
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const allLocations = [...mangroveLocations, ...kkpdLocations, ...customLocs];

  const set = (key: keyof FormData) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const setNL = (key: keyof NewLocForm) => (val: string) =>
    setNewLoc(prev => ({ ...prev, [key]: val }));

  const toggleAncaman = (item: string) => {
    setForm(prev => ({
      ...prev,
      ancamanUtama: prev.ancamanUtama.includes(item)
        ? prev.ancamanUtama.filter(a => a !== item)
        : [...prev.ancamanUtama, item],
    }));
  };

  const handleAddLocation = async () => {
    if (!newLoc.name.trim() || !newLoc.district.trim() || !newLoc.province.trim()) {
      setNewLocError('Nama lokasi, kabupaten, dan provinsi wajib diisi.');
      return;
    }
    // Gunakan koordinat GPS dari form utama jika sudah diambil
    const lat = parseFloat(form.koordinatLat) || 0;
    const lng = parseFloat(form.koordinatLng) || 0;
    const id = `LOC-CUSTOM-${Date.now()}`;
    const loc: MangroveLocation = {
      id,
      name: newLoc.name.trim(),
      district: newLoc.district.trim(),
      province: newLoc.province.trim(),
      lat, lng,
      areaHa: parseFloat(newLoc.areaHa) || 0,
      status: 'sedang',
      kawasan: newLoc.kawasan,
      lastSurvey: new Date().toISOString().split('T')[0],
    };
    // Simpan ke localStorage
    saveCustomLocation(loc);
    // Sinkron ke Supabase (atau queue jika offline)
    const dbLoc: DbLocation = {
      id, name: loc.name, province: loc.province, district: loc.district,
      lat, lng, area_ha: loc.areaHa, status: loc.status, kawasan: loc.kawasan,
      last_survey: loc.lastSurvey, is_custom: true,
      created_by: user?.nama ?? null, created_at: new Date().toISOString(),
    };
    await enqueueLocation(dbLoc);

    const updated = [...customLocs, loc];
    setCustomLocs(updated);
    setForm(prev => ({ ...prev, locationId: id, koordinatLat: String(lat), koordinatLng: String(lng) }));
    setNewLoc(INIT_NEW_LOC);
    setShowNewLoc(false);
    setNewLocError('');
  };

  const handleSubmit = async () => {
    setSavingStatus('saving');
    const loc = allLocations.find(l => l.id === form.locationId);
    const isCustom = customLocs.some(l => l.id === form.locationId);
    const surveyId = `SRV-${Date.now()}`;
    const photoUrls = photos.filter(p => p.url).map(p => p.url!);

    // Simpan ke localStorage (legacy — untuk backward compat)
    saveSurvey({
      id: surveyId,
      timestamp: new Date().toISOString(),
      namaPetugas: form.namaPetugas,
      unit: form.unitKerja,
      locationId: form.locationId,
      locationName: loc?.name ?? form.locationId,
      province: loc?.province ?? '—',
      tutupanTajuk: form.tutupanTajuk,
      kerapatan: form.kerapatanEstimasi,
      salinitas: form.salinitas,
      ancamanCount: form.ancamanUtama.length,
      kondisiUmum: form.kondisiUmum,
      isCustomLoc: isCustom,
    });

    // Sinkron ke Supabase dengan offline fallback
    const result = await enqueueSurvey({
      id: surveyId,
      petugas_nama: form.namaPetugas,
      petugas_nip: form.nip || null,
      petugas_unit: form.unitKerja,
      location_id: form.locationId,
      location_name: loc?.name ?? form.locationId,
      province: loc?.province ?? '—',
      tanggal: form.tanggal,
      metode_survei: form.metodeSurvei,
      koordinat_lat: parseFloat(form.koordinatLat) || null,
      koordinat_lng: parseFloat(form.koordinatLng) || null,
      gps_accuracy: gpsAccuracy,
      tutupan_tajuk: parseFloat(form.tutupanTajuk) || null,
      kerapatan_estimasi: parseFloat(form.kerapatanEstimasi) || null,
      spesies_dominan: form.spesiesDominan || null,
      spesies_lain: form.spesiesLain || null,
      laju_regenerasi: form.lajuRegenerasi || null,
      kondisi_serasah: form.kondisiSerasah || null,
      salinitas: parseFloat(form.salinitas) || null,
      ph: parseFloat(form.ph) || null,
      suhu: parseFloat(form.suhu) || null,
      kekeruhan: parseFloat(form.kekeruhan) || null,
      substrat: form.substrat || null,
      elevasi: parseFloat(form.elevasi) || null,
      pasang_surut: form.pasangSurut || null,
      ancaman_utama: form.ancamanUtama,
      jarak_pemukiman: parseFloat(form.jarakPemukiman) || null,
      luas_tambak_estimasi: parseFloat(form.luasTambakEstimasi) || null,
      aktivitas_manusia: form.aktivitasManusia || null,
      status_tenurial: form.statusTenurial || null,
      kondisi_umum: form.kondisiUmum || null,
      rekomendasi_lapangan: form.rekomendasiLapangan || null,
      photo_urls: photoUrls,
      sync_status: 'pending',
    });

    setSavingStatus(result.offline ? 'saved_offline' : 'saved_online');
    setSubmitted(true);
  };

  if (submitted) {
    const loc = allLocations.find(l => l.id === form.locationId);
    const isOfflineSave = savingStatus === 'saved_offline';
    const nomorBA = `BA-MG/${form.tanggal.replace(/-/g, '')}/${(form.unitKerja || 'DKP').replace(/\s+/g, '').substring(0, 6).toUpperCase()}`;
    const formatTanggal = (iso: string) => {
      const [y, m, d] = iso.split('-');
      const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      return `${d} ${bulan[parseInt(m) - 1]} ${y}`;
    };
    return (
      <div className="max-w-2xl mx-auto">
        {/* ── Tampilan layar (disembunyikan saat print) ── */}
        <div className="no-print bg-white border border-gray-200 rounded-xl p-10 text-center">
          <div className={`w-16 h-16 ${isOfflineSave ? 'bg-amber-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {isOfflineSave
              ? <WifiOff className="w-8 h-8 text-amber-600" />
              : <CheckCircle className="w-8 h-8 text-green-600" />
            }
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {isOfflineSave ? 'Data Tersimpan (Mode Offline)' : 'Data Berhasil Disimpan'}
          </h2>
          {isOfflineSave && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-xs text-amber-800 text-left">
              <p className="font-semibold mb-1">Data tersimpan di perangkat ini.</p>
              <p>Akan otomatis tersinkronisasi ke server Supabase saat koneksi internet tersedia kembali. Pastikan buka aplikasi saat ada sinyal.</p>
            </div>
          )}
          <p className="text-gray-500 text-sm mb-1">
            Survey lapangan oleh <strong>{form.namaPetugas}</strong>
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Lokasi: <strong>{loc?.name || form.locationId}</strong> · {form.tanggal}
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left mb-6">
            <p className="text-xs font-bold text-green-800 mb-2">Ringkasan Data Lapangan</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
              <div>Tutupan Tajuk: <strong>{form.tutupanTajuk}%</strong></div>
              <div>Kerapatan: <strong>{form.kerapatanEstimasi} phn/ha</strong></div>
              <div>Salinitas: <strong>{form.salinitas} ppt</strong></div>
              <div>Substrat: <strong className="capitalize">{form.substrat}</strong></div>
              <div>pH Air: <strong>{form.ph}</strong></div>
              <div>Suhu: <strong>{form.suhu}°C</strong></div>
              <div>Ancaman: <strong>{form.ancamanUtama.length} jenis</strong></div>
              <div>Status Lahan: <strong className="capitalize">{form.statusTenurial}</strong></div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({ ...INIT_FORM, namaPetugas: user?.nama ?? '', nip: user?.nip ?? '', unitKerja: user?.unit ?? 'Tim Survei Lapangan' });
                setStep(1);
              }}
              className="px-5 py-2 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors"
            >
              Input Data Baru
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cetak Berita Acara
            </button>
          </div>
        </div>

        {/* ── BERITA ACARA (hanya tampil saat print) ── */}
        <div className="print-only" style={{ fontFamily: 'Times New Roman, serif', fontSize: '11pt', color: '#000', lineHeight: '1.5' }}>
          {/* KOP SURAT */}
          <div style={{ borderBottom: '3px solid #14532d', paddingBottom: '10px', marginBottom: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '9pt', margin: 0 }}>PEMERINTAH DAERAH — DINAS KELAUTAN DAN PERIKANAN</p>
            <p style={{ fontSize: '13pt', fontWeight: 'bold', margin: '2px 0' }}>{form.unitKerja.toUpperCase()}</p>
            <p style={{ fontSize: '8pt', color: '#555', margin: 0 }}>Sistem Informasi Survei Mangrove — Platform ID-MAP</p>
          </div>

          {/* JUDUL */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '13pt', fontWeight: 'bold', textDecoration: 'underline', margin: '0 0 4px 0' }}>BERITA ACARA SURVEI LAPANGAN MANGROVE</p>
            <p style={{ fontSize: '10pt', margin: 0 }}>Nomor: {nomorBA}</p>
          </div>

          {/* PEMBUKAAN */}
          <p style={{ marginBottom: '12px', textAlign: 'justify' }}>
            Pada hari ini, <strong>{formatTanggal(form.tanggal)}</strong>, telah dilaksanakan survei lapangan ekosistem mangrove
            di kawasan <strong>{loc?.name || '—'}</strong>, {loc?.district && `Kabupaten/Kota ${loc.district}, `}Provinsi {loc?.province || '—'}.
            Survei dilaksanakan oleh petugas berikut:
          </p>

          {/* BIODATA PETUGAS */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '10pt' }}>
            <tbody>
              {[
                ['Nama Petugas', form.namaPetugas || '—'],
                ['NIP', form.nip || '—'],
                ['Unit Kerja / Instansi', form.unitKerja || '—'],
                ['Tanggal Pelaksanaan', formatTanggal(form.tanggal)],
                ['Metode Survei', form.metodeSurvei.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())],
              ].map(([label, val]) => (
                <tr key={label}>
                  <td style={{ width: '35%', padding: '4px 8px', border: '1px solid #ccc', backgroundColor: '#f0fdf4', fontWeight: 'bold' }}>{label}</td>
                  <td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* LOKASI SURVEI */}
          <p style={{ fontWeight: 'bold', borderBottom: '1px solid #14532d', paddingBottom: '3px', marginBottom: '8px', color: '#14532d' }}>A. INFORMASI LOKASI</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '10pt' }}>
            <tbody>
              {[
                ['Nama Kawasan', loc?.name || '—'],
                ['Kabupaten / Kota', loc?.district || '—'],
                ['Provinsi', loc?.province || '—'],
                ['Koordinat GPS', form.koordinatLat && form.koordinatLng ? `${form.koordinatLat}°, ${form.koordinatLng}°` : 'Tidak direkam'],
                ['Status Kawasan', loc?.kawasan === 'konservasi' ? 'Kawasan Konservasi' : loc?.kawasan === 'hutan_lindung' ? 'Hutan Lindung' : 'APL (Area Penggunaan Lain)'],
                ['Luas Kawasan (estimasi)', loc?.areaHa ? `${loc.areaHa.toLocaleString('id-ID')} ha` : '—'],
              ].map(([label, val]) => (
                <tr key={label}>
                  <td style={{ width: '35%', padding: '4px 8px', border: '1px solid #ccc', backgroundColor: '#f0fdf4', fontWeight: 'bold' }}>{label}</td>
                  <td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* DATA EKOSISTEM */}
          <p style={{ fontWeight: 'bold', borderBottom: '1px solid #14532d', paddingBottom: '3px', marginBottom: '8px', color: '#14532d' }}>B. DATA KONDISI EKOSISTEM MANGROVE</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '10pt' }}>
            <tbody>
              {[
                ['Tutupan Tajuk (%)', form.tutupanTajuk ? `${form.tutupanTajuk}%` : '—'],
                ['Kerapatan Pohon (pohon/ha)', form.kerapatanEstimasi || '—'],
                ['Spesies Dominan', form.spesiesDominan || '—'],
                ['Spesies Lain', form.spesiesLain || '—'],
                ['Laju Regenerasi Alami', form.lajuRegenerasi === 'tinggi' ? 'Tinggi — banyak semai/pancang alami' : form.lajuRegenerasi === 'sedang' ? 'Sedang — semai cukup tersedia' : 'Rendah — minim semai/regenerasi'],
                ['Kondisi Serasah / Litter', form.kondisiSerasah === 'lebat' ? 'Lebat (ekosistem sehat)' : form.kondisiSerasah === 'normal' ? 'Normal' : 'Minim (potensi degradasi)'],
              ].map(([label, val]) => (
                <tr key={label}>
                  <td style={{ width: '35%', padding: '4px 8px', border: '1px solid #ccc', backgroundColor: '#f0fdf4', fontWeight: 'bold' }}>{label}</td>
                  <td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* DATA LINGKUNGAN */}
          <p style={{ fontWeight: 'bold', borderBottom: '1px solid #14532d', paddingBottom: '3px', marginBottom: '8px', color: '#14532d' }}>C. DATA PARAMETER LINGKUNGAN</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '10pt' }}>
            <tbody>
              {[
                ['Salinitas (ppt)', form.salinitas || '—'],
                ['pH Air', form.ph || '—'],
                ['Suhu Air (°C)', form.suhu || '—'],
                ['Kekeruhan (NTU)', form.kekeruhan || '—'],
                ['Jenis Substrat', form.substrat ? form.substrat.charAt(0).toUpperCase() + form.substrat.slice(1) : '—'],
                ['Elevasi (m dpl)', form.elevasi || '—'],
                ['Kondisi Pasang Surut', form.pasangSurut || '—'],
              ].map(([label, val]) => (
                <tr key={label}>
                  <td style={{ width: '35%', padding: '4px 8px', border: '1px solid #ccc', backgroundColor: '#f0fdf4', fontWeight: 'bold' }}>{label}</td>
                  <td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TEKANAN & ANCAMAN */}
          <p style={{ fontWeight: 'bold', borderBottom: '1px solid #14532d', paddingBottom: '3px', marginBottom: '8px', color: '#14532d' }}>D. TEKANAN DAN ANCAMAN EKOSISTEM</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '10pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '35%', padding: '4px 8px', border: '1px solid #ccc', backgroundColor: '#f0fdf4', fontWeight: 'bold' }}>Ancaman yang Teridentifikasi</td>
                <td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>
                  {form.ancamanUtama.length > 0 ? form.ancamanUtama.join('; ') : 'Tidak ada ancaman teridentifikasi'}
                </td>
              </tr>
              {[
                ['Jarak ke Pemukiman Terdekat (m)', form.jarakPemukiman || '—'],
                ['Estimasi Luas Tambak di Sekitar (ha)', form.luasTambakEstimasi || '—'],
                ['Aktivitas Manusia yang Terpantau', form.aktivitasManusia || '—'],
                ['Status Lahan', form.statusTenurial === 'aman' ? 'Aman — tidak ada konflik' : form.statusTenurial === 'proses_legal' ? 'Proses Legal — sedang diurus' : 'Bersengketa — konflik aktif'],
              ].map(([label, val]) => (
                <tr key={label}>
                  <td style={{ width: '35%', padding: '4px 8px', border: '1px solid #ccc', backgroundColor: '#f0fdf4', fontWeight: 'bold' }}>{label}</td>
                  <td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* KONDISI UMUM & REKOMENDASI */}
          <p style={{ fontWeight: 'bold', borderBottom: '1px solid #14532d', paddingBottom: '3px', marginBottom: '8px', color: '#14532d' }}>E. PENILAIAN KONDISI UMUM DAN REKOMENDASI</p>
          <p style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '4px' }}>Kondisi Umum Kawasan:</p>
          <p style={{ border: '1px solid #ccc', padding: '8px', minHeight: '60px', marginBottom: '10px', textAlign: 'justify', fontSize: '10pt' }}>
            {form.kondisiUmum || '—'}
          </p>
          <p style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '4px' }}>Rekomendasi Tindakan Lapangan:</p>
          <p style={{ border: '1px solid #ccc', padding: '8px', minHeight: '60px', marginBottom: '14px', textAlign: 'justify', fontSize: '10pt' }}>
            {form.rekomendasiLapangan || '—'}
          </p>

          {/* FOTO DOKUMENTASI */}
          {photos.length > 0 && (
            <div style={{ marginBottom: '14px', pageBreakInside: 'avoid' }}>
              <p style={{ fontWeight: 'bold', borderBottom: '1px solid #14532d', paddingBottom: '3px', marginBottom: '8px', color: '#14532d' }}>F. DOKUMENTASI FOTO LAPANGAN</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {photos.map((photo, i) => (
                  <div key={i} style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>
                    <img
                      src={photo.url || photo.preview}
                      alt={photo.tag}
                      style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                    />
                    <p style={{ fontSize: '8pt', marginTop: '3px', color: '#444' }}>{photo.tag}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TANDA TANGAN */}
          <div style={{ marginTop: '24px', pageBreakInside: 'avoid' }}>
            <p style={{ fontWeight: 'bold', borderBottom: '1px solid #14532d', paddingBottom: '3px', marginBottom: '14px', color: '#14532d' }}>G. PENGESAHAN</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '10pt' }}>
              <div style={{ textAlign: 'center' }}>
                <p>Petugas Pelaksana Survei,</p>
                <div style={{ height: '60px' }} />
                <p style={{ borderTop: '1px solid #000', paddingTop: '4px', margin: '0 20px' }}>
                  <strong>{form.namaPetugas || '___________________'}</strong>
                </p>
                <p style={{ fontSize: '9pt' }}>NIP. {form.nip || '___________________'}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p>Mengetahui,<br />Kepala Seksi Pengelolaan</p>
                <div style={{ height: '60px' }} />
                <p style={{ borderTop: '1px solid #000', paddingTop: '4px', margin: '0 20px' }}>
                  <strong>___________________________</strong>
                </p>
                <p style={{ fontSize: '9pt' }}>NIP. ___________________________</p>
              </div>
            </div>
            <p style={{ marginTop: '16px', fontSize: '8pt', color: '#666', textAlign: 'center' }}>
              Dicetak dari Sistem ID-MAP — Integrasi Data Mangrove dan Pesisir &nbsp;|&nbsp; {form.tanggal}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Platform Badge */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-center gap-4">
        <div className="w-9 h-9 bg-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Modul Platform</p>
          <p className="text-sm font-bold text-gray-800">EcoTrack — Input Data Petugas Lapangan</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {/* Online/Offline indicator */}
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border ${
            isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? 'Online' : 'Offline — data tersimpan lokal'}
          </div>
          <div className="text-xs text-gray-400 text-right hidden sm:block">
            <p className="font-medium text-gray-600">Formulir Survey Mangrove</p>
            <p>Tim Survei Lapangan</p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  active ? 'bg-green-700 text-white' : done ? 'text-green-700' : 'text-gray-400'
                }`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">

        {/* ── STEP 1: Identitas ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <ClipboardList className="w-5 h-5 text-green-700" />
              <h3 className="font-bold text-gray-800">Identitas Petugas & Lokasi Survey</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputGroup label="Nama Petugas" required>
                <Inp value={form.namaPetugas} onChange={set('namaPetugas')} placeholder="Nama lengkap petugas" />
              </InputGroup>
              <InputGroup label="NIP / NIK">
                <Inp value={form.nip} onChange={set('nip')} placeholder="Nomor induk pegawai" />
              </InputGroup>
              <InputGroup label="Unit Kerja" required>
                <Inp value={form.unitKerja} onChange={set('unitKerja')} placeholder="Instansi/dinas" />
              </InputGroup>
              <InputGroup label="Tanggal Survey" required>
                <Inp type="date" value={form.tanggal} onChange={set('tanggal')} />
              </InputGroup>
            </div>

            {/* Location selector + Add new */}
            <InputGroup label="Lokasi Monitoring" required>
              <div className="space-y-2">
                <Sel value={form.locationId} onChange={val => {
                  const loc = allLocations.find(l => l.id === val);
                  setForm(prev => ({
                    ...prev,
                    locationId: val,
                    koordinatLat: loc ? String(loc.lat) : prev.koordinatLat,
                    koordinatLng: loc ? String(loc.lng) : prev.koordinatLng,
                  }));
                }}>
                  <option value="">-- Pilih Lokasi --</option>
                  <option disabled>── Lokasi Umum ──</option>
                  {mangroveLocations.map(l => (
                    <option key={l.id} value={l.id}>{l.name} — {l.province}</option>
                  ))}
                  <option disabled>── KKPD / Kawasan Konservasi ──</option>
                  {kkpdLocations.map(l => (
                    <option key={l.id} value={l.id}>{l.name} — {l.province}</option>
                  ))}
                  {customLocs.length > 0 && (
                    <>
                      <option disabled>── Lokasi Ditambahkan Petugas ──</option>
                      {customLocs.map(l => (
                        <option key={l.id} value={l.id}>{l.name} — {l.province} (Baru)</option>
                      ))}
                    </>
                  )}
                </Sel>

                <button
                  type="button"
                  onClick={() => setShowNewLoc(!showNewLoc)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  {showNewLoc ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {showNewLoc ? 'Batal tambah lokasi' : 'Lokasi belum ada? Tambah baru'}
                </button>
              </div>
            </InputGroup>

            {/* New location inline form */}
            {showNewLoc && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-700" />
                  <p className="text-sm font-bold text-blue-800">Tambah Lokasi Baru</p>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Data akan tercatat ke sistem</span>
                </div>
                {newLocError && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {newLocError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputGroup label="Nama Lokasi" required>
                    <Inp value={newLoc.name} onChange={setNL('name')} placeholder="cth: Pesisir Teluk Kendari" />
                  </InputGroup>
                  <InputGroup label="Provinsi" required>
                    <select
                      value={newLoc.province}
                      onChange={e => setNewLoc(prev => ({ ...prev, province: e.target.value, district: '' }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="">-- Pilih Provinsi --</option>
                      {PROVINSI_LIST.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </InputGroup>
                  <InputGroup label="Kabupaten / Kota" required>
                    <select
                      value={newLoc.district}
                      onChange={e => setNewLoc(prev => ({ ...prev, district: e.target.value }))}
                      disabled={!newLoc.province}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-600 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">-- Pilih Kab/Kota --</option>
                      {(KABKOTA_BY_PROVINSI[newLoc.province] ?? []).map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </InputGroup>
                  <InputGroup label="Kawasan">
                    <select
                      value={newLoc.kawasan}
                      onChange={e => setNewLoc(prev => ({ ...prev, kawasan: e.target.value as MangroveLocation['kawasan'] }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="konservasi">Kawasan Konservasi</option>
                      <option value="hutan_lindung">Hutan Lindung</option>
                      <option value="apl">APL (Area Penggunaan Lain)</option>
                    </select>
                  </InputGroup>
                  <InputGroup label="Estimasi Luas (ha)">
                    <Inp type="number" min="0" value={newLoc.areaHa} onChange={setNL('areaHa')} placeholder="0" />
                  </InputGroup>
                </div>
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Simpan & Pilih Lokasi Ini
                </button>
                <div className="text-xs text-blue-600 space-y-0.5">
                  <p>Koordinat GPS otomatis diambil dari tombol <strong>Ambil Koordinat GPS</strong> di atas.</p>
                  {form.koordinatLat && form.koordinatLng
                    ? <p className="text-green-700 font-medium">✓ GPS siap: {form.koordinatLat}, {form.koordinatLng}</p>
                    : <p className="text-amber-600">⚠ Belum ada GPS — tekan "Ambil Koordinat GPS" terlebih dahulu untuk menandai lokasi ini.</p>
                  }
                </div>
              </div>
            )}

            <InputGroup label="Metode Survey">
              <Sel value={form.metodeSurvei} onChange={set('metodeSurvei')}>
                <option value="ground_check">Ground Check Lapangan</option>
                <option value="transek">Transek Plot (20×20m)</option>
                <option value="drone">Pemotretan Drone</option>
                <option value="iot">Pembacaan Sensor IoT</option>
              </Sel>
            </InputGroup>

            {/* GPS — koordinat diambil otomatis, tidak ada input manual */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleGetGPS}
                disabled={gpsLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors flex-shrink-0"
              >
                {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                {gpsLoading ? 'Mengambil GPS...' : 'Ambil Koordinat GPS'}
              </button>
              <div className="flex-1 min-w-0 text-xs">
                {form.koordinatLat && form.koordinatLng ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono bg-white border border-blue-200 rounded px-2 py-1 text-blue-800 font-semibold">
                      {form.koordinatLat}, {form.koordinatLng}
                    </span>
                    {gpsAccuracy && (
                      <span className="text-green-700 font-medium">✓ Akurasi ±{gpsAccuracy}m</span>
                    )}
                  </div>
                ) : (
                  <p className="text-blue-600">Koordinat otomatis dari GPS satelit HP — tidak butuh internet.</p>
                )}
              </div>
            </div>
            {gpsError && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {gpsError}
              </div>
            )}

            {form.locationId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                Lokasi terpilih: <strong>{allLocations.find(l => l.id === form.locationId)?.name}</strong> —
                Survey akan diintegrasikan ke data pemantauan ID-MAP.
                {customLocs.some(l => l.id === form.locationId) && (
                  <span className="ml-1 text-blue-700 font-semibold">(Lokasi baru — menunggu verifikasi)</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Ekosistem ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <Leaf className="w-5 h-5 text-green-700" />
              <h3 className="font-bold text-gray-800">Data Kondisi Ekosistem</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputGroup label="Persentase Tutupan Tajuk (%)" required>
                <Inp type="number" min="0" max="100" value={form.tutupanTajuk} onChange={set('tutupanTajuk')} placeholder="0–100" />
              </InputGroup>
              <InputGroup label="Estimasi Kerapatan Pohon (pohon/ha)" required>
                <Inp type="number" min="0" value={form.kerapatanEstimasi} onChange={set('kerapatanEstimasi')} placeholder="misalnya: 1200" />
              </InputGroup>
              <InputGroup label="Spesies Dominan">
                <Sel value={form.spesiesDominan} onChange={set('spesiesDominan')}>
                  <option value="Rhizophora apiculata">Rhizophora apiculata</option>
                  <option value="Rhizophora mucronata">Rhizophora mucronata</option>
                  <option value="Avicennia marina">Avicennia marina</option>
                  <option value="Avicennia officinalis">Avicennia officinalis</option>
                  <option value="Bruguiera gymnorrhiza">Bruguiera gymnorrhiza</option>
                  <option value="Sonneratia alba">Sonneratia alba</option>
                  <option value="Sonneratia caseolaris">Sonneratia caseolaris</option>
                  <option value="Ceriops tagal">Ceriops tagal</option>
                  <option value="Xylocarpus granatum">Xylocarpus granatum</option>
                </Sel>
              </InputGroup>
              <InputGroup label="Spesies Lain (pisahkan koma)">
                <Inp value={form.spesiesLain} onChange={set('spesiesLain')} placeholder="Bruguiera, Ceriops, ..." />
              </InputGroup>
              <InputGroup label="Laju Regenerasi Alami">
                <Sel value={form.lajuRegenerasi} onChange={set('lajuRegenerasi')}>
                  <option value="tinggi">Tinggi — banyak semai/pancang alami</option>
                  <option value="sedang">Sedang — semai cukup tersedia</option>
                  <option value="rendah">Rendah — minim semai/regenerasi</option>
                </Sel>
              </InputGroup>
              <InputGroup label="Kondisi Serasah / Litter">
                <Sel value={form.kondisiSerasah} onChange={set('kondisiSerasah')}>
                  <option value="lebat">Lebat (indikator ekosistem sehat)</option>
                  <option value="normal">Normal</option>
                  <option value="minim">Minim (potensi degradasi)</option>
                </Sel>
              </InputGroup>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <strong>Panduan Lapangan:</strong> Gunakan metode transek 20×20m untuk estimasi tutupan tajuk (crown cover)
              dan kerapatan pohon (DBH ≥ 10 cm). Lakukan minimal 3 plot per kawasan untuk akurasi data.
            </div>
          </div>
        )}

        {/* ── STEP 3: Lingkungan ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <Waves className="w-5 h-5 text-green-700" />
              <h3 className="font-bold text-gray-800">Data Kualitas Perairan & Biofisik</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InputGroup label="Salinitas (ppt)">
                <Inp type="number" min="0" max="50" step="0.1" value={form.salinitas} onChange={set('salinitas')} placeholder="0–50" />
              </InputGroup>
              <InputGroup label="pH Air">
                <Inp type="number" min="0" max="14" step="0.1" value={form.ph} onChange={set('ph')} placeholder="6.5–8.5" />
              </InputGroup>
              <InputGroup label="Suhu Air (°C)">
                <Inp type="number" min="20" max="40" step="0.1" value={form.suhu} onChange={set('suhu')} placeholder="20–35" />
              </InputGroup>
              <InputGroup label="Kekeruhan (NTU)">
                <Inp type="number" min="0" step="0.1" value={form.kekeruhan} onChange={set('kekeruhan')} placeholder="0–100" />
              </InputGroup>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputGroup label="Jenis Substrat">
                <Sel value={form.substrat} onChange={set('substrat')}>
                  <option value="lumpur">Lumpur (mud)</option>
                  <option value="pasir">Pasir (sandy)</option>
                  <option value="berbatu">Berbatu (rocky)</option>
                  <option value="campuran">Campuran (mixed)</option>
                </Sel>
              </InputGroup>
              <InputGroup label="Elevasi Rerata (m dpl)">
                <Inp type="number" step="0.1" value={form.elevasi} onChange={set('elevasi')} placeholder="misalnya: 1.2" />
              </InputGroup>
              <InputGroup label="Ketinggian Pasang Surut (m)">
                <Inp type="text" value={form.pasangSurut} onChange={set('pasangSurut')} placeholder="min–max, cth: 0.3–2.1" />
              </InputGroup>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { param: 'Salinitas', val: form.salinitas, unit: 'ppt', opt: '10–35' },
                { param: 'pH', val: form.ph, unit: '', opt: '6.5–8.0' },
                { param: 'Suhu', val: form.suhu, unit: '°C', opt: '20–30' },
                { param: 'Kekeruhan', val: form.kekeruhan, unit: 'NTU', opt: '< 30' },
              ].map(p => {
                const v = parseFloat(p.val);
                const ok = !isNaN(v);
                return (
                  <div key={p.param} className={`rounded-lg p-2 border ${ok ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="font-semibold text-gray-600">{p.param}</p>
                    <p className={`font-bold ${ok ? 'text-green-700' : 'text-gray-400'}`}>{ok ? `${p.val} ${p.unit}` : '—'}</p>
                    <p className="text-gray-400">Optimal: {p.opt}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 4: Tekanan ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <Users className="w-5 h-5 text-green-700" />
              <h3 className="font-bold text-gray-800">Tekanan Antropogenik & Sosial-Ekonomi</h3>
            </div>
            <InputGroup label="Jenis Ancaman yang Diamati di Lapangan (pilih semua yang sesuai)">
              <div className="grid grid-cols-2 gap-2 mt-1">
                {ANCAMAN_OPTIONS.map(item => (
                  <label key={item} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-colors ${
                    form.ancamanUtama.includes(item)
                      ? 'bg-red-50 border-red-300 text-red-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={form.ancamanUtama.includes(item)}
                      onChange={() => toggleAncaman(item)}
                      className="accent-red-600"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </InputGroup>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputGroup label="Jarak Pemukiman Terdekat (km)">
                <Inp type="number" min="0" step="0.1" value={form.jarakPemukiman} onChange={set('jarakPemukiman')} placeholder="misalnya: 2.5" />
              </InputGroup>
              <InputGroup label="Estimasi Luas Tambak Sekitar (ha)">
                <Inp type="number" min="0" value={form.luasTambakEstimasi} onChange={set('luasTambakEstimasi')} placeholder="0 jika tidak ada" />
              </InputGroup>
              <InputGroup label="Status Lahan">
                <Sel value={form.statusTenurial} onChange={set('statusTenurial')}>
                  <option value="aman">Aman — tidak ada konflik</option>
                  <option value="proses_legal">Proses Legal — sedang diurus</option>
                  <option value="bersengketa">Bersengketa — konflik aktif</option>
                </Sel>
              </InputGroup>
            </div>
            <InputGroup label="Deskripsi Aktivitas Manusia yang Diamati">
              <Textarea
                value={form.aktivitasManusia}
                onChange={set('aktivitasManusia')}
                placeholder="Jelaskan aktivitas manusia yang diamati: penangkapan ikan, pertambakan, penebangan, dll..."
              />
            </InputGroup>
          </div>
        )}

        {/* ── STEP 5: Dokumentasi ── */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <Camera className="w-5 h-5 text-green-700" />
              <h3 className="font-bold text-gray-800">Dokumentasi & Catatan Lapangan</h3>
            </div>
            <InputGroup label="Foto Dokumentasi">
              {/* Upload area */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
              {photos.length < 5 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors mb-3"
                >
                  <Upload className="w-7 h-7 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Klik untuk pilih foto lapangan</p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG/PNG · maks. 10 MB/foto · {5 - photos.length} slot tersisa
                  </p>
                  {!isOnline && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      Offline — foto disimpan lokal, upload saat ada koneksi
                    </p>
                  )}
                  {isOnline && !isCloudinaryConfigured() && (
                    <p className="text-xs text-gray-400 mt-1">
                      Cloudinary belum dikonfigurasi — foto hanya disimpan lokal
                    </p>
                  )}
                </div>
              )}

              {/* Photo previews */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={photo.preview} alt={photo.tag} className="w-full h-24 object-cover" />
                      <div className="p-1.5 flex items-center gap-1">
                        <select
                          value={photo.tag}
                          onChange={e => setPhotos(prev => prev.map((p, j) => j === i ? { ...p, tag: e.target.value } : p))}
                          className="flex-1 text-xs border border-gray-200 rounded px-1 py-0.5 bg-white"
                        >
                          {['Kondisi Umum', 'Tutupan Tajuk', 'Substrat', 'Ancaman', 'Biota Asosiasi'].map(t => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                        <button onClick={() => removePhoto(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {photo.uploading && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                        </div>
                      )}
                      {photo.url && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {photo.error && (
                        <div className="absolute top-1 left-1 bg-amber-500 rounded text-white text-xs px-1">offline</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </InputGroup>
            <InputGroup label="Penilaian Kondisi Umum Kawasan" required>
              <Textarea
                rows={4}
                value={form.kondisiUmum}
                onChange={set('kondisiUmum')}
                placeholder="Jelaskan secara singkat kondisi umum kawasan mangrove yang diamati: tingkat kerusakan, tanda-tanda pemulihan, kondisi vegetasi, dll..."
              />
            </InputGroup>
            <InputGroup label="Rekomendasi Tindakan dari Lapangan">
              <Textarea
                rows={4}
                value={form.rekomendasiLapangan}
                onChange={set('rekomendasiLapangan')}
                placeholder="Rekomendasi tindakan berdasarkan kondisi lapangan: perlu restorasi segera, monitoring lanjutan, koordinasi dengan pihak tertentu, dll..."
              />
            </InputGroup>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800">
              <strong>Catatan:</strong> Data survey ini akan divalidasi oleh Kepala Seksi Pengelolaan dan diintegrasikan
              ke database ID-MAP dalam 1×24 jam. Pastikan seluruh data kritis (tutupan, salinitas, ancaman) telah terisi
              sebelum menyimpan.
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-700 mb-3">Pratinjau Data yang Akan Disimpan</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                <div className="text-gray-500">Petugas: <span className="font-medium text-gray-800">{form.namaPetugas || '—'}</span></div>
                <div className="text-gray-500">Tanggal: <span className="font-medium text-gray-800">{form.tanggal}</span></div>
                <div className="text-gray-500">Lokasi: <span className="font-medium text-gray-800">{allLocations.find(l => l.id === form.locationId)?.name || '—'}</span></div>
                <div className="text-gray-500">Metode: <span className="font-medium text-gray-800 capitalize">{form.metodeSurvei.replace('_', ' ')}</span></div>
                <div className="text-gray-500">Tutupan: <span className="font-medium text-gray-800">{form.tutupanTajuk ? `${form.tutupanTajuk}%` : '—'}</span></div>
                <div className="text-gray-500">Ancaman: <span className="font-medium text-gray-800">{form.ancamanUtama.length > 0 ? `${form.ancamanUtama.length} jenis` : 'Tidak ada'}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(prev => (prev > 1 ? (prev - 1) as Step : prev))}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Sebelumnya
        </button>
        <div className="text-xs text-gray-400">Langkah {step} dari {STEPS.length}</div>
        {step < 5 ? (
          <button
            onClick={() => setStep(prev => (prev < 5 ? (prev + 1) as Step : prev))}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors"
          >
            Selanjutnya <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={savingStatus === 'saving'}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors"
          >
            {savingStatus === 'saving'
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              : <><Save className="w-4 h-4" /> {isOnline ? 'Simpan & Sinkronkan' : 'Simpan Offline'}</>
            }
          </button>
        )}
      </div>
    </div>
  );
}
