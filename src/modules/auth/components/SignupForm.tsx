"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { sendOTP } from "../actions/sendOTP";
import { verifyOTPAction } from "../actions/verifyOTP";

type Step = "phone" | "otp";

export function SignupForm() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await sendOTP({ phone });

            if (result.success) {
                setStep("otp");
            } else {
                setError(result.error ?? "Failed to send OTP");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Sign in with NextAuth (which verifies OTP AND creates user if needed)
            const signInResult = await signIn("phone-otp", {
                phone,
                code: otp,
                redirect: false,
            });

            if (signInResult?.ok) {
                // Redirect to set password page
                router.push("/set-password");
            } else {
                setError("Invalid OTP code or verification failed.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOTPChange = (value: string) => {
        // Only allow digits and max 6 characters
        const cleaned = value.replace(/\D/g, "").slice(0, 6);
        setOtp(cleaned);
    };

    return (
        <div className="w-full max-w-md space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2">
                <div className={`h-2 w-2 rounded-full ${step === "phone" ? "bg-blue-600" : "bg-gray-300"}`} />
                <div className="h-0.5 w-8 bg-gray-300" />
                <div className={`h-2 w-2 rounded-full ${step === "otp" ? "bg-blue-600" : "bg-gray-300"}`} />
            </div>

            <div className="text-center">
                <h1 className="text-2xl font-bold">
                    {step === "phone" ? "Sign Up" : "Verify OTP"}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    {step === "phone"
                        ? "Enter your phone number to get started"
                        : `We sent a code to ${phone}`}
                </p>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {error}
                </div>
            )}

            {step === "phone" ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0812345678 or +66812345678"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                            disabled={loading}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            🔒 Keeps your account safe
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        style={{ minHeight: "44px", minWidth: "44px" }}
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                            Verification Code
                        </label>
                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            value={otp}
                            onChange={(e) => handleOTPChange(e.target.value)}
                            placeholder="000000"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-center text-2xl tracking-widest shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                            disabled={loading}
                            maxLength={6}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Valid for 5 minutes
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        style={{ minHeight: "44px", minWidth: "44px" }}
                    >
                        {loading ? "Verifying..." : "Verify & Sign Up"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setStep("phone")}
                        className="w-full text-sm text-gray-600 hover:text-gray-900"
                        disabled={loading}
                    >
                        ← Change phone number
                    </button>
                </form>
            )}

            {/* Login Link */}
            <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                    Sign in
                </a>
            </div>
        </div>
    );
}
