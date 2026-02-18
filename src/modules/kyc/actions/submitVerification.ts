"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

const submitVerificationSchema = z.object({
    idCardImageUrl: z.string().url("Invalid image URL"),
});

/**
 * Submit identity verification with uploaded ID card image
 */
export async function submitIdentityVerification(input: { idCardImageUrl: string }) {
    try {
        const session = await auth();

        if (!session?.user) {
            return {
                success: false,
                error: "Unauthorized. Please log in.",
            };
        }

        // Validate input
        const { idCardImageUrl } = submitVerificationSchema.parse(input);

        // Check if user already has a verification record
        const existingVerification = await db.identityVerification.findUnique({
            where: { userId: session.user.id },
        });

        if (existingVerification) {
            return {
                success: false,
                error: "Verification already submitted. Please wait for review.",
            };
        }

        // Create verification record
        await db.identityVerification.create({
            data: {
                userId: session.user.id,
                idCardImageUrl,
                status: "PENDING",
            },
        });

        // Update user verification status to PENDING
        await db.user.update({
            where: { id: session.user.id },
            data: { verificationStatus: "PENDING" },
        });

        return {
            success: true,
            message: "Identity verification submitted successfully",
        };
    } catch (error) {
        console.error("Submit Identity Verification Error:", {
            userId: (await auth())?.user?.id,
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
