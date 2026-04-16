const cron = require('node-cron');
const Interview = require('../models/Interview');

/**
 * Production-Ready Cron Jobs for Interview System
 * Handles automatic session cleanup, timeout protection, and maintenance
 */

// ============= SESSION TIMEOUT & CLEANUP =============

/**
 * Expire abandoned interview sessions
 * Runs every 5 minutes
 * 
 * Marks sessions as "expired" if:
 * - Status is "in_progress" (not yet completed)
 * - Last activity was more than sessionTimeoutMinutes ago
 * - Is a template-based (public) interview
 */
const expireAbandonedSessions = async () => {
  try {
    // Default timeout: 30 minutes
    const timeoutMs = 30 * 60 * 1000;
    const cutoffTime = new Date(Date.now() - timeoutMs);

    const result = await Interview.updateMany(
      {
        sessionStatus: "in_progress",
        isTemplateBasedInterview: true,
        sessionLastActivity: {
          $lt: cutoffTime,
        },
      },
      {
        sessionStatus: "expired",
        status: "failed",
        updatedAt: new Date(),
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `⏱️  [CRON] Expired ${result.modifiedCount} abandoned interview sessions`
      );
    }
  } catch (error) {
    console.error('❌ Error expiring abandoned sessions:', error.message);
  }
};

/**
 * Clean up orphaned session locks
 * Runs every 10 minutes
 * 
 * Clears locks for sessions that are:
 * - Status "locked" but no activity for 1 hour
 * - Allows new candidates to start same session if admin link shared again
 */
const cleanupOrphanedLocks = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await Interview.updateMany(
      {
        sessionStatus: "locked",
        sessionLastActivity: {
          $lt: oneHourAgo,
        },
      },
      {
        sessionStatus: "available",
        sessionLockedBy: null,
        sessionStartedAt: null,
        updatedAt: new Date(),
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `🔓 [CRON] Cleaned up ${result.modifiedCount} orphaned session locks`
      );
    }
  } catch (error) {
    console.error('❌ Error cleaning up orphaned locks:', error.message);
  }
};

/**
 * Archive old completed public interviews
 * Runs daily at 2 AM
 * 
 * Keeps interviews for analytics but could be extended to:
 * - Move to archive collection
 * - Delete after retention period
 * - Compress data
 */
const archiveOldPublicInterviews = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Just log for now - can extend with actual archival logic
    const count = await Interview.countDocuments({
      isTemplateBasedInterview: true,
      status: "completed",
      createdAt: {
        $lt: thirtyDaysAgo,
      },
    });

    if (count > 0) {
      console.log(
        `📦 [CRON] Found ${count} old public interviews (30+ days) for archival`
      );
    }
  } catch (error) {
    console.error('❌ Error archiving old interviews:', error.message);
  }
};

/**
 * Delete abandoned in-progress interviews
 * Runs every 1 hour
 * 
 * PERMANENTLY DELETES interviews where:
 * - Status is "in_progress" 
 * - Last activity was more than 24 hours ago
 * - Completed interviews are NOT affected
 */
const deleteAbandonedInProgressInterviews = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await Interview.deleteMany({
      status: "in_progress",
      sessionLastActivity: {
        $lt: twentyFourHoursAgo,
      },
    });

    if (result.deletedCount > 0) {
      console.log(
        `🗑️  [CRON] DELETED ${result.deletedCount} abandoned in-progress interviews (24+ hours old)`
      );
    }
  } catch (error) {
    console.error('❌ Error deleting abandoned in-progress interviews:', error.message);
  }
};

/**
 * Generate daily summary statistics
 * Runs daily at 3 AM
 * 
 * Logs:
 * - Total interviews completed
 * - Average completion time
 * - Failed/expired interview count
 * - Most popular templates
 */
const generateDailySummary = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysInterviews = await Interview.find({
      createdAt: { $gte: today },
    });

    const completed = todaysInterviews.filter((i) => i.status === "completed");
    const failed = todaysInterviews.filter((i) => i.status === "failed");

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 DAILY SUMMARY - ${today.toDateString()}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Interviews Started: ${todaysInterviews.length}`);
    console.log(`✅ Completed: ${completed.length}`);
    console.log(`❌ Failed/Expired: ${failed.length}`);
    console.log(
      `Completion Rate: ${((completed.length / todaysInterviews.length) * 100 || 0).toFixed(1)}%`
    );

    if (completed.length > 0) {
      const avgScore =
        completed.reduce((sum, i) => sum + (i.evaluation?.score || 0), 0) /
        completed.length;
      console.log(`Average Score: ${avgScore.toFixed(1)}/100`);
    }

    console.log(`${'='.repeat(60)}\n`);
  } catch (error) {
    console.error('❌ Error generating daily summary:', error.message);
  }
};

/**
 * Initialize all cron jobs
 * Call this once on server startup
 */
const initializeCronJobs = () => {
  console.log('🚀 Initializing production cron jobs...\n');

  // Expire abandoned sessions - every 5 minutes
  cron.schedule('*/5 * * * *', expireAbandonedSessions);
  console.log('✅ [CRON] Expire abandoned sessions (every 5 minutes)');

  // Clean up orphaned locks - every 10 minutes
  cron.schedule('*/10 * * * *', cleanupOrphanedLocks);
  console.log('✅ [CRON] Cleanup orphaned locks (every 10 minutes)');

  // Delete abandoned in-progress interviews - every 1 hour
  cron.schedule('0 * * * *', deleteAbandonedInProgressInterviews);
  console.log('✅ [CRON] Delete abandoned in-progress interviews (hourly)');

  // Archive old interviews - every day at 2 AM
  cron.schedule('0 2 * * *', archiveOldPublicInterviews);
  console.log('✅ [CRON] Archive old interviews (daily at 2 AM)');

  // Daily summary - every day at 3 AM
  cron.schedule('0 3 * * *', generateDailySummary);
  console.log('✅ [CRON] Generate daily summary (daily at 3 AM)');

  console.log('\n✨ All cron jobs initialized successfully!\n');
};

// Export for use in server.js
module.exports = {
  initializeCronJobs,
  expireAbandonedSessions,
  cleanupOrphanedLocks,
  deleteAbandonedInProgressInterviews,
  archiveOldPublicInterviews,
  generateDailySummary,
};
