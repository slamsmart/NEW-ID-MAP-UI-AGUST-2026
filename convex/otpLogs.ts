import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

const typeValidator = v.union(v.literal('login'), v.literal('signup'));
const statusValidator = v.union(
  v.literal('sent'),
  v.literal('verified'),
  v.literal('expired'),
  v.literal('failed'),
);

const logReturn = v.object({
  _id: v.id('otpLogs'),
  _creationTime: v.number(),
  email: v.string(),
  type: typeValidator,
  status: statusValidator,
  delivered: v.boolean(),
  verifiedAt: v.optional(v.number()),
});

export const recordSent = mutation({
  args: {
    email: v.string(),
    type: typeValidator,
    delivered: v.boolean(),
  },
  returns: v.id('otpLogs'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('otpLogs', {
      email: args.email.trim().toLowerCase(),
      type: args.type,
      status: 'sent',
      delivered: args.delivered,
    });
  },
});

export const markVerified = mutation({
  args: { logId: v.id('otpLogs') },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.logId, {
      status: 'verified',
      verifiedAt: Date.now(),
    });
    return null;
  },
});

export const markFailed = mutation({
  args: {
    logId: v.id('otpLogs'),
    status: v.union(v.literal('expired'), v.literal('failed')),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.logId, { status: args.status });
    return null;
  },
});

/** History OTP per email — untuk audit. */
export const listByEmail = query({
  args: { email: v.string(), limit: v.optional(v.number()) },
  returns: v.array(logReturn),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200);
    return await ctx.db
      .query('otpLogs')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .order('desc')
      .take(limit);
  },
});
