import { useState, useEffect, useMemo, useRef, cloneElement } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents, GeoJSON } from 'react-leaflet';
import type { FeatureCollection } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mangroveLocations as seedLocations, ekosistemData } from '../data/seedData';
import { fetchAllLocations } from '../data/locations';
import type { MangroveLocation } from '../types';
import { titikAbrasiData, type PrioritasLevel, type SubstratType, type TitikAbrasi } from '../data/abrasiData';
import { usePokmaswas } from '../hooks/usePokmaswas';
import { fetchSurveys, mapDbSurveyToSurveyRecord, type SurveyRecord } from '../data/localStore';
import { convex, isConvexConfigured, convexSurveyToDbSurvey } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { getCloudinaryUrl } from '../lib/cloudinary';
import { Layers, Map, Satellite, Mountain, ChevronRight, ChevronDown, X, Download, FileText, LogIn, UserPlus, PanelRight, Home, Plus, Minus, Check, Search, Waves, LocateFixed, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClerkAuthGate from '../components/clerk/ClerkAuthGate';
import { useAuth } from '../context/useAuth';
import { useAccountNotice } from '../components/AccountRequiredNotice';
import DownloadDropdown from '../components/DownloadDropdown';
import { RUANG_LINGKUP_OPTIONS, BIDANG_CORE_OPTIONS } from '../data/pokmaswasProfile';
import { recordVisit } from '../lib/statsClient';
import { applyOverridesToList, setOverride, removeOverride, getOverrides } from '../lib/coordOverrides';
import { parseCoord } from '../lib/coordParser';

const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// ── Penyu coordinates (nesting beaches Kab. Malang pesisir selatan) ──────────
const penyuLocations = [
  { id: 'PNY-001', namaPantai: 'Pantai Bajul Mati',    lokasi: 'Gedangan, Kab. Malang',           lat: -8.3940, lng: 112.5300, jenis: 'Penyu Lekang', sarang: 12, fotoUrl: '' },
  { id: 'PNY-002', namaPantai: 'Pantai Sendang Biru',  lokasi: 'Sumbermanjing, Kab. Malang',      lat: -8.4370, lng: 112.6200, jenis: 'Penyu Hijau',  sarang: 8,  fotoUrl: '' },
  { id: 'PNY-003', namaPantai: 'Pantai Nganteb',       lokasi: 'Tirtoyudo, Kab. Malang',          lat: -8.4660, lng: 112.7200, jenis: 'Penyu Lekang', sarang: 5,  fotoUrl: '' },
  { id: 'PNY-004', namaPantai: 'Pantai Wonogoro',      lokasi: 'Gedangan, Kab. Malang',           lat: -8.3810, lng: 112.5080, jenis: 'Penyu Sisik',  sarang: 3,  fotoUrl: '' },
  { id: 'PNY-005', namaPantai: 'Pantai Lenggoksono',   lokasi: 'Tirtoyudo, Kab. Malang',          lat: -8.4580, lng: 112.7500, jenis: 'Penyu Hijau',  sarang: 7,  fotoUrl: '' },
  { id: 'PNY-006', namaPantai: 'Pantai Kondang Iwak',  lokasi: 'Ampelgading, Kab. Malang',        lat: -8.4730, lng: 112.7940, jenis: 'Penyu Lekang', sarang: 4,  fotoUrl: '' },
  { id: 'PNY-007', namaPantai: 'Pantai Sidoasri',      lokasi: 'Gedangan, Kab. Malang',           lat: -8.3880, lng: 112.4890, jenis: 'Penyu Lekang', sarang: 6,  fotoUrl: '' },
  { id: 'PNY-008', namaPantai: 'Pantai Tamban',        lokasi: 'Sumbermanjing Wetan, Kab. Malang',lat: -8.4430, lng: 112.5930, jenis: 'Penyu Hijau',  sarang: 5,  fotoUrl: '' },
  { id: 'PNY-009', namaPantai: 'Pantai Clungup',       lokasi: 'Sumbermanjing Wetan, Kab. Malang',lat: -8.4490, lng: 112.5985, jenis: 'Penyu Sisik',  sarang: 2,  fotoUrl: '' },
  { id: 'PNY-010', namaPantai: 'Pantai Goa Cina',      lokasi: 'Sumbermanjing Wetan, Kab. Malang',lat: -8.4526, lng: 112.6091, jenis: 'Penyu Hijau',  sarang: 9,  fotoUrl: '' },
  { id: 'PNY-011', namaPantai: 'Pantai Sipelot',       lokasi: 'Dampit, Kab. Malang',             lat: -8.4605, lng: 112.6427, jenis: 'Penyu Lekang', sarang: 3,  fotoUrl: '' },
  { id: 'PNY-012', namaPantai: 'Pantai Licin',         lokasi: 'Tirtoyudo, Kab. Malang',          lat: -8.4687, lng: 112.7035, jenis: 'Penyu Hijau',  sarang: 4,  fotoUrl: '' },
  { id: 'PNY-013', namaPantai: 'Pantai Batu Bengkung', lokasi: 'Gedangan, Kab. Malang',           lat: -8.3890, lng: 112.4760, jenis: 'Penyu Sisik',  sarang: 2,  fotoUrl: '' },
  { id: 'PNY-014', namaPantai: 'Pantai Jengkol',       lokasi: 'Ampelgading, Kab. Malang',        lat: -8.4742, lng: 112.7683, jenis: 'Penyu Lekang', sarang: 5,  fotoUrl: '' },
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

type PenyuLoc = (typeof penyuLocations)[number] & {
  sarangPoints?: Array<{ id: string; lat: string; lng: string; latNum: number; lngNum: number; catatan?: string; waktu?: string; fotoUrl?: string }>;
};

/** SurveyRecord (pendaratan_penyu) → marker penyu. */
function surveysToPenyuList(surveys: SurveyRecord[]): PenyuLoc[] {
  return surveys
    .filter(s => s.tujuanSurvei === 'pendaratan_penyu' && s.koordinatLat && s.koordinatLng)
    .map(s => ({
      id: s.id,
      namaPantai: s.namaPantai || s.locationName || 'Pantai Pendaratan Penyu',
      lokasi: s.locationName || s.province || '',
      lat: parseFloat(s.koordinatLat!),
      lng: parseFloat(s.koordinatLng!),
      jenis: s.jenisPenyu || 'Penyu',
      sarang: parseInt(s.jumlahSarang || '0'),
      fotoUrl: s.fotoDokumentasi || s.sarangPoints?.find(p => p.fotoUrl)?.fotoUrl || '',
      sarangPoints: s.sarangPoints?.filter(p => p.lat && p.lng).map((p, idx) => ({
        ...p,
        id: `${s.id}-sarang-${idx + 1}`,
        latNum: parseFloat(p.lat),
        lngNum: parseFloat(p.lng),
      })).filter(p => !isNaN(p.latNum) && !isNaN(p.lngNum)) ?? [],
    }))
    .filter(p => !isNaN(p.lat) && !isNaN(p.lng)) as PenyuLoc[];
}

/** SurveyRecord (abrasi) → marker titik abrasi. */
function surveysToAbrasiList(surveys: SurveyRecord[]): TitikAbrasi[] {
  return surveys
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
      prioritas: (s.prioritasAbrasi || 'Sedang') as PrioritasLevel,
      substrat: (s.substrat || 'pasir') as SubstratType,
      ancamanUtama: s.ancamanUtama || [],
      skorRisiko: s.skorPotensi || 5,
    }))
    .filter(a => !isNaN(a.koordinat.lat) && !isNaN(a.koordinat.lng));
}

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

const MHI_COLORS: Record<string, string> = {
  'Potential Rehabilitation Area': '#ff2600',
  Poor: '#ffbb00',
  Moderate: '#a4c400',
  Excelent: '#006100',
};
const MHI_DEFAULT_COLOR = '#64748b';
const MHI_ORDER = ['Potential Rehabilitation Area', 'Poor', 'Moderate', 'Excelent'];

// Keterangan sumber data — ditampilkan di bawah legenda (desktop & mobile)
const DATA_SOURCES: { label: string; source: string }[] = [
  {
    label: 'MHI (Mangrove Health Index)',
    source: 'Citra Satelit Landsat tahun 2025 dan digitasi petugas.',
  },
  {
    label: 'Pokmaswas',
    source: 'Pendataan Cabang Dinas Kelautan dan Perikanan Kab. Malang, update tahun 2025.',
  },
  {
    label: 'Benthic',
    source: 'Peta tutupan terumbu karang hasil citra satelit.',
  },
  {
    label: 'RTRW Darat & RTRW Laut',
    source: 'Perda Jatim No. 10 Tahun 2023 tentang Rencana Tata Ruang Wilayah Provinsi Jawa Timur.',
  },
  {
    label: 'Penyu',
    source: 'Ground check petugas Cabang Dinas Kelautan dan Perikanan Kab. Malang di lokasi.',
  },
];

const MAP_LAYERS = [
  { id: 'osm', label: 'OpenStreetMap', icon: Map, url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
  { id: 'satellite', label: 'Satelit', icon: Satellite, url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
  { id: 'topo', label: 'Topografi', icon: Mountain, url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenTopoMap' },
];
const DEFAULT_MAP_CENTER: [number, number] = [-8.3, 112.6];
const DEFAULT_MAP_ZOOM = 9;

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
    html: `<div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:#0f766e;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.55);font-size:20px;line-height:1">🐢</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function makeTurtleNestIcon(_index: number) {
  return L.divIcon({
    className: '',
    html: `<div style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:#0f766e;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.45);font-size:16px;line-height:1">🐢</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

function makePokmaswasIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:#7c3aed;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);font-size:14px">👤</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

// Badge pin untuk titik tujuan "Input Koordinat": menandai lokasi yang
// dituju di atas polygon zona ruang (RTRW Darat/RTRW Laut) agar
// pengguna melihat posisi titik terhadap zonanya.
function makeCoordinatePinIcon() {
  return L.divIcon({
    className: 'coordinate-pin-icon',
    html: `<div class="coordinate-pin"><span class="coordinate-pin-ring"></span><span class="coordinate-pin-core"></span></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
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

function MapCoordinates({ onChange }: { onChange: (coordinates: [number, number]) => void }) {
  useMapEvents({
    mousemove: event => onChange([event.latlng.lat, event.latlng.lng]),
    click: event => onChange([event.latlng.lat, event.latlng.lng]),
  });
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
  { val: 'none',      label: 'Pilih Layer',  color: '#94a3b8' },
  { val: 'all',       label: 'Semua Layer',  color: '#64748b' },
  { val: 'mangrove',  label: 'Mangrove',     color: '#16a34a' },
  { val: 'abrasi',    label: 'Abrasi',       color: '#f97316' },
  { val: 'penyu',     label: 'Penyu',        color: '#0d9488' },
  { val: 'pokmaswas', label: 'Pokmaswas',    color: '#7c3aed' },
  { val: 'mhi',       label: 'MHI',          color: '#006100' },
  { val: 'benthic',   label: 'Benthic',      color: '#0891b2' },
  { val: 'polaruang',   label: 'RTRW Laut',    color: '#d97706' },
  { val: 'konservasi',  label: 'Konservasi',   color: '#15803d' },
  { val: 'rtrw-jawa-timur', label: 'RTRW Darat', color: '#047857' },
] as const;

type DataLayer = Exclude<(typeof LAYER_OPTIONS)[number]['val'], 'none' | 'all'>;
const DATA_LAYER_OPTIONS = LAYER_OPTIONS.filter((layer): layer is Extract<(typeof LAYER_OPTIONS)[number], { val: DataLayer }> => layer.val !== 'none' && layer.val !== 'all');

// Cache in-memory hasil GeoJSON RTRW agar toggle layer tidak fetch ulang.
// (Pakai object biasa — nama `Map` sudah dipakai icon lucide-react.)
const rtrwCache: Record<string, FeatureCollection> = {};

const RTRW_GEOJSON_FILES = [
  'Kab. Malang.geojson',
  'Kab. Pasuruan.geojson',
  'Kota. Pasuruan.geojson',
  'Kota Surabaya.geojson',
  'Kab. Sidoarjo.geojson',
];

function rtrwFeatureStyle(feature?: GeoJSON.Feature) {
  const properties = feature?.properties as Record<string, unknown> | null | undefined;
  const fillColor = typeof properties?.fill === 'string' ? properties.fill : '#34d399';
  const strokeColor = typeof properties?.stroke === 'string' ? properties.stroke : fillColor;

  return {
    color: strokeColor,
    fillColor,
    fillOpacity: typeof properties?.['fill-opacity'] === 'number' ? properties['fill-opacity'] : 0.65,
    opacity: typeof properties?.['stroke-opacity'] === 'number' ? properties['stroke-opacity'] : 0.8,
    weight: typeof properties?.['stroke-width'] === 'number' ? properties['stroke-width'] : 0.7,
  };
}

type CoordinateZone = { source: string; zone: string; color: string };

function pointInRing(point: [number, number], ring: number[][]) {
  const [lng, lat] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses = (yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function pointInFeature(point: [number, number], feature: GeoJSON.Feature) {
  const geometry = feature.geometry;
  if (geometry.type === 'Polygon') {
    return pointInRing(point, geometry.coordinates[0]) && geometry.coordinates.slice(1).every(hole => !pointInRing(point, hole));
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some(polygon => pointInRing(point, polygon[0]) && polygon.slice(1).every(hole => !pointInRing(point, hole)));
  }
  return false;
}

function findCoordinateZones(
  point: [number, number],
  data: FeatureCollection | null,
  source: string,
  fallbackColor: string,
): CoordinateZone[] {
  if (!data?.features) return [];
  return data.features
    .filter(feature => pointInFeature(point, feature))
    .map(feature => ({
      source,
      zone: String(feature.properties?.zone ?? feature.properties?.name ?? 'Zona tidak bernama'),
      color: String(feature.properties?.color ?? fallbackColor),
    }))
    .filter((zone, index, zones) => zones.findIndex(item => item.source === zone.source && item.zone === zone.zone) === index);
}

export default function PetaPublik() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { show: showAccountNotice } = useAccountNotice();
  const [mangroveLocations, setMangroveLocations] = useState<MangroveLocation[]>(seedLocations);

  useEffect(() => {
    void fetchAllLocations().then(setMangroveLocations);
  }, []);

  // Peta dimulai tanpa overlay; pengguna dapat memilih beberapa layer sekaligus.
  const [selectedLayers, setSelectedLayers] = useState<DataLayer[]>([]);
  const [activeMapLayer, setActiveMapLayer] = useState('osm');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'mangrove' | 'abrasi' | 'penyu' | null>(null);
  // Panel legenda: default TERTUTUP di mobile (agar peta langsung terlihat),
  // terbuka di layar sm+ (>=640px) seperti perilaku desktop sebelumnya.
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth >= 640);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [mapTypeMenuOpen, setMapTypeMenuOpen] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [mapCoordinates, setMapCoordinates] = useState<[number, number] | null>(null);
  const [coordinateInputOpen, setCoordinateInputOpen] = useState(false);
  const [coordinateInput, setCoordinateInput] = useState('');
  const [coordinateInputError, setCoordinateInputError] = useState('');
  // Titik tujuan terakhir dari "Input Koordinat" — dirender sebagai badge pin
  // di atas zona ruang; bertahan sampai diganti koordinat berikutnya.
  const [coordinatePin, setCoordinatePin] = useState<[number, number] | null>(null);
  const [pendingDownload, setPendingDownload] = useState<'pdf' | 'geojson' | null>(null);
  const clerkDownloadTrigger = useRef<HTMLButtonElement | null>(null);

  const goToCoordinates = () => {
    const values = coordinateInput.trim().split(/[,;\s]+/).map(Number);
    const [lat, lng] = values;

    if (values.length !== 2 || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setCoordinateInputError('Masukkan latitude dan longitude yang valid.');
      return;
    }

    mapInstance?.flyTo([lat, lng], 15, { duration: 1.2 });
    setMapCoordinates([lat, lng]);
    setCoordinatePin([lat, lng]);
    // Load zone layers automatically: pin must explain its spatial context.
    setSelectedLayers(current => Array.from(new Set([...current, 'polaruang', 'rtrw-jawa-timur'])));
    setCoordinateInputError('');
    setCoordinateInputOpen(false);
  };

  const isLayerSelected = (layer: DataLayer) => selectedLayers.includes(layer);
  const showMangrove = isLayerSelected('mangrove');
  const showAbrasi = isLayerSelected('abrasi');
  const showPenyu = isLayerSelected('penyu');
  const showPokmaswas = isLayerSelected('pokmaswas');
  const showMhi = isLayerSelected('mhi');
  const showBenthic = isLayerSelected('benthic');
  const showPolaruang = isLayerSelected('polaruang');
  // Zona konservasi (termasuk Pencadangan/Indikasi Kawasan Konservasi) bagian dari
  // RTRW Laut: ikut tampil saat RTRW Laut dipilih, legendanya digabung ke tabel RTRW Laut.
  const showKonservasi = isLayerSelected('konservasi') || showPolaruang;
  const showKonservasiLegendSeparate = isLayerSelected('konservasi') && !showPolaruang;
  const showRtrw = isLayerSelected('rtrw-jawa-timur');
  const allLayersSelected = selectedLayers.length === DATA_LAYER_OPTIONS.length;
  const layerControlLabel = selectedLayers.length === 0
    ? 'Pilih Layer'
    : allLayersSelected
      ? 'Semua Layer'
      : selectedLayers.length === 1
        ? DATA_LAYER_OPTIONS.find(layer => layer.val === selectedLayers[0])?.label ?? 'Pilih Layer'
        : `${selectedLayers.length} Layer dipilih`;

  const toggleLayer = (layer: DataLayer) => {
    setSelectedLayers(current => current.includes(layer)
      ? current.filter(selected => selected !== layer)
      : [...current, layer]);
    setSelectedId(null);
    setSelectedType(null);
  };

  const toggleAllLayers = () => {
    setSelectedLayers(current => current.length === DATA_LAYER_OPTIONS.length
      ? []
      : DATA_LAYER_OPTIONS.map(layer => layer.val));
    setSelectedId(null);
    setSelectedType(null);
  };

  useEffect(() => {
    if (!user || !pendingDownload) return;
    const action = pendingDownload;
    setPendingDownload(null);
    if (action === 'pdf') downloadReportPDF();
    else downloadMarkerGeoJSON();
  }, [user, pendingDownload]);

  const { records: pokmaswasRecords } = usePokmaswas();
  const [filterRuangLingkup, setFilterRuangLingkup] = useState<string>('semua');
  const [filterBidangCore, setFilterBidangCore] = useState<string>('semua');

  // GeoJSON layer states
  const [benthicData, setBenthicData] = useState<any>(null);
  const [benthicLoading, setBenthicLoading] = useState(false);
  const [mhiData, setMhiData] = useState<any>(null);
  const [mhiLoading, setMhiLoading] = useState(false);
  const [polaruangData, setPolaruangData] = useState<any>(null);
  const [polaruangLoading, setPolaruangLoading] = useState(false);
  const [konservasiData, setKonservasiData] = useState<any>(null);
  const [konservasiLoading, setKonservasiLoading] = useState(false);
  const [rtrwData, setRtrwData] = useState<FeatureCollection | null>(null);
  const [rtrwLoading, setRtrwLoading] = useState(false);


  // Real survey data from field officers
  const [surveyPenyu, setSurveyPenyu] = useState<PenyuLoc[]>([]);
  const [surveyAbrasi, setSurveyAbrasi] = useState<TitikAbrasi[]>([]);

  // Verifikator coord override state
  const isVerifikator = user?.role === 'verifikator';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAbrasiId, setEditAbrasiId] = useState<string | null>(null);
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  const [overridesVersion, setOverridesVersion] = useState(0);

  useEffect(() => {
    const handler = () => setOverridesVersion(v => v + 1);
    window.addEventListener('idmap:coord-override-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('idmap:coord-override-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  // Apply overrides to mangrove locations
  void overridesVersion;
  const mangroveFiltered = applyOverridesToList(mangroveLocations);
  const abrasiStaticWithOverrides = titikAbrasiData.map(abr => {
    const override = getOverrides()[abr.id];
    return override ? { ...abr, koordinat: { ...abr.koordinat, lat: override.lat, lng: override.lng } } : abr;
  });

  // Track visit (Convex stats — best-effort, dedup via sessionStorage)
  useEffect(() => {
    void recordVisit();
  }, []);

  // Re-fit map tiles when sidebar opens/closes — Leaflet doesn't auto-detect
  // container size changes, so we must call invalidateSize() after the DOM updates.
  useEffect(() => {
    if (!mapInstance) return;
    const timer = setTimeout(() => mapInstance.invalidateSize(), 50);
    return () => clearTimeout(timer);
  }, [panelOpen, mapInstance]);

  // Load survey data (field officer input → map).
  // Real-time via Convex watchQuery agar entri dari device lain langsung
  // tampil di semua device. Fallback: localStorage polling bila Convex nonaktif.
  useEffect(() => {
    if (!isConvexConfigured()) {
      const load = () => {
        fetchSurveys().then(surveys => {
          const penyuFromDB = surveysToPenyuList(surveys);
          if (penyuFromDB.length > 0) setSurveyPenyu(penyuFromDB);
          const abrasiFromDB = surveysToAbrasiList(surveys);
          if (abrasiFromDB.length > 0) setSurveyAbrasi(abrasiFromDB);
        }).catch(() => {});
      };
      load();
      const handler = () => load();
      window.addEventListener('storage', handler);
      window.addEventListener('idmap:coord-override-changed', handler);
      const interval = setInterval(load, 30_000);
      return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener('idmap:coord-override-changed', handler);
        clearInterval(interval);
      };
    }

    let active = true;
    const unsubs: Array<() => void> = [];
    const subscribe = (
      tujuan: 'abrasi' | 'pendaratan_penyu',
      onData: (surveys: SurveyRecord[]) => void,
    ) => {
      try {
        const watch = convex.watchQuery(api.surveys.listByTujuan, { tujuanSurvei: tujuan, limit: 500 });
        const apply = () => {
          try {
            const rows = watch.localQueryResult() as Array<Record<string, unknown>> | undefined;
            if (!active || !rows) return;
            onData(rows.map(r => mapDbSurveyToSurveyRecord(convexSurveyToDbSurvey(r) as unknown as Record<string, unknown>)));
          } catch { /* belum deploy */ }
        };
        unsubs.push(watch.onUpdate(apply));
        apply();
      } catch (e) {
        console.warn(`[peta-publik] convex watch ${tujuan} gagal:`, e);
      }
    };
    subscribe('abrasi', surveys => {
      const abrasiFromDB = surveysToAbrasiList(surveys);
      if (abrasiFromDB.length > 0) setSurveyAbrasi(abrasiFromDB);
    });
    subscribe('pendaratan_penyu', surveys => {
      const penyuFromDB = surveysToPenyuList(surveys);
      if (penyuFromDB.length > 0) setSurveyPenyu(penyuFromDB);
    });
    return () => {
      active = false;
      unsubs.forEach(u => u());
    };
  }, []);

  // All penyu = static fallback + live survey data (dengan coord overrides)
  const allPenyuBase = surveyPenyu.length > 0 ? surveyPenyu : penyuLocations;
  const allPenyu = allPenyuBase.map(p => {
    const override = getOverrides()[p.id];
    return override ? { ...p, lat: override.lat, lng: override.lng } : p;
  });
  // All abrasi = static + live
  const surveyAbrasiIds = new Set(surveyAbrasi.map(a => a.id));
  const allAbrasi = [...surveyAbrasi, ...abrasiStaticWithOverrides.filter(a => !surveyAbrasiIds.has(a.id))];

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

  // Load MHI mangrove layer from KMZ conversion output.
  useEffect(() => {
    if (showMhi && !mhiData) {
      setMhiLoading(true);
      fetch('/mhi-mangrove.geojson')
        .then(r => r.json())
        .then(d => { setMhiData(d); setMhiLoading(false); })
        .catch(() => setMhiLoading(false));
    }
  }, [showMhi, mhiData]);

  // Load pola ruang pemanfaatan layer.
  useEffect(() => {
    if (showPolaruang && !polaruangData) {
      setPolaruangLoading(true);
      fetch('/polaruang.geojson')
        .then(r => r.json())
        .then(d => { setPolaruangData(d); setPolaruangLoading(false); })
        .catch(() => setPolaruangLoading(false));
    }
  }, [showPolaruang, polaruangData]);

  // Load kawasan konservasi layer.
  useEffect(() => {
    if (showKonservasi && !konservasiData) {
      setKonservasiLoading(true);
      fetch('/konservasi.geojson')
        .then(r => r.json())
        .then(d => { setKonservasiData(d); setKonservasiLoading(false); })
        .catch(() => setKonservasiLoading(false));
    }
  }, [showKonservasi, konservasiData]);

  // Load RTRW Jawa Timur dari GeoJSON hasil pre-konversi build-time
  // (scripts/convert-rtrw.mjs). Geometri & properti identik dengan KMZ asli,
  // tapi browser tidak lagi unzip + parse XML + konversi KML di main thread
  // sehingga loading jauh lebih ringan dan tidak membekukan UI.
  useEffect(() => {
    if (!showRtrw) {
      setRtrwData(null);
      return;
    }

    let active = true;
    setRtrwLoading(true);
    setRtrwData(null);

    const loadFile = async (file: string): Promise<FeatureCollection> => {
      const hit = rtrwCache[file];
      if (hit) return hit;
      const response = await fetch(`/boundaries/${file}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as FeatureCollection;
      rtrwCache[file] = data;
      return data;
    };

    Promise.all(RTRW_GEOJSON_FILES.map(loadFile))
      .then(layers => {
        if (!active) return;
        setRtrwData({
          type: 'FeatureCollection',
          features: layers.flatMap(layer => layer.features),
        });
      })
      .catch(error => console.warn('[peta-publik] layer RTRW GeoJSON gagal dimuat:', error))
      .finally(() => { if (active) setRtrwLoading(false); });

    return () => { active = false; };
  }, [showRtrw]);

  const coordinateZones = useMemo(() => {
    if (!coordinatePin) return [];
    const point: [number, number] = [coordinatePin[1], coordinatePin[0]];
    return [
      ...findCoordinateZones(point, polaruangData, 'RTRW Laut', '#d97706'),
      ...findCoordinateZones(point, rtrwData, 'RTRW Darat', '#047857'),
    ];
  }, [coordinatePin, polaruangData, rtrwData]);

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

  const mhiCounts = useMemo<Record<string, number> | null>(() => {
    if (!mhiData?.features) return null;
    const counts: Record<string, number> = {};
    for (const f of mhiData.features) {
      const cls = (f.properties?.mhiClass as string) ?? 'Unknown';
      counts[cls] = (counts[cls] ?? 0) + 1;
    }
    return counts;
  }, [mhiData]);

  // Unique zone → color pairs for pola ruang legend (sorted alphabetically)
  const polaruangZones = useMemo<[string, string][]>(() => {
    if (!polaruangData?.features) return [];
    const seen: Record<string, string> = {};
    for (const f of polaruangData.features) {
      const zone = f.properties?.zone as string;
      if (zone && !seen[zone]) seen[zone] = f.properties?.color as string ?? '#d97706';
    }
    return Object.entries(seen).sort(([a], [b]) => a.localeCompare(b));
  }, [polaruangData]);

  // Unique zone → color pairs for konservasi legend
  const konservasiZones = useMemo<[string, string][]>(() => {
    if (!konservasiData?.features) return [];
    const seen: Record<string, string> = {};
    for (const f of konservasiData.features) {
      const zone = f.properties?.zone as string;
      if (zone && !seen[zone]) seen[zone] = f.properties?.color as string ?? '#15803d';
    }
    return Object.entries(seen).sort(([a], [b]) => a.localeCompare(b));
  }, [konservasiData]);

  // Legenda RTRW Laut gabungan: zona pola ruang + zona kawasan konservasi (tanpa duplikat nama)
  const rtrwLautZones = useMemo<[string, string][]>(() => {
    const names = new Set(polaruangZones.map(([zone]) => zone));
    return [...polaruangZones, ...konservasiZones.filter(([zone]) => !names.has(zone))];
  }, [polaruangZones, konservasiZones]);

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

  /**
   * Trigger a Blob download in the browser.
   * Creates an <a> with Object URL, clicks it, and revokes the URL afterward
   * so memory is reclaimed. Works in all evergreen browsers.
   */
  const triggerBlobDownload = (filename: string, mime: string, content: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /**
   * Build a GeoJSON FeatureCollection from currently visible markers
   * (mangrove + abrasi + penyu) honoring the active layer filter, then
   * download as `.geojson`.
   */
  const downloadMarkerGeoJSON = () => {
    if (!requireAuth('Untuk mengunduh data GeoJSON, silakan login atau daftar akun terlebih dahulu.')) return;
    const features: Array<Record<string, unknown>> = [];

    if (showMangrove) {
      for (const m of mangroveFiltered) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
          properties: {
            kategori: 'mangrove',
            id: m.id,
            nama: m.name,
            kecamatan: (m as any).kecamatan ?? '',
            kabupaten: (m as any).kabupaten ?? '',
            luasHa: (m as any).luasHa ?? null,
          },
        });
      }
    }
    if (showAbrasi) {
      for (const a of allAbrasi) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [a.koordinat.lng, a.koordinat.lat] },
          properties: {
            kategori: 'abrasi',
            id: a.id,
            namaPantai: a.namaPantai,
            kecamatan: a.kecamatan,
            kabKota: a.kabKota,
            prioritas: a.prioritas,
            skorRisiko: a.skorRisiko,
          },
        });
      }
    }
    if (showPenyu) {
      for (const p of allPenyu) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
          properties: {
            kategori: 'penyu',
            id: p.id,
            namaPantai: p.namaPantai,
            lokasi: p.lokasi,
            jenis: p.jenis,
            sarang: p.sarang,
          },
        });
      }
    }

    if (features.length === 0) {
      alert('Tidak ada marker untuk diunduh. Aktifkan layer terlebih dulu.');
      return;
    }

    const fc = {
      type: 'FeatureCollection',
      generator: 'ID-MAP · Cabdin KP Kab. Malang',
      generatedAt: new Date().toISOString(),
      features,
    };
    const stamp = new Date().toISOString().slice(0, 10);
    triggerBlobDownload(
      `idmap-marker-${stamp}.geojson`,
      'application/geo+json;charset=utf-8',
      JSON.stringify(fc, null, 2),
    );
  };

  /**
   * Open a print-ready HTML report in a new window, then trigger the system
   * print dialog. User can choose "Save as PDF" to obtain a PDF file.
   * No external library required.
   */
  /**
   * Guard helper — jika user belum login, tampilkan notice login/daftar
   * dan batalkan aksi. Kembalikan `true` bila boleh lanjut.
   */
  const requireAuth = (reason?: string): boolean => {
    if (user) return true;
    if (isClerkConfigured) {
      // Clerk aktif: buka modal sign-in Clerk via button virtual
      // (tidak bisa panggil hook imperatively, gunakan notice sebagai bridge)
      showAccountNotice({
        title: 'Login Diperlukan',
        message: reason ?? 'Untuk mengunduh data peta, silakan login atau daftar akun ID-MAP terlebih dahulu.',
      });
    } else {
      showAccountNotice({
        title: 'Login Diperlukan',
        message: reason ?? 'Untuk mengunduh data peta, silakan login atau daftar akun ID-MAP terlebih dahulu.',
      });
    }
    return false;
  };

  const downloadReportPDF = () => {
    if (!requireAuth('Untuk mengekspor laporan PDF, Anda harus login atau daftar akun terlebih dahulu.')) return;

    const counts = {
      mangrove: showMangrove ? mangroveFiltered.length : 0,
      abrasi: showAbrasi ? allAbrasi.length : 0,
      penyu: showPenyu ? allPenyu.length : 0,
    };
    const total = counts.mangrove + counts.abrasi + counts.penyu;
    if (total === 0) {
      alert('Tidak ada data untuk dilaporkan. Aktifkan minimal satu layer.');
      return;
    }

    const now = new Date();
    const tanggal = now.toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const esc = (s: unknown) =>
      String(s ?? '').replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
      );

    const rowsMangrove = showMangrove
      ? mangroveFiltered.map((m, i) => `
          <tr>
            <td>${i + 1}</td><td>${esc(m.name)}</td>
            <td>${esc((m as any).kecamatan ?? '-')}</td>
            <td>${esc((m as any).luasHa ?? '-')}</td>
            <td>${m.lat.toFixed(5)}, ${m.lng.toFixed(5)}</td>
          </tr>`).join('')
      : '';
    const rowsAbrasi = showAbrasi
      ? allAbrasi.map((a, i) => `
          <tr>
            <td>${i + 1}</td><td>${esc(a.namaPantai)}</td>
            <td>${esc(a.kecamatan)}</td><td>${esc(a.prioritas)}</td>
            <td>${a.koordinat.lat.toFixed(5)}, ${a.koordinat.lng.toFixed(5)}</td>
          </tr>`).join('')
      : '';
    const rowsPenyu = showPenyu
      ? allPenyu.map((p, i) => `
          <tr>
            <td>${i + 1}</td><td>${esc(p.namaPantai)}</td>
            <td>${esc(p.jenis)}</td><td>${esc(p.sarang)}</td>
            <td>${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</td>
          </tr>`).join('')
      : '';

    const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="utf-8" />
<title>Laporan ID-MAP · Peta Interaktif</title>
<style>
  @page { size: A4; margin: 18mm 15mm; }
  body { font-family: 'Inter', system-ui, sans-serif; color: #0f172a; margin: 0; }
  h1 { font-size: 20pt; color: #064e3b; margin: 0 0 4px; }
  h2 { font-size: 13pt; color: #065f46; border-bottom: 2px solid #14b8a6; padding-bottom: 4px; margin-top: 22px; }
  .meta { color: #475569; font-size: 9pt; margin-bottom: 16px; }
  .summary { display: flex; gap: 12px; margin: 14px 0 6px; }
  .card { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #f8fafc; }
  .card .n { font-size: 18pt; font-weight: 800; color: #0f766e; }
  .card .l { font-size: 9pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 6px; }
  th, td { border: 1px solid #e2e8f0; padding: 5px 7px; text-align: left; vertical-align: top; }
  thead th { background: #ecfeff; color: #0e7490; font-weight: 700; }
  tbody tr:nth-child(even) td { background: #f8fafc; }
  footer { margin-top: 24px; font-size: 8pt; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
</style></head>
<body>
  <h1>Laporan Peta Interaktif ID-MAP</h1>
  <p class="meta">Wilker Cabdin KP Kab. Malang · Dicetak ${esc(tanggal)}</p>
  <div class="summary">
    <div class="card"><div class="n">${counts.mangrove}</div><div class="l">Mangrove</div></div>
    <div class="card"><div class="n">${counts.abrasi}</div><div class="l">Titik Abrasi</div></div>
    <div class="card"><div class="n">${counts.penyu}</div><div class="l">Pendaratan Penyu</div></div>
  </div>
  ${showMangrove && rowsMangrove ? `<h2>Lokasi Mangrove (${counts.mangrove})</h2>
    <table><thead><tr><th>#</th><th>Nama</th><th>Kecamatan</th><th>Luas (ha)</th><th>Koordinat</th></tr></thead><tbody>${rowsMangrove}</tbody></table>` : ''}
  ${showAbrasi && rowsAbrasi ? `<h2>Titik Abrasi (${counts.abrasi})</h2>
    <table><thead><tr><th>#</th><th>Pantai</th><th>Kecamatan</th><th>Prioritas</th><th>Koordinat</th></tr></thead><tbody>${rowsAbrasi}</tbody></table>` : ''}
  ${showPenyu && rowsPenyu ? `<h2>Pendaratan Penyu (${counts.penyu})</h2>
    <table><thead><tr><th>#</th><th>Pantai</th><th>Jenis</th><th>Sarang</th><th>Koordinat</th></tr></thead><tbody>${rowsPenyu}</tbody></table>` : ''}
  <footer>© ${now.getFullYear()} ID-MAP · Dinas Kelautan dan Perikanan Provinsi Jawa Timur · Cabdin KP Kab. Malang</footer>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script>
</body></html>`;

    const win = window.open('', '_blank', 'width=900,height=1000');
    if (!win) {
      alert('Pop-up diblokir. Izinkan pop-up untuk situs ini agar laporan PDF bisa dibuat.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
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
      // Clerk aktif: bungkus tombol dengan SignIn/SignUp modal (dimuat lazy
      // agar chunk Clerk tidak ikut di halaman publik pada first load).
      return (
        <ClerkAuthGate
          mode={mode}
          redirectUrl="/peta"
          onFallback={() =>
            showAccountNotice(
              mode === 'signup'
                ? {
                    title: 'Daftar Akun Baru',
                    message:
                      'Untuk mengakses fitur unduh data dan kontribusi survei, silakan daftar akun ID-MAP. Pendaftaran publik via Google sedang dalam persiapan — sementara hubungi admin untuk mendapat akses.',
                  }
                : undefined,
            )
          }
        >
          {children}
        </ClerkAuthGate>
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
    <div className="idmap-map-shell flex h-screen overflow-hidden bg-white text-slate-900">
      <aside className="glass-panel hidden md:flex w-[82px] lg:w-[104px] flex-col items-center border-r border-slate-200 px-3 py-5">
        <div className="flex flex-col items-center gap-6">
          <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-200">
            <img src="/logo.png" alt="ID-MAP" className="h-full w-full object-cover" />
          </div>
          <nav className="flex flex-col items-stretch gap-2">
            <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 rounded-2xl px-2.5 py-3 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </button>
            <button className="relative flex flex-col items-center gap-1 rounded-2xl bg-slate-100 px-2.5 py-3 text-[11px] font-semibold text-slate-900">
              <span className="absolute right-0 top-2 h-12 w-1 rounded-l-full bg-emerald-600" />
              <Layers className="h-5 w-5" />
              <span>Map</span>
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="glass-panel relative z-10 flex flex-shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5 lg:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c2410c]">ID MAP</p>
            <h1 className="max-w-[26rem] truncate text-[18px] font-bold leading-snug text-slate-900 sm:text-[21px] lg:max-w-[34rem]">
              Peta Interaktif Mangrove dan Ekosistem Pesisir
            </h1>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-sm focus-within:border-emerald-400 lg:flex">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                className="w-72 border-0 bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-0"
                placeholder="Cari wilayah atau koordinat..."
                type="text"
              />
            </div>

            {/* Trigger Clerk tersembunyi. Download tanpa sesi akan membuka
                modal login/daftar Clerk, lalu aksi dilanjutkan setelah login. */}
            {isClerkConfigured && (
              <ClerkAuthGate
                redirectUrl="/peta"
                onFallback={() => setPendingDownload(null)}
              >
                <button
                  ref={clerkDownloadTrigger}
                  type="button"
                  className="hidden"
                  aria-hidden="true"
                />
              </ClerkAuthGate>
            )}

            {/* Tombol Unduh — user wajib login/daftar sebelum file dibuat */}
            <DownloadDropdown
              className="hidden sm:block"
              beforeSelect={(item) => {
                if (user) return true;
                setPendingDownload(item.kind === 'pdf' ? 'pdf' : 'geojson');
                window.setTimeout(() => clerkDownloadTrigger.current?.click(), 0);
                return false;
              }}
              items={[
                {
                  kind: 'pdf',
                  label: 'Unduh PDF Laporan',
                  icon: FileText,
                  onSelect: downloadReportPDF,
                },
                {
                  kind: 'geojson',
                  label: 'Unduh Marker GeoJSON',
                  icon: Download,
                  onSelect: downloadMarkerGeoJSON,
                },
              ]}
            />

            {user ? (
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-md transition-colors hover:bg-slate-100 sm:px-5">
                <span>Dashboard</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <AuthRequired mode="signup">
                  <button className="flex items-center gap-1.5 rounded-full border border-emerald-700 bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800">
                    <UserPlus className="h-3.5 w-3.5" />
                    Daftar
                  </button>
                </AuthRequired>
                <AuthRequired>
                  <button className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-emerald-400 hover:text-emerald-700">
                    <LogIn className="h-3.5 w-3.5" />
                    Login
                  </button>
                </AuthRequired>
              </>
            )}

            <button
              onClick={() => setPanelOpen(o => !o)}
              className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-emerald-400 sm:hidden"
              title="Toggle panel"
            >
              <PanelRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <div className="relative min-w-0 flex-1 bg-slate-100">
            <MapContainer center={DEFAULT_MAP_CENTER} zoom={DEFAULT_MAP_ZOOM} style={{ height: '100%', width: '100%', background: '#f1f5f9' }} zoomControl={false}>
            <MapController center={DEFAULT_MAP_CENTER} zoom={DEFAULT_MAP_ZOOM} />
            <MapInstanceCapture onReady={setMapInstance} />
            <MapCoordinates onChange={setMapCoordinates} />
            <FlyToSelected target={flyTarget} zoom={15} />
            <TileLayerSwitcher activeLayer={activeMapLayer} />

            {/* Badge pin + label zona ruang yang memuat titik. */}
            {coordinatePin && (
              <Marker position={coordinatePin} icon={makeCoordinatePinIcon()} zIndexOffset={1000}>
                <Tooltip permanent direction="right" offset={[12, 0]} className="coordinate-zone-tooltip">
                  <div className="space-y-1">
                    <div className="font-bold text-emerald-800">Titik koordinat</div>
                    {coordinateZones.length ? coordinateZones.map(zone => <div key={`${zone.source}-${zone.zone}`} className="text-[11px]"><strong>{zone.source}:</strong> {zone.zone}</div>) : <div className="text-[11px] text-slate-500">Belum masuk zona terpetakan</div>}
                  </div>
                </Tooltip>
                <Popup>
                  <div className="min-w-[210px]">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Lokasi tujuan koordinat</div>
                    <div className="font-mono text-xs text-gray-700">{coordinatePin[0].toFixed(6)}, {coordinatePin[1].toFixed(6)}</div>
                    <div className="mt-2 border-t border-gray-100 pt-2 text-xs">{coordinateZones.length ? coordinateZones.map(zone => <div key={`${zone.source}-${zone.zone}`}><strong>{zone.source}:</strong> {zone.zone}</div>) : 'Belum masuk zona terpetakan'}</div>
                  </div>
                </Popup>
              </Marker>
            )}

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
                    {isVerifikator && editAbrasiId === abr.id ? (
                      <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-2 space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700">Edit Koordinat</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            value={editLat}
                            onChange={e => setEditLat(e.target.value)}
                            onBlur={e => { const p = parseCoord(e.target.value); if (p) setEditLat(p); }}
                            placeholder="Lat"
                            className="text-xs border border-gray-300 rounded px-1.5 py-1 font-mono w-full"
                          />
                          <input
                            value={editLng}
                            onChange={e => setEditLng(e.target.value)}
                            onBlur={e => { const p = parseCoord(e.target.value); if (p) setEditLng(p); }}
                            placeholder="Lng"
                            className="text-xs border border-gray-300 rounded px-1.5 py-1 font-mono w-full"
                          />
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={async () => {
                              const lat = parseFloat(parseCoord(editLat) ?? '');
                              const lng = parseFloat(parseCoord(editLng) ?? '');
                              if (isNaN(lat) || isNaN(lng)) {
                                alert('Koordinat tidak valid.');
                                return;
                              }
                              const today = new Date().toISOString().split('T')[0];
                              const tingkat = abr.skorRisiko >= 9 ? 'sangat_parah'
                                : abr.skorRisiko >= 7 ? 'parah'
                                : abr.skorRisiko >= 5 ? 'sedang'
                                : 'ringan';
                              if (isConvexConfigured()) {
                                await convex.mutation(api.surveys.upsert, {
                                  legacyId: abr.id,
                                  tujuanSurvei: 'abrasi',
                                  petugasNama: user?.nama ?? '',
                                  petugasUnit: user?.role ?? '',
                                  tanggal: today,
                                  locationName: abr.kecamatan,
                                  province: abr.provinsi,
                                  namaPantai: abr.namaPantai,
                                  koordinatLat: lat,
                                  koordinatLng: lng,
                                  kondisiSebelum: abr.kondisiSebelum,
                                  kondisiSesudah: abr.kondisiSesudah,
                                  tingkatAbrasi: tingkat,
                                  prioritasAbrasi: abr.prioritas,
                                  substrat: abr.substrat,
                                  ancamanUtama: abr.ancamanUtama,
                                  sarangPoints: [],
                                  photoUrls: [],
                                }).catch(() => {});
                              }
                              removeOverride(abr.id);
                              // Convex watchQuery auto-push ke semua device.
                              // Fallback (Convex nonaktif): reload lokal.
                              if (!isConvexConfigured()) {
                                fetchSurveys()
                                  .then(surveys => setSurveyAbrasi(surveysToAbrasiList(surveys)))
                                  .catch(() => {});
                              }
                              setEditAbrasiId(null);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-2 py-1 rounded"
                          >
                            <Check className="w-3 h-3" /> Simpan
                          </button>
                          <button
                            onClick={() => setEditAbrasiId(null)}
                            className="flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-2 py-1 rounded"
                          >
                            <X className="w-3 h-3" /> Batal
                          </button>
                        </div>
                        {getOverrides()[abr.id] && (
                          <button
                            onClick={() => {
                              if (confirm('Reset ke koordinat asli?')) {
                                removeOverride(abr.id);
                                if (!isConvexConfigured()) {
                                  fetchSurveys()
                                    .then(surveys => setSurveyAbrasi(surveysToAbrasiList(surveys)))
                                    .catch(() => {});
                                }
                                setEditAbrasiId(null);
                              }
                            }}
                            className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-semibold px-2 py-1 rounded"
                          >
                            Reset ke Asli
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {isVerifikator && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setEditAbrasiId(abr.id);
                              setEditLat(abr.koordinat.lat.toString());
                              setEditLng(abr.koordinat.lng.toString());
                            }}
                            className="w-full mt-2 flex items-center justify-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded border border-orange-200"
                          >
                            Edit Koordinat
                          </button>
                        )}
                      </>
                    )}
                    <div className="text-[10px] text-gray-400 mt-1 font-mono">
                      {abr.koordinat.lat.toFixed(4)}, {abr.koordinat.lng.toFixed(4)}
                      {getOverrides()[abr.id] && <span className="ml-1 text-amber-600">(diedit)</span>}
                    </div>
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
                  <div className="text-sm min-w-[180px]">
                    <div className="text-[10px] font-bold text-teal-700 uppercase mb-0.5">Titik Pendaratan Penyu</div>
                    <div className="font-bold text-gray-800">{pny.namaPantai}</div>
                    <div className="text-xs text-gray-500">{pny.lokasi}</div>
                    {(pny as any).fotoUrl && (
                      <div className="mt-1.5 mb-1.5 rounded-lg overflow-hidden border border-gray-200">
                        <img src={getCloudinaryUrl((pny as any).fotoUrl, 'w_600,c_fill,q_auto,f_auto')} alt={pny.namaPantai} className="w-full h-24 object-cover" loading="lazy" />
                      </div>
                    )}
                    {(pny as any).sarangPoints?.length > 0 && (
                      <div className="mt-2 mb-1">
                        <div className="text-[10px] font-semibold text-teal-700 mb-1">
                          {(pny as any).sarangPoints.length} titik koordinat petugas
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {(pny as any).sarangPoints.slice(0, 8).map((point: any, idx: number) => (
                            <div key={point.id} className="relative h-10 rounded-md overflow-hidden bg-teal-50 border border-teal-100">
                              {point.fotoUrl ? (
                                <img src={getCloudinaryUrl(point.fotoUrl, 'w_80,c_fill,q_auto,f_auto')} alt={`Titik sarang ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-teal-700">{idx + 1}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-xs flex justify-between mt-1">
                      <span className="text-gray-500">Jenis</span><span className="font-medium">{pny.jenis}</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-gray-500">Sarang</span><span className="font-medium">{pny.sarang} titik</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 font-mono">
                      {pny.lat.toFixed(4)}, {pny.lng.toFixed(4)}
                      {getOverrides()[pny.id] && <span className="ml-1 text-amber-600">(diedit)</span>}
                    </div>
                    {isVerifikator && editingId === pny.id ? (
                      <div className="mt-2 bg-teal-50 border border-teal-200 rounded-lg p-2 space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Edit Koordinat</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            value={editLat}
                            onChange={e => setEditLat(e.target.value)}
                            onBlur={e => { const p = parseCoord(e.target.value); if (p) setEditLat(p); }}
                            placeholder="Lat"
                            className="text-xs border border-gray-300 rounded px-1.5 py-1 font-mono w-full"
                          />
                          <input
                            value={editLng}
                            onChange={e => setEditLng(e.target.value)}
                            onBlur={e => { const p = parseCoord(e.target.value); if (p) setEditLng(p); }}
                            placeholder="Lng"
                            className="text-xs border border-gray-300 rounded px-1.5 py-1 font-mono w-full"
                          />
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              const lat = parseFloat(parseCoord(editLat) ?? '');
                              const lng = parseFloat(parseCoord(editLng) ?? '');
                              if (isNaN(lat) || isNaN(lng)) {
                                alert('Koordinat tidak valid.');
                                return;
                              }
                              setOverride(pny.id, lat, lng, user?.nama);
                              setEditingId(null);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-2 py-1 rounded"
                          >
                            <Check className="w-3 h-3" /> Simpan
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-2 py-1 rounded"
                          >
                            <X className="w-3 h-3" /> Batal
                          </button>
                        </div>
                        {getOverrides()[pny.id] && (
                          <button
                            onClick={() => {
                              if (confirm('Reset ke koordinat asli?')) {
                                removeOverride(pny.id);
                                setEditingId(null);
                              }
                            }}
                            className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-semibold px-2 py-1 rounded"
                          >
                            Reset ke Asli
                          </button>
                        )}
                      </div>
                    ) : isVerifikator ? (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setEditingId(pny.id);
                          setEditLat(pny.lat.toString());
                          setEditLng(pny.lng.toString());
                        }}
                        className="w-full mt-2 flex items-center justify-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-1 rounded border border-teal-200"
                      >
                        ✏️ Edit Koordinat
                      </button>
                    ) : null}
                  </div>
                </Popup>
              </Marker>
            ))}

            {showPenyu && allPenyu.flatMap(pny => {
              const sarangPoints = (pny as any).sarangPoints ?? [];
              if (sarangPoints.length <= 1) return [];
              return sarangPoints.map((point: any, idx: number) => (
              <Marker
                key={point.id}
                position={[point.latNum, point.lngNum]}
                icon={makeTurtleNestIcon(idx + 1)}
                eventHandlers={{ click: () => { setSelectedId(pny.id); setSelectedType('penyu'); } }}
              >
                <Popup>
                  <div className="text-sm min-w-[190px]">
                    <div className="text-[10px] font-bold text-amber-700 uppercase mb-0.5">Titik Sarang #{idx + 1}</div>
                    <div className="font-bold text-gray-800">{pny.namaPantai}</div>
                    <div className="text-xs text-gray-500">{pny.jenis}</div>
                    {point.fotoUrl && (
                      <div className="mt-1.5 mb-1.5 rounded-lg overflow-hidden border border-gray-200">
                        <img src={point.fotoUrl} alt={`Foto titik sarang ${idx + 1}`} className="w-full h-28 object-cover" />
                      </div>
                    )}
                    {point.catatan && <div className="text-xs text-gray-600 mt-1">{point.catatan}</div>}
                    {point.waktu && <div className="text-[10px] text-gray-400 mt-1">{point.waktu}</div>}
                    <div className="text-[10px] text-gray-400 mt-1 font-mono">
                      {point.latNum.toFixed(5)}, {point.lngNum.toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ));
            })}

            {/* Pokmaswas markers */}
            {showPokmaswas && pokmaswasRecords
              .filter(pkm => {
                if (filterRuangLingkup !== 'semua' && pkm.ruangLingkup !== filterRuangLingkup) return false;
                if (filterBidangCore !== 'semua' && !(pkm.bidangCore ?? []).includes(filterBidangCore)) return false;
                return true;
              })
              .map(pkm => {
              const override = getOverrides()[pkm.id];
              const lat = override ? override.lat : pkm.lat;
              const lng = override ? override.lng : pkm.lng;
              return (
                <Marker
                  key={pkm.id}
                  position={[lat, lng]}
                  icon={makePokmaswasIcon()}
                >
                  <Popup>
                    <div className="text-sm min-w-[200px]">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          POKMASWAS
                        </span>
                      </div>
                      <div className="font-bold text-gray-800">{pkm.nama}</div>
                      <div className="text-xs text-gray-500 mb-2">{pkm.alamat}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Kab/Kota</span>
                          <span className="font-medium">{pkm.kabupatenKota}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Ketua</span>
                          <span className="font-medium">{pkm.ketua}</span>
                        </div>
                        {pkm.ruangLingkup && (
                          <div className="flex justify-between gap-2">
                            <span className="text-gray-500 flex-shrink-0">Ruang Lingkup</span>
                            <span className="font-medium text-purple-700 text-right">{pkm.ruangLingkup}</span>
                          </div>
                        )}
                        {pkm.kawasanPantai && (
                          <div className="flex justify-between gap-2">
                            <span className="text-gray-500 flex-shrink-0">Kawasan Pantai</span>
                            <span className="font-medium text-right max-w-[130px]">{pkm.kawasanPantai}</span>
                          </div>
                        )}
                        {pkm.bidangCore && pkm.bidangCore.length > 0 && (
                          <div className="pt-1">
                            <span className="text-gray-500">Bidang/Core:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {pkm.bidangCore.map(b => (
                                <span
                                  key={b}
                                  className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Lokasi</span>
                          <span className="font-mono text-[10px]">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

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

            {showMhi && mhiData && (
              <GeoJSON
                key="mhi-mangrove"
                data={mhiData}
                style={(feature) => {
                  const cls = feature?.properties?.mhiClass ?? 'Unknown';
                  const color = feature?.properties?.color ?? MHI_COLORS[cls] ?? MHI_DEFAULT_COLOR;
                  return {
                    color: '#1f2937',
                    fillColor: color,
                    fillOpacity: 0.58,
                    weight: 0.25,
                    opacity: 0.45,
                  };
                }}
                onEachFeature={(feature, layer) => {
                  const area = Number(feature.properties?.areaHa);
                  const areaText = Number.isFinite(area) && area > 0
                    ? `${area.toLocaleString('id-ID', { maximumFractionDigits: 2 })} ha`
                    : '-';
                  layer.bindPopup(
                    `<div style="font-size:12px;min-width:180px">
                      <strong>MHI Mangrove 2024</strong><br/>
                      Wilayah: ${feature.properties?.wilayah ?? '-'}<br/>
                      Kategori: ${feature.properties?.mhiClass ?? '-'}<br/>
                      Luas: ${areaText}
                    </div>`,
                  );
                }}
              />
            )}

            {showPolaruang && polaruangData && (
              <GeoJSON
                key="polaruang"
                data={polaruangData}
                style={(feature) => ({
                  color: '#78350f',
                  fillColor: feature?.properties?.color ?? '#d97706',
                  fillOpacity: 0.45,
                  weight: 0.5,
                  opacity: 0.7,
                })}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(
                    `<div style="font-size:12px;min-width:180px">
                      <strong>RTRW Laut</strong><br/>
                      Zona: ${feature.properties?.zone ?? '-'}<br/>
                      Kode: ${feature.properties?.kodkws ?? '-'}<br/>
                      Jenis: ${feature.properties?.jenis ?? '-'}
                    </div>`,
                  );
                }}
              />
            )}

            {rtrwData && showRtrw && (
              <GeoJSON
                key="rtrw-jawa-timur"
                data={rtrwData}
                style={rtrwFeatureStyle}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(
                    `<div style="font-size:12px;min-width:180px">
                      <strong>RTRW Darat</strong><br/>
                      Zona: ${feature.properties?.name ?? feature.properties?.zone ?? '-'}
                    </div>`,
                  );
                }}
              />
            )}

            {showKonservasi && konservasiData && (
              <GeoJSON
                key="konservasi"
                data={konservasiData}
                style={(feature) => ({
                  color: '#14532d',
                  fillColor: feature?.properties?.color ?? '#15803d',
                  fillOpacity: 0.45,
                  weight: 0.5,
                  opacity: 0.7,
                })}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(
                    `<div style="font-size:12px;min-width:180px">
                      <strong>Kawasan Konservasi</strong><br/>
                      Zona: ${feature.properties?.zone ?? '-'}<br/>
                      Kode: ${feature.properties?.kodkws ?? '-'}<br/>
                      Jenis: ${feature.properties?.jenis ?? '-'}
                    </div>`,
                  );
                }}
              />
            )}

          </MapContainer>

          {benthicLoading && (
            <div className="absolute left-4 top-4 z-[999] flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-2 text-xs font-semibold text-cyan-800 shadow-md backdrop-blur">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              Memuat data benthic...
            </div>
          )}

          {konservasiLoading && (
            <div className="absolute left-4 top-40 z-[999] flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-2 text-xs font-semibold text-green-800 shadow-md backdrop-blur">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
              Memuat konservasi...
            </div>
          )}

          {mhiLoading && (
            <div className="absolute left-4 top-16 z-[999] flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-md backdrop-blur">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              Memuat data MHI...
            </div>
          )}

          {polaruangLoading && (
            <div className="absolute left-4 top-28 z-[999] flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-2 text-xs font-semibold text-amber-800 shadow-md backdrop-blur">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              Memuat pola ruang...
            </div>
          )}

          {rtrwLoading && (
            <div className="absolute left-4 top-40 z-[999] flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-md backdrop-blur">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              Memuat layer RTRW Darat...
            </div>
          )}


          <div className="absolute left-4 top-20 z-[1000] w-[calc(100%-2rem)] sm:w-80">
            <button
              type="button"
              onClick={() => {
                setCoordinateInputOpen(open => !open);
                setCoordinateInputError('');
                setLayerMenuOpen(false);
                setMapTypeMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-900/5 backdrop-blur transition-colors hover:bg-emerald-50 hover:text-emerald-700"
              aria-expanded={coordinateInputOpen}
            >
              <LocateFixed className="h-4 w-4 text-emerald-700" />
              Input Koordinat
            </button>

            {coordinateInputOpen && (
              <form
                onSubmit={event => {
                  event.preventDefault();
                  goToCoordinates();
                }}
                className="mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
              >
                <label htmlFor="map-coordinate-input" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Latitude, longitude
                </label>
                <input
                  id="map-coordinate-input"
                  autoFocus
                  value={coordinateInput}
                  onChange={event => {
                    setCoordinateInput(event.target.value);
                    if (coordinateInputError) setCoordinateInputError('');
                  }}
                  placeholder="-8.123456, 112.123456"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
                {coordinateInputError && <p className="mt-1.5 text-xs text-rose-600">{coordinateInputError}</p>}
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCoordinateInputOpen(false);
                      setCoordinateInputError('');
                    }}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button type="submit" className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800">
                    Tuju lokasi
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="absolute right-4 top-20 z-[1000] flex flex-col items-end gap-3">
            <div className="relative">
              <button
                onClick={() => { setMapTypeMenuOpen(o => !o); setLayerMenuOpen(false); }}
                className="flex min-w-[180px] items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-lg shadow-slate-900/5 backdrop-blur"
              >
                {(() => {
                  const cur = MAP_LAYERS.find(l => l.id === activeMapLayer) ?? MAP_LAYERS[0];
                  const Icon = cur.icon;
                  return (
                    <>
                      <Icon className="h-4 w-4 text-emerald-700" />
                      <span className="flex-1">{cur.label}</span>
                    </>
                  );
                })()}
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${mapTypeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {mapTypeMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  {MAP_LAYERS.map(l => {
                    const Icon = l.icon;
                    const isActive = activeMapLayer === l.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => { setActiveMapLayer(l.id); setMapTypeMenuOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span className="flex-1 text-left">{l.label}</span>
                        {isActive && <Check className="h-4 w-4 text-emerald-700" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => { setLayerMenuOpen(o => !o); setMapTypeMenuOpen(false); }}
                className="flex min-w-[180px] items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-lg shadow-slate-900/5 backdrop-blur"
              >
                <Layers className="h-4 w-4 text-emerald-700" />
                <span className="flex-1">{layerControlLabel}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${layerMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {layerMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                  <label className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={allLayersSelected}
                      onChange={toggleAllLayers}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#64748b' }} />
                    <span>Semua Layer</span>
                  </label>
                  {DATA_LAYER_OPTIONS.map(opt => {
                    const isSelected = isLayerSelected(opt.val);
                    return (
                      <label key={opt.val} className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleLayer(opt.val)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                        />
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: opt.color }} />
                        <span className="flex-1">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90 shadow-lg shadow-slate-900/5 backdrop-blur">
              <button
                onClick={() => mapInstance?.zoomIn()}
                className="flex h-11 w-11 items-center justify-center border-b border-slate-200 text-slate-800 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                onClick={() => mapInstance?.zoomOut()}
                className="flex h-11 w-11 items-center justify-center text-slate-800 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <Minus className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={() => mapInstance?.locate({ setView: true, enableHighAccuracy: true })}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white/90 p-3 text-slate-800 shadow-lg shadow-slate-900/5 backdrop-blur transition-colors hover:bg-emerald-50 hover:text-emerald-700"
              title="Lokasi saya"
              aria-label="Lokasi saya"
            >
              <LocateFixed className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (mapCoordinates) {
                void navigator.clipboard?.writeText(`${mapCoordinates[0].toFixed(6)}, ${mapCoordinates[1].toFixed(6)}`);
              }
            }}
            title="Koordinat mengikuti kursor atau klik peta. Klik untuk menyalin."
            className="absolute bottom-6 left-6 z-[998] flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-[12px] font-medium text-slate-700 shadow-lg backdrop-blur transition-colors hover:bg-emerald-50"
          >
            <span className="flex items-center gap-2 border-r border-slate-200 pr-3">
              <Layers className="h-3.5 w-3.5 text-slate-500" />
              {MAP_LAYERS.find(layer => layer.id === activeMapLayer)?.label ?? 'Basemap'}
            </span>
            <span>
              {mapCoordinates
                ? `${mapCoordinates[0].toFixed(6)}, ${mapCoordinates[1].toFixed(6)}`
                : 'Arahkan kursor ke peta'}
            </span>
          </button>
        </div>

        {/* Tombol tampilkan legenda — muncul saat panel ditutup */}
        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-[997] flex-col items-center gap-1.5 rounded-l-xl border border-r-0 border-slate-200 bg-white/95 px-2.5 py-4 text-[10px] font-semibold text-slate-700 shadow-xl backdrop-blur-sm transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            title="Tampilkan panel legenda"
          >
            <Layers className="h-4 w-4 text-emerald-700" />
            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.08em' }}>Legenda</span>
          </button>
        )}

        {panelOpen && (
          <aside className="glass-panel hidden w-[284px] flex-shrink-0 flex-col overflow-hidden border-l border-slate-200 sm:flex lg:w-[300px]">
            <div className="flex items-center justify-between border-b border-slate-200 px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <Layers className="h-5 w-5 text-[#f06424]" />
                <div>
                  <h2 className="text-[17px] font-semibold text-slate-900">Legenda</h2>
                  <p className="text-[11px] uppercase tracking-wide text-slate-600">Konfigurasi visualisasi</p>
                </div>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
                title={panelOpen ? 'Sembunyikan panel' : 'Tampilkan panel'}
              >
                <X className="h-4 w-4" />
                Tutup
              </button>
            </div>

            <div className="overflow-y-auto px-3.5 py-3">
              <div className="space-y-3">


                <section>
                  <div className="mb-2.5 flex items-center gap-2 text-slate-900">
                    <span className="h-5 w-1 rounded-full bg-orange-700" />
                    <span className="text-sm font-semibold uppercase tracking-tight">Titik Abrasi / Rekomendasi</span>
                  </div>
                  <div className="space-y-2.5 px-0.5">
                    {Object.entries(ABRASI_PRIORITAS_COLORS).map(([p, color]) => (
                      <div key={p} className="flex items-center gap-2.5 text-[14px] text-slate-900">
                        <span className="text-lg leading-none text-emerald-700">🌲</span>
                        <span className="flex-1">{p}</span>
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-2.5 text-sm font-semibold uppercase tracking-tight text-slate-900">Pendaratan Penyu</div>
                  <div className="flex items-center gap-2.5 px-0.5 text-[14px] text-slate-900">
                    <Waves className="h-5 w-5 text-emerald-700" />
                    <span>Titik pendaratan penyu laut</span>
                  </div>
                </section>

                {showMhi && (
                  <section>
                    <div className="mb-2.5 flex items-center gap-2 text-slate-900">
                      <span className="h-5 w-1 rounded-full bg-emerald-800" />
                      <span className="text-sm font-semibold uppercase tracking-tight">MHI Mangrove</span>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <table className="w-full text-left text-sm">
                        <tbody>
                          {MHI_ORDER.map((cls, index) => (
                            <tr key={cls} className={index !== MHI_ORDER.length - 1 ? 'border-b border-slate-100' : ''}>
                              <td className="w-full min-w-0 px-3 py-2.5">
                                <div className="flex min-w-0 items-center gap-3">
                                  <span className="h-4 w-4 flex-shrink-0 rounded-sm border border-slate-300" style={{ background: MHI_COLORS[cls] ?? MHI_DEFAULT_COLOR }} />
                                  <span className="min-w-0 break-words leading-snug text-slate-900">{cls}</span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-700">
                                {mhiCounts ? (mhiCounts[cls] ?? 0).toLocaleString() : '0'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {showBenthic && (
                  <section>
                    <div className="mb-2.5 flex items-center gap-2 text-slate-900">
                      <span className="h-5 w-1 rounded-full bg-blue-600" />
                      <span className="text-sm font-semibold uppercase tracking-tight">Kelas Benthic</span>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <table className="w-full text-left text-sm">
                        <tbody>
                          {BENTHIC_ORDER.map((cls, index) => (
                            <tr key={cls} className={index !== BENTHIC_ORDER.length - 1 ? 'border-b border-slate-100' : ''}>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-3">
                                  <span className="h-4 w-4 rounded-sm border border-slate-300" style={{ background: BENTHIC_COLORS[cls] ?? BENTHIC_DEFAULT_COLOR }} />
                                  <span className="text-slate-900">{cls}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-right font-semibold text-slate-700">
                                {benthicCounts ? (benthicCounts[cls] ?? 0).toLocaleString() : '0'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {showPolaruang && rtrwLautZones.length > 0 && (
                  <section>
                    <div className="mb-2.5 flex items-center gap-2 text-slate-900">
                      <span className="h-5 w-1 rounded-full bg-amber-500" />
                      <span className="text-sm font-semibold uppercase tracking-tight">RTRW Laut</span>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <table className="w-full text-left text-sm">
                        <tbody>
                          {rtrwLautZones.map(([zone, color], index) => (
                            <tr key={zone} className={index !== rtrwLautZones.length - 1 ? 'border-b border-slate-100' : ''}>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-3">
                                  <span className="h-4 w-4 flex-shrink-0 rounded-sm border border-slate-300" style={{ background: color }} />
                                  <span className="text-slate-900">{zone}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {showKonservasiLegendSeparate && konservasiData && (
                  <section>
                    <div className="mb-2.5 flex items-center gap-2 text-slate-900">
                      <span className="h-5 w-1 rounded-full bg-green-700" />
                      <span className="text-sm font-semibold uppercase tracking-tight">Kawasan Konservasi</span>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <table className="w-full text-left text-sm">
                        <tbody>
                          {konservasiZones.map(([zone, color], index) => (
                            <tr key={zone} className={index !== konservasiZones.length - 1 ? 'border-b border-slate-100' : ''}>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-3">
                                  <span className="h-4 w-4 flex-shrink-0 rounded-sm border border-slate-300" style={{ background: color }} />
                                  <span className="text-slate-900">{zone}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* Sumber Data */}
                <section className="border-t border-slate-200 pt-3">
                  <div className="mb-2 flex items-center gap-2 text-slate-900">
                    <Info className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-semibold uppercase tracking-tight">Sumber Data</span>
                  </div>
                  <ul className="space-y-2 px-0.5">
                    {DATA_SOURCES.map(({ label, source }) => (
                      <li key={label} className="text-justify text-[12px] leading-snug text-slate-700">
                        <span className="font-semibold text-slate-900">{label}</span>
                        <span className="text-slate-500">: </span>
                        {source}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>

            {!user && (
              <div className="border-t border-slate-200 px-4 py-4 text-center text-[12px] text-slate-700">
                Login untuk mengunduh data peta.
              </div>
            )}

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
                {(selectedPenyu as any).sarangPoints?.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">
                      Titik Bulk Petugas ({(selectedPenyu as any).sarangPoints.length})
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(selectedPenyu as any).sarangPoints.slice(0, 14).map((point: any, idx: number) => (
                        <div key={point.id} className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                          {point.fotoUrl ? (
                            <img src={point.fotoUrl} alt={`Titik ${idx + 1}`} className="w-full h-16 object-cover" />
                          ) : (
                            <div className="w-full h-16 bg-amber-50 flex items-center justify-center text-xs font-bold text-amber-700">#{idx + 1}</div>
                          )}
                          <div className="px-2 py-1">
                            <div className="text-[10px] font-bold text-slate-700">Titik #{idx + 1}</div>
                            <div className="text-[9px] text-slate-400 font-mono">{point.latNum.toFixed(4)}, {point.lngNum.toFixed(4)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DetailPanel>
          )}

          {/* No selection: collapsible category lists */}
          {!selectedId && (
            <div className="flex-1 space-y-3 overflow-y-auto border-t border-slate-200 px-4 py-4">
              {showMangrove && (
                <CategorySection
                  icon="🌿"
                  title="Mangrove"
                  count={mangroveFiltered.length}
                  accent="#16a34a"
                >
                  {mangroveFiltered.map(loc => (
                    <button key={loc.id}
                      onClick={() => { setSelectedId(loc.id); setSelectedType('mangrove'); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/55">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: MANGROVE_STATUS_COLORS[loc.status] }} />
                      <span className="truncate text-slate-700 font-medium">{loc.name}</span>
                      <span className="ml-auto text-slate-400 flex-shrink-0 text-xs">{loc.areaHa.toLocaleString()} ha</span>
                    </button>
                  ))}
                </CategorySection>
              )}

              {showAbrasi && (
                <CategorySection
                  icon="🌊"
                  title="Abrasi / Rekomendasi"
                  count={allAbrasi.length}
                  accent="#f97316"
                >
                  {allAbrasi.map(abr => (
                    <button key={abr.id}
                      onClick={() => { setSelectedId(abr.id); setSelectedType('abrasi'); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/55">
                      <span className="flex-shrink-0">🌿</span>
                      <span className="truncate text-slate-700 font-medium">{abr.namaPantai}</span>
                      <span className="ml-auto text-xs flex-shrink-0 font-bold"
                        style={{ color: ABRASI_PRIORITAS_COLORS[abr.prioritas] }}>{abr.skorRisiko}/10</span>
                    </button>
                  ))}
                </CategorySection>
              )}

              {showPenyu && (
                <CategorySection
                  icon="🐢"
                  title="Pendaratan Penyu"
                  count={allPenyu.length}
                  accent="#0d9488"
                >
                  {allPenyu.map(pny => (
                    <button key={pny.id}
                      onClick={() => { setSelectedId(pny.id); setSelectedType('penyu'); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/55">
                      <span className="flex-shrink-0">🐢</span>
                      <span className="truncate text-slate-700 font-medium">{pny.namaPantai}</span>
                      <span className="ml-auto text-teal-500 flex-shrink-0 text-xs">{pny.sarang} sarang</span>
                    </button>
                  ))}
                </CategorySection>
              )}
            </div>
          )}
          </aside>
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
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                <Layers className="w-4 h-4 text-teal-500" /> Legenda
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Titik Mangrove</p>
              <div className="space-y-2 mb-4">
                {Object.entries(MANGROVE_STATUS_COLORS).map(([s, color]) => (
                  <div key={s} className="flex items-center gap-3">
                    <div className="rounded-full flex-shrink-0"
                      style={{ width: MANGROVE_RADIUS[s] * 1.6, height: MANGROVE_RADIUS[s] * 1.6, background: color, opacity: 0.85 }} />
                    <span className="text-sm capitalize text-slate-700 font-medium">{s}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Titik Abrasi / Rekomendasi</p>
              <div className="space-y-2 mb-4">
                {Object.entries(ABRASI_PRIORITAS_COLORS).map(([p, color]) => (
                  <div key={p} className="flex items-center gap-2.5">
                    <div className="text-sm">🌿</div>
                    <span className="text-sm text-slate-700 font-medium">{p}</span>
                    <div className="w-2.5 h-2.5 rounded-full ml-auto" style={{ background: color }} />
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pendaratan Penyu</p>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="text-sm">🐢</div>
                <span className="text-sm text-slate-700 font-medium">Titik pendaratan penyu laut</span>
              </div>

              {showPokmaswas && (
                <div className="mb-4 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-purple-600 border-2 border-white flex-shrink-0 flex items-center justify-center text-[8px]">👤</div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Profil Pokmaswas</p>
                    <Info className="w-3 h-3 text-purple-400 ml-auto" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                    Kelompok Masyarakat Pengawas Konservasi. Klik kategori untuk memfilter marker.
                  </p>
                  <p className="text-[10px] font-semibold text-purple-700 mb-1">Ruang Lingkup</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {RUANG_LINGKUP_OPTIONS.map(o => (
                      <button
                        key={o}
                        onClick={() => setFilterRuangLingkup(filterRuangLingkup === o ? 'semua' : o)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                          filterRuangLingkup === o
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-semibold text-purple-700 mb-1">Bidang / Core</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {BIDANG_CORE_OPTIONS.map(o => (
                      <button
                        key={o}
                        onClick={() => setFilterBidangCore(filterBidangCore === o ? 'semua' : o)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                          filterBidangCore === o
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-semibold text-purple-700 mb-1">Kawasan Pantai</p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Segmen pantai tempat kelompok beroperasi (isian bebas per entri).
                  </p>
                </div>
              )}

              {showMhi && (
                <>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">MHI Mangrove</p>
                  <div className="space-y-2 mb-4">
                    {MHI_ORDER.map((cls) => (
                      <div key={cls} className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                          style={{ background: MHI_COLORS[cls] ?? MHI_DEFAULT_COLOR }}
                        />
                        <span className="min-w-0 flex-1 break-words leading-snug text-sm text-slate-700 font-medium">{cls}</span>
                        {mhiCounts && (
                          <span className="whitespace-nowrap text-xs text-slate-500 font-semibold">
                            {(mhiCounts[cls] ?? 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {showBenthic && (
                <>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Kelas Benthic</p>
                  <div className="space-y-2">
                    {BENTHIC_ORDER.map((cls) => (
                      <div key={cls} className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                          style={{ background: BENTHIC_COLORS[cls] ?? BENTHIC_DEFAULT_COLOR }}
                        />
                        <span className="text-sm text-slate-700 font-medium flex-1">{cls}</span>
                        {benthicCounts && (
                          <span className="text-xs text-slate-400 font-semibold">
                            {(benthicCounts[cls] ?? 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {showPolaruang && rtrwLautZones.length > 0 && (
                <>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">RTRW Laut</p>
                  <div className="space-y-2">
                    {rtrwLautZones.map(([zone, color]) => (
                      <div key={zone} className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                        <span className="text-sm text-slate-700 font-medium flex-1">{zone}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {showKonservasiLegendSeparate && konservasiData && (
                <>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Kawasan Konservasi</p>
                  <div className="space-y-2">
                    {konservasiZones.map(([zone, color]) => (
                      <div key={zone} className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                        <span className="text-sm text-slate-700 font-medium flex-1">{zone}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Sumber Data — mobile */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sumber Data</p>
                </div>
                <ul className="space-y-2">
                  {DATA_SOURCES.map(({ label, source }) => (
                    <li key={label} className="text-justify text-[11px] leading-snug text-slate-500">
                      <span className="font-semibold text-slate-700">{label}</span>
                      <span className="text-slate-300">: </span>
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Unduh Data — mobile. Tombol khusus karena top toolbar
                menyembunyikan dropdown di mobile (`hidden sm:block`). */}
            <div className="px-4 py-3 border-b border-slate-200">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Unduh Data</p>
              {user ? (
                <div className="space-y-1.5">
                  <button
                    onClick={() => { void import('../lib/statsClient').then(m => m.recordDownload('pdf')); downloadReportPDF(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-slate-50 transition-colors text-slate-600 border border-slate-200"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                    Unduh PDF Laporan
                  </button>
                  <button
                    onClick={() => { void import('../lib/statsClient').then(m => m.recordDownload('geojson')); downloadMarkerGeoJSON(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-slate-50 transition-colors text-slate-600 border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-green-400" />
                    Unduh Marker GeoJSON
                  </button>
                </div>
              ) : (
                <AuthRequired mode="signup">
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs bg-slate-50 text-slate-500 border border-slate-200">
                    🔒 Login untuk mengunduh
                  </button>
                </AuthRequired>
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
              {showMangrove && (
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

              {showAbrasi && (
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

              {showPenyu && (
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
      </main>
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
    <div className="mb-1.5">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        <span className="text-xs font-bold" style={{ color: accent }}>({count})</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
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
