"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VerificationCard } from "./VerificationCard";

interface Verification {
    id: string;
    userId: string;
    idCardImageUrl: string;
    submittedAt: Date;
    user: {
        phone: string;
    };
}

interface KYCQueueProps {
    initialVerifications: Verification[];
}

export function KYCQueue({ initialVerifications }: KYCQueueProps) {
    const router = useRouter();
    const [verifications, setVerifications] = useState(initialVerifications);

    const handleReviewed = () => {
        // Refresh the page to get updated list
        router.refresh();
    };

    if (verifications.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
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
                <h3 className="mt-4 text-lg font-medium text-gray-900">All Caught Up!</h3>
                <p className="mt-2 text-sm text-gray-500">
                    There are no pending verifications to review.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                    <strong>{verifications.length}</strong> pending verification
                    {verifications.length !== 1 ? "s" : ""}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {verifications.map((verification) => (
                    <VerificationCard
                        key={verification.id}
                        verification={verification}
                        onReviewed={handleReviewed}
                    />
                ))}
            </div>
        </div>
    );
}
