import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { redirect } from "next/navigation";
import VerificationCard from "~/components/admin/VerificationCard";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminKycPage() {
    const session = await auth();

    // Strict Admin Check
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    // Fetch Pending Verifications
    const pendingVerifications = await db.identityVerification.findMany({
        where: {
            status: "PENDING",
        },
        include: {
            user: {
                select: {
                    phone: true,
                    role: true,
                },
            },
        },
        orderBy: {
            submittedAt: "asc", // Oldest first
        },
    });

    return (
        <main className="min-h-screen bg-slate-50 pb-20 font-sans text-body">
            {/* Admin Header */}
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-md bg-primary p-2 text-white shadow-soft-sm">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <h1 className="font-serif text-xl font-bold text-heading">Verification Queue</h1>
                    </div>
                    <div className="text-sm font-medium text-muted">
                        {pendingVerifications.length} Pending Requests
                    </div>
                </div>
            </header>

            {/* Content Grid */}
            <div className="mx-auto max-w-7xl p-6">
                {pendingVerifications.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
                        <p className="text-lg font-medium text-muted">No pending verifications</p>
                        <p className="text-sm text-slate-400">All caught up! Great job.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pendingVerifications.map((verification) => (
                            <VerificationCard
                                key={verification.id}
                                verification={verification}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
