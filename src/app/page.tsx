import { auth, signOut } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-4xl p-6">
                {/* Header with Sign Out */}
                <div className="mb-8 flex items-center justify-between rounded-lg bg-white p-6 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold">Welcome to m3-gan</h1>
                        <p className="mt-1 text-gray-600">Phone: {session.user.phone}</p>
                        <p className="text-sm text-gray-500">
                            Role: <span className="font-medium">{session.user.role}</span> |
                            Status: <span className="font-medium">{session.user.verificationStatus}</span>
                        </p>
                    </div>
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/signup" });
                        }}
                    >
                        <button
                            type="submit"
                            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>

                {/* Navigation Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Verify Identity Card */}
                    {session.user.verificationStatus === "UNVERIFIED" && (
                        <a
                            href="/verify-identity"
                            className="block rounded-lg border-2 border-blue-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Verify Your Identity</h2>
                                    <p className="text-sm text-gray-600">Upload your ID card to get verified</p>
                                </div>
                            </div>
                        </a>
                    )}

                    {/* Verification Status Card */}
                    {(session.user.verificationStatus === "PENDING" ||
                        session.user.verificationStatus === "VERIFIED" ||
                        session.user.verificationStatus === "REJECTED") && (
                            <a
                                href="/verify-identity/pending"
                                className="block rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-400 hover:shadow-md"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                        <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">Verification Status</h2>
                                        <p className="text-sm text-gray-600">Check your verification status</p>
                                    </div>
                                </div>
                            </a>
                        )}

                    {/* Admin Dashboard Card */}
                    {session.user.role === "ADMIN" && (
                        <a
                            href="/admin/kyc"
                            className="block rounded-lg border-2 border-purple-200 bg-white p-6 shadow-sm transition hover:border-purple-400 hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Admin Dashboard</h2>
                                    <p className="text-sm text-gray-600">Review pending KYC verifications</p>
                                </div>
                            </div>
                        </a>
                    )}
                </div>

                {/* Info Box */}
                <div className="mt-8 rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Tip:</strong> {session.user.role === "ADMIN"
                            ? "You have admin access. You can review KYC verifications in the Admin Dashboard."
                            : session.user.verificationStatus === "UNVERIFIED"
                                ? "Please verify your identity to unlock all platform features."
                                : session.user.verificationStatus === "PENDING"
                                    ? "Your verification is pending review. We'll notify you once it's processed."
                                    : session.user.verificationStatus === "VERIFIED"
                                        ? "Your account is verified! You have full access to all features."
                                        : "Your verification was rejected. Please check the status page for details."}
                    </p>
                </div>
            </div>
        </main>
    );
}
