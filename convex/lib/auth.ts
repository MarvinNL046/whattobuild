import { QueryCtx, MutationCtx } from "../_generated/server";

const DEV_CLERK_ID = "dev-user-local";

/**
 * Get the current user, with dev mode fallback when Clerk is unavailable.
 * In dev mode (no Clerk JWT), auto-creates a dev user with starter credits.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (identity) {
    // Production: look up by Clerk ID
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  }

  // Dev mode: find or create dev user
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", DEV_CLERK_ID))
    .unique();
}

/**
 * Ensure a user exists. In dev mode, creates one automatically.
 * Use in mutations that need a guaranteed user.
 */
export async function ensureUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (identity) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found. Sign up first.");
    return user;
  }

  // Dev mode: find or create
  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", DEV_CLERK_ID))
    .unique();

  if (existing) return existing;

  // Create dev user with generous credits
  const userId = await ctx.db.insert("users", {
    clerkId: DEV_CLERK_ID,
    email: "dev@whattobuild.local",
    name: "Dev User",
    credits: 100,
    createdAt: Date.now(),
  });

  return (await ctx.db.get(userId))!;
}
