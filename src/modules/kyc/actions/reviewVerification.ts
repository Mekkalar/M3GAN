"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

const reviewVerificationSchema = z.object({
    verificationId: z.string(),
    action: z.enum(["APPROVE", "REJECT"]),
    rejectionReason: z.string().optional(),
});

/**
 * Admin action to approve or reject identity verification
 */
export async function reviewVerification(input: {
    verificationId: string;
    action: "APPROVE" | "REJECT";
    rejectionReason?: string;
}) {
    try {
        const session = await auth();

        // Check if user is admin
        if (!session?.user || session.user.role !== "ADMIN") {
            return {
                success: false,
                error: "Unauthorized. Admin access required.",
            };
        }

        // Validate input
        const { verificationId, action, rejectionReason } =
            reviewVerificationSchema.parse(input);

        // Get verification record
        const verification = await db.identityVerification.findUnique({
            where: { id: verificationId },
            include: { user: true },
        });

        if (!verification) {
            return {
                success: false,
                error: "Verification record not found.",
            };
        }

        if (verification.status !== "PENDING") {
            return {
                success: false,
                error: "Verification has already been reviewed.",
            };
        }

        const now = new Date();

        if (action === "APPROVE") {
            // Update verification to APPROVED
            await db.identityVerification.update({
                where: { id: verificationId },
                data: {
                    status: "APPROVED",
                    reviewedAt: now,
                    reviewedBy: session.user.id,
                },
            });

            // Update user status to VERIFIED
            await db.user.update({
                where: { id: verification.userId },
                data: { verificationStatus: "VERIFIED" },
            });

            return {
                success: true,
                message: "Verification approved successfully.",
            };
        } else {
            // REJECT
            if (!rejectionReason) {
                return {
                    success: false,
                    error: "Rejection reason is required.",
                };
            }

            // Update verification to REJECTED
            await db.identityVerification.update({
                where: { id: verificationId },
                data: {
                    status: "REJECTED",
                    rejectionReason,
                    reviewedAt: now,
                    reviewedBy: session.user.id,
                },
            });

            // Update user status to REJECTED
            await db.user.update({
                where: { id: verification.userId },
                data: { verificationStatus: "REJECTED" },
            });

            return {
                success: true,
                message: "Verification rejected.",
            };
        }
    } catch (error) {
        console.error("Review Verification Error:", {
            adminId: (await auth())?.user?.id,
            verificationId: input.verificationId,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors[0]?.message ?? "Invalid input",
            };
        }

        return {
            success: false,
            error: "An error occurred. Please try again.",
        };
    }
}
