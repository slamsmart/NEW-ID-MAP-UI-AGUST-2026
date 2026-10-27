import { Wrench, Clock } from 'lucide-react';
import { hasMaintenanceBypass } from '../lib/maintenance';
import { useMaintenance } from '../hooks/useMaintenance';

/**
 * Banner pemberitahuan bahwa ada fitur yang sedang diperbaiki.
 * Tidak merender apa pun bila maintenance mode mati atau bypass dev aktif.
 *
 * Status dibaca dari saklar runtime verifikator + env — lihat
 * src/hooks/useMaintenance.ts.
 */
export default function MaintenanceNotice({ className = '' }: { className?: string }) {
  const { anyEnabled, labels, message, eta } = useMaintenance();

  if (!anyEnabled || hasMaintenanceBypass()) return null;

  return (
    <div
      role="status"
      className={`rounded-2xl border border-[#f06424]/45 bg-[#f06424]/12 px-5 py-4 backdrop-blur-md ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#f06424]/20">
          <Wrench className="h-4 w-4 text-[#ffb28e]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ffb28e]">
            Pemberitahuan pemeliharaan
          </p>
          <p className="mt-1.5 text-sm font-semibold leading-6 text-white">
            {labels.length === 1
              ? `${labels[0]} sementara tidak dapat diakses.`
              : `${labels.length} fitur sementara tidak dapat diakses: ${labels.join(', ')}.`}
          </p>
          <p className="mt-1 text-sm leading-6 text-white/70">{message}</p>
          {eta && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-white/80">
              <Clock className="h-3.5 w-3.5 text-[#ffb28e]" aria-hidden="true" />
              Perkiraan selesai: {eta}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
