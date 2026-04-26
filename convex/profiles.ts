import { query, mutation } from './_generated/server';
import { v, ConvexError } from 'convex/values';

const roleValidator = v.union(
  v.literal('viewer'),
  v.literal('petugas_daerah'),
  v.literal('admin_nasional'),
  v.literal('admin'),
  v.literal('verifikator'),
);

const profileReturn = v.object({
  _id: v.id('userProfiles'),
  _creationTime: v.number(),
  clerkId: v.optional(v.string()),
  nama: v.string(),
  email: v.string(),
  unit: v.optional(v.string()),
  provinsi: v.optional(v.string()),
  role: roleValidator,
  updatedAt: v.number(),
});

/** Lookup profile by Clerk subject id. */
export const getByClerkId = query({
  args: { clerkId: v.string() },
  returns: v.union(profileReturn, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('userProfiles')
      .withIndex('by_clerk', (q) => q.eq('clerkId', args.clerkId))
      .unique();
  },
});

/** Lookup profile by email (unik). */
export const getByEmail = query({
  args: { email: v.string() },
  returns: v.union(profileReturn, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('userProfiles')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .unique();
  },
});

/**
 * Upsert profile — dipanggil saat Clerk webhook fire `user.created`/`user.updated`,
 * atau dari client setelah Clerk auth selesai sebagai fallback.
 * Idempotent: aman dipanggil berkali-kali.
 */
export const upsert = mutation({
  args: {
    clerkId: v.string(),
    nama: v.string(),
    email: v.string(),
    unit: v.optional(v.string()),
    provinsi: v.optional(v.string()),
    role: v.optional(roleValidator),
  },
  returns: v.id('userProfiles'),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('userProfiles')
      .withIndex('by_clerk', (q) => q.eq('clerkId', args.clerkId))
      .unique();

    const payload = {
      clerkId: args.clerkId,
      nama: args.nama.trim(),
      email: args.email.trim().toLowerCase(),
      unit: args.unit,
      provinsi: args.provinsi,
      role: args.role ?? existing?.role ?? 'viewer',
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert('userProfiles', payload);
  },
});

/**
 * Upsert profile by email — untuk user publik yang sign-up via OTP EmailJS
 * (tidak punya clerkId). Idempotent.
 */
export const upsertByEmail = mutation({
  args: {
    nama: v.string(),
    email: v.string(),
    unit: v.optional(v.string()),
    provinsi: v.optional(v.string()),
    role: v.optional(roleValidator),
  },
  returns: v.id('userProfiles'),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query('userProfiles')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();

    const payload = {
      clerkId: existing?.clerkId,
      nama: args.nama.trim(),
      email,
      unit: args.unit,
      provinsi: args.provinsi,
      role: args.role ?? existing?.role ?? 'viewer',
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert('userProfiles', payload);
  },
});

/** Set role — operasi admin. */
export const setRole = mutation({
  args: {
    clerkId: v.string(),
    role: roleValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('userProfiles')
      .withIndex('by_clerk', (q) => q.eq('clerkId', args.clerkId))
      .unique();
    if (!existing) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Profile tidak ditemukan.' });
    }
    await ctx.db.patch(existing._id, { role: args.role, updatedAt: Date.now() });
    return null;
  },
});

/** List semua profiles (admin only — caller harus enforce). */
export const list = query({
  args: {},
  returns: v.array(profileReturn),
  handler: async (ctx) => {
    return await ctx.db.query('userProfiles').order('desc').collect();
  },
});
