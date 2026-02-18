"use server";

import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

const setPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

/**
 * Set password after OTP verification
 */
export async function setPassword(input: {
    password: string;
    confirmPassword: string;
}) {
    try {
        const session = await auth();

        if (!session?.user) {
            return {
                success: false,
                error: "Not authenticated",
            };
        }

        // Validate input
        const validated = setPasswordSchema.parse(input);

        // Check if user already has a password
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { password: true },
        });

        if (user?.password) {
            return {
                success: false,
                error: "Password already set. Please use login page.",
            };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validated.password, 10);

        // Update user with password
        await db.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        return {
            success: true,
            message: "Password set successfully",
        };
    } catch (error) {
        console.error("Set Password Error:", {
            error,
            errorType: error?.constructor?.name,
            errorMessage: error instanceof Error ? error.message : String(error),
        });

        if (error instanceof z.ZodError) {
            const firstError = error.errors[0];
            console.error("Zod validation error:", firstError);
            return {
                success: false,
                error: firstError?.message ?? "Invalid input",
            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to set password",
        };
    }
}
