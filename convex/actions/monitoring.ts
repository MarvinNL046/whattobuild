"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

export const processAllMonitors = internalAction({
  args: {},
  handler: async (ctx) => {
    const monitors = await ctx.runQuery(internal.monitoredNiches.listActive);

    for (const monitor of monitors) {
      try {
        // Look up user for credits + email
        const user = await ctx.runQuery(internal.users.getByIdInternal, {
          userId: monitor.userId,
        });

        if (!user) continue;

        // Check credits
        if (user.credits < 1) {
          await ctx.runAction(internal.actions.email.sendNoCreditsEmail, {
            to: user.email,
            niche: monitor.niche,
          });
          continue;
        }

        // Create query row
        const queryId = await ctx.runMutation(internal.queries.internalCreate, {
          userId: monitor.userId,
          niche: monitor.niche,
          sourceUrl: monitor.sourceUrl,
          researchTypes: monitor.researchTypes,
        });

        // Run research pipeline
        const result = await ctx.runAction(internal.actions.research.internalRun, {
          queryId,
          niche: monitor.niche,
          sourceUrl: monitor.sourceUrl,
          researchTypes: monitor.researchTypes,
        });

        if (result.success) {
          // Update last run
          await ctx.runMutation(internal.monitoredNiches.updateLastRun, {
            monitorId: monitor._id,
            queryId,
          });

          // Get results for email
          const queryResult = await ctx.runQuery(internal.results.getByQueryInternal, {
            queryId,
          });

          if (queryResult && queryResult.painPoints.length > 0) {
            const topPainPoints = queryResult.painPoints.slice(0, 3).map((pp) => ({
              title: pp.title,
              description: pp.description,
            }));

            await ctx.runAction(internal.actions.email.sendMonitoringEmail, {
              to: user.email,
              niche: monitor.niche,
              queryId,
              painPoints: topPainPoints,
            });
          }
        }
      } catch (error) {
        // Log and continue with next monitor
        console.error(
          `Monitor ${monitor._id} (${monitor.niche}) failed:`,
          error instanceof Error ? error.message : error,
        );
      }
    }
  },
});
