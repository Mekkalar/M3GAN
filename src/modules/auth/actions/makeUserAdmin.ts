"use server";

import { db } from "~/server/db";

/**
 * Make a user an admin by phone number
 * This is a utility function for testing/setup
 * In production, this should be protected or run via CLI
 */
export async function makeUserAdmin(phone: string) {
    try {
        const user = await db.user.findUnique({
            where: { phone },
        });

        if (!user) {
            return {
                success: false,
                error: "User not found",
            };
        }

        await db.user.update({
            where: { phone },
            data: { role: "ADMIN" },
        });

        return {
            success: true,
            message: `User ${phone} is now an admin`,
        };
    } catch (error) {
        console.error("Make User Admin Error:", error);
        return {
            success: false,
            error: "Failed to update user role",
        };
    }
}
