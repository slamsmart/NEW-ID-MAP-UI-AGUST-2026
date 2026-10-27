import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * ID-MAP Convex Schema
 *
 * Mirror dari Supabase schema (database/schema.sql + supabase/schema.sql).
 * Catatan desain:
 *  - `legacyId` adalah ID string lama (mis. "SUR-001", "LOC-002") agar
 *    data offline-queue di klien tetap kompatibel saat sync.
 *  - Timestamp Convex pakai `_creationTime` (number, epoch ms) bawaan.
 *  - Photo URLs disimpan sebagai string (sumber: Cloudinary, sesuai
 *    keputusan: object storage tetap di Cloudinary).
 *  - User profile disinkronkan dari Clerk (subject claim → clerkId).
 */

const sarangPointValidator = v.object({
  lat: v.string(),
  lng: v.string(),
  catatan: v.optional(v.string()),
  waktu: v.optional(v.string()),
  fotoUrl: v.optional(v.string()),
});

const tujuanSurveiValidator = v.union(
  v.literal('monitoring'),
  v.literal('potensi_penanaman'),
  v.literal('abrasi'),
  v.literal('pendaratan_penyu'),
  v.literal('monitoring_vegetasi'),
);

const verificationStatusValidator = v.union(
  v.literal('pending'),
  v.literal('approved'),
  v.literal('rejected'),
);

const syncStatusValidator = v.union(
  v.literal('synced'),
  v.literal('pending'),
  v.literal('failed'),
);

const roleValidator = v.union(
  v.literal('viewer'),
  v.literal('petugas_daerah'),
  v.literal('admin_nasional'),
  v.literal('admin'),
  v.literal('verifikator'),
);

const mangroveStatusValidator = v.union(
  v.literal('kritis'),
  v.literal('jarang'),
  v.literal('sedang'),
  v.literal('lebat'),
);

const kawasanValidator = v.union(
  v.literal('konservasi'),
  v.literal('hutan_lindung'),
  v.literal('apl'),
);

export default defineSchema({
  // ─────────────────────────────────────────────────────────────
  // userProfiles — sinkron dari Clerk untuk user publik
  // (admin/verifikator tetap di Supabase Auth — tidak disimpan di tabel ini)
  // ─────────────────────────────────────────────────────────────
  userProfiles: defineTable({
    // Optional — terisi hanya untuk user yang auth via Clerk.
    // User publik (OTP EmailJS) diidentifikasi by email.
    clerkId: v.optional(v.string()),
    nama: v.string(),
    email: v.string(),
    unit: v.optional(v.string()),
    provinsi: v.optional(v.string()),
    role: roleValidator,
    updatedAt: v.number(),
  })
    .index('by_clerk', ['clerkId'])
    .index('by_email', ['email']),

  // ─────────────────────────────────────────────────────────────
  // mangroveLocations
  // ─────────────────────────────────────────────────────────────
  mangroveLocations: defineTable({
    legacyId: v.string(),
    name: v.string(),
    province: v.string(),
    district: v.string(),
    lat: v.number(),
    lng: v.number(),
    areaHa: v.number(),
    status: mangroveStatusValidator,
    kawasan: kawasanValidator,
    lastSurvey: v.optional(v.string()),
    isCustom: v.boolean(),
    createdBy: v.optional(v.string()),
  })
    .index('by_legacy', ['legacyId'])
    .index('by_province', ['province'])
    .index('by_custom', ['isCustom']),

  // ─────────────────────────────────────────────────────────────
  // surveys — tabel utama (5 tipe survei)
  // ─────────────────────────────────────────────────────────────
  surveys: defineTable({
    legacyId: v.string(),
    tujuanSurvei: tujuanSurveiValidator,

    // Identitas Petugas
    petugasNama: v.string(),
    petugasNip: v.optional(v.string()),
    petugasUnit: v.string(),
    tanggal: v.string(),

    // Lokasi & GPS
    locationId: v.optional(v.string()),
    locationName: v.string(),
    province: v.string(),
    kabKota: v.optional(v.string()),
    kecamatan: v.optional(v.string()),
    koordinatLat: v.optional(v.number()),
    koordinatLng: v.optional(v.number()),
    gpsAccuracy: v.optional(v.number()),
    googleMapsUrl: v.optional(v.string()),

    // Ekosistem
    metodeSurvei: v.optional(v.string()),
    tutupanTajuk: v.optional(v.number()),
    kerapatanEstimasi: v.optional(v.number()),
    spesiesDominan: v.optional(v.string()),
    spesiesLain: v.optional(v.string()),
    lajuRegenerasi: v.optional(v.string()),
    kondisiSerasah: v.optional(v.string()),

    // Lingkungan
    salinitas: v.optional(v.number()),
    ph: v.optional(v.number()),
    suhu: v.optional(v.number()),
    kekeruhan: v.optional(v.number()),
    substrat: v.optional(v.string()),
    elevasi: v.optional(v.number()),
    pasangSurut: v.optional(v.string()),

    // Tekanan & Lahan
    ancamanUtama: v.array(v.string()),
    jarakPemukiman: v.optional(v.number()),
    luasTambakEstimasi: v.optional(v.number()),
    aktivitasManusia: v.optional(v.string()),
    statusTenurial: v.optional(v.string()),

    // Potensi Penanaman
    namaArea: v.optional(v.string()),
    luasanPotensi: v.optional(v.number()),
    aksesibilitas: v.optional(v.string()),
    pengaruhPasang: v.optional(v.string()),
    skorPotensi: v.optional(v.number()),

    // Abrasi
    namaPantai: v.optional(v.string()),
    indikasiAbrasi: v.optional(v.string()),
    kondisiSebelum: v.optional(v.string()),
    kondisiSesudah: v.optional(v.string()),
    tingkatAbrasi: v.optional(v.string()),
    panjangTerdampak: v.optional(v.number()),
    luasanTerdampak: v.optional(v.number()),
    prioritasAbrasi: v.optional(v.string()),

    // Catatan
    kondisiUmum: v.optional(v.string()),
    rekomendasiLapangan: v.optional(v.string()),

    // Pendaratan Penyu
    jenisPenyu: v.optional(v.string()),
    jumlahSarang: v.optional(v.number()),
    statusPerlindungan: v.optional(v.string()),
    sarangPoints: v.array(sarangPointValidator),

    // Foto & Sync
    fotoDokumentasi: v.optional(v.string()),
    photoUrls: v.array(v.string()),

    // Verifikasi
    verificationStatus: verificationStatusValidator,
    verificationNote: v.optional(v.string()),
    verifiedBy: v.optional(v.string()),
    verifiedAt: v.optional(v.string()),

    syncStatus: syncStatusValidator,
  })
    .index('by_legacy', ['legacyId'])
    .index('by_tujuan', ['tujuanSurvei'])
    .index('by_province', ['province'])
    .index('by_location', ['locationId'])
    .index('by_verification', ['verificationStatus'])
    .index('by_petugas', ['petugasNama']),

  // ─────────────────────────────────────────────────────────────
  // surveyPhotos — metadata foto Cloudinary, terhubung ke survei
  // ─────────────────────────────────────────────────────────────
  surveyPhotos: defineTable({
    surveyLegacyId: v.string(),
    url: v.string(),
    cloudId: v.optional(v.string()),
    tag: v.string(),
  }).index('by_survey', ['surveyLegacyId']),

  // ─────────────────────────────────────────────────────────────
  // customNurseries — pembibitan tambahan
  // ─────────────────────────────────────────────────────────────
  customNurseries: defineTable({
    legacyId: v.string(),
    nama: v.string(),
    institusi: v.optional(v.string()),
    sertifikat: v.string(),
    kapasitasBibit: v.number(),
    provinsi: v.string(),
    kabKota: v.string(),
    lat: v.number(),
    lng: v.number(),
    catatan: v.optional(v.string()),
    addedBy: v.string(),
    isActive: v.boolean(),
  })
    .index('by_legacy', ['legacyId'])
    .index('by_active', ['isActive'])
    .index('by_provinsi', ['provinsi']),

  // ─────────────────────────────────────────────────────────────
  // otpLogs — audit trail OTP (EmailJS)
  // ─────────────────────────────────────────────────────────────
  otpLogs: defineTable({
    email: v.string(),
    type: v.union(v.literal('login'), v.literal('signup')),
    status: v.union(
      v.literal('sent'),
      v.literal('verified'),
      v.literal('expired'),
      v.literal('failed'),
    ),
    delivered: v.boolean(),
    verifiedAt: v.optional(v.number()),
  }).index('by_email', ['email']),

  // ─────────────────────────────────────────────────────────────
  // siteStats — counter agregat untuk panel Stats di Dashboard.
  // Single-document pattern: satu row dengan key='global'.
  // Counter ditambahkan via mutation `stats.recordVisit` /
  // `stats.recordDownload`. Akumulasi ringan, query super cepat.
  // ─────────────────────────────────────────────────────────────
  siteStats: defineTable({
    key: v.string(),               // selalu 'global' untuk MVP
    totalVisits: v.number(),
    totalDownloads: v.number(),
    downloadsPDF: v.number(),
    downloadsGeoJSON: v.number(),
    downloadsCSV: v.number(),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  // ─────────────────────────────────────────────────────────────
  // siteConfig — konfigurasi situs yang bisa diubah runtime oleh
  // verifikator (tanpa rebuild/redeploy). Single-document pattern:
  // satu row dengan key='global', sama seperti `siteStats`.
  //
  // Saat `maintenanceEnabled` true, SELURUH situs dikunci dan
  // pengunjung melihat halaman Maintenance (lihat src/App.tsx →
  // MaintenanceGate). Verifikator/admin tetap bisa masuk supaya
  // bisa mematikan mode ini kembali.
  // ─────────────────────────────────────────────────────────────
  siteConfig: defineTable({
    key: v.string(),                          // selalu 'global'
    maintenanceEnabled: v.boolean(),
    maintenanceMessage: v.optional(v.string()),
    maintenanceEta: v.optional(v.string()),
    updatedBy: v.optional(v.string()),        // nama verifikator terakhir
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  // ─────────────────────────────────────────────────────────────
  // statEvents — riwayat event statistik untuk analisis waktu
  // (grafik per bulan & triwulan di Dashboard untuk admin/verifikator).
  // Setiap kunjungan & unduhan dicatat sebagai SATU baris event dengan
  // timestamp otomatis `_creationTime` dari Convex. Tidak ada deduplikasi
  // (IP sama tetap dihitung) sesuai kebutuhan verifikator.
  // Skala kabupaten → jumlah baris kecil, query agregasi tetap cepat.
  // ─────────────────────────────────────────────────────────────
  statEvents: defineTable({
    type: v.union(v.literal('visit'), v.literal('download')),
    kind: v.optional(v.union(v.literal('pdf'), v.literal('geojson'), v.literal('csv'))),
  })
    .index('by_type', ['type'])
    .index('by_kind', ['kind']),

  // ─────────────────────────────────────────────────────────────
  // pokmaswas — Kelompok Masyarakat Pengawas Konservasi.
  // Seed awal (PKM-001..PKM-044) tetap di file statis di klien
  // (src/data/pokmaswasData.ts). Tabel ini menyimpan entri yang
  // di-input admin/verifikator via form, sehingga nomor baru
  // dilanjutkan dari STATIC_BASE (lihat convex/pokmaswas.ts).
  // ─────────────────────────────────────────────────────────────
  pokmaswas: defineTable({
    legacyId: v.string(),
    no: v.number(),
    kabupatenKota: v.string(),
    nama: v.string(),
    alamat: v.string(),
    ketua: v.string(),
    noHp: v.string(),
    lat: v.number(),
    lng: v.number(),
    // Profil singkat (legenda)
    ruangLingkup: v.optional(v.string()),
    kawasanPantai: v.optional(v.string()),
    bidangCore: v.array(v.string()),
    // Audit
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_legacy', ['legacyId'])
    .index('by_kab', ['kabupatenKota'])
    .index('by_no', ['no']),
});
