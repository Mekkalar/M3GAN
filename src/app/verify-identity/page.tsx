import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import IDCardUploadForm from "~/components/kyc/IDCardUploadForm";

export default async function VerifyIdentityPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Redirect if already submitted/verified
    if (session.user.verificationStatus === 'PENDING') {
        redirect("/verify-identity/pending");
    }

    if (session.user.verificationStatus === 'VERIFIED') {
        redirect("/");
    }

    return (
        <main className="min-h-screen bg-slate-50 font-sans text-body pb-20">
            {/* Luxury Header */}
            <section className="relative overflow-hidden bg-primary px-6 py-16 text-center text-white md:py-24">
                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>

                <div className="relative mx-auto max-w-3xl">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Identity Verification
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/90">
                        To maintain a trusted community of luxury renters, we require all members to verify their identity using a valid Thai National ID Card.
                    </p>
                </div>
            </section>

            {/* Main Content Info Card */}
            <div className="relative mx-auto -mt-10 max-w-2xl px-6">
                <div className="overflow-hidden rounded-lg bg-white shadow-soft-lg">
                    <div className="border-b border-border p-8">
                        <h2 className="text-xl font-bold text-heading">Upload Verification Document</h2>
                        <p className="mt-2 text-sm text-muted">
                            Please upload a clear photo of your Thai National ID Card. Ensure that all details are visible and the image is not blurry.
                        </p>
                    </div>

                    <div className="p-8">
                        <IDCardUploadForm />
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-muted">
                    Need help? <a href="#" className="font-bold text-primary hover:underline">Contact Support</a>
                </p>
            </div>
        </main>
    );
}
