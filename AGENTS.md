<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## Fix Changelog Workflow

Saat mengerjakan bugfix atau perbaikan perilaku, Claude wajib memakai `CHANGELOG-FIXES.md` sebagai memori kerja.

Aturan wajib:
1. Sebelum mulai memperbaiki, cari dulu entri relevan pada changelog service/proyek terkait (`CHANGELOG-FIXES.md`) berdasarkan **gejala**: pesan error, keyword log, nama file, endpoint, atau perilaku yang rusak. Jangan membaca seluruh file; gunakan pencarian keyword yang spesifik.
2. Laporkan temuan singkat ke user sebelum coding, misalnya: `Ini mirip Fix #77, akar sebelumnya X; saya cek jalur Y dulu.` Jika tidak ada hasil, laporkan: `Belum ada entri yang cocok; saya lanjut reproduksi dari jalur X.`
3. Trigger yang dapat diberikan user saat ada bug: `cari di changelog dulu, gejala: [error message]`.
4. Setelah fix terverifikasi, tambahkan entri baru di **paling atas** tabel `CHANGELOG-FIXES.md` dengan kolom: `Tanggal`, `File`, `Masalah`, `Akar`, `Fix`, `Verifikasi`, `Pelajaran`, `Log Keyword`, dan `Deploy`.
5. Tulis entri selesai hanya setelah TERBUKTI bekerja. Jika belum terbukti, `Verifikasi` wajib `PENDING`; jangan mengklaim selesai.
6. Jika fix baru menimbulkan regresi, buat entri baru yang menyebut nomor fix penyebabnya agar pola salah tidak terulang.
7. Sertakan angka nyata saat memungkinkan: jumlah error sebelum/sesudah, hasil repro, file terdampak, hasil test, dan status deploy.
8. Setelah setiap fix, sebelum mengirim respons akhir ke user, wajib memperbarui `CHANGELOG-FIXES.md`. Jika validasi belum selesai atau gagal dijalankan, tetap buat entri dengan `Verifikasi: PENDING` dan jelaskan alasannya.
9. Di akhir respons fix, sebutkan nomor/ringkasan entri changelog yang baru dibuat, atau jelaskan bahwa entri berstatus `PENDING`.
