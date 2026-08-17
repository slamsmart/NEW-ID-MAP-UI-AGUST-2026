import { useState, useEffect, useRef } from 'react';
import {
  ClipboardList, MapPin, Leaf, Camera, CheckCircle,
  AlertCircle, X, Navigation, Loader2, Upload,
  WifiOff, Wifi, Sprout, AlertTriangle, Info, Droplets, ExternalLink, Trees, Turtle, FileText,
} from 'lucide-react';
// Location data no longer needed â€" GPS auto-detect used instead
import { PROVINSI_LIST, KABKOTA_BY_PROVINSI } from '../data/wilayahIndonesia';
import { fetchSurveys, getSurveys, saveSurvey, type SurveyRecord } from '../data/localStore';
import { hitungSkorPotensi, rekomendasiSpesiesBySubstrat } from '../data/abrasiData';
import { useAuth } from '../context/useAuth';
import { uploadPhoto, fileToDataUrl, isCloudinaryConfigured, getCloudinaryUrl } from '../lib/cloudinary';
import { enqueueSurvey } from '../lib/offlineQueue';
import { extractGpsAuto, preloadOcrWorker, type ExifGpsResult } from '../lib/exifGps';
import { parseCoord } from '../lib/coordParser';
// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

type TujuanSurvei = 'monitoring_vegetasi' | 'potensi_penanaman' | 'pendaratan_penyu';

interface CommonFields {
  namaPetugas: string;
  unitKerja: string;
  tanggal: string;
  koordinatLat: string;
  koordinatLng: string;
}

interface MonitoringVegetasiForm extends CommonFields {
  locationId: string;
  metodeSurvei: string;
  // Toggles: apa yang ditemukan di lokasi
  adaMangrove: boolean;
  adaVegetasi: boolean;
  // Mangrove fields
  tutupanTajuk: string;
  kerapatanEstimasi: string;
  spesiesDominan: string;
  spesiesLain: string;
  lajuRegenerasi: string;
  mhiMangrove: string;
  kondisiSerasah: string;
  substrat: string;
  // Vegetasi pesisir fields
  jenisVegetasi: string;
  vegetasiLain: string;
  luasArea: string;
  jumlahTegakan: string;
  tinggiRataRata: string;
  kondisiVegetasi: string;
  // Shared
  ancamanUtama: string[];
  statusTenurial: string;
  kondisiUmum: string;
  rekomendasiLapangan: string;
  // Location
  namaLokasi: string;
  provinsi: string;
  kabKota: string;
}

interface PotensiForm extends CommonFields {
  namaArea: string;
  provinsi: string;
  kabKota: string;
  substrat: string;
  tutupanTajuk: string;
  luasanPotensi: string;
  aksesibilitas: 'mudah' | 'sedang' | 'sulit';
  pengaruhPasang: string;
  statusTenurial: string;
  jarakPemukiman: string;
  kondisiUmum: string;
  rekomendasiLapangan: string;
  // Titik Rawan section
  adaTitikRawan: boolean;
  tingkatAbrasi: 'ringan' | 'sedang' | 'parah' | 'sangat_parah';
  prioritasAbrasi: 'Tinggi' | 'Sedang' | 'Rendah';
  indikasi: string;
  kondisiSebelum: string;
  kondisiSesudah: string;
  luasanTerdampak: string;
  panjangTerdampak: string;
  ancamanUtama: string[];
}

interface PhotoEntry {
  file?: File;
  preview: string;
  url?: string;
  tag: string;
  uploading: boolean;
  error?: string;
}

// VegetasiForm merged into MonitoringVegetasiForm

interface SarangEntry {
  id: string;
  lat: string;
  lng: string;
  fotoPreview?: string;
  fotoUrl?: string;
  fotoFile?: File;
  catatan: string;
  waktu: string;
  uploading: boolean;
  extracting?: boolean;
}

interface PenyuForm extends CommonFields {
  namaPantai: string;
  provinsi: string;
  kabKota: string;
  jenisPenyu: string;
  jumlahTelur: string;
  panjangPantai: string;
  kondisiPantai: string;
  substrat: string;
  ancamanUtama: string[];
  statusPerlindungan: string;
  kondisiUmum: string;
  rekomendasiLapangan: string;
}

// â"€â"€â"€ Constants â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const ANCAMAN_OPTIONS = [
  'Abrasi pantai', 'Konversi tambak', 'Penebangan liar',
  'Pembuangan sampah', 'Sedimentasi tinggi', 'Pencemaran industri',
  'Perambahan pemukiman', 'Penangkapan ikan destruktif',
  'Wisatawan', 'Predator penyu', 'Kurangnya kesadaran masyarakat',
];

const SPESIES_OPTIONS = [
  'Rhizophora apiculata', 'Rhizophora mucronata', 'Avicennia marina',
  'Avicennia officinalis', 'Bruguiera gymnorrhiza', 'Sonneratia alba',
  'Sonneratia caseolaris', 'Ceriops tagal', 'Xylocarpus granatum',
];

const UNIT_KERJA_OPTIONS = [
  'Cabdin KP Kab Malang',
  'Cabdin KP Kab. Tuban',
  'Cabdin KP Kab. Blitar',
  'Cabdin KP Kab. Situbondo',
];

function getDefaultUnitKerja(unit?: string) {
  return unit && UNIT_KERJA_OPTIONS.includes(unit) ? unit : UNIT_KERJA_OPTIONS[0];
}

const INIT_COMMON: CommonFields = {
  namaPetugas: '', unitKerja: 'Cabdin KP Kab Malang',
  tanggal: new Date().toISOString().split('T')[0],
  koordinatLat: '', koordinatLng: '',
};

const INIT_MONITORING_VEGETASI: MonitoringVegetasiForm = {
  ...INIT_COMMON, locationId: '', metodeSurvei: 'ground_check',
  adaMangrove: true, adaVegetasi: false,
  tutupanTajuk: '', kerapatanEstimasi: '',
  spesiesDominan: 'Rhizophora apiculata', spesiesLain: '',
  lajuRegenerasi: 'sedang', mhiMangrove: 'sedang', kondisiSerasah: 'normal',
  substrat: 'lumpur',
  jenisVegetasi: 'Casuarina equisetifolia (Cemara Udang)', vegetasiLain: '',
  luasArea: '', jumlahTegakan: '', tinggiRataRata: '', kondisiVegetasi: 'baik',
  ancamanUtama: [],
  statusTenurial: 'aman', kondisiUmum: '', rekomendasiLapangan: '',
  namaLokasi: '', provinsi: 'Jawa Timur', kabKota: '',
};

const INIT_POTENSI: PotensiForm = {
  ...INIT_COMMON, namaArea: '', provinsi: '', kabKota: '',
  substrat: 'lumpur', tutupanTajuk: '',
  luasanPotensi: '', aksesibilitas: 'sedang', pengaruhPasang: 'ya',
  statusTenurial: 'aman', jarakPemukiman: '',
  kondisiUmum: '', rekomendasiLapangan: '',
  adaTitikRawan: false,
  tingkatAbrasi: 'sedang', prioritasAbrasi: 'Sedang',
  indikasi: '', kondisiSebelum: '', kondisiSesudah: '',
  luasanTerdampak: '', panjangTerdampak: '', ancamanUtama: [],
};

const VEGETASI_OPTIONS = [
  'Rhizophora apiculata (Bakau)', 'Rhizophora mucronata (Bakau Hitam)',
  'Avicennia marina (Api-api)', 'Sonneratia alba (Pedada)',
  'Casuarina equisetifolia (Cemara Udang)', 'Pandanus tectorius (Pandan Laut)',
  'Terminalia catappa (Ketapang)', 'Barringtonia asiatica (Butun)',
  'Calophyllum inophyllum (Nyamplung)', 'Hibiscus tiliaceus (Waru Laut)',
  'Ipomoea pes-caprae (Katang-katang)', 'Scaevola taccada (Babakoan)',
];

const PENYU_OPTIONS = [
  'Penyu Hijau (Chelonia mydas)', 'Penyu Sisik (Eretmochelys imbricata)',
  'Penyu Lekang (Lepidochelys olivacea)', 'Penyu Belimbing (Dermochelys coriacea)',
  'Penyu Tempayan (Caretta caretta)', 'Penyu Pipih (Natator depressus)',
];

// INIT_VEGETASI merged into INIT_MONITORING_VEGETASI

const INIT_PENYU: PenyuForm = {
  ...INIT_COMMON, namaPantai: '', provinsi: 'Jawa Timur', kabKota: '',
  jenisPenyu: 'Penyu Hijau (Chelonia mydas)', jumlahTelur: '',
  panjangPantai: '', kondisiPantai: 'baik', substrat: 'pasir',
  ancamanUtama: [], statusPerlindungan: 'dilindungi',
  kondisiUmum: '', rekomendasiLapangan: '',
};

function getSurveyTypeLabel(tujuan?: SurveyRecord['tujuanSurvei']) {
  if (tujuan === 'potensi_penanaman') return 'Potensi & Rekomendasi Penanaman';
  if (tujuan === 'pendaratan_penyu') return 'Titik Pendaratan Penyu';
  return 'Monitoring Mangrove / Vegetasi';
}

function buildSurveyBAHtml(survey: SurveyRecord) {
  const tujuanLabel = getSurveyTypeLabel(survey.tujuanSurvei);
  const namaLokasi = survey.locationName || survey.namaPantai || '-';
  const tanggal = survey.timestamp ? new Date(survey.timestamp).toLocaleDateString('id-ID') : '-';
  const koordinat = `${survey.koordinatLat || '-'}, ${survey.koordinatLng || '-'}`;
  const ancaman = survey.ancamanUtama ?? [];
  const tujuanIsi = survey.tujuanSurvei === 'potensi_penanaman'
    ? [
      `Substrat: ${survey.substrat || '-'}`,
      `Tutupan tajuk: ${survey.tutupanTajuk || '-'} %`,
      `Skor potensi: ${survey.skorPotensi ?? hitungSkorPotensi(survey.substrat || '', '', survey.tutupanTajuk || '')}/10`,
      `Status tenurial: ${survey.statusTenurial || '-'}`,
    ]
    : survey.tujuanSurvei === 'pendaratan_penyu'
      ? [
        `Jenis penyu: ${survey.jenisPenyu || '-'}`,
        `Jumlah sarang: ${survey.jumlahSarang || String((survey.sarangPoints ?? []).length)} titik`,
        `Substrat pantai: ${survey.substrat || '-'}`,
        `Status perlindungan: ${survey.statusPerlindungan || '-'}`,
      ]
      : [
        `Substrat: ${survey.substrat || '-'}`,
        `Tutupan tajuk: ${survey.tutupanTajuk || '-'} %`,
        `Kerapatan estimasi: ${survey.kerapatan || '-'}`,
        `MHI mangrove: ${survey.mhiMangrove || '-'}`,
        `Spesies dominan: ${survey.spesiesDominan || survey.jenisVegetasi || '-'}`,
      ];

  const titikSarangRows = (survey.sarangPoints ?? []).map((point, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${point.lat || '-'}</td>
      <td>${point.lng || '-'}</td>
      <td>${point.waktu || '-'}</td>
      <td>${point.catatan || '-'}</td>
    </tr>`).join('');

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>Berita Acara Survei Lapangan</title>
      <style>
        body { font-family: Arial, sans-serif; color: #1f2937; padding: 32px; font-size: 12px; line-height: 1.5; }
        h1 { text-align: center; font-size: 18px; margin: 0 0 4px; text-transform: uppercase; }
        h2 { text-align: center; font-size: 14px; margin: 0 0 20px; font-weight: normal; }
        .section { margin-top: 18px; }
        .section-title { font-weight: bold; margin-bottom: 8px; text-transform: uppercase; font-size: 12px; }
        .box { border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; }
        .meta { width: 100%; border-collapse: collapse; }
        .meta td { padding: 4px 0; vertical-align: top; }
        .meta td:first-child { width: 180px; color: #4b5563; }
        ul { margin: 0; padding-left: 18px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #d1d5db; padding: 6px 8px; font-size: 11px; }
        th { background: #f3f4f6; text-align: left; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px; }
        .sign-box { text-align: center; }
        .sign-space { height: 72px; }
        .footer { margin-top: 20px; font-size: 10px; color: #6b7280; }
      </style>
    </head>
    <body>
      <h1>Berita Acara</h1>
      <h2>Hasil Input Data Lapangan ID-MAP</h2>

      <div class="section box">
        <div class="section-title">A. Identitas Kegiatan</div>
        <table class="meta">
          <tr><td>Jenis Kegiatan</td><td>: ${tujuanLabel}</td></tr>
          <tr><td>Nama Lokasi</td><td>: ${namaLokasi}</td></tr>
          <tr><td>Tanggal Survei</td><td>: ${tanggal}</td></tr>
          <tr><td>Petugas</td><td>: ${survey.namaPetugas || '-'}</td></tr>
          <tr><td>Unit Kerja</td><td>: ${survey.unit || '-'}</td></tr>
          <tr><td>Koordinat</td><td>: ${koordinat}</td></tr>
        </table>
      </div>

      <div class="section box">
        <div class="section-title">B. Hasil Pengamatan</div>
        <ul>${tujuanIsi.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>

      <div class="section box">
        <div class="section-title">C. Kondisi Umum dan Rekomendasi</div>
        <p><strong>Kondisi Umum:</strong><br/>${survey.kondisiUmum || '-'}</p>
        <p><strong>Rekomendasi:</strong><br/>${survey.rekomendasiLapangan || '-'}</p>
        <p><strong>Ancaman:</strong><br/>${ancaman.length ? ancaman.join(', ') : '-'}</p>
      </div>

      ${survey.tujuanSurvei === 'pendaratan_penyu' ? `
        <div class="section box">
          <div class="section-title">D. Rincian Titik Sarang</div>
          <table>
            <thead>
              <tr>
                <th>No</th><th>Latitude</th><th>Longitude</th><th>Waktu</th><th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              ${titikSarangRows || '<tr><td colspan="5">Tidak ada titik sarang terinput.</td></tr>'}
            </tbody>
          </table>
        </div>` : ''}

      <div class="signatures">
        <div class="sign-box">
          <p>Petugas Lapangan,</p>
          <div class="sign-space"></div>
          <p><strong>${survey.namaPetugas || '-'}</strong></p>
          <p>${survey.unit || '-'}</p>
        </div>
        <div class="sign-box">
          <p>Mengetahui,</p>
          <div class="sign-space"></div>
          <p><strong>Verifikator / Atasan Langsung</strong></p>
          <p>ID-MAP / DKP</p>
        </div>
      </div>

      <div class="footer">
        Dokumen ini dihasilkan dari sistem ID-MAP berdasarkan data input lapangan dan dapat digunakan sebagai draft berita acara lapangan.
      </div>
    </body>
    </html>
  `;
}

function printSurveyBA(survey: SurveyRecord) {
  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) return;
  win.document.write(buildSurveyBAHtml(survey));
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}

// â"€â"€â"€ Sub-components â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function G({ label, children, req, half }: { label: string; children: React.ReactNode; req?: boolean; half?: boolean }) {
  return (
    <div className={half ? '' : ''}>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const cls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600';

function Inp({ value, onChange, placeholder, type = 'text', min, max, step, disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; min?: string; max?: string; step?: string; disabled?: boolean;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} min={min} max={max} step={step} disabled={disabled}
      className={cls + (disabled ? ' opacity-60 cursor-not-allowed' : '')} />
  );
}

function Sel({ value, onChange, children, disabled }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className={cls + (disabled ? ' opacity-60 cursor-not-allowed' : '')}>
      {children}
    </select>
  );
}

function TA({ value, onChange, placeholder, rows = 2 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      className={cls + ' resize-none'} />
  );
}

function UnitKerjaField({ value, onChange, required }: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const CUSTOM_UNIT_VALUE = '__custom_unit__';
  const isCustomValue = value ? !UNIT_KERJA_OPTIONS.includes(value) : false;
  const [isCustomMode, setIsCustomMode] = useState(isCustomValue);

  useEffect(() => {
    setIsCustomMode(isCustomValue);
  }, [isCustomValue]);

  return (
    <G label="Unit Kerja" req={required}>
      <div className="space-y-1.5">
        {isCustomMode ? (
          <>
            <input
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="Ketik nama unit kerja baru"
              className={cls}
            />
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(false);
                onChange(UNIT_KERJA_OPTIONS[0]);
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Kembali ke daftar unit kerja
            </button>
          </>
        ) : (
          <select
            value={UNIT_KERJA_OPTIONS.includes(value) ? value : CUSTOM_UNIT_VALUE}
            onChange={e => {
              if (e.target.value === CUSTOM_UNIT_VALUE) {
                setIsCustomMode(true);
                onChange('');
                return;
              }
              onChange(e.target.value);
            }}
            className={cls}
          >
            {UNIT_KERJA_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            <option value={CUSTOM_UNIT_VALUE}>+ Tambahkan unit kerja baru</option>
          </select>
        )}
      </div>
    </G>
  );
}

function SectionHead({ icon: Icon, label, color = 'text-[#0d404f]' }: {
  icon: React.ElementType; label: string; color?: string;
}) {
  return (
    <div className={`flex items-center gap-2 pb-2 border-b border-gray-100 ${color}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

function AncamanChecks({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (item: string) =>
    onChange(selected.includes(item) ? selected.filter(a => a !== item) : [...selected, item]);
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {ANCAMAN_OPTIONS.map(item => (
        <button key={item} type="button" onClick={() => toggle(item)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
            selected.includes(item)
              ? 'bg-red-100 border-red-300 text-red-800 font-semibold'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
          }`}>
          {item}
        </button>
      ))}
    </div>
  );
}

function JenisPenyuField({ value, onChange }: {
  value: string;
  onChange: (v: string) => void;
}) {
  const selectedItems = value.split(',').map(item => item.trim()).filter(Boolean);
  const toggleJenis = (jenis: string) => {
    if (selectedItems.includes(jenis)) {
      onChange(selectedItems.filter(item => item !== jenis).join(', '));
      return;
    }
    onChange(selectedItems.length ? `${selectedItems.join(', ')}, ${jenis}` : jenis);
  };

  return (
    <G label="Jenis Penyu" req>
      <div className="space-y-2">
        <input
          list="jenis-penyu-options"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Pilih atau ketik beberapa jenis, pisahkan dengan koma"
          className={cls}
        />
        <datalist id="jenis-penyu-options">
          {PENYU_OPTIONS.map(option => <option key={option} value={option} />)}
        </datalist>
        <div className="flex flex-wrap gap-2">
          {PENYU_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => toggleJenis(option)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                selectedItems.includes(option)
                  ? 'border-[#071520] bg-[#071520] text-white font-bold shadow-sm'
                  : 'border-[#0d404f]/25 bg-[#0d404f]/10 text-[#0d404f] hover:bg-[#0d404f]/20'
              }`}
            >
              {selectedItems.includes(option) ? '✓ ' : '+ '}{option}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-500">
          Bisa isi lebih dari satu jenis. Contoh: <span className="font-medium">Penyu Hijau (Chelonia mydas), Penyu Lekang (Lepidochelys olivacea)</span>
        </p>
      </div>
    </G>
  );
}

// â"€â"€â"€ GPS Block â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function GPSBlock({ lat, lng, onCapture, onPhotoGps }: {
  lat: string; lng: string;
  onCapture: (lat: string, lng: string, acc: number) => void;
  onPhotoGps?: (result: ExifGpsResult) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [err, setErr] = useState('');
  const [photoSource, setPhotoSource] = useState('');
  const photoRef = useRef<HTMLInputElement>(null);

  const grab = () => {
    if (!navigator.geolocation) { setErr('Browser tidak mendukung GPS.'); return; }
    setLoading(true); setErr(''); setPhotoSource('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        onCapture(pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6), Math.round(pos.coords.accuracy));
        setLoading(false);
      },
      err => {
        setErr(err.code === 1 ? 'Izin GPS ditolak.' : err.code === 2 ? 'Sinyal GPS lemah.' : 'Timeout GPS.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handlePhotoGps = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true); setErr(''); setPhotoSource('');
    try {
      const result = await extractGpsAuto(file);
      if (result) {
        onCapture(result.lat, result.lng, result.accuracy ?? 0);
        setPhotoSource(`Dari foto: ${file.name}${result.waktu ? ` (${result.waktu})` : ''}`);
        onPhotoGps?.(result);
      } else {
        setErr('Foto tidak mengandung data GPS. Gunakan aplikasi GPS Camera (Timestamp Camera / GPS Map Camera) saat memotret.');
      }
    } catch {
      setErr('Gagal membaca data foto.');
    }
    setPhotoLoading(false);
    if (photoRef.current) photoRef.current.value = '';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={grab} disabled={loading || photoLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
          {loading ? 'Mengambil...' : 'Ambil GPS'}
        </button>

        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoGps} />
        <button type="button" onClick={() => photoRef.current?.click()} disabled={loading || photoLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-60 transition-colors">
          {photoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          {photoLoading ? 'Membaca...' : 'Dari Foto GPS'}
        </button>

        {lat && lng
          ? <span className="font-mono text-xs bg-blue-50 border border-blue-200 text-blue-800 px-2 py-1 rounded">âœ" {lat}, {lng}</span>
          : <span className="text-xs text-gray-400">Belum diambil</span>}
        {lat && lng && (
          <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2">
            <ExternalLink className="w-3 h-3" /> Google Maps
          </a>
        )}
      </div>
      {photoSource && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 flex-shrink-0" /> {photoSource}
        </p>
      )}
      {err && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</p>}
    </div>
  );
}

// â"€â"€â"€ Photo Block â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function PhotoBlock({ photos, setPhotos, isOnline, onGpsExtracted }: {
  photos: PhotoEntry[]; setPhotos: React.Dispatch<React.SetStateAction<PhotoEntry[]>>; isOnline: boolean;
  onGpsExtracted?: (result: ExifGpsResult) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const TAGS = ['Kondisi Umum', 'Tutupan Tajuk', 'Substrat', 'Ancaman', 'Biota', 'Titik GPS'];

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (photos.length + files.length > 4) { alert('Maksimum 4 foto.'); return; }
    for (const file of files) {
      const preview = await fileToDataUrl(file);
      const entry: PhotoEntry = { file, preview, tag: 'Kondisi Umum', uploading: false };
      setPhotos(prev => [...prev, entry]);

      // Auto-extract GPS from EXIF
      try {
        const gpsResult = await extractGpsAuto(file);
        if (gpsResult) {
          onGpsExtracted?.(gpsResult);
        }
      } catch {
        // silently ignore â€" GPS extraction is best-effort
      }

      if (isOnline && isCloudinaryConfigured()) {
        setPhotos(prev => prev.map(p => p.preview === preview ? { ...p, uploading: true } : p));
        try {
          const res = await uploadPhoto(file);
          setPhotos(prev => prev.map(p => p.preview === preview ? { ...p, url: res.url, uploading: false } : p));
        } catch {
          setPhotos(prev => prev.map(p => p.preview === preview ? { ...p, uploading: false, error: 'Upload gagal' } : p));
        }
      }
    }
    if (ref.current) ref.current.value = '';
  };

  return (
    <div className="space-y-2">
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={handleSelect} />
      {photos.length < 4 && (
        <div onClick={() => ref.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
          <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Tap untuk pilih foto Â· maks. 4 foto</p>
        </div>
      )}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden border border-gray-200">
              <img src={p.preview} alt={p.tag} className="w-full h-20 object-cover" />
              {p.uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
              <div className="p-1 flex items-center gap-1">
                <select value={p.tag} onChange={e => setPhotos(prev => prev.map((ph, j) => j === i ? { ...ph, tag: e.target.value } : ph))}
                  className="flex-1 text-xs border border-gray-200 rounded px-1 py-0.5 bg-white">
                  {TAGS.map(t => <option key={t}>{t}</option>)}
                </select>
                <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// â"€â"€â"€ Sarang Multi-Point Input â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function SarangMultiInput({ sarangList, setSarangList, isOnline }: {
  sarangList: SarangEntry[];
  setSarangList: React.Dispatch<React.SetStateAction<SarangEntry[]>>;
  isOnline: boolean;
}) {
  const batchRef = useRef<HTMLInputElement>(null);

  // Tambah titik kosong untuk isi koordinat manual
  const addManual = () => {
    setSarangList(prev => [...prev, {
      id: `S-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      lat: '', lng: '', catatan: '', waktu: new Date().toTimeString().slice(0, 5), uploading: false,
    }]);
  };

  const addFromGPS = () => {
    if (!navigator.geolocation) { alert('Browser tidak mendukung GPS.'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setSarangList(prev => [...prev, {
          id: `S-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          catatan: '', waktu: new Date().toTimeString().slice(0, 5), uploading: false,
        }]);
      },
      () => alert('Gagal mengambil GPS. Pastikan izin lokasi aktif.'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handleBatchPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    for (const file of files) {
      const preview = await fileToDataUrl(file);
      const entry: SarangEntry = {
        id: `S-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        lat: '', lng: '', fotoPreview: preview, fotoFile: file, catatan: '', waktu: new Date().toTimeString().slice(0, 5), uploading: false, extracting: false,
      };
      setSarangList(prev => [...prev, entry]);
      if (isOnline && isCloudinaryConfigured()) {
        setSarangList(prev => prev.map(s => s.id === entry.id ? { ...s, uploading: true } : s));
        try {
          const res = await uploadPhoto(file);
          setSarangList(prev => prev.map(s => s.id === entry.id ? { ...s, fotoUrl: res.url, uploading: false } : s));
        } catch {
          setSarangList(prev => prev.map(s => s.id === entry.id ? { ...s, uploading: false } : s));
        }
      }
    }
    if (batchRef.current) batchRef.current.value = '';
  };

  const attachPhotoToEntry = async (id: string, file: File) => {
    const preview = await fileToDataUrl(file);
    setSarangList(prev => prev.map(s => s.id === id ? { ...s, fotoPreview: preview, fotoFile: file } : s));
    if (isOnline && isCloudinaryConfigured()) {
      setSarangList(prev => prev.map(s => s.id === id ? { ...s, uploading: true } : s));
      try {
        const res = await uploadPhoto(file);
        setSarangList(prev => prev.map(s => s.id === id ? { ...s, fotoUrl: res.url, uploading: false } : s));
      } catch {
        setSarangList(prev => prev.map(s => s.id === id ? { ...s, uploading: false } : s));
      }
    }
  };

  const remove = (id: string) => setSarangList(prev => prev.filter(s => s.id !== id));
  const update = (id: string, field: keyof SarangEntry, value: string) =>
    setSarangList(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  const valid = sarangList.filter(s => s.lat && s.lng);

  return (
    <div className="space-y-3">
      {/* Info */}
      <p className="text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
        <strong>Foto opsional.</strong> Cukup isi koordinat saja jika tidak ada foto. Titik tanpa foto akan ditampilkan sebagai geotag peta.
      </p>

      {/* Action bar -- koordinat dulu, foto opsional */}
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={addManual}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#071520] text-white text-xs font-bold rounded-lg hover:bg-[#0d404f] transition-colors">
          <MapPin className="w-3.5 h-3.5" />
          + Tambah Titik Manual
        </button>
        <button type="button" onClick={addFromGPS}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
          <Navigation className="w-3.5 h-3.5" />
          + GPS Live
        </button>
        <input ref={batchRef} type="file" accept="image/*" multiple className="hidden" onChange={handleBatchPhotos} />
        <button type="button" onClick={() => batchRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">
          <Camera className="w-3.5 h-3.5" />
          Upload Foto (opsional)
        </button>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-teal-800 bg-teal-100 border border-teal-300 rounded-full px-3 py-1">
          {valid.length} titik koordinat
        </span>
        {sarangList.length > valid.length && (
          <span className="text-xs text-amber-700">({sarangList.length - valid.length} belum diisi koordinat)</span>
        )}
        {sarangList.length > 0 && (
          <button type="button" onClick={() => setSarangList([])}
            className="text-xs text-red-500 hover:text-red-700 font-medium ml-auto">
            Hapus Semua
          </button>
        )}
      </div>

      {/* Table */}
      {sarangList.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-teal-50 text-teal-800 text-xs uppercase tracking-wider">
                  <th className="px-2 py-2 text-center font-bold w-8">#</th>
                  <th className="px-2 py-2 text-center font-bold w-14">Foto / Map</th>
                  <th className="px-2 py-2 text-left font-bold">Latitude</th>
                  <th className="px-2 py-2 text-left font-bold">Longitude</th>
                  <th className="px-2 py-2 text-center font-bold w-14">Waktu</th>
                  <th className="px-2 py-2 text-left font-bold">Catatan</th>
                  <th className="px-2 py-2 text-center font-bold w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sarangList.map((s, idx) => (
                  <tr key={s.id} className={s.lat && s.lng ? 'bg-white hover:bg-teal-50/50' : 'bg-amber-50/50 hover:bg-amber-50'}>
                    <td className="px-2 py-1.5 text-center">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${s.lat && s.lng ? 'bg-teal-600 text-white' : 'bg-amber-400 text-white'}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {s.fotoPreview ? (
                        /* Ada foto -- tampilkan thumbnail */
                        <div className="relative w-10 h-10 mx-auto rounded overflow-hidden border border-gray-200">
                          <img src={s.fotoPreview} alt={`#${idx + 1}`} className="w-full h-full object-cover" />
                          {s.uploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Loader2 className="w-3 h-3 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : s.lat && s.lng ? (
                        /* Tidak ada foto tapi ada koordinat -- tampilkan geotag map badge */
                        <a href={`https://www.google.com/maps?q=${s.lat},${s.lng}`} target="_blank" rel="noopener noreferrer"
                          title={`Buka di Maps: ${s.lat}, ${s.lng}`}
                          className="w-10 h-10 mx-auto rounded overflow-hidden border border-teal-300 bg-teal-50 flex flex-col items-center justify-center gap-0.5 hover:bg-teal-100 transition-colors cursor-pointer block">
                          <MapPin className="w-3.5 h-3.5 text-teal-600" />
                          <span className="text-teal-700 font-mono leading-none" style={{ fontSize: '7px' }}>
                            {parseFloat(s.lat).toFixed(3)}
                          </span>
                        </a>
                      ) : (
                        /* Belum ada koordinat & foto -- tombol upload foto opsional */
                        <div className="w-10 h-10 mx-auto rounded border border-dashed border-gray-300 bg-gray-50">
                          <label className="w-full h-full flex items-center justify-center cursor-pointer" title="Tambah foto (opsional)">
                            <input type="file" accept="image/*" className="hidden"
                              onChange={e => { const f = e.target.files?.[0]; if (f) void attachPhotoToEntry(s.id, f); e.currentTarget.value = ''; }} />
                            <Camera className="w-3 h-3 text-gray-300" />
                          </label>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1.5">
                      <input value={s.lat} onChange={e => update(s.id, 'lat', e.target.value)}
                        onBlur={e => {
                          const parsed = parseCoord(e.target.value);
                          if (parsed) update(s.id, 'lat', parsed);
                        }}
                        placeholder={`-8.386... atau 8°25'50"S`} className="w-full text-xs border border-gray-300 rounded px-1.5 py-1 font-mono bg-white text-gray-900 placeholder-gray-400" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input value={s.lng} onChange={e => update(s.id, 'lng', e.target.value)}
                        onBlur={e => {
                          const parsed = parseCoord(e.target.value);
                          if (parsed) update(s.id, 'lng', parsed);
                        }}
                        placeholder={`112.77... atau 112°38'3"E`} className="w-full text-xs border border-gray-300 rounded px-1.5 py-1 font-mono bg-white text-gray-900 placeholder-gray-400" />
                    </td>
                    <td className="px-2 py-1.5 text-center text-gray-500">{s.waktu || '--'}</td>
                    <td className="px-2 py-1.5">
                      <input value={s.catatan} onChange={e => update(s.id, 'catatan', e.target.value)}
                        placeholder="Catatan..." className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-900 placeholder-gray-400" />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {s.lat && s.lng && (
                          <a href={`https://www.google.com/maps?q=${s.lat},${s.lng}`} target="_blank" rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 p-0.5" title="Buka di Maps">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {!s.fotoPreview && s.lat && s.lng && (
                          <label className="text-gray-400 hover:text-teal-600 p-0.5 cursor-pointer" title="Tambah foto (opsional)">
                            <input type="file" accept="image/*" className="hidden"
                              onChange={e => { const f = e.target.files?.[0]; if (f) void attachPhotoToEntry(s.id, f); e.currentTarget.value = ''; }} />
                            <Camera className="w-3.5 h-3.5" />
                          </label>
                        )}
                        <button type="button" onClick={() => remove(s.id)} className="text-gray-400 hover:text-red-500 p-0.5" title="Hapus">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sarangList.length >= 3 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-600">
              <span>Total: <strong className="text-gray-800">{sarangList.length}</strong> titik</span>
              <span>Valid: <strong className="text-teal-700">{valid.length}</strong></span>
              <span>Ada foto: <strong className="text-blue-600">{sarangList.filter(s => s.fotoPreview).length}</strong></span>
              {sarangList.length > valid.length && (
                <span>Belum koordinat: <strong className="text-amber-600">{sarangList.length - valid.length}</strong></span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// â"€â"€â"€ Main Component â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export default function InputLapangan() {
  const { user } = useAuth();
  const resetFormState = () => {
    setSubmitted(false);
    setSavingStatus('idle');
    setTujuan(null);
    setPhotos([]);
    setSarangList([]);
    setGpsAccuracy(null);
    setGpsExtractedFromPhoto(null);
    setMonVeg({ ...INIT_MONITORING_VEGETASI, namaPetugas: user?.nama ?? '', unitKerja: getDefaultUnitKerja(user?.unit) });
    setPotensi({ ...INIT_POTENSI, namaPetugas: user?.nama ?? '', unitKerja: getDefaultUnitKerja(user?.unit) });
    setPenyu({ ...INIT_PENYU, namaPetugas: user?.nama ?? '', unitKerja: getDefaultUnitKerja(user?.unit) });
  };
  const [tujuan, setTujuan] = useState<TujuanSurvei | null>(null);
  const formAnchorRef = useRef<HTMLDivElement>(null);
  const handleSelectTujuan = (id: TujuanSurvei) => {
    setTujuan(id);
    if (id === 'pendaratan_penyu') preloadOcrWorker();
    // Tunggu form ter-render lalu scroll ke form supaya user tidak perlu scroll manual
    setTimeout(() => {
      formAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };
  const [monVeg, setMonVeg] = useState<MonitoringVegetasiForm>({
    ...INIT_MONITORING_VEGETASI, namaPetugas: user?.nama ?? '', unitKerja: getDefaultUnitKerja(user?.unit),
  });
  const [potensi, setPotensi] = useState<PotensiForm>({
    ...INIT_POTENSI, namaPetugas: user?.nama ?? '', unitKerja: getDefaultUnitKerja(user?.unit),
  });
  const [penyu, setPenyu] = useState<PenyuForm>({
    ...INIT_PENYU, namaPetugas: user?.nama ?? '', unitKerja: getDefaultUnitKerja(user?.unit),
  });
  const [sarangList, setSarangList] = useState<SarangEntry[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved_online' | 'saved_offline'>('idle');
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsExtractedFromPhoto, setGpsExtractedFromPhoto] = useState<{ lat: string; lng: string; waktu: string } | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // (Location data now comes from GPS auto-detect)

  useEffect(() => {
    const up = () => setIsOnline(true);
    const dn = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', dn);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', dn); };
  }, []);

  useEffect(() => {
    const handleResetRequest = () => resetFormState();
    window.addEventListener('idmap:reset-input-lapangan', handleResetRequest as EventListener);
    return () => window.removeEventListener('idmap:reset-input-lapangan', handleResetRequest as EventListener);
  });

  const setMV = (k: keyof MonitoringVegetasiForm) => (v: string) => setMonVeg(p => ({ ...p, [k]: v }));
  const setPo = (k: keyof PotensiForm) => (v: string) => setPotensi(p => ({ ...p, [k]: v }));
  const setPn = (k: keyof PenyuForm) => (v: string) => setPenyu(p => ({ ...p, [k]: v }));

  const handleGPS = (lat: string, lng: string, acc: number) => {
    setGpsAccuracy(acc);
    if (tujuan === 'monitoring_vegetasi') {
      setMonVeg(p => ({
        ...p, koordinatLat: lat, koordinatLng: lng,
        locationId: p.locationId || 'Jawa Timur|Malang',
      }));
    }
    if (tujuan === 'potensi_penanaman') setPotensi(p => ({ ...p, koordinatLat: lat, koordinatLng: lng }));
    if (tujuan === 'pendaratan_penyu') setPenyu(p => ({ ...p, koordinatLat: lat, koordinatLng: lng }));
  };

  // Callback saat data GPS berhasil diekstrak dari foto EXIF â€" auto-fill tanggal + koordinat
  const handlePhotoGpsData = (result: ExifGpsResult) => {
    setGpsExtractedFromPhoto({ lat: result.lat, lng: result.lng, waktu: result.waktu });
    if (tujuan === 'monitoring_vegetasi') setMonVeg(p => ({ ...p, koordinatLat: result.lat, koordinatLng: result.lng, tanggal: result.tanggal || p.tanggal }));
    if (tujuan === 'potensi_penanaman') setPotensi(p => ({ ...p, koordinatLat: result.lat, koordinatLng: result.lng, tanggal: result.tanggal || p.tanggal }));
    if (tujuan === 'pendaratan_penyu') setPenyu(p => ({ ...p, koordinatLat: result.lat, koordinatLng: result.lng, tanggal: result.tanggal || p.tanggal }));
    setTimeout(() => setGpsExtractedFromPhoto(null), 5000);
  };

  const currentForm = tujuan === 'monitoring_vegetasi' ? monVeg : tujuan === 'potensi_penanaman' ? potensi : penyu;
  const currentLat = currentForm.koordinatLat;
  const currentLng = currentForm.koordinatLng;

  const mapsUrl = (lat: string, lng: string) =>
    lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : undefined;

  const norm = (value?: string | null) => (value ?? '').trim().toLowerCase();
  const userNameNorm = norm(user?.nama);
  const userUnitNorm = norm(user?.unit);
  const [allHistory, setAllHistory] = useState<SurveyRecord[]>(() => getSurveys());
  useEffect(() => {
    const loadHistory = async () => {
      const surveys = await fetchSurveys();
      setAllHistory(surveys);
    };
    void loadHistory();
    const handleStorage = () => { void loadHistory(); };
    window.addEventListener('storage', handleStorage);
    const timer = setInterval(() => { void loadHistory(); }, 10000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(timer);
    };
  }, []);
  const matchedHistory = allHistory.filter(s => {
    const byName = userNameNorm ? norm(s.namaPetugas) === userNameNorm : false;
    const byUnit = userUnitNorm ? norm(s.unit) === userUnitNorm : false;
    return byName || byUnit;
  });
  const historyItems = (matchedHistory.length > 0 ? matchedHistory : allHistory).slice(0, 8);

  const handleSubmit = async () => {
    setSavingStatus('saving');
    const surveyId = `SRV-${Date.now()}`;
    const photoUrls = photos.filter(p => p.url).map(p => p.url!);
    let queueResult: { success: boolean; offline: boolean } = { success: true, offline: !isOnline };

    let record: Parameters<typeof saveSurvey>[0] | null = null;

    try {
      if (tujuan === 'monitoring_vegetasi') {
        const locName = monVeg.namaLokasi || `GPS ${monVeg.koordinatLat}, ${monVeg.koordinatLng}`;
        const locId = `MONVEG-${Date.now()}`;
        const skorPotensi = monVeg.adaMangrove ? hitungSkorPotensi(monVeg.substrat, '', monVeg.tutupanTajuk) : 0;
        record = {
          id: surveyId, timestamp: new Date().toISOString(),
          namaPetugas: monVeg.namaPetugas, unit: monVeg.unitKerja,
          locationId: locId, locationName: locName,
          province: monVeg.provinsi || 'â€"',
          tutupanTajuk: monVeg.tutupanTajuk, kerapatan: monVeg.kerapatanEstimasi,
          salinitas: '', ancamanCount: monVeg.ancamanUtama.length,
          kondisiUmum: monVeg.kondisiUmum, isCustomLoc: true,
          substrat: monVeg.substrat, ph: '', suhu: '',
          koordinatLat: monVeg.koordinatLat, koordinatLng: monVeg.koordinatLng,
          spesiesDominan: monVeg.spesiesDominan, spesiesLain: monVeg.spesiesLain,
          rekomendasiLapangan: monVeg.rekomendasiLapangan, statusTenurial: monVeg.statusTenurial,
          lajuRegenerasi: monVeg.lajuRegenerasi, mhiMangrove: monVeg.mhiMangrove, ancamanUtama: monVeg.ancamanUtama,
          fotoDokumentasi: photoUrls[0] ?? '', skorPotensi,
          tujuanSurvei: 'monitoring' as const,
          googleMapsUrl: mapsUrl(monVeg.koordinatLat, monVeg.koordinatLng),
          jenisVegetasi: monVeg.adaVegetasi ? monVeg.jenisVegetasi : undefined,
          luasArea: monVeg.adaVegetasi ? monVeg.luasArea : undefined,
          kondisiVegetasi: monVeg.adaVegetasi ? monVeg.kondisiVegetasi : undefined,
        };
        saveSurvey(record);
        queueResult = await enqueueSurvey({
          id: surveyId, tujuan_survei: 'monitoring_vegetasi',
          petugas_nama: monVeg.namaPetugas, petugas_nip: null,
          petugas_unit: monVeg.unitKerja, location_id: locId,
          location_name: locName, province: monVeg.provinsi || '--',
          tanggal: monVeg.tanggal, metode_survei: monVeg.metodeSurvei,
          koordinat_lat: parseFloat(monVeg.koordinatLat) || null,
          koordinat_lng: parseFloat(monVeg.koordinatLng) || null,
          gps_accuracy: gpsAccuracy,
          tutupan_tajuk: parseFloat(monVeg.tutupanTajuk) || null,
          kerapatan_estimasi: parseFloat(monVeg.kerapatanEstimasi) || null,
          spesies_dominan: monVeg.spesiesDominan || null, spesies_lain: monVeg.spesiesLain || null,
          laju_regenerasi: monVeg.lajuRegenerasi, kondisi_serasah: monVeg.kondisiSerasah,
          salinitas: null, ph: null,
          suhu: null, kekeruhan: null,
          substrat: monVeg.substrat, elevasi: null, pasang_surut: null,
          ancaman_utama: monVeg.ancamanUtama, jarak_pemukiman: null,
          luas_tambak_estimasi: null, aktivitas_manusia: null,
          status_tenurial: monVeg.statusTenurial, kondisi_umum: monVeg.kondisiUmum,
          rekomendasi_lapangan: monVeg.rekomendasiLapangan, photo_urls: photoUrls, sync_status: 'pending',
        });
      } else if (tujuan === 'potensi_penanaman') {
        const skorPotensi = hitungSkorPotensi(potensi.substrat, '', potensi.tutupanTajuk);
        record = {
          id: surveyId, timestamp: new Date().toISOString(),
          namaPetugas: potensi.namaPetugas, unit: potensi.unitKerja,
          locationId: `POTENSI-${Date.now()}`, locationName: potensi.namaArea || '(Area Survei)',
          province: potensi.provinsi,
          tutupanTajuk: potensi.tutupanTajuk, kerapatan: '',
          salinitas: '', ancamanCount: potensi.ancamanUtama.length,
          kondisiUmum: potensi.kondisiUmum, isCustomLoc: true,
          substrat: potensi.substrat, ph: '', suhu: '',
          koordinatLat: potensi.koordinatLat, koordinatLng: potensi.koordinatLng,
          rekomendasiLapangan: potensi.rekomendasiLapangan, statusTenurial: potensi.statusTenurial,
          fotoDokumentasi: photoUrls[0] ?? '', skorPotensi, tujuanSurvei: 'potensi_penanaman',
          googleMapsUrl: mapsUrl(potensi.koordinatLat, potensi.koordinatLng),
          luasanPotensi: potensi.luasanPotensi,
          aksesibilitas: potensi.aksesibilitas, pengaruhPasang: potensi.pengaruhPasang,
          ancamanUtama: potensi.ancamanUtama,
          tingkatAbrasi: potensi.adaTitikRawan ? potensi.tingkatAbrasi : undefined,
          prioritasAbrasi: potensi.adaTitikRawan ? potensi.prioritasAbrasi : undefined,
          kondisiSebelum: potensi.adaTitikRawan ? potensi.kondisiSebelum : undefined,
          kondisiSesudah: potensi.adaTitikRawan ? potensi.kondisiSesudah : undefined,
          panjangTerdampak: potensi.adaTitikRawan ? potensi.panjangTerdampak : undefined,
          namaPantai: potensi.namaArea,
        };
        saveSurvey(record);
        queueResult = await enqueueSurvey({
          id: surveyId, tujuan_survei: 'potensi_penanaman',
          petugas_nama: potensi.namaPetugas, petugas_nip: null,
          petugas_unit: potensi.unitKerja, location_id: record.locationId,
          location_name: potensi.namaArea, province: potensi.provinsi,
          tanggal: potensi.tanggal, metode_survei: 'ground_check',
          koordinat_lat: parseFloat(potensi.koordinatLat) || null,
          koordinat_lng: parseFloat(potensi.koordinatLng) || null,
          gps_accuracy: gpsAccuracy,
          tutupan_tajuk: parseFloat(potensi.tutupanTajuk) || null,
          kerapatan_estimasi: null, spesies_dominan: null, spesies_lain: null,
          laju_regenerasi: null, kondisi_serasah: null,
          salinitas: null, ph: null,
          suhu: null, kekeruhan: null, substrat: potensi.substrat,
          elevasi: null, pasang_surut: potensi.pengaruhPasang,
          ancaman_utama: potensi.ancamanUtama, jarak_pemukiman: parseFloat(potensi.jarakPemukiman) || null,
          luas_tambak_estimasi: null, aktivitas_manusia: potensi.indikasi || null,
          status_tenurial: potensi.statusTenurial, kondisi_umum: potensi.kondisiUmum,
          rekomendasi_lapangan: potensi.rekomendasiLapangan, photo_urls: photoUrls, sync_status: 'pending',
        });
      } else if (tujuan === 'pendaratan_penyu') {
        const validSarang = sarangList.filter(s => s.lat && s.lng);
        const firstSarang = validSarang[0];
        const mainLat = penyu.koordinatLat || firstSarang?.lat || '';
        const mainLng = penyu.koordinatLng || firstSarang?.lng || '';
        const sarangPhotoSources = validSarang
          .map(s => s.fotoUrl || s.fotoPreview)
          .filter((src): src is string => Boolean(src));
        const allPhotoUrls = [...photoUrls, ...sarangPhotoSources];
        record = {
          id: surveyId, timestamp: new Date().toISOString(),
          namaPetugas: penyu.namaPetugas, unit: penyu.unitKerja,
          locationId: `PENYU-${Date.now()}`, locationName: penyu.namaPantai || '(Titik Penyu)',
          province: penyu.provinsi,
          tutupanTajuk: '', kerapatan: '', salinitas: '', ancamanCount: penyu.ancamanUtama.length,
          kondisiUmum: penyu.kondisiUmum, isCustomLoc: true,
          substrat: penyu.substrat, koordinatLat: mainLat, koordinatLng: mainLng,
          rekomendasiLapangan: penyu.rekomendasiLapangan,
          ancamanUtama: penyu.ancamanUtama,
          fotoDokumentasi: allPhotoUrls[0] ?? '', tujuanSurvei: 'pendaratan_penyu',
          googleMapsUrl: mapsUrl(mainLat, mainLng),
          jenisPenyu: penyu.jenisPenyu, jumlahSarang: String(validSarang.length),
          statusPerlindungan: penyu.statusPerlindungan, namaPantai: penyu.namaPantai,
          sarangPoints: validSarang.map(s => ({
            lat: s.lat,
            lng: s.lng,
            catatan: s.catatan,
            waktu: s.waktu,
            fotoUrl: s.fotoUrl || s.fotoPreview,
          })),
        };
        saveSurvey(record);
        queueResult = await enqueueSurvey({
          id: surveyId, tujuan_survei: 'pendaratan_penyu',
          petugas_nama: penyu.namaPetugas, petugas_nip: null,
          petugas_unit: penyu.unitKerja, location_id: record.locationId,
          location_name: penyu.namaPantai, province: penyu.provinsi,
          tanggal: penyu.tanggal, metode_survei: 'ground_check',
          koordinat_lat: parseFloat(mainLat) || null,
          koordinat_lng: parseFloat(mainLng) || null,
          gps_accuracy: gpsAccuracy,
          tutupan_tajuk: null, kerapatan_estimasi: null, spesies_dominan: penyu.jenisPenyu,
          spesies_lain: null, laju_regenerasi: null, kondisi_serasah: null,
          salinitas: null, ph: null, suhu: null, kekeruhan: null, substrat: penyu.substrat,
          elevasi: null, pasang_surut: null,
          ancaman_utama: penyu.ancamanUtama, jarak_pemukiman: null, luas_tambak_estimasi: null,
          aktivitas_manusia: null, status_tenurial: null,
          kondisi_umum: penyu.kondisiUmum,
          rekomendasi_lapangan: penyu.rekomendasiLapangan, photo_urls: allPhotoUrls, sync_status: 'pending',
          jenis_penyu: penyu.jenisPenyu,
          jumlah_sarang: validSarang.length,
          status_perlindungan: penyu.statusPerlindungan,
          sarang_points: validSarang.map(s => ({
            lat: s.lat, lng: s.lng,
            catatan: s.catatan, waktu: s.waktu,
            fotoUrl: s.fotoUrl || s.fotoPreview,
          })),
        });
      }

      if (!record) {
        setSavingStatus('idle');
        return;
      }

      setSavingStatus(queueResult.offline ? 'saved_offline' : 'saved_online');
      setSubmitted(true);
    } catch (error) {
      console.warn('[ID-MAP] Gagal sinkron penuh, data tetap disimpan lokal:', error);
      if (record) {
        setSavingStatus('saved_offline');
        setSubmitted(true);
      } else {
        setSavingStatus('idle');
      }
    }
  };

  const handlePrintBA = () => {
    const previewSurvey: SurveyRecord = tujuan === 'potensi_penanaman'
      ? {
        id: 'preview',
        timestamp: new Date().toISOString(),
        namaPetugas: potensi.namaPetugas,
        unit: potensi.unitKerja,
        locationId: 'preview',
        locationName: potensi.namaArea,
        province: potensi.provinsi,
        tutupanTajuk: potensi.tutupanTajuk,
        kerapatan: '',
        salinitas: '',
        ancamanCount: potensi.ancamanUtama.length,
        kondisiUmum: potensi.kondisiUmum,
        isCustomLoc: true,
        substrat: potensi.substrat,
        koordinatLat: potensi.koordinatLat,
        koordinatLng: potensi.koordinatLng,
        rekomendasiLapangan: potensi.rekomendasiLapangan,
        statusTenurial: potensi.statusTenurial,
        ancamanUtama: potensi.ancamanUtama,
        tujuanSurvei: 'potensi_penanaman',
        skorPotensi: hitungSkorPotensi(potensi.substrat, '', potensi.tutupanTajuk),
      }
      : tujuan === 'pendaratan_penyu'
        ? {
          id: 'preview',
          timestamp: new Date().toISOString(),
          namaPetugas: penyu.namaPetugas,
          unit: penyu.unitKerja,
          locationId: 'preview',
          locationName: penyu.namaPantai,
          province: penyu.provinsi,
          tutupanTajuk: '',
          kerapatan: '',
          salinitas: '',
          ancamanCount: penyu.ancamanUtama.length,
          kondisiUmum: penyu.kondisiUmum,
          isCustomLoc: true,
          substrat: penyu.substrat,
          koordinatLat: penyu.koordinatLat || sarangList.find(s => s.lat && s.lng)?.lat || '',
          koordinatLng: penyu.koordinatLng || sarangList.find(s => s.lat && s.lng)?.lng || '',
          rekomendasiLapangan: penyu.rekomendasiLapangan,
          ancamanUtama: penyu.ancamanUtama,
          tujuanSurvei: 'pendaratan_penyu',
          jenisPenyu: penyu.jenisPenyu,
          jumlahSarang: String(sarangList.filter(s => s.lat && s.lng).length),
          statusPerlindungan: penyu.statusPerlindungan,
          sarangPoints: sarangList.filter(s => s.lat && s.lng).map(s => ({
            lat: s.lat,
            lng: s.lng,
            waktu: s.waktu,
            catatan: s.catatan,
            fotoUrl: s.fotoUrl || s.fotoPreview,
          })),
        }
        : {
          id: 'preview',
          timestamp: new Date().toISOString(),
          namaPetugas: monVeg.namaPetugas,
          unit: monVeg.unitKerja,
          locationId: monVeg.locationId || 'preview',
          locationName: monVeg.namaLokasi,
          province: monVeg.provinsi,
          tutupanTajuk: monVeg.tutupanTajuk,
          kerapatan: monVeg.kerapatanEstimasi,
          salinitas: '',
          ancamanCount: monVeg.ancamanUtama.length,
          kondisiUmum: monVeg.kondisiUmum,
          isCustomLoc: true,
          substrat: monVeg.substrat,
          koordinatLat: monVeg.koordinatLat,
          koordinatLng: monVeg.koordinatLng,
          spesiesDominan: monVeg.spesiesDominan,
          rekomendasiLapangan: monVeg.rekomendasiLapangan,
          statusTenurial: monVeg.statusTenurial,
          lajuRegenerasi: monVeg.lajuRegenerasi,
          mhiMangrove: monVeg.mhiMangrove,
          ancamanUtama: monVeg.ancamanUtama,
          tujuanSurvei: 'monitoring',
          jenisVegetasi: monVeg.jenisVegetasi,
        };

    printSurveyBA(previewSurvey);
  };

  // â"€â"€ Success Screen â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  if (submitted) {
    const isOffline = savingStatus === 'saved_offline';
    const tujuanLabel = tujuan === 'monitoring_vegetasi' ? 'Monitoring Mangrove / Vegetasi'
      : tujuan === 'potensi_penanaman' ? 'Potensi & Rekomendasi Penanaman'
      : 'Titik Pendaratan Penyu';
    const namaLokasi = tujuan === 'monitoring_vegetasi' ? monVeg.namaLokasi
      : tujuan === 'potensi_penanaman' ? potensi.namaArea
      : penyu.namaPantai;
    const namaPetugas = tujuan === 'monitoring_vegetasi' ? monVeg.namaPetugas : tujuan === 'potensi_penanaman' ? potensi.namaPetugas : penyu.namaPetugas;
    const tanggal = tujuan === 'monitoring_vegetasi' ? monVeg.tanggal : tujuan === 'potensi_penanaman' ? potensi.tanggal : penyu.tanggal;
    const isVerifikator = user?.role === 'verifikator';

    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-4">
          <div className={`w-14 h-14 ${isOffline ? 'bg-amber-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto`}>
            {isOffline ? <WifiOff className="w-7 h-7 text-amber-600" /> : <CheckCircle className="w-7 h-7 text-green-600" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Data Berhasil Disimpan</h2>
            <p className="text-xs text-gray-500 mt-1">{tujuanLabel}</p>
          </div>

          {!isVerifikator && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Menunggu Verifikasi
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Data yang Anda kirimkan akan diverifikasi oleh Verifikator sebelum dapat digunakan untuk analisis dan laporan resmi.
              </p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-xs space-y-1.5">
            <div className="flex justify-between"><span className="text-gray-500">Lokasi</span><span className="font-semibold text-gray-800">{namaLokasi}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Petugas</span><span className="font-semibold text-gray-800">{namaPetugas}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tanggal</span><span className="font-semibold text-gray-800">{tanggal}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Foto</span><span className="font-semibold text-gray-800">{photos.length} foto</span></div>
            {!isVerifikator && (
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-semibold text-amber-700">Menunggu Verifikasi</span></div>
            )}
            {tujuan === 'potensi_penanaman' && (
              <div className="flex justify-between">
                <span className="text-gray-500">Skor Potensi</span>
                <span className="font-bold text-green-700">{hitungSkorPotensi(potensi.substrat, '', potensi.tutupanTajuk)}/10</span>
              </div>
            )}
          </div>
          {isOffline && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Data tersimpan di perangkat. Akan otomatis tersinkron saat ada koneksi.
            </p>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={resetFormState}
              className="px-5 py-2 bg-[#071520] text-white text-sm font-semibold rounded-lg hover:bg-[#0d404f] transition-colors"
            >
              Input Data Baru
            </button>
            <button onClick={handlePrintBA}
              className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              Cetak BA
            </button>
          </div>
        </div>
      </div>
    );
  }

  // â"€â"€ Header bar â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  const TYPE_CARDS: { id: TujuanSurvei; label: string; sub: string; icon: React.ElementType; color: string; bg: string; border: string }[] = [
    {
      id: 'monitoring_vegetasi', label: 'Monitoring Mangrove / Vegetasi', sub: 'Monitoring mangrove dan/atau vegetasi pesisir di lokasi',
      icon: Leaf, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300',
    },
    {
      id: 'potensi_penanaman', label: 'Potensi & Rekomendasi', sub: 'Survey potensi penanaman & titik rawan lokasi',
      icon: Sprout, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300',
    },
    {
      id: 'pendaratan_penyu', label: 'Pendaratan Penyu', sub: 'Titik pendaratan & sarang penyu',
      icon: Turtle, color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-300',
    },
  ];

  // â"€â"€ Type Selector â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* Online Badge */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#071520] rounded-lg flex items-center justify-center">
            <ClipboardList className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Modul EcoTrack</p>
            <p className="text-base font-bold text-gray-900">Input Data Lapangan</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
          isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* GPS Extracted from Photo Banner */}
      {gpsExtractedFromPhoto && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-3 flex items-center gap-2">
          <div className="w-7 h-7 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
            <Navigation className="w-3.5 h-3.5 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-800">Koordinat GPS otomatis terdeteksi dari foto</p>
            <p className="text-xs text-green-700 font-mono">{gpsExtractedFromPhoto.lat}, {gpsExtractedFromPhoto.lng}{gpsExtractedFromPhoto.waktu ? ` Â· ${gpsExtractedFromPhoto.waktu}` : ''}</p>
          </div>
          <button onClick={() => setGpsExtractedFromPhoto(null)} className="text-green-400 hover:text-green-700 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tujuan Survei Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Pilih Tujuan Survei</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TYPE_CARDS.map(c => (
            <button key={c.id} onClick={() => handleSelectTujuan(c.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                tujuan === c.id ? `${c.bg} ${c.border} shadow-sm` : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${tujuan === c.id ? c.bg : 'bg-gray-100'}`}>
                <c.icon className={`w-4.5 h-4.5 ${tujuan === c.id ? c.color : 'text-gray-500'}`} />
              </div>
              <p className={`text-sm font-bold ${tujuan === c.id ? c.color : 'text-gray-800'}`}>{c.label}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{c.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Riwayat Aktivitas</p>
              <p className="text-xs text-gray-500">Cek input sebelumnya dan cetak BA kapan saja.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {historyItems.length} data
          </span>
        </div>

        {historyItems.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-xl px-4 py-6 text-center text-sm text-gray-400">
            Belum ada riwayat input untuk akun ini.
          </div>
        ) : (
          <div className="space-y-3">
            {historyItems.map(item => {
              const isExpanded = expandedHistoryId === item.id;
              return (
                <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="p-3 flex items-start justify-between gap-3">
                    <div className="flex gap-3 min-w-0">
                      {item.fotoDokumentasi ? (
                        <img src={getCloudinaryUrl(item.fotoDokumentasi, 'w_128,c_fill,q_auto,f_auto')} alt={item.locationName} className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0" loading="lazy" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <Camera className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{item.locationName || item.namaPantai || 'Lokasi survei'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{getSurveyTypeLabel(item.tujuanSurvei)}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                          <span>{new Date(item.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span>{item.unit || '-'}</span>
                          {item.verificationStatus && (
                            <span className={`font-semibold ${
                              item.verificationStatus === 'approved' ? 'text-green-700' :
                              item.verificationStatus === 'rejected' ? 'text-red-700' : 'text-amber-700'
                            }`}>
                              {item.verificationStatus === 'approved' ? 'Disetujui' : item.verificationStatus === 'rejected' ? 'Ditolak' : 'Menunggu'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                        className="px-3 py-1.5 text-xs font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {isExpanded ? 'Tutup' : 'Lihat'}
                      </button>
                      <button
                        type="button"
                        onClick={() => printSurveyBA(item)}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Cetak BA
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <p className="text-gray-400 mb-1">Koordinat</p>
                          <p className="font-mono text-gray-700 break-all">{item.koordinatLat || '-'}, {item.koordinatLng || '-'}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <p className="text-gray-400 mb-1">Kondisi Umum</p>
                          <p className="text-gray-700 line-clamp-3">{item.kondisiUmum || '-'}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <p className="text-gray-400 mb-1">Rekomendasi</p>
                          <p className="text-gray-700 line-clamp-3">{item.rekomendasiLapangan || '-'}</p>
                        </div>
                      </div>

                      {item.sarangPoints && item.sarangPoints.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Titik Sarang</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {item.sarangPoints.map((point, idx) => (
                              <div key={`${item.id}-history-${idx}`} className="flex gap-3 border border-gray-100 rounded-lg p-2">
                                {point.fotoUrl ? (
                                  <img src={getCloudinaryUrl(point.fotoUrl, 'w_112,c_fill,q_auto,f_auto')} alt={`Titik ${idx + 1}`} className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0" loading="lazy" />
                                ) : (
                                  <div className="w-14 h-14 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center flex-shrink-0">
                                    <Camera className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                                <div className="text-xs text-gray-600 min-w-0">
                                  <p className="font-semibold text-gray-700 mb-1">Titik {idx + 1}</p>
                                  <p className="font-mono break-all">{point.lat || '-'}, {point.lng || '-'}</p>
                                  <p className="mt-1">{point.waktu || '-'}</p>
                                  {point.catatan && <p className="mt-1 text-gray-500">{point.catatan}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Anchor untuk auto-scroll ke form saat user memilih tujuan survei */}
      <div ref={formAnchorRef} className="scroll-mt-4" />

      {/* â"€â"€ FORM: Monitoring Mangrove / Vegetasi (merged) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      {tujuan === 'monitoring_vegetasi' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">

          {/* Identitas */}
          <div className="space-y-3">
            <SectionHead icon={ClipboardList} label="Identitas Petugas & Lokasi" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <G label="Nama Petugas" req><Inp value={monVeg.namaPetugas} onChange={setMV('namaPetugas')} placeholder="Nama lengkap" /></G>
              <UnitKerjaField value={monVeg.unitKerja} onChange={setMV('unitKerja')} required />
              <G label="Tanggal Survei" req><Inp type="date" value={monVeg.tanggal} onChange={setMV('tanggal')} /></G>
            </div>
            <G label="Koordinat GPS" req>
              <GPSBlock lat={currentLat} lng={currentLng} onCapture={handleGPS} onPhotoGps={handlePhotoGpsData} />
              {gpsAccuracy && <p className="text-xs text-green-600 mt-0.5">Akurasi Â±{gpsAccuracy}m</p>}
            </G>
            <G label="Nama Lokasi / Kawasan" req>
              <Inp value={monVeg.namaLokasi} onChange={setMV('namaLokasi')} placeholder="cth: Pantai Sendangbiru Blok Mangrove A" />
            </G>
            <div className="grid grid-cols-2 gap-3">
              <G label="Provinsi" req>
                <select value={monVeg.provinsi} onChange={e => setMonVeg(p => ({ ...p, provinsi: e.target.value, kabKota: '' }))} className={cls}>
                  <option value="">-- Pilih --</option>
                  {PROVINSI_LIST.map(p => <option key={p}>{p}</option>)}
                </select>
              </G>
              <G label="Kabupaten/Kota">
                <select value={monVeg.kabKota} onChange={e => setMonVeg(p => ({ ...p, kabKota: e.target.value }))} disabled={!monVeg.provinsi} className={cls}>
                  <option value="">-- Pilih --</option>
                  {(KABKOTA_BY_PROVINSI[monVeg.provinsi] ?? []).map(k => <option key={k}>{k}</option>)}
                </select>
              </G>
            </div>
            <G label="Metode Survei">
              <Sel value={monVeg.metodeSurvei} onChange={setMV('metodeSurvei')}>
                <option value="ground_check">Ground Check Lapangan</option>
                <option value="transek">Transek Plot (20x20m)</option>
                <option value="drone">Pemotretan Drone</option>
                <option value="iot">Pembacaan Sensor IoT</option>
              </Sel>
            </G>
          </div>

          {/* Toggle: apa yang ada di lokasi */}
          <div className="space-y-3">
            <SectionHead icon={Leaf} label="Data yang Ditemukan di Lokasi" />
            <p className="text-xs text-gray-500">Centang sesuai kondisi di lokasi. Bisa salah satu atau keduanya.</p>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${monVeg.adaMangrove ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" checked={monVeg.adaMangrove} onChange={e => setMonVeg(p => ({ ...p, adaMangrove: e.target.checked }))} className="w-4 h-4 accent-green-600" />
                <div>
                  <p className="text-sm font-bold text-gray-800">Mangrove</p>
                  <p className="text-xs text-gray-500">Ekosistem bakau, api-api, dll</p>
                </div>
              </label>
              <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${monVeg.adaVegetasi ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" checked={monVeg.adaVegetasi} onChange={e => setMonVeg(p => ({ ...p, adaVegetasi: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                <div>
                  <p className="text-sm font-bold text-gray-800">Vegetasi Pesisir</p>
                  <p className="text-xs text-gray-500">Cemara udang, pandan, ketapang, dll</p>
                </div>
              </label>
            </div>
          </div>

          {/* Mangrove section */}
          {monVeg.adaMangrove && (
            <div className="space-y-3 border-l-4 border-green-400 pl-4">
              <SectionHead icon={Leaf} label="Data Mangrove" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <G label="Tutupan Tajuk (%)" req><Inp type="number" min="0" max="100" value={monVeg.tutupanTajuk} onChange={setMV('tutupanTajuk')} placeholder="0-100" /></G>
                <G label="Kerapatan (phn/ha)"><Inp type="number" min="0" value={monVeg.kerapatanEstimasi} onChange={setMV('kerapatanEstimasi')} placeholder="misal: 1200" /></G>
                <G label="Penilaian MHI Mangrove">
                  <Sel value={monVeg.mhiMangrove} onChange={setMV('mhiMangrove')}>
                    <option value="jarang">Jarang (&lt;1000 pohon/ha)</option>
                    <option value="sedang">Sedang (1000-1500 pohon/ha)</option>
                    <option value="padat">Padat (&gt;1500 pohon/ha)</option>
                  </Sel>
                </G>
                <G label="Laju Regenerasi">
                  <Sel value={monVeg.lajuRegenerasi} onChange={setMV('lajuRegenerasi')}>
                    <option value="tinggi">Tinggi</option>
                    <option value="sedang">Sedang</option>
                    <option value="rendah">Rendah</option>
                  </Sel>
                </G>
                <G label="Kondisi Serasah">
                  <Sel value={monVeg.kondisiSerasah} onChange={setMV('kondisiSerasah')}>
                    <option value="lebat">Lebat</option>
                    <option value="normal">Normal</option>
                    <option value="minim">Minim</option>
                  </Sel>
                </G>
              </div>
              <p className="text-xs text-gray-500 -mt-1">
                Kerapatan mangrove umumnya dikategorikan menjadi jarang (&lt;1000 pohon/ha), sedang (1000-1500 pohon/ha), dan padat (&gt;1500 pohon/ha).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <G label="Spesies Dominan">
                  <Sel value={monVeg.spesiesDominan} onChange={setMV('spesiesDominan')}>
                    {SPESIES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Sel>
                </G>
                <G label="Spesies Lain (pisahkan koma)"><Inp value={monVeg.spesiesLain} onChange={setMV('spesiesLain')} placeholder="Bruguiera, Ceriops..." /></G>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <G label="Substrat">
                  <Sel value={monVeg.substrat} onChange={setMV('substrat')}>
                    <option value="lumpur">Lumpur</option>
                    <option value="campuran">Campuran</option>
                    <option value="pasir">Pasir</option>
                    <option value="berbatu">Berbatu</option>
                  </Sel>
                </G>
              </div>
            </div>
          )}

          {/* Vegetasi pesisir section */}
          {monVeg.adaVegetasi && (
            <div className="space-y-3 border-l-4 border-emerald-400 pl-4">
              <SectionHead icon={Trees} label="Data Vegetasi Pesisir" color="text-[#0d404f]" />
              <div className="grid grid-cols-2 gap-3">
                <G label="Jenis Vegetasi Utama" req>
                  <Sel value={monVeg.jenisVegetasi} onChange={setMV('jenisVegetasi')}>
                    {VEGETASI_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Sel>
                </G>
                <G label="Spesies Lain (pisahkan koma)">
                  <Inp value={monVeg.vegetasiLain} onChange={setMV('vegetasiLain')} placeholder="Pandan, Ketapang, Waru..." />
                </G>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <G label="Luas Area (ha)"><Inp type="number" min="0" step="0.1" value={monVeg.luasArea} onChange={setMV('luasArea')} placeholder="0" /></G>
                <G label="Jumlah Tegakan (est.)"><Inp type="number" min="0" value={monVeg.jumlahTegakan} onChange={setMV('jumlahTegakan')} placeholder="misal: 500" /></G>
                <G label="Tinggi Rata-rata (m)"><Inp type="number" min="0" step="0.1" value={monVeg.tinggiRataRata} onChange={setMV('tinggiRataRata')} placeholder="misal: 3.5" /></G>
                <G label="Kondisi Vegetasi">
                  <Sel value={monVeg.kondisiVegetasi} onChange={setMV('kondisiVegetasi')}>
                    <option value="sangat_baik">Sangat Baik</option>
                    <option value="baik">Baik</option>
                    <option value="sedang">Sedang</option>
                    <option value="kritis">Kritis</option>
                  </Sel>
                </G>
              </div>
            </div>
          )}

          {/* Ancaman & Status */}
          <div className="space-y-3">
            <SectionHead icon={AlertTriangle} label="Ancaman & Status Lahan" color="text-orange-700" />
            <G label="Ancaman yang Diamati">
              <AncamanChecks selected={monVeg.ancamanUtama} onChange={v => setMonVeg(p => ({ ...p, ancamanUtama: v }))} />
            </G>
            <G label="Status Lahan">
              <Sel value={monVeg.statusTenurial} onChange={setMV('statusTenurial')}>
                <option value="aman">Aman - tidak ada konflik</option>
                <option value="proses_legal">Proses Legal</option>
                <option value="bersengketa">Bersengketa</option>
              </Sel>
            </G>
          </div>

          {/* Catatan */}
          <div className="space-y-3">
            <SectionHead icon={Info} label="Catatan & Rekomendasi" />
            <G label="Kondisi Umum Kawasan" req><TA value={monVeg.kondisiUmum} onChange={setMV('kondisiUmum')} placeholder="Deskripsikan kondisi umum yang ditemukan di lapangan..." rows={3} /></G>
            <G label="Rekomendasi Tindakan"><TA value={monVeg.rekomendasiLapangan} onChange={setMV('rekomendasiLapangan')} placeholder="Tindakan yang direkomendasikan berdasarkan hasil survei..." rows={2} /></G>
          </div>

          {/* Foto */}
          <div className="space-y-2">
            <SectionHead icon={Camera} label="Foto Dokumentasi" />
            <PhotoBlock photos={photos} setPhotos={setPhotos} isOnline={isOnline} onGpsExtracted={handlePhotoGpsData} />
          </div>

          <button onClick={handleSubmit} disabled={!monVeg.namaPetugas || !monVeg.koordinatLat || (!monVeg.adaMangrove && !monVeg.adaVegetasi) || savingStatus === 'saving'}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#071520] hover:bg-[#0d404f] text-white font-bold rounded-xl transition-colors disabled:opacity-50">
            {savingStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {savingStatus === 'saving' ? 'Menyimpan...' : 'Simpan Data Monitoring Mangrove / Vegetasi'}
          </button>
        </div>
      )}

      {/* â"€â"€ FORM: Potensi & Rekomendasi Penanaman (merged with Titik Rawan) â"€â"€â"€ */}
      {tujuan === 'potensi_penanaman' && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 space-y-5">

          {/* Identitas */}
          <div className="space-y-3">
            <SectionHead icon={ClipboardList} label="Identitas Petugas & Lokasi Survei" color="text-blue-700" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <G label="Nama Petugas" req><Inp value={potensi.namaPetugas} onChange={setPo('namaPetugas')} placeholder="Nama lengkap" /></G>
              <UnitKerjaField value={potensi.unitKerja} onChange={setPo('unitKerja')} />
              <G label="Tanggal" req><Inp type="date" value={potensi.tanggal} onChange={setPo('tanggal')} /></G>
            </div>
            <G label="Koordinat GPS" req>
              <GPSBlock lat={currentLat} lng={currentLng} onCapture={handleGPS} onPhotoGps={handlePhotoGpsData} />
            </G>
            <G label="Nama Area / Lokasi Survei" req>
              <Inp value={potensi.namaArea} onChange={setPo('namaArea')} placeholder="cth: Pesisir Muara Gembong Blok A" />
            </G>
            <div className="grid grid-cols-2 gap-3">
              <G label="Provinsi" req>
                <select value={potensi.provinsi} onChange={e => setPotensi(p => ({ ...p, provinsi: e.target.value, kabKota: '' }))} className={cls}>
                  <option value="">-- Pilih --</option>
                  {PROVINSI_LIST.map(p => <option key={p}>{p}</option>)}
                </select>
              </G>
              <G label="Kabupaten/Kota">
                <select value={potensi.kabKota} onChange={e => setPotensi(p => ({ ...p, kabKota: e.target.value }))} disabled={!potensi.provinsi} className={cls}>
                  <option value="">-- Pilih --</option>
                  {(KABKOTA_BY_PROVINSI[potensi.provinsi] ?? []).map(k => <option key={k}>{k}</option>)}
                </select>
              </G>
            </div>
          </div>

          {/* Biofisik */}
          <div className="space-y-3">
            <SectionHead icon={Droplets} label="Kondisi Biofisik & Potensi" color="text-blue-700" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <G label="Substrat" req>
                <Sel value={potensi.substrat} onChange={setPo('substrat')}>
                  <option value="lumpur">Lumpur</option>
                  <option value="campuran">Campuran</option>
                  <option value="pasir">Pasir</option>
                  <option value="berbatu">Berbatu</option>
                </Sel>
              </G>
              <G label="Tutupan Saat Ini (%)"><Inp type="number" min="0" max="100" value={potensi.tutupanTajuk} onChange={setPo('tutupanTajuk')} placeholder="0-100" /></G>
            </div>

            {/* Skor potensi live */}
            {(potensi.substrat || potensi.tutupanTajuk) && (() => {
              const skor = hitungSkorPotensi(potensi.substrat, '', potensi.tutupanTajuk);
              const spesiesRek = rekomendasiSpesiesBySubstrat(potensi.substrat);
              const warna = skor >= 7 ? 'bg-green-50 border-green-200' : skor >= 5 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200';
              return (
                <div className={`rounded-xl border p-3 ${warna}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700">Skor Potensi Penanaman</p>
                    <span className={`text-sm font-bold ${skor >= 7 ? 'text-green-700' : skor >= 5 ? 'text-yellow-700' : 'text-gray-500'}`}>{skor}/10</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${skor >= 7 ? 'bg-green-500' : skor >= 5 ? 'bg-yellow-400' : 'bg-gray-400'}`} style={{ width: `${skor * 10}%` }} />
                  </div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Spesies Rekomendasi:</p>
                  <div className="flex flex-wrap gap-1">
                    {spesiesRek.map((sp, i) => <span key={i} className="text-xs italic bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full">{sp}</span>)}
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <G label="Estimasi Luas Potensi (ha)"><Inp type="number" min="0" value={potensi.luasanPotensi} onChange={setPo('luasanPotensi')} placeholder="0" /></G>
              <G label="Aksesibilitas">
                <Sel value={potensi.aksesibilitas} onChange={v => setPotensi(p => ({ ...p, aksesibilitas: v as PotensiForm['aksesibilitas'] }))}>
                  <option value="mudah">Mudah dicapai</option>
                  <option value="sedang">Sedang</option>
                  <option value="sulit">Sulit / terpencil</option>
                </Sel>
              </G>
              <G label="Pengaruh Pasang Surut">
                <Sel value={potensi.pengaruhPasang} onChange={setPo('pengaruhPasang')}>
                  <option value="ya">Ya - terpengaruh pasut</option>
                  <option value="tidak">Tidak / minimal</option>
                </Sel>
              </G>
            </div>
          </div>

          {/* Titik Rawan toggle */}
          <div className="space-y-3">
            <SectionHead icon={AlertTriangle} label="Titik Rawan & Abrasi" color="text-orange-700" />
            <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${potensi.adaTitikRawan ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="checkbox" checked={potensi.adaTitikRawan} onChange={e => setPotensi(p => ({ ...p, adaTitikRawan: e.target.checked }))} className="w-4 h-4 accent-orange-600" />
              <div>
                <p className="text-sm font-bold text-gray-800">Lokasi termasuk area rawan abrasi</p>
                <p className="text-xs text-gray-500">Centang jika lokasi ini memiliki titik rawan erosi/abrasi pantai</p>
              </div>
            </label>

            {potensi.adaTitikRawan && (
              <div className="border-l-4 border-orange-400 pl-4 space-y-3">
                <G label="Indikasi / Penyebab Abrasi">
                  <Inp value={potensi.indikasi} onChange={setPo('indikasi')} placeholder="cth: Ombak kuat, tidak ada vegetasi pelindung" />
                </G>
                <div className="grid grid-cols-2 gap-3">
                  <G label="Tingkat Abrasi">
                    <Sel value={potensi.tingkatAbrasi} onChange={v => setPotensi(p => ({ ...p, tingkatAbrasi: v as PotensiForm['tingkatAbrasi'] }))}>
                      <option value="ringan">Ringan</option>
                      <option value="sedang">Sedang</option>
                      <option value="parah">Parah</option>
                      <option value="sangat_parah">Sangat Parah</option>
                    </Sel>
                  </G>
                  <G label="Prioritas Penanganan">
                    <Sel value={potensi.prioritasAbrasi} onChange={v => setPotensi(p => ({ ...p, prioritasAbrasi: v as PotensiForm['prioritasAbrasi'] }))}>
                      <option value="Tinggi">Tinggi</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Rendah">Rendah</option>
                    </Sel>
                  </G>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <G label="Kondisi Sebelum Abrasi"><Inp value={potensi.kondisiSebelum} onChange={setPo('kondisiSebelum')} placeholder="cth: Pantai lebar, vegetasi alami" /></G>
                  <G label="Kondisi Saat Ini"><Inp value={potensi.kondisiSesudah} onChange={setPo('kondisiSesudah')} placeholder="cth: Garis pantai mundur 20m" /></G>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <G label="Panjang Terdampak (m)"><Inp type="number" min="0" value={potensi.panjangTerdampak} onChange={setPo('panjangTerdampak')} placeholder="meter" /></G>
                  <G label="Luas Terdampak (ha)"><Inp type="number" min="0" step="0.1" value={potensi.luasanTerdampak} onChange={setPo('luasanTerdampak')} placeholder="ha" /></G>
                </div>
                <G label="Ancaman yang Teridentifikasi">
                  <AncamanChecks selected={potensi.ancamanUtama} onChange={v => setPotensi(p => ({ ...p, ancamanUtama: v }))} />
                </G>
              </div>
            )}
          </div>

          {/* Status & Catatan */}
          <div className="space-y-3">
            <SectionHead icon={Info} label="Status & Rekomendasi" color="text-blue-700" />
            <div className="grid grid-cols-2 gap-3">
              <G label="Status Lahan">
                <Sel value={potensi.statusTenurial} onChange={setPo('statusTenurial')}>
                  <option value="aman">Aman</option>
                  <option value="proses_legal">Proses Legal</option>
                  <option value="bersengketa">Bersengketa</option>
                </Sel>
              </G>
              <G label="Jarak Pemukiman (km)"><Inp type="number" min="0" step="0.1" value={potensi.jarakPemukiman} onChange={setPo('jarakPemukiman')} placeholder="cth: 2.5" /></G>
            </div>
            <G label="Kondisi & Keterangan Area"><TA value={potensi.kondisiUmum} onChange={setPo('kondisiUmum')} placeholder="Deskripsikan kondisi area: vegetasi eksisting, tanda-tanda alami, potensi keberhasilan penanaman..." rows={3} /></G>
            <G label="Rekomendasi Petugas"><TA value={potensi.rekomendasiLapangan} onChange={setPo('rekomendasiLapangan')} placeholder="Jenis tanaman, jumlah bibit, metode tanam yang direkomendasikan..." rows={2} /></G>
          </div>

          {/* Foto */}
          <div className="space-y-2">
            <SectionHead icon={Camera} label="Foto Dokumentasi" color="text-blue-700" />
            <PhotoBlock photos={photos} setPhotos={setPhotos} isOnline={isOnline} onGpsExtracted={handlePhotoGpsData} />
          </div>

          <button onClick={handleSubmit} disabled={!potensi.namaPetugas || !potensi.namaArea || savingStatus === 'saving'}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
            {savingStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sprout className="w-4 h-4" />}
            {savingStatus === 'saving' ? 'Menyimpan...' : 'Simpan Data Potensi & Rekomendasi'}
          </button>
        </div>
      )}

      {/* Old Abrasi and Vegetasi forms removed - merged into Potensi & Monitoring forms */}

      {/* â"€â"€ FORM: Pendaratan Penyu â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      {tujuan === 'pendaratan_penyu' && (
        <div className="bg-white border border-teal-200 rounded-xl p-5 space-y-5">

          {/* Identitas */}
          <div className="space-y-3">
            <SectionHead icon={ClipboardList} label="Identitas Petugas & Lokasi" color="text-[#0d404f]" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <G label="Nama Petugas" req><Inp value={penyu.namaPetugas} onChange={setPn('namaPetugas')} placeholder="Nama lengkap" /></G>
              <UnitKerjaField value={penyu.unitKerja} onChange={setPn('unitKerja')} />
              <G label="Tanggal Survei" req><Inp type="date" value={penyu.tanggal} onChange={setPn('tanggal')} /></G>
            </div>
            <G label="Nama Pantai / Lokasi Pendaratan" req>
              <Inp value={penyu.namaPantai} onChange={setPn('namaPantai')} placeholder="cth: Pantai Tamban Segmen B" />
            </G>
            <div className="grid grid-cols-2 gap-3">
              <G label="Provinsi" req>
                <select value={penyu.provinsi} onChange={e => setPenyu(p => ({ ...p, provinsi: e.target.value, kabKota: '' }))} className={cls}>
                  <option value="">-- Pilih --</option>
                  {PROVINSI_LIST.map(p => <option key={p}>{p}</option>)}
                </select>
              </G>
              <G label="Kabupaten/Kota">
                <select value={penyu.kabKota} onChange={e => setPenyu(p => ({ ...p, kabKota: e.target.value }))} disabled={!penyu.provinsi} className={cls}>
                  <option value="">-- Pilih --</option>
                  {(KABKOTA_BY_PROVINSI[penyu.provinsi] ?? []).map(k => <option key={k}>{k}</option>)}
                </select>
              </G>
            </div>
          </div>

          {/* Data Penyu */}
          <div className="space-y-3">
            <SectionHead icon={Turtle} label="Data Pendaratan Penyu" color="text-[#0d404f]" />
            <div className="grid grid-cols-2 gap-3">
              <JenisPenyuField value={penyu.jenisPenyu} onChange={setPn('jenisPenyu')} />
              <G label="Status Perlindungan">
                <Sel value={penyu.statusPerlindungan} onChange={setPn('statusPerlindungan')}>
                  <option value="dilindungi">Dilindungi (PP 7/1999)</option>
                  <option value="kritis">Kritis (IUCN)</option>
                  <option value="rentan">Rentan (IUCN)</option>
                </Sel>
              </G>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <G label="Estimasi Jumlah Telur / Sarang"><Inp type="number" min="0" value={penyu.jumlahTelur} onChange={setPn('jumlahTelur')} placeholder="0" /></G>
              <G label="Panjang Pantai (m)"><Inp type="number" min="0" value={penyu.panjangPantai} onChange={setPn('panjangPantai')} placeholder="meter" /></G>
              <G label="Substrat Pantai">
                <Sel value={penyu.substrat} onChange={setPn('substrat')}>
                  <option value="pasir">Pasir halus</option>
                  <option value="pasir_kasar">Pasir kasar</option>
                  <option value="campuran">Campuran pasir-kerikil</option>
                  <option value="berbatu">Berbatu</option>
                </Sel>
              </G>
            </div>
            <G label="Kondisi Pantai Pendaratan">
              <Sel value={penyu.kondisiPantai} onChange={setPn('kondisiPantai')}>
                <option value="baik">Baik - pantai bersih, minim gangguan</option>
                <option value="sedang">Sedang - ada gangguan ringan</option>
                <option value="buruk">Buruk - banyak sampah/gangguan</option>
              </Sel>
            </G>
          </div>

          {/* Titik Sarang â€" multi-point */}
          <div className="space-y-3">
            <SectionHead icon={MapPin} label="Titik Sarang Per Koordinat" color="text-[#0d404f]" />
            <SarangMultiInput sarangList={sarangList} setSarangList={setSarangList} isOnline={isOnline} />
          </div>

          {/* Ancaman */}
          <div className="space-y-3">
            <SectionHead icon={AlertTriangle} label="Ancaman & Catatan" color="text-orange-700" />
            <G label="Ancaman terhadap Pendaratan Penyu">
              <AncamanChecks selected={penyu.ancamanUtama} onChange={v => setPenyu(p => ({ ...p, ancamanUtama: v }))} />
            </G>
            <G label="Kondisi Umum" req><TA value={penyu.kondisiUmum} onChange={setPn('kondisiUmum')} placeholder="Deskripsikan kondisi pantai, tanda-tanda pendaratan penyu, jejak, sarang yang ditemukan..." rows={3} /></G>
            <G label="Rekomendasi"><TA value={penyu.rekomendasiLapangan} onChange={setPn('rekomendasiLapangan')} placeholder="Tindakan perlindungan yang direkomendasikan..." rows={2} /></G>
          </div>

          {sarangList.filter(s => s.lat && s.lng).length === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
              Tambah minimal 1 titik koordinat untuk menyimpan data.
            </p>
          )}
          <button onClick={handleSubmit} disabled={!penyu.namaPetugas || !penyu.namaPantai || sarangList.filter(s => s.lat && s.lng).length === 0 || savingStatus === 'saving'}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#071520] hover:bg-[#0d404f] text-white font-bold rounded-xl transition-colors disabled:opacity-50">
            {savingStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Turtle className="w-4 h-4" />}
            {savingStatus === 'saving'
              ? 'Menyimpan...'
              : `Simpan ${sarangList.filter(s => s.lat && s.lng).length} Titik Sarang`
                + (sarangList.filter(s => s.fotoPreview).length > 0
                  ? ` + ${sarangList.filter(s => s.fotoPreview).length} Foto`
                  : ' (koordinat saja)')}
          </button>
        </div>
      )}

      {/* Placeholder saat belum pilih tujuan */}
      {!tujuan && (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Pilih tujuan survei di atas untuk memulai input data</p>
        </div>
      )}
    </div>
  );
}
