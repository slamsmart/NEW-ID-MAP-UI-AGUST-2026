/**
 * DownloadDropdown
 * — Tombol "Unduh" dengan menu dropdown berisi pilihan format
 *   (PDF, GeoJSON, CSV — disesuaikan via prop `items`).
 * — Click outside untuk menutup, Escape untuk close.
 * — Auto-track ke Convex stats lewat `recordDownload(kind)`.
 */
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { recordDownload, type DownloadKind } from '../lib/statsClient';

export interface DownloadItem {
  /** Identifier untuk tracking stats. */
  kind: DownloadKind;
  /** Label tombol di dropdown. */
  label: string;
  /** Optional icon component (default: file). */
  icon?: LucideIcon;
  /** Handler eksekusi download. Dropdown akan menutup setelah klik. */
  onSelect: () => void;
}

interface DownloadDropdownProps {
  items: DownloadItem[];
  /** Override label tombol utama (default: "Unduh"). */
  buttonLabel?: string;
  /** Tampilkan label di mobile? Default true (kalau false, hanya icon). */
  showLabelOnMobile?: boolean;
  /** Class tambahan untuk tombol utama. */
  className?: string;
  /** Disabled state (mis. user belum login). */
  disabled?: boolean;
  /** Override pesan ketika disabled. */
  disabledTitle?: string;
  /** Variant warna tombol (light untuk light bg, dark untuk dark bg). */
  variant?: 'light' | 'dark';
  /** Dipanggil sebelum download; return false untuk membatalkan aksi. */
  beforeSelect?: (item: DownloadItem) => boolean;
}

export default function DownloadDropdown({
  items,
  buttonLabel = 'Unduh',
  showLabelOnMobile = true,
  className = '',
  disabled = false,
  disabledTitle,
  variant = 'light',
  beforeSelect,
}: DownloadDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Click-outside + Escape to close
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSelect = (item: DownloadItem) => {
    if (beforeSelect && !beforeSelect(item)) return;
    setOpen(false);
    // Track best-effort (non-blocking)
    void recordDownload(item.kind);
    item.onSelect();
  };

  const buttonBase =
    variant === 'dark'
      ? 'bg-white/10 border-white/30 text-white hover:bg-white/20'
      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#f06424]';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        title={disabled ? disabledTitle : 'Pilih format unduhan'}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors shadow-sm ${buttonBase} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span className={showLabelOnMobile ? 'inline' : 'hidden md:inline'}>
          {buttonLabel}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 z-[500] min-w-[220px] rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 py-1.5 animate-[idmapDropdownIn_0.16s_ease-out]"
        >
          {items.map(item => {
            const Icon = item.icon ?? Download;
            return (
              <button
                key={item.kind + item.label}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-700 hover:bg-[#0d404f]/10 hover:text-[#0d404f] transition-colors text-left"
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-[#0d404f]" />
                <span className="flex-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes idmapDropdownIn {
          0%   { opacity: 0; transform: translateY(-4px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
