import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Convex Cron Jobs
 * 
 * Scheduled functions that run automatically on Convex's infrastructure.
 * View and monitor in Convex Dashboard → Scheduled Functions
 */

const crons = cronJobs();

/**
 * Fail stuck generation jobs (every 5 minutes)
 * 
 * Automatically marks jobs as "failed" if they've been generating for >6 minutes.
 * Prevents UI from showing perpetual "generating" state when FAL API hangs.
 * 
 * Schedule: Every 5 minutes
 * Targets: Jobs with status="generating" and createdAt > 6 minutes ago
 */
crons.interval(
  "fail stuck generation jobs",
  { minutes: 5 },
  internal.generationJobs.failStuckJobs
);

/**
 * Clean up old completed jobs (daily at 3 AM)
 * 
 * Deletes completed/failed generation jobs older than 24 hours to prevent
 * table bloat and maintain query performance.
 * 
 * Schedule: Daily at 3:00 AM (server time)
 * Targets: Jobs with status="completed"/"failed" and createdAt > 24 hours ago
 */
crons.cron(
  "cleanup old generation jobs",
  "0 3 * * *", // 3:00 AM daily
  internal.generationJobs.cleanupCompletedJobs
);

export default crons;

