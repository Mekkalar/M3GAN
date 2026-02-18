"use server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";

export async function submitVerification(input: {
    fileUrl: string;
    fileKey: string;
}) {
    const session = await auth();

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Create or update the identity verification record
        // Using upsert in case a record already exists (e.g. from a failed previous attempt/rejected state)
        await db.identityVerification.upsert({
            where: {
                userId: session.user.id,
            },
            create: {
                userId: session.user.id,
                idCardImageUrl: input.fileUrl,
                status: "PENDING",
            },
            update: {
                idCardImageUrl: input.fileUrl,
                status: "PENDING",
                rejectionReason: null, // Clear any previous rejection reason
                submittedAt: new Date(),
            },
        });

        // Update user status to PENDING
        await db.user.update({
            where: { id: session.user.id },
            data: { verificationStatus: "PENDING" },
        });

        revalidatePath("/verify-identity");
        revalidatePath("/"); // Update dashboard status as well

        return { success: true };
    } catch (error) {
        console.error("Error submitting verification:", error);
        return { success: false, error: "Failed to submit verification. Please try again." };
    }
}
