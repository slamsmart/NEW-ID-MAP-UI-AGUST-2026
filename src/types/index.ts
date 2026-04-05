export interface MangroveLocation {
  id: string;
  name: string;
  province: string;
  district: string;
  lat: number;
  lng: number;
  areaHa: number;
  status: 'kritis' | 'jarang' | 'sedang' | 'lebat';
  kawasan: 'konservasi' | 'hutan_lindung' | 'apl';
  lastSurvey: string;
}

export interface EkosistemData {
  locationId: string;
  tutupanTajuk: number; // persen
  kerapatanPohon: number; // pohon/ha
  komposisiJenis: { spesies: string; persentase: number }[];
  lajuRegenerasi: 'tinggi' | 'sedang' | 'rendah';
  skorKesehatan: number; // 0-100
  tahun: number;
}

export interface LingkunganData {
  locationId: string;
  salinitas: number; // ppt
  ph: number;
  suhu: number; // celsius
  kekeruhan: number; // NTU
  substrat: 'lumpur' | 'pasir' | 'berbatu' | 'campuran';
  pasangSurut: { min: number; max: number }; // meter
  tanggal: string;
}

export interface TekananSosialData {
  locationId: string;
  jarakPemukiman: number; // km
  luasTambak: number; // ha
  indeksAncaman: number; // 0-10
  statusTenurial: 'bersengketa' | 'aman' | 'proses_legal';
  nurseryTerdekat: string;
  stokBibit: number;
}

export interface TimeSeriesData {
  tahun: number;
  luasMangrove: number; // ha
  luasRestorasi: number; // ha
  persenTutupan: number;
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'critical' | 'info';
  lokasi: string;
  pesan: string;
  tanggal: string;
}

export interface StatKPI {
  label: string;
  value: string;
  unit: string;
  trend: number;
  icon: string;
  color: string;
}
