# Pre-Deploy Checklist — ID-MAP

## Scope and source

- [ ] Saya tahu perubahan yang akan dirilis.
- [ ] `git status --short` sudah diperiksa.
- [ ] Perubahan lokal yang tidak terkait tidak ikut dirilis tanpa sengaja.
- [ ] `CHANGELOG-FIXES.md` sudah dicari berdasarkan gejala/fungsi terkait.
- [ ] Rollback deployment sebelumnya diketahui.

## Security and data

- [ ] Tidak ada `.env`, `.env.local`, atau secret yang di-stage/deploy.
- [ ] Tidak ada password, token, atau service-role key di source/bundle frontend.
- [ ] Mutation sensitif memiliki server-side `requireRole()`.
- [ ] Role dan identitas tidak dipercaya dari `localStorage` atau argument client.
- [ ] Convex deployment/database yang benar digunakan.
- [ ] Migrasi schema/data tidak dilakukan tanpa backup dan rencana rollback.

## Validation

- [ ] `npm run typecheck` lulus.
- [ ] `npm run lint` lulus.
- [ ] `npm run test` lulus.
- [ ] `npm run build` lulus.
- [ ] `npm run check` lulus secara keseluruhan.
- [ ] `npm run smoke:production -- <URL>` lulus.

## Product smoke check

- [ ] Landing page terbuka.
- [ ] Peta publik terbuka.
- [ ] Halaman login terbuka.
- [ ] Route teknis/legal terbuka.
- [ ] Route protected melakukan redirect/guard dengan benar.
- [ ] Login role yang valid dapat diuji di environment yang sesuai.
- [ ] Tidak ada white page atau `pageerror` pada route yang diubah.

## Release

- [ ] Environment variable production sudah tersedia di hosting.
- [ ] Domain production menunjuk ke deployment yang benar.
- [ ] Clerk allowed origins/redirect URL sudah sesuai.
- [ ] Convex URL dan WebSocket dapat dijangkau.
- [ ] Status deployment dicatat.
- [ ] `CHANGELOG-FIXES.md` diperbarui setelah verifikasi final.
