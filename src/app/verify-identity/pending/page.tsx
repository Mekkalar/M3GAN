import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function VerificationPendingPage() {
    const session = await auth();

    // Redirect if not logged in
    if (!session?.user) {
        redirect("/signup");
    }

    // Redirect if still unverified
    if (session.user.verificationStatus === "UNVERIFIED") {
        redirect("/verify-identity");
    }

    const status = session.user.verificationStatus;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6 text-center">
                {status === "PENDING" && (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                            <svg
                                className="h-8 w-8 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold">Verification Pending</h1>
                        <p className="text-gray-600">
                            Your identity verification is being reviewed by our team. This usually takes 1-2 business days.
                        </p>
                        <p className="text-sm text-gray-500">
                            We'll notify you once your verification is complete.
                        </p>
                    </>
                )}

                {status === "VERIFIED" && (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <svg
                                className="h-8 w-8 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold">Verification Approved!</h1>
                        <p className="text-gray-600">
                            Your identity has been verified. You now have full access to all platform features.
                        </p>
                        <a
                            href="/"
                            className="inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                        >
                            Go to Dashboard
                        </a>
                    </>
                )}

                {status === "REJECTED" && (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <svg
                                className="h-8 w-8 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold">Verification Rejected</h1>
                        <p className="text-gray-600">
                            Unfortunately, we couldn't verify your identity with the submitted document.
                        </p>
                        <p className="text-sm text-gray-500">
                            Please contact support for more information.
                        </p>
                    </>
                )}
            </div>
        </main>
    );
}
