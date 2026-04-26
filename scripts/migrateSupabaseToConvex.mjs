#!/usr/bin/env node
/**
 * One-shot migration: Supabase → Convex.
 *
 * Membaca seluruh baris dari tabel-tabel Supabase dan upsert ke Convex
 * lewat HTTP client. Idempotent — bisa dijalankan berkali-kali; semua mutation
 * tujuan adalah upsert by `legacyId` / `email`.
 *
 * Cara pakai:
 *   1. Pastikan .env.local berisi:
 *        VITE_SUPABASE_URL=...
 *        SUPABASE_SERVICE_ROLE_KEY=...   (atau VITE_SUPABASE_ANON_KEY untuk read-only)
 *        VITE_CONVEX_URL=https://xxx.convex.cloud
 *   2. Jalankan:  node scripts/migrateSupabaseToConvex.mjs
 *
 * Catatan: skrip ini sengaja TIDAK menyentuh `survey_photos` foto-binary;
 * URL Cloudinary tetap di kolom string. Object storage tetap di Cloudinary.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { ConvexHttpClient } from 'convex/browser';

// ── Load .env.local ────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
if (existsSync(envPath)) {
  const raw = readFileSync(envPath, 'utf-8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;
const KEY_KIND =
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)
    ? 'service_role'
    : 'anon';
const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ VITE_SUPABASE_URL atau key tidak ditemukan di .env.local');
  process.exit(1);
}
if (!CONVEX_URL) {
  console.error('❌ VITE_CONVEX_URL tidak ditemukan di .env.local');
  process.exit(1);
}

const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});
const convex = new ConvexHttpClient(CONVEX_URL);

// ── Helpers ────────────────────────────────────────────────────────────────
const num = (v) => (v == null || v === '' ? undefined : Number(v));
const str = (v) => (typeof v === 'string' && v.length > 0 ? v : undefined);

async function fetchAll(table) {
  const PAGE = 1000;
  let from = 0;
  const out = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`[${table}] ${error.message}`);
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

async function runStep(label, fn) {
  process.stdout.write(`→ ${label} ... `);
  try {
    const n = await fn();
    console.log(`OK (${n})`);
  } catch (err) {
    console.log('FAIL');
    console.error(err);
    process.exitCode = 1;
  }
}

// ── Adapters Supabase row → Convex args ────────────────────────────────────
function rowToLocationArgs(l) {
  return {
    legacyId: l.id,
    name: l.name,
    province: l.province,
    district: l.district,
    lat: Number(l.lat),
    lng: Number(l.lng),
    areaHa: Number(l.area_ha ?? 0),
    status: l.status,
    kawasan: l.kawasan,
    lastSurvey: str(l.last_survey),
    isCustom: !!l.is_custom,
    createdBy: str(l.created_by),
  };
}

function rowToNurseryArgs(n) {
  return {
    legacyId: n.id,
    nama: n.nama,
    institusi: str(n.institusi),
    sertifikat: n.sertifikat ?? 'tidak_bersertifikat',
    kapasitasBibit: Number(n.kapasitas_bibit ?? 0),
    provinsi: n.provinsi,
    kabKota: n.kab_kota,
    lat: Number(n.lat),
    lng: Number(n.lng),
    catatan: str(n.catatan),
    addedBy: n.added_by ?? 'system',
    isActive: n.is_active !== false,
  };
}

function rowToProfileArgs(p) {
  return {
    nama: p.nama ?? p.email ?? 'Pengguna',
    email: (p.email ?? '').toLowerCase(),
    unit: str(p.unit),
    provinsi: str(p.provinsi),
    role: p.role ?? 'viewer',
  };
}

function rowToSurveyArgs(s) {
  const verifStatus =
    s.verification_status === 'approved' || s.verification_status === 'rejected'
      ? s.verification_status
      : 'pending';
  return {
    legacyId: s.id,
    tujuanSurvei: s.tujuan_survei,
    petugasNama: s.petugas_nama ?? '',
    petugasNip: str(s.petugas_nip),
    petugasUnit: s.petugas_unit ?? '',
    tanggal: s.tanggal ?? new Date().toISOString().split('T')[0],
    locationId: str(s.location_id),
    locationName: s.location_name ?? '',
    province: s.province ?? '',
    kabKota: str(s.kab_kota),
    kecamatan: str(s.kecamatan),
    koordinatLat: num(s.koordinat_lat),
    koordinatLng: num(s.koordinat_lng),
    gpsAccuracy: num(s.gps_accuracy),
    googleMapsUrl: str(s.google_maps_url),
    metodeSurvei: str(s.metode_survei),
    tutupanTajuk: num(s.tutupan_tajuk),
    kerapatanEstimasi: num(s.kerapatan_estimasi),
    spesiesDominan: str(s.spesies_dominan),
    spesiesLain: str(s.spesies_lain),
    lajuRegenerasi: str(s.laju_regenerasi),
    kondisiSerasah: str(s.kondisi_serasah),
    salinitas: num(s.salinitas),
    ph: num(s.ph),
    suhu: num(s.suhu),
    kekeruhan: num(s.kekeruhan),
    substrat: str(s.substrat),
    elevasi: num(s.elevasi),
    pasangSurut: str(s.pasang_surut),
    ancamanUtama: Array.isArray(s.ancaman_utama) ? s.ancaman_utama : [],
    jarakPemukiman: num(s.jarak_pemukiman),
    luasTambakEstimasi: num(s.luas_tambak_estimasi),
    aktivitasManusia: str(s.aktivitas_manusia),
    statusTenurial: str(s.status_tenurial),
    namaArea: str(s.nama_area),
    luasanPotensi: num(s.luasan_potensi),
    aksesibilitas: str(s.aksesibilitas),
    pengaruhPasang: str(s.pengaruh_pasang),
    skorPotensi: num(s.skor_potensi),
    namaPantai: str(s.nama_pantai),
    indikasiAbrasi: str(s.indikasi_abrasi),
    kondisiSebelum: str(s.kondisi_sebelum),
    kondisiSesudah: str(s.kondisi_sesudah),
    tingkatAbrasi: str(s.tingkat_abrasi),
    panjangTerdampak: num(s.panjang_terdampak),
    luasanTerdampak: num(s.luasan_terdampak),
    prioritasAbrasi: str(s.prioritas_abrasi),
    kondisiUmum: str(s.kondisi_umum),
    rekomendasiLapangan: str(s.rekomendasi_lapangan),
    jenisPenyu: str(s.jenis_penyu),
    jumlahSarang: num(s.jumlah_sarang),
    statusPerlindungan: str(s.status_perlindungan),
    sarangPoints: Array.isArray(s.sarang_points) ? s.sarang_points : [],
    fotoDokumentasi: str(s.foto_dokumentasi),
    photoUrls: Array.isArray(s.photo_urls) ? s.photo_urls : [],
    verificationStatus: verifStatus,
    verificationNote: str(s.verification_note),
    verifiedBy: str(s.verified_by),
    verifiedAt: str(s.verified_at),
    syncStatus: 'synced',
  };
}

// ── Migrators ──────────────────────────────────────────────────────────────
async function migrateLocations() {
  const rows = await fetchAll('mangrove_locations');
  for (const r of rows) {
    await convex.mutation('locations:upsert', rowToLocationArgs(r));
  }
  return rows.length;
}

async function migrateNurseries() {
  // Tabel mungkin tidak ada di setiap deployment — toleransi error.
  let rows = [];
  try {
    rows = await fetchAll('custom_nurseries');
  } catch (err) {
    console.warn(`   (skip custom_nurseries: ${err.message})`);
    return 0;
  }
  for (const r of rows) {
    await convex.mutation('nurseries:upsert', rowToNurseryArgs(r));
  }
  return rows.length;
}

async function migrateProfiles() {
  let rows = [];
  try {
    rows = await fetchAll('user_profiles');
  } catch (err) {
    console.warn(`   (skip user_profiles: ${err.message})`);
    return 0;
  }
  let n = 0;
  for (const r of rows) {
    if (!r.email) continue;
    await convex.mutation('profiles:upsertByEmail', rowToProfileArgs(r));
    n++;
  }
  return n;
}

async function migrateSurveys() {
  const rows = await fetchAll('surveys');
  for (const r of rows) {
    await convex.mutation('surveys:upsert', rowToSurveyArgs(r));
  }
  return rows.length;
}

async function migrateSurveyPhotos() {
  let rows = [];
  try {
    rows = await fetchAll('survey_photos');
  } catch (err) {
    console.warn(`   (skip survey_photos: ${err.message})`);
    return 0;
  }
  for (const r of rows) {
    await convex.mutation('surveyPhotos:add', {
      surveyLegacyId: r.survey_id,
      url: r.url,
      cloudId: str(r.cloud_id),
      tag: r.tag ?? 'general',
    });
  }
  return rows.length;
}

// ── Main ───────────────────────────────────────────────────────────────────
console.log('🚀 Migrasi Supabase → Convex');
console.log(`   Supabase: ${SUPABASE_URL}`);
console.log(`   Key:      ${KEY_KIND} (${SUPABASE_KEY.slice(0, 6)}…${SUPABASE_KEY.slice(-4)})`);
console.log(`   Convex:   ${CONVEX_URL}\n`);
if (KEY_KIND === 'anon') {
  console.warn('⚠  Memakai ANON key — RLS mungkin memblokir baca semua tabel.');
  console.warn('   Disarankan set VITE_SUPABASE_SERVICE_ROLE_KEY di .env.local.\n');
}

await runStep('mangrove_locations → mangroveLocations', migrateLocations);
await runStep('custom_nurseries  → customNurseries  ', migrateNurseries);
await runStep('user_profiles     → userProfiles     ', migrateProfiles);
await runStep('surveys           → surveys          ', migrateSurveys);
await runStep('survey_photos     → surveyPhotos     ', migrateSurveyPhotos);

console.log('\n✅ Selesai.');
