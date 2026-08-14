/**
 * Data Kelompok Masyarakat Pengawas Konservasi (POKMASWAS)
 * Wilayah Kerja Cabang Dinas Kelautan dan Perikanan Kabupaten Malang
 * Tahun 2022
 *
 * Sumber: Daftar Kelompok Masyarakat Pengawas Konservasi
 * di Wilayah Kerja Cabang Dinas Kelautan dan Perikanan Kabupaten Malang
 */

export interface PokmaswasRecord {
  id: string;
  no: number;
  kabupatenKota: string;
  nama: string;
  alamat: string;
  ketua: string;
  noHp: string;
  /** Koordinat default (geocoded dari alamat). Admin/verifikator bisa override. */
  lat: number;
  lng: number;
  /** Profil singkat (entri baru via form admin/Convex). */
  ruangLingkup?: string;
  kawasanPantai?: string;
  bidangCore?: string[];
  /** true bila berasal dari Convex (bukan seed statis) → bisa diedit penuh. */
  isCustom?: boolean;
}

export const pokmaswasData: PokmaswasRecord[] = [
  { id: 'PKM-001', no: 1, kabupatenKota: 'KAB. MALANG', nama: 'Licin Samudera Timur', alamat: 'Lebakharjo, Ampelgading', ketua: 'Tumiran / Soder', noHp: '62 823-3772-2446', lat: -8.4730, lng: 112.7940 },
  { id: 'PKM-002', no: 2, kabupatenKota: 'KAB. MALANG', nama: 'Bangkit', alamat: 'Pujiharjo, Tirtoyudo', ketua: 'Angga Prayoga', noHp: '62 823-3200-2525', lat: -8.4660, lng: 112.7200 },
  { id: 'PKM-003', no: 3, kabupatenKota: 'KAB. MALANG', nama: 'Bowele', alamat: 'Purwodadi, Tirtoyudo', ketua: 'Kasembadan / Agung', noHp: '62 856-4657-1392', lat: -8.4580, lng: 112.7100 },
  { id: 'PKM-004', no: 4, kabupatenKota: 'KAB. MALANG', nama: 'Sido Lestari', alamat: 'Sidoasri, Sumbermanjing Wetan', ketua: 'Sih Hariadi', noHp: '62 838-3465-8866', lat: -8.4370, lng: 112.6200 },
  { id: 'PKM-005', no: 5, kabupatenKota: 'KAB. MALANG', nama: 'Gatra Alam Lestari (GAL)', alamat: 'Sitiarjo, Sumbermanjing Wetan', ketua: 'Sumenggareng Budi L. / Enggar', noHp: '62 821-4054-6993', lat: -8.4350, lng: 112.6100 },
  { id: 'PKM-006', no: 6, kabupatenKota: 'KAB. MALANG', nama: 'Tamban Lestari', alamat: 'Tambakrejo, Sumbermanjing', ketua: 'Swasana Hari Darmawan', noHp: '62 822-2917-0413', lat: -8.4400, lng: 112.6300 },
  { id: 'PKM-007', no: 7, kabupatenKota: 'KAB. MALANG', nama: 'Gatra Olah Alam Lestari (GOAL)', alamat: 'Tambakrejo, Sumbermanjing Wetan', ketua: 'Saptoyo', noHp: '62 813-3377-7689', lat: -8.4410, lng: 112.6310 },
  { id: 'PKM-008', no: 8, kabupatenKota: 'KAB. MALANG', nama: 'Pilar Harapan', alamat: 'Gajahrejo, Gedangan', ketua: 'Sutari', noHp: '62 812-8741-3091', lat: -8.3940, lng: 112.5300 },
  { id: 'PKM-009', no: 9, kabupatenKota: 'KAB. MALANG', nama: 'Tumpakrejo', alamat: 'Tumpakrejo, Gedangan', ketua: 'Sunari', noHp: '62 812-3394-2330', lat: -8.3900, lng: 112.5200 },
  { id: 'PKM-010', no: 10, kabupatenKota: 'KAB. MALANG', nama: 'Menuju Masyarakat Sejahtera (MESRA)', alamat: 'Srigonco, Bantur', ketua: 'Fathkurozi', noHp: '62 812-1736-0867', lat: -8.3700, lng: 112.3800 },
  { id: 'PKM-011', no: 11, kabupatenKota: 'KAB. MALANG', nama: 'Mina Mulya', alamat: 'Sumberbening, Bantur', ketua: 'Galito / Bagio', noHp: '62 813-7967-9403', lat: -8.3750, lng: 112.3700 },
  { id: 'PKM-012', no: 12, kabupatenKota: 'KAB. MALANG', nama: 'Samudro Lestari', alamat: 'Kedungsalam, Donomulyo', ketua: 'Supiyat / Teguh', noHp: '62 858-6662-4886', lat: -8.3500, lng: 112.3200 },
  { id: 'PKM-013', no: 13, kabupatenKota: 'KAB. MALANG', nama: 'Trisakti', alamat: 'Rekesan, Kromengan', ketua: 'Sukamdi', noHp: '62 812-1867-3107', lat: -8.3400, lng: 112.3100 },
  { id: 'PKM-014', no: 14, kabupatenKota: 'KAB. MALANG', nama: 'Mina Abadi', alamat: 'Kaumrejo, Ngantang', ketua: 'Miskan', noHp: '62 823-3179-9143', lat: -7.8700, lng: 112.3600 },
  { id: 'PKM-015', no: 15, kabupatenKota: 'KAB. MALANG', nama: 'Singkil Park', alamat: 'Kalirejo, Kalipare', ketua: 'Muhammad Ya\'i', noHp: '62 812-3496-4309', lat: -8.2800, lng: 112.3500 },
  { id: 'PKM-016', no: 16, kabupatenKota: 'KAB. MALANG', nama: 'Singkil Park', alamat: 'Bendungrejo, Bantur', ketua: 'Alex Yusnanto', noHp: '', lat: -8.3600, lng: 112.3900 },
  { id: 'PKM-017', no: 17, kabupatenKota: 'KAB. MALANG', nama: 'Jonggring Saloko Asri', alamat: 'Mentaraman, Donomulyo', ketua: 'Suratno', noHp: '62 821-4336-3386', lat: -8.3450, lng: 112.3000 },
  { id: 'PKM-018', no: 18, kabupatenKota: 'KAB. MALANG', nama: 'Tirtamas', alamat: 'Sanankerto, Turen', ketua: 'Susiadi', noHp: '62 831-9290-6669', lat: -8.1800, lng: 112.6900 },
  { id: 'PKM-019', no: 19, kabupatenKota: 'KAB. MALANG', nama: 'Sari Mulyo', alamat: 'Pandan Mulyo, Tajinan', ketua: 'Kusnadi', noHp: '', lat: -8.0500, lng: 112.7200 },
  { id: 'PKM-020', no: 20, kabupatenKota: 'KAB. MALANG', nama: 'Sumber Barokah', alamat: 'Wringin Songo, Tumpang', ketua: 'Budi Purwoko', noHp: '', lat: -8.0000, lng: 112.7700 },
  { id: 'PKM-021', no: 21, kabupatenKota: 'KAB. PASURUAN', nama: 'Unggul Jaya', alamat: 'Desa Penunggul, Kec. Nguling', ketua: 'Sofwatun Nisa', noHp: '', lat: -7.6700, lng: 112.9800 },
  { id: 'PKM-022', no: 22, kabupatenKota: 'KAB. PASURUAN', nama: 'Alta Mina Lestari', alamat: 'Dsn. Lampean, Ds. Kedawang, Kec. Nguling', ketua: 'Amran Shodiq', noHp: '', lat: -7.6650, lng: 112.9750 },
  { id: 'PKM-023', no: 23, kabupatenKota: 'KAB. PASURUAN', nama: 'Jumpinang Berkarya', alamat: 'Desa Sumberrejo, Kec. Purwosari', ketua: 'Nanang Supriadi', noHp: '', lat: -7.7500, lng: 112.7300 },
  { id: 'PKM-024', no: 24, kabupatenKota: 'KAB. PASURUAN', nama: 'Tinang Mina Unggul', alamat: 'Desa Patuguran, Kec. Rejoso', ketua: 'Karyono', noHp: '', lat: -7.7200, lng: 112.8500 },
  { id: 'PKM-025', no: 25, kabupatenKota: 'KAB. PASURUAN', nama: 'Ranu Lestari', alamat: 'Dsn. Parasan, Ds. Grati Tunon', ketua: 'Suryanto', noHp: '', lat: -7.7400, lng: 112.8700 },
  { id: 'PKM-026', no: 26, kabupatenKota: 'KAB. PASURUAN', nama: 'Makmur Bahari', alamat: 'Ds. Jatirejo, Kec. Lekok', ketua: 'Achmad Sodik', noHp: '', lat: -7.6300, lng: 112.9200 },
  { id: 'PKM-027', no: 27, kabupatenKota: 'KAB. PASURUAN', nama: 'Damai Lestari', alamat: 'Ds. Semare, Kec. Kraton', ketua: 'H. M. Subroto', noHp: '', lat: -7.6400, lng: 112.9000 },
  { id: 'PKM-028', no: 28, kabupatenKota: 'KAB. PASURUAN', nama: 'Mina Abadi', alamat: 'Ds. Jatirejo, Kec. Lekok', ketua: 'Achmad Sodik', noHp: '', lat: -7.6310, lng: 112.9210 },
  { id: 'PKM-029', no: 29, kabupatenKota: 'KAB. PASURUAN', nama: 'Tinang Jaya Makmur', alamat: 'Ds. Jarangan, Kec. Rejoso', ketua: 'H. Adenan', noHp: '', lat: -7.7210, lng: 112.8510 },
  { id: 'PKM-030', no: 30, kabupatenKota: 'KAB. PASURUAN', nama: 'Kalianyer Sejahtera', alamat: 'Desa Kalianyer, Kec. Bangil', ketua: 'Farkhan, M.Pd.I', noHp: '', lat: -7.6000, lng: 112.7800 },
  { id: 'PKM-031', no: 31, kabupatenKota: 'KAB. PASURUAN', nama: 'Bina Sejahtera', alamat: 'Desa Raci, Kec. Bangil', ketua: 'H. ABD. Wahab', noHp: '', lat: -7.6050, lng: 112.7850 },
  { id: 'PKM-032', no: 32, kabupatenKota: 'KAB. PASURUAN', nama: 'Maju Lestari', alamat: 'Desa Watupraprat Kec. Nguling', ketua: 'Sineto', noHp: '', lat: -7.6680, lng: 112.9820 },
  { id: 'PKM-033', no: 33, kabupatenKota: 'KOTA PASURUAN', nama: 'Pokmaswas Sinar Pantura', alamat: 'Kelurahan Ngemplakrejo Kecamatan Panggungrejo', ketua: 'Nur Rohmad', noHp: '', lat: -7.6350, lng: 112.9050 },
  { id: 'PKM-034', no: 34, kabupatenKota: 'KOTA PASURUAN', nama: 'Pokmaswas Muara Indah', alamat: 'Kelurahan Panggungrejo Kecamatan Panggungrejo', ketua: 'Basori', noHp: '', lat: -7.6360, lng: 112.9060 },
  { id: 'PKM-035', no: 35, kabupatenKota: 'KAB. SIDOARJO', nama: 'Delta Hijau Lestari', alamat: 'Sidoarjo', ketua: 'H.M Syarif', noHp: '', lat: -7.4500, lng: 112.7200 },
  { id: 'PKM-036', no: 36, kabupatenKota: 'KAB. SIDOARJO', nama: 'Juanda Lestari', alamat: 'Desa Gisik Cemandi, Kec. Sedati', ketua: 'Drs. Abdul Haris', noHp: '', lat: -7.3800, lng: 112.7700 },
  { id: 'PKM-037', no: 37, kabupatenKota: 'KAB. SIDOARJO', nama: 'Akar Delta Ujung', alamat: 'Desa Kedung Pandan Jabon', ketua: 'Baldowi', noHp: '', lat: -7.5200, lng: 112.7800 },
  { id: 'PKM-038', no: 38, kabupatenKota: 'KAB. SIDOARJO', nama: 'Berantas Lestari', alamat: 'Desa Jeruk Legi Balongbendo', ketua: 'Mudjiadi', noHp: '', lat: -7.4800, lng: 112.6000 },
  { id: 'PKM-039', no: 39, kabupatenKota: 'KAB. SIDOARJO', nama: 'Tirto Mas', alamat: 'Desa Bogempinggir Balongbendo', ketua: 'Wahyu Ismawandik', noHp: '', lat: -7.4850, lng: 112.6050 },
  { id: 'PKM-040', no: 40, kabupatenKota: 'KAB. SIDOARJO', nama: 'Delta Samudra Timur', alamat: 'Dusun Tanjungsari Desa Kupang', ketua: 'Amin Tohari', noHp: '', lat: -7.4600, lng: 112.8000 },
  { id: 'PKM-041', no: 41, kabupatenKota: 'KAB. SIDOARJO', nama: 'Kalimas Surabaya', alamat: 'Desa Penambangan Balongbendo', ketua: 'Agum Salim', noHp: '', lat: -7.4750, lng: 112.5950 },
  { id: 'PKM-042', no: 42, kabupatenKota: 'KAB. SIDOARJO', nama: 'Pucuan', alamat: 'Dusun Pucuan Kel. Gebang', ketua: 'M. Zamroni', noHp: '', lat: -7.4400, lng: 112.7100 },
  { id: 'PKM-043', no: 43, kabupatenKota: 'KAB. SIDOARJO', nama: 'Lancar Jaya', alamat: 'Desa Bluru Kidul Sidoarjo', ketua: 'Lukman Fauzi', noHp: '', lat: -7.4550, lng: 112.7150 },
  { id: 'PKM-044', no: 44, kabupatenKota: 'KAB. SIDOARJO', nama: 'Ketingan Jaya', alamat: 'Dusun Kepetingan Desa Sawohan', ketua: 'Achmad Syafi\'i', noHp: '62 878-5162-9856', lat: -7.5000, lng: 112.8200 },
];
