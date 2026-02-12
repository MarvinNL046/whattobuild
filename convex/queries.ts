import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { getCurrentUser, ensureUser } from "./lib/auth";

export const create = mutation({
  args: { userId: v.id("users"), niche: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("queries", {
      userId: args.userId,
      niche: args.niche,
      status: "pending",
      creditsUsed: 1,
      createdAt: Date.now(),
    });
  },
});

// Check credits + create query (credit is deducted only on success)
export const startResearch = mutation({
  args: {
    niche: v.string(),
    sourceUrl: v.optional(v.string()),
    researchTypes: v.optional(v.array(v.union(
      v.literal("saas"),
      v.literal("ecommerce"),
      v.literal("directory"),
      v.literal("website"),
    ))),
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);

    if (user.credits < 1) throw new Error("Insufficient credits");

    // Reserve credit (not deducted yet — only on success)
    const queryId = await ctx.db.insert("queries", {
      userId: user._id,
      niche: args.niche,
      sourceUrl: args.sourceUrl,
      researchTypes: args.researchTypes,
      status: "pending",
      creditsUsed: 0,
      createdAt: Date.now(),
    });

    return queryId;
  },
});

// Deduct credit when research completes successfully
export const chargeCredit = internalMutation({
  args: { queryId: v.id("queries") },
  handler: async (ctx, args) => {
    const query = await ctx.db.get(args.queryId);
    if (!query || query.creditsUsed > 0) return; // already charged

    const user = await ctx.db.get(query.userId);
    if (!user) return;

    await ctx.db.patch(user._id, { credits: user.credits - 1 });
    await ctx.db.patch(args.queryId, { creditsUsed: 1 });

    await ctx.db.insert("transactions", {
      userId: user._id,
      credits: -1,
      type: "usage",
      description: `Research: ${query.niche}`,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    queryId: v.id("queries"),
    status: v.union(
      v.literal("pending"),
      v.literal("scraping"),
      v.literal("analyzing"),
      v.literal("fetching_volume"),
      v.literal("matching_suppliers"),
      v.literal("done"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.queryId, { status: args.status });
  },
});

// Internal version for use from Convex actions
export const internalUpdateStatus = internalMutation({
  args: {
    queryId: v.id("queries"),
    status: v.union(
      v.literal("pending"),
      v.literal("scraping"),
      v.literal("analyzing"),
      v.literal("fetching_volume"),
      v.literal("matching_suppliers"),
      v.literal("done"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.queryId, { status: args.status });
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("queries")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const get = query({
  args: { queryId: v.id("queries") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.queryId);
  },
});

// Reset a failed query to pending so it can be retried
export const resetFailed = mutation({
  args: { queryId: v.id("queries") },
  handler: async (ctx, args) => {
    const query = await ctx.db.get(args.queryId);
    if (!query) throw new Error("Query not found");
    if (query.status !== "failed") throw new Error("Query is not in failed state");

    await ctx.db.patch(args.queryId, { status: "pending" });

    return {
      niche: query.niche,
      sourceUrl: query.sourceUrl,
      researchTypes: query.researchTypes,
    };
  },
});

// Internal create for cron/monitoring (no auth context)
export const internalCreate = internalMutation({
  args: {
    userId: v.id("users"),
    niche: v.string(),
    sourceUrl: v.optional(v.string()),
    researchTypes: v.optional(v.array(v.union(
      v.literal("saas"),
      v.literal("ecommerce"),
      v.literal("directory"),
      v.literal("website"),
    ))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("queries", {
      userId: args.userId,
      niche: args.niche,
      sourceUrl: args.sourceUrl,
      researchTypes: args.researchTypes,
      status: "pending",
      creditsUsed: 0,
      createdAt: Date.now(),
    });
  },
});

// Internal version for use from actions
export const getInternal = internalQuery({
  args: { queryId: v.id("queries") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.queryId);
  },
});
