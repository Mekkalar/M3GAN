import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "~/server/db";
import { verifyOTP } from "~/modules/auth/lib/otpUtils";
import { normalizeThaiPhone } from "~/modules/auth/lib/phoneUtils";
import * as bcrypt from "bcryptjs";

export const authConfig = {
    providers: [
        // Phone + OTP (for signup only)
        Credentials({
            id: "phone-otp",
            name: "Phone OTP",
            credentials: {
                phone: { label: "Phone", type: "text" },
                code: { label: "Code", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.code) {
                    return null;
                }

                const normalizedPhone = normalizeThaiPhone(credentials.phone as string);
                const code = credentials.code as string;

                // Verify OTP server-side
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
                    console.log("No OTP record found for phone:", normalizedPhone);
                    return null;
                }

                // Verify the OTP code
                const isValid = await verifyOTP(code, otpRecord.code);

                if (!isValid) {
                    console.log("Invalid OTP code for phone:", normalizedPhone);
                    return null;
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
                    console.log("Creating new user for phone:", normalizedPhone);
                    user = await db.user.create({
                        data: {
                            phone: normalizedPhone,
                            verificationStatus: "UNVERIFIED",
                            role: "USER"
                        },
                    });
                }

                console.log("User authenticated via OTP:", { id: user.id, phone: user.phone });

                return {
                    id: user.id,
                    phone: user.phone,
                    role: user.role,
                    verificationStatus: user.verificationStatus,
                };
            },
        }),
        // Phone + Password (for login)
        Credentials({
            id: "credentials",
            name: "Phone and Password",
            credentials: {
                phone: { label: "Phone", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.password) {
                    return null;
                }

                const normalizedPhone = normalizeThaiPhone(credentials.phone as string);
                const password = credentials.password as string;

                // Get user with password
                const user = await db.user.findUnique({
                    where: { phone: normalizedPhone },
                });

                if (!user || !user.password) {
                    console.log("User not found or no password set for phone:", normalizedPhone);
                    return null;
                }

                // Verify password
                const isValidPassword = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!isValidPassword) {
                    console.log("Invalid password for phone:", normalizedPhone);
                    return null;
                }

                console.log("User authenticated via password:", { id: user.id, phone: user.phone, role: user.role });

                return {
                    id: user.id,
                    phone: user.phone,
                    role: user.role,
                    verificationStatus: user.verificationStatus,
                };
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.phone = token.phone as string;
                session.user.role = token.role as string;
                session.user.verificationStatus = token.verificationStatus as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.phone = user.phone;
                token.role = user.role;
                token.verificationStatus = user.verificationStatus;
            }
            return token;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
