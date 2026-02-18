import { db } from "~/server/db";

/**
 * Cleanup expired OTP codes and rate limit trackers
 * Should be run periodically (e.g., via cron job or scheduled task)
 */
export async function cleanupExpiredRecords() {
    const now = new Date();

    // Delete expired OTP codes
    const deletedOTPs = await db.otpCode.deleteMany({
        where: {
            expiresAt: {
                lt: now,
            },
        },
    });

    // Delete expired rate limit trackers
    const deletedRateLimits = await db.rateLimitTracker.deleteMany({
        where: {
            resetAt: {
                lt: now,
            },
        },
    });

    console.log("Cleanup completed:", {
        deletedOTPs: deletedOTPs.count,
        deletedRateLimits: deletedRateLimits.count,
        timestamp: now.toISOString(),
    });

    return {
        deletedOTPs: deletedOTPs.count,
        deletedRateLimits: deletedRateLimits.count,
    };
}
