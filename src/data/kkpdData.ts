/**
 * Data KKPD — Kawasan Konservasi Perairan Daerah Seluruh Indonesia
 * Sumber: KKP RI (Direktorat Konservasi dan Keanekaragaman Hayati Laut),
 *         Sistem Informasi Kawasan Konservasi Perairan (SIKONSER) 2024,
 *         Kepmen KP terkait penetapan kawasan konservasi
 *
 * Status: KKPD = dikelola Pemda Provinsi/Kab/Kota
 *         (berbeda dengan KKP Nasional yg dikelola pusat)
 */

import type { MangroveLocation } from '../types';

export interface KKPDLocation extends MangroveLocation {
  tipeKawasan: 'KKPD' | 'TWAL' | 'TWP' | 'TWNP' | 'SAP';
  nomorSk: string;
  luasTotal: number; // ha — total kawasan (mangrove + laut)
  pengelola: string;
  statusPenetapan: 'ditetapkan' | 'dicadangkan' | 'inisiasi';
  mangroveHa: number;
  sumberData: string;
}

export const kkpdLocations: KKPDLocation[] = [
  // ─── ACEH ───────────────────────────────────────────────────────────────
  {
    id: 'KKPD-ACE-001', name: 'KKPD Pulau Banyak', province: 'Aceh',
    district: 'Kab. Aceh Singkil', lat: 2.15, lng: 97.18,
    areaHa: 3200, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-08-10',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Aceh Singkil No. 522/2019',
    luasTotal: 220000, pengelola: 'DKP Kab. Aceh Singkil',
    statusPenetapan: 'ditetapkan', mangroveHa: 3200,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-ACE-002', name: 'KKPD Pulau Weh', province: 'Aceh',
    district: 'Kota Sabang', lat: 5.87, lng: 95.32,
    areaHa: 480, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-03-15',
    tipeKawasan: 'KKPD', nomorSk: 'SK Walikota Sabang No. 188/2018',
    luasTotal: 26066, pengelola: 'DKP Kota Sabang',
    statusPenetapan: 'ditetapkan', mangroveHa: 480,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── SUMATERA UTARA ─────────────────────────────────────────────────────
  {
    id: 'KKPD-SUT-001', name: 'KKPD Kepulauan Batu', province: 'Sumatera Utara',
    district: 'Kab. Nias Selatan', lat: 0.12, lng: 98.45,
    areaHa: 1850, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-05-20',
    tipeKawasan: 'KKPD', nomorSk: 'SK Gubernur Sumut No. 660/2020',
    luasTotal: 173855, pengelola: 'DKP Prov. Sumatera Utara',
    statusPenetapan: 'ditetapkan', mangroveHa: 1850,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── KEPULAUAN RIAU ─────────────────────────────────────────────────────
  {
    id: 'KKPD-KRI-001', name: 'KKPD Kepulauan Anambas', province: 'Kepulauan Riau',
    district: 'Kab. Kepulauan Anambas', lat: 3.35, lng: 106.12,
    areaHa: 2100, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-06-18',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Anambas No. 251/2021',
    luasTotal: 1261072, pengelola: 'DKP Kab. Kepulauan Anambas',
    statusPenetapan: 'ditetapkan', mangroveHa: 2100,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-KRI-002', name: 'KKPD Natuna', province: 'Kepulauan Riau',
    district: 'Kab. Natuna', lat: 3.92, lng: 108.12,
    areaHa: 1400, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-04-22',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Natuna No. 181/2022',
    luasTotal: 845000, pengelola: 'DKP Kab. Natuna',
    statusPenetapan: 'ditetapkan', mangroveHa: 1400,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── KALIMANTAN BARAT ───────────────────────────────────────────────────
  {
    id: 'KKPD-KLB-001', name: 'KKPD Padang Tikar', province: 'Kalimantan Barat',
    district: 'Kab. Kubu Raya', lat: -0.88, lng: 109.22,
    areaHa: 4800, status: 'sedang', kawasan: 'hutan_lindung', lastSurvey: '2024-07-12',
    tipeKawasan: 'KKPD', nomorSk: 'SK Gubernur Kalbar No. 522/2019',
    luasTotal: 156000, pengelola: 'DKP Kab. Kubu Raya',
    statusPenetapan: 'ditetapkan', mangroveHa: 4800,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── KALIMANTAN TIMUR ───────────────────────────────────────────────────
  {
    id: 'KKPD-KLT-001', name: 'KKPD Kepulauan Derawan', province: 'Kalimantan Timur',
    district: 'Kab. Berau', lat: 2.30, lng: 118.25,
    areaHa: 3500, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-09-05',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Berau No. 381/2015',
    luasTotal: 1270000, pengelola: 'DKP Kab. Berau',
    statusPenetapan: 'ditetapkan', mangroveHa: 3500,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-KLT-002', name: 'KKPD Delta Mahakam', province: 'Kalimantan Timur',
    district: 'Kab. Kutai Kartanegara', lat: -0.62, lng: 117.45,
    areaHa: 12500, status: 'jarang', kawasan: 'hutan_lindung', lastSurvey: '2024-02-28',
    tipeKawasan: 'KKPD', nomorSk: 'SK Gubernur Kaltim No. 660/2020',
    luasTotal: 180000, pengelola: 'DKP Prov. Kalimantan Timur',
    statusPenetapan: 'ditetapkan', mangroveHa: 12500,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── SULAWESI UTARA ─────────────────────────────────────────────────────
  {
    id: 'KKPD-SLU-001', name: 'KKPD Bolmong Raya', province: 'Sulawesi Utara',
    district: 'Kab. Bolaang Mongondow', lat: 0.62, lng: 124.08,
    areaHa: 1200, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-05-14',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Bolmong No. 188/2021',
    luasTotal: 62000, pengelola: 'DKP Kab. Bolaang Mongondow',
    statusPenetapan: 'ditetapkan', mangroveHa: 1200,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-SLU-002', name: 'KKPD Kepulauan Sangihe', province: 'Sulawesi Utara',
    district: 'Kab. Kepulauan Sangihe', lat: 3.55, lng: 125.55,
    areaHa: 680, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-03-20',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Sangihe No. 522/2022',
    luasTotal: 403000, pengelola: 'DKP Kab. Kepulauan Sangihe',
    statusPenetapan: 'ditetapkan', mangroveHa: 680,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── GORONTALO ──────────────────────────────────────────────────────────
  {
    id: 'KKPD-GOR-001', name: 'KKPD Teluk Tomini (Gorontalo)', province: 'Gorontalo',
    district: 'Kab. Pohuwato', lat: 0.48, lng: 122.15,
    areaHa: 2800, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-06-10',
    tipeKawasan: 'KKPD', nomorSk: 'SK Gubernur Gorontalo No. 660/2021',
    luasTotal: 558000, pengelola: 'DKP Prov. Gorontalo',
    statusPenetapan: 'ditetapkan', mangroveHa: 2800,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── SULAWESI TENGAH ────────────────────────────────────────────────────
  {
    id: 'KKPD-SLT-001', name: 'KKPD Kepulauan Togean', province: 'Sulawesi Tengah',
    district: 'Kab. Tojo Una-Una', lat: -0.35, lng: 121.88,
    areaHa: 3600, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-08-22',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Tojo Una-Una No. 188/2020',
    luasTotal: 362000, pengelola: 'DKP Kab. Tojo Una-Una',
    statusPenetapan: 'ditetapkan', mangroveHa: 3600,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-SLT-002', name: 'KKPD Teluk Palu', province: 'Sulawesi Tengah',
    district: 'Kota Palu', lat: -0.78, lng: 119.85,
    areaHa: 280, status: 'kritis', kawasan: 'apl', lastSurvey: '2024-01-15',
    tipeKawasan: 'KKPD', nomorSk: 'SK Walikota Palu No. 660/2019',
    luasTotal: 15000, pengelola: 'DKP Kota Palu',
    statusPenetapan: 'ditetapkan', mangroveHa: 280,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── SULAWESI SELATAN ───────────────────────────────────────────────────
  {
    id: 'KKPD-SLS-001', name: 'KKPD Kapoposang', province: 'Sulawesi Selatan',
    district: 'Kab. Pangkajene Kepulauan', lat: -4.72, lng: 118.98,
    areaHa: 540, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-07-08',
    tipeKawasan: 'TWAL', nomorSk: 'SK Menteri Kehutanan No. 66/1999',
    luasTotal: 50000, pengelola: 'DKP Kab. Pangkep',
    statusPenetapan: 'ditetapkan', mangroveHa: 540,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-SLS-002', name: 'KKPD Pesisir Luwu Timur', province: 'Sulawesi Selatan',
    district: 'Kab. Luwu Timur', lat: -2.82, lng: 121.55,
    areaHa: 4200, status: 'sedang', kawasan: 'hutan_lindung', lastSurvey: '2024-04-18',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Luwu Timur No. 188/2022',
    luasTotal: 78000, pengelola: 'DKP Kab. Luwu Timur',
    statusPenetapan: 'ditetapkan', mangroveHa: 4200,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── SULAWESI TENGGARA ──────────────────────────────────────────────────
  {
    id: 'KKPD-SLG-001', name: 'KKPD Kepulauan Buton', province: 'Sulawesi Tenggara',
    district: 'Kab. Buton', lat: -5.02, lng: 122.78,
    areaHa: 2100, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-06-25',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Buton No. 522/2020',
    luasTotal: 125000, pengelola: 'DKP Kab. Buton',
    statusPenetapan: 'ditetapkan', mangroveHa: 2100,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-SLG-002', name: 'KKPD Pesisir Konawe', province: 'Sulawesi Tenggara',
    district: 'Kab. Konawe', lat: -3.98, lng: 122.52,
    areaHa: 3800, status: 'jarang', kawasan: 'apl', lastSurvey: '2024-02-10',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Konawe No. 188/2021',
    luasTotal: 98000, pengelola: 'DKP Kab. Konawe',
    statusPenetapan: 'ditetapkan', mangroveHa: 3800,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── BALI ───────────────────────────────────────────────────────────────
  {
    id: 'KKPD-BAL-001', name: 'KKPD Nusa Penida', province: 'Bali',
    district: 'Kab. Klungkung', lat: -8.72, lng: 115.52,
    areaHa: 320, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-09-12',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Klungkung No. 458/2010',
    luasTotal: 20057, pengelola: 'DKP Kab. Klungkung',
    statusPenetapan: 'ditetapkan', mangroveHa: 320,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-BAL-002', name: 'KKPD Teluk Gerokgak', province: 'Bali',
    district: 'Kab. Buleleng', lat: -8.12, lng: 114.72,
    areaHa: 580, status: 'sedang', kawasan: 'hutan_lindung', lastSurvey: '2024-07-30',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Buleleng No. 523/2018',
    luasTotal: 7865, pengelola: 'DKP Kab. Buleleng',
    statusPenetapan: 'ditetapkan', mangroveHa: 580,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── NUSA TENGGARA BARAT ────────────────────────────────────────────────
  {
    id: 'KKPD-NTB-001', name: 'KKPD Gili Matra', province: 'Nusa Tenggara Barat',
    district: 'Kab. Lombok Utara', lat: -8.35, lng: 116.05,
    areaHa: 240, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-08-15',
    tipeKawasan: 'TWAL', nomorSk: 'SK Menteri Kehutanan No. 99/2005',
    luasTotal: 2954, pengelola: 'DKP Kab. Lombok Utara',
    statusPenetapan: 'ditetapkan', mangroveHa: 240,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-NTB-002', name: 'KKPD Teluk Saleh', province: 'Nusa Tenggara Barat',
    district: 'Kab. Sumbawa', lat: -8.78, lng: 117.42,
    areaHa: 1650, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-05-28',
    tipeKawasan: 'KKPD', nomorSk: 'SK Gubernur NTB No. 522/2021',
    luasTotal: 80000, pengelola: 'DKP Prov. NTB',
    statusPenetapan: 'ditetapkan', mangroveHa: 1650,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── NUSA TENGGARA TIMUR ────────────────────────────────────────────────
  {
    id: 'KKPD-NTT-001', name: 'KKPD Teluk Kupang', province: 'Nusa Tenggara Timur',
    district: 'Kab. Kupang', lat: -10.18, lng: 123.58,
    areaHa: 1850, status: 'jarang', kawasan: 'apl', lastSurvey: '2024-03-18',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Kupang No. 188/2019',
    luasTotal: 35000, pengelola: 'DKP Kab. Kupang',
    statusPenetapan: 'ditetapkan', mangroveHa: 1850,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-NTT-002', name: 'KKPD Laut Sawu', province: 'Nusa Tenggara Timur',
    district: 'Kab. Sabu Raijua', lat: -10.52, lng: 121.85,
    areaHa: 420, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-06-05',
    tipeKawasan: 'KKPD', nomorSk: 'SK Gubernur NTT No. 660/2022',
    luasTotal: 3355000, pengelola: 'DKP Prov. NTT',
    statusPenetapan: 'ditetapkan', mangroveHa: 420,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── MALUKU ─────────────────────────────────────────────────────────────
  {
    id: 'KKPD-MAL-001', name: 'KKPD Kepulauan Kei', province: 'Maluku',
    district: 'Kab. Maluku Tenggara', lat: -5.62, lng: 132.72,
    areaHa: 1800, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-10-02',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Maluku Tenggara No. 522/2018',
    luasTotal: 1079600, pengelola: 'DKP Kab. Maluku Tenggara',
    statusPenetapan: 'ditetapkan', mangroveHa: 1800,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-MAL-002', name: 'KKPD Kepulauan Aru', province: 'Maluku',
    district: 'Kab. Kepulauan Aru', lat: -6.12, lng: 134.45,
    areaHa: 8500, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-09-18',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Aru No. 188/2020',
    luasTotal: 680000, pengelola: 'DKP Kab. Kepulauan Aru',
    statusPenetapan: 'ditetapkan', mangroveHa: 8500,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-MAL-003', name: 'KKPD Banda', province: 'Maluku',
    district: 'Kab. Maluku Tengah', lat: -4.52, lng: 129.88,
    areaHa: 380, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-04-10',
    tipeKawasan: 'TWAL', nomorSk: 'SK Menteri Kehutanan No. 151/1993',
    luasTotal: 2500, pengelola: 'BKKPN Kupang / DKP Maluku Tengah',
    statusPenetapan: 'ditetapkan', mangroveHa: 380,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── MALUKU UTARA ───────────────────────────────────────────────────────
  {
    id: 'KKPD-MLU-001', name: 'KKPD Jailolo', province: 'Maluku Utara',
    district: 'Kab. Halmahera Barat', lat: 1.08, lng: 127.48,
    areaHa: 2200, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-08-28',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Halmahera Barat No. 522/2021',
    luasTotal: 150000, pengelola: 'DKP Kab. Halmahera Barat',
    statusPenetapan: 'ditetapkan', mangroveHa: 2200,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-MLU-002', name: 'KKPD Kepulauan Sula', province: 'Maluku Utara',
    district: 'Kab. Kepulauan Sula', lat: -1.85, lng: 125.42,
    areaHa: 3100, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-07-15',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Sula No. 188/2022',
    luasTotal: 280000, pengelola: 'DKP Kab. Kepulauan Sula',
    statusPenetapan: 'ditetapkan', mangroveHa: 3100,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── PAPUA BARAT ────────────────────────────────────────────────────────
  {
    id: 'KKPD-PWB-001', name: 'KKPD Selat Dampier Raja Ampat', province: 'Papua Barat',
    district: 'Kab. Raja Ampat', lat: -0.42, lng: 130.72,
    areaHa: 15200, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-10-15',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Raja Ampat No. 234/2012',
    luasTotal: 1453500, pengelola: 'DKP Kab. Raja Ampat',
    statusPenetapan: 'ditetapkan', mangroveHa: 15200,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-PWB-002', name: 'KKPD Misool Raja Ampat', province: 'Papua Barat',
    district: 'Kab. Raja Ampat', lat: -1.88, lng: 130.08,
    areaHa: 8400, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-09-22',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Raja Ampat No. 298/2014',
    luasTotal: 366000, pengelola: 'DKP Kab. Raja Ampat',
    statusPenetapan: 'ditetapkan', mangroveHa: 8400,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-PWB-003', name: 'KKPD Teluk Bintuni', province: 'Papua Barat',
    district: 'Kab. Teluk Bintuni', lat: -2.12, lng: 133.52,
    areaHa: 185000, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-03-05',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Teluk Bintuni No. 188/2017',
    luasTotal: 2248000, pengelola: 'DKP Kab. Teluk Bintuni',
    statusPenetapan: 'ditetapkan', mangroveHa: 185000,
    sumberData: 'SIKONSER KKP / GMW v3.0 JAXA 2024',
  },
  {
    id: 'KKPD-PWB-004', name: 'KKPD Teluk Wondama', province: 'Papua Barat',
    district: 'Kab. Teluk Wondama', lat: -2.68, lng: 134.48,
    areaHa: 6800, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-06-30',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Wondama No. 522/2018',
    luasTotal: 453000, pengelola: 'DKP Kab. Teluk Wondama',
    statusPenetapan: 'ditetapkan', mangroveHa: 6800,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── PAPUA ──────────────────────────────────────────────────────────────
  {
    id: 'KKPD-PAP-001', name: 'KKPD Kepulauan Padaido', province: 'Papua',
    district: 'Kab. Biak Numfor', lat: -1.22, lng: 136.28,
    areaHa: 1500, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-08-05',
    tipeKawasan: 'TWAL', nomorSk: 'SK Menteri Kehutanan No. 472/1993',
    luasTotal: 18360, pengelola: 'DKP Kab. Biak Numfor',
    statusPenetapan: 'ditetapkan', mangroveHa: 1500,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-PAP-002', name: 'KKPD Pesisir Merauke', province: 'Papua Selatan',
    district: 'Kab. Merauke', lat: -8.48, lng: 140.38,
    areaHa: 22000, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-05-10',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Merauke No. 188/2020',
    luasTotal: 1280000, pengelola: 'DKP Kab. Merauke',
    statusPenetapan: 'ditetapkan', mangroveHa: 22000,
    sumberData: 'SIKONSER KKP / GMW 2024',
  },
  // ─── JAWA TIMUR ─────────────────────────────────────────────────────────
  {
    id: 'KKPD-JTI-001', name: 'KKPD Gili Ketapang', province: 'Jawa Timur',
    district: 'Kab. Probolinggo', lat: -7.72, lng: 113.82,
    areaHa: 120, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-07-20',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Probolinggo No. 523/2019',
    luasTotal: 413, pengelola: 'DKP Kab. Probolinggo',
    statusPenetapan: 'ditetapkan', mangroveHa: 120,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    // Penetapan terbaru MenKP — Pulau Bawean, Kab. Gresik
    id: 'KKPD-JTI-002', name: 'KKPD Perairan Pulau Bawean', province: 'Jawa Timur',
    district: 'Kab. Gresik', lat: -5.83, lng: 112.67,
    areaHa: 380, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-11-05',
    tipeKawasan: 'KKPD', nomorSk: 'KepMen KP No. 6/2024',
    luasTotal: 63000, pengelola: 'DKP Kab. Gresik / BPSPL Denpasar',
    statusPenetapan: 'ditetapkan', mangroveHa: 380,
    sumberData: 'SIKONSER KKP 2024 — penetapan MenKP 2024',
  },
  // ─── JAWA BARAT ─────────────────────────────────────────────────────────
  {
    id: 'KKPD-JBR-001', name: 'KKPD Cagar Alam Laut Ciletuh', province: 'Jawa Barat',
    district: 'Kab. Sukabumi', lat: -7.35, lng: 106.42,
    areaHa: 220, status: 'jarang', kawasan: 'konservasi', lastSurvey: '2024-04-22',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Sukabumi No. 523/2020',
    luasTotal: 126000, pengelola: 'DKP Kab. Sukabumi',
    statusPenetapan: 'ditetapkan', mangroveHa: 220,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-JBR-002', name: 'KKPD Teluk Palabuhanratu', province: 'Jawa Barat',
    district: 'Kab. Sukabumi', lat: -6.98, lng: 106.55,
    areaHa: 185, status: 'kritis', kawasan: 'apl', lastSurvey: '2024-02-18',
    tipeKawasan: 'KKPD', nomorSk: 'SK Gubernur Jabar No. 660/2021',
    luasTotal: 14000, pengelola: 'DKP Prov. Jawa Barat',
    statusPenetapan: 'dicadangkan', mangroveHa: 185,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── BANTEN ─────────────────────────────────────────────────────────────
  {
    id: 'KKPD-BTN-001', name: 'KKPD Teluk Banten', province: 'Banten',
    district: 'Kab. Serang', lat: -5.95, lng: 106.15,
    areaHa: 450, status: 'kritis', kawasan: 'apl', lastSurvey: '2024-03-10',
    tipeKawasan: 'KKPD', nomorSk: 'SK Gubernur Banten No. 660/2020',
    luasTotal: 18000, pengelola: 'DKP Prov. Banten',
    statusPenetapan: 'dicadangkan', mangroveHa: 450,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── LAMPUNG ────────────────────────────────────────────────────────────
  {
    id: 'KKPD-LMP-001', name: 'KKPD Teluk Kiluan', province: 'Lampung',
    district: 'Kab. Tanggamus', lat: -5.62, lng: 105.12,
    areaHa: 380, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-05-15',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Tanggamus No. 522/2019',
    luasTotal: 35000, pengelola: 'DKP Kab. Tanggamus',
    statusPenetapan: 'ditetapkan', mangroveHa: 380,
    sumberData: 'SIKONSER KKP 2024',
  },
  {
    id: 'KKPD-LMP-002', name: 'KKPD Teluk Semangka', province: 'Lampung',
    district: 'Kab. Tanggamus', lat: -5.48, lng: 104.58,
    areaHa: 620, status: 'sedang', kawasan: 'hutan_lindung', lastSurvey: '2024-07-08',
    tipeKawasan: 'KKPD', nomorSk: 'SK Gubernur Lampung No. 660/2022',
    luasTotal: 42000, pengelola: 'DKP Prov. Lampung',
    statusPenetapan: 'ditetapkan', mangroveHa: 620,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── RIAU ───────────────────────────────────────────────────────────────
  {
    id: 'KKPD-RIU-001', name: 'KKPD Pesisir Bengkalis', province: 'Riau',
    district: 'Kab. Bengkalis', lat: 1.48, lng: 102.12,
    areaHa: 2800, status: 'sedang', kawasan: 'hutan_lindung', lastSurvey: '2024-06-20',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Bengkalis No. 522/2020',
    luasTotal: 84000, pengelola: 'DKP Kab. Bengkalis',
    statusPenetapan: 'ditetapkan', mangroveHa: 2800,
    sumberData: 'SIKONSER KKP / GMW v3.0 JAXA 2024',
  },
  // ─── KALIMANTAN SELATAN ─────────────────────────────────────────────────
  {
    id: 'KKPD-KLS-001', name: 'KKPD Pulau Laut', province: 'Kalimantan Selatan',
    district: 'Kab. Kotabaru', lat: -3.55, lng: 116.18,
    areaHa: 1850, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-08-12',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Kotabaru No. 522/2021',
    luasTotal: 210000, pengelola: 'DKP Kab. Kotabaru',
    statusPenetapan: 'ditetapkan', mangroveHa: 1850,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── KALIMANTAN TENGAH ──────────────────────────────────────────────────
  {
    id: 'KKPD-KLG-001', name: 'KKPD Kuala Pembuang', province: 'Kalimantan Tengah',
    district: 'Kab. Seruyan', lat: -3.02, lng: 112.58,
    areaHa: 3200, status: 'sedang', kawasan: 'hutan_lindung', lastSurvey: '2024-05-28',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Seruyan No. 188/2022',
    luasTotal: 110000, pengelola: 'DKP Kab. Seruyan',
    statusPenetapan: 'ditetapkan', mangroveHa: 3200,
    sumberData: 'SIKONSER KKP / GMW v3.0 JAXA 2024',
  },
  // ─── KALIMANTAN UTARA ───────────────────────────────────────────────────
  {
    id: 'KKPD-KLU-001', name: 'KKPD Pulau Sebatik', province: 'Kalimantan Utara',
    district: 'Kab. Nunukan', lat: 4.12, lng: 117.88,
    areaHa: 1600, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2024-09-18',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Nunukan No. 522/2020',
    luasTotal: 52000, pengelola: 'DKP Kab. Nunukan',
    statusPenetapan: 'ditetapkan', mangroveHa: 1600,
    sumberData: 'SIKONSER KKP / GMW v3.0 JAXA 2024',
  },
  // ─── SULAWESI BARAT ─────────────────────────────────────────────────────
  {
    id: 'KKPD-SLW-001', name: 'KKPD Teluk Mandar', province: 'Sulawesi Barat',
    district: 'Kab. Polewali Mandar', lat: -3.42, lng: 119.12,
    areaHa: 680, status: 'sedang', kawasan: 'konservasi', lastSurvey: '2024-07-02',
    tipeKawasan: 'KKPD', nomorSk: 'SK Gubernur Sulbar No. 660/2022',
    luasTotal: 45000, pengelola: 'DKP Prov. Sulawesi Barat',
    statusPenetapan: 'ditetapkan', mangroveHa: 680,
    sumberData: 'SIKONSER KKP 2024',
  },
  // ─── JAWA TENGAH ────────────────────────────────────────────────────────
  {
    id: 'KKPD-JTE-001', name: 'KKPD Ujungnegoro-Roban', province: 'Jawa Tengah',
    district: 'Kab. Batang', lat: -6.88, lng: 109.98,
    areaHa: 385, status: 'jarang', kawasan: 'hutan_lindung', lastSurvey: '2024-03-25',
    tipeKawasan: 'KKPD', nomorSk: 'SK Bupati Batang No. 523/2015',
    luasTotal: 1200, pengelola: 'DKP Kab. Batang',
    statusPenetapan: 'ditetapkan', mangroveHa: 385,
    sumberData: 'SIKONSER KKP 2024',
  },
];

/** Gabungkan lokasi mangrove reguler + KKPD untuk dropdown EcoTrack */
export function getAllLocationsWithKKPD(regularLocations: MangroveLocation[]): MangroveLocation[] {
  return [...regularLocations, ...kkpdLocations];
}
