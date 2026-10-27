/**
 * MaintenanceToggle — saklar mode pemeliharaan situs untuk verifikator.
 *
 * Digeser ke ON  → seluruh situs menampilkan halaman Maintenance untuk
 *                  semua pengunjung (lihat MaintenanceGate di src/App.tsx).
 * Digeser ke OFF → situs kembali normal.
 *
 * Verifikator & admin tidak ikut terkunci, jadi saklar ini selalu bisa
 * dimatikan kembali dari halaman ini. Status disimpan di Convex
 * (tabel `siteConfig`) sehingga berlaku realtime tanpa rebuild/redeploy.
 */
import { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { AlertTriangle, Check, Clock, Loader2, Wrench } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { isConvexConfigured } from '../lib/convexClient';
import { useMaintenance } from '../hooks/useMaintenance';

function formatUpdatedAt(timestamp?: number): string {
  if (!timestamp) return '';
  try {
    return new Date(timestamp).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function MaintenanceToggle() {
  const { siteWideEnabled, remoteLoading, remoteUnavailable, updatedBy, updatedAt } =
    useMaintenance();
  const setMaintenance = useMutation(api.siteConfig.setMaintenance);

  const [message, setMessage] = useState('');
  const [eta, setEta] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const configured = isConvexConfigured();
  // Saklar hanya bisa dipakai bila langganan `siteConfig` benar-benar hidup.
  const disabled = !configured || remoteUnavailable || remoteLoading || isSaving;

  // Sembunyikan notifikasi "tersimpan" setelah beberapa detik.
  useEffect(() => {
    if (!savedAt) return;
    const timer = setTimeout(() => setSavedAt(null), 2500);
    return () => clearTimeout(timer);
  }, [savedAt]);

  const apply = async (enabled: boolean) => {
    if (isSaving) return;

    // Menyalakan = menutup situs untuk semua pengunjung → minta konfirmasi.
    if (enabled) {
      const ok = window.confirm(
        'Nyalakan mode pemeliharaan?\n\n' +
          'Seluruh situs akan ditutup untuk semua pengunjung dan hanya ' +
          'menampilkan halaman pemeliharaan. Akun verifikator & admin tetap ' +
          'bisa mengakses situs untuk mematikannya kembali.',
      );
      if (!ok) return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await setMaintenance({
        enabled,
        message: message.trim() || undefined,
        eta: eta.trim() || undefined,
      });
      setSavedAt(Date.now());
    } catch (err) {
      console.error('Gagal mengubah mode pemeliharaan:', err);
      setError(
        'Gagal menyimpan. Pastikan Anda login sebagai verifikator dan koneksi stabil.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const lastUpdate = formatUpdatedAt(updatedAt);

  return (
    <section
      className={`rounded-xl border p-4 shadow-sm transition-colors ${
        siteWideEnabled
          ? 'border-amber-300 bg-amber-50'
          : 'border-gray-200 bg-white'
      }`}
      aria-labelledby="maintenance-toggle-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
              siteWideEnabled ? 'bg-[#f06424]' : 'bg-[#006a61]'
            }`}
          >
            <Wrench className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs text-gray-400">Pengaturan Situs</p>
            <p id="maintenance-toggle-title" className="text-sm font-bold text-gray-800">
              Mode Pemeliharaan Website
            </p>
            <p className="mt-1 max-w-md text-xs leading-5 text-gray-500">
              {siteWideEnabled
                ? 'Situs sedang ditutup. Pengunjung hanya melihat halaman pemeliharaan. Anda tetap bisa mengakses semua halaman.'
                : 'Situs berjalan normal. Geser untuk menutup seluruh situs sementara selama perbaikan.'}
            </p>
          </div>
        </div>

        {/* Saklar geser */}
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              siteWideEnabled ? 'text-[#f06424]' : 'text-gray-400'
            }`}
          >
            {remoteLoading ? 'Memuat...' : siteWideEnabled ? 'On' : 'Off'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={siteWideEnabled}
            aria-label="Mode pemeliharaan website"
            disabled={disabled}
            onClick={() => void apply(!siteWideEnabled)}
            className={`relative inline-flex h-7 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006a61] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              siteWideEnabled ? 'bg-[#f06424]' : 'bg-gray-300'
            }`}
            style={{ width: '3.25rem' }}
          >
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform ${
                siteWideEnabled ? 'translate-x-[1.75rem]' : 'translate-x-1'
              }`}
            >
              {isSaving && (
                <Loader2 className="h-3 w-3 animate-spin text-gray-500" aria-hidden="true" />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Pesan & ETA opsional yang ditampilkan di halaman pemeliharaan */}
      <div className="mt-4 grid gap-3 border-t border-gray-200/70 pt-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold text-gray-600">
            Pesan untuk pengunjung <span className="font-normal text-gray-400">(opsional)</span>
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Kosongkan untuk memakai teks bawaan."
            className="mt-1.5 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#006a61]"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-600">
            Perkiraan selesai <span className="font-normal text-gray-400">(opsional)</span>
          </span>
          <input
            type="text"
            value={eta}
            onChange={(e) => setEta(e.target.value)}
            placeholder="mis. hari ini, 17.00 WIB"
            className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#006a61]"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => void apply(siteWideEnabled)}
            className="mt-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Simpan pesan & perkiraan
          </button>
        </label>
      </div>

      {/* Status */}
      {!configured && (
        <p className="mt-3 flex items-start gap-2 text-xs text-amber-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          Convex belum dikonfigurasi (<code>VITE_CONVEX_URL</code>), saklar tidak dapat dipakai.
        </p>
      )}
      {configured && remoteUnavailable && (
        <p className="mt-3 flex items-start gap-2 text-xs text-amber-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          Fungsi <code>siteConfig</code> belum tersedia di backend Convex. Jalankan{' '}
          <code>npx convex deploy</code> (atau <code>npx convex dev</code>) lebih dulu,
          lalu muat ulang halaman ini.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-xs text-red-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {savedAt && !error && (
        <p role="status" className="mt-3 flex items-center gap-2 text-xs font-semibold text-green-700">
          <Check className="h-3.5 w-3.5" aria-hidden="true" /> Perubahan tersimpan.
        </p>
      )}
      {lastUpdate && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
          <Clock className="h-3 w-3" aria-hidden="true" />
          Terakhir diubah {lastUpdate}
          {updatedBy ? ` oleh ${updatedBy}` : ''}
        </p>
      )}
    </section>
  );
}
