import { useEffect, useState } from 'react';
import { X, Save, Plus, Trash2, MapPin } from 'lucide-react';
import { parseCoord } from '../lib/coordParser';
import { removeOverride } from '../lib/coordOverrides';
import { useAuth } from '../context/useAuth';
import {
  RUANG_LINGKUP_OPTIONS,
  BIDANG_CORE_OPTIONS,
  KAB_KOTA_OPTIONS,
} from '../data/pokmaswasProfile';
import type { PokmaswasRecord } from '../data/pokmaswasData';
import { addPokmaswas, updatePokmaswas } from '../lib/pokmaswasConvex';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Record yang diedit (null = tambah baru). */
  initial?: PokmaswasRecord | null;
  onSaved: () => void;
}

export default function PokmaswasFormModal({ open, onClose, initial, onSaved }: Props) {
  const { user } = useAuth();
  const isEdit = !!initial;

  const [kabupatenKota, setKabupatenKota] = useState('');
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [ketua, setKetua] = useState('');
  const [noHp, setNoHp] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [ruangLingkup, setRuangLingkup] = useState('');
  const [kawasanPantai, setKawasanPantai] = useState('');
  const [bidangCore, setBidangCore] = useState<string[]>([]);
  const [bidangCustom, setBidangCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setKabupatenKota(initial?.kabupatenKota ?? 'KAB. MALANG');
    setNama(initial?.nama ?? '');
    setAlamat(initial?.alamat ?? '');
    setKetua(initial?.ketua ?? '');
    setNoHp(initial?.noHp ?? '');
    setLat(initial ? String(initial.lat) : '');
    setLng(initial ? String(initial.lng) : '');
    setKawasanPantai(initial?.kawasanPantai ?? '');
    setBidangCustom('');
    const rl = initial?.ruangLingkup;
    setRuangLingkup(rl && RUANG_LINGKUP_OPTIONS.includes(rl) ? rl : '');
    setBidangCore(initial?.bidangCore ?? []);
  }, [open, initial]);

  if (!open) return null;

  const finalRuangLingkup = ruangLingkup;

  const toggleBidang = (b: string) => {
    setBidangCore((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );
  };

  const addCustomBidang = () => {
    const v = bidangCustom.trim();
    if (v && !bidangCore.includes(v)) {
      setBidangCore((prev) => [...prev, v]);
    }
    setBidangCustom('');
  };

  const handleSubmit = async () => {
    setError(null);
    if (!nama.trim() || !kabupatenKota.trim() || !alamat.trim() || !ketua.trim()) {
      setError('Nama, Kab/Kota, Alamat, dan Ketua wajib diisi.');
      return;
    }
    const plat = parseFloat(parseCoord(lat) ?? '');
    const plng = parseFloat(parseCoord(lng) ?? '');
    if (isNaN(plat) || isNaN(plng)) {
      setError('Koordinat Lat/Lng tidak valid.');
      return;
    }
    if (!finalRuangLingkup) {
      setError('Pilih ruang lingkup kelompok.');
      return;
    }

    const payload = {
      no: initial?.no,
      kabupatenKota: kabupatenKota.trim(),
      nama: nama.trim(),
      alamat: alamat.trim(),
      ketua: ketua.trim(),
      noHp: noHp.trim(),
      lat: plat,
      lng: plng,
      ruangLingkup: finalRuangLingkup,
      kawasanPantai: kawasanPantai.trim() || undefined,
      bidangCore,
      createdBy: user?.nama,
    };

    try {
      setSaving(true);
      if (isEdit && initial) {
        await updatePokmaswas(initial.id, payload);
        removeOverride(initial.id);
      } else {
        await addPokmaswas(payload);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:border-[#f06424] focus:bg-white';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            {isEdit ? 'Edit Pokmaswas' : 'Tambah Pokmaswas'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kab/Kota *</label>
              <select
                value={kabupatenKota}
                onChange={(e) => setKabupatenKota(e.target.value)}
                className={inputCls}
              >
                {KAB_KOTA_OPTIONS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
                {!KAB_KOTA_OPTIONS.includes(kabupatenKota) && (
                  <option value={kabupatenKota}>{kabupatenKota}</option>
                )}
              </select>
            </div>
            <div>
              <label className={labelCls}>Nama Kelompok *</label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="mis. Licin Samudera Timur"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Alamat *</label>
            <input
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Desa, Kecamatan"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Ketua *</label>
              <input
                value={ketua}
                onChange={(e) => setKetua(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>No HP</label>
              <input
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="62 8xx-xxxx-xxxx"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Latitude *</label>
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                onBlur={(e) => {
                  const p = parseCoord(e.target.value);
                  if (p) setLat(p);
                }}
                placeholder="-8.435"
                className={`${inputCls} font-mono`}
              />
            </div>
            <div>
              <label className={labelCls}>Longitude *</label>
              <input
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                onBlur={(e) => {
                  const p = parseCoord(e.target.value);
                  if (p) setLng(p);
                }}
                placeholder="112.620"
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>

          {/* Profil */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-3">
              Profil Pokmaswas
            </p>

            <div>
              <label className={labelCls}>Ruang Lingkup *</label>
              <select
                value={ruangLingkup}
                onChange={(e) => setRuangLingkup(e.target.value)}
                className={inputCls}
              >
                <option value="">— Pilih ruang lingkup —</option>
                {RUANG_LINGKUP_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <label className={labelCls}>Kawasan Pantai</label>
              <input
                value={kawasanPantai}
                onChange={(e) => setKawasanPantai(e.target.value)}
                placeholder="mis. Pantai Sendang Biru"
                className={inputCls}
              />
            </div>

            <div className="mt-3">
              <label className={labelCls}>Bidang / Core yang Ditekuni</label>
              <div className="flex flex-wrap gap-1.5">
                {BIDANG_CORE_OPTIONS.map((b) => {
                  const active = bidangCore.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBidang(b)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        active
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  value={bidangCustom}
                  onChange={(e) => setBidangCustom(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomBidang();
                    }
                  }}
                  placeholder="Tambah bidang lain…"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addCustomBidang}
                  className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg flex-shrink-0"
                >
                  <Plus className="w-3 h-3" /> Tambah
                </button>
              </div>
              {bidangCore.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {bidangCore.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full"
                    >
                      {b}
                      <button
                        type="button"
                        onClick={() => toggleBidang(b)}
                        className="hover:text-purple-900"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="text-sm font-medium text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-1.5 bg-[#071520] hover:bg-[#0d404f] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}
