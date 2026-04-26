# Migrasi Supabase → Convex

Dokumen ini menjelaskan langkah-langkah migrasi data ID-MAP dari Supabase ke
Convex. Strategi yang dipilih:

| Bagian                          | Tetap di               | Pindah ke    |
| ------------------------------- | ---------------------- | ------------ |
| Auth admin & verifikator        | Supabase Auth (OAuth)  | —            |
| Auth user publik                | —                      | Clerk        |
| Object storage (foto)           | Cloudinary             | —            |
| Data teks (surveys, locations)  | —                      | **Convex**   |

## Status fase

- [x] **Phase A** — Convex schema + functions (file ini sekarang)
- [x] **Phase B** — Refactor `localStore.ts` & `offlineQueue.ts` → Convex
- [x] **Phase C** — Profil user publik (OTP EmailJS) di Convex `userProfiles`
- [x] **Phase D** — One-shot migrasi data dari Supabase ke Convex
- [x] **Phase E** — Cleanup data-call Supabase (auth admin/verifikator tetap dipertahankan)

## Phase D — Menjalankan one-shot migration

Skrip: `scripts/migrateSupabaseToConvex.mjs` — idempotent, aman dijalankan ulang.

```bash
# 1. Pastikan .env.local berisi:
#    VITE_SUPABASE_URL=...
#    SUPABASE_SERVICE_ROLE_KEY=...   # disarankan untuk akses semua tabel
#    VITE_CONVEX_URL=https://xxx.convex.cloud

# 2. Jalankan
node scripts/migrateSupabaseToConvex.mjs
```

Output akan menampilkan jumlah row per tabel yang berhasil di-upsert.
Jika ada tabel yang belum ada di project Supabase tertentu (mis. `custom_nurseries`),
skrip akan skip dengan warning, bukan gagal total.

## Phase A — Yang sudah dibuat

```
convex/
├── schema.ts          # Definisi tabel + index (mirror Supabase)
├── profiles.ts        # userProfiles (Clerk-managed)
├── locations.ts       # mangroveLocations CRUD
├── surveys.ts         # surveys CRUD + verifikasi + stats
├── surveyPhotos.ts    # metadata foto Cloudinary
├── nurseries.ts       # customNurseries CRUD
├── otpLogs.ts         # audit trail OTP EmailJS
└── tsconfig.json      # (sudah ada)
```

Semua function memakai pola `convex-best-practices`:
- `args` & `returns` validator wajib (sesuai `@convex-dev/eslint-plugin`)
- Index untuk semua filter (tidak pakai `.filter()`)
- Idempotent upsert by `legacyId` (kompatibel dengan offline-queue di klien)
- `ConvexError` untuk error user-facing

## Cara setup deployment Convex (Anda yang jalankan)

```bash
# 1. Login & buat deployment baru
npx convex dev

# 2. Setelah login & pilih project, file _generated/ akan terbuat otomatis.
#    Server akan watch perubahan di convex/*.ts dan re-deploy.

# 3. Tambahkan ke .env.local:
#    VITE_CONVEX_URL=https://<deployment>.convex.cloud
```

> **Catatan**: lint error "Cannot find module './_generated/server'" akan
> hilang otomatis setelah `npx convex dev` pertama kali dijalankan.

## Phase B — Yang akan saya kerjakan setelah `_generated/` ada

1. Tambah `<ConvexProvider>` di `src/main.tsx` (butuh `VITE_CONVEX_URL`).
2. Refactor `src/data/localStore.ts`:
   - `fetchSurveys()` → `useQuery(api.surveys.list)` atau call via `convexClient`
   - `saveSurvey()` → `convexClient.mutation(api.surveys.upsert, ...)`
   - `verifySurveyRemote()` → `api.surveys.verify`
   - `removeSurvey()` → `api.surveys.remove`
3. Refactor `src/lib/offlineQueue.ts`:
   - `_uploadSurveyToSupabase()` → mutation `api.surveys.upsert`
   - `_uploadLocationToSupabase()` → mutation `api.locations.upsert`
4. Komponen React yang baca data berubah dari `await fetchSurveys()` →
   `useQuery(api.surveys.list)` (reaktif otomatis, tidak perlu refetch).

## Phase D — Migrasi data Supabase → Convex (opsional, satu kali)

Jika Anda punya data produksi di Supabase yang perlu dipindah:

```ts
// scripts/migrate-supabase-to-convex.ts (akan dibuat saat Phase D)
// 1. Read all rows dari supabase.from('surveys').select('*')
// 2. Map field snake_case → camelCase sesuai schema Convex
// 3. Call convexClient.mutation(api.surveys.upsert, { ... }) per row
```

Atau export CSV dari Supabase Dashboard, lalu import via:
- Convex Dashboard → Data → Import (drag & drop CSV)

## Mapping field snake_case ↔ camelCase

| Supabase (SQL)         | Convex (TS)        |
| ---------------------- | ------------------ |
| `id` (TEXT PK)         | `legacyId` (string)|
| `tujuan_survei`        | `tujuanSurvei`     |
| `petugas_nama`         | `petugasNama`      |
| `koordinat_lat`        | `koordinatLat`     |
| `verification_status`  | `verificationStatus`|
| `sync_status`          | `syncStatus`       |
| `photo_urls` (TEXT[])  | `photoUrls` (array)|
| `sarang_points` (JSONB)| `sarangPoints` (array of object)|

(field lain mengikuti pola yang sama: snake → camel)
