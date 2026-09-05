import { query, mutation } from './_generated/server';
import { v, ConvexError } from 'convex/values';
import { isAdminEmail, requireRole } from './authGuard';

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
 *
 * `args.role` diabaikan: role baru user selalu 'viewer' sampai di-set lewat
 * `setRole`. Pengecualian: email yang terdaftar di env `ADMIN_EMAILS`
 * otomatis mendapat role 'admin` saat pertama login (bootstrap).
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: 'UNAUTHENTICATED',
        message: 'Harus login untuk membuat/update profil.',
      });
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'clerkId tidak cocok dengan sesi berjalan.',
      });
    }
    const email = (identity.email ?? args.email).trim().toLowerCase();
    const existing = await ctx.db
      .query('userProfiles')
      .withIndex('by_clerk', (q) => q.eq('clerkId', args.clerkId))
      .unique();

    const payload = {
      clerkId: args.clerkId,
      nama: args.nama.trim(),
      email,
      unit: args.unit,
      provinsi: args.provinsi,
      role: isAdminEmail(email)
        ? ('admin' as const)
        : existing?.role ?? 'viewer',
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
 *
 * `args.role` hanya diizinkan untuk role non-privilege ('viewer',
 * 'petugas_daerah') atau role yang sudah dimiliki record — jalur migrasi data
 * lama tetap jalan, tapi eskalasi ke admin/verifikator dari API publik diblokir.
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

    const SELF_SERVE_ROLES = ['viewer', 'petugas_daerah'] as const;
    const requested = args.role;
    const role = isAdminEmail(email)
      ? ('admin' as const)
      : requested && (SELF_SERVE_ROLES.includes(requested as (typeof SELF_SERVE_ROLES)[number]) || requested === existing?.role)
        ? requested
        : existing?.role ?? 'viewer';

    const payload = {
      clerkId: existing?.clerkId,
      nama: args.nama.trim(),
      email,
      unit: args.unit,
      provinsi: args.provinsi,
      role,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert('userProfiles', payload);
  },
});

/** Set role — operasi admin; diproteksi requireRole server-side. */
export const setRole = mutation({
  args: {
    clerkId: v.string(),
    role: roleValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin']);
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

/** List semua profiles — admin & verifikator saja (guard server-side). */
export const list = query({
  args: {},
  returns: v.array(profileReturn),
  handler: async (ctx) => {
    await requireRole(ctx, ['admin', 'verifikator']);
    return await ctx.db.query('userProfiles').order('desc').collect();
  },
});
