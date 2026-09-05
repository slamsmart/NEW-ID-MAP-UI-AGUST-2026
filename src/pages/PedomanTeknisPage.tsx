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
    <div className="min-h-screen bg-[#071520] font-sans text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/15 bg-[#071520]/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <img src="/logo-header.png" alt="ID-MAP" className="h-8 w-auto" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        {/* Title */}
        <div className="mb-8 sm:mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.08] backdrop-blur-xl mb-4">
            <BookOpen className="w-3.5 h-3.5 text-[#ffb28e]" />
            <span className="text-[#ffb28e] text-xs font-semibold tracking-[0.15em] uppercase">
              Pedoman Teknis
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Laman Pedoman Teknis
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Dokumen acuan teknis penggunaan aplikasi ID-MAP untuk administrator,
            verifikator, petugas lapangan, dan masyarakat umum.
          </p>
        </div>

        {/* Image card */}
        <figure className="mb-8 rounded-2xl overflow-hidden border border-white/15 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,.1)]">
          <img
            src={PEDOMAN_IMAGE_SRC}
            alt="Infografis Pedoman Teknis Aplikasi ID-MAP"
            className="block w-full h-auto"
            loading="lazy"
          />
          <figcaption className="px-4 py-3 text-xs text-white/50 text-center bg-white/[0.04] border-t border-white/10">
            Infografis Pedoman Teknis ID-MAP — Cabdin KP Kabupaten Malang
          </figcaption>
        </figure>

        {/* Download PDF CTA */}
        <div className="rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.12)] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-[#f06424]/15 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#f06424]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-1">
                Dokumen Pedoman Teknis (PDF Lengkap)
              </h2>
              <p className="text-sm text-white/70">
                Unduh versi lengkap untuk dokumentasi, pelatihan, atau pencetakan.
              </p>
            </div>
          </div>
          <a
            href={PEDOMAN_TEKNIS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#f06424] text-white px-5 py-3 rounded-full text-sm font-bold hover:bg-[#d9531b] transition-all whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#071520] py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Cabang Dinas Kelautan dan Perikanan Kabupaten Malang
        </div>
      </footer>
    </div>
  );
}
