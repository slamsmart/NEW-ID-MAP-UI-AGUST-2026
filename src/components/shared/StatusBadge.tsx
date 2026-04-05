interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  lebat: { label: 'Lebat', className: 'bg-green-100 text-green-800 border-green-200' },
  sedang: { label: 'Sedang', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  jarang: { label: 'Jarang', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  kritis: { label: 'Kritis', className: 'bg-red-100 text-red-800 border-red-200' },
  konservasi: { label: 'Kaw. Konservasi', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  hutan_lindung: { label: 'Hutan Lindung', className: 'bg-teal-100 text-teal-800 border-teal-200' },
  apl: { label: 'APL', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  aman: { label: 'Aman', className: 'bg-green-100 text-green-800 border-green-200' },
  proses_legal: { label: 'Proses Legal', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  bersengketa: { label: 'Bersengketa', className: 'bg-red-100 text-red-800 border-red-200' },
  tinggi: { label: 'Tinggi', className: 'bg-green-100 text-green-800 border-green-200' },
  rendah: { label: 'Rendah', className: 'bg-red-100 text-red-800 border-red-200' },
  critical: { label: 'Kritis', className: 'bg-red-100 text-red-800 border-red-200' },
  warning: { label: 'Peringatan', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  info: { label: 'Info', className: 'bg-blue-100 text-blue-800 border-blue-200' },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const cfg = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200' };
  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium ${cfg.className} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      {cfg.label}
    </span>
  );
}
