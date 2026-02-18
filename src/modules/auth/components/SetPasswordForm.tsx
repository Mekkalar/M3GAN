"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setPassword } from "../actions/setPassword";

export function SetPasswordForm() {
    const router = useRouter();
    const [password, setPasswordValue] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await setPassword({ password, confirmPassword });

            if (result.success) {
                router.push("/login");
            } else {
                setError(result.error ?? "Failed to set password");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Set Your Password</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Create a password to secure your account
                </p>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password Field */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        placeholder="Enter password (min 8 characters)"
                        className="w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={loading}
                        required
                        minLength={8}
                    />
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={loading}
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !password || !confirmPassword}
                    className="w-full rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {loading ? "Setting Password..." : "Continue"}
                </button>
            </form>

            {/* Password Requirements */}
            <div className="rounded-md bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">Password must:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                    <li>Be at least 8 characters long</li>
                    <li>Match the confirmation password</li>
                </ul>
            </div>
        </div>
    );
}
