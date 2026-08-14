# PROFIL INOVASI
## ID-MAP — Integrasi Data Mangrove dan Pesisir
### Cabang Dinas Kelautan dan Perikanan Kabupaten Malang

**Kategori:** Inovasi Pelayanan Publik / Tata Kelola Pemerintahan Berbasis Digital
**Tahun:** 2026
**Instansi:** Cabang Dinas Kelautan dan Perikanan (Cabdin KP) Kabupaten Malang, Provinsi Jawa Timur

---

## DAFTAR ISI

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Permasalahan](#2-latar-belakang--permasalahan)
3. [Dasar Hukum Penyusunan](#3-dasar-hukum-penyusunan)
4. [Deskripsi Inovasi](#4-deskripsi-inovasi)
5. [Tujuan & Manfaat](#5-tujuan--manfaat)
6. [Sasaran Pengguna](#6-sasaran-pengguna)
7. [Keunggulan & Kebaruan (Novelty)](#7-keunggulan--kebaruan-novelty)
8. [Fitur Utama Inovasi](#8-fitur-utama-inovasi)
9. [Tahapan Implementasi](#9-tahapan-implementasi)
10. [Dampak & Hasil](#10-dampak--hasil)
11. [Keberlanjutan (Sustainability)](#11-keberlanjutan-sustainability)
12. [Replikasi & Skalabilitas](#12-replikasi--skalabilitas)
13. [Dukungan Sumber Daya](#13-dukungan-sumber-daya)
14. [Penutup](#14-penutup)

---

## 1. Ringkasan Eksekutif

**ID-MAP (Integrasi Data Mangrove dan Pesisir)** adalah platform digital terpadu berbasis web dan Progressive Web App (PWA) yang dikembangkan oleh Cabang Dinas Kelautan dan Perikanan Kabupaten Malang. Inovasi ini menyatukan data lapangan, citra satelit, dan analisis spasial dalam satu antarmuka untuk memantau, memetakan, serta mendukung restorasi ekosistem mangrove dan pesisir.

ID-MAP menjawab tantangan pengelolaan data ekosistem pesisir yang selama ini terfragmentasi, manual, dan sulit diakses lintas pemangku kepentingan. Melalui pendekatan **offline-first**, **verifikasi berjenjang**, dan **visualisasi peta interaktif**, ID-MAP menghadirkan tata kelola data mangrove yang akuntabel, transparan, dan berbasis bukti (evidence-based).

Inovasi ini mendukung agenda **blue economy** yang lestari serta selaras dengan komitmen Indonesia dalam penetapan fungsi ekosistem mangrove sebagaimana diamanatkan **Permen LH/BPLH Nomor 8 Tahun 2026**.

---

## 2. Latar Belakang & Permasalahan

### 2.1 Kondisi Eksisting

Ekosistem mangrove di pesisir selatan Kabupaten Malang dan wilayah kerja Cabdin KP menghadapi tekanan yang terus meningkat: abrasi pantai, konversi tambak, penebangan liar, sedimentasi, hingga perambahan pemukiman. Di sisi lain, pengelolaan data untuk mendukung konservasi masih menghadapi kendala serius.

### 2.2 Identifikasi Masalah

| No | Permasalahan | Dampak |
|----|--------------|--------|
| 1 | Data survei lapangan tercatat manual (kertas/spreadsheet) | Rawan hilang, sulit diverifikasi, tidak real-time |
| 2 | Data tersebar di berbagai unit tanpa integrasi | Duplikasi, inkonsistensi, sulit diakses lintas OPD |
| 3 | Keterbatasan jaringan internet di lokasi survei pesisir | Petugas tidak bisa input data langsung di lapangan |
| 4 | Tidak ada mekanisme verifikasi data yang terstruktur | Kualitas data diragukan untuk pengambilan keputusan |
| 5 | Minimnya transparansi data kepada publik & mitra | Rendahnya partisipasi masyarakat & CSR korporasi |
| 6 | Belum ada visualisasi spasial yang mudah dipahami | Sulit menyusun prioritas restorasi berbasis lokasi |

### 2.3 Kebutuhan Solusi

Diperlukan sebuah sistem yang: (a) memungkinkan input data lapangan bahkan tanpa koneksi internet; (b) memiliki alur verifikasi berjenjang oleh tim ahli; (c) menyajikan data secara visual dan interaktif; dan (d) dapat diakses oleh berbagai kalangan pemangku kepentingan sesuai kewenangannya.

---

## 3. Dasar Hukum Penyusunan

Penyusunan dan pengembangan inovasi ID-MAP berlandaskan pada regulasi berikut:

### 3.1 Regulasi Utama

- **Peraturan Menteri Lingkungan Hidup / Badan Pengelola Lingkungan Hidup (Permen LH/BPLH) Nomor 8 Tahun 2026** tentang Pedoman Penetapan Fungsi Ekosistem Mangrove.

  > Melalui Permen LH/BPLH Nomor 8 Tahun 2026, Indonesia kini memiliki pedoman yang lebih jelas dalam menetapkan fungsi ekosistem mangrove. Regulasi ini menjadi acuan bagi ID-MAP dalam mengklasifikasikan status, fungsi, dan prioritas penanganan ekosistem mangrove secara terstandar di seluruh wilayah kerja.

### 3.2 Regulasi Pendukung

Inovasi ini juga selaras dan mendukung pelaksanaan ketentuan di bidang:

- Undang-Undang tentang Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil
- Undang-Undang tentang Kelautan
- Peraturan tentang Rehabilitasi dan Restorasi Ekosistem Mangrove Nasional
- Peraturan Daerah Provinsi Jawa Timur di bidang kelautan dan perikanan
- Peraturan tentang Satu Data Indonesia (Perpres Satu Data) sebagai landasan integrasi dan interoperabilitas data
- Regulasi tentang Sistem Pemerintahan Berbasis Elektronik (SPBE)

### 3.3 Kesesuaian dengan Permen LH/BPLH No. 8/2026

ID-MAP mengimplementasikan amanat regulasi tersebut melalui:

| Amanat Regulasi | Implementasi dalam ID-MAP |
|-----------------|---------------------------|
| Penetapan fungsi ekosistem mangrove yang jelas | Klasifikasi status mangrove: kritis, jarang, sedang, lebat |
| Data ekosistem yang terstandar | Form survei terstruktur dengan parameter baku |
| Basis pengambilan keputusan konservasi | Modul rekomendasi lokasi & prioritas restorasi |
| Pemantauan berkelanjutan | Monitoring multi-temporal & survei berkala |

---

## 4. Deskripsi Inovasi

### 4.1 Definisi

ID-MAP adalah **platform digital terintegrasi** yang mengelola siklus penuh data ekosistem mangrove dan pesisir: **observe → record → verify → understand → act** (amati → catat → verifikasi → pahami → tindak).

### 4.2 Empat Modul Inti

| Modul | Fungsi |
|-------|--------|
| **SPACEWATCH** | Pemantauan citra satelit Sentinel & Landsat multi-temporal untuk analisis perubahan tutupan mangrove |
| **ECOTRACK** | Input dan survei data lapangan berbasis mobile dengan kemampuan offline-first oleh petugas daerah |
| **BIOASSESS** | Analisis sensor lingkungan & biodiversitas — salinitas, pH, suhu, komposisi spesies pesisir |
| **RESTORASI** | Rekomendasi restorasi & kebijakan berbasis data spasial multi-sumber |

### 4.3 Teknologi yang Digunakan

Aplikasi dibangun dengan teknologi modern yang andal dan hemat biaya:

- **Frontend:** React + TypeScript (Progressive Web App)
- **Backend:** Convex (real-time serverless database)
- **Peta:** Leaflet dengan layer GeoJSON (konservasi, benthic, pola ruang laut)
- **Penyimpanan foto:** Cloudinary
- **Autentikasi:** Dual-track (staff internal & publik)
- **Fitur lapangan:** GPS otomatis, ekstraksi koordinat dari EXIF foto, OCR

---

## 5. Tujuan & Manfaat

### 5.1 Tujuan

1. Menyediakan satu sumber data ekosistem mangrove dan pesisir yang terpadu dan terpercaya
2. Mempercepat dan mempermudah proses input data lapangan oleh petugas
3. Menjamin kualitas data melalui verifikasi berjenjang oleh tim ahli
4. Menyajikan data secara transparan dan interaktif kepada publik dan mitra
5. Mendukung pengambilan keputusan konservasi berbasis bukti

### 5.2 Manfaat

**Bagi Pemerintah:**
- Efisiensi pengumpulan dan pengelolaan data
- Data akurat sebagai dasar kebijakan dan perencanaan restorasi
- Transparansi dan akuntabilitas tata kelola ekosistem

**Bagi Masyarakat & Mitra:**
- Akses terbuka terhadap data ekosistem pesisir
- Peluang partisipasi dalam konservasi
- Kemudahan bagi CSR korporasi untuk menyalurkan program restorasi tepat sasaran

**Bagi Lingkungan:**
- Percepatan restorasi mangrove pada lokasi prioritas
- Perlindungan habitat penyu dan biodiversitas pesisir
- Kontribusi terhadap penyerapan karbon (blue carbon)

---

## 6. Sasaran Pengguna

ID-MAP dirancang untuk melayani tiga kelompok sasaran utama dengan hak akses yang berbeda:

### 6.1 OPD Terkait (Organisasi Perangkat Daerah)

**Peran dalam sistem:** Admin & Verifikator

- Dinas Kelautan dan Perikanan (provinsi & kabupaten/kota)
- Dinas Lingkungan Hidup
- Badan Perencanaan Pembangunan Daerah (Bappeda)
- Instansi teknis pengelola pesisir dan konservasi

**Kebutuhan yang dilayani:**
- Input dan verifikasi data survei lapangan
- Akses data lengkap untuk perencanaan & penganggaran
- Koordinasi lintas sektor berbasis data yang sama
- Penyusunan laporan dan dokumen kebijakan

### 6.2 CSR Industri / Korporasi

**Peran dalam sistem:** Viewer (dengan akses data terbuka)

- Perusahaan dengan program Tanggung Jawab Sosial & Lingkungan (TJSL/CSR)
- Industri di kawasan pesisir
- Lembaga filantropi lingkungan

**Kebutuhan yang dilayani:**
- Identifikasi lokasi prioritas restorasi untuk program CSR
- Data transparan untuk pelaporan dampak lingkungan (ESG)
- Kolaborasi dengan pemerintah dalam pendanaan konservasi
- Pemantauan hasil program yang didanai

### 6.3 Pengguna Umum (Publik)

**Peran dalam sistem:** Viewer

- Masyarakat pesisir & kelompok pengawas (Pokmaswas)
- Akademisi, peneliti, dan mahasiswa
- Organisasi masyarakat sipil & LSM lingkungan
- Wisatawan dan masyarakat umum

**Kebutuhan yang dilayani:**
- Akses peta interaktif ekosistem mangrove & pesisir
- Edukasi dan peningkatan kesadaran konservasi
- Data terbuka untuk penelitian dan advokasi
- Transparansi kondisi lingkungan pesisir

### 6.4 Matriks Hak Akses per Sasaran

| Fitur | OPD (Admin/Verifikator) | CSR Korporasi | Publik |
|-------|:-:|:-:|:-:|
| Peta Interaktif | ✅ | ✅ | ✅ |
| Dashboard & Monitoring | ✅ | ✅ | ✅ |
| Download Data (CSV/GeoJSON/PDF) | ✅ | ✅ | ✅ |
| Input Data Lapangan | ✅ | ❌ | ❌ |
| Verifikasi Data | ✅ (Verifikator) | ❌ | ❌ |
| Data Kontak Pokmaswas Lengkap | ✅ | ❌ | ❌ (ter-mask) |
| Kelola Data Pembibitan | ✅ | ❌ | ❌ |

---

## 7. Keunggulan & Kebaruan (Novelty)

### 7.1 Aspek Kebaruan

| Aspek | Deskripsi Kebaruan |
|-------|--------------------|
| **Offline-First** | Petugas dapat menginput data di lokasi pesisir terpencil tanpa internet; data tersinkron otomatis saat online |
| **Verifikasi Berjenjang** | Alur verifikasi data (pending → approved/rejected) oleh verifikator sebelum data dipublikasikan |
| **Multi-Source Integration** | Menggabungkan data lapangan, citra satelit, dan layer spasial dalam satu platform |
| **GPS dari Foto (EXIF)** | Ekstraksi koordinat otomatis dari metadata foto lapangan |
| **Peta Interaktif Multi-Layer** | Layer mangrove, abrasi, penyu, Pokmaswas, kawasan konservasi dalam satu peta |
| **Akses Terbuka Bertingkat** | Data terbuka untuk publik & CSR, dengan proteksi data sensitif |

### 7.2 Perbandingan Sebelum & Sesudah Inovasi

| Aspek | Sebelum ID-MAP | Sesudah ID-MAP |
|-------|----------------|----------------|
| Metode pencatatan | Manual (kertas/spreadsheet) | Digital terstruktur & real-time |
| Ketersediaan di lapangan | Bergantung koneksi | Offline-first, sync otomatis |
| Kualitas data | Tidak terverifikasi | Verifikasi berjenjang oleh ahli |
| Akses publik | Tertutup | Terbuka & transparan |
| Visualisasi | Tabel statis | Peta interaktif & dashboard |
| Kolaborasi CSR | Sulit, tidak tersasar | Data prioritas terbuka |

---

## 8. Fitur Utama Inovasi

### 8.1 Untuk OPD (Admin & Verifikator)

- **Input Data Lapangan** dengan 3 tipe survei: monitoring mangrove/vegetasi, potensi & rekomendasi penanaman, titik pendaratan penyu
- **Verifikasi Data** dengan alur approve/reject dan catatan verifikasi
- **Manajemen Pokmaswas** (Kelompok Masyarakat Pengawas Konservasi)
- **Manajemen Pembibitan Mangrove** (nursery, kapasitas bibit, sertifikasi)
- **Cetak Berita Acara** survei lapangan otomatis
- **Dashboard Statistik** verifikasi & monitoring ekosistem

### 8.2 Untuk CSR & Publik (Viewer)

- **Peta Interaktif** ekosistem mangrove, abrasi, penyu, dan Pokmaswas
- **Dashboard Monitoring** kesehatan ekosistem
- **Download Data** dalam format CSV, GeoJSON, dan PDF
- **Analisis & Laporan** tren mangrove multi-temporal
- **Informasi Rekomendasi Lokasi** restorasi prioritas

---

## 9. Tahapan Implementasi

### 9.1 Roadmap Pengembangan

| Tahap | Kegiatan | Output |
|-------|----------|--------|
| **Tahap 1 — Perencanaan** | Identifikasi kebutuhan, kajian regulasi, desain sistem | Dokumen desain & dasar hukum |
| **Tahap 2 — Pengembangan** | Pembangunan aplikasi, integrasi data, pengujian | Aplikasi ID-MAP versi awal |
| **Tahap 3 — Uji Coba** | Piloting input data lapangan oleh petugas | Data survei awal & umpan balik |
| **Tahap 4 — Peluncuran** | Sosialisasi, pelatihan petugas, go-live | Platform operasional |
| **Tahap 5 — Pengembangan Lanjut** | Penambahan fitur, integrasi CSR, replikasi | Platform matang & tereplikasi |

### 9.2 Strategi Implementasi

1. **Sosialisasi** kepada OPD terkait dan pemangku kepentingan
2. **Pelatihan** petugas lapangan dalam penggunaan aplikasi
3. **Piloting** di lokasi terpilih (pesisir selatan Kab. Malang)
4. **Evaluasi berkala** dan perbaikan berkelanjutan
5. **Kemitraan** dengan korporasi untuk program CSR

---

## 10. Dampak & Hasil

### 10.1 Dampak Kuantitatif (Indikator)

- Jumlah lokasi mangrove yang terpantau
- Jumlah data survei yang terverifikasi
- Luas area mangrove dalam pemantauan (hektar)
- Jumlah titik pendaratan penyu yang terdata
- Jumlah kelompok Pokmaswas yang terintegrasi
- Jumlah kunjungan & pengguna platform

### 10.2 Dampak Kualitatif

- **Efisiensi:** Percepatan proses input dan pengelolaan data
- **Akuntabilitas:** Data terverifikasi dan dapat dipertanggungjawabkan
- **Transparansi:** Keterbukaan data kepada publik dan mitra
- **Partisipasi:** Peningkatan keterlibatan masyarakat & korporasi
- **Konservasi:** Percepatan restorasi mangrove pada lokasi prioritas

---

## 11. Keberlanjutan (Sustainability)

### 11.1 Aspek Kelembagaan

- Ditetapkan sebagai program resmi Cabdin KP Kabupaten Malang
- Dukungan regulasi (Permen LH/BPLH No. 8/2026 & regulasi daerah)
- Penunjukan tim pengelola (admin, verifikator, teknis)

### 11.2 Aspek Teknis

- Arsitektur serverless (Convex) yang hemat biaya & scalable
- Progressive Web App — tanpa perlu instalasi, ringan di perangkat mobile
- Kode sumber terkelola & dapat dikembangkan berkelanjutan

### 11.3 Aspek Pendanaan

- Efisiensi biaya operasional (teknologi cloud gratis/berbiaya rendah)
- Potensi pendanaan kolaboratif melalui skema CSR korporasi
- Dukungan APBD untuk pemeliharaan & pengembangan

---

## 12. Replikasi & Skalabilitas

### 12.1 Potensi Replikasi

ID-MAP dirancang modular sehingga dapat direplikasi ke:

- Cabang Dinas KP lain di Jawa Timur (Tuban, Blitar, Situbondo, dll)
- Provinsi lain dengan ekosistem mangrove & pesisir
- Skala nasional (modul Mangrove Nasional telah tersedia)

### 12.2 Skalabilitas

- **Data:** Arsitektur cloud mendukung pertumbuhan data tanpa batas signifikan
- **Pengguna:** Dapat melayani ribuan pengguna secara bersamaan
- **Fitur:** Modular — mudah menambah tipe survei & analisis baru
- **Wilayah:** Mendukung multi-provinsi & multi-unit kerja

---

## 13. Dukungan Sumber Daya

### 13.1 Sumber Daya Manusia

| Peran | Tugas |
|-------|-------|
| Petugas Lapangan (Admin) | Input data survei ekosistem |
| Verifikator | Verifikasi & validasi kualitas data |
| Admin Sistem | Pengelolaan platform & data master |
| Tim Teknis | Pemeliharaan & pengembangan aplikasi |

### 13.2 Sumber Daya Teknologi

- Infrastruktur cloud (Convex, Cloudinary)
- Perangkat mobile untuk petugas lapangan
- Koneksi internet (opsional, karena offline-first)

### 13.3 Mitra Strategis

- OPD terkait lintas sektor
- Korporasi mitra CSR
- Kelompok Masyarakat Pengawas (Pokmaswas)
- Akademisi & lembaga penelitian

---

## 14. Penutup

ID-MAP hadir sebagai jawaban atas kebutuhan tata kelola data ekosistem mangrove dan pesisir yang terintegrasi, akuntabel, dan transparan. Dengan landasan hukum yang kuat melalui **Permen LH/BPLH Nomor 8 Tahun 2026**, serta desain yang melayani kebutuhan **OPD, CSR korporasi, dan masyarakat umum**, inovasi ini tidak hanya menyelesaikan permasalahan pengelolaan data, tetapi juga membuka ruang kolaborasi multipihak untuk pelestarian ekosistem pesisir.

Melalui pendekatan digital yang inklusif dan berkelanjutan, ID-MAP menjadi kontribusi nyata Cabang Dinas Kelautan dan Perikanan Kabupaten Malang dalam mewujudkan **blue economy** yang lestari dan tata kelola pemerintahan yang inovatif berbasis data.

---

**© 2026 ID-MAP — Cabang Dinas Kelautan dan Perikanan Kabupaten Malang**

*Integrasi Data Mangrove dan Pesisir — Satu Platform untuk Konservasi Berkelanjutan*
