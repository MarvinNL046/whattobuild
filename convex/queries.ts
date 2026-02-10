import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
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

// Atomic: check credits + deduct + create query in single transaction
export const startResearch = mutation({
  args: {
    niche: v.string(),
    sourceUrl: v.optional(v.string()),
    researchTypes: v.optional(v.array(v.union(
      v.literal("saas"),
      v.literal("ecommerce"),
      v.literal("directory"),
      v.literal("website"),
      v.literal("niche"),
    ))),
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);

    if (user.credits < 1) throw new Error("Insufficient credits");

    // Deduct credit
    await ctx.db.patch(user._id, { credits: user.credits - 1 });

    // Log transaction
    await ctx.db.insert("transactions", {
      userId: user._id,
      credits: -1,
      type: "usage",
      description: `Research: ${args.niche}`,
      createdAt: Date.now(),
    });

    // Create query
    const queryId = await ctx.db.insert("queries", {
      userId: user._id,
      niche: args.niche,
      sourceUrl: args.sourceUrl,
      researchTypes: args.researchTypes,
      status: "pending",
      creditsUsed: 1,
      createdAt: Date.now(),
    });

    return queryId;
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
