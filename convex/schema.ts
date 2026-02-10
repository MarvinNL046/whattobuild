import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    credits: v.number(),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  queries: defineTable({
    userId: v.id("users"),
    niche: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("scraping"),
      v.literal("analyzing"),
      v.literal("fetching_volume"),
      v.literal("done"),
      v.literal("failed")
    ),
    sourceUrl: v.optional(v.string()),
    researchTypes: v.optional(v.array(v.union(
      v.literal("saas"),
      v.literal("ecommerce"),
      v.literal("directory"),
      v.literal("website"),
    ))),
    creditsUsed: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_status", ["status"]),

  results: defineTable({
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
      spyfu: v.optional(v.string()),
      similarweb: v.optional(v.string()),
    }),
    createdAt: v.number(),
  }).index("by_query", ["queryId"]),

  savedIdeas: defineTable({
    userId: v.id("users"),
    queryId: v.id("queries"),
    painPointTitle: v.string(),
    painPointDescription: v.string(),
    solutionTitle: v.optional(v.string()),
    solutionDescription: v.optional(v.string()),
    solutionType: v.optional(v.union(v.literal("saas"), v.literal("ecommerce"), v.literal("service"), v.literal("content"))),
    notes: v.optional(v.string()),
    status: v.union(v.literal("saved"), v.literal("exploring"), v.literal("building"), v.literal("archived")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),

  transactions: defineTable({
    userId: v.id("users"),
    credits: v.number(),
    type: v.union(v.literal("purchase"), v.literal("usage")),
    description: v.string(),
    stripeSessionId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),
});
