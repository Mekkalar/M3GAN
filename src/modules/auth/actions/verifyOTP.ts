"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { verifyOTP } from "../lib/otpUtils";
import { validateThaiPhone, normalizeThaiPhone } from "../lib/phoneUtils";

const verifyOTPSchema = z.object({
    phone: z.string().refine(validateThaiPhone, {
        message: "Invalid Thai mobile number format",
    }),
    code: z.string().length(6, "OTP code must be 6 digits"),
});

const MAX_VERIFY_ATTEMPTS = 5;

/**
 * Verify OTP code and create/login user
 */
export async function verifyOTPAction(input: { phone: string; code: string }) {
    try {
        // Validate input
        const { phone, code } = verifyOTPSchema.parse(input);
        const normalizedPhone = normalizeThaiPhone(phone);

        // Find the most recent unverified OTP for this phone
        const otpRecord = await db.otpCode.findFirst({
            where: {
                phone: normalizedPhone,
                verified: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!otpRecord) {
            return {
                success: false,
                error: "Invalid or expired OTP code",
            };
        }

        // Check verification attempts limit
        if (otpRecord.attempts >= MAX_VERIFY_ATTEMPTS) {
            return {
                success: false,
                error: "Too many verification attempts. Please request a new OTP.",
            };
        }

        // Verify OTP
        const isValid = await verifyOTP(code, otpRecord.code);

        if (!isValid) {
            // Increment attempt counter
            await db.otpCode.update({
                where: { id: otpRecord.id },
                data: { attempts: otpRecord.attempts + 1 },
            });

            return {
                success: false,
                error: `Invalid OTP code. ${MAX_VERIFY_ATTEMPTS - otpRecord.attempts - 1} attempts remaining.`,
            };
        }

        // Mark OTP as verified
        await db.otpCode.update({
            where: { id: otpRecord.id },
            data: { verified: true },
        });

        // Find or create user
        let user = await db.user.findUnique({
            where: { phone: normalizedPhone },
        });

        if (!user) {
            user = await db.user.create({
                data: {
                    phone: normalizedPhone,
                    verificationStatus: "UNVERIFIED",
                },
            });
        }

        return {
            success: true,
            userId: user.id,
            verificationStatus: user.verificationStatus,
        };
    } catch (error) {
        console.error("Verify OTP Error:", {
            phone: input.phone,
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
