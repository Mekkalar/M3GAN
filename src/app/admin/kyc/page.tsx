import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { KYCQueue } from "~/modules/kyc/components/KYCQueue";

export default async function AdminKYCPage() {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    // Get pending verifications
    const pendingVerifications = await db.identityVerification.findMany({
        where: {
            status: "PENDING",
        },
        include: {
            user: {
                select: {
                    phone: true,
                },
            },
        },
        orderBy: {
            submittedAt: "asc", // Oldest first
        },
    });

    return (
        <main className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">KYC Verification Queue</h1>
                    <p className="mt-2 text-gray-600">
                        Review and approve pending identity verifications
                    </p>
                </div>

                <KYCQueue initialVerifications={pendingVerifications} />
            </div>
        </main>
    );
}
