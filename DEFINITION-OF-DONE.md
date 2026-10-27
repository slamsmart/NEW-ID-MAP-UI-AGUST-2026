# Definition of Done — ID-MAP

Dokumen ini adalah gate minimum untuk bugfix, feature, dan deployment. Jika satu item wajib belum terpenuhi, pekerjaan belum boleh dinyatakan selesai.

## A. Bugfix atau perubahan perilaku

- [ ] Gejala dan root cause tertulis.
- [ ] Changelog dicari berdasarkan keyword gejala sebelum coding.
- [ ] Scope perubahan dibatasi pada file/fungsi yang relevan.
- [ ] Perubahan tidak mem-bypass server-side authorization.
- [ ] TypeScript/typecheck lulus.
- [ ] Lint lulus tanpa error baru.
- [ ] Test terkait lulus; jika belum ada test yang relevan, gap dicatat.
- [ ] Production build lulus.
- [ ] Smoke test route yang terdampak lulus.
- [ ] `CHANGELOG-FIXES.md` diperbarui setelah hasil verifikasi tersedia.

## B. Perubahan Convex atau data

- [ ] `convex/_generated/ai/guidelines.md` dibaca sebelum mengubah Convex.
- [ ] Semua function memiliki validator args dan returns.
- [ ] Mutation sensitif memiliki `requireRole()` di server.
- [ ] Identitas authorization berasal dari `ctx.auth`, bukan dari `userId`/role client.
- [ ] Query besar memiliki limit atau pagination yang disadari dan terdokumentasi.
- [ ] Schema/data lama dan offline queue tetap kompatibel.

## C. Deployment

- [ ] `npm run check` lulus.
- [ ] Environment production tersedia di platform deployment.
- [ ] Secret tidak memakai prefix `VITE_` dan tidak masuk bundle browser.
- [ ] SPA rewrite dan asset static tersedia.
- [ ] `npm run smoke:production -- <URL>` lulus.
- [ ] URL live, provider auth, Convex, Cloudinary, dan PWA diuji sesuai scope.
- [ ] Rollback target dan commit/deployment sebelumnya diketahui.
- [ ] Status deploy dicatat di changelog.

## Exceptions

Jika validasi tidak dapat dijalankan, jangan menandai pekerjaan sebagai selesai. Catat alasan, command yang dicoba, dan gunakan `Verifikasi: PENDING` di changelog.
