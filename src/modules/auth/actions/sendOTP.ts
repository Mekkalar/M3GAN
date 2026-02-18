"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { sendSMS } from "../lib/twilioClient";
import { generateOTP, hashOTP, createOTPExpiry, cleanupExpiredOTPs } from "../lib/otpUtils";
import { validateThaiPhone, normalizeThaiPhone } from "../lib/phoneUtils";

const sendOTPSchema = z.object({
    phone: z.string().refine(validateThaiPhone, {
        message: "Invalid Thai mobile number format",
    }),
});

const MAX_OTP_REQUESTS = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Check and update rate limit for OTP sending (database-backed)
 */
async function checkRateLimit(phone: string): Promise<{ allowed: boolean; error?: string }> {
    const now = new Date();
    const resetAt = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);

    // Find or create rate limit tracker
    const tracker = await db.rateLimitTracker.findFirst({
        where: {
            phone,
            action: "send_otp",
        },
    });

    if (tracker) {
        // Check if window has expired
        if (now < tracker.resetAt) {
            if (tracker.count >= MAX_OTP_REQUESTS) {
                return {
                    allowed: false,
                    error: "Too many OTP requests. Please try again in 10 minutes.",
                };
            }

            // Increment counter
            await db.rateLimitTracker.update({
                where: { id: tracker.id },
                data: { count: tracker.count + 1 },
            });
        } else {
            // Reset counter
            await db.rateLimitTracker.update({
                where: { id: tracker.id },
                data: { count: 1, resetAt },
            });
        }
    } else {
        // Create new tracker
        await db.rateLimitTracker.create({
            data: {
                phone,
                action: "send_otp",
                count: 1,
                resetAt,
            },
        });
    }

    return { allowed: true };
}

/**
 * Send OTP code to user's phone number
 */
export async function sendOTP(input: { phone: string }) {
    try {
        // Validate input
        const { phone } = sendOTPSchema.parse(input);
        const normalizedPhone = normalizeThaiPhone(phone);

        // Rate limiting check (database-backed)
        const rateLimitResult = await checkRateLimit(normalizedPhone);
        if (!rateLimitResult.allowed) {
            return {
                success: false,
                error: rateLimitResult.error,
            };
        }

        // Clean up expired OTPs
        await cleanupExpiredOTPs();

        // Generate OTP
        const otpCode = generateOTP();
        const hashedCode = await hashOTP(otpCode);
        const expiresAt = createOTPExpiry();

        // Store OTP in database
        await db.otpCode.create({
            data: {
                phone: normalizedPhone,
                code: hashedCode,
                expiresAt,
                attempts: 0,
            },
        });

        // Send SMS
        const smsResult = await sendSMS(
            normalizedPhone,
            `Your m3-gan verification code is: ${otpCode}. Valid for 5 minutes.`
        );

        if (!smsResult.success) {
            return {
                success: false,
                error: "Failed to send OTP. Please try again.",
            };
        }

        return {
            success: true,
            message: "OTP sent successfully",
        };
    } catch (error) {
        console.error("Send OTP Error:", {
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
