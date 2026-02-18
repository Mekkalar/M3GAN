import { cleanupExpiredRecords } from "~/modules/auth/lib/cleanupRecords";

/**
 * API route for manual cleanup trigger
 * In production, this should be called by a cron job (e.g., Vercel Cron, AWS EventBridge)
 * 
 * Example cron setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET() {
    try {
        const result = await cleanupExpiredRecords();

        return Response.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Cleanup cron error:", error);

        return Response.json(
            {
                success: false,
                error: "Cleanup failed",
            },
            { status: 500 }
        );
    }
}
