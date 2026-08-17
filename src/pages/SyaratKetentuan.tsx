import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Penerimaan Ketentuan',
    body: 'Dengan mengakses atau menggunakan platform ID-MAP (Integrasi Data Mangrove dan Pesisir), Anda dianggap telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan ini. Jika Anda tidak menyetujui sebagian atau seluruh ketentuan, mohon tidak menggunakan layanan ini.',
  },
  {
    title: '2. Layanan yang Disediakan',
    body: 'ID-MAP menyediakan visualisasi peta interaktif, data monitoring ekosistem mangrove dan pesisir, hasil survei lapangan, serta fitur unduh data. Layanan ini dikelola oleh Cabang Dinas Kelautan dan Perikanan Kabupaten Malang untuk mendukung konservasi dan pengambilan keputusan berbasis data.',
  },
  {
    title: '3. Akun & Tanggung Jawab Pengguna',
    body: 'Pengguna yang mendaftar bertanggung jawab penuh atas kerahasiaan kredensial akunnya. Akun hanya boleh digunakan oleh pemiliknya. Setiap aktivitas yang terjadi melalui akun Anda menjadi tanggung jawab Anda. Penyalahgunaan akses dapat mengakibatkan pembekuan akun.',
  },
  {
    title: '4. Data & Kontribusi',
    body: 'Data yang dikirim melalui survei lapangan akan diverifikasi oleh tim ahli sebelum dipublikasikan. Kontributor menjamin data yang disampaikan akurat dan tidak melanggar hak pihak lain. Data yang belum lolos verifikasi tidak akan ditampilkan kepada publik.',
  },
  {
    title: '5. Penggunaan Data',
    body: 'Data yang ditampilkan dapat digunakan untuk keperluan akademik, penelitian, dan kebijakan publik dengan tetap mencantumkan sumber (ID-MAP, Cabdin KP Kab. Malang). Penggunaan untuk kepentingan komersial tanpa izin tertulis tidak diperbolehkan.',
  },
  {
    title: '6. Batasan Tanggung Jawab',
    body: 'ID-MAP disediakan "sebagaimana adanya". Kami berupaya menjaga akurasi data, namun tidak menjamin data bebas dari kesalahan. Segala keputusan yang diambil berdasarkan data ID-MAP menjadi tanggung jawab pengguna sepenuhnya.',
  },
  {
    title: '7. Perubahan Ketentuan',
    body: 'Ketentuan ini dapat diperbarui sewaktu-waktu. Perubahan akan diumumkan melalui halaman ini. Penggunaan berkelanjutan atas platform setelah perubahan dianggap sebagai penerimaan atas ketentuan terbaru.',
  },
  {
    title: '8. Kontak',
    body: 'Pertanyaan terkait Syarat & Ketentuan dapat disampaikan melalui email idmap.cabdinmalang@jatimprov.go.id atau menghubungi Cabang Dinas Kelautan dan Perikanan Kabupaten Malang.',
  },
];

export default function SyaratKetentuan() {
  useEffect(() => {
    document.title = 'Syarat & Ketentuan — ID-MAP';
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
            <Scale className="w-3.5 h-3.5 text-[#006a61]" />
            <span className="text-[#006a61] text-xs font-semibold tracking-[0.15em] uppercase">
              Syarat & Ketentuan
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
            Syarat & Ketentuan Penggunaan
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Ketentuan yang mengatur penggunaan platform ID-MAP bagi masyarakat,
            akademisi, petugas lapangan, verifikator, dan administrator.
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
