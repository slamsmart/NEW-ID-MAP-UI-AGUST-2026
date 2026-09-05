/**
 * Guard otorisasi server-side.
 *
 * Sumber kebenaran role, urutan:
 *  1. `ADMIN_EMAILS` (env Convex, comma-separated) → 'admin'.
 *     Bootstrap admin pertama tanpa perlu set role manual di dashboard.
 *  2. Kolom `role` di tabel `userProfiles` (by clerkId).
 *  3. Sign-in tanpa profile → 'viewer'; tidak sign-in → null (anonim).
 *
 * Set env: `npx convex env set ADMIN_EMAILS="a@x.com,b@x.com"`
 */
import { ConvexError } from 'convex/values';
import type { QueryCtx, MutationCtx } from './_generated/server';

export type AppRole =
  | 'viewer'
  | 'petugas_daerah'
  | 'admin_nasional'
  | 'admin'
  | 'verifikator';

type Ctx = QueryCtx | MutationCtx;

const env = process.env as unknown as Record<string, string | undefined>;

export function adminEmails(): string[] {
  return (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && adminEmails().includes(email.trim().toLowerCase());
}

/** Role pemanggil; null bila tidak sign-in (anonim). */
export async function callerRole(ctx: Ctx): Promise<AppRole | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  if (isAdminEmail(identity.email)) return 'admin';
  const profile = await ctx.db
    .query('userProfiles')
    .withIndex('by_clerk', (q) => q.eq('clerkId', identity.subject))
    .unique();
  return profile?.role ?? 'viewer';
}

/**
 * Tolak akses bila pemanggil tidak sign-in atau role-nya di luar `allowed`.
 * Melempar ConvexError 403 — klien menangkapnya sebagai error biasa.
 */
export async function requireRole(ctx: Ctx, allowed: AppRole[]) {
  const role = await callerRole(ctx);
  if (role === null || !allowed.includes(role)) {
    throw new ConvexError({
      code: 'FORBIDDEN',
      message: 'Akses ditolak: harus login dengan peran yang sesuai.',
    });
  }
  return role;
}
