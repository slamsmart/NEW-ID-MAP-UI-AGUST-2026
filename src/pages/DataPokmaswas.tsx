import { useState } from 'react';
import {
  Users, Search, MapPin, Eye, EyeOff,
  Pencil, Filter, Plus, Trash2,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { getOverrides } from '../lib/coordOverrides';
import { usePokmaswas } from '../hooks/usePokmaswas';
import { deletePokmaswas } from '../lib/pokmaswasConvex';
import type { PokmaswasRecord } from '../data/pokmaswasData';
import PokmaswasFormModal from '../components/PokmaswasFormModal';

export default function DataPokmaswas() {
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'verifikator';
  const { records } = usePokmaswas();

  const [search, setSearch] = useState('');
  const [filterKab, setFilterKab] = useState<string>('semua');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PokmaswasRecord | null>(null);

  // Unique kabupaten/kota list
  const kabList = [...new Set(records.map((p) => p.kabupatenKota))];

  // Filter data
  const filtered = records.filter((p) => {
    if (filterKab !== 'semua' && p.kabupatenKota !== filterKab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.nama.toLowerCase().includes(q) ||
        p.ketua.toLowerCase().includes(q) ||
        p.alamat.toLowerCase().includes(q) ||
        p.kabupatenKota.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const overrides = getOverrides();

  const getEffectiveCoords = (record: PokmaswasRecord) => {
    const o = overrides[record.id];
    return o
      ? { lat: o.lat, lng: o.lng, isOverridden: true }
      : { lat: record.lat, lng: record.lng, isOverridden: false };
  };

  const handleDelete = async (record: PokmaswasRecord) => {
    if (!confirm(`Hapus Pokmaswas "${record.nama}"?`)) return;
    try {
      await deletePokmaswas(record.id);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal menghapus data.');
    }
  };

  /**
   * Nomor HP ditampilkan penuh hanya untuk admin/verifikator.
   * User publik (viewer) melihat nomor yang di-blur/mask.
   */
  const renderPhone = (noHp: string) => {
    if (!noHp) return <span className="text-gray-400 text-xs">—</span>;
    if (isStaff) {
      return <span className="font-mono text-xs text-gray-700">{noHp}</span>;
    }
    const masked = noHp.slice(0, 6) + '••••••••';
    return (
      <span
        className="font-mono text-xs text-gray-400 select-none flex items-center gap-1"
        title="Login sebagai admin/verifikator untuk melihat nomor lengkap"
      >
        <EyeOff className="w-3 h-3" />
        {masked}
      </span>
    );
  };

  const renderProfile = (record: PokmaswasRecord) => {
    if (!record.ruangLingkup && !record.kawasanPantai && (!record.bidangCore || record.bidangCore.length === 0)) {
      return <span className="text-gray-300 text-xs">—</span>;
    }
    return (
      <div className="space-y-1 max-w-[220px]">
        {record.ruangLingkup && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              {record.ruangLingkup}
            </span>
          </div>
        )}
        {record.kawasanPantai && (
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
            {record.kawasanPantai}
          </div>
        )}
        {record.bidangCore && record.bidangCore.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {record.bidangCore.slice(0, 3).map((b) => (
              <span
                key={b}
                className="text-[10px] bg-[#0d404f]/10 text-[#0d404f] border border-[#0d404f]/25 px-1.5 py-0.5 rounded-full"
              >
                {b}
              </span>
            ))}
            {record.bidangCore.length > 3 && (
              <span className="text-[10px] text-gray-400">
                +{record.bidangCore.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0d404f]" />
            Data Pokmaswas
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelompok Masyarakat Pengawas Konservasi — Wilker Cabdin KP Kab. Malang (2022)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStaff && (
            <button
              onClick={() => {
                setEditingRecord(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Tambah Pokmaswas
            </button>
          )}
          <span className="bg-[#0d404f]/10 text-[#0d404f] font-semibold px-2.5 py-1 rounded-lg border border-[#0d404f]/25">
            {filtered.length} kelompok
          </span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama kelompok, ketua, atau alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm border-none outline-none bg-transparent placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterKab}
            onChange={(e) => setFilterKab(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:border-[#f06424]"
          >
            <option value="semua">Semua Kab/Kota</option>
            {kabList.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Kab/Kota</th>
                <th className="px-4 py-3 text-left">Nama Kelompok</th>
                <th className="px-4 py-3 text-left">Alamat</th>
                <th className="px-4 py-3 text-left">Ketua</th>
                <th className="px-4 py-3 text-left">No HP</th>
                <th className="px-4 py-3 text-center">Koordinat</th>
                <th className="px-4 py-3 text-left">Profil</th>
                {isStaff && <th className="px-4 py-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((record) => {
                const coords = getEffectiveCoords(record);
                const isCustom = !!record.isCustom;

                return (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {record.no}
                      {isCustom && (
                        <span className="block text-[9px] text-purple-600 font-semibold">
                          (baru)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {record.kabupatenKota}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{record.nama}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="leading-tight">{record.alamat}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{record.ketua}</td>
                    <td className="px-4 py-3">{renderPhone(record.noHp)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-xs font-mono text-gray-500">
                        <span>{coords.lat.toFixed(4)}</span>
                        <br />
                        <span>{coords.lng.toFixed(4)}</span>
                        {coords.isOverridden && (
                          <span className="block text-[10px] text-amber-600 font-semibold mt-0.5">
                            (diedit)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{renderProfile(record)}</td>
                    {isStaff && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingRecord(record);
                              setModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                            title="Edit via form"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          {isCustom && (
                            <button
                              onClick={() => handleDelete(record)}
                              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Eye className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-700 leading-relaxed">
          <p className="font-semibold mb-1">Catatan Privasi & Penyimpanan</p>
          <p>
            Nomor HP ketua pokmaswas hanya dapat dilihat oleh admin dan verifikator.
            User publik akan melihat nomor yang disamarkan (blur). Entri baru dari
            form "Tambah Pokmaswas" disimpan di backend Convex dan muncul langsung di
            tabel ini serta Peta Interaktif. Koordinat lokasi dapat diedit oleh
            admin/verifikator dan akan ditampilkan di Peta Interaktif.
          </p>
        </div>
      </div>

      <PokmaswasFormModal
        open={modalOpen}
        initial={editingRecord}
        onClose={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        onSaved={() => { /* hook otomatis refresh via watchQuery */ }}
      />
    </div>
  );
}
