import { Database, Satellite, Leaf, Waves, Users, BookOpen, ExternalLink } from 'lucide-react';
import { dataSources, type DataSource } from '../../data/mockData';

const KATEGORI_CONFIG: Record<DataSource['kategori'], { label: string; icon: typeof Database; color: string; bg: string }> = {
  spasial:    { label: 'Spasial / Citra', icon: Satellite, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  ekosistem:  { label: 'Ekosistem',       icon: Leaf,      color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  lingkungan: { label: 'Lingkungan',      icon: Waves,     color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  sosial:     { label: 'Sosial-Ekonomi',  icon: Users,     color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  referensi:  { label: 'Referensi',       icon: BookOpen,  color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
};

const KATEGORI_ORDER: DataSource['kategori'][] = ['spasial', 'ekosistem', 'lingkungan', 'sosial', 'referensi'];

export default function DataSourcesPanel() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 bg-slate-800">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-slate-300" />
          <div>
            <h3 className="font-bold text-white">Sumber Data & Referensi Ilmiah</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Seluruh data dalam ID-MAP bersumber dari lembaga resmi pemerintah dan institusi riset bereputasi internasional
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {KATEGORI_ORDER.map(kategori => {
          const sources = dataSources.filter(d => d.kategori === kategori);
          if (sources.length === 0) return null;
          const cfg = KATEGORI_CONFIG[kategori];
          const Icon = cfg.icon;

          return (
            <div key={kategori}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <h4 className={`text-sm font-bold ${cfg.color}`}>
                  Data {cfg.label}
                </h4>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color} ${cfg.bg}`}>
                  {sources.length} sumber
                </span>
              </div>

              <div className="space-y-2">
                {sources.map(src => (
                  <div
                    key={src.id}
                    className={`border rounded-xl p-4 ${cfg.bg}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-gray-400">{src.id}</span>
                          <h5 className={`text-sm font-bold ${cfg.color}`}>{src.nama}</h5>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 mt-0.5">{src.institusi}</p>
                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{src.keterangan}</p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                          {src.resolusi && (
                            <span className="text-xs text-gray-500">
                              <span className="font-medium">Resolusi:</span> {src.resolusi}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            <span className="font-medium">Update:</span> {src.pembaruan}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-gray-400 bg-white/60 border border-gray-200 rounded-lg px-2 py-1">
                          <ExternalLink className="w-3 h-3" />
                          <span className="font-mono">{src.url}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800 mb-1">Catatan Penggunaan Data</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Data dalam sistem ID-MAP merupakan integrasi dari berbagai sumber resmi dan terbuka.
                Data lapangan (ground check) dilengkapi oleh petugas Dinas Kelautan dan Perikanan (DKP)
                di masing-masing daerah. Pembaruan data dilakukan secara berkala mengikuti siklus monitoring
                tiap instansi terkait. Untuk penggunaan data dalam publikasi ilmiah, harap merujuk langsung
                ke sumber primer masing-masing institusi.
              </p>
              <p className="text-xs text-amber-600 mt-1.5 font-medium">
                Versi Data: Q1 2025 | Terakhir diperbarui: April 2025 | ID-MAP v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
