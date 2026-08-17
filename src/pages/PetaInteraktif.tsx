import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, LayersControl, GeoJSON, useMap } from 'react-leaflet';
import type { GeoJsonObject } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mangroveLocations, ekosistemData, tekananSosialData } from '../data/seedData';
import { kkpdLocations, type KKPDLocation } from '../data/kkpdData';
import StatusBadge from '../components/shared/StatusBadge';
import { usePokmaswas } from '../hooks/usePokmaswas';
import { RUANG_LINGKUP_OPTIONS, BIDANG_CORE_OPTIONS } from '../data/pokmaswasProfile';
import { titikAbrasiData, type PrioritasLevel, type SubstratType, type TitikAbrasi } from '../data/abrasiData';
import { fetchSurveys, mapDbSurveyToSurveyRecord, type SurveyRecord } from '../data/localStore';
import { convex, isConvexConfigured, convexSurveyToDbSurvey } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import {
  MapPin, Layers, Filter, Shield, Pencil, Save, X, RotateCcw, Users, Info, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { applyOverridesToList, setOverride, removeOverride, getOverrides } from '../lib/coordOverrides';
import { parseCoord } from '../lib/coordParser';

const STATUS_COLORS: Record<string, string> = {
  lebat: '#16a34a',
  sedang: '#eab308',
  jarang: '#f97316',
  kritis: '#ef4444',
};

const STATUS_RADIUS: Record<string, number> = {
  lebat: 16,
  sedang: 13,
  jarang: 11,
  kritis: 9,
};

const REGIONAL_BOUNDARIES = [
  { id: 'kabupaten-malang', label: 'Kabupaten Malang' },
  { id: 'kabupaten-pasuruan', label: 'Kabupaten Pasuruan' },
  { id: 'kota-pasuruan', label: 'Kota Pasuruan' },
  { id: 'kota-surabaya', label: 'Kota Surabaya' },
  { id: 'kabupaten-sidoarjo', label: 'Kabupaten Sidoarjo' },
] as const;

type RegionalBoundaryId = (typeof REGIONAL_BOUNDARIES)[number]['id'];

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
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

const ABRASI_PRIORITAS_COLORS: Record<string, string> = {
  Tinggi: '#ef4444',
  Sedang: '#f97316',
  'Rendah–Sedang': '#eab308',
};

function makeAbrasiIcon(prioritas: string) {
  const color = ABRASI_PRIORITAS_COLORS[prioritas] ?? '#f97316';
  return L.divIcon({
    className: '',
    html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:${color};border-radius:8px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);font-size:16px;color:white;font-weight:bold">⚠</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

/** Konversi SurveyRecord (tujuan abrasi) → TitikAbrasi untuk marker peta. */
function surveyToAbrasi(s: SurveyRecord): TitikAbrasi {
  return {
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
  };
}

/** Filter + map daftar SurveyRecord jadi TitikAbrasi valid (koordinat numerik). */
function surveysToAbrasiList(surveys: SurveyRecord[]): TitikAbrasi[] {
  return surveys
    .filter(s => s.tujuanSurvei === 'abrasi' && s.koordinatLat && s.koordinatLng)
    .map(surveyToAbrasi)
    .filter(a => !isNaN(a.koordinat.lat) && !isNaN(a.koordinat.lng));
}

export default function PetaInteraktif() {
  const { user } = useAuth();
  const isVerifikator = user?.role === 'verifikator';
  const isStaff = user?.role === 'admin' || user?.role === 'verifikator';
  const { records: pokmaswasRecords } = usePokmaswas();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterKawasan, setFilterKawasan] = useState<string>('all');
  const [showPokmaswas, setShowPokmaswas] = useState(true);
  const [filterRuangLingkup, setFilterRuangLingkup] = useState<string>('semua');
  const [filterBidangCore, setFilterBidangCore] = useState<string>('semua');
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const [mapCenter] = useState<[number, number]>([-2.5, 118]);
  const [mapZoom] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  const [overridesVersion, setOverridesVersion] = useState(0);
  const [surveyAbrasi, setSurveyAbrasi] = useState<TitikAbrasi[]>([]);
  const [showAbrasi, setShowAbrasi] = useState(true);
  const [editAbrasiId, setEditAbrasiId] = useState<string | null>(null);
  const [editAbrasiLat, setEditAbrasiLat] = useState('');
  const [editAbrasiLng, setEditAbrasiLng] = useState('');
  const [regionalBoundary, setRegionalBoundary] = useState<RegionalBoundaryId | ''>('');
  const [regionalBoundaryData, setRegionalBoundaryData] = useState<GeoJsonObject | null>(null);
  const [regionalBoundaryLoading, setRegionalBoundaryLoading] = useState(false);

  // Listen for override changes to refresh map
  useEffect(() => {
    const handler = () => setOverridesVersion(v => v + 1);
    window.addEventListener('idmap:coord-override-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('idmap:coord-override-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  // Load survey abrasi data — real-time via Convex watchQuery (multi-device sync).
  // Fallback ke localStorage polling bila Convex belum terkonfigurasi.
  useEffect(() => {
    // Fallback: Convex tidak aktif → baca localStorage + polling ringan.
    if (!isConvexConfigured()) {
      const load = () => {
        fetchSurveys()
          .then(surveys => setSurveyAbrasi(surveysToAbrasiList(surveys)))
          .catch(() => {});
      };
      load();
      const handler = () => load();
      window.addEventListener('storage', handler);
      window.addEventListener('idmap:coord-override-changed', handler);
      const interval = setInterval(load, 15_000);
      return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener('idmap:coord-override-changed', handler);
        clearInterval(interval);
      };
    }

    // Real-time: subscribe ke Convex. Perubahan dari device lain langsung
    // ter-push ke semua client tanpa polling / reload manual.
    let active = true;
    let unsubscribe = () => {};
    try {
      const watch = convex.watchQuery(api.surveys.listByTujuan, { tujuanSurvei: 'abrasi', limit: 500 });
      const apply = () => {
        try {
          const rows = watch.localQueryResult() as Array<Record<string, unknown>> | undefined;
          if (!active || !rows) return;
          const surveys = rows.map(r => mapDbSurveyToSurveyRecord(convexSurveyToDbSurvey(r) as unknown as Record<string, unknown>));
          setSurveyAbrasi(surveysToAbrasiList(surveys));
        } catch {
          /* fungsi belum deploy — abaikan */
        }
      };
      unsubscribe = watch.onUpdate(apply);
      apply(); // hasil awal bila sudah ter-cache
    } catch (e) {
      console.warn('[abrasi] convex watch gagal:', e);
    }
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Load one regional zoning layer only when selected, keeping initial map load light.
  useEffect(() => {
    if (!regionalBoundary) {
      setRegionalBoundaryData(null);
      return;
    }

    let active = true;
    setRegionalBoundaryLoading(true);
    setRegionalBoundaryData(null);
    fetch(`/boundaries/${regionalBoundary}.geojson`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<GeoJsonObject>;
      })
      .then(data => {
        if (active) setRegionalBoundaryData(data);
      })
      .catch(error => console.warn('[peta] layer wilayah gagal dimuat:', error))
      .finally(() => {
        if (active) setRegionalBoundaryLoading(false);
      });

    return () => { active = false; };
  }, [regionalBoundary]);

  // Apply overrides to all locations (recompute when overridesVersion changes)
  const allLocations = [
    ...applyOverridesToList(mangroveLocations),
    ...applyOverridesToList(kkpdLocations),
  ];
  // Suppress unused warning for overridesVersion (used to trigger recompute)
  void overridesVersion;

  // Abrasi: static + survey, dengan coord overrides + dedup survey override static
  const surveyAbrasiIds = new Set(surveyAbrasi.map(a => a.id));
  const allAbrasi = [
    ...surveyAbrasi,
    ...titikAbrasiData
      .filter(a => !surveyAbrasiIds.has(a.id))
      .map(a => {
        const o = getOverrides()[a.id];
        return o ? { ...a, koordinat: { ...a.koordinat, lat: o.lat, lng: o.lng } } : a;
      }),
  ];

  const filtered = allLocations.filter(loc => {
    if (filterStatus !== 'all' && loc.status !== filterStatus) return false;
    if (filterKawasan === 'kkpd') return 'id' in loc && (loc as KKPDLocation).tipeKawasan !== undefined;
    if (filterKawasan !== 'all' && loc.kawasan !== filterKawasan) return false;
    return true;
  });

  const selectedLocation = allLocations.find(l => l.id === selectedLoc);
  const selectedKKPD = kkpdLocations.find(l => l.id === selectedLoc) as KKPDLocation | undefined;
  const selectedEco = ekosistemData.find(e => e.locationId === selectedLoc);
  const selectedSos = tekananSosialData.find(e => e.locationId === selectedLoc);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status Tutupan:</span>
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:border-green-400"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="lebat">Lebat</option>
            <option value="sedang">Sedang</option>
            <option value="jarang">Jarang</option>
            <option value="kritis">Kritis</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Kawasan:</span>
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:border-green-400"
            value={filterKawasan}
            onChange={e => setFilterKawasan(e.target.value)}
          >
            <option value="all">Semua Kawasan</option>
            <option value="kkpd">KKPD / Kaw. Konservasi Daerah</option>
            <option value="konservasi">Kaw. Konservasi (Umum)</option>
            <option value="hutan_lindung">Hutan Lindung</option>
            <option value="apl">APL</option>
          </select>
        </div>
            <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0d404f]" />
              <select
                value={regionalBoundary}
                onChange={event => setRegionalBoundary(event.target.value as RegionalBoundaryId | '')}
                className="text-xs border border-[#0d404f]/25 rounded-lg px-2 py-1 bg-[#0d404f]/10 focus:outline-none focus:border-[#f06424]"
                title="Tampilkan layer RTRW wilayah"
              >
                <option value="">RTRW: nonaktif</option>
                {REGIONAL_BOUNDARIES.map(region => (
                  <option key={region.id} value={region.id}>{region.label}</option>
                ))}
              </select>
              {regionalBoundaryLoading && <span className="text-xs text-emerald-700">Memuat…</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAbrasi}
                  onChange={e => setShowAbrasi(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                />
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs"><strong className="text-orange-700">{allAbrasi.length}</strong> Abrasi</span>
              </label>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPokmaswas}
                  onChange={e => setShowPokmaswas(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs"><strong className="text-purple-700">{pokmaswasRecords.length}</strong> Pokmaswas</span>
              </label>
            </div>
            {showPokmaswas && (
              <select
                value={filterRuangLingkup}
                onChange={e => setFilterRuangLingkup(e.target.value)}
                className="text-xs border border-purple-200 rounded-lg px-2 py-1 bg-purple-50 focus:outline-none focus:border-purple-400"
                title="Filter Pokmaswas berdasarkan ruang lingkup"
              >
                <option value="semua">Semua Ruang Lingkup</option>
                {RUANG_LINGKUP_OPTIONS.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            )}
            {showPokmaswas && (
              <select
                value={filterBidangCore}
                onChange={e => setFilterBidangCore(e.target.value)}
                className="text-xs border border-purple-200 rounded-lg px-2 py-1 bg-purple-50 focus:outline-none focus:border-purple-400"
                title="Filter Pokmaswas berdasarkan bidang/core"
              >
                <option value="semua">Semua Bidang/Core</option>
                {BIDANG_CORE_OPTIONS.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            )}
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs"><strong className="text-blue-700">{kkpdLocations.length}</strong> KKPD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span><strong className="text-gray-800">{filtered.length}</strong> lokasi ditampilkan</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4" style={{ height: 'calc(100vh - 280px)' }}>
        {/* Map */}
        <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <MapController center={mapCenter} zoom={mapZoom} />
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Citra Satelit (Esri)">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="&copy; Esri"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Peta Topografi">
                <TileLayer
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenTopoMap"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {regionalBoundaryData && (
              <GeoJSON
                key={regionalBoundary}
                data={regionalBoundaryData}
                style={{
                  color: '#047857',
                  fillColor: '#34d399',
                  fillOpacity: 0.12,
                  weight: 0.7,
                  opacity: 0.8,
                }}
                onEachFeature={(feature, layer) => {
                  const zone = feature.properties?.zone as string | undefined;
                  if (zone) layer.bindPopup(`<strong>RTRW — ${zone}</strong>`);
                }}
              />
            )}

            {filtered.map(loc => {
              const eco = ekosistemData.find(e => e.locationId === loc.id);
              const isKKPD = kkpdLocations.some(k => k.id === loc.id);
              const kkpdInfo = isKKPD ? (loc as KKPDLocation) : null;
              return (
                <CircleMarker
                  key={loc.id}
                  center={[loc.lat, loc.lng]}
                  radius={STATUS_RADIUS[loc.status]}
                  pathOptions={{
                    color: isKKPD ? '#1d4ed8' : STATUS_COLORS[loc.status],
                    fillColor: STATUS_COLORS[loc.status],
                    fillOpacity: selectedLoc === loc.id ? 0.9 : 0.65,
                    weight: isKKPD ? 2.5 : (selectedLoc === loc.id ? 3 : 1.5),
                    opacity: 1,
                    dashArray: isKKPD ? '4 2' : undefined,
                  }}
                  eventHandlers={{
                    click: () => setSelectedLoc(loc.id === selectedLoc ? null : loc.id),
                  }}
                >
                  <Popup>
                    <div className="min-w-[220px]">
                      {isKKPD && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {kkpdInfo?.tipeKawasan}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            kkpdInfo?.statusPenetapan === 'ditetapkan' ? 'bg-green-100 text-green-700'
                            : kkpdInfo?.statusPenetapan === 'dicadangkan' ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                            {kkpdInfo?.statusPenetapan}
                          </span>
                        </div>
                      )}
                      <h4 className="font-bold text-gray-800 text-sm mb-1">{loc.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{loc.district}, {loc.province}</p>

                      {/* Verifikator inline edit form */}
                      {isVerifikator && editingId === loc.id ? (
                        <div className="bg-[#0d404f]/10 border border-[#0d404f]/25 rounded-lg p-2 mb-2 space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Edit Koordinat</p>
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
                          <p className="text-[10px] text-gray-500">
                            Mendukung: -8.435, 8°25'50"S, atau Google Maps
                          </p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                const lat = parseFloat(parseCoord(editLat) ?? '');
                                const lng = parseFloat(parseCoord(editLng) ?? '');
                                if (isNaN(lat) || isNaN(lng)) {
                                  alert('Koordinat tidak valid.');
                                  return;
                                }
                                setOverride(loc.id, lat, lng, user?.nama);
                                setEditingId(null);
                              }}
                              className="flex-1 flex items-center justify-center gap-1 bg-[#071520] hover:bg-[#0d404f] text-white text-xs font-semibold px-2 py-1 rounded"
                            >
                              <Save className="w-3 h-3" /> Simpan
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-2 py-1 rounded"
                            >
                              <X className="w-3 h-3" /> Batal
                            </button>
                          </div>
                          {getOverrides()[loc.id] && (
                            <button
                              onClick={() => {
                                if (confirm('Reset ke koordinat asli?')) {
                                  removeOverride(loc.id);
                                  setEditingId(null);
                                }
                              }}
                              className="w-full flex items-center justify-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-semibold px-2 py-1 rounded"
                            >
                              <RotateCcw className="w-3 h-3" /> Reset ke Asli
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          {isVerifikator && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setEditingId(loc.id);
                                setEditLat(loc.lat.toString());
                                setEditLng(loc.lng.toString());
                              }}
                              className="w-full mb-2 flex items-center justify-center gap-1 bg-[#0d404f]/10 hover:bg-[#0d404f]/20 text-[#0d404f] text-xs font-semibold px-2 py-1 rounded border border-[#0d404f]/25"
                            >
                              <Pencil className="w-3 h-3" /> Edit Koordinat
                            </button>
                          )}
                        </>
                      )}

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Koordinat</span>
                          <span className="font-mono text-[10px]">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                        </div>
                        {getOverrides()[loc.id] && (
                          <div className="flex justify-between">
                            <span className="text-amber-600">Status</span>
                            <span className="font-semibold text-amber-700">Diedit oleh verifikator</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Luas Mangrove</span>
                          <span className="font-medium">{loc.areaHa.toLocaleString()} ha</span>
                        </div>
                        {isKKPD && kkpdInfo && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Total Kawasan</span>
                              <span className="font-medium">{kkpdInfo.luasTotal.toLocaleString()} ha</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Pengelola</span>
                              <span className="font-medium text-right max-w-[120px]">{kkpdInfo.pengelola}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Dasar Hukum</span>
                              <span className="font-medium text-right max-w-[120px] text-blue-700">{kkpdInfo.nomorSk}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status Tutupan</span>
                          <span className="font-medium capitalize">{loc.status}</span>
                        </div>
                        {eco && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Skor Kesehatan</span>
                              <span className="font-bold text-green-700">{eco.skorKesehatan}/100</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Tutupan Tajuk</span>
                              <span className="font-medium">{eco.tutupanTajuk}%</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Pokmaswas Markers */}
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
                    <div className="min-w-[220px]">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          POKMASWAS
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm mb-1">{pkm.nama}</h4>
                      <p className="text-xs text-gray-500 mb-2">{pkm.alamat}</p>
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
                                  className="text-[10px] bg-[#0d404f]/10 text-[#0d404f] border border-[#0d404f]/25 px-1.5 py-0.5 rounded-full"
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
                        {override && (
                          <div className="flex justify-between">
                            <span className="text-amber-600">Status</span>
                            <span className="font-semibold text-amber-700">Koordinat diedit</span>
                          </div>
                        )}
                      </div>

                      {/* Edit koordinat — admin/verifikator only */}
                      {isStaff && editingId === pkm.id ? (
                        <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2 space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Edit Koordinat</p>
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
                                const newLat = parseFloat(parseCoord(editLat) ?? '');
                                const newLng = parseFloat(parseCoord(editLng) ?? '');
                                if (isNaN(newLat) || isNaN(newLng)) {
                                  alert('Koordinat tidak valid.');
                                  return;
                                }
                                setOverride(pkm.id, newLat, newLng, user?.nama);
                                setEditingId(null);
                              }}
                              className="flex-1 flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-2 py-1 rounded"
                            >
                              <Save className="w-3 h-3" /> Simpan
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-2 py-1 rounded"
                            >
                              <X className="w-3 h-3" /> Batal
                            </button>
                          </div>
                          {override && (
                            <button
                              onClick={() => {
                                if (confirm('Reset ke koordinat asli?')) {
                                  removeOverride(pkm.id);
                                  setEditingId(null);
                                }
                              }}
                              className="w-full flex items-center justify-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-semibold px-2 py-1 rounded"
                            >
                              <RotateCcw className="w-3 h-3" /> Reset ke Asli
                            </button>
                          )}
                        </div>
                      ) : isStaff ? (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setEditingId(pkm.id);
                            setEditLat(lat.toString());
                            setEditLng(lng.toString());
                          }}
                          className="w-full mt-2 flex items-center justify-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded border border-purple-200"
                        >
                          <Pencil className="w-3 h-3" /> Edit Koordinat
                        </button>
                      ) : null}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Abrasi Markers */}
            {showAbrasi && allAbrasi.map(abr => {
              const override = getOverrides()[abr.id];
              const lat = override ? override.lat : abr.koordinat.lat;
              const lng = override ? override.lng : abr.koordinat.lng;
              return (
                <Marker
                  key={abr.id}
                  position={[lat, lng]}
                  icon={makeAbrasiIcon(abr.prioritas)}
                >
                  <Popup>
                    <div className="min-w-[200px] text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                          style={{ background: ABRASI_PRIORITAS_COLORS[abr.prioritas] ?? '#f97316' }}
                        >
                          Titik Rawan Abrasi · {abr.prioritas}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800 mb-1">{abr.namaPantai}</h4>
                      <p className="text-xs text-gray-500 mb-2">{abr.kecamatan}, {abr.kabKota}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Skor Risiko</span>
                          <span className="font-bold">{abr.skorRisiko}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Lokasi</span>
                          <span className="font-mono text-[10px]">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
                        </div>
                        {override && (
                          <div className="flex justify-between">
                            <span className="text-amber-600">Status</span>
                            <span className="font-semibold text-amber-700">Koordinat diedit</span>
                          </div>
                        )}
                      </div>

                      {/* Edit koordinat — save ke Convex real-time */}
                      {isVerifikator && editAbrasiId === abr.id ? (
                        <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-2 space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700">Edit Koordinat</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              value={editAbrasiLat}
                              onChange={e => setEditAbrasiLat(e.target.value)}
                              onBlur={e => { const p = parseCoord(e.target.value); if (p) setEditAbrasiLat(p); }}
                              placeholder="Lat"
                              className="text-xs border border-gray-300 rounded px-1.5 py-1 font-mono w-full"
                            />
                            <input
                              value={editAbrasiLng}
                              onChange={e => setEditAbrasiLng(e.target.value)}
                              onBlur={e => { const p = parseCoord(e.target.value); if (p) setEditAbrasiLng(p); }}
                              placeholder="Lng"
                              className="text-xs border border-gray-300 rounded px-1.5 py-1 font-mono w-full"
                            />
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={async () => {
                                const newLat = parseFloat(parseCoord(editAbrasiLat) ?? '');
                                const newLng = parseFloat(parseCoord(editAbrasiLng) ?? '');
                                if (isNaN(newLat) || isNaN(newLng)) {
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
                                    koordinatLat: newLat,
                                    koordinatLng: newLng,
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
                                // Convex watchQuery akan otomatis push update ke
                                // semua device. Fallback (Convex nonaktif): reload lokal.
                                if (!isConvexConfigured()) {
                                  fetchSurveys()
                                    .then(surveys => setSurveyAbrasi(surveysToAbrasiList(surveys)))
                                    .catch(() => {});
                                }
                                setEditAbrasiId(null);
                              }}
                              className="flex-1 flex items-center justify-center gap-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-2 py-1 rounded"
                            >
                              <Save className="w-3 h-3" /> Simpan
                            </button>
                            <button
                              onClick={() => setEditAbrasiId(null)}
                              className="flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-2 py-1 rounded"
                            >
                              <X className="w-3 h-3" /> Batal
                            </button>
                          </div>
                          {override && (
                            <button
                              onClick={() => {
                                if (confirm('Reset ke koordinat asli?')) {
                                  removeOverride(abr.id);
                                  setEditAbrasiId(null);
                                }
                              }}
                              className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-semibold px-2 py-1 rounded"
                            >
                              <RotateCcw className="w-3 h-3" /> Reset ke Asli
                            </button>
                          )}
                        </div>
                      ) : (
                        isVerifikator && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setEditAbrasiId(abr.id);
                              setEditAbrasiLat(lat.toString());
                              setEditAbrasiLng(lng.toString());
                            }}
                            className="w-full mt-2 flex items-center justify-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded border border-orange-200"
                          >
                            <Pencil className="w-3 h-3" /> Edit Koordinat
                          </button>
                        )
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Info Panel */}
        <div className="w-72 flex flex-col gap-3 overflow-y-auto">
          {/* Legend */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-800">Legenda</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center gap-2.5">
                  <div
                    className="rounded-full border-2"
                    style={{
                      width: STATUS_RADIUS[status] * 1.5,
                      height: STATUS_RADIUS[status] * 1.5,
                      background: color,
                      borderColor: color,
                      opacity: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  <span className="text-sm text-gray-600 capitalize">{status}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
              {regionalBoundary && (
                <div className="flex items-start gap-2 pb-1.5 border-b border-emerald-100">
                  <div className="w-4 h-4 mt-0.5 rounded-sm border border-emerald-700 bg-emerald-400/20 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-800">RTRW</p>
                    <p className="text-[11px] text-emerald-700 leading-tight">
                      {REGIONAL_BOUNDARIES.find(region => region.id === regionalBoundary)?.label}
                    </p>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400">Ukuran marker = luas relatif kawasan</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-dashed border-blue-600 bg-green-500/60 flex-shrink-0" />
                <span className="text-xs text-gray-500">KKPD (border biru putus-putus)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-600 border-2 border-white flex-shrink-0 flex items-center justify-center text-[8px]">👤</div>
                <span className="text-xs text-gray-500">Pokmaswas (kelompok pengawas)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-orange-500 border-2 border-white flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">⚠</div>
                <span className="text-xs text-gray-500">Titik Rawan Abrasi</span>
              </div>
            </div>
          </div>

          {/* Profil Pokmaswas legend */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-gray-800">Profil Pokmaswas</h3>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
              Kelompok Masyarakat Pengawas Konservasi. Klik kategori di bawah untuk
              memfilter marker Pokmaswas di peta.
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-purple-700 mb-1.5">
                  Ruang Lingkup
                </p>
                <div className="flex flex-wrap gap-1">
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
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-purple-700 mb-1.5">
                  Bidang / Core
                </p>
                <div className="flex flex-wrap gap-1">
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
              </div>

              <div className="pt-2 border-t border-purple-100">
                <p className="text-[10px] font-bold uppercase tracking-wide text-purple-700 mb-1">
                  Kawasan Pantai
                </p>
                <p className="text-[11px] text-gray-500 leading-snug">
                  Segmen pantai tempat kelompok beroperasi (isian bebas per entri,
                  mis. Pantai Sendang Biru, Muara Brantas).
                </p>
              </div>
            </div>
          </div>

          {/* Detail Card */}
          {selectedLocation ? (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  {selectedKKPD && (
                    <div className="flex items-center gap-1 mb-1">
                      <Shield className="w-3 h-3 text-blue-600" />
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {selectedKKPD.tipeKawasan} — {selectedKKPD.statusPenetapan}
                      </span>
                    </div>
                  )}
                  <h3 className="font-bold text-gray-800 text-sm">{selectedLocation.name}</h3>
                  <p className="text-xs text-gray-500">{selectedLocation.district}, {selectedLocation.province}</p>
                </div>
                <button
                  className="text-gray-300 hover:text-gray-500 text-lg leading-none"
                  onClick={() => setSelectedLoc(null)}
                >×</button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Status Tutupan</span>
                  <StatusBadge status={selectedLocation.status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Jenis Kawasan</span>
                  <StatusBadge status={selectedLocation.kawasan} />
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Luas Mangrove</span>
                  <span className="text-sm font-semibold text-gray-700">{selectedLocation.areaHa.toLocaleString()} ha</span>
                </div>

                {selectedKKPD && (
                  <div className="pt-2 border-t border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Info KKPD
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Kawasan</span>
                        <span className="font-medium">{selectedKKPD.luasTotal.toLocaleString()} ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pengelola</span>
                        <span className="font-medium text-right max-w-[140px] leading-tight">{selectedKKPD.pengelola}</span>
                      </div>
                      <div className="text-gray-500">Dasar Hukum:</div>
                      <div className="text-blue-700 font-medium text-[10px] leading-tight">{selectedKKPD.nomorSk}</div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sumber Data</span>
                        <span className="text-gray-400 text-[10px]">{selectedKKPD.sumberData}</span>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedKKPD && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Skor Kesehatan</span>
                    <span className={`text-sm font-bold ${
                      (selectedEco?.skorKesehatan ?? 0) >= 75 ? 'text-green-600'
                      : (selectedEco?.skorKesehatan ?? 0) >= 50 ? 'text-yellow-600'
                      : 'text-red-500'
                    }`}>{selectedEco?.skorKesehatan ?? '—'}/100</span>
                  </div>
                )}

                {selectedEco && (
                  <>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Data Ekosistem</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Tutupan Tajuk</span>
                          <span className="text-xs font-medium">{selectedEco.tutupanTajuk}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Kerapatan Pohon</span>
                          <span className="text-xs font-medium">{selectedEco.kerapatanPohon} pohon/ha</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Laju Regenerasi</span>
                          <StatusBadge status={selectedEco.lajuRegenerasi} size="sm" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Komposisi Spesies</p>
                      <div className="space-y-1.5">
                        {selectedEco.komposisiJenis.map(k => (
                          <div key={k.spesies}>
                            <div className="flex justify-between mb-0.5">
                              <span className="text-xs text-gray-600 italic truncate pr-2">{k.spesies}</span>
                              <span className="text-xs font-medium text-gray-700 flex-shrink-0">{k.persentase}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full bg-green-500"
                                style={{ width: `${k.persentase}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {selectedSos && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Tekanan Sosial</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Indeks Ancaman</span>
                        <span className={`text-xs font-bold ${
                          selectedSos.indeksAncaman >= 7 ? 'text-red-600'
                          : selectedSos.indeksAncaman >= 4 ? 'text-yellow-600'
                          : 'text-green-600'
                        }`}>{selectedSos.indeksAncaman}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Status Tenurial</span>
                        <StatusBadge status={selectedSos.statusTenurial} size="sm" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Stok Bibit</span>
                        <span className="text-xs font-medium">{selectedSos.stokBibit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Klik marker pada peta untuk melihat detail lokasi</p>
              </div>
            </div>
          )}

          {/* Location List */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-700 mb-2">Daftar Lokasi</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filtered.map(loc => {
                const isKKPD = kkpdLocations.some(k => k.id === loc.id);
                return (
                  <button
                    key={loc.id}
                    className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition-colors ${
                      selectedLoc === loc.id ? 'bg-green-50 text-green-800' : 'text-gray-700'
                    }`}
                    onClick={() => setSelectedLoc(loc.id === selectedLoc ? null : loc.id)}
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${isKKPD ? 'ring-1 ring-blue-500' : ''}`}
                      style={{ background: STATUS_COLORS[loc.status] }}
                    />
                    <span className="truncate">{loc.name}</span>
                    {isKKPD && <span className="text-[9px] text-blue-600 font-bold flex-shrink-0">KKPD</span>}
                    <span className="ml-auto text-gray-400 flex-shrink-0">{loc.areaHa.toLocaleString()} ha</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
