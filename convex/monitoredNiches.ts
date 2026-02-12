import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { getCurrentUser, ensureUser } from "./lib/auth";

export const create = mutation({
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

    // Check for duplicate (same user + niche)
    const existing = await ctx.db
      .query("monitoredNiches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("niche"), args.niche))
      .unique();

    if (existing) throw new Error("You are already monitoring this niche");

    return await ctx.db.insert("monitoredNiches", {
      userId: user._id,
      niche: args.niche,
      sourceUrl: args.sourceUrl,
      researchTypes: args.researchTypes,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

export const pause = mutation({
  args: { monitorId: v.id("monitoredNiches") },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor || monitor.userId !== user._id) throw new Error("Monitor not found");
    await ctx.db.patch(args.monitorId, { status: "paused" });
  },
});

export const resume = mutation({
  args: { monitorId: v.id("monitoredNiches") },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor || monitor.userId !== user._id) throw new Error("Monitor not found");
    await ctx.db.patch(args.monitorId, { status: "active" });
  },
});

export const remove = mutation({
  args: { monitorId: v.id("monitoredNiches") },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor || monitor.userId !== user._id) throw new Error("Monitor not found");
    await ctx.db.delete(args.monitorId);
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const monitors = await ctx.db
      .query("monitoredNiches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Sort desc by createdAt
    return monitors.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getMonitorByNiche = query({
  args: { niche: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const monitor = await ctx.db
      .query("monitoredNiches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("niche"), args.niche))
      .unique();

    if (!monitor) return null;
    return { monitorId: monitor._id, status: monitor.status };
  },
});

// Internal queries/mutations for cron use

export const listActive = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("monitoredNiches")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const updateLastRun = internalMutation({
  args: {
    monitorId: v.id("monitoredNiches"),
    queryId: v.id("queries"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.monitorId, {
      lastRunAt: Date.now(),
      lastQueryId: args.queryId,
    });
  },
});
