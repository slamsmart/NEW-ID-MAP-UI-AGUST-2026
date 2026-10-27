/**
 * stats.ts — Convex functions untuk panel statistik Dashboard.
 *
 * Pattern: single-document counter dengan key='global'.
 * Mutation idempotent (auto-create row pertama kali).
 */
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { MutationCtx } from './_generated/server';
import { requireRole } from './authGuard';

const GLOBAL_KEY = 'global';

const downloadKindValidator = v.union(
  v.literal('pdf'),
  v.literal('geojson'),
  v.literal('csv'),
);

/** Internal: ambil (atau buat) baris global. */
async function getOrCreateGlobal(ctx: MutationCtx) {
  const existing = await ctx.db
    .query('siteStats')
    .withIndex('by_key', (q) => q.eq('key', GLOBAL_KEY))
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
    // Riwayat event untuk grafik bulanan/triwulan (tanpa deduplikasi IP).
    await ctx.db.insert('statEvents', { type: 'visit' });
    return null;
  },
});

/** Kalibrasi: set totalVisits ke nilai tertentu (mis. seed 1500). */
export const setTotalVisits = mutation({
  args: { totalVisits: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin']);
    const row = await getOrCreateGlobal(ctx);
    if (!row) return null;
    await ctx.db.patch(row._id, {
      totalVisits: args.totalVisits,
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
    // Riwayat event untuk grafik bulanan/triwulan (tanpa deduplikasi IP).
    await ctx.db.insert('statEvents', { type: 'download', kind: args.kind });
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

// ── Bantu label & bucket waktu ────────────────────────────────────

const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** Key bulan 'YYYY-MM' dari epoch ms. */
function monthKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Key triwulan 'YYYY-Qn' dari epoch ms. */
function quarterKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}

/** Label triwulan Indonesia: TW1 2025, TW2 2025, dst. */
function quarterLabel(key: string): string {
  const [year, q] = key.split('-Q');
  return `TW${q} ${year}`;
}

const monthBucketValidator = v.object({
  key: v.string(),   // 'YYYY-MM'
  label: v.string(), // 'Jan 26'
  visits: v.number(),
  downloads: v.number(),
});

const quarterBucketValidator = v.object({
  key: v.string(),   // 'YYYY-Qn'
  label: v.string(), // 'TW1 2025'
  visits: v.number(),
  downloads: v.number(),
});

/**
 * getStatsDetail — detail statistik per bulan & triwulan untuk grafik
 * Dashboard (admin/verifikator). Menghitung dari tabel `statEvents`
 * (setiap kunjungan/unduhan = satu baris, tanpa deduplikasi IP).
 *
 * Selalu mengembalikan 12 bulan & 8 triwulan terakhir (zero-filled)
 * agar grafik stabil meski ada bulan tanpa aktivitas.
 */
export const getStatsDetail = query({
  args: {},
  returns: v.object({
    byMonth: v.array(monthBucketValidator),
    byQuarter: v.array(quarterBucketValidator),
    totalUsers: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const events = await ctx.db.query('statEvents').collect();

    // ── Bucket 12 bulan terakhir (zero-filled) ──
    const now = Date.now();
    const monthBuckets: Record<string, { key: string; label: string; visits: number; downloads: number }> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = monthKey(d.getTime());
      monthBuckets[key] = {
        key,
        label: `${BULAN_ID[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
        visits: 0,
        downloads: 0,
      };
    }

    // ── Bucket 8 triwulan terakhir (zero-filled) ──
    const quarterBuckets: Record<string, { key: string; label: string; visits: number; downloads: number }> = {};
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i * 3);
      const key = quarterKey(d.getTime());
      quarterBuckets[key] = {
        key,
        label: quarterLabel(key),
        visits: 0,
        downloads: 0,
      };
    }

    // ── Isi bucket dari events (hanya yang masih dalam rentang) ──
    for (const ev of events) {
      const t = ev._creationTime;
      const m = monthBuckets[monthKey(t)];
      if (m) {
        if (ev.type === 'visit') m.visits += 1;
        else m.downloads += 1;
      }
      const q = quarterBuckets[quarterKey(t)];
      if (q) {
        if (ev.type === 'visit') q.visits += 1;
        else q.downloads += 1;
      }
    }

    const profiles = await ctx.db.query('userProfiles').collect();
    const row = await ctx.db
      .query('siteStats')
      .withIndex('by_key', (q) => q.eq('key', GLOBAL_KEY))
      .unique();

    return {
      byMonth: Object.values(monthBuckets),
      byQuarter: Object.values(quarterBuckets),
      totalUsers: profiles.length,
      updatedAt: row?.updatedAt,
    };
  },
});


