"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type LoginData = {
    phone: string;
    password: string;
    remember: boolean;
};

import Link from 'next/link';

export function LoginPattern({
    onSubmit,
    loading,
    error,
}: {
    onSubmit: (data: LoginData) => void | Promise<void>;
    loading?: boolean;
    error?: string;
}) {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);

    return (
        <div className="w-full max-w-[400px] mx-auto">
            <div className="bg-white rounded-md shadow-soft-md p-8 border border-border">
                <div className="text-center mb-8">
                    <h2 className="font-sans text-3xl font-bold text-primary mb-2">RENTU</h2>
                    <p className="text-text-muted text-sm tracking-wide">Welcome back</p>
                </div>

                <form
                    className="space-y-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit({ phone, password, remember });
                    }}
                >
                    <div className="space-y-2">
                        <label htmlFor="login-phone" className="block text-sm font-bold text-text-heading">
                            Email or Phone
                        </label>
                        <input
                            type="text"
                            id="login-phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Email or Phone"
                            className="w-full px-4 py-3 bg-white border border-border rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 text-text-body shadow-soft-sm transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="login-password" className="block text-sm font-bold text-text-heading">
                            Password
                        </label>
                        <input
                            type="password"
                            id="login-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="........"
                            className="w-full px-4 py-3 bg-white border border-border rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 text-text-body shadow-soft-sm transition-all"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span className="text-text-muted">Remember me</span>
                        </label>
                        <a href="#" className="text-primary hover:text-primary/80 font-medium transition-colors">
                            Forgot Password?
                        </a>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-primary text-white font-bold rounded-md shadow-soft-sm hover:shadow-soft-md hover:bg-primary/90 transition-all duration-300 disabled:opacity-60"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-text-muted">Don't have an account? </span>
                        <Link href="/signup" className="font-bold text-primary hover:underline transition-colors">
                            Sign Up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LoginPages({ endpoint }: { endpoint?: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [message, setMessage] = useState<string | undefined>(undefined);
    const router = useRouter();

    const handleSubmit = async (data: LoginData) => {
        setLoading(true);
        setError(undefined);
        setMessage(undefined);
        try {
            const res = await signIn("credentials", {
                phone: data.phone,
                password: data.password,
                redirect: false,
            });

            if (res?.error) {
                setError("Login failed. Please check your credentials.");
                return;
            }

            setMessage('Login successful');
            console.log('login success', res);
            router.push('/'); // Redirect on success
        } catch (err: any) {
            setError(err?.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans">
            <LoginPattern onSubmit={handleSubmit} loading={loading} error={error} />
            {message && <div className="absolute top-6 right-6 text-green-700">{message}</div>}
        </div>
    );
}
