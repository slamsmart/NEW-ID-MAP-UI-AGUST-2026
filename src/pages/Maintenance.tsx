import { Clock, Settings, Wrench } from 'lucide-react';
import { MAINTENANCE_MESSAGE, MAINTENANCE_ETA } from '../lib/maintenance';

interface MaintenanceProps {
  /** Teks penjelasan; default dari env/teks bawaan bila tidak diisi. */
  message?: string;
  /** Perkiraan selesai; disembunyikan bila kosong. */
  eta?: string;
}

/**
 * Halaman kunci saat maintenance mode aktif.
 * Sengaja tanpa link/tombol apa pun supaya tidak ada jalan masuk ke aplikasi.
 *
 * Pesan & ETA bisa datang dari saklar runtime verifikator (Convex
 * `siteConfig`) lewat props, atau dari env sebagai fallback.
 * Lihat src/lib/maintenance.ts dan src/hooks/useMaintenance.ts.
 */
export default function Maintenance({ message, eta }: MaintenanceProps = {}) {
  const text = (message ?? '').trim() || MAINTENANCE_MESSAGE;
  const estimate = (eta ?? '').trim() || MAINTENANCE_ETA;

  return (
    <main
      role="main"
      aria-labelledby="maintenance-title"
      className="min-h-screen bg-white flex items-center justify-center px-6 py-16 font-sans"
    >
      <div className="w-full max-w-xl text-center">
        <img
          src="/logo.png"
          alt="ID-MAP — Integrasi Data Mangrove dan Pesisir"
          draggable={false}
          className="mx-auto h-16 w-auto select-none sm:h-20"
        />

        {/* Ikon gir + kunci pas: penanda maintenance yang lazim dipakai web umum. */}
        <div className="relative mx-auto mt-10 flex h-24 w-24 items-center justify-center rounded-full bg-[#f06424]/10">
          <Settings
            className="h-12 w-12 text-[#006a61] motion-safe:animate-spin"
            style={{ animationDuration: '6s' }}
            aria-hidden="true"
          />
          <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#f06424] shadow-sm">
            <Wrench className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
        </div>

        <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-[#f06424]">
          Mode Pemeliharaan
        </p>
        <h1
          id="maintenance-title"
          className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          Situs sedang dalam perbaikan
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-600 sm:text-[15px]">
          {text}
        </p>

        {estimate && (
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[13px] font-semibold text-slate-700">
            <Clock className="h-4 w-4 text-[#f06424]" aria-hidden="true" />
            Perkiraan selesai: {estimate}
          </p>
        )}

        <p className="mt-8 text-sm text-slate-500">
          Terima kasih atas pengertiannya. Silakan kembali beberapa saat lagi.
        </p>

        <div className="mx-auto mt-10 h-px w-24 bg-slate-200" />
        <p className="mt-6 text-[11px] font-medium leading-5 text-slate-400">
          ID-MAP · Integrasi Data Mangrove dan Pesisir
          <br />
          Cabang Dinas Kelautan dan Perikanan Kab. Malang
        </p>
      </div>
    </main>
  );
}
