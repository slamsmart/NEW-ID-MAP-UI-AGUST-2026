/**
 * stats.ts — Convex functions untuk panel statistik Dashboard.
 *
 * Pattern: single-document counter dengan key='global'.
 * Mutation idempotent (auto-create row pertama kali).
 */
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

const GLOBAL_KEY = 'global';

const downloadKindValidator = v.union(
  v.literal('pdf'),
  v.literal('geojson'),
  v.literal('csv'),
);

/** Internal: ambil (atau buat) baris global. */
async function getOrCreateGlobal(ctx: any) {
  const existing = await ctx.db
    .query('siteStats')
    .withIndex('by_key', (q: any) => q.eq('key', GLOBAL_KEY))
    .unique();
  if (existing) return existing;
  const id = await ctx.db.insert('siteStats', {
    key: GLOBAL_KEY,
    totalVisits: 0,
    totalDownloads: 0,
    downloadsPDF: 0,
    downloadsGeoJSON: 0,
    downloadsCSV: 0,
    updatedAt: Date.now(),
  });
  return await ctx.db.get(id);
}

/** Catat satu visit (page view publik mis. /peta atau dashboard). */
export const recordVisit = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const row = await getOrCreateGlobal(ctx);
    if (!row) return null;
    await ctx.db.patch(row._id, {
      totalVisits: row.totalVisits + 1,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/** Catat satu download dengan jenis-nya. */
export const recordDownload = mutation({
  args: { kind: downloadKindValidator },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await getOrCreateGlobal(ctx);
    if (!row) return null;
    const patch: Record<string, number> = {
      totalDownloads: row.totalDownloads + 1,
      updatedAt: Date.now(),
    };
    if (args.kind === 'pdf') patch.downloadsPDF = row.downloadsPDF + 1;
    if (args.kind === 'geojson') patch.downloadsGeoJSON = row.downloadsGeoJSON + 1;
    if (args.kind === 'csv') patch.downloadsCSV = row.downloadsCSV + 1;
    await ctx.db.patch(row._id, patch);
    return null;
  },
});

/**
 * Ambil ringkasan stats. Disertakan total user aktif (count `userProfiles`)
 * sebagai proxy "user dari Clerk" — diisi via `ClerkBridge.upsert`.
 */
export const getStats = query({
  args: {},
  returns: v.object({
    totalVisits: v.number(),
    totalDownloads: v.number(),
    downloadsPDF: v.number(),
    downloadsGeoJSON: v.number(),
    downloadsCSV: v.number(),
    totalUsers: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const row = await ctx.db
      .query('siteStats')
      .withIndex('by_key', (q) => q.eq('key', GLOBAL_KEY))
      .unique();

    // Hitung user — semua dokumen userProfiles. Aman selama tabel kecil
    // (skala kecamatan/kabupaten). Kalau besar nanti pakai pagination.
    const profiles = await ctx.db.query('userProfiles').collect();

    return {
      totalVisits: row?.totalVisits ?? 0,
      totalDownloads: row?.totalDownloads ?? 0,
      downloadsPDF: row?.downloadsPDF ?? 0,
      downloadsGeoJSON: row?.downloadsGeoJSON ?? 0,
      downloadsCSV: row?.downloadsCSV ?? 0,
      totalUsers: profiles.length,
      updatedAt: row?.updatedAt,
    };
  },
});
