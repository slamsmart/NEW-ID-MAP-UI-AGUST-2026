# Setup Clerk untuk User Umum (Google Sign-In)

Tujuan: user publik bisa login/daftar pakai akun Google tanpa isi form,
lalu bisa **Unduh PDF** dan akses fitur peta penuh.

Akun **admin & verifikator** TIDAK pakai Clerk — tetap di `ADMIN_ACCOUNTS`
hardcoded (`@/src/context/authAccounts.ts`).

## 1. Buat Application di Clerk Dashboard

1. Buka <https://dashboard.clerk.com> → **Create application**.
2. Beri nama (mis. `ID-MAP Cabdin Malang`).
3. **Sign-in options** → centang **Email** + **Google**.
4. Klik **Create application**.

## 2. Aktifkan Google sebagai SSO

1. Sidebar → **User & Authentication → SSO Connections**.
2. Pastikan **Google** **enabled**. Untuk development, Clerk menyediakan
   shared OAuth client default — tinggal toggle on.
3. Untuk production, isi **Custom credentials** (Google Cloud Console →
   OAuth 2.0 Client IDs → Web application). Authorized redirect URI:
   `https://accounts.<your-clerk-frontend>.clerk.accounts.dev/v1/oauth_callback`
   (lihat instruksi tepat di halaman Clerk).

## 3. Salin Publishable Key

1. Sidebar → **API Keys** → tab **React**.
2. Salin **Publishable key** (`pk_test_...` atau `pk_live_...`).
3. Tempel ke `.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```

4. Restart `npm run dev`.

## 4. Cek integrasi

- Buka halaman peta publik → klik tombol **Login** atau tombol **Unduh** di toolbar.
- Modal `AuthGateModal` muncul dengan tombol **Lanjut dengan Google**.
- Klik → modal Clerk hosted muncul → pilih akun Google → otomatis kembali
  ke aplikasi dan dialihkan ke `/dashboard`.
- Profil tersimpan otomatis di Convex `userProfiles` (lihat Convex Dashboard
  → Tables → userProfiles, ada baris dengan `clerkId` terisi).

## 5. Arsitektur singkat

```
[user click "Lanjut dengan Google"]
        │
        ▼
Clerk hosted UI (Google OAuth)
        │  selesai
        ▼
ClerkProvider (main.tsx) → useUser()
        │
        ▼
ClerkBridge.tsx
  ├─ convex.mutation(api.profiles.upsert, { clerkId, nama, email, ... })
  └─ AuthContext.signInExternal(authUser)
        │
        ▼
useAuth().user terisi → seluruh app treat seperti login normal
(tombol Unduh PDF, akses dashboard, dll. langsung enabled)
```

## 6. Sign-out

Tombol Logout di app memanggil `AuthContext.logout()`. `ClerkBridge` mendeteksi
`localUser=null && clerkSignedIn=true` → otomatis panggil Clerk `signOut()`,
sehingga sesi Clerk juga dibersihkan.

## 7. (Opsional) Convex JWT Integration

Untuk mengizinkan Convex queries memvalidasi token Clerk secara native
(mis. proteksi mutation by `ctx.auth.getUserIdentity()`), buat
`convex/auth.config.ts`:

```ts
export default {
  providers: [
    {
      domain: 'https://<your-clerk-frontend>.clerk.accounts.dev',
      applicationID: 'convex',
    },
  ],
};
```

Lalu di Clerk Dashboard → **JWT Templates → New template → Convex**.
Tidak wajib untuk Phase F sekarang — sync via `ClerkBridge` sudah cukup.
