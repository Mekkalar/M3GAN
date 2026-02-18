import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { SetPasswordForm } from "~/modules/auth/components/SetPasswordForm";

export default async function SetPasswordPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/signup");
    }

    // Check if user already has a password
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
    });

    if (user?.password) {
        redirect("/login");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <SetPasswordForm />
        </main>
    );
}
