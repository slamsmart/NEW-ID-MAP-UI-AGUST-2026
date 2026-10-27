# Deployment Runbook — ID-MAP

## Current architecture

Frontend adalah React/Vite dan dibuild menjadi static assets di `dist/`. Backend/database tetap Convex; foto tetap di Cloudinary; authentication terhubung melalui Clerk bila dikonfigurasi.

```text
Frontend hosting (Vercel atau Cloudflare Pages)
        ↓
Vite static app
        ├── Convex URL
        ├── Clerk
        └── Cloudinary
```

Memindahkan hosting frontend tidak memindahkan atau menghapus database Convex. Migrasi database hanya diperlukan jika deployment Convex atau backend datanya sengaja diganti.

## Pre-deploy

Dari folder `id-map-next`:

```powershell
npm ci
npm run check
npm run smoke:production -- https://idmap-dkp.web.id
```

Untuk smoke test preview/local:

```powershell
npm run preview
npm run smoke:production -- http://127.0.0.1:4173
```

## Vercel

Konfigurasi berada di `vercel.json`:

- build command: `npm run build`
- output: `dist`
- SPA rewrite: semua route ke `/index.html`

Deploy production:

```powershell
npx vercel deploy --prod --yes
```

Jangan menjalankan deploy production sebelum `npm run check` dan smoke test lulus.

## Cloudflare Pages

Untuk migrasi frontend static ke Cloudflare Pages:

- build command: `npm run build`
- output directory: `dist`
- tambahkan SPA fallback `/* /index.html 200` bila platform belum menyediakannya;
- salin hanya environment variable yang diperlukan ke environment production;
- pertahankan `VITE_CONVEX_URL` yang menunjuk ke deployment Convex yang sama;
- tambahkan domain production/preview ke allowed origins dan redirect settings Clerk;
- cek CSP di `vercel.json`/header platform agar Convex, Clerk, Cloudinary, dan tile provider tetap diizinkan.

Migrasi hosting tidak boleh membuat deployment Convex baru tanpa rencana migrasi data.

## Environment

Frontend-safe variables:

```text
VITE_CONVEX_URL
VITE_CLERK_PUBLISHABLE_KEY
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
```

Server-only variables, jika dipakai oleh script/backend:

```text
CLERK_SECRET_KEY
CLERK_FRONTEND_API_URL
ADMIN_PASSWORD
VERIFIKATOR_PASSWORD
```

`*.local` tidak boleh di-commit. Variable dengan prefix `VITE_` akan tersedia di browser, jadi tidak boleh berisi secret.

## Rollback

1. Hentikan perubahan lanjutan.
2. Buka deployment history pada platform hosting.
3. Promote deployment production terakhir yang diketahui sehat.
4. Jalankan smoke test pada URL live.
5. Catat deployment yang di-rollback dan alasannya di `CHANGELOG-FIXES.md`.
6. Jika masalah berasal dari Convex function/schema, rollback frontend saja tidak cukup; gunakan deployment/version history Convex secara terpisah dan verifikasi data sebelum tindakan destruktif.

## Post-deploy verification

```powershell
npm run smoke:production -- https://idmap-dkp.web.id
```

Periksa minimal `/`, `/peta`, `/login`, `/pedoman-teknis`, dan `/dashboard`. Route protected boleh mengembalikan shell/redirect, tetapi tidak boleh 404 atau blank page.
