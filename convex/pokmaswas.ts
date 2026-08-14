import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Pokmaswas — Kelompok Masyarakat Pengawas Konservasi.
 *
 * Seed awal (PKM-001..PKM-044) disimpan di file statis di klien.
 * Tabel ini hanya menampung entri yang di-input lewat form admin.
 * Nomor urut baru dilanjutkan dari STATIC_BASE agar tidak bentrok
 * dengan ID statis (PKM-001..PKM-044).
 */
const STATIC_BASE = 44;

const pokmaswasReturn = v.object({
  _id: v.id('pokmaswas'),
  _creationTime: v.number(),
  legacyId: v.string(),
  no: v.number(),
  kabupatenKota: v.string(),
  nama: v.string(),
  alamat: v.string(),
  ketua: v.string(),
  noHp: v.string(),
  lat: v.number(),
  lng: v.number(),
  ruangLingkup: v.optional(v.string()),
  kawasanPantai: v.optional(v.string()),
  bidangCore: v.array(v.string()),
  createdBy: v.optional(v.string()),
  createdAt: v.number(),
});

/** List semua entri Pokmaswas (terurut nomor). */
export const list = query({
  args: {},
  returns: v.array(pokmaswasReturn),
  handler: async (ctx) => {
    return await ctx.db
      .query('pokmaswas')
      .withIndex('by_no')
      .order('asc')
      .collect();
  },
});

export const getByLegacyId = query({
  args: { legacyId: v.string() },
  returns: v.union(pokmaswasReturn, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('pokmaswas')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();
  },
});

/**
 * Tambah entri baru. Nomor & legacyId digenerate server-side agar
 * tetap unik (lanjut dari STATIC_BASE).
 */
export const add = mutation({
  args: {
    kabupatenKota: v.string(),
    nama: v.string(),
    alamat: v.string(),
    ketua: v.string(),
    noHp: v.string(),
    lat: v.number(),
    lng: v.number(),
    ruangLingkup: v.optional(v.string()),
    kawasanPantai: v.optional(v.string()),
    bidangCore: v.array(v.string()),
    createdBy: v.optional(v.string()),
  },
  returns: v.id('pokmaswas'),
  handler: async (ctx, args) => {
    const last = await ctx.db
      .query('pokmaswas')
      .withIndex('by_no')
      .order('desc')
      .take(1);
    const maxNo = last.length > 0 ? last[0].no : 0;
    const no = Math.max(maxNo, STATIC_BASE) + 1;
    const legacyId = `PKM-${String(no).padStart(3, '0')}`;

    return await ctx.db.insert('pokmaswas', {
      legacyId,
      no,
      kabupatenKota: args.kabupatenKota,
      nama: args.nama,
      alamat: args.alamat,
      ketua: args.ketua,
      noHp: args.noHp,
      lat: args.lat,
      lng: args.lng,
      ruangLingkup: args.ruangLingkup,
      kawasanPantai: args.kawasanPantai,
      bidangCore: args.bidangCore,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
  },
});

/** Upsert by legacyId (idempoten untuk edit). */
export const upsert = mutation({
  args: {
    legacyId: v.string(),
    no: v.optional(v.number()),
    kabupatenKota: v.string(),
    nama: v.string(),
    alamat: v.string(),
    ketua: v.string(),
    noHp: v.string(),
    lat: v.number(),
    lng: v.number(),
    ruangLingkup: v.optional(v.string()),
    kawasanPantai: v.optional(v.string()),
    bidangCore: v.array(v.string()),
    createdBy: v.optional(v.string()),
  },
  returns: v.id('pokmaswas'),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('pokmaswas')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();

    const patch = {
      kabupatenKota: args.kabupatenKota,
      nama: args.nama,
      alamat: args.alamat,
      ketua: args.ketua,
      noHp: args.noHp,
      lat: args.lat,
      lng: args.lng,
      ruangLingkup: args.ruangLingkup,
      kawasanPantai: args.kawasanPantai,
      bidangCore: args.bidangCore,
      createdBy: args.createdBy,
    };

    if (existing) {
      await ctx.db.patch(existing._id, { ...patch, ...(args.no !== undefined ? { no: args.no } : {}) });
      return existing._id;
    }

    // Entri baru (mis. edit data seed) → pakai no yang diberikan bila ada.
    const last = await ctx.db
      .query('pokmaswas')
      .withIndex('by_no')
      .order('desc')
      .take(1);
    const maxNo = last.length > 0 ? last[0].no : 0;
    const no = args.no !== undefined ? args.no : Math.max(maxNo, STATIC_BASE) + 1;
    return await ctx.db.insert('pokmaswas', {
      ...patch,
      legacyId: args.legacyId,
      no,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { legacyId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('pokmaswas')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});
