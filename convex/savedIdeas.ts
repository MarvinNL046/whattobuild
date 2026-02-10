import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, ensureUser } from "./lib/auth";

const ideaStatusValidator = v.union(
  v.literal("saved"),
  v.literal("exploring"),
  v.literal("building"),
  v.literal("archived")
);

const solutionTypeValidator = v.union(
  v.literal("saas"),
  v.literal("ecommerce"),
  v.literal("service"),
  v.literal("content")
);

export const save = mutation({
  args: {
    queryId: v.id("queries"),
    painPointTitle: v.string(),
    painPointDescription: v.string(),
    solutionTitle: v.optional(v.string()),
    solutionDescription: v.optional(v.string()),
    solutionType: v.optional(solutionTypeValidator),
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);

    return await ctx.db.insert("savedIdeas", {
      userId: user._id,
      queryId: args.queryId,
      painPointTitle: args.painPointTitle,
      painPointDescription: args.painPointDescription,
      solutionTitle: args.solutionTitle,
      solutionDescription: args.solutionDescription,
      solutionType: args.solutionType,
      notes: undefined,
      status: "saved",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    ideaId: v.id("savedIdeas"),
    status: ideaStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);
    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== user._id) {
      throw new Error("Idea not found");
    }

    await ctx.db.patch(args.ideaId, { status: args.status });
  },
});

export const updateNotes = mutation({
  args: {
    ideaId: v.id("savedIdeas"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);
    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== user._id) {
      throw new Error("Idea not found");
    }

    await ctx.db.patch(args.ideaId, { notes: args.notes });
  },
});

export const remove = mutation({
  args: {
    ideaId: v.id("savedIdeas"),
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);
    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== user._id) {
      throw new Error("Idea not found");
    }

    await ctx.db.delete(args.ideaId);
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("savedIdeas")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const isIdeaSaved = query({
  args: {
    queryId: v.id("queries"),
    painPointTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;

    const ideas = await ctx.db
      .query("savedIdeas")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("queryId"), args.queryId),
          q.eq(q.field("painPointTitle"), args.painPointTitle)
        )
      )
      .first();

    return ideas !== null;
  },
});
