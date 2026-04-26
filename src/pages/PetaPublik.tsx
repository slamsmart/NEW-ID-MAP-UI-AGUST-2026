import { useState, useEffect, useMemo, cloneElement } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mangroveLocations, ekosistemData } from '../data/mockData';
import { titikAbrasiData } from '../data/abrasiData';
import { fetchSurveys } from '../data/localStore';
import { Layers, Map, Satellite, Mountain, ChevronRight, ChevronDown, X, Download, FileText, LogIn, UserPlus, PanelRight, Home, Plus, Minus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useAuth } from '../context/useAuth';
import { useAccountNotice } from '../components/AccountRequiredNotice';

const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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

// Benthic class colors — match reference legend (Seagrass green, Rubble brown,
// Sand tan, Rock slate, Coral/Algae light blue)
const BENTHIC_COLORS: Record<string, string> = {
  Seagrass:      '#3f8d6e',
  Rubble:        '#8a6843',
  Sand:          '#e0d2a4',
  Rock:          '#7a8492',
  'Coral/Algae': '#7dc4d3',
};
const BENTHIC_DEFAULT_COLOR = '#999999';

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

// Capture Leaflet map instance from inside MapContainer so external controls (zoom +/-) can drive it.
function MapInstanceCapture({ onReady }: { onReady: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

// Smoothly fly the map to a selected location. Uses Leaflet's `flyTo` for an
// animated zoom-in. Zoom level 15 is close enough to read the coastline / beach
// outline. We re-fly whenever the target lat/lng/zoom changes (React identity
// changes per selection thanks to the array literal in the parent).
function FlyToSelected({
  target,
  zoom = 15,
}: {
  target: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo(target, zoom, { duration: 1.2, easeLinearity: 0.25 });
  }, [target?.[0], target?.[1], zoom, map]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// Layer filter options used by the floating dropdown.
const LAYER_OPTIONS = [
  { val: 'all',      label: 'Semua Layer', color: '#64748b' },
  { val: 'mangrove', label: 'Mangrove',    color: '#16a34a' },
  { val: 'abrasi',   label: 'Abrasi',      color: '#f97316' },
  { val: 'penyu',    label: 'Penyu',       color: '#0d9488' },
  { val: 'benthic',  label: 'Benthic',     color: '#0891b2' },
] as const;

export default function PetaPublik() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { show: showAccountNotice } = useAccountNotice();

  // Single layer filter: 'all' | 'mangrove' | 'abrasi' | 'penyu' | 'benthic'
  const [activeLayerFilter, setActiveLayerFilter] = useState<'all' | 'mangrove' | 'abrasi' | 'penyu' | 'benthic'>('all');
  const [activeMapLayer, setActiveMapLayer] = useState('osm');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'mangrove' | 'abrasi' | 'penyu' | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [mapTypeMenuOpen, setMapTypeMenuOpen] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Derived visibility from single filter
  const showMangrove = activeLayerFilter === 'all' || activeLayerFilter === 'mangrove';
  const showAbrasi   = activeLayerFilter === 'all' || activeLayerFilter === 'abrasi';
  const showPenyu    = activeLayerFilter === 'all' || activeLayerFilter === 'penyu';
  const showBenthic  = activeLayerFilter === 'all' || activeLayerFilter === 'benthic';

  // Benthic GeoJSON
  const [benthicData, setBenthicData] = useState<any>(null);
  const [benthicLoading, setBenthicLoading] = useState(false);


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
      fetch('/benthic.geojson')
        .then(r => r.json())
        .then(d => { setBenthicData(d); setBenthicLoading(false); })
        .catch(() => setBenthicLoading(false));
    }
  }, [showBenthic, benthicData]);

  // Aggregate benthic class counts for the legend
  const benthicCounts = useMemo<Record<string, number> | null>(() => {
    if (!benthicData?.features) return null;
    const counts: Record<string, number> = {};
    for (const f of benthicData.features) {
      const cls = (f.properties?.class as string) ?? 'Unknown';
      counts[cls] = (counts[cls] ?? 0) + 1;
    }
    return counts;
  }, [benthicData]);

  // Render order matches the reference legend
  const BENTHIC_ORDER = ['Seagrass', 'Rubble', 'Sand', 'Rock', 'Coral/Algae'];

  const selectedMangrove = mangroveLocations.find(l => l.id === selectedId && selectedType === 'mangrove');
  const selectedAbrasi = allAbrasi.find(l => l.id === selectedId && selectedType === 'abrasi');
  const selectedPenyu = allPenyu.find(l => l.id === selectedId && selectedType === 'penyu');
  const selectedEco = ekosistemData.find(e => e.locationId === selectedId);

  // Target for animated fly-to whenever a location is selected
  const flyTarget: [number, number] | null = selectedMangrove
    ? [selectedMangrove.lat, selectedMangrove.lng]
    : selectedAbrasi
      ? [selectedAbrasi.koordinat.lat, selectedAbrasi.koordinat.lng]
      : selectedPenyu
        ? [selectedPenyu.lat, selectedPenyu.lng]
        : null;

  const doDownload = () => {
    // TODO: implement actual download
    alert('Download sedang disiapkan...');
  };

  /**
   * Bungkus tombol dengan trigger Clerk sign-in modal kalau user belum login.
   * Kalau Clerk tidak dikonfigur (env kosong), redirect ke landing page agar
   * admin/verifikator masih bisa login via form di sana.
   */
  const AuthRequired = ({
    children,
    mode = 'signin',
  }: {
    children: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
    mode?: 'signin' | 'signup';
  }) => {
    if (user) return children;
    if (isClerkConfigured) {
      if (mode === 'signup') {
        return (
          <SignUpButton mode="modal" forceRedirectUrl="/peta">
            {children}
          </SignUpButton>
        );
      }
      return (
        <SignInButton mode="modal" forceRedirectUrl="/peta">
          {children}
        </SignInButton>
      );
    }
    // Fallback: Clerk belum ter-config → tampilkan notice modal yang friendly
    // (bukan redirect senyap ke form admin login). cloneElement memasang
    // onClick langsung ke <button>, lebih reliable di mobile.
    return cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        showAccountNotice(
          mode === 'signup'
            ? {
                title: 'Daftar Akun Baru',
                message:
                  'Untuk mengakses fitur unduh data dan kontribusi survei, silakan daftar akun ID-MAP. Pendaftaran publik via Google sedang dalam persiapan — sementara hubungi admin untuk mendapat akses.',
              }
            : undefined,
        );
      },
    });
  };

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: '#f1f5f9', color: '#0f172a' }}>

      {/* ── TOP BAR (light/clean) ── */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 flex-shrink-0 border-b border-slate-200 gap-2 bg-white">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors flex-shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Beranda</span>
          </button>
          <div className="w-px h-6 bg-slate-200 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald-700">ID-MAP</p>
            <h1 className="text-slate-800 font-bold text-xs md:text-sm leading-tight truncate hidden sm:block">Peta Interaktif Mangrove dan Ekosistem Pesisir</h1>
          </div>
        </div>


        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Tombol Unduh — belum login → buka modal Clerk Sign Up */}
          <AuthRequired mode="signup">
            <button
              onClick={user ? doDownload : undefined}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-300 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Unduh</span>
            </button>
          </AuthRequired>

          {user ? (
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">
              <span className="hidden sm:inline">Dashboard</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <>
              {/* Daftar → Clerk Sign Up modal | Login → Clerk Sign In modal */}
              <AuthRequired mode="signup">
                <button
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110"
                  style={{ background: 'linear-gradient(90deg, #059669, #0ea5e9)' }}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Daftar
                </button>
              </AuthRequired>
              <AuthRequired>
                <button
                  className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-700 transition-colors shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </button>
              </AuthRequired>
            </>
          )}

          {/* Panel toggle (mobile) */}
          <button
            onClick={() => setPanelOpen(o => !o)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors sm:hidden"
            title="Toggle panel"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* ── MAP + SIDEBAR ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* MAP */}
        <div className="flex-1 relative">
          <MapContainer center={[-8.3, 112.6]} zoom={9} style={{ height: '100%', width: '100%', background: '#0d1117' }} zoomControl={false}>
            <MapController center={[-8.3, 112.6]} zoom={9} />
            <MapInstanceCapture onReady={setMapInstance} />
            <FlyToSelected target={flyTarget} zoom={15} />
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

            {/* Benthic layer — Polygon GeoJSON colored per class */}
            {showBenthic && benthicData && (
              <GeoJSON
                key="benthic"
                data={benthicData}
                style={(feature) => {
                  const cls = feature?.properties?.class ?? 'Unknown';
                  const color = BENTHIC_COLORS[cls] ?? BENTHIC_DEFAULT_COLOR;
                  return {
                    color,
                    fillColor: color,
                    fillOpacity: 0.65,
                    weight: 0.4,
                    opacity: 0.8,
                  };
                }}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(
                    `<div style="font-size:12px"><strong>Benthic</strong><br/>Kelas: ${feature.properties?.class}</div>`,
                  );
                }}
              />
            )}
          </MapContainer>

          {benthicLoading && (
            <div className="absolute top-3 left-3 z-[999] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 bg-white/95 backdrop-blur shadow-sm text-cyan-700 border border-cyan-200">
              <span className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              Memuat data benthic...
            </div>
          )}

          {/* ── FLOATING RIGHT CONTROLS — order: Map type → Layer → Zoom ── */}
          <div className="absolute top-14 right-3 z-[1000] flex flex-col items-end gap-2">

            {/* 1. Map type dropdown (top) */}
            <div className="relative">
              <button
                onClick={() => { setMapTypeMenuOpen(o => !o); setLayerMenuOpen(false); }}
                className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl bg-white/95 backdrop-blur shadow-md border border-slate-200 text-xs font-semibold text-slate-700 hover:border-emerald-400 transition-all min-w-[140px]"
              >
                {(() => {
                  const cur = MAP_LAYERS.find(l => l.id === activeMapLayer) ?? MAP_LAYERS[0];
                  const Icon = cur.icon;
                  return (
                    <>
                      <Icon className="w-3.5 h-3.5 text-sky-600" />
                      <span className="flex-1 text-left">{cur.label}</span>
                    </>
                  );
                })()}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${mapTypeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {mapTypeMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
                  {MAP_LAYERS.map(l => {
                    const Icon = l.icon;
                    const isActive = activeMapLayer === l.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => { setActiveMapLayer(l.id); setMapTypeMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="flex-1 text-left">{l.label}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Layer filter dropdown (right under Map type) */}
            <div className="relative">
              <button
                onClick={() => { setLayerMenuOpen(o => !o); setMapTypeMenuOpen(false); }}
                className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl bg-white/95 backdrop-blur shadow-md border border-slate-200 text-xs font-semibold text-slate-700 hover:border-emerald-400 transition-all min-w-[140px]"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span className="flex-1 text-left">
                  {LAYER_OPTIONS.find(l => l.val === activeLayerFilter)?.label}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${layerMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {layerMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
                  {LAYER_OPTIONS.map(opt => {
                    const isActive = activeLayerFilter === opt.val;
                    return (
                      <button
                        key={opt.val}
                        onClick={() => {
                          setActiveLayerFilter(opt.val);
                          setSelectedId(null);
                          setSelectedType(null);
                          setLayerMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                        <span className="flex-1 text-left">{opt.label}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Zoom controls (bottom) */}
            <div className="flex flex-col rounded-xl bg-white/95 backdrop-blur shadow-md border border-slate-200 overflow-hidden">
              <button
                onClick={() => mapInstance?.zoomIn()}
                className="flex items-center justify-center w-9 h-9 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-slate-200"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => mapInstance?.zoomOut()}
                className="flex items-center justify-center w-9 h-9 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── PANEL TOGGLE BUTTON (floating, desktop) ── */}
        <button
          onClick={() => setPanelOpen(o => !o)}
          className="absolute top-3 right-3 z-[998] hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/95 backdrop-blur shadow-sm text-slate-600 hover:text-slate-800 border border-slate-200"
          title={panelOpen ? 'Sembunyikan panel' : 'Tampilkan panel'}
        >
          <PanelRight className={`w-3.5 h-3.5 transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
          <span className="hidden md:inline">{panelOpen ? 'Tutup' : 'Panel'}</span>
        </button>

        {/* ── RIGHT SIDEBAR ── Desktop inline */}
        {panelOpen && (
        <div className="hidden sm:flex w-64 md:w-72 flex-shrink-0 flex-col border-l border-slate-200 overflow-y-auto" style={{ background: '#ffffff' }}>

          {/* Legend */}
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-3">
              <Layers className="w-4 h-4 text-teal-400" /> Legenda
            </div>

            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Titik Mangrove</p>
            <div className="space-y-1.5 mb-3">
              {Object.entries(MANGROVE_STATUS_COLORS).map(([s, color]) => (
                <div key={s} className="flex items-center gap-2.5">
                  <div className="rounded-full flex-shrink-0"
                    style={{ width: MANGROVE_RADIUS[s] * 1.6, height: MANGROVE_RADIUS[s] * 1.6, background: color, opacity: 0.85 }} />
                  <span className="text-xs capitalize text-slate-700">{s}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Titik Abrasi / Rekomendasi</p>
            <div className="space-y-1.5 mb-3">
              {Object.entries(ABRASI_PRIORITAS_COLORS).map(([p, color]) => (
                <div key={p} className="flex items-center gap-2">
                  <div className="text-sm">🌿</div>
                  <span className="text-xs text-slate-700">{p}</span>
                  <div className="w-2 h-2 rounded-full ml-auto" style={{ background: color }} />
                </div>
              ))}
            </div>

            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Pendaratan Penyu</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="text-sm">🐢</div>
              <span className="text-xs text-slate-700">Titik pendaratan penyu laut</span>
            </div>

            {/* Kelas Benthic legend (visible when benthic layer active or 'all') */}
            {showBenthic && (
              <>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Kelas Benthic</p>
                <div className="space-y-1.5">
                  {BENTHIC_ORDER.map((cls) => (
                    <div key={cls} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ background: BENTHIC_COLORS[cls] ?? BENTHIC_DEFAULT_COLOR }}
                      />
                      <span className="text-xs text-slate-700 flex-1">{cls}</span>
                      {benthicCounts && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {(benthicCounts[cls] ?? 0).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Download section */}
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Unduh Data</p>
            <div className="space-y-1.5">
              <AuthRequired mode="signup">
                <button
                  onClick={user ? doDownload : undefined}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-slate-50 transition-colors text-slate-600 border border-slate-200"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  Unduh PDF Laporan
                </button>
              </AuthRequired>
              <AuthRequired mode="signup">
                <button
                  onClick={user ? doDownload : undefined}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-slate-50 transition-colors text-slate-600 border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-green-400" />
                  Unduh Marker KML/GeoJSON
                </button>
              </AuthRequired>
            </div>
            {!user && (
              <p className="text-[10px] text-slate-400 mt-2 text-center">
                🔒 Perlu login untuk mengunduh
              </p>
            )}
          </div>

          {/* Selected location detail */}
          {selectedMangrove && (
            <DetailPanel onClose={() => { setSelectedId(null); setSelectedType(null); }}>
              <div className="font-bold text-slate-800 text-sm">{selectedMangrove.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{selectedMangrove.district}, {selectedMangrove.province}</div>
              <div className="mt-3 space-y-2">
                <InfoRow label="Status">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{ background: `${MANGROVE_STATUS_COLORS[selectedMangrove.status]}20`, color: MANGROVE_STATUS_COLORS[selectedMangrove.status] }}>
                    {selectedMangrove.status}
                  </span>
                </InfoRow>
                <InfoRow label="Luas"><span className="text-xs text-slate-700">{selectedMangrove.areaHa.toLocaleString()} ha</span></InfoRow>
                <InfoRow label="Kawasan"><span className="text-xs text-slate-700 capitalize">{selectedMangrove.kawasan.replace(/_/g, ' ')}</span></InfoRow>
                <InfoRow label="Survei Terakhir"><span className="text-xs text-slate-500">{selectedMangrove.lastSurvey}</span></InfoRow>
                <InfoRow label="Koordinat">
                  <span className="text-[10px] text-slate-500 font-mono">{selectedMangrove.lat.toFixed(4)}, {selectedMangrove.lng.toFixed(4)}</span>
                </InfoRow>
                {selectedEco && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider mb-1.5">Ekosistem</p>
                    <InfoRow label="Skor Kesehatan">
                      <span className="text-sm font-bold" style={{ color: selectedEco.skorKesehatan >= 75 ? '#22c55e' : selectedEco.skorKesehatan >= 50 ? '#eab308' : '#ef4444' }}>
                        {selectedEco.skorKesehatan}/100
                      </span>
                    </InfoRow>
                    <InfoRow label="Tutupan Tajuk"><span className="text-xs text-slate-700">{selectedEco.tutupanTajuk}%</span></InfoRow>
                    <InfoRow label="Kerapatan"><span className="text-xs text-slate-700">{selectedEco.kerapatanPohon} pohon/ha</span></InfoRow>
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
              <div className="font-bold text-slate-800 text-sm">{selectedAbrasi.namaPantai}</div>
              <div className="text-xs text-slate-500 mt-0.5">{selectedAbrasi.kecamatan}, {selectedAbrasi.kabKota}</div>
              <div className="mt-3 space-y-2">
                <InfoRow label="Skor Risiko">
                  <span className="text-sm font-bold" style={{ color: selectedAbrasi.skorRisiko >= 8 ? '#ef4444' : selectedAbrasi.skorRisiko >= 6 ? '#f97316' : '#eab308' }}>
                    {selectedAbrasi.skorRisiko}/10
                  </span>
                </InfoRow>
                <InfoRow label="Substrat"><span className="text-xs text-slate-700 capitalize">{selectedAbrasi.substrat}</span></InfoRow>
                <InfoRow label="Restorasi"><span className="text-xs text-slate-700">{selectedAbrasi.luasanRestorasi.min}–{selectedAbrasi.luasanRestorasi.max} {selectedAbrasi.luasanRestorasi.satuan}</span></InfoRow>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200">
                <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider mb-1.5">Rekomendasi Tanaman</p>
                <ul className="space-y-1">
                  {selectedAbrasi.tanamanRekomendasi.map(t => (
                    <li key={t} className="text-[11px] text-slate-600 italic flex gap-1">
                      <span className="text-green-500">•</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200">
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
              <div className="font-bold text-slate-800 text-sm">{selectedPenyu.namaPantai}</div>
              <div className="text-xs text-slate-500 mt-0.5">{selectedPenyu.lokasi}</div>
              <div className="mt-3 space-y-2">
                <InfoRow label="Jenis Penyu"><span className="text-xs text-slate-700">{selectedPenyu.jenis}</span></InfoRow>
                <InfoRow label="Jumlah Sarang"><span className="text-sm font-bold text-teal-400">{selectedPenyu.sarang} titik</span></InfoRow>
                <InfoRow label="Koordinat">
                  <span className="text-[10px] text-slate-500 font-mono">{selectedPenyu.lat.toFixed(4)}, {selectedPenyu.lng.toFixed(4)}</span>
                </InfoRow>
              </div>
            </DetailPanel>
          )}

          {/* No selection: collapsible category lists */}
          {!selectedId && (
            <div className="flex-1 flex flex-col px-3 py-3 overflow-y-auto">
              {(activeLayerFilter === 'all' || activeLayerFilter === 'mangrove') && (
                <CategorySection
                  icon="🌿"
                  title="Mangrove"
                  count={mangroveFiltered.length}
                  accent="#16a34a"
                >
                  {mangroveFiltered.map(loc => (
                    <button key={loc.id}
                      onClick={() => { setSelectedId(loc.id); setSelectedType('mangrove'); }}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-colors">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: MANGROVE_STATUS_COLORS[loc.status] }} />
                      <span className="truncate text-slate-600">{loc.name}</span>
                      <span className="ml-auto text-slate-400 flex-shrink-0 text-[10px]">{loc.areaHa.toLocaleString()} ha</span>
                    </button>
                  ))}
                </CategorySection>
              )}

              {(activeLayerFilter === 'all' || activeLayerFilter === 'abrasi') && (
                <CategorySection
                  icon="🌊"
                  title="Abrasi / Rekomendasi"
                  count={allAbrasi.length}
                  accent="#f97316"
                >
                  {allAbrasi.map(abr => (
                    <button key={abr.id}
                      onClick={() => { setSelectedId(abr.id); setSelectedType('abrasi'); }}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-colors">
                      <span className="flex-shrink-0">🌿</span>
                      <span className="truncate text-slate-600">{abr.namaPantai}</span>
                      <span className="ml-auto text-[10px] flex-shrink-0 font-bold"
                        style={{ color: ABRASI_PRIORITAS_COLORS[abr.prioritas] }}>{abr.skorRisiko}/10</span>
                    </button>
                  ))}
                </CategorySection>
              )}

              {(activeLayerFilter === 'all' || activeLayerFilter === 'penyu') && (
                <CategorySection
                  icon="🐢"
                  title="Pendaratan Penyu"
                  count={allPenyu.length}
                  accent="#0d9488"
                >
                  {allPenyu.map(pny => (
                    <button key={pny.id}
                      onClick={() => { setSelectedId(pny.id); setSelectedType('penyu'); }}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-colors">
                      <span className="flex-shrink-0">🐢</span>
                      <span className="truncate text-slate-600">{pny.namaPantai}</span>
                      <span className="ml-auto text-teal-500 flex-shrink-0 text-[10px]">{pny.sarang} sarang</span>
                    </button>
                  ))}
                </CategorySection>
              )}
            </div>
          )}
        </div>
        )}

        {/* ── RIGHT SIDEBAR ── Mobile overlay */}
        {panelOpen && (
        <div className="sm:hidden fixed inset-0 z-[997] flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPanelOpen(false)} />
          <div className="relative z-10 w-72 max-w-[85vw] flex flex-col border-l border-slate-200 overflow-y-auto" style={{ background: '#ffffff' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Panel Info</span>
              <button onClick={() => setPanelOpen(false)} className="text-slate-500 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-3">
                <Layers className="w-4 h-4 text-teal-400" /> Legenda
              </div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Titik Mangrove</p>
              <div className="space-y-1.5 mb-3">
                {Object.entries(MANGROVE_STATUS_COLORS).map(([s, color]) => (
                  <div key={s} className="flex items-center gap-2.5">
                    <div className="rounded-full flex-shrink-0"
                      style={{ width: MANGROVE_RADIUS[s] * 1.6, height: MANGROVE_RADIUS[s] * 1.6, background: color, opacity: 0.85 }} />
                    <span className="text-xs capitalize text-slate-700">{s}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Titik Abrasi / Rekomendasi</p>
              <div className="space-y-1.5 mb-3">
                {Object.entries(ABRASI_PRIORITAS_COLORS).map(([p, color]) => (
                  <div key={p} className="flex items-center gap-2">
                    <div className="text-sm">🌿</div>
                    <span className="text-xs text-slate-700">{p}</span>
                    <div className="w-2 h-2 rounded-full ml-auto" style={{ background: color }} />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Pendaratan Penyu</p>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-sm">🐢</div>
                <span className="text-xs text-slate-700">Titik pendaratan penyu laut</span>
              </div>

              {showBenthic && (
                <>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Kelas Benthic</p>
                  <div className="space-y-1.5">
                    {BENTHIC_ORDER.map((cls) => (
                      <div key={cls} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ background: BENTHIC_COLORS[cls] ?? BENTHIC_DEFAULT_COLOR }}
                        />
                        <span className="text-xs text-slate-700 flex-1">{cls}</span>
                        {benthicCounts && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {(benthicCounts[cls] ?? 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Unduh Data — mobile (mirrors desktop sidebar) */}
            <div className="px-4 py-3 border-b border-slate-200">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Unduh Data</p>
              <div className="space-y-1.5">
                <AuthRequired mode="signup">
                  <button
                    onClick={user ? doDownload : undefined}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-slate-50 transition-colors text-slate-600 border border-slate-200"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                    Unduh PDF Laporan
                  </button>
                </AuthRequired>
                <AuthRequired mode="signup">
                  <button
                    onClick={user ? doDownload : undefined}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-slate-50 transition-colors text-slate-600 border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-green-400" />
                    Unduh Marker KML/GeoJSON
                  </button>
                </AuthRequired>
              </div>
              {!user && (
                <p className="text-[10px] text-slate-400 mt-2 text-center">
                  🔒 Perlu login untuk mengunduh
                </p>
              )}
            </div>

            {/* Auth shortcut — mobile (Daftar / Login) */}
            {!user && (
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Akun</p>
                <div className="space-y-1.5">
                  <AuthRequired mode="signup">
                    <button
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110"
                      style={{ background: 'linear-gradient(90deg, #059669, #0ea5e9)' }}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Daftar Akun Baru
                    </button>
                  </AuthRequired>
                  <AuthRequired>
                    <button
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Login
                    </button>
                  </AuthRequired>
                </div>
              </div>
            )}

            {/* Location list — collapsible */}
            <div className="flex-1 flex flex-col px-3 py-3 overflow-y-auto">
              {(activeLayerFilter === 'all' || activeLayerFilter === 'mangrove') && (
                <CategorySection
                  icon="🌿"
                  title="Mangrove"
                  count={mangroveFiltered.length}
                  accent="#16a34a"
                >
                  {mangroveFiltered.map(loc => (
                    <button key={loc.id}
                      onClick={() => { setSelectedId(loc.id); setSelectedType('mangrove'); setPanelOpen(false); }}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-colors">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: MANGROVE_STATUS_COLORS[loc.status] }} />
                      <span className="truncate text-slate-600">{loc.name}</span>
                      <span className="ml-auto text-slate-400 flex-shrink-0 text-[10px]">{loc.areaHa.toLocaleString()} ha</span>
                    </button>
                  ))}
                </CategorySection>
              )}

              {(activeLayerFilter === 'all' || activeLayerFilter === 'abrasi') && (
                <CategorySection
                  icon="🌊"
                  title="Abrasi / Rekomendasi"
                  count={allAbrasi.length}
                  accent="#f97316"
                >
                  {allAbrasi.map(abr => (
                    <button key={abr.id}
                      onClick={() => { setSelectedId(abr.id); setSelectedType('abrasi'); setPanelOpen(false); }}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-colors">
                      <span className="flex-shrink-0">🌿</span>
                      <span className="truncate text-slate-600">{abr.namaPantai}</span>
                      <span className="ml-auto text-[10px] flex-shrink-0 font-bold"
                        style={{ color: ABRASI_PRIORITAS_COLORS[abr.prioritas] }}>{abr.skorRisiko}/10</span>
                    </button>
                  ))}
                </CategorySection>
              )}

              {(activeLayerFilter === 'all' || activeLayerFilter === 'penyu') && (
                <CategorySection
                  icon="🐢"
                  title="Pendaratan Penyu"
                  count={allPenyu.length}
                  accent="#0d9488"
                >
                  {allPenyu.map(pny => (
                    <button key={pny.id}
                      onClick={() => { setSelectedId(pny.id); setSelectedType('penyu'); setPanelOpen(false); }}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-colors">
                      <span className="flex-shrink-0">🐢</span>
                      <span className="truncate text-slate-600">{pny.namaPantai}</span>
                      <span className="ml-auto text-teal-500 flex-shrink-0 text-[10px]">{pny.sarang} sarang</span>
                    </button>
                  ))}
                </CategorySection>
              )}
            </div>
          </div>
        </div>
        )}

      </div>

    </div>
  );
}

function DetailPanel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="flex-1 px-4 py-3 border-t border-slate-200">
      <div className="flex justify-end mb-2">
        <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
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
      <span className="text-xs text-slate-500">{label}</span>
      <div>{children}</div>
    </div>
  );
}

/**
 * Collapsible category section for the right sidebar.
 * Default state: collapsed (hidden). Click header to expand/collapse.
 */
function CategorySection({
  icon, title, count, accent = '#64748b', defaultOpen = false, children,
}: {
  icon: string;
  title: string;
  count: number;
  accent?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm leading-none">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        <span className="text-[10px] font-bold" style={{ color: accent }}>({count})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? '50vh' : 0 }}
      >
        <div className="mt-1 space-y-0.5 overflow-y-auto pb-1" style={{ maxHeight: '50vh' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
