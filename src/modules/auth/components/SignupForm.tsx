"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { sendOTP } from "../actions/sendOTP";
import { Loader2, Smartphone, ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

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

        // Basic validation
        if (phone.length < 9) {
            setError("Please enter a valid phone number");
            return;
        }

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
            const signInResult = await signIn("phone-otp", {
                phone,
                code: otp,
                redirect: false,
            });

            if (signInResult?.ok) {
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
        const cleaned = value.replace(/\D/g, "").slice(0, 6);
        setOtp(cleaned);
    };

    return (
        <div className="w-full max-w-sm">
            {/* Header */}
            <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-heading">
                    {step === "phone" ? "Create Account" : "Verify Phone"}
                </h1>
                <p className="mt-2 text-sm text-body text-opacity-80">
                    {step === "phone"
                        ? "Join our exclusive community of luxury enthusiasts."
                        : `We sent a 6-digit code to ${phone}`
                    }
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 rounded-md bg-error/10 p-4 text-sm font-medium text-error border border-error/20 animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            {step === "phone" ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-bold text-heading">
                            Phone Number
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="081 234 5678"
                                className="block w-full rounded-sm border-b-2 border-slate-200 bg-transparent py-3 pl-10 pr-3 font-medium text-heading placeholder:text-slate-300 focus:border-primary focus:outline-none transition-colors"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3 px-4 font-bold text-white shadow-soft-sm transition-all hover:bg-primary/90 hover:shadow-soft-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Send OTP
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>

                    <p className="text-xs text-muted text-center pt-2">
                        By continuing, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                    </p>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="otp" className="block text-sm font-bold text-heading">
                                Security Code
                            </label>
                            <button
                                type="button"
                                onClick={() => setStep("phone")}
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                Change Number
                            </button>
                        </div>
                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            value={otp}
                            onChange={(e) => handleOTPChange(e.target.value)}
                            placeholder="000000"
                            className="block w-full rounded-sm border-2 border-slate-200 bg-white py-3 text-center text-2xl font-bold tracking-[0.5em] text-heading placeholder:text-slate-200 focus:border-primary focus:outline-none transition-colors"
                            required
                            disabled={loading}
                            maxLength={6}
                        />
                        <p className="text-xs text-muted text-center">
                            Code expires in 5 minutes
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3 px-4 font-bold text-white shadow-soft-sm transition-all hover:bg-primary/90 hover:shadow-soft-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify & Create Account
                                <CheckCircle className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-sm">
                <span className="text-muted">Already a member? </span>
                <Link href="/login" className="font-bold text-primary hover:underline transition-colors">
                    Log In
                </Link>
            </div>
        </div>
    );
}
