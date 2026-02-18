"use client";

import { useState } from "react";
import { reviewVerification } from "../actions/reviewVerification";

interface VerificationCardProps {
    verification: {
        id: string;
        userId: string;
        idCardImageUrl: string;
        submittedAt: Date;
        user: {
            phone: string;
        };
    };
    onReviewed: () => void;
}

export function VerificationCard({ verification, onReviewed }: VerificationCardProps) {
    const [reviewing, setReviewing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [error, setError] = useState("");

    const handleApprove = async () => {
        setReviewing(true);
        setError("");

        const result = await reviewVerification({
            verificationId: verification.id,
            action: "APPROVE",
        });

        if (result.success) {
            onReviewed();
        } else {
            setError(result.error ?? "Failed to approve");
        }

        setReviewing(false);
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setError("Please provide a rejection reason");
            return;
        }

        setReviewing(true);
        setError("");

        const result = await reviewVerification({
            verificationId: verification.id,
            action: "REJECT",
            rejectionReason,
        });

        if (result.success) {
            setShowRejectModal(false);
            onReviewed();
        } else {
            setError(result.error ?? "Failed to reject");
        }

        setReviewing(false);
    };

    return (
        <>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* User Info */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-medium">{verification.user.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Submitted</p>
                            <p className="font-medium">
                                {new Date(verification.submittedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* ID Card Image */}
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-700">ID Card Image</p>
                        <img
                            src={verification.idCardImageUrl}
                            alt="ID Card"
                            className="w-full rounded-lg border border-gray-300"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleApprove}
                            disabled={reviewing}
                            className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {reviewing ? "Processing..." : "✓ Approve"}
                        </button>
                        <button
                            onClick={() => setShowRejectModal(true)}
                            disabled={reviewing}
                            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            ✗ Reject
                        </button>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-bold">Reject Verification</h3>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Rejection Reason
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please provide a clear reason for rejection..."
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason("");
                                    setError("");
                                }}
                                disabled={reviewing}
                                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={reviewing || !rejectionReason.trim()}
                                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {reviewing ? "Rejecting..." : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
