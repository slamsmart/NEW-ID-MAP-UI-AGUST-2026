import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Informasi yang Kami Kumpulkan',
    body: 'Kami mengumpulkan informasi yang Anda berikan saat mendaftar atau mengisi survei, seperti nama, email, unit/instansi, serta data lapangan (koordinat, foto, dan catatan monitoring). Kami juga mencatat data statistik kunjungan secara agregat untuk meningkatkan layanan.',
  },
  {
    title: '2. Penggunaan Informasi',
    body: 'Informasi yang dikumpulkan digunakan untuk: (a) memverifikasi kontribusi data lapangan, (b) menampilkan hasil monitoring kepada publik, (c) mengelola akun dan hak akses, serta (d) menyusun laporan dan rekomendasi kebijakan. Data pribadi tidak digunakan untuk tujuan lain di luar layanan ID-MAP.',
  },
  {
    title: '3. Penyimpanan & Keamanan',
    body: 'Data disimpan pada infrastruktur yang dikelola dengan standar keamanan yang wajar, termasuk enkripsi saat transmisi. Akses ke data pribadi dibatasi hanya untuk petugas yang berwenang di Cabang Dinas Kelautan dan Perikanan Kabupaten Malang.',
  },
  {
    title: '4. Berbagi Data',
    body: 'Data spasial dan hasil monitoring dipublikasikan untuk kepentingan konservasi dan penelitian. Data pribadi (nama, email, kontak) tidak dijual, disewakan, atau dibagikan kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh peraturan perundang-undangan.',
  },
  {
    title: '5. Hak Anda',
    body: 'Anda berhak mengakses, memperbaiki, atau meminta penghapusan data pribadi Anda, serta menarik persetujuan penggunaan data kapan saja. Permintaan dapat diajukan melalui email idmap.cabdinmalang@jatimprov.go.id dan akan ditindaklanjuti dalam waktu yang wajar.',
  },
  {
    title: '6. Cookie & Pelacakan',
    body: 'Platform ini dapat menggunakan cookie dan mekanisme pelacakan sederhana untuk keperluan sesi login dan statistik kunjungan. Anda dapat menonaktifkan cookie melalui pengaturan browser, namun sebagian fitur mungkin tidak berfungsi optimal.',
  },
  {
    title: '7. Perubahan Kebijakan',
    body: 'Kebijakan Privasi ini dapat diperbarui sewaktu-waktu mengikuti perkembangan layanan dan peraturan. Perubahan akan diumumkan melalui halaman ini, dan penggunaan berkelanjutan dianggap sebagai penerimaan atas kebijakan terbaru.',
  },
  {
    title: '8. Kontak',
    body: 'Jika Anda memiliki pertanyaan atau kekhawatiran terkait privasi, silakan hubungi Cabang Dinas Kelautan dan Perikanan Kabupaten Malang melalui email idmap.cabdinmalang@jatimprov.go.id.',
  },
];

export default function KebijakanPrivasi() {
  useEffect(() => {
    document.title = 'Kebijakan Privasi — ID-MAP';
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#006a61] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <img src="/logo.png" alt="ID-MAP" className="h-8 w-auto" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        {/* Title */}
        <div className="mb-8 sm:mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#006a61]/20 bg-[#006a61]/5 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#006a61]" />
            <span className="text-[#006a61] text-xs font-semibold tracking-[0.15em] uppercase">
              Kebijakan Privasi
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
            Kebijakan Privasi
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Bagaimana ID-MAP mengelola, menyimpan, dan melindungi data pribadi
            serta kontribusi data dari pengguna platform.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {SECTIONS.map((s) => (
            <section
              key={s.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-7 shadow-sm"
            >
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-sm sm:text-[15px] leading-7 text-gray-600">{s.body}</p>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Cabang Dinas Kelautan dan Perikanan Kabupaten Malang
        </div>
      </footer>
    </div>
  );
}
