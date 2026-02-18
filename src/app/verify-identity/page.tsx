import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { IDCardUpload } from "~/modules/kyc/components/IDCardUpload";

export default async function VerifyIdentityPage() {
    const session = await auth();

    // Redirect if not logged in
    if (!session?.user) {
        redirect("/signup");
    }

    // Redirect if already verified or pending
    if (session.user.verificationStatus !== "UNVERIFIED") {
        redirect("/verify-identity/pending");
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <IDCardUpload />
        </main>
    );
}
