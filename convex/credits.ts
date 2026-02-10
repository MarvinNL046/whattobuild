import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return user?.credits ?? 0;
  },
});

export const deduct = mutation({
  args: { userId: v.id("users"), amount: v.number(), description: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.credits < args.amount) throw new Error("Insufficient credits");

    await ctx.db.patch(args.userId, {
      credits: user.credits - args.amount,
    });

    await ctx.db.insert("transactions", {
      userId: args.userId,
      credits: -args.amount,
      type: "usage",
      description: args.description,
      createdAt: Date.now(),
    });

    return user.credits - args.amount;
  },
});

export const add = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
    stripeSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      credits: user.credits + args.amount,
    });

    await ctx.db.insert("transactions", {
      userId: args.userId,
      credits: args.amount,
      type: "purchase",
      description: args.description,
      stripeSessionId: args.stripeSessionId,
      createdAt: Date.now(),
    });

    return user.credits + args.amount;
  },
});

export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("transactions")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});
