import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.weekly(
  "weekly-niche-monitoring",
  { dayOfWeek: "monday", hourUTC: 9, minuteUTC: 0 },
  internal.actions.monitoring.processAllMonitors,
);

export default crons;
