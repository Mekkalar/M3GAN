"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Check, X, Maximize2, Loader2, AlertTriangle } from "lucide-react";
import { reviewVerification } from "~/modules/admin/actions/reviewVerification";

type VerificationProps = {
    verification: {
        id: string;
        idCardImageUrl: string;
        submittedAt: Date;
        user: {
            phone: string;
            role: string;
        };
    };
};

export default function VerificationCard({ verification }: VerificationProps) {
    const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "SUCCESS">("IDLE");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleApprove = async () => {
        if (!confirm("Are you sure you want to APPROVE this user?")) return;

        setStatus("PROCESSING");
        const res = await reviewVerification({
            verificationId: verification.id,
            decision: "APPROVED",
        });

        if (res.success) {
            setStatus("SUCCESS");
        } else {
            alert(res.error);
            setStatus("IDLE");
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection");
            return;
        }

        setStatus("PROCESSING");
        const res = await reviewVerification({
            verificationId: verification.id,
            decision: "REJECTED",
            rejectionReason: rejectionReason,
        });

        if (res.success) {
            setStatus("SUCCESS");
            setShowRejectModal(false);
        } else {
            alert(res.error);
            setStatus("IDLE");
        }
    };

    if (status === "SUCCESS") {
        return null; // Remove card from view optimistically
    }

    return (
        <>
            <div className="overflow-hidden rounded-md border border-slate-100 bg-white shadow-soft-sm transition-all hover:shadow-soft-md">
                {/* Image Area */}
                <div className="relative aspect-[16/10] w-full bg-slate-100 group">
                    <Image
                        src={verification.idCardImageUrl}
                        alt="ID Card"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <a
                        href={verification.idCardImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                        title="View Full Size"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </a>
                </div>

                {/* Info Area */}
                <div className="p-5">
                    <div className="mb-4">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-slate-50">
                                    <td className="py-2 text-muted">User Phone</td>
                                    <td className="py-2 font-medium text-heading text-right">{verification.user.phone}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-muted">Submitted</td>
                                    <td className="py-2 font-medium text-heading text-right">
                                        {format(new Date(verification.submittedAt), "dd MMM yyyy, HH:mm")}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Action Bar */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            disabled={status === "PROCESSING"}
                            className="flex-1 rounded-sm border border-error bg-white py-2 text-sm font-bold text-error transition-colors hover:bg-error/5 disabled:opacity-50"
                        >
                            Reject
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={status === "PROCESSING"}
                            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary py-2 text-sm font-bold text-white shadow-soft-sm transition-all hover:bg-primary/90 disabled:opacity-50"
                        >
                            {status === "PROCESSING" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    Approve
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="mb-4 flex items-center gap-3 text-error">
                            <div className="rounded-full bg-error/10 p-2">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-heading">Reject Verification</h3>
                        </div>

                        <p className="mb-4 text-sm text-muted">
                            Please specify why this verification is being rejected. The user will see this reason.
                        </p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Image matches sample ID, Image too blurry..."
                            className="mb-6 w-full rounded-md border border-border p-3 text-sm focus:border-error focus:outline-none focus:ring-1 focus:ring-error min-h-[100px]"
                            autoFocus
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="rounded-sm px-4 py-2 text-sm font-medium text-muted hover:bg-slate-50"
                                disabled={status === "PROCESSING"}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={status === "PROCESSING" || !rejectionReason.trim()}
                                className="rounded-sm bg-error px-6 py-2 text-sm font-bold text-white shadow-soft-sm hover:bg-error/90 disabled:opacity-50"
                            >
                                {status === "PROCESSING" ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
