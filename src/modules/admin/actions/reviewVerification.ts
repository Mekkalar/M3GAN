"use server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";

export async function reviewVerification(input: {
    verificationId: string;
    decision: "APPROVED" | "REJECTED";
    rejectionReason?: string;
}) {
    const session = await auth();

    // 1. Security Check: Must be ADMIN
    if (!session?.user || session.user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized: Admin access required" };
    }

    try {
        // 2. Database Update
        await db.$transaction(async (tx) => {
            // Update IdentityVerification record
            const verification = await tx.identityVerification.update({
                where: { id: input.verificationId },
                data: {
                    status: input.decision,
                    rejectionReason: input.decision === "REJECTED" ? input.rejectionReason : null,
                    reviewedAt: new Date(),
                    reviewedBy: session.user.id,
                },
                include: { user: true },
            });

            // Update User status
            // If Approved -> VERIFIED
            // If Rejected -> REJECTED (allows them to try again)
            const userStatus = input.decision === "APPROVED" ? "VERIFIED" : "REJECTED";

            await tx.user.update({
                where: { id: verification.userId },
                data: { verificationStatus: userStatus },
            });
        });

        // 3. Revalidate
        revalidatePath("/admin/kyc");
        revalidatePath("/verify-identity"); // Update user's view

        return { success: true };
    } catch (error) {
        console.error("Error reviewing verification:", error);
        return { success: false, error: "Failed to process review" };
    }
}
