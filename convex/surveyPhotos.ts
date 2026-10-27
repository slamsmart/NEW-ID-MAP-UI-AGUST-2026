import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authGuard';

const photoReturn = v.object({
  _id: v.id('surveyPhotos'),
  _creationTime: v.number(),
  surveyLegacyId: v.string(),
  url: v.string(),
  cloudId: v.optional(v.string()),
  tag: v.string(),
});

export const listBySurvey = query({
  args: { surveyLegacyId: v.string() },
  returns: v.array(photoReturn),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('surveyPhotos')
      .withIndex('by_survey', (q) => q.eq('surveyLegacyId', args.surveyLegacyId))
      .order('desc')
      .collect();
  },
});

/** Tambah satu foto (URL + cloudId Cloudinary) untuk survei tertentu. */
export const add = mutation({
  args: {
    surveyLegacyId: v.string(),
    url: v.string(),
    cloudId: v.optional(v.string()),
    tag: v.optional(v.string()),
  },
  returns: v.id('surveyPhotos'),
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin', 'verifikator']);
    return await ctx.db.insert('surveyPhotos', {
      surveyLegacyId: args.surveyLegacyId,
      url: args.url,
      cloudId: args.cloudId,
      tag: args.tag ?? 'Kondisi Umum',
    });
  },
});

export const remove = mutation({
  args: { photoId: v.id('surveyPhotos') },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin', 'verifikator']);
    await ctx.db.delete(args.photoId);
    return null;
  },
});
