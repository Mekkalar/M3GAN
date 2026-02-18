"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export function LoginForm() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                phone,
                password,
                redirect: false,
            });

            if (result?.ok) {
                router.push("/");
            } else {
                setError("Invalid phone number or password");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (value: string) => {
        // Allow only digits, +, and limit length
        const cleaned = value.replace(/[^\d+]/g, "");
        setPhone(cleaned);
    };

    return (
        <div className="w-full max-w-md space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Sign in to your account
                </p>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phone Number Field */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="+66812345678"
                        className="w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={loading}
                        required
                    />
                </div>

                {/* Password Field */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={loading}
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !phone || !password}
                    className="w-full rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700">
                    Sign up
                </Link>
            </div>
        </div>
    );
}
