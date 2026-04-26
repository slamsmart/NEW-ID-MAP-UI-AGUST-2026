import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

const statusValidator = v.union(
  v.literal('kritis'),
  v.literal('jarang'),
  v.literal('sedang'),
  v.literal('lebat'),
);

const kawasanValidator = v.union(
  v.literal('konservasi'),
  v.literal('hutan_lindung'),
  v.literal('apl'),
);

const locationReturn = v.object({
  _id: v.id('mangroveLocations'),
  _creationTime: v.number(),
  legacyId: v.string(),
  name: v.string(),
  province: v.string(),
  district: v.string(),
  lat: v.number(),
  lng: v.number(),
  areaHa: v.number(),
  status: statusValidator,
  kawasan: kawasanValidator,
  lastSurvey: v.optional(v.string()),
  isCustom: v.boolean(),
  createdBy: v.optional(v.string()),
});

/** List semua lokasi (default desc by creation). Filter optional via index. */
export const list = query({
  args: {
    province: v.optional(v.string()),
    onlyCustom: v.optional(v.boolean()),
  },
  returns: v.array(locationReturn),
  handler: async (ctx, args) => {
    if (args.province) {
      return await ctx.db
        .query('mangroveLocations')
        .withIndex('by_province', (q) => q.eq('province', args.province as string))
        .order('desc')
        .collect();
    }
    if (args.onlyCustom) {
      return await ctx.db
        .query('mangroveLocations')
        .withIndex('by_custom', (q) => q.eq('isCustom', true))
        .order('desc')
        .collect();
    }
    return await ctx.db.query('mangroveLocations').order('desc').collect();
  },
});

export const getByLegacyId = query({
  args: { legacyId: v.string() },
  returns: v.union(locationReturn, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('mangroveLocations')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();
  },
});

/**
 * Upsert lokasi by legacyId — idempotent untuk sync queue offline.
 */
export const upsert = mutation({
  args: {
    legacyId: v.string(),
    name: v.string(),
    province: v.string(),
    district: v.string(),
    lat: v.number(),
    lng: v.number(),
    areaHa: v.number(),
    status: statusValidator,
    kawasan: kawasanValidator,
    lastSurvey: v.optional(v.string()),
    isCustom: v.boolean(),
    createdBy: v.optional(v.string()),
  },
  returns: v.id('mangroveLocations'),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('mangroveLocations')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert('mangroveLocations', args);
  },
});

export const remove = mutation({
  args: { legacyId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('mangroveLocations')
      .withIndex('by_legacy', (q) => q.eq('legacyId', args.legacyId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});
