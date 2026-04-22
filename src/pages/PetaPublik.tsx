import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mangroveLocations, ekosistemData } from '../data/mockData';
import { titikAbrasiData } from '../data/abrasiData';
import { fetchSurveys, type SurveyRecord } from '../data/localStore';
import { Filter, Layers, MapPin, Map, Satellite, Mountain, ChevronRight, X, Download, FileText, LogIn, UserPlus, Activity, Clock3, CalendarRange, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const PDF_DOWNLOAD_COUNT_KEY = 'idmap_pdf_download_count';

const REPORT_WINDOWS = [
  { key: '7d', label: '7 hari', days: 7 },
  { key: '1m', label: '1 bulan', days: 30 },
  { key: '3m', label: '3 bulan', days: 90 },
  { key: '6m', label: '6 bulan', days: 180 },
  { key: '1y', label: '1 tahun', days: 365 },
] as const;

const penyuLocations = [
  { id: 'PNY-001', namaPantai: 'Pantai Bajul Mati', lokasi: 'Gedangan, Kab. Malang', lat: -8.394, lng: 112.530, jenis: 'Penyu Lekang', sarang: 12 },
  { id: 'PNY-002', namaPantai: 'Pantai Sendang Biru', lokasi: 'Sumbermanjing, Kab. Malang', lat: -8.437, lng: 112.620, jenis: 'Penyu Hijau', sarang: 8 },
  { id: 'PNY-003', namaPantai: 'Pantai Nganteb', lokasi: 'Tirtoyudo, Kab. Malang', lat: -8.466, lng: 112.720, jenis: 'Penyu Lekang', sarang: 5 },
  { id: 'PNY-004', namaPantai: 'Pantai Wonogoro', lokasi: 'Gedangan, Kab. Malang', lat: -8.381, lng: 112.508, jenis: 'Penyu Sisik', sarang: 3 },
  { id: 'PNY-005', namaPantai: 'Pantai Lenggoksono', lokasi: 'Tirtoyudo, Kab. Malang', lat: -8.458, lng: 112.750, jenis: 'Penyu Hijau', sarang: 7 },
  { id: 'PNY-006', namaPantai: 'Pantai Kondang Iwak', lokasi: 'Ampelgading, Kab. Malang', lat: -8.473, lng: 112.794, jenis: 'Penyu Lekang', sarang: 4 },
];

const MANGROVE_STATUS_COLORS: Record<string, string> = {
  lebat: '#22c55e',
  sedang: '#eab308',
  jarang: '#f97316',
  kritis: '#ef4444',
};

const MANGROVE_RADIUS: Record<string, number> = {
  lebat: 13, sedang: 10, jarang: 8, kritis: 7,
};

const ABRASI_PRIORITAS_COLORS: Record<string, string> = {
  Tinggi: '#ef4444',
  Sedang: '#f97316',
  'Rendah–Sedang': '#eab308',
};

const BENTHIC_COLORS: Record<string, string> = {
  Seagrass: '#22d3ee',
  Rubble: '#a8a29e',
  Sand: '#fcd34d',
  Rock: '#6b7280',
  'Coral/Algae': '#f472b6',
};

const MAP_LAYERS = [
  { id: 'osm', label: 'OpenStreetMap', icon: Map, url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
  { id: 'satellite', label: 'Satelit', icon: Satellite, url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
  { id: 'topo', label: 'Topografi', icon: Mountain, url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenTopoMap' },
];

function makeMangroveIcon(color = '#15803d') {
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);font-size:14px">🌿</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function makeTurtleIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:#0d9488;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);font-size:16px">🐢</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

function TileLayerSwitcher({ activeLayer }: { activeLayer: string }) {
  const layer = MAP_LAYERS.find(l => l.id === activeLayer) ?? MAP_LAYERS[0];
  return <TileLayer key={activeLayer} url={layer.url} attribution={layer.attribution} />;
}

export default function PetaPublik() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeLayerFilter, setActiveLayerFilter] = useState<'all' | 'mangrove' | 'abrasi' | 'penyu' | 'benthic'>('all');
  const [activeMapLayer, setActiveMapLayer] = useState('osm');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'mangrove' | 'abrasi' | 'penyu' | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showMangrove = activeLayerFilter === 'all' || activeLayerFilter === 'mangrove';
  const showAbrasi = activeLayerFilter === 'all' || activeLayerFilter === 'abrasi';
  const showPenyu = activeLayerFilter === 'all' || activeLayerFilter === 'penyu';
  const showBenthic = activeLayerFilter === 'all' || activeLayerFilter === 'benthic';

  const [benthicData, setBenthicData] = useState<any>(null);
  const [benthicLoading, setBenthicLoading] = useState(false);

  const [showDownloadGate, setShowDownloadGate] = useState(false);
  const [pdfDownloadCount, setPdfDownloadCount] = useState(0);

  const [surveyPenyu, setSurveyPenyu] = useState<typeof penyuLocations>([]);
  const [surveyAbrasi, setSurveyAbrasi] = useState<typeof titikAbrasiData>([]);
  const [allSurveys, setAllSurveys] = useState<SurveyRecord[]>([]);

  const mangroveFiltered = mangroveLocations;

  useEffect(() => {
    setPdfDownloadCount(Number(localStorage.getItem(PDF_DOWNLOAD_COUNT_KEY) ?? '0'));
    fetchSurveys().then(surveys => {
      setAllSurveys(surveys);

      const penyuFromDB = surveys
        .filter(s => s.tujuanSurvei === 'pendaratan_penyu' && s.koordinatLat && s.koordinatLng)
        .map(s => ({
          id: s.id,
          namaPantai: s.namaPantai || s.locationName || 'Pantai Pendaratan Penyu',
          lokasi: s.locationName || s.province || '',
          lat: parseFloat(s.koordinatLat!),
          lng: parseFloat(s.koordinatLng!),
          jenis: s.jenisPenyu || 'Penyu',
          sarang: parseInt(s.jumlahSarang || '0'),
        }))
        .filter(p => !isNaN(p.lat) && !isNaN(p.lng));
      if (penyuFromDB.length > 0) setSurveyPenyu(penyuFromDB);

      const abrasiFromDB = surveys
        .filter(s => s.tujuanSurvei === 'abrasi' && s.koordinatLat && s.koordinatLng)
        .map(s => ({
          id: s.id,
          namaPantai: s.namaPantai || s.locationName || 'Titik Abrasi',
          kecamatan: s.locationName || '',
          kabKota: s.province || '',
          provinsi: s.province || '',
          koordinat: { lat: parseFloat(s.koordinatLat!), lng: parseFloat(s.koordinatLng!) },
          indikasi: '',
          kondisiSebelum: '',
          kondisiSesudah: '',
          tanamanRekomendasi: s.rekomendasiLapangan ? [s.rekomendasiLapangan] : [],
          luasanRestorasi: { min: 0, max: 0, satuan: 'ha' },
          prioritas: 'Sedang' as const,
          substrat: (s.substrat || 'pasir') as any,
          ancamanUtama: s.ancamanUtama || [],
          skorRisiko: s.skorPotensi || 5,
        }))
        .filter(a => !isNaN(a.koordinat.lat) && !isNaN(a.koordinat.lng));
      if (abrasiFromDB.length > 0) setSurveyAbrasi(abrasiFromDB);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedId) setSidebarOpen(true);
  }, [selectedId]);

  const allPenyu = surveyPenyu.length > 0 ? surveyPenyu : penyuLocations;
  const allAbrasi = [...titikAbrasiData, ...surveyAbrasi];

  useEffect(() => {
    if (showBenthic && !benthicData) {
      setBenthicLoading(true);
      fetch('/benthic.json')
        .then(r => r.json())
        .then(d => { setBenthicData(d); setBenthicLoading(false); })
        .catch(() => setBenthicLoading(false));
    }
  }, [showBenthic, benthicData]);

  const selectedMangrove = mangroveLocations.find(l => l.id === selectedId && selectedType === 'mangrove');
  const selectedAbrasi = allAbrasi.find(l => l.id === selectedId && selectedType === 'abrasi');
  const selectedPenyu = allPenyu.find(l => l.id === selectedId && selectedType === 'penyu');
  const selectedEco = ekosistemData.find(e => e.locationId === selectedId);

  const totalLebat = mangroveLocations.filter(l => l.status === 'lebat').length;
  const totalSedang = mangroveLocations.filter(l => l.status === 'sedang').length;
  const totalJarang = mangroveLocations.filter(l => l.status === 'jarang').length;
  const totalKritis = mangroveLocations.filter(l => l.status === 'kritis').length;

  const reportStats = REPORT_WINDOWS.map(period => {
    const since = new Date(Date.now() - (period.days * 24 * 60 * 60 * 1000));
    const count = allSurveys.filter(s => new Date(s.timestamp) >= since).length;
    return { ...period, count };
  });

  const realtimeViews = allSurveys.filter(s => {
    const diff = Date.now() - new Date(s.timestamp).getTime();
    return diff <= 24 * 60 * 60 * 1000;
  }).length;

  const latestActivity = allSurveys[0]?.timestamp;

  const handleDownload = (type: 'pdf' | 'geo') => {
    if (!user) { setShowDownloadGate(true); return; }

    if (type === 'pdf') {
      const nextCount = pdfDownloadCount + 1;
      setPdfDownloadCount(nextCount);
      localStorage.setItem(PDF_DOWNLOAD_COUNT_KEY, String(nextCount));
      alert('Unduh PDF laporan dicatat. Integrasi file PDF dapat disambungkan berikutnya.');
      return;
    }

    alert('Unduh marker KML/GeoJSON sedang disiapkan...');
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0d1117] text-slate-200">
      <div className="flex flex-col gap-3 border-b border-white/10 bg-[#111827] px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <button onClick={() => navigate('/')} className="flex flex-shrink-0 items-center gap-2 transition-opacity hover:opacity-80">
            <img src="/logo.svg" alt="ID-MAP" className="h-7 w-auto" />
          </button>
          <div className="hidden h-6 w-px bg-white/20 sm:block" />
          <div className="min-w-0">
            <h1 className="text-sm font-bold leading-tight text-white sm:text-base">Peta Interaktif Mangrove</h1>
            <p className="mt-1 max-w-2xl text-[10px] leading-relaxed text-white/40 sm:text-xs">
              Data integrasi mangrove dan ekosistem pesisir berdasarkan hasil ground check dan pengolahan data spasial.
            </p>
          </div>
        </div>

        <div className="hidden flex-wrap items-center gap-2 xl:flex">
          {[
            { label: 'Lebat', count: totalLebat, color: '#22c55e' },
            { label: 'Sedang', count: totalSedang, color: '#eab308' },
            { label: 'Jarang', count: totalJarang, color: '#f97316' },
            { label: 'Kritis', count: totalKritis, color: '#ef4444' },
          ].map(s => (
            <div
              key={s.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
              {s.count} {s.label}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 lg:hidden"
          >
            {sidebarOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
            Panel
          </button>

          <button
            onClick={() => handleDownload('pdf')}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" /> Unduh
          </button>

          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-500"
            >
              Dashboard <ChevronRight className="h-3 w-3" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              <ChevronRight className="h-3.5 w-3.5" /> Home
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#161b27] px-4 py-3 sm:px-5">
        <div className="mr-1 flex items-center gap-1.5 text-xs text-white/50">
          <Filter className="h-3.5 w-3.5" /> Layer
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {([
            { val: 'all', label: 'Semua Layer', icon: '🗺️', color: '#94a3b8' },
            { val: 'mangrove', label: 'Mangrove', icon: '🌿', color: '#22c55e' },
            { val: 'abrasi', label: 'Abrasi/Rekomendasi', icon: '🌊', color: '#f97316' },
            { val: 'penyu', label: 'Penyu', icon: '🐢', color: '#0d9488' },
            { val: 'benthic', label: 'Benthic', icon: '🪸', color: '#22d3ee' },
          ] as const).map(opt => {
            const isActive = activeLayerFilter === opt.val;
            return (
              <button
                key={opt.val}
                onClick={() => {
                  setActiveLayerFilter(opt.val);
                  setSelectedId(null);
                  setSelectedType(null);
                }}
                className="rounded-full px-3 py-2 text-xs font-medium transition-all"
                style={{
                  background: isActive ? `${opt.color}25` : 'rgba(255,255,255,0.05)',
                  color: isActive ? opt.color : '#64748b',
                  border: `1px solid ${isActive ? `${opt.color}70` : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                {opt.icon} {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-2 lg:w-auto lg:justify-end">
          <div className="flex flex-wrap items-center gap-1">
            {MAP_LAYERS.map(l => {
              const Icon = l.icon;
              return (
                <button
                  key={l.id}
                  onClick={() => setActiveMapLayer(l.id)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all"
                  style={{
                    background: activeMapLayer === l.id ? '#0ea5e9' : 'rgba(255,255,255,0.07)',
                    color: activeMapLayer === l.id ? '#fff' : '#94a3b8',
                    border: activeMapLayer === l.id ? '1px solid #0ea5e9' : '1px solid transparent',
                  }}
                >
                  <Icon className="h-3.5 w-3.5" /> {l.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 text-xs text-white/40">
            <MapPin className="h-3.5 w-3.5" />
            <strong className="text-white">
              {(showMangrove ? mangroveFiltered.length : 0) +
                (showAbrasi ? allAbrasi.length : 0) +
                (showPenyu ? allPenyu.length : 0)}
            </strong>&nbsp;titik
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <MapContainer center={[-8.3, 112.6]} zoom={9} style={{ height: '100%', width: '100%', background: '#0d1117' }} zoomControl={true}>
            <MapController center={[-8.3, 112.6]} zoom={9} />
            <TileLayerSwitcher activeLayer={activeMapLayer} />

            {showMangrove && mangroveFiltered.map(loc => (
              <CircleMarker
                key={loc.id}
                center={[loc.lat, loc.lng]}
                radius={selectedId === loc.id ? MANGROVE_RADIUS[loc.status] + 3 : MANGROVE_RADIUS[loc.status]}
                pathOptions={{
                  color: selectedId === loc.id ? '#fff' : MANGROVE_STATUS_COLORS[loc.status],
                  fillColor: MANGROVE_STATUS_COLORS[loc.status],
                  fillOpacity: selectedId === loc.id ? 1 : 0.75,
                  weight: selectedId === loc.id ? 2.5 : 1.5,
                }}
                eventHandlers={{ click: () => { setSelectedId(loc.id); setSelectedType('mangrove'); } }}
              >
                <Popup>
                  <div className="min-w-[160px] text-sm">
                    <div className="font-bold text-gray-800">{loc.name}</div>
                    <div className="text-xs text-gray-500">{loc.district}</div>
                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-gray-500">Luas</span><span className="font-medium">{loc.areaHa} ha</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium capitalize" style={{ color: MANGROVE_STATUS_COLORS[loc.status] }}>{loc.status}</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {showAbrasi && allAbrasi.map(abr => (
              <Marker
                key={abr.id}
                position={[abr.koordinat.lat, abr.koordinat.lng]}
                icon={makeMangroveIcon(ABRASI_PRIORITAS_COLORS[abr.prioritas] ?? '#f97316')}
                eventHandlers={{ click: () => { setSelectedId(abr.id); setSelectedType('abrasi'); } }}
              >
                <Popup>
                  <div className="min-w-[180px] text-sm">
                    <div className="mb-0.5 text-[10px] font-bold uppercase" style={{ color: ABRASI_PRIORITAS_COLORS[abr.prioritas] }}>
                      Titik Rawan Abrasi · {abr.prioritas}
                    </div>
                    <div className="font-bold text-gray-800">{abr.namaPantai}</div>
                    <div className="text-xs text-gray-500">{abr.kecamatan}, {abr.kabKota}</div>
                    <div className="mt-1 text-xs text-gray-600">Skor risiko: <strong>{abr.skorRisiko}/10</strong></div>
                    <div className="mt-0.5 text-xs text-green-700">Rekomendasi: {abr.tanamanRekomendasi[0]}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {showPenyu && allPenyu.map(pny => (
              <Marker
                key={pny.id}
                position={[pny.lat, pny.lng]}
                icon={makeTurtleIcon()}
                eventHandlers={{ click: () => { setSelectedId(pny.id); setSelectedType('penyu'); } }}
              >
                <Popup>
                  <div className="min-w-[160px] text-sm">
                    <div className="mb-0.5 text-[10px] font-bold uppercase text-teal-700">Titik Pendaratan Penyu</div>
                    <div className="font-bold text-gray-800">{pny.namaPantai}</div>
                    <div className="text-xs text-gray-500">{pny.lokasi}</div>
                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-gray-500">Jenis</span><span className="font-medium">{pny.jenis}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Sarang</span><span className="font-medium">{pny.sarang} titik</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {showBenthic && benthicData && (
              <GeoJSON
                key="benthic"
                data={benthicData}
                pointToLayer={(_feature, latlng) => {
                  const cls = _feature.properties?.class ?? 'Unknown';
                  return L.circleMarker(latlng, {
                    radius: 4,
                    color: BENTHIC_COLORS[cls] ?? '#999',
                    fillColor: BENTHIC_COLORS[cls] ?? '#999',
                    fillOpacity: 0.75,
                    weight: 0,
                  });
                }}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(`<div style="font-size:12px"><strong>Benthic</strong><br/>Kelas: ${feature.properties?.class}</div>`);
                }}
              />
            )}
          </MapContainer>

          <div
            className="absolute left-3 top-3 z-[999] rounded-lg px-3 py-1.5 text-xs font-semibold"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {MAP_LAYERS.find(l => l.id === activeMapLayer)?.label}
          </div>

          {benthicLoading && (
            <div
              className="absolute left-3 top-14 z-[999] flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{ background: 'rgba(0,0,0,0.8)', color: '#22d3ee' }}
            >
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              Memuat data benthic...
            </div>
          )}
        </div>

        <div
          className={[
            'fixed inset-x-0 bottom-0 z-[1000] max-h-[78dvh] w-full overflow-hidden rounded-t-3xl border-t border-white/10 bg-[#111827] shadow-2xl transition-transform duration-300 lg:static lg:max-h-none lg:w-80 lg:translate-y-0 lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-none',
            sidebarOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)] lg:translate-y-0',
          ].join(' ')}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 lg:hidden">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Layers className="h-4 w-4 text-teal-400" />
              Panel Data
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="h-full overflow-y-auto">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Layers className="h-4 w-4 text-teal-400" /> Legenda
              </div>

              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Titik Mangrove</p>
              <div className="mb-3 space-y-1.5">
                {Object.entries(MANGROVE_STATUS_COLORS).map(([s, color]) => (
                  <div key={s} className="flex items-center gap-2.5">
                    <div
                      className="flex-shrink-0 rounded-full"
                      style={{ width: MANGROVE_RADIUS[s] * 1.6, height: MANGROVE_RADIUS[s] * 1.6, background: color, opacity: 0.85 }}
                    />
                    <span className="text-xs capitalize text-white/70">{s}</span>
                  </div>
                ))}
              </div>

              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Titik Abrasi / Rekomendasi</p>
              <div className="mb-3 space-y-1.5">
                {Object.entries(ABRASI_PRIORITAS_COLORS).map(([p, color]) => (
                  <div key={p} className="flex items-center gap-2">
                    <div className="text-sm">🌿</div>
                    <span className="text-xs text-white/70">{p}</span>
                    <div className="ml-auto h-2 w-2 rounded-full" style={{ background: color }} />
                  </div>
                ))}
              </div>

              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Pendaratan Penyu</p>
              <div className="mb-3 flex items-center gap-2">
                <div className="text-sm">🐢</div>
                <span className="text-xs text-white/70">Titik pendaratan penyu laut</span>
              </div>

              {showBenthic && (
                <>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Kelas Benthic</p>
                  <div className="space-y-1.5">
                    {Object.entries(BENTHIC_COLORS).map(([cls, color]) => (
                      <div key={cls} className="flex items-center gap-2">
                        <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ background: color }} />
                        <span className="text-xs text-white/70">{cls}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="px-4 py-3 border-b border-white/10">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Statistik Realtime</p>
              <div className="mb-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-cyan-400/15 px-3 py-2.5" style={{ background: 'rgba(34, 211, 238, 0.08)' }}>
                  <div className="mb-1 flex items-center gap-2 text-cyan-300">
                    <Activity className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Realtime View</span>
                  </div>
                  <p className="text-lg font-black text-white">{realtimeViews}</p>
                  <p className="text-[10px] text-white/45">aktivitas 24 jam</p>
                </div>
                <div className="rounded-xl border border-emerald-400/15 px-3 py-2.5" style={{ background: 'rgba(52, 211, 153, 0.08)' }}>
                  <div className="mb-1 flex items-center gap-2 text-emerald-300">
                    <Download className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">PDF Download</span>
                  </div>
                  <p className="text-lg font-black text-white">{pdfDownloadCount}</p>
                  <p className="text-[10px] text-white/45">total unduhan user</p>
                </div>
              </div>

              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Report View</p>
              <div className="mb-4 space-y-2">
                {reportStats.map(period => (
                  <div key={period.key} className="rounded-xl border border-white/10 px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-white/70">
                        <CalendarRange className="h-3.5 w-3.5 text-teal-400" />
                        <span className="text-xs">{period.label}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{period.count}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Unduh Data</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleDownload('pdf')}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/5"
                >
                  <FileText className="h-3.5 w-3.5 text-teal-400" />
                  Unduh PDF Laporan
                </button>
                <button
                  onClick={() => handleDownload('geo')}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/5"
                >
                  <Download className="h-3.5 w-3.5 text-green-400" />
                  Unduh Marker KML/GeoJSON
                </button>
              </div>

              <div className="mt-3 rounded-xl border border-white/10 px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="mb-1 flex items-center gap-2 text-white/65">
                  <Clock3 className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] uppercase tracking-wider">Aktivitas Terakhir</span>
                </div>
                <p className="text-xs text-white/80">
                  {latestActivity
                    ? new Date(latestActivity).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                    : 'Belum ada aktivitas survei'}
                </p>
              </div>

              {!user && (
                <p className="mt-2 text-center text-[10px] text-white/30">
                  🔒 Perlu login untuk mengunduh
                </p>
              )}
            </div>

            {selectedMangrove && (
              <DetailPanel onClose={() => { setSelectedId(null); setSelectedType(null); }}>
                <div className="text-sm font-bold text-white">{selectedMangrove.name}</div>
                <div className="mt-0.5 text-xs text-white/40">{selectedMangrove.district}, {selectedMangrove.province}</div>
                <div className="mt-3 space-y-2">
                  <InfoRow label="Status">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold capitalize"
                      style={{ background: `${MANGROVE_STATUS_COLORS[selectedMangrove.status]}20`, color: MANGROVE_STATUS_COLORS[selectedMangrove.status] }}
                    >
                      {selectedMangrove.status}
                    </span>
                  </InfoRow>
                  <InfoRow label="Luas"><span className="text-xs text-white/70">{selectedMangrove.areaHa.toLocaleString()} ha</span></InfoRow>
                  <InfoRow label="Kawasan"><span className="text-xs capitalize text-white/70">{selectedMangrove.kawasan.replace(/_/g, ' ')}</span></InfoRow>
                  <InfoRow label="Survei Terakhir"><span className="text-xs text-white/50">{selectedMangrove.lastSurvey}</span></InfoRow>
                  <InfoRow label="Koordinat">
                    <span className="font-mono text-[10px] text-white/40">{selectedMangrove.lat.toFixed(4)}, {selectedMangrove.lng.toFixed(4)}</span>
                  </InfoRow>
                  {selectedEco && (
                    <div className="border-t border-white/10 pt-2">
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-green-400">Ekosistem</p>
                      <InfoRow label="Skor Kesehatan">
                        <span
                          className="text-sm font-bold"
                          style={{ color: selectedEco.skorKesehatan >= 75 ? '#22c55e' : selectedEco.skorKesehatan >= 50 ? '#eab308' : '#ef4444' }}
                        >
                          {selectedEco.skorKesehatan}/100
                        </span>
                      </InfoRow>
                      <InfoRow label="Tutupan Tajuk"><span className="text-xs text-white/70">{selectedEco.tutupanTajuk}%</span></InfoRow>
                      <InfoRow label="Kerapatan"><span className="text-xs text-white/70">{selectedEco.kerapatanPohon} pohon/ha</span></InfoRow>
                    </div>
                  )}
                </div>
              </DetailPanel>
            )}

            {selectedAbrasi && (
              <DetailPanel onClose={() => { setSelectedId(null); setSelectedType(null); }}>
                <div className="mb-1 text-[10px] font-bold uppercase" style={{ color: ABRASI_PRIORITAS_COLORS[selectedAbrasi.prioritas] }}>
                  🌿 Rawan Abrasi · Prioritas {selectedAbrasi.prioritas}
                </div>
                <div className="text-sm font-bold text-white">{selectedAbrasi.namaPantai}</div>
                <div className="mt-0.5 text-xs text-white/40">{selectedAbrasi.kecamatan}, {selectedAbrasi.kabKota}</div>
                <div className="mt-3 space-y-2">
                  <InfoRow label="Skor Risiko">
                    <span
                      className="text-sm font-bold"
                      style={{ color: selectedAbrasi.skorRisiko >= 8 ? '#ef4444' : selectedAbrasi.skorRisiko >= 6 ? '#f97316' : '#eab308' }}
                    >
                      {selectedAbrasi.skorRisiko}/10
                    </span>
                  </InfoRow>
                  <InfoRow label="Substrat"><span className="text-xs capitalize text-white/70">{selectedAbrasi.substrat}</span></InfoRow>
                  <InfoRow label="Restorasi"><span className="text-xs text-white/70">{selectedAbrasi.luasanRestorasi.min}–{selectedAbrasi.luasanRestorasi.max} {selectedAbrasi.luasanRestorasi.satuan}</span></InfoRow>
                </div>
                <div className="mt-3 border-t border-white/10 pt-2">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-green-400">Rekomendasi Tanaman</p>
                  <ul className="space-y-1">
                    {selectedAbrasi.tanamanRekomendasi.map(t => (
                      <li key={t} className="flex gap-1 text-[11px] italic text-white/60">
                        <span className="text-green-500">•</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 border-t border-white/10 pt-2">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">Ancaman Utama</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedAbrasi.ancamanUtama.map(a => (
                      <span key={a} className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400">{a}</span>
                    ))}
                  </div>
                </div>
              </DetailPanel>
            )}

            {selectedPenyu && (
              <DetailPanel onClose={() => { setSelectedId(null); setSelectedType(null); }}>
                <div className="mb-1 text-[10px] font-bold uppercase text-teal-400">🐢 Titik Pendaratan Penyu</div>
                <div className="text-sm font-bold text-white">{selectedPenyu.namaPantai}</div>
                <div className="mt-0.5 text-xs text-white/40">{selectedPenyu.lokasi}</div>
                <div className="mt-3 space-y-2">
                  <InfoRow label="Jenis Penyu"><span className="text-xs text-white/70">{selectedPenyu.jenis}</span></InfoRow>
                  <InfoRow label="Jumlah Sarang"><span className="text-sm font-bold text-teal-400">{selectedPenyu.sarang} titik</span></InfoRow>
                  <InfoRow label="Koordinat">
                    <span className="font-mono text-[10px] text-white/40">{selectedPenyu.lat.toFixed(4)}, {selectedPenyu.lng.toFixed(4)}</span>
                  </InfoRow>
                </div>
              </DetailPanel>
            )}

            {!selectedId && (
              <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
                {(activeLayerFilter === 'all' || activeLayerFilter === 'mangrove') && (
                  <>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      🌿 Mangrove ({mangroveFiltered.length})
                    </p>
                    <div className="space-y-0.5 overflow-y-auto" style={{ maxHeight: activeLayerFilter === 'mangrove' ? '70vh' : '30vh' }}>
                      {mangroveFiltered.map(loc => (
                        <button
                          key={loc.id}
                          onClick={() => { setSelectedId(loc.id); setSelectedType('mangrove'); }}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors hover:bg-white/5"
                        >
                          <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: MANGROVE_STATUS_COLORS[loc.status] }} />
                          <span className="truncate text-white/60">{loc.name}</span>
                          <span className="ml-auto flex-shrink-0 text-[10px] text-white/30">{loc.areaHa.toLocaleString()} ha</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {(activeLayerFilter === 'all' || activeLayerFilter === 'abrasi') && (
                  <>
                    <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      🌊 Abrasi / Rekomendasi ({allAbrasi.length})
                    </p>
                    <div className="space-y-0.5 overflow-y-auto" style={{ maxHeight: activeLayerFilter === 'abrasi' ? '70vh' : '25vh' }}>
                      {allAbrasi.map(abr => (
                        <button
                          key={abr.id}
                          onClick={() => { setSelectedId(abr.id); setSelectedType('abrasi'); }}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors hover:bg-white/5"
                        >
                          <span className="flex-shrink-0">🌿</span>
                          <span className="truncate text-white/60">{abr.namaPantai}</span>
                          <span className="ml-auto flex-shrink-0 text-[10px] font-bold" style={{ color: ABRASI_PRIORITAS_COLORS[abr.prioritas] }}>{abr.skorRisiko}/10</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {(activeLayerFilter === 'all' || activeLayerFilter === 'penyu') && (
                  <>
                    <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      🐢 Pendaratan Penyu ({allPenyu.length})
                    </p>
                    <div className="space-y-0.5 overflow-y-auto" style={{ maxHeight: activeLayerFilter === 'penyu' ? '70vh' : '25vh' }}>
                      {allPenyu.map(pny => (
                        <button
                          key={pny.id}
                          onClick={() => { setSelectedId(pny.id); setSelectedType('penyu'); }}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors hover:bg-white/5"
                        >
                          <span className="flex-shrink-0">🐢</span>
                          <span className="truncate text-white/60">{pny.namaPantai}</span>
                          <span className="ml-auto flex-shrink-0 text-[10px] text-teal-500">{pny.sarang} sarang</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-[999] bg-black/40 lg:hidden"
            aria-label="Tutup panel"
          />
        )}
      </div>

      {showDownloadGate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowDownloadGate(false); }}
        >
          <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: '#1e2533', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setShowDownloadGate(false)} className="absolute right-4 top-4 text-white/30 hover:text-white/60">
              <X className="h-4 w-4" />
            </button>
            <div className="mb-3 text-center text-3xl">🔒</div>
            <h3 className="mb-1 text-center text-base font-bold text-white">Perlu Akun untuk Mengunduh</h3>
            <p className="mb-5 text-center text-xs leading-relaxed text-white/50">
              Fitur unduh PDF laporan dan data marker peta tersedia untuk pengguna terdaftar. Daftar gratis atau login untuk melanjutkan.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => { setShowDownloadGate(false); navigate('/'); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #0d9488, #0ea5e9)' }}
              >
                <UserPlus className="h-4 w-4" /> Daftar Akun Gratis
              </button>
              <button
                onClick={() => { setShowDownloadGate(false); navigate('/'); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/5"
              >
                <LogIn className="h-4 w-4" /> Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailPanel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="flex-1 border-t border-white/10 px-4 py-3">
      <div className="mb-2 flex justify-end">
        <button onClick={onClose} className="text-white/30 transition-colors hover:text-white/60">
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-white/40">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}
