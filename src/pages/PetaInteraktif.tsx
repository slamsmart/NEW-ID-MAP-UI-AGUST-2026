import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { mangroveLocations, ekosistemData, tekananSosialData } from '../data/mockData';
import { kkpdLocations, type KKPDLocation } from '../data/kkpdData';
import StatusBadge from '../components/shared/StatusBadge';
import { MapPin, Layers, Filter, Shield } from 'lucide-react';

const allLocations = [...mangroveLocations, ...kkpdLocations];

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

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function PetaInteraktif() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterKawasan, setFilterKawasan] = useState<string>('all');
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const [mapCenter] = useState<[number, number]>([-2.5, 118]);
  const [mapZoom] = useState(5);

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
                    <div className="min-w-[200px]">
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
                      <div className="space-y-1 text-xs">
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
              <p className="text-xs text-gray-400">Ukuran marker = luas relatif kawasan</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-dashed border-blue-600 bg-green-500/60 flex-shrink-0" />
                <span className="text-xs text-gray-500">KKPD (border biru putus-putus)</span>
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
