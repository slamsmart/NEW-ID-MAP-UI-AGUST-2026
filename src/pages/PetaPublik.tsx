import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { mangroveLocations, ekosistemData } from '../data/mockData';
import { kkpdLocations, type KKPDLocation } from '../data/kkpdData';
import { Filter, Layers, MapPin, Shield, Map, Satellite, Mountain, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const allLocations = [...mangroveLocations, ...kkpdLocations];

const STATUS_COLORS: Record<string, string> = {
  lebat: '#22c55e',
  sedang: '#eab308',
  jarang: '#f97316',
  kritis: '#ef4444',
};

const STATUS_RADIUS: Record<string, number> = {
  lebat: 14,
  sedang: 11,
  jarang: 9,
  kritis: 8,
};

const MAP_LAYERS = [
  {
    id: 'osm',
    label: 'OpenStreetMap',
    icon: Map,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  {
    id: 'satellite',
    label: 'Satelit',
    icon: Satellite,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
  {
    id: 'topo',
    label: 'Topografi',
    icon: Mountain,
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
  },
];

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

function TileLayerSwitcher({ activeLayer }: { activeLayer: string }) {
  const layer = MAP_LAYERS.find(l => l.id === activeLayer) ?? MAP_LAYERS[0];
  return <TileLayer url={layer.url} attribution={layer.attribution} />;
}

export default function PetaPublik() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterKawasan, setFilterKawasan] = useState('all');
  const [activeLayer, setActiveLayer] = useState('osm');
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  const filtered = allLocations.filter(loc => {
    if (filterStatus !== 'all' && loc.status !== filterStatus) return false;
    if (filterKawasan === 'kkpd') return kkpdLocations.some(k => k.id === loc.id);
    if (filterKawasan !== 'all' && loc.kawasan !== filterKawasan) return false;
    return true;
  });

  const selectedLocation = allLocations.find(l => l.id === selectedLoc);
  const selectedKKPD = kkpdLocations.find(l => l.id === selectedLoc) as KKPDLocation | undefined;
  const selectedEco = ekosistemData.find(e => e.locationId === selectedLoc);

  const totalLebat = allLocations.filter(l => l.status === 'lebat').length;
  const totalSedang = allLocations.filter(l => l.status === 'sedang').length;
  const totalJarang = allLocations.filter(l => l.status === 'jarang').length;
  const totalKritis = allLocations.filter(l => l.status === 'kritis').length;

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: '#0d1117', color: '#e2e8f0' }}>

      {/* ── TOP BAR ── */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b border-white/10"
        style={{ background: '#111827' }}
      >
        {/* Left: branding + title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.svg" alt="ID-MAP" className="h-7 w-auto" />
          </button>
          <div className="w-px h-6 bg-white/20" />
          <div>
            <h1 className="text-white font-bold text-sm sm:text-base leading-tight">
              Peta Interaktif Mangrove
            </h1>
            <p className="text-white/40 text-[10px] hidden sm:block">
              Data titik mangrove dari lapangan
            </p>
          </div>
        </div>

        {/* Center: stats pills */}
        <div className="hidden md:flex items-center gap-2">
          {[
            { label: 'Lebat', count: totalLebat, color: '#22c55e' },
            { label: 'Sedang', count: totalSedang, color: '#eab308' },
            { label: 'Jarang', count: totalJarang, color: '#f97316' },
            { label: 'Kritis', count: totalKritis, color: '#ef4444' },
          ].map(s => (
            <div
              key={s.label}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              {s.count} {s.label}
            </div>
          ))}
        </div>

        {/* Right: login / go to dashboard */}
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-teal-600 text-white hover:bg-teal-500 transition-colors"
            >
              Dashboard <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div
        className="flex items-center gap-3 px-5 py-2.5 flex-wrap border-b border-white/10 flex-shrink-0"
        style={{ background: '#161b27' }}
      >
        <div className="flex items-center gap-1.5 text-white/50 text-xs">
          <Filter className="w-3.5 h-3.5" /> Filter
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-xs rounded-lg px-3 py-1.5 border border-white/15 focus:outline-none focus:border-teal-500"
          style={{ background: '#1e2533', color: '#e2e8f0' }}
        >
          <option value="all">Semua Status</option>
          <option value="lebat">Lebat</option>
          <option value="sedang">Sedang</option>
          <option value="jarang">Jarang</option>
          <option value="kritis">Kritis</option>
        </select>

        <select
          value={filterKawasan}
          onChange={e => setFilterKawasan(e.target.value)}
          className="text-xs rounded-lg px-3 py-1.5 border border-white/15 focus:outline-none focus:border-teal-500"
          style={{ background: '#1e2533', color: '#e2e8f0' }}
        >
          <option value="all">Semua Kawasan</option>
          <option value="kkpd">KKPD / Kaw. Konservasi</option>
          <option value="konservasi">Kaw. Konservasi (Umum)</option>
          <option value="hutan_lindung">Hutan Lindung</option>
          <option value="apl">APL</option>
        </select>

        {/* Map type buttons */}
        <div className="ml-auto flex items-center gap-1">
          {MAP_LAYERS.map(l => {
            const Icon = l.icon;
            return (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: activeLayer === l.id ? '#0ea5e9' : 'rgba(255,255,255,0.07)',
                  color: activeLayer === l.id ? '#fff' : '#94a3b8',
                  border: activeLayer === l.id ? '1px solid #0ea5e9' : '1px solid transparent',
                }}
              >
                <Icon className="w-3.5 h-3.5" /> {l.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 text-white/40 text-xs">
          <MapPin className="w-3.5 h-3.5" />
          <strong className="text-white">{filtered.length}</strong>&nbsp;lokasi
        </div>
      </div>

      {/* ── MAP + SIDEBAR ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* MAP */}
        <div className="flex-1 relative">
          <MapContainer
            center={[-2.5, 118]}
            zoom={5}
            style={{ height: '100%', width: '100%', background: '#0d1117' }}
            zoomControl={false}
          >
            <MapController center={[-2.5, 118]} zoom={5} />
            <TileLayerSwitcher activeLayer={activeLayer} />

            {filtered.map(loc => {
              const isKKPD = kkpdLocations.some(k => k.id === loc.id);
              const eco = ekosistemData.find(e => e.locationId === loc.id);
              const kkpdInfo = isKKPD ? (loc as KKPDLocation) : null;
              const isSelected = selectedLoc === loc.id;
              return (
                <CircleMarker
                  key={loc.id}
                  center={[loc.lat, loc.lng]}
                  radius={isSelected ? STATUS_RADIUS[loc.status] + 3 : STATUS_RADIUS[loc.status]}
                  pathOptions={{
                    color: isSelected ? '#fff' : (isKKPD ? '#38bdf8' : STATUS_COLORS[loc.status]),
                    fillColor: STATUS_COLORS[loc.status],
                    fillOpacity: isSelected ? 1 : 0.75,
                    weight: isSelected ? 2.5 : (isKKPD ? 2 : 1.5),
                    dashArray: isKKPD && !isSelected ? '4 2' : undefined,
                  }}
                  eventHandlers={{ click: () => setSelectedLoc(loc.id === selectedLoc ? null : loc.id) }}
                >
                  <Popup>
                    <div className="min-w-[180px] text-sm">
                      {isKKPD && (
                        <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded mb-1">
                          {kkpdInfo?.tipeKawasan}
                        </span>
                      )}
                      <div className="font-bold text-gray-800">{loc.name}</div>
                      <div className="text-xs text-gray-500 mb-1">{loc.district}, {loc.province}</div>
                      <div className="text-xs flex justify-between">
                        <span className="text-gray-500">Luas</span>
                        <span className="font-medium">{loc.areaHa.toLocaleString()} ha</span>
                      </div>
                      {eco && (
                        <div className="text-xs flex justify-between">
                          <span className="text-gray-500">Kesehatan</span>
                          <span className="font-bold text-green-700">{eco.skorKesehatan}/100</span>
                        </div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Map mode badge */}
          <div className="absolute top-3 left-3 z-[999] px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
            {MAP_LAYERS.find(l => l.id === activeLayer)?.label}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div
          className="w-72 flex-shrink-0 flex flex-col border-l border-white/10 overflow-y-auto"
          style={{ background: '#111827' }}
        >
          {/* Legend toggle */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Layers className="w-4 h-4 text-teal-400" /> Legenda
            </div>
            <button onClick={() => setShowLegend(!showLegend)} className="text-white/30 hover:text-white/60 transition-colors">
              <ChevronRight className={`w-4 h-4 transition-transform ${showLegend ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {showLegend && (
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Titik ID-MAP</p>
              <div className="space-y-2">
                {Object.entries(STATUS_COLORS).map(([s, color]) => (
                  <div key={s} className="flex items-center gap-2.5">
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{ width: STATUS_RADIUS[s] * 1.6, height: STATUS_RADIUS[s] * 1.6, background: color, opacity: 0.85 }}
                    />
                    <span className="text-sm capitalize text-white/70">{s}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-dashed border-sky-400 flex-shrink-0" style={{ background: 'rgba(34,197,94,0.4)' }} />
                <span className="text-[11px] text-white/50">KKPD (border biru putus)</span>
              </div>
            </div>
          )}

          {/* Selected location detail */}
          {selectedLocation ? (
            <div className="flex-1 px-4 py-3">
              <div className="flex items-start justify-between mb-3">
                <div>
                  {selectedKKPD && (
                    <div className="flex items-center gap-1 mb-1">
                      <Shield className="w-3 h-3 text-sky-400" />
                      <span className="text-[10px] font-bold text-sky-400">{selectedKKPD.tipeKawasan}</span>
                    </div>
                  )}
                  <h3 className="font-bold text-white text-sm leading-tight">{selectedLocation.name}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{selectedLocation.district}, {selectedLocation.province}</p>
                </div>
                <button onClick={() => setSelectedLoc(null)} className="text-white/30 hover:text-white/60 transition-colors mt-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <InfoRow label="Status Tutupan">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{ background: `${STATUS_COLORS[selectedLocation.status]}20`, color: STATUS_COLORS[selectedLocation.status] }}
                  >
                    {selectedLocation.status}
                  </span>
                </InfoRow>
                <InfoRow label="Luas Mangrove">
                  <span className="text-sm font-semibold text-white">{selectedLocation.areaHa.toLocaleString()} ha</span>
                </InfoRow>
                <InfoRow label="Koordinat">
                  <span className="text-xs text-white/50 font-mono">{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</span>
                </InfoRow>

                {selectedKKPD && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Info KKPD
                    </p>
                    <div className="space-y-1.5">
                      <InfoRow label="Total Kawasan">
                        <span className="text-xs text-white/70">{selectedKKPD.luasTotal.toLocaleString()} ha</span>
                      </InfoRow>
                      <InfoRow label="Pengelola">
                        <span className="text-xs text-white/70 text-right max-w-[130px] leading-tight">{selectedKKPD.pengelola}</span>
                      </InfoRow>
                      <div className="text-[10px] text-white/30 mt-1">Dasar Hukum:</div>
                      <div className="text-[11px] text-sky-400 font-medium">{selectedKKPD.nomorSk}</div>
                    </div>
                  </div>
                )}

                {selectedEco && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-2">Data Ekosistem</p>
                    <div className="space-y-1.5">
                      <InfoRow label="Skor Kesehatan">
                        <span className="text-sm font-bold" style={{
                          color: selectedEco.skorKesehatan >= 75 ? '#22c55e' : selectedEco.skorKesehatan >= 50 ? '#eab308' : '#ef4444'
                        }}>
                          {selectedEco.skorKesehatan}/100
                        </span>
                      </InfoRow>
                      <InfoRow label="Tutupan Tajuk">
                        <span className="text-xs text-white/70">{selectedEco.tutupanTajuk}%</span>
                      </InfoRow>
                      <InfoRow label="Kerapatan Pohon">
                        <span className="text-xs text-white/70">{selectedEco.kerapatanPohon} pohon/ha</span>
                      </InfoRow>
                    </div>

                    <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mt-3 mb-2">Komposisi Spesies</p>
                    <div className="space-y-2">
                      {selectedEco.komposisiJenis.map(k => (
                        <div key={k.spesies}>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[11px] text-white/50 italic truncate pr-2">{k.spesies}</span>
                            <span className="text-[11px] text-white/70 flex-shrink-0">{k.persentase}%</span>
                          </div>
                          <div className="w-full rounded-full h-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div className="h-1 rounded-full bg-green-500" style={{ width: `${k.persentase}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <MapPin className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-sm text-white/30">Klik marker di peta untuk melihat detail lokasi</p>

              {/* Location list */}
              <div className="w-full mt-6">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2 text-left">
                  Daftar Lokasi ({filtered.length})
                </p>
                <div className="space-y-0.5 max-h-64 overflow-y-auto">
                  {filtered.map(loc => {
                    const isKKPD = kkpdLocations.some(k => k.id === loc.id);
                    return (
                      <button
                        key={loc.id}
                        onClick={() => setSelectedLoc(loc.id)}
                        className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: STATUS_COLORS[loc.status] }} />
                        <span className="truncate text-white/60">{loc.name}</span>
                        {isKKPD && <span className="text-[9px] text-sky-500 font-bold flex-shrink-0">KKPD</span>}
                        <span className="ml-auto text-white/30 flex-shrink-0 text-[10px]">{loc.areaHa.toLocaleString()} ha</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-white/40">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}
