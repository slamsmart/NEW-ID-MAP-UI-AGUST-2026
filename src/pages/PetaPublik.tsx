import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mangroveLocations, ekosistemData } from '../data/mockData';
import { titikAbrasiData } from '../data/abrasiData';
import { fetchSurveys } from '../data/localStore';
import { Filter, Layers, MapPin, Map, Satellite, Mountain, ChevronRight, X, Download, FileText, LogIn, UserPlus, PanelRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// ── Penyu sample coordinates (nesting beaches Kab. Malang & sekitar) ─────────
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
  'Tinggi': '#ef4444',
  'Sedang': '#f97316',
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

// Custom icons via DivIcon
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

  // Single layer filter: 'all' | 'mangrove' | 'abrasi' | 'penyu' | 'benthic'
  const [activeLayerFilter, setActiveLayerFilter] = useState<'all' | 'mangrove' | 'abrasi' | 'penyu' | 'benthic'>('all');
  const [activeMapLayer, setActiveMapLayer] = useState('osm');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'mangrove' | 'abrasi' | 'penyu' | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  // Derived visibility from single filter
  const showMangrove = activeLayerFilter === 'all' || activeLayerFilter === 'mangrove';
  const showAbrasi   = activeLayerFilter === 'all' || activeLayerFilter === 'abrasi';
  const showPenyu    = activeLayerFilter === 'all' || activeLayerFilter === 'penyu';
  const showBenthic  = activeLayerFilter === 'all' || activeLayerFilter === 'benthic';

  // Benthic GeoJSON
  const [benthicData, setBenthicData] = useState<any>(null);
  const [benthicLoading, setBenthicLoading] = useState(false);

  // Download gate modal
  const [showDownloadGate, setShowDownloadGate] = useState(false);

  // Real survey data from field officers
  const [surveyPenyu, setSurveyPenyu] = useState<typeof penyuLocations>([]);
  const [surveyAbrasi, setSurveyAbrasi] = useState<typeof titikAbrasiData>([]);

  const mangroveFiltered = mangroveLocations;

  // Load survey data (field officer input → map)
  useEffect(() => {
    fetchSurveys().then(surveys => {
      // Penyu from surveys
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

      // Abrasi from surveys
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

  // All penyu = static fallback + live survey data
  const allPenyu = surveyPenyu.length > 0 ? surveyPenyu : penyuLocations;
  // All abrasi = static + live
  const allAbrasi = [...titikAbrasiData, ...surveyAbrasi];

  // Load benthic when selected
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

  const handleDownload = () => {
    if (!user) { setShowDownloadGate(true); return; }
    // TODO: implement actual download
    alert('Download sedang disiapkan...');
  };

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: '#0d1117', color: '#e2e8f0' }}>

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 flex-shrink-0 border-b border-white/10 gap-2" style={{ background: '#111827' }}>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <img src="/logo.svg" alt="ID-MAP" className="h-7 w-auto" />
          </button>
          <div className="w-px h-6 bg-white/20 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-white font-bold text-xs sm:text-sm md:text-base leading-tight truncate">Peta Interaktif Mangrove</h1>
            <p className="text-white/40 text-[10px] hidden sm:block truncate">Data Integrasi Mangrove dan Ekosistem Pesisir</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          {[
            { label: 'Lebat', count: totalLebat, color: '#22c55e' },
            { label: 'Sedang', count: totalSedang, color: '#eab308' },
            { label: 'Jarang', count: totalJarang, color: '#f97316' },
            { label: 'Kritis', count: totalKritis, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
              {s.count} {s.label}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleDownload}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20 text-white/70 hover:bg-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> <span className="hidden md:inline">Unduh</span>
          </button>
          {user ? (
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-teal-600 text-white hover:bg-teal-500 transition-colors">
              <span className="hidden sm:inline">Dashboard</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <button onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold border border-white/30 text-white hover:bg-white/10 transition-colors">
              Login
            </button>
          )}
          {/* Panel toggle (mobile) */}
          <button
            onClick={() => setPanelOpen(o => !o)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors sm:hidden"
            title="Toggle panel"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="flex items-center gap-2 px-3 sm:px-5 py-2 border-b border-white/10 flex-shrink-0 overflow-x-auto" style={{ background: '#161b27' }}>
        <div className="flex items-center gap-1.5 text-white/50 text-xs flex-shrink-0">
          <Filter className="w-3.5 h-3.5" />
        </div>

        {/* Single layer pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {([ 
            { val: 'all',      label: 'Semua',               icon: '🗺️', color: '#94a3b8' },
            { val: 'mangrove', label: 'Mangrove',             icon: '🌿', color: '#22c55e' },
            { val: 'abrasi',   label: 'Abrasi',               icon: '🌿', color: '#f97316' },
            { val: 'penyu',    label: 'Penyu',                icon: '🐢', color: '#0d9488' },
            { val: 'benthic',  label: 'Benthic',              icon: '🪸', color: '#22d3ee' },
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
                className="text-xs px-2.5 sm:px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap"
                style={{
                  background: isActive ? `${opt.color}25` : 'rgba(255,255,255,0.05)',
                  color: isActive ? opt.color : '#64748b',
                  border: `1px solid ${isActive ? opt.color + '70' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                {opt.icon} <span className="hidden xs:inline sm:inline">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Map type buttons */}
        <div className="ml-auto flex items-center gap-1 flex-shrink-0">
          {MAP_LAYERS.map(l => {
            const Icon = l.icon;
            return (
              <button key={l.id} onClick={() => setActiveMapLayer(l.id)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: activeMapLayer === l.id ? '#0ea5e9' : 'rgba(255,255,255,0.07)',
                  color: activeMapLayer === l.id ? '#fff' : '#94a3b8',
                  border: activeMapLayer === l.id ? '1px solid #0ea5e9' : '1px solid transparent',
                }}>
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{l.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 text-white/40 text-xs flex-shrink-0">
          <MapPin className="w-3.5 h-3.5" />
          <strong className="text-white">
            {(showMangrove ? mangroveFiltered.length : 0) +
             (showAbrasi ? allAbrasi.length : 0) +
             (showPenyu ? allPenyu.length : 0)}
          </strong>
        </div>
      </div>

      {/* ── MAP + SIDEBAR ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* MAP */}
        <div className="flex-1 relative">
          <MapContainer center={[-8.3, 112.6]} zoom={9} style={{ height: '100%', width: '100%', background: '#0d1117' }} zoomControl={true}>
            <MapController center={[-8.3, 112.6]} zoom={9} />
            <TileLayerSwitcher activeLayer={activeMapLayer} />

            {/* Mangrove markers */}
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
                  <div className="text-sm min-w-[160px]">
                    <div className="font-bold text-gray-800">{loc.name}</div>
                    <div className="text-xs text-gray-500">{loc.district}</div>
                    <div className="text-xs flex justify-between mt-1">
                      <span className="text-gray-500">Luas</span><span className="font-medium">{loc.areaHa} ha</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium capitalize" style={{ color: MANGROVE_STATUS_COLORS[loc.status] }}>{loc.status}</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Abrasi / Rekomendasi Mangrove markers */}
            {showAbrasi && allAbrasi.map(abr => (
              <Marker
                key={abr.id}
                position={[abr.koordinat.lat, abr.koordinat.lng]}
                icon={makeMangroveIcon(ABRASI_PRIORITAS_COLORS[abr.prioritas] ?? '#f97316')}
                eventHandlers={{ click: () => { setSelectedId(abr.id); setSelectedType('abrasi'); } }}
              >
                <Popup>
                  <div className="text-sm min-w-[180px]">
                    <div className="text-[10px] font-bold uppercase mb-0.5" style={{ color: ABRASI_PRIORITAS_COLORS[abr.prioritas] }}>
                      Titik Rawan Abrasi · {abr.prioritas}
                    </div>
                    <div className="font-bold text-gray-800">{abr.namaPantai}</div>
                    <div className="text-xs text-gray-500">{abr.kecamatan}, {abr.kabKota}</div>
                    <div className="text-xs mt-1 text-gray-600">Skor risiko: <strong>{abr.skorRisiko}/10</strong></div>
                    <div className="text-xs text-green-700 mt-0.5">Rekomendasi: {abr.tanamanRekomendasi[0]}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Penyu markers */}
            {showPenyu && allPenyu.map(pny => (
              <Marker
                key={pny.id}
                position={[pny.lat, pny.lng]}
                icon={makeTurtleIcon()}
                eventHandlers={{ click: () => { setSelectedId(pny.id); setSelectedType('penyu'); } }}
              >
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    <div className="text-[10px] font-bold text-teal-700 uppercase mb-0.5">Titik Pendaratan Penyu</div>
                    <div className="font-bold text-gray-800">{pny.namaPantai}</div>
                    <div className="text-xs text-gray-500">{pny.lokasi}</div>
                    <div className="text-xs flex justify-between mt-1">
                      <span className="text-gray-500">Jenis</span><span className="font-medium">{pny.jenis}</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-gray-500">Sarang</span><span className="font-medium">{pny.sarang} titik</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Benthic layer */}
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

          {/* Map mode badge */}
          <div className="absolute top-3 left-3 z-[999] px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
            {MAP_LAYERS.find(l => l.id === activeMapLayer)?.label}
          </div>

          {benthicLoading && (
            <div className="absolute top-14 left-3 z-[999] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2"
              style={{ background: 'rgba(0,0,0,0.8)', color: '#22d3ee' }}>
              <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              Memuat data benthic...
            </div>
          )}
        </div>

        {/* ── PANEL TOGGLE BUTTON (floating, desktop) ── */}
        <button
          onClick={() => setPanelOpen(o => !o)}
          className="absolute top-3 right-3 z-[998] hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)' }}
          title={panelOpen ? 'Sembunyikan panel' : 'Tampilkan panel'}
        >
          <PanelRight className={`w-3.5 h-3.5 transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
          <span className="hidden md:inline">{panelOpen ? 'Tutup' : 'Panel'}</span>
        </button>

        {/* ── RIGHT SIDEBAR ── Desktop inline */}
        {panelOpen && (
        <div className="hidden sm:flex w-64 md:w-72 flex-shrink-0 flex-col border-l border-white/10 overflow-y-auto" style={{ background: '#111827' }}>

          {/* Legend */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
              <Layers className="w-4 h-4 text-teal-400" /> Legenda
            </div>

            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Titik Mangrove</p>
            <div className="space-y-1.5 mb-3">
              {Object.entries(MANGROVE_STATUS_COLORS).map(([s, color]) => (
                <div key={s} className="flex items-center gap-2.5">
                  <div className="rounded-full flex-shrink-0"
                    style={{ width: MANGROVE_RADIUS[s] * 1.6, height: MANGROVE_RADIUS[s] * 1.6, background: color, opacity: 0.85 }} />
                  <span className="text-xs capitalize text-white/70">{s}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Titik Abrasi / Rekomendasi</p>
            <div className="space-y-1.5 mb-3">
              {Object.entries(ABRASI_PRIORITAS_COLORS).map(([p, color]) => (
                <div key={p} className="flex items-center gap-2">
                  <div className="text-sm">🌿</div>
                  <span className="text-xs text-white/70">{p}</span>
                  <div className="w-2 h-2 rounded-full ml-auto" style={{ background: color }} />
                </div>
              ))}
            </div>

            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Pendaratan Penyu</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="text-sm">🐢</div>
              <span className="text-xs text-white/70">Titik pendaratan penyu laut</span>
            </div>

            {showBenthic && (
              <>
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Kelas Benthic</p>
                <div className="space-y-1.5">
                  {Object.entries(BENTHIC_COLORS).map(([cls, color]) => (
                    <div key={cls} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-xs text-white/70">{cls}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Download section */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Unduh Data</p>
            <div className="space-y-1.5">
              <button onClick={handleDownload}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition-colors text-white/60 border border-white/10">
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                Unduh PDF Laporan
              </button>
              <button onClick={handleDownload}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition-colors text-white/60 border border-white/10">
                <Download className="w-3.5 h-3.5 text-green-400" />
                Unduh Marker KML/GeoJSON
              </button>
            </div>
            {!user && (
              <p className="text-[10px] text-white/30 mt-2 text-center">
                🔒 Perlu login untuk mengunduh
              </p>
            )}
          </div>

          {/* Selected location detail */}
          {selectedMangrove && (
            <DetailPanel onClose={() => { setSelectedId(null); setSelectedType(null); }}>
              <div className="font-bold text-white text-sm">{selectedMangrove.name}</div>
              <div className="text-xs text-white/40 mt-0.5">{selectedMangrove.district}, {selectedMangrove.province}</div>
              <div className="mt-3 space-y-2">
                <InfoRow label="Status">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{ background: `${MANGROVE_STATUS_COLORS[selectedMangrove.status]}20`, color: MANGROVE_STATUS_COLORS[selectedMangrove.status] }}>
                    {selectedMangrove.status}
                  </span>
                </InfoRow>
                <InfoRow label="Luas"><span className="text-xs text-white/70">{selectedMangrove.areaHa.toLocaleString()} ha</span></InfoRow>
                <InfoRow label="Kawasan"><span className="text-xs text-white/70 capitalize">{selectedMangrove.kawasan.replace(/_/g, ' ')}</span></InfoRow>
                <InfoRow label="Survei Terakhir"><span className="text-xs text-white/50">{selectedMangrove.lastSurvey}</span></InfoRow>
                <InfoRow label="Koordinat">
                  <span className="text-[10px] text-white/40 font-mono">{selectedMangrove.lat.toFixed(4)}, {selectedMangrove.lng.toFixed(4)}</span>
                </InfoRow>
                {selectedEco && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider mb-1.5">Ekosistem</p>
                    <InfoRow label="Skor Kesehatan">
                      <span className="text-sm font-bold" style={{ color: selectedEco.skorKesehatan >= 75 ? '#22c55e' : selectedEco.skorKesehatan >= 50 ? '#eab308' : '#ef4444' }}>
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
              <div className="text-[10px] font-bold uppercase mb-1" style={{ color: ABRASI_PRIORITAS_COLORS[selectedAbrasi.prioritas] }}>
                🌿 Rawan Abrasi · Prioritas {selectedAbrasi.prioritas}
              </div>
              <div className="font-bold text-white text-sm">{selectedAbrasi.namaPantai}</div>
              <div className="text-xs text-white/40 mt-0.5">{selectedAbrasi.kecamatan}, {selectedAbrasi.kabKota}</div>
              <div className="mt-3 space-y-2">
                <InfoRow label="Skor Risiko">
                  <span className="text-sm font-bold" style={{ color: selectedAbrasi.skorRisiko >= 8 ? '#ef4444' : selectedAbrasi.skorRisiko >= 6 ? '#f97316' : '#eab308' }}>
                    {selectedAbrasi.skorRisiko}/10
                  </span>
                </InfoRow>
                <InfoRow label="Substrat"><span className="text-xs text-white/70 capitalize">{selectedAbrasi.substrat}</span></InfoRow>
                <InfoRow label="Restorasi"><span className="text-xs text-white/70">{selectedAbrasi.luasanRestorasi.min}–{selectedAbrasi.luasanRestorasi.max} {selectedAbrasi.luasanRestorasi.satuan}</span></InfoRow>
              </div>
              <div className="mt-3 pt-2 border-t border-white/10">
                <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider mb-1.5">Rekomendasi Tanaman</p>
                <ul className="space-y-1">
                  {selectedAbrasi.tanamanRekomendasi.map(t => (
                    <li key={t} className="text-[11px] text-white/60 italic flex gap-1">
                      <span className="text-green-500">•</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 pt-2 border-t border-white/10">
                <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider mb-1.5">Ancaman Utama</p>
                <div className="flex flex-wrap gap-1">
                  {selectedAbrasi.ancamanUtama.map(a => (
                    <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">{a}</span>
                  ))}
                </div>
              </div>
            </DetailPanel>
          )}

          {selectedPenyu && (
            <DetailPanel onClose={() => { setSelectedId(null); setSelectedType(null); }}>
              <div className="text-[10px] font-bold text-teal-400 uppercase mb-1">🐢 Titik Pendaratan Penyu</div>
              <div className="font-bold text-white text-sm">{selectedPenyu.namaPantai}</div>
              <div className="text-xs text-white/40 mt-0.5">{selectedPenyu.lokasi}</div>
              <div className="mt-3 space-y-2">
                <InfoRow label="Jenis Penyu"><span className="text-xs text-white/70">{selectedPenyu.jenis}</span></InfoRow>
                <InfoRow label="Jumlah Sarang"><span className="text-sm font-bold text-teal-400">{selectedPenyu.sarang} titik</span></InfoRow>
                <InfoRow label="Koordinat">
                  <span className="text-[10px] text-white/40 font-mono">{selectedPenyu.lat.toFixed(4)}, {selectedPenyu.lng.toFixed(4)}</span>
                </InfoRow>
              </div>
            </DetailPanel>
          )}

          {/* No selection: location list */}
          {!selectedId && (
            <div className="flex-1 flex flex-col px-4 py-4 overflow-y-auto">
              {(activeLayerFilter === 'all' || activeLayerFilter === 'mangrove') && (
              <>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">
                🌿 Mangrove ({mangroveFiltered.length})
              </p>
              <div className="space-y-0.5 overflow-y-auto" style={{ maxHeight: activeLayerFilter === 'mangrove' ? '70vh' : '30vh' }}>
                {mangroveFiltered.map(loc => (
                  <button key={loc.id}
                    onClick={() => { setSelectedId(loc.id); setSelectedType('mangrove'); }}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: MANGROVE_STATUS_COLORS[loc.status] }} />
                    <span className="truncate text-white/60">{loc.name}</span>
                    <span className="ml-auto text-white/30 flex-shrink-0 text-[10px]">{loc.areaHa.toLocaleString()} ha</span>
                  </button>
                ))}
              </div>
              </>
              )}

              {(activeLayerFilter === 'all' || activeLayerFilter === 'abrasi') && (
              <>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2 mt-4">
                🌊 Abrasi / Rekomendasi ({allAbrasi.length})
              </p>
              <div className="space-y-0.5 overflow-y-auto" style={{ maxHeight: activeLayerFilter === 'abrasi' ? '70vh' : '25vh' }}>
                {allAbrasi.map(abr => (
                  <button key={abr.id}
                    onClick={() => { setSelectedId(abr.id); setSelectedType('abrasi'); }}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors">
                    <span className="flex-shrink-0">🌿</span>
                    <span className="truncate text-white/60">{abr.namaPantai}</span>
                    <span className="ml-auto text-[10px] flex-shrink-0 font-bold"
                      style={{ color: ABRASI_PRIORITAS_COLORS[abr.prioritas] }}>{abr.skorRisiko}/10</span>
                  </button>
                ))}
              </div>
              </>
              )}

              {(activeLayerFilter === 'all' || activeLayerFilter === 'penyu') && (
              <>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2 mt-4">
                🐢 Pendaratan Penyu ({allPenyu.length})
              </p>
              <div className="space-y-0.5 overflow-y-auto" style={{ maxHeight: activeLayerFilter === 'penyu' ? '70vh' : '25vh' }}>
                {allPenyu.map(pny => (
                  <button key={pny.id}
                    onClick={() => { setSelectedId(pny.id); setSelectedType('penyu'); }}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors">
                    <span className="flex-shrink-0">🐢</span>
                    <span className="truncate text-white/60">{pny.namaPantai}</span>
                    <span className="ml-auto text-teal-500 flex-shrink-0 text-[10px]">{pny.sarang} sarang</span>
                  </button>
                ))}
              </div>
              </>
              )}
            </div>
          )}
        </div>
        )}

        {/* ── RIGHT SIDEBAR ── Mobile overlay */}
        {panelOpen && (
        <div className="sm:hidden fixed inset-0 z-[997] flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPanelOpen(false)} />
          <div className="relative z-10 w-72 max-w-[85vw] flex flex-col border-l border-white/10 overflow-y-auto" style={{ background: '#111827' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Panel Info</span>
              <button onClick={() => setPanelOpen(false)} className="text-white/40 hover:text-white/70">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <Layers className="w-4 h-4 text-teal-400" /> Legenda
              </div>
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Titik Mangrove</p>
              <div className="space-y-1.5 mb-3">
                {Object.entries(MANGROVE_STATUS_COLORS).map(([s, color]) => (
                  <div key={s} className="flex items-center gap-2.5">
                    <div className="rounded-full flex-shrink-0"
                      style={{ width: MANGROVE_RADIUS[s] * 1.6, height: MANGROVE_RADIUS[s] * 1.6, background: color, opacity: 0.85 }} />
                    <span className="text-xs capitalize text-white/70">{s}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Titik Abrasi / Rekomendasi</p>
              <div className="space-y-1.5 mb-3">
                {Object.entries(ABRASI_PRIORITAS_COLORS).map(([p, color]) => (
                  <div key={p} className="flex items-center gap-2">
                    <div className="text-sm">🌿</div>
                    <span className="text-xs text-white/70">{p}</span>
                    <div className="w-2 h-2 rounded-full ml-auto" style={{ background: color }} />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Pendaratan Penyu</p>
              <div className="flex items-center gap-2">
                <div className="text-sm">🐢</div>
                <span className="text-xs text-white/70">Titik pendaratan penyu laut</span>
              </div>
            </div>

            {/* Location list */}
            <div className="flex-1 flex flex-col px-4 py-4 overflow-y-auto">
              {(activeLayerFilter === 'all' || activeLayerFilter === 'mangrove') && (
                <>
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">🌿 Mangrove ({mangroveFiltered.length})</p>
                  <div className="space-y-0.5 overflow-y-auto" style={{ maxHeight: '30vh' }}>
                    {mangroveFiltered.map(loc => (
                      <button key={loc.id}
                        onClick={() => { setSelectedId(loc.id); setSelectedType('mangrove'); setPanelOpen(false); }}
                        className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: MANGROVE_STATUS_COLORS[loc.status] }} />
                        <span className="truncate text-white/60">{loc.name}</span>
                        <span className="ml-auto text-white/30 flex-shrink-0 text-[10px]">{loc.areaHa.toLocaleString()} ha</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {(activeLayerFilter === 'all' || activeLayerFilter === 'penyu') && (
                <>
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2 mt-4">🐢 Penyu ({allPenyu.length})</p>
                  <div className="space-y-0.5">
                    {allPenyu.map(pny => (
                      <button key={pny.id}
                        onClick={() => { setSelectedId(pny.id); setSelectedType('penyu'); setPanelOpen(false); }}
                        className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors">
                        <span className="flex-shrink-0">🐢</span>
                        <span className="truncate text-white/60">{pny.namaPantai}</span>
                        <span className="ml-auto text-teal-500 flex-shrink-0 text-[10px]">{pny.sarang} sarang</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Download section */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Unduh Data</p>
                <div className="space-y-1.5">
                  <button onClick={handleDownload}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition-colors text-white/60 border border-white/10">
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                    Unduh PDF Laporan
                  </button>
                  <button onClick={handleDownload}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition-colors text-white/60 border border-white/10">
                    <Download className="w-3.5 h-3.5 text-green-400" />
                    Unduh Marker KML/GeoJSON
                  </button>
                </div>
                {!user && (
                  <p className="text-[10px] text-white/30 mt-2 text-center">🔒 Perlu login untuk mengunduh</p>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* ── DOWNLOAD GATE MODAL ── */}
      {showDownloadGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowDownloadGate(false); }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-sm p-6 relative" style={{ background: '#1e2533', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setShowDownloadGate(false)} className="absolute top-4 right-4 text-white/30 hover:text-white/60">
              <X className="w-4 h-4" />
            </button>
            <div className="text-3xl mb-3 text-center">🔒</div>
            <h3 className="text-white font-bold text-base text-center mb-1">Perlu Akun untuk Mengunduh</h3>
            <p className="text-white/50 text-xs text-center mb-5 leading-relaxed">
              Fitur unduh PDF laporan dan data marker peta tersedia untuk pengguna terdaftar. Daftar gratis atau login untuk melanjutkan.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => { setShowDownloadGate(false); navigate('/'); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #0d9488, #0ea5e9)' }}>
                <UserPlus className="w-4 h-4" /> Daftar Akun Gratis
              </button>
              <button
                onClick={() => { setShowDownloadGate(false); navigate('/'); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white/70 border border-white/20 hover:bg-white/5 transition-colors">
                <LogIn className="w-4 h-4" /> Login
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
    <div className="flex-1 px-4 py-3 border-t border-white/10">
      <div className="flex justify-end mb-2">
        <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-white/40">{label}</span>
      <div>{children}</div>
    </div>
  );
}
