# PEDOMAN TEKNIS APLIKASI ID-MAP
## Integrasi Data Mangrove dan Pesisir — Cabdin KP Kabupaten Malang

**Versi:** 1.0
**Terakhir diperbarui:** Juli 2025
**Oleh:** Cabang Dinas Kelautan dan Perikanan Kabupaten Malang

---

## DAFTAR ISI

1. [Pendahuluan](#1-pendahuluan)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Struktur Basis Data](#3-struktur-basis-data)
4. [Aktor & Role Pengguna](#4-aktor--role-pengguna)
5. [Fitur & Alur Fungsional](#5-fitur--alur-fungsional)
6. [Pedoman untuk Role Viewer (Publik)](#6-pedoman-untuk-role-viewer-publik)
7. [Pedoman untuk Role Admin](#7-pedoman-untuk-role-admin)
8. [Pedoman untuk Role Verifikator](#8-pedoman-untuk-role-verifikator)
9. [Alur Verifikasi Data](#9-alur-verifikasi-data)
10. [Alur Sinkronisasi Offline](#10-alur-sinkronisasi-offline)
11. [Keamanan & Otentikasi](#11-keamanan--otentikasi)
12. [Konfigurasi Lingkungan](#12-konfigurasi-lingkungan)
13. [Pemeliharaan & Monitoring](#13-pemeliharaan--monitoring)

---

## 1. Pendahuluan

### 1.1 Latar Belakang

ID-MAP (Integrasi Data Mangrove dan Pesisir) adalah platform terpadu yang dikelola oleh Cabang Dinas Kelautan dan Perikanan (Cabdin KP) Kabupaten Malang untuk memantau, memetakan, serta mendukung restorasi ekosistem mangrove dan pesisir di wilayah kerja Jawa Timur.

### 1.2 Tujuan

- Menyediakan satu platform terintegrasi untuk data mangrove dan pesisir
- Memfasilitasi input data lapangan secara offline-first oleh petugas daerah
- Menyediakan mekanisme verifikasi data oleh tim ahli sebelum publikasi
- Menampilkan visualisasi spasial interaktif berbasis peta
- Mendukung pengambilan keputusan berbasis bukti untuk konservasi

### 1.3 Stack Teknologi

| Komponen | Teknologi |
|----------|-----------|
| **Frontend** | React 19 + TypeScript + Vite 8 |
| **Styling** | Tailwind CSS 3 |
| **Peta** | Leaflet + React-Leaflet |
| **Backend/Database** | Convex (real-time, serverless) |
| **Autentikasi Admin** | Hardcoded credentials (username/password) |
| **Autentikasi Publik** | Clerk (Google, TikTok, X) |
| **Penyimpanan Foto** | Cloudinary |
| **PDF/OCR** | Tesseract.js (client-side OCR) |
| **Charts** | Recharts |
| **Layanan Email** | EmailJS (OTP) |
| **Deploy** | Vercel / Netlify |
| **PWA** | vite-plugin-pwa + Workbox |

---

## 2. Arsitektur Sistem

### 2.1 Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER (Client)                         │
│  ┌───────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐ │
│  │ React App  │  │ Leaflet  │  │  Recharts  │  │  PWA     │ │
│  │ (SPA)      │  │ Map      │  │  Charts    │  │  Shell   │ │
│  └─────┬─────┘  └────┬─────┘  └─────┬──────┘  └────┬─────┘ │
│        │              │              │               │        │
│  ┌─────┴─────────────────────────────────────────────┴─────┐ │
│  │                  Convex Client SDK                        │ │
│  │           (Real-time sync / Offline Queue)                │ │
│  └──────────────────────────┬───────────────────────────────┘ │
└─────────────────────────────┼─────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                    Convex Backend (Serverless)                  │
│  ┌──────────────────────────┴───────────────────────────────┐ │
│  │                    Convex Database                         │ │
│  │  ┌──────────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐  │ │
│  │  │   Surveys    │ │ Locations│ │ Profiles│ │Pokmaswas │  │ │
│  │  └──────────────┘ └──────────┘ └────────┘ └──────────┘  │ │
│  │  ┌──────────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐  │ │
│  │  │ OTP Logs     │ │ Stats    │ │Nurseries│ │Photos    │  │ │
│  │  └──────────────┘ └──────────┘ └────────┘ └──────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Convex Functions (Mutations/Queries)         │ │
│  │    stats.ts, surveys.ts, locations.ts, pokmaswas.ts      │ │
│  │    nurseries.ts, profiles.ts, otpLogs.ts                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                      │
┌───────┴───────┐    ┌───────┴───────┐    ┌─────────┴─────────┐
│   Cloudinary   │    │    Clerk      │    │    EmailJS        │
│  (Foto/Gambar) │    │ (Auth Publik) │    │ (OTP Email)       │
└───────────────┘    └───────────────┘    └───────────────────┘
```

### 2.2 Alur Data Utama

1. **Petugas lapangan** (Admin) melakukan survei via form Input Lapangan
2. Data disimpan ke **localStorage** (offline-first) dan antrian Convex
3. **Verifikator** membuka halaman Verifikasi Data untuk review
4. Data diverifikasi (approved/rejected) dan status diperbarui
5. Data yang sudah diverifikasi muncul di Dashboard dan Peta Publik
6. **Publik** (Viewer) dapat melihat data via peta interaktif tanpa login

---

## 3. Struktur Basis Data

### 3.1 Convex Schema — Ringkasan Tabel

| Tabel | Deskripsi | Key Index |
|-------|-----------|-----------|
| `userProfiles` | Profil user publik (sinkron Clerk) | `by_clerk`, `by_email` |
| `mangroveLocations` | Data lokasi mangrove | `by_legacy`, `by_province`, `by_custom` |
| `surveys` | Data survei utama (5 tipe) | `by_legacy`, `by_tujuan`, `by_verification` |
| `surveyPhotos` | Metadata foto survei (Cloudinary) | `by_survey` |
| `customNurseries` | Data pembibitan mangrove | `by_legacy`, `by_active` |
| `otpLogs` | Audit trail OTP EmailJS | `by_email` |
| `siteStats` | Counter agregat statistik | `by_key` |
| `pokmaswas` | Kelompok Masyarakat Pengawas | `by_legacy`, `by_kab`, `by_no` |

### 3.2 Detail Tabel `surveys`

Tabel utama yang menyimpan data survei lapangan dengan 5 tujuan survei:

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `legacyId` | string | ID unik (contoh: SRV-1719000000000) |
| `tujuanSurvei` | enum | `monitoring`, `potensi_penanaman`, `abrasi`, `monitoring_vegetasi`, `pendaratan_penyu` |
| `petugasNama` | string | Nama petugas lapangan |
| `petugasNip` | string? | NIP petugas (opsional) |
| `petugasUnit` | string | Unit kerja (Cabdin KP) |
| `tanggal` | string | Tanggal survei |
| `locationId` | string? | ID lokasi mangrove |
| `locationName` | string | Nama lokasi |
| `province` | string | Provinsi |
| `kabKota` | string? | Kabupaten/Kota |
| `koordinatLat` | number? | Latitude (GPS) |
| `koordinatLng` | number? | Longitude (GPS) |
| `gpsAccuracy` | number? | Akurasi GPS (meter) |
| `googleMapsUrl` | string? | Link Google Maps |
| `tutupanTajuk` | number? | Persentase tutupan tajuk |
| `kerapatanEstimasi` | number? | Estimasi kerapatan pohon/ha |
| `spesiesDominan` | string? | Spesies mangrove dominan |
| `spesiesLain` | string? | Spesies mangrove lain |
| `salinitas` | number? | Salinitas (ppt) |
| `ph` | number? | pH air |
| `suhu` | number? | Suhu air (°C) |
| `substrat` | string? | Jenis substrat |
| `ancamanUtama` | string[] | Array ancaman |
| `statusTenurial` | string? | Status lahan |
| `kondisiUmum` | string? | Catatan kondisi umum |
| `rekomendasiLapangan` | string? | Rekomendasi petugas |
| `jenisPenyu` | string? | Jenis penyu (untuk pendaratan_penyu) |
| `jumlahSarang` | number? | Jumlah sarang penyu |
| `sarangPoints` | array | Array titik sarang [{lat,lng,fotoUrl}] |
| `fotoDokumentasi` | string? | URL foto utama |
| `photoUrls` | string[] | Array URL foto |
| `verificationStatus` | enum | `pending` / `approved` / `rejected` |
| `verificationNote` | string? | Catatan verifikasi |
| `verifiedBy` | string? | Nama verifikator |
| `verifiedAt` | string? | Timestamp verifikasi |
| `syncStatus` | enum | `synced` / `pending` / `failed` |

### 3.3 Validasi Status

```typescript
// Role pengguna
roleValidator = 'viewer' | 'petugas_daerah' | 'admin_nasional' | 'admin' | 'verifikator'

// Status mangrove
mangroveStatusValidator = 'kritis' | 'jarang' | 'sedang' | 'lebat'

// Status verifikasi survei
verificationStatusValidator = 'pending' | 'approved' | 'rejected'

// Status sinkronisasi
syncStatusValidator = 'synced' | 'pending' | 'failed'
```

---

## 4. Aktor & Role Pengguna

### 4.1 Tabel Role & Hak Akses

| Fitur / Halaman | Viewer (Publik) | Petugas Daerah | Admin | Verifikator |
|-----------------|:-:|:-:|:-:|:-:|
| Landing Page | ✅ | ✅ | ✅ | ✅ |
| Peta Publik | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Monitoring Ekosistem | ✅ | ✅ | ✅ | ✅ |
| Vegetasi Mangrove | ✅ | ✅ | ✅ | ✅ |
| Pendaratan Penyu | ✅ | ✅ | ✅ | ✅ |
| Rekomendasi Lokasi | ✅ | ✅ | ✅ | ✅ |
| Pembibitan Mangrove | ✅ | ✅ | ✅ | ✅ |
| Tekanan Sosial | ✅ | ✅ | ✅ | ✅ |
| Analisis Lingkungan | ✅ | ✅ | ✅ | ✅ |
| Laporan | ✅ | ✅ | ✅ | ✅ |
| **Input Lapangan** | ❌ | ❌ | ✅ | ✅ |
| **Data Pokmaswas** | ❌ | ❌ | ✅ | ✅ |
| **Mangrove Nasional** | ❌ | ❌ | ✅ | ❌ |
| **Verifikasi Data** | ❌ | ❌ | ❌ | ✅ |

### 4.2 Role Viewer (Publik)

- **Autentikasi:** Clerk (Google, TikTok, X) atau tanpa login
- **Akses:** Semua halaman read-only kecuali Input Lapangan, Pokmaswas, Verifikasi
- **Halaman khusus:** Peta interaktif publik, Dashboard monitoring
- **Batasan:** Tidak bisa input/edit data. Nomor HP Pokmaswas di-mask.

### 4.3 Role Admin

- **Autentikasi:** Login form username + password (hardcoded)
- **Akses penuh:** Semua fitur kecuali Verifikasi Data
- **Tugas utama:** Input data lapangan, kelola Pokmaswas, kelola pembibitan
- **Unit kerja:** Terdaftar di `ADMIN_ACCOUNTS` (Cabdin KP Kab Malang, Tuban, Blitar, Situbondo)

### 4.4 Role Verifikator

- **Autentikasi:** Login form username + password (hardcoded)
- **Akses:** Semua fitur Admin + Verifikasi Data
- **Tugas utama:** Memverifikasi data survei yang diinput Admin, menyetujui atau menolak
- **Kewenangan:** Mengubah status verifikasi data survei

### 4.5 Akun Default

Akun admin/verifikator didefinisikan di `src/context/authAccounts.ts` (hardcoded):

| Username | Nama | Role |
|----------|------|------|
| (terdefinisi di file konfigurasi) | Admin Cabdin | `admin` |
| (terdefinisi di file konfigurasi) | Verifikator Cabdin | `verifikator` |

> **Catatan Keamanan:** Credentials disimpan sebagai kode keras (hardcoded) pada file `authAccounts.ts`. Untuk produksi, sebaiknya migrasi ke database terenkripsi atau identity provider.

---

## 5. Fitur & Alur Fungsional

### 5.1 Daftar Halaman & Routing

| Path | Halaman | Komponen | Route Guard |
|------|---------|----------|-------------|
| `/` | Landing Page | `LandingPage` | Publik |
| `/peta` | Peta Interaktif | `PetaPublik` | Publik |
| `/login` | Login Admin/Verifikator | `Login` | Publik |
| `/dashboard` | Dashboard Utama | `Dashboard` | Login required |
| `/ekosistem` | Monitoring Ekosistem | `MonitoringEkosistem` | Login required |
| `/input-lapangan` | Input Data Lapangan | `InputLapangan` | Admin + Verifikator |
| `/rekomendasi-lokasi` | Rekomendasi Lokasi | `RekomendasiLokasi` | Login required |
| `/vegetasi-mangrove` | Vegetasi Mangrove | `VegetasiMangrove` | Login required |
| `/pendaratan-penyu` | Pendaratan Penyu | `PendaratanPenyu` | Login required |
| `/verifikasi-data` | Verifikasi Data | `VerifikasiData` | **Verifikator only** |
| `/data-pokmaswas` | Data Pokmaswas | `DataPokmaswas` | Admin + Verifikator |
| `/laporan` | Laporan & Analisis | `Laporan` | Login required |
| `/pembibitan-mangrove` | Pembibitan | `PembibitanMangrove` | Login required |
| `/tekanan-sosial` | Tekanan Sosial | `TekananSosial` | Login required |
| `/lingkungan` | Analisis Lingkungan | `AnalisisLingkungan` | Login required |
| `/mangrove-nasional` | Data Nasional | `MangroveNasional` | **Admin only** |

### 5.2 Landing Page

Halaman publik pertama yang dilihat pengguna. Berisi:
- **Hero section:** Gambar latar mangrove, ajakan lihat peta interaktif
- **Tentang:** Visi & misi ID-MAP
- **Fitur Utama:** 4 modul (Spacewatch, EcoTrack, BioAssess, Restorasi)
- **CTA:** Ajakan bergabung
- **Kontak:** Email, telepon, alamat kantor
- **Statistik:** Kunjungan & pengguna (dari Convex `siteStats`)
- **Footer:** Informasi copyright

### 5.3 Peta Interaktif Publik

Halaman peta publik yang bisa diakses tanpa login (`/peta`). Fitur:
- Peta Leaflet dengan tile layer OpenStreetMap/Satellite
- **Layer mangkuk:**
  - Titik mangrove (warna berdasarkan status: hijau=lebat, kuning=sedang, oranye=jarang, merah=kritis)
  - Titik abrasi (warna berdasarkan prioritas)
  - Titik pendaratan penyu
  - Titik Pokmaswas
  - Polygon kawasan konservasi (GeoJSON)
  - Polygon benthic (GeoJSON)
  - Polygon pemanfaatan ruang laut (GeoJSON)
- **Popup:** Informasi detail setiap titik
- **Panel samping:** Filter berdasarkan layer
- **Download:** Data dalam format CSV, GeoJSON, PDF
- **Search & Locate:** Cari lokasi, zoom ke posisi pengguna

### 5.4 Dashboard Utama

Halaman dashboard yang menampilkan:
- **4 KPI Cards:** Total Survei, Disetujui, Menunggu, Ditolak
- **Stats Panel** (admin/verifikator only): Statistik dari Convex
- **Hero KPI:** Total luas mangrove, indeks tutupan, area restorasi (dengan sparkline)
- **Gauge:** Tutupan lebat (radial bar)
- **Donut:** Distribusi status tutupan
- **Konsentrasi mangrove:** Top lokasi berdasarkan luas
- **Indeks Kesehatan Ekosistem:** Skor agregat
- **Tren Luas Mangrove:** Area chart multi-temporal 2018-2025
- **Luas per Lokasi:** Bar chart per lokasi pemantauan
- **Notifikasi:** Alert/peringatan terkini
- **Tabel Lokasi:** Detail semua lokasi pemantauan

### 5.5 Input Lapangan (Admin & Verifikator only)

Halaman utama untuk input data survei. Mendukung 3 tipe survei:

#### A. Monitoring Mangrove / Vegetasi Pesisir
- **Identitas Petugas:** Nama, unit kerja (dropdown + custom), tanggal
- **GPS:** Ambil koordinat otomatis (browser GPS) atau dari foto (EXIF)
- **Data Mangrove:** Tutupan tajuk, kerapatan, spesies, regenerasi, serasah
- **Data Vegetasi Pesisir** (toggle): Jenis vegetasi, luas area, jumlah tegakan
- **Lingkungan:** Substrat, ancaman (multi-select chips), status tenurial
- **Dokumentasi:** Upload foto (max 4, dengan tag), auto-upload ke Cloudinary
- **Catatan:** Kondisi umum, rekomendasi lapangan

#### B. Potensi & Rekomendasi Penanaman
- Area, substrat, aksesibilitas, pengaruh pasang
- **Skor potensi:** Dihitung otomatis dari input
- **Titik rawan abrasi:** Tingkat, indikasi, luasan terdampak
- Prioritas penanganan

#### C. Titik Pendaratan Penyu
- Jenis penyu (multi-select chips + manual)
- **Data sarang:** Multi-point input dengan koordinat manual/GPS/foto
- Tabel sarang interaktif: tambah, edit, hapus, upload foto per titik
- Kondisi pantai, ancaman, status perlindungan

**Fitur Khusus:**
- **Offline-first:** Data disimpan ke localStorage, antri untuk sync ke Convex
- **GPS dari Foto:** Ekstrak koordinat dari EXIF foto menggunakan `exifr`
- **OCR:** Preload Tesseract worker untuk pendaratan penyu
- **Cetak Berita Acara:** Generate HTML + print dialog
- **Riwayat Survei:** Menampilkan survei sebelumnya oleh petugas yang sama

### 5.6 Verifikasi Data (Verifikator only)

Halaman untuk verifikator memeriksa dan memvalidasi data survei:

- **4 KPI Stats:** Total, pending, approved, rejected
- **Filter:** Search (lokasi/petugas/unit), filter status, filter tujuan
- **Card List:** Setiap survei ditampilkan dalam card dengan:
  - Icon tujuan survei (Leaf/Sprout/AlertTriangle/Turtle/Trees)
  - Status badge (Menunggu/Disetujui/Ditolak)
  - Info petugas, unit, tanggal
  - Tombol **Verifikasi** (hanya untuk status pending)
- **Detail Expand:** Klik "Eye" untuk lihat detail lengkap:
  - Koordinat + link Google Maps
  - Substrat, salinitas, tutupan tajuk, spesies
  - Kondisi umum, rekomendasi
  - Ancaman (tags)
  - Titik sarang (jika pendaratan penyu) + link multi-point Maps
  - Foto dokumentasi
  - Riwayat verifikasi
- **Panel Verifikasi:**
  - Textarea untuk catatan verifikasi
  - Tombol **Setujui** (hijau) dan **Tolak** (merah)
  - Optimistic update: UI berubah langsung, sync ke backend

### 5.7 Data Pokmaswas (Admin & Verifikator only)

CRUD untuk data Kelompok Masyarakat Pengawas (Pokmaswas):

- **Data statis:** 44 Pokmaswas seed (PKM-001 s/d PKM-044) dari file statis
- **Data dinamis:** Input tambahan admin disimpan ke tabel Convex
- **Filter:** Search, filter kabupaten/kota
- **Tabel:** No, nama, ketua, alamat, kontak, koordinat
- **Modal Form:** Tambah/edit Pokmaswas
- **Masking No HP:** Nomor HP ditampilkan penuh hanya untuk staff; viewer melihat nomor ter-mask
- **Koordinat Override:** Admin bisa override koordinat untuk koreksi posisi

### 5.8 Fitur Lainnya

| Halaman | Deskripsi Singkat |
|---------|-------------------|
| **Monitoring Ekosistem** | Radar chart & bar chart per lokasi, KPI skor kesehatan |
| **Vegetasi Mangrove** | Data komposisi spesies, distribusi, analisis vegetasi |
| **Pendaratan Penyu** | Data titik pendaratan, jumlah sarang, tren musiman |
| **Rekomendasi Lokasi** | Rekomendasi berbasis data untuk restorasi & intervensi |
| **Pembibitan Mangrove** | Data nursery, kapasitas bibit, sertifikasi |
| **Tekanan Sosial** | Analisis tekanan antropogenik, status tenurial |
| **Analisis Lingkungan** | Data parameter lingkungan (salinitas, pH, suhu, dll) |
| **Mangrove Nasional** | Data perbandingan nasional (admin only) |
| **Laporan** | Laporan PDF/print, tren, kebijakan, rekomendasi |

---

## 6. Pedoman untuk Role Viewer (Publik)

### 6.1 Akses

1. Buka browser dan kunjungi URL aplikasi ID-MAP
2. Anda langsung melihat **Landing Page** tanpa perlu login
3. Navigasi via menu: Beranda, Tentang, Fitur Utama, Kontak

### 6.2 Melihat Peta Interaktif

1. Klik **"Lihat Peta Interaktif"** di hero section atau buka `/peta`
2. Peta menampilkan titik-titik mangrove, abrasi, penyu, Pokmaswas
3. Gunakan **panel layer** di samping untuk filter:
   - Mangrove (warna: hijau/kuning/oranye/merah)
   - Abrasi (warna: merah/oranye/kuning)
   - Pendaratan Penyu
   - Pokmaswas
   - Kawasan Konservasi (polygon)
   - Benthic (polygon)
4. Klik titik untuk melihat **popup detail** (nama, status, luas)
5. Gunakan tombol **Search** untuk mencari lokasi
6. Gunakan tombol **Locate** untuk zoom ke posisi Anda
7. **Download data:** Klik tombol Download untuk CSV/GeoJSON/PDF

### 6.3 Melihat Dashboard & Monitoring

1. Login via **Clerk** (Google/TikTok/X) atau klik **Daftar** di Landing Page
2. Setelah login, Anda diarahkan ke **Dashboard**
3. Dashboard menampilkan statistik agregat (total survei, luas mangrove, dll)
4. Buka menu **Ekosistem**, **Vegetasi Mangrove**, **Pendaratan Penyu**, dll.
5. Data bersifat **read-only** — Anda tidak bisa mengubah data

### 6.4 Keterbatasan Viewer

- Tidak bisa menginput data lapangan
- Tidak bisa melihat nomor HP Pokmaswas (ter-mask)
- Tidak bisa mengakses halaman Verifikasi Data, Input Lapangan, Mangrove Nasional
- Tidak bisa menambah/edit Pokmaswas

---

## 7. Pedoman untuk Role Admin

### 7.1 Login Admin

1. Buka halaman `/login`
2. Masukkan **Username** dan **Password** yang telah diberikan
3. Klik **SIGN IN**
4. Jika berhasil, diarahkan ke Dashboard

### 7.2 Input Data Lapangan

1. Buka menu **Input Lapangan** (hanya untuk Admin & Verifikator)
2. Pilih **Tujuan Survei:**
   - **Monitoring Mangrove / Vegetasi Pesisir** — untuk survei rutin ekosistem
   - **Potensi & Rekomendasi Penanaman** — untuk area potensial restorasi
   - **Titik Pendaratan Penyu** — untuk data sarang penyu
3. Isi form secara lengkap:
   - **Identitas Petugas:** Nama, unit kerja, tanggal
   - **Koordinat GPS:**
     - Klik **"Ambil GPS"** untuk deteksi otomatis
     - Atau klik **"Dari Foto GPS"** untuk ekstrak dari EXIF foto
     - Koordinat bisa diinput manual jika diperlukan
   - **Data Ekosistem:** Tutupan tajuk, kerapatan, spesies, substrat
   - **Ancaman:** Pilih dari chip yang tersedia
   - **Dokumentasi:** Upload foto (max 4), auto-upload ke Cloudinary jika online
4. Klik **Simpan** untuk menyimpan data
5. Data tersimpan di **localStorage** (offline) dan diantrekan untuk sync ke Convex

### 7.3 Tips Input Lapangan

- **GPS dari Foto:** Gunakan aplikasi GPS Camera (Timestamp Camera / GPS Map Camera) saat memotret agar EXIF mengandung koordinat
- **Offline:** Data tetap bisa diinput tanpa koneksi internet. Data akan sync otomatis saat online
- **Unit Kerja:** Bisa pilih dari dropdown atau ketik manual jika unit tidak terdaftar
- **Sarang Penyu:** Cukup isi koordinat, foto opsional. Titik tanpa foto tetap tampil sebagai geotag

### 7.4 Kelola Pokmaswas

1. Buka menu **Data Pokmaswas**
2. Lihat daftar Pokmaswas yang sudah terdaftar
3. **Filter** berdasarkan kabupaten/kota atau search nama
4. Klik **Tambah** untuk input Pokmaswas baru
5. Klik **Edit** untuk mengubah data Pokmaswas
6. Klik **Hapus** untuk menghapus (konfirmasi)
7. **Override koordinat:** Klik titik di peta untuk koreksi posisi

### 7.5 Cetak Berita Acara

1. Setelah input survei berhasil, klik **"Cetak Berita Acara"**
2. Browser akan membuka tab baru dengan HTML berita acara
3. Klik **Print** (Ctrl+P) untuk mencetak atau simpan sebagai PDF

### 7.6 Keterbatasan Admin

- Tidak bisa memverifikasi data (hanya Verifikator yang bisa)
- Tidak bisa mengakses Mangrove Nasional (hanya Admin khusus)

---

## 8. Pedoman untuk Role Verifikator

### 8.1 Login Verifikator

1. Buka halaman `/login`
2. Masukkan **Username** dan **Password** akun Verifikator
3. Klik **SIGN IN**
4. Dashboard menampilkan statistik verifikasi di KPI cards

### 8.2 Verifikasi Data

1. Buka menu **Verifikasi Data** (hanya untuk Verifikator)
2. Halaman menampilkan:
   - **4 KPI Cards:** Total survei, pending, approved, rejected
   - **Info Banner:** Jika ada data pending
   - **Filter:** Search, filter status, filter tujuan survei
3. Setiap data survei ditampilkan dalam **card** dengan:
   - Icon tujuan survei
   - Status badge (Menunggu = kuning, Disetujui = hijau, Ditolak = merah)
   - Informasi petugas, unit, tanggal
4. Untuk memverifikasi:
   - Klik tombol **Verifikasi** (biru) pada card dengan status "Menunggu"
   - Panel verifikasi akan terbuka
   - Periksa **detail data** dengan klik icon **Eye** untuk expand
   - Perhatikan: koordinat GPS, substrat, tutupan tajuk, foto dokumentasi
   - Ketik **catatan verifikasi** (opsional, disarankan jika menolak)
   - Klik **Setujui** (hijau) atau **Tolak** (merah)

### 8.3 Kriteria Verifikasi

**Disetujui** jika:
- Data diisi lengkap (minimal: petugas, koordinat, tutupan tajuk, substrat)
- Koordinat GPS valid dan masuk akal (cek via link Google Maps)
- Foto dokumentasi sesuai dengan kondisi lapangan
- Catatan kondisi umum dan rekomendasi jelas

**Ditolak** jika:
- Data tidak lengkap (koordinat kosong, field penting tidak diisi)
- Koordinat tidak masuk akal (di luar wilayah)
- Foto tidak sesuai atau rusak
- Duplikasi data yang sudah ada

### 8.4 Catatan Verifikasi

- **Catatan bersifat opsional** untuk approve, namun **sangat disarankan** untuk reject
- Catatan akan muncul di detail card setelah verifikasi
- Catatan membantu petugas lapangan memperbaiki input data

### 8.5 Optimistic UI

- Setelah klik Setujui/Tolak, UI langsung berubah tanpa menunggu server
- Statistik KPI juga langsung diperbarui
- Jika gagal sync ke server, data akan di-rollback dan perlu refresh

---

## 9. Alur Verifikasi Data

### 9.1 Diagram Alur

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Petugas  │────>│   Data    │────>│Verifikator│
│ Lapangan  │     │  Survei   │     │           │
│  (Admin)  │     │ Pending   │     │  Review   │
└──────────┘     └──────────┘     └─────┬─────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
              ┌─────┴─────┐       ┌─────┴─────┐       ┌─────┴─────┐
              │  Approved  │       │  Rejected  │       │  Pending  │
              │            │       │            │       │           │
              │ Data masuk │       │ Data       │       │ Menunggu  │
              │ Dashboard  │       │ dikembalikan│      │ review    │
              │ & Peta     │       │ ke petugas  │       │ lagi      │
              └────────────┘       └────────────┘       └───────────┘
```

### 9.2 Status Transitions

```
[Pending] ──Setujui──> [Approved]
[Pending] ──Tolak────> [Rejected]
[Approved] ──(tidak bisa diubah kembali)
[Rejected] ──(tidak bisa diubah kembali, perlu input ulang)
```

### 9.3 Optimistic Update Pattern

1. User klik Setujui/Tolak
2. UI langsung memperbarui status (tanpa loading)
3. Stats KPI langsung diperbarui
4. Perubahan dikirim ke Convex backend
5. Jika gagal (error), UI di-rollback ke status sebelumnya

---

## 10. Alur Sinkronisasi Offline

### 10.1 Konsep Offline-First

Aplikasi ID-MAP dirancang dengan prinsip **offline-first**, terutama untuk modul Input Lapangan yang digunakan di daerah dengan koneksi internet terbatas.

### 10.2 Alur Sinkronisasi

```
┌─────────────────────────────────────────────────────┐
│                 BROWSER (Client)                      │
│                                                       │
│  ┌──────────────┐       ┌──────────────────────┐     │
│  │ Input Survei  │──────>│   localStorage        │     │
│  │ (Form)        │       │   (indexedDB-style)   │     │
│  └──────────────┘       └──────────┬───────────┘     │
│                                    │                  │
│                           ┌────────┴────────┐        │
│                           │  Online Check    │        │
│                           │  (navigator.onLine)│       │
│                           └────────┬────────┘        │
│                                    │                  │
│                    Online ┌────────┴────────┐        │
│                    ┌──────┤  Offline Queue   │        │
│                    │      │  (enqueueSurvey) │        │
│                    │      └────────┬────────┘        │
│                    │               │                  │
│                    ▼               ▼                  │
│           ┌────────────┐   ┌──────────────┐          │
│           │  Convex     │   │  Antrian      │          │
│           │  Mutation   │   │  Lokal        │          │
│           └────────────┘   └──────────────┘          │
└─────────────────────────────────────────────────────┘
```

### 10.3 Detail Alur

1. **User input data** → data disimpan ke `localStorage` via `saveSurvey()`
2. **Cek koneksi:** `navigator.onLine`
3. **Jika online:**
   - Data dikirim ke Convex via mutation (antrian `enqueueSurvey`)
   - Status sinkronasi: `synced`
4. **Jika offline:**
   - Data masuk ke antrian offline (`offlineQueue`)
   - Status sinkronasi: `pending`
   - Data akan dikirim saat koneksi tersedia kembali
5. **Saat online kembali:** `window.addEventListener('online')` trigger sinkronasi ulang

### 10.4 Deteksi Koneksi

```typescript
// InputLapangan.tsx
useEffect(() => {
  const up = () => setIsOnline(true);
  const dn = () => setIsOnline(false);
  window.addEventListener('online', up);
  window.addEventListener('offline', dn);
  return () => { /* cleanup */ };
}, []);
```

### 10.5 Upload Foto Offline

- Foto diupload ke **Cloudinary** hanya saat online
- Jika offline, foto disimpan sebagai **preview (data URL)** di localStorage
- Saat online, foto diupload dan URL disimpan

---

## 11. Keamanan & Otentikasi

### 11.1 Dual-Track Authentication

Sistem menggunakan **dual-track authentication**:

| Track | Metode | Tujuan |
|-------|--------|--------|
| **Admin/Verifikator** | Username + Password (hardcoded) | Akses internal staff |
| **Publik** | Clerk (Google, TikTok, X) | Login publik viewer |

### 11.2 Alur Auth Admin

1. User buka `/login`
2. Input username & password
3. Sistem mencocokkan dengan `ADMIN_ACCOUNTS` di `authAccounts.ts`
4. Jika cocok: session disimpan ke `localStorage` (key: `idmap_auth`)
5. User diarahkan ke Dashboard
6. Session bertahan sampai user klik **Logout**

### 11.3 Alur Auth Publik (Clerk)

1. User klik **Login/Daftar** di Landing Page
2. Modal Clerk muncul (pilihan: Google, TikTok, X)
3. Setelah autentikasi, user diarahkan ke `/dashboard`
4. Role otomatis: `viewer`

### 11.4 Route Protection

```typescript
// App.tsx — Route Guards

// 1. Verifikator only
<VerifikatorRoute>
  <VerifikasiData />
</VerifikatorRoute>

// 2. Admin & Verifikator only
<AdminRoute>
  <InputLapangan />
</AdminRoute>

// 3. Login required (any role)
<ProtectedLayout>
  <Dashboard />
</ProtectedLayout>
```

### 11.5 Penyimpanan Kredensial

- **Admin accounts:** Hardcoded di `src/context/authAccounts.ts`
- **Session:** `localStorage` (key: `idmap_auth`, JSON encoded)
- **Convex:** Tidak menyimpan password, hanya referensi user
- **Clerk:** Mengelola autentikasi publik secara terpisah

### 11.6 Rekomendasi Keamanan untuk Produksi

- Migrasi admin auth ke database terenkripsi (bukan hardcoded)
- Implementasi session dengan JWT dan refresh token
- Enkripsi data sensitif di localStorage
- Rate limiting pada endpoint Convex
- Logging audit trail untuk semua operasi CRUD

---

## 12. Konfigurasi Lingkungan

### 12.1 Variable Environment

File `.env.local` di root project:

```env
# Convex Deployment
VITE_CONVEX_URL=https://<project>.convex.cloud

# Cloudinary (Foto Upload)
VITE_CLOUDINARY_CLOUD_NAME=<cloud_name>
VITE_CLOUDINARY_UPLOAD_PRESET=<upload_preset>

# Clerk Authentication (Publik)
VITE_CLERK_PUBLISHABLE_KEY=<clerk_publishable_key>

# EmailJS (OTP)
VITE_EMAILJS_SERVICE_ID=<service_id>
VITE_EMAILJS_TEMPLATE_ID=<template_id>
VITE_EMAILJS_PUBLIC_KEY=<public_key>

# Supabase (Legacy — migrasi ke Convex)
VITE_SUPABASE_URL=<supabase_url>
VITE_SUPABASE_ANON_KEY=<supabase_anon_key>
```

### 12.2 Script Commands

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan development server (port 5000) |
| `npm run build` | Build produksi (TypeScript + Vite) |
| `npm run preview` | Preview build produksi (port 4173) |
| `npm run lint` | ESLint check |
| `npm test` | Jalankan Vitest |
| `npx convex dev` | Jalankan Convex development |

### 12.3 Deploy

- **Frontend:** Vercel atau Netlify
- **Backend:** Convex (serverless, managed)
- **PWA:** Service worker via `vite-plugin-pwa` + Workbox

---

## 13. Pemeliharaan & Monitoring

### 13.1 Database Convex

- **Realtime sync:** Convex secara otomatis menyinkronkan data ke client
- **Backup:** Convex menyediakan backup otomatis (sesuai paket)
- **Index:** Semua tabel memiliki index untuk query cepat

### 13.2 Monitoring Stats

`siteStats` table mencatat:
- `totalVisits`: Total kunjungan halaman
- `totalDownloads`: Total download data
- `downloadsPDF`, `downloadsGeoJSON`, `downloadsCSV`: Per-tipe download

### 13.3 Audit Trail

- **Surveys:** Setiap survei memiliki `legacyId` + timestamp (`_creationTime`)
- **Verification:** `verifiedBy`, `verifiedAt`, `verificationNote` tercatat
- **OTP Logs:** `otpLogs` menyimpan semua aktivitas OTP (sent, verified, expired, failed)

### 13.4 Troubleshooting Umum

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| Login gagal | Username/password salah | Cek `ADMIN_ACCOUNTS` di authAccounts.ts |
| Peta tidak tampil | API key Leaflet | Pastikan tile layer tersedia |
| Foto gagal upload | Cloudinary konfigurasi | Cek env VITE_CLOUDINARY_* |
| Data tidak sync | Koneksi internet | Tunggu online atau refresh halaman |
| Verifikasi gagal | Convex offline | Cek status Convex dashboard |
| GPS tidak akurat | Izin browser | Aktifkan lokasi di browser |

---

## Lampiran

### A. Struktur File Project

```
ID-MAP-CabdinMalang/
├── convex/                    # Backend Convex
│   ├── schema.ts              # Schema database
│   ├── locations.ts           # Fungsi lokasi
│   ├── surveys.ts             # Fungsi survei
│   ├── nurseries.ts           # Fungsi pembibitan
│   ├── pokmaswas.ts           # Fungsi Pokmaswas
│   ├── profiles.ts            # Fungsi profil user
│   ├── stats.ts               # Fungsi statistik
│   ├── surveyPhotos.ts        # Fungsi foto survei
│   ├── otpLogs.ts             # Fungsi OTP
│   └── _generated/            # Auto-generated Convex
├── src/
│   ├── App.tsx                # Root component + routing
│   ├── main.tsx               # Entry point
│   ├── pages/                 # Halaman aplikasi (17 pages)
│   ├── components/            # Komponen reusable (15 komponen)
│   ├── context/               # Context providers
│   │   ├── AuthContext.tsx     # Auth state management
│   │   ├── AuthContext.tsx
│   │   ├── authAccounts.ts    # Hardcoded admin accounts
│   │   └── authModel.ts       # Tipe auth
│   ├── data/                  # Data statis & seed
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utility libraries
│   │   ├── cloudinary.ts      # Cloudinary upload
│   │   ├── offlineQueue.ts    # Offline queue manager
│   │   ├── exifGps.ts         # GPS extraction from EXIF
│   │   ├── coordParser.ts     # Coordinate parser
│   │   ├── convexClient.ts    # Convex client instance
│   │   └── statsClient.ts     # Stats recording client
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
│   ├── *.geojson              # GeoJSON data files
│   └── *.webp                 # Hero images
├── docs/                      # Dokumentasi tambahan
├── scripts/                   # Utility scripts
├── supabase/                  # Legacy Supabase schema
└── package.json               # Dependencies & scripts
```

### B. Daftar Tujuan Survei (Enum)

| Key | Label | Deskripsi |
|-----|-------|-----------|
| `monitoring` | Monitoring Mangrove | Survei rutin ekosistem mangrove |
| `monitoring_vegetasi` | Monitoring Vegetasi | Survei vegetasi pesisir (form terpisah) |
| `potensi_penanaman` | Potensi Penanaman | Survey area potensial untuk restorasi |
| `abrasi` | Titik Rawan Abrasi | Survey area terdampak abrasi |
| `pendaratan_penyu` | Pendaratan Penyu | Survey titik sarang penyu |

### C. Daftar Status Mangrove

| Status | Warna | Deskripsi |
|--------|-------|-----------|
| `lebat` | Hijau | Tutupan mangrove > 70% |
| `sedang` | Kuning | Tutupan 30-70% |
| `jarang` | Oranye | Tutupan 10-30% |
| `kritis` | Merah | Tutupan < 10% |

### D. Daftar Ancaman (Multi-Select)

- Abrasi pantai
- Konversi tambak
- Penebangan liar
- Pembuangan sampah
- Sedimentasi tinggi
- Pencemaran industri
- Perambahan pemukiman
- Penangkapan ikan destruktif
- Wisatawan
- Predator penyu
- Kurangnya kesadaran masyarakat

---

**© 2025 ID-MAP — Cabang Dinas Kelautan dan Perikanan Kabupaten Malang**

Dokumen ini bersifat teknis dan diperuntukkan bagi pengelola sistem, administrator, dan verifikator aplikasi ID-MAP.
