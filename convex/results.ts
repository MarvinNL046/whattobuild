import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const getByQuery = query({
  args: { queryId: v.id("queries") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("results")
      .withIndex("by_query", (q) => q.eq("queryId", args.queryId))
      .unique();
  },
});

export const getLatestByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    // Get user's recent queries
    const queries = await ctx.db
      .query("queries")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(10);

    // Fetch results for completed queries
    const resultsWithQuery = await Promise.all(
      queries
        .filter((q) => q.status === "done")
        .map(async (query) => {
          const result = await ctx.db
            .query("results")
            .withIndex("by_query", (q) => q.eq("queryId", query._id))
            .unique();
          return result ? { ...result, niche: query.niche } : null;
        })
    );

    return resultsWithQuery.filter(Boolean);
  },
});

// Internal mutation - only callable from Convex actions, not from client
export const save = internalMutation({
  args: {
    queryId: v.id("queries"),
    painPoints: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        frequency: v.number(),
        confidence: v.optional(v.number()),
        evidenceCount: v.optional(v.number()),
        opportunityScore: v.optional(v.number()),
        sentiment: v.union(
          v.literal("negative"),
          v.literal("neutral"),
          v.literal("mixed")
        ),
        quotes: v.array(
          v.object({
            text: v.string(),
            source: v.string(),
            url: v.optional(v.string()),
          })
        ),
        keywords: v.array(v.string()),
        solutions: v.optional(v.array(v.object({
          title: v.string(),
          description: v.string(),
          type: v.union(v.literal("saas"), v.literal("ecommerce"), v.literal("service"), v.literal("content")),
          difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
          monetization: v.string(),
        }))),
      })
    ),
    searchVolume: v.optional(
      v.array(
        v.object({
          keyword: v.string(),
          volume: v.number(),
          competition: v.number(),
        })
      )
    ),
    adLinks: v.object({
      facebook: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      google: v.optional(v.string()),
      pinterest: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("results", {
      queryId: args.queryId,
      painPoints: args.painPoints,
      searchVolume: args.searchVolume,
      adLinks: args.adLinks,
      createdAt: Date.now(),
    });
  },
});
