import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authGuard';

const nurseryReturn = v.object({
  _id: v.id('customNurseries'),
  _creationTime: v.number(),
  legacyId: v.string(),
  nama: v.string(),
  institusi: v.optional(v.string()),
  sertifikat: v.string(),
  kapasitasBibit: v.number(),
  provinsi: v.string(),
  kabKota: v.string(),
  lat: v.number(),
  lng: v.number(),
  catatan: v.optional(v.string()),
  addedBy: v.string(),
  isActive: v.boolean(),
});

export const list = query({
  args: { onlyActive: v.optional(v.boolean()) },
  returns: v.array(nurseryReturn),
  handler: async (ctx, args) => {
    if (args.onlyActive) {
      return await ctx.db
        .query('customNurseries')
        .withIndex('by_active', (q) => q.eq('isActive', true))
        .order('desc')
        .collect();
    }
    return await ctx.db.query('customNurseries').order('desc').collect();
  },
});

export const upsert = mutation({
  args: {
    legacyId: v.string(),
    nama: v.string(),
    institusi: v.optional(v.string()),
    sertifikat: v.string(),
    kapasitasBibit: v.number(),
    provinsi: v.string(),
    kabKota: v.string(),
    lat: v.number(),
    lng: v.number(),
    catatan: v.optional(v.string()),
    addedBy: v.string(),
    isActive: v.boolean(),
  },
  returns: v.id('customNurseries'),
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin', 'verifikator']);
    const existing = await ctx.db
      .query('customNurseries')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert('customNurseries', args);
  },
});

export const setActive = mutation({
  args: { legacyId: v.string(), isActive: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin', 'verifikator']);
    const existing = await ctx.db
      .query('customNurseries')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();
    if (existing && existing.isActive !== args.isActive) {
      await ctx.db.patch(existing._id, { isActive: args.isActive });
    }
    return null;
  },
});

export const remove = mutation({
  args: { legacyId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin', 'verifikator']);
    const existing = await ctx.db
      .query('customNurseries')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
    return null;
  },
});
