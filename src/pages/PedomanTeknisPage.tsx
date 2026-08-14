import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download, BookOpen } from 'lucide-react';

const PEDOMAN_TEKNIS_URL = '/pedoman-teknis.pdf';
const PEDOMAN_IMAGE_SRC = '/pedoman-teknis.png';

export default function PedomanTeknisPage() {
  useEffect(() => {
    document.title = 'Pedoman Teknis — ID-MAP Cabdin KP Malang';
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
            <BookOpen className="w-3.5 h-3.5 text-[#006a61]" />
            <span className="text-[#006a61] text-xs font-semibold tracking-[0.15em] uppercase">
              Pedoman Teknis
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
            Laman Pedoman Teknis
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Dokumen acuan teknis penggunaan aplikasi ID-MAP untuk administrator,
            verifikator, petugas lapangan, dan masyarakat umum.
          </p>
        </div>

        {/* Image card */}
        <figure className="mb-8 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-md">
          <img
            src={PEDOMAN_IMAGE_SRC}
            alt="Infografis Pedoman Teknis Aplikasi ID-MAP"
            className="block w-full h-auto"
            loading="lazy"
          />
          <figcaption className="px-4 py-3 text-xs text-gray-500 text-center bg-gray-50 border-t border-gray-100">
            Infografis Pedoman Teknis ID-MAP — Cabdin KP Kabupaten Malang
          </figcaption>
        </figure>

        {/* Download PDF CTA */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-[#006a61]/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#006a61]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                Dokumen Pedoman Teknis (PDF Lengkap)
              </h2>
              <p className="text-sm text-gray-600">
                Unduh versi lengkap untuk dokumentasi, pelatihan, atau pencetakan.
              </p>
            </div>
          </div>
          <a
            href={PEDOMAN_TEKNIS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#006a61] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#005049] transition-all whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
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