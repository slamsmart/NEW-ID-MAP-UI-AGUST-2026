<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## Fix Changelog Workflow

Saat mengerjakan bugfix atau perbaikan perilaku, Claude wajib memakai `CHANGELOG-FIXES.md` sebagai memori kerja.

Aturan wajib:
1. Sebelum mulai memperbaiki, cari dulu entri relevan di `CHANGELOG-FIXES.md` berdasarkan gejala / keyword error / nama file / perilaku yang rusak. Jangan membaca seluruh file bila tidak perlu; cari dengan keyword yang spesifik.
2. Laporkan temuan singkat ke user sebelum coding, misalnya: `Ini mirip Fix #77, akar sebelumnya X, saya cek jalur Y dulu.`
3. Setelah fix terverifikasi, tambahkan entri baru di paling atas tabel `CHANGELOG-FIXES.md`.
4. Jika fix belum terbukti bekerja, tandai `Verifikasi` sebagai `PENDING` dan jangan tulis klaim seolah sudah selesai.
5. Jika fix baru menimbulkan regresi, buat entri baru yang menyebut fix penyebabnya agar pola salah tidak terulang.
6. Sertakan angka nyata saat memungkinkan: jumlah error sebelum/sesudah, hasil repro, file terdampak, status deploy.
