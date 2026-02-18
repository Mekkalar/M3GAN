import bcrypt from "bcryptjs";
import { db } from "~/server/db";

const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;

/**
 * Generate a random 6-digit OTP code
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP code with bcrypt
 */
export async function hashOTP(code: string): Promise<string> {
    return bcrypt.hash(code, 10);
}

/**
 * Verify OTP code against hashed version
 */
export async function verifyOTP(code: string, hashedCode: string): Promise<boolean> {
    return bcrypt.compare(code, hashedCode);
}

/**
 * Create OTP expiry timestamp
 */
export function createOTPExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES);
    return expiry;
}

/**
 * Clean up expired OTP codes
 */
export async function cleanupExpiredOTPs() {
    await db.otpCode.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });
}
