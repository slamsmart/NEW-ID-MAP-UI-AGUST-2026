export interface DasarHukum {
  nomor: string;
  keterangan: string;
}

export interface KebijakanLokasi {
  locationId: string;
  prioritas: 1 | 2 | 3 | 4 | 5;
  statusRisiko: 'kritis' | 'perhatian' | 'baik';
  ringkasan: string;
  rekomendasiPendek: string[];   // 0–6 bulan
  rekomendasiMenengah: string[]; // 6–24 bulan
  rekomendasiPanjang: string[];  // > 24 bulan
  dasarHukum: DasarHukum[];
  targetCapaian: string;
  instansiPJ: string[];
  estimasiAnggaran: string;
  catatanKhusus: string;
}

export const kebijakanData: KebijakanLokasi[] = [
  {
    locationId: 'LOC-001',
    prioritas: 5,
    statusRisiko: 'baik',
    ringkasan: 'Ekosistem dalam kondisi sangat baik (skor 88). Kawasan konservasi berjalan efektif. Fokus pada pemeliharaan dan peningkatan monitoring.',
    rekomendasiPendek: [
      'Lakukan survei monitoring rutin semester I 2025 dengan cakupan 100% plot permanen',
      'Perbarui data baseline PMN di kawasan ini menggunakan Sentinel-2 terbaru',
      'Distribusikan 45.000 bibit Rhizophora ke lokasi penyangga yang membutuhkan',
    ],
    rekomendasiMenengah: [
      'Kembangkan program ekowisata mangrove berbasis masyarakat sebagai insentif konservasi',
      'Tingkatkan kapasitas kelompok masyarakat penjaga mangrove (MPA-Watch) menjadi 3 kelompok aktif',
      'Pasang 2 unit stasiun monitoring biofisik otomatis (sensor IoT salinitas + suhu)',
    ],
    rekomendasiPanjang: [
      'Usulkan perluasan zonasi inti kawasan seluas 200 ha berdasarkan analisis GMW multi-temporal',
      'Integrasikan kawasan ke dalam skema REDD+ nasional untuk pendanaan jangka panjang',
      'Bangun pusat penelitian mangrove bersama BRIN/IPB untuk basis data biodiversitas',
    ],
    dasarHukum: [
      { nomor: 'UU No. 5/1990', keterangan: 'Konservasi Sumber Daya Alam Hayati dan Ekosistemnya' },
      { nomor: 'PP No. 7/1999', keterangan: 'Pengawetan Jenis Tumbuhan dan Satwa' },
      { nomor: 'Permen LHK No. P.48/2017', keterangan: 'Tata Cara Permohonan dan Penetapan Kawasan Konservasi' },
    ],
    targetCapaian: 'Mempertahankan tutupan > 80% hingga 2027, skor kesehatan ≥ 90/100',
    instansiPJ: ['BKSDA Jawa Timur', 'Dinas KP Situbondo', 'BTNGN Baluran'],
    estimasiAnggaran: 'Rp 850 juta/tahun (monitoring + program masyarakat)',
    catatanKhusus: 'Kawasan ini layak dijadikan percontohan nasional untuk program REDD+ mangrove.',
  },
  {
    locationId: 'LOC-002',
    prioritas: 3,
    statusRisiko: 'perhatian',
    ringkasan: 'Tutupan sedang (61%) dengan status tenurial masih proses legal. Tekanan tambak di sekitar kawasan perlu dikelola segera.',
    rekomendasiPendek: [
      'Percepat penyelesaian konflik tenurial melalui mediasi BPKH wilayah setempat',
      'Pasang papan informasi batas kawasan hutan lindung di 5 titik strategis',
      'Lakukan pemetaan tambak ilegal menggunakan Sentinel-2 dan validasi lapangan',
    ],
    rekomendasiMenengah: [
      'Implementasikan program silvofishery pada 180 ha tambak yang berbatasan dengan kawasan',
      'Rehabilitasi 150 ha zona transisi dengan penanaman Avicennia marina',
      'Bentuk tim patroli gabungan DKP-BKSDA 2x/bulan untuk pengendalian tekanan',
    ],
    rekomendasiPanjang: [
      'Selesaikan sertifikasi tenurial lahan dan daftarkan ke Kementerian ATR/BPN',
      'Kembangkan model pengelolaan berbasis masyarakat (CBFM) untuk 3 desa sekitar',
      'Bangun nursery permanen kapasitas 50.000 bibit/siklus untuk kebutuhan restorasi lokal',
    ],
    dasarHukum: [
      { nomor: 'UU No. 41/1999', keterangan: 'Kehutanan (Hutan Lindung)' },
      { nomor: 'PP No. 23/2021', keterangan: 'Penyelenggaraan Kehutanan' },
      { nomor: 'Permen KKP No. 26/2016', keterangan: 'Perizinan Usaha Perikanan' },
    ],
    targetCapaian: 'Peningkatan tutupan ke 70% dalam 3 tahun, penyelesaian tenurial 2025',
    instansiPJ: ['Dinas KP Cilacap', 'BPHP Wilayah IX', 'Kantor ATR/BPN Cilacap'],
    estimasiAnggaran: 'Rp 1,4 miliar/tahun (rehabilitasi + mediasi tenurial)',
    catatanKhusus: 'Status tenurial adalah hambatan utama. Tanpa kepastian hukum, program restorasi sulit berkelanjutan.',
  },
  {
    locationId: 'LOC-003',
    prioritas: 5,
    statusRisiko: 'baik',
    ringkasan: 'Ekosistem pristine dengan skor 94/100 — terbaik di antara semua lokasi. Kawasan konservasi terlindungi dengan baik. Fokus pada pemeliharaan dan riset.',
    rekomendasiPendek: [
      'Pertahankan patroli rutin kawasan dengan frekuensi minimal 2x per minggu',
      'Update peta distribusi spesies mangrove menggunakan drone dan Sentinel-2 Q2 2025',
      'Verifikasi stok 80.000 bibit nursery Bintuni untuk distribusi ke kawasan defisit',
    ],
    rekomendasiMenengah: [
      'Usulkan ke UNESCO sebagai situs warisan alam dunia berbasis ekosistem mangrove',
      'Kembangkan karbon kredit mangrove melalui skema VCS (Verified Carbon Standard)',
      'Bangun program kolaborasi riset dengan lembaga internasional (CIFOR-ICRAF)',
    ],
    rekomendasiPanjang: [
      'Tetapkan 500 ha sebagai zona referensi ilmiah mutlak (no-take zone)',
      'Integrasikan ke jaringan pemantauan karbon biru ASEAN untuk referensi regional',
      'Kembangkan infrastruktur ekowisata premium berbasis alam tanpa merusak ekosistem',
    ],
    dasarHukum: [
      { nomor: 'UU No. 5/1990', keterangan: 'Konservasi SDAH' },
      { nomor: 'PP No. 60/2007', keterangan: 'Konservasi Sumber Daya Ikan' },
      { nomor: 'Perpres No. 120/2020', keterangan: 'Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil' },
    ],
    targetCapaian: 'Mempertahankan skor kesehatan ≥ 92/100, daftarkan ke skema karbon biru 2026',
    instansiPJ: ['BKSDA Papua Barat', 'Dinas KP Bintuni', 'Balai TN Teluk Cenderawasih'],
    estimasiAnggaran: 'Rp 600 juta/tahun (patroli + riset)',
    catatanKhusus: 'Potensi pendapatan dari karbon kredit dapat membiayai seluruh operasional kawasan.',
  },
  {
    locationId: 'LOC-004',
    prioritas: 1,
    statusRisiko: 'kritis',
    ringkasan: 'DARURAT: Tutupan tinggal 28%, indeks ancaman 8.9/10 akibat konversi tambak masif dan konflik tenurial. Membutuhkan intervensi segera.',
    rekomendasiPendek: [
      'SEGERA: Hentikan semua aktivitas konversi lahan dalam radius 2 km dari batas kawasan (penegakan hukum)',
      'Lakukan pemetaan tambak ilegal presisi tinggi menggunakan SAR Sentinel-1 dalam 30 hari',
      'Siapkan 5.000 bibit Avicennia marina untuk penanaman darurat pada habitat kritis',
      'Bentuk satgas penegakan hukum gabungan: DKP, BKSDA, Polhut, Polres Langkat',
    ],
    rekomendasiMenengah: [
      'Restorasi 200 ha lahan terdegradasi dengan metode penanaman hydrological restoration',
      'Selesaikan sengketa tenurial melalui pengadilan tingkat kabupaten dalam 12 bulan',
      'Ganti mata pencaharian masyarakat sekitar dengan budidaya silvofishery (tambak ramah mangrove)',
      'Bangun pagar hidup Rhizophora apiculata sepanjang 8 km sebagai buffer zone',
    ],
    rekomendasiPanjang: [
      'Ubah status kawasan dari APL ke Hutan Lindung melalui revisi RTRW Kabupaten Langkat',
      'Kembangkan program kompensasi bagi pemilik lahan yang bersedia mengembalikan ke mangrove',
      'Pasang sistem early warning berbasis IoT untuk deteksi pembukaan lahan ilegal real-time',
    ],
    dasarHukum: [
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil' },
      { nomor: 'PP No. 26/2008 jo. 13/2017', keterangan: 'RTRWN (kewajiban perlindungan pesisir)' },
      { nomor: 'Permen KKP No. 23/2016', keterangan: 'Pengelolaan Sumber Daya Pesisir' },
      { nomor: 'UU No. 32/2009', keterangan: 'Perlindungan dan Pengelolaan Lingkungan Hidup' },
    ],
    targetCapaian: 'Hentikan degradasi dalam 3 bulan, tingkatkan tutupan ke 45% dalam 2 tahun',
    instansiPJ: ['Dinas KP Sumatera Utara', 'BKSDA Sumatera Utara', 'Satpol PP Langkat', 'Kejari Langkat'],
    estimasiAnggaran: 'Rp 4,5 miliar (restorasi darurat) + Rp 1,2 miliar/tahun operasional',
    catatanKhusus: 'PRIORITAS TERTINGGI NASIONAL. Tanpa intervensi dalam 6 bulan, ekosistem akan sulit dipulihkan. Diperlukan koordinasi lintas kementerian (KKP + KLHK + ATR/BPN).',
  },
  {
    locationId: 'LOC-005',
    prioritas: 2,
    statusRisiko: 'kritis',
    ringkasan: 'Tutupan jarang (44%) dengan sedimentasi tinggi dari aktivitas pertambangan hulu. Tambak 350 ha memberi tekanan signifikan terhadap zona penyangga.',
    rekomendasiPendek: [
      'Audit perizinan seluruh tambak dalam radius 5 km dari kawasan mangrove',
      'Koordinasi dengan Dinas ESDM Kaltim terkait pengendalian sedimentasi dari tambang',
      'Pasang sediment trap dan barrier di muara-muara kritis untuk kurangi kekeruhan',
    ],
    rekomendasiMenengah: [
      'Restorasi 300 ha dengan metode Mangrove Propagule Stranding untuk zona sedimentasi tinggi',
      'Implementasikan buffer zone silvofishery pada 100 ha tambak yang paling kritis',
      'Lakukan pengerukan sedimen di 3 titik estuari yang mengalami pendangkalan kritis',
    ],
    rekomendasiPanjang: [
      'Susun Kajian Lingkungan Hidup Strategis (KLHS) untuk DAS Mahakam komprehensif',
      'Integrasikan ke Rencana Pengelolaan Wilayah Pesisir (RZWP3K) Provinsi Kaltim',
      'Kembangkan sistem peringatan dini kekeruhan berbasis sensor IoT di 5 stasiun sungai',
    ],
    dasarHukum: [
      { nomor: 'UU No. 32/2009', keterangan: 'Perlindungan Lingkungan Hidup' },
      { nomor: 'PP No. 22/2021', keterangan: 'Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan' },
      { nomor: 'Perda Kaltim No. 1/2016', keterangan: 'RTRW Provinsi Kalimantan Timur' },
    ],
    targetCapaian: 'Kurangi indeks ancaman ke < 5 dalam 18 bulan, tingkatkan tutupan ke 60% dalam 3 tahun',
    instansiPJ: ['Dinas KP Kaltim', 'Dinas ESDM Kaltim', 'BKSDA Kaltim', 'BBWS Mahakam'],
    estimasiAnggaran: 'Rp 2,8 miliar/tahun (restorasi + monitoring + koordinasi antar sektor)',
    catatanKhusus: 'Kunci keberhasilan adalah koordinasi antar sektor, terutama pengendalian pertambangan hulu DAS Mahakam.',
  },
  {
    locationId: 'LOC-006',
    prioritas: 3,
    statusRisiko: 'perhatian',
    ringkasan: 'Kondisi sedang dalam kawasan konservasi. Program restorasi berjalan baik. Perlu percepatan untuk memenuhi target 2027.',
    rekomendasiPendek: [
      'Tingkatkan kapasitas nursery Bontang dari 25.000 menjadi 40.000 bibit/siklus',
      'Perkuat patroli kawasan dengan tambahan 2 pos jaga di titik rawan akses',
      'Lakukan penilaian kualitas tanam (survival rate) pada area restorasi 2023-2024',
    ],
    rekomendasiMenengah: [
      'Perluasan area restorasi 250 ha ke zona jarang di batas selatan kawasan',
      'Program penghijauan partisipatif melibatkan 5 desa sekitar TN Kutai',
      'Pasang 3 unit kamera trap dan sistem monitoring biodiversitas fauna pesisir',
    ],
    rekomendasiPanjang: [
      'Perluas zonasi kawasan ke area penyangga seluas 400 ha di sisi timur',
      'Kembangkan program karbon biru bersama WWF Indonesia dan IUCN',
      'Susun rencana pengelolaan 10 tahun berbasis adaptive management',
    ],
    dasarHukum: [
      { nomor: 'UU No. 5/1990', keterangan: 'Konservasi SDAH' },
      { nomor: 'SK Menhut No. 419/2004', keterangan: 'Penetapan TN Kutai' },
    ],
    targetCapaian: 'Tutupan 78% dalam 2 tahun, skor kesehatan ≥ 80/100 pada 2027',
    instansiPJ: ['BBTN Kutai', 'Dinas KP Kaltim', 'Pemkab Kutai Timur'],
    estimasiAnggaran: 'Rp 1,6 miliar/tahun',
    catatanKhusus: 'Potensi konflik dengan masyarakat perlu dikelola via program benefit sharing yang jelas.',
  },
  {
    locationId: 'LOC-007',
    prioritas: 5,
    statusRisiko: 'baik',
    ringkasan: 'Ekosistem pristine (skor 92/100) di kawasan konservasi Raja Ampat. Indeks ancaman sangat rendah. Lanjutkan pemeliharaan dan kembangkan nilai konservasi.',
    rekomendasiPendek: [
      'Pertahankan intensitas patroli laut yang sudah berjalan efektif',
      'Update inventarisasi spesies mangrove dan fauna asosiasi Q2 2025',
      'Koordinasi dengan pengelola resort wisata untuk protokol zero-impact mangrove',
    ],
    rekomendasiMenengah: [
      'Daftarkan kawasan ke database Mangrove Alliance untuk Globally Significant Area',
      'Kembangkan paket wisata selam-mangrove premium dengan nilai konservasi terintegrasi',
      'Pasang mooring buoy di 10 titik untuk mencegah kerusakan oleh jangkar kapal',
    ],
    rekomendasiPanjang: [
      'Integrasikan pengelolaan mangrove ke dalam masterplan ekowisata Raja Ampat 2030',
      'Ajukan ke UNESCO Biosphere Reserve sebagai site baru bersama kawasan Raja Ampat lainnya',
      'Bangun dana abadi konservasi (endowment fund) dari retribusi wisata untuk mangrove',
    ],
    dasarHukum: [
      { nomor: 'UU No. 5/1990', keterangan: 'Konservasi SDAH' },
      { nomor: 'Perda Papua Barat No. 10/2011', keterangan: 'Kawasan Konservasi Perairan Raja Ampat' },
    ],
    targetCapaian: 'Pertahankan skor ≥ 90/100, nol degradasi hingga 2030',
    instansiPJ: ['BKSDA Papua Barat', 'Pemkab Raja Ampat', 'Dinas KP Papua Barat'],
    estimasiAnggaran: 'Rp 700 juta/tahun (patroli + monitoring + wisata terpadu)',
    catatanKhusus: 'Kawasan ini adalah aset nasional. Koordinasi ketat dengan operator wisata internasional wajib.',
  },
  {
    locationId: 'LOC-008',
    prioritas: 1,
    statusRisiko: 'kritis',
    ringkasan: 'DARURAT: Skor terendah (18/100), indeks ancaman tertinggi (9.3/10). Tambak ilegal 580 ha mengancam kelangsungan ekosistem. Intervensi hukum dan restorasi mendesak.',
    rekomendasiPendek: [
      'SEGERA: Tindak 100% tambak ilegal melalui Operasi Gabungan dalam 60 hari pertama',
      'Koordinasi PPNS KKP untuk penyidikan pelanggaran kawasan pesisir',
      'Pemetaan kerusakan presisi menggunakan Sentinel-1 SAR untuk identifikasi prioritas pulih',
      'Amankan 3.500 bibit tersisa di nursery untuk penanaman segera di area kritis',
    ],
    rekomendasiMenengah: [
      'Restorasi bertahap 300 ha dengan kombinasi penanaman dan natural regeneration',
      'Tata batas kawasan ulang dengan patok permanen dan sistem GPS tracking',
      'Rehabilitasi muara dan saluran air untuk mendukung pemulihan hidrologi mangrove',
      'Program relokasi nelayan liar dengan skema budidaya legal di lokasi yang ditetapkan',
    ],
    rekomendasiPanjang: [
      'Ubah status kawasan APL menjadi Kawasan Lindung melalui RTRW Kabupaten Tanah Bumbu',
      'Bangun pusat pembibitan terpadu kapasitas 100.000 bibit/siklus untuk mendukung restorasi',
      'Pasang sistem IoT early warning 24 jam untuk deteksi aktivitas illegal di kawasan',
    ],
    dasarHukum: [
      { nomor: 'UU No. 45/2009 jo. 31/2004', keterangan: 'Perikanan (larangan pengrusakan habitat)' },
      { nomor: 'UU No. 32/2009', keterangan: 'Perlindungan Lingkungan Hidup' },
      { nomor: 'PP No. 60/2007', keterangan: 'Konservasi Sumber Daya Ikan' },
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'PWP3K — larangan perusakan mangrove' },
    ],
    targetCapaian: 'Hentikan degradasi dalam 2 bulan, tutupan 40% dalam 2 tahun',
    instansiPJ: ['Dinas KP Kalimantan Selatan', 'PPNS KKP', 'Polhut BKSDA Kalsel', 'Pemkab Tanah Bumbu'],
    estimasiAnggaran: 'Rp 5,2 miliar (penegakan + restorasi darurat) + Rp 1,5 miliar/tahun operasional',
    catatanKhusus: 'PRIORITAS 1 BERSAMA LOC-004. Kasus ini harus dibawa ke tingkat Gugus Tugas Penegakan Hukum Lingkungan Kementerian.',
  },
  {
    locationId: 'LOC-009',
    prioritas: 2,
    statusRisiko: 'perhatian',
    ringkasan: 'Kawasan hutan lindung dengan tutupan jarang (38%) akibat dampak gempa 2018 dan tekanan tambak. Proses pemulihan berlangsung lambat.',
    rekomendasiPendek: [
      'Lakukan asesmen dampak gempa 2018 terhadap ekosistem mangrove secara menyeluruh',
      'Koordinasi BNPB/BPBD untuk integrasi mangrove dalam program rehabilitasi pasca bencana',
      'Siapkan 7.000 bibit Avicennia marina yang toleran terhadap kondisi substrat pasir',
    ],
    rekomendasiMenengah: [
      'Restorasi 150 ha dengan prioritas zonasi yang terdampak gempa',
      'Implementasikan teknik penanaman adaptif pada substrat pasir yang dominan',
      'Selesaikan proses legal tenurial dan pastikan tidak ada tumpang tindih kawasan',
    ],
    rekomendasiPanjang: [
      'Integrasikan kawasan ke dalam Rencana Rehabilitasi Pascabencana Sulawesi Tengah',
      'Kembangkan koridor hijau mangrove sepanjang pesisir Teluk Palu 15 km',
      'Susun kajian ketahanan ekosistem mangrove terhadap tsunami dan gempa untuk referensi nasional',
    ],
    dasarHukum: [
      { nomor: 'UU No. 24/2007', keterangan: 'Penanggulangan Bencana' },
      { nomor: 'PP No. 21/2008', keterangan: 'Penyelenggaraan Penanggulangan Bencana' },
      { nomor: 'UU No. 41/1999', keterangan: 'Kehutanan (Hutan Lindung)' },
    ],
    targetCapaian: 'Tutupan 55% dalam 2 tahun, penyelesaian tenurial 2025',
    instansiPJ: ['Dinas KP Sulawesi Tengah', 'BPBD Palu', 'BPHP Wilayah XV', 'KPH Palu'],
    estimasiAnggaran: 'Rp 2,1 miliar/tahun (terintegrasi dengan dana rehabilitasi bencana)',
    catatanKhusus: 'Manfaatkan alokasi anggaran rehabilitasi pasca gempa 2018 untuk percepatan restorasi mangrove.',
  },
  {
    locationId: 'LOC-010',
    prioritas: 2,
    statusRisiko: 'kritis',
    ringkasan: 'Tutupan kritis (25%) dengan abrasi pantai aktif. Konflik tenurial menghambat program restorasi. Diperlukan pendekatan hukum dan sosial secara simultan.',
    rekomendasiPendek: [
      'Pasang breakwater sementara (cerucuk bambu) di 3 titik abrasi terparah untuk stabilisasi garis pantai',
      'Mediasi konflik tenurial difasilitasi Kantor ATR/BPN Lombok Barat dalam 60 hari',
      'Distribusi 4.200 bibit Sonneratia alba untuk penanaman di zona terdepan (adaptif salinitas tinggi)',
    ],
    rekomendasiMenengah: [
      'Restorasi 80 ha kawasan pesisir prioritas dengan metode 3-stage planting',
      'Bangun breakwater permanen berbasis batu kali di 2 titik abrasi kritis',
      'Sertifikasi lahan dan daftar ke program hibah restorasi KKP/KLHK',
    ],
    rekomendasiPanjang: [
      'Integrasikan kawasan ke dalam RZWP3K Provinsi NTB 2025–2045',
      'Kembangkan program wisata mangrove Lombok Barat sebagai destinasi konservasi berbasis lokal',
      'Pasang sistem monitoring abrasi otomatis berbasis GPS dan sensor gelombang',
    ],
    dasarHukum: [
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'Pengelolaan Wilayah Pesisir' },
      { nomor: 'Perda NTB No. 12/2017', keterangan: 'RTRW Provinsi NTB' },
      { nomor: 'Permen KKP No. 21/2018', keterangan: 'Rencana Zonasi Wilayah Pesisir dan Pulau-Pulau Kecil' },
    ],
    targetCapaian: 'Hentikan abrasi dalam 6 bulan, tutupan 45% dalam 2 tahun, penyelesaian tenurial 2025',
    instansiPJ: ['Dinas KP NTB', 'Kantor ATR/BPN Lombok Barat', 'Bappeda NTB', 'BWSNT-I'],
    estimasiAnggaran: 'Rp 3,2 miliar (breakwater + restorasi) + Rp 800 juta/tahun operasional',
    catatanKhusus: 'Abrasi aktif akan terus mengancam kawasan pemukiman seluas 2 km² jika mangrove tidak segera dipulihkan.',
  },
];
