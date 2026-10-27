/**
 * siteConfig.ts — konfigurasi situs yang bisa diubah runtime.
 *
 * Saat ini hanya maintenance mode (saklar on/off untuk seluruh situs).
 * Pattern: single-document dengan key='global' (sama seperti `stats.ts`).
 *
 * - `get`     : query PUBLIK tanpa guard. Wajib publik karena pengunjung
 *               anonim pun harus tahu situs sedang dikunci.
 * - `setMaintenance` : mutation, hanya verifikator (admin ikut diizinkan
 *               agar tidak ada yang terkunci permanen — user di
 *               ADMIN_EMAILS selalu ber-role 'admin', bukan 'verifikator').
 */
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { MutationCtx } from './_generated/server';
import { requireRole } from './authGuard';

const GLOBAL_KEY = 'global';

const configReturn = v.object({
  maintenanceEnabled: v.boolean(),
  maintenanceMessage: v.optional(v.string()),
  maintenanceEta: v.optional(v.string()),
  updatedBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
});

/** Internal: ambil (atau buat) baris global. */
async function getOrCreateGlobal(ctx: MutationCtx) {
  const existing = await ctx.db
    .query('siteConfig')
    .withIndex('by_key', (q) => q.eq('key', GLOBAL_KEY))
    .unique();
  if (existing) return existing;
  const id = await ctx.db.insert('siteConfig', {
    key: GLOBAL_KEY,
    maintenanceEnabled: false,
    updatedAt: Date.now(),
  });
  return await ctx.db.get(id);
}

/** Baca konfigurasi situs. Publik — dipakai gate maintenance di klien. */
export const get = query({
  args: {},
  returns: configReturn,
  handler: async (ctx) => {
    const row = await ctx.db
      .query('siteConfig')
      .withIndex('by_key', (q) => q.eq('key', GLOBAL_KEY))
      .unique();

    return {
      maintenanceEnabled: row?.maintenanceEnabled ?? false,
      maintenanceMessage: row?.maintenanceMessage,
      maintenanceEta: row?.maintenanceEta,
      updatedBy: row?.updatedBy,
      updatedAt: row?.updatedAt,
    };
  },
});

/**
 * Nyalakan/matikan maintenance mode untuk seluruh situs.
 * `message` & `eta` opsional; string kosong berarti pakai teks default.
 */
export const setMaintenance = mutation({
  args: {
    enabled: v.boolean(),
    message: v.optional(v.string()),
    eta: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireRole(ctx, ['verifikator', 'admin']);

    const identity = await ctx.auth.getUserIdentity();
    const row = await getOrCreateGlobal(ctx);
    if (!row) return null;

    const trim = (value: string | undefined) => {
      const text = (value ?? '').trim();
      return text.length > 0 ? text : undefined;
    };

    await ctx.db.patch(row._id, {
      maintenanceEnabled: args.enabled,
      maintenanceMessage: trim(args.message),
      maintenanceEta: trim(args.eta),
      updatedBy: identity?.name ?? identity?.email ?? undefined,
      updatedAt: Date.now(),
    });
    return null;
  },
});
