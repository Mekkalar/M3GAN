import { SignupForm } from "~/modules/auth/components/SignupForm";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
    return (
        <main className="flex min-h-screen w-full bg-slate-50 font-sans">
            {/* Left Side - Visual & Brand (Hidden on Mobile, Visible on LG screens) */}
            <div className="hidden w-1/2 relative lg:flex flex-col justify-between overflow-hidden bg-primary text-white p-12">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('/patterns/grid.svg')] z-0"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>

                {/* Brand Logo */}
                <div className="relative z-10">
                    <Link href="/" className="font-serif text-3xl font-bold tracking-tight">
                        RENTU
                    </Link>
                </div>

                {/* Testimonial / Value Prop */}
                <div className="relative z-10 max-w-md">
                    <blockquote className="text-2xl font-serif leading-relaxed opacity-90">
                        "Experience the freedom of luxury. Rent the extraordinary, whenever you desire."
                    </blockquote>
                    <div className="mt-6 flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white/20">
                            {/* Placeholder for user avatar or branded icon */}
                            <div className="h-full w-full bg-white/10 flex items-center justify-center font-bold">R</div>
                        </div>
                        <div>
                            <p className="font-bold text-sm">RENTU</p>
                            <p className="text-xs text-white/60">Premium Lifestyle Service</p>
                        </div>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="relative z-10 flex gap-6 text-sm text-white/50">
                    <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                    <Link href="/catalog" className="hover:text-white transition-colors">Catalog</Link>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative">
                {/* Mobile Brand (Visible only on small screens) */}
                <div className="lg:hidden absolute top-6 left-6">
                    <Link href="/" className="font-serif text-2xl font-bold text-primary tracking-tight">
                        RENTU
                    </Link>
                </div>

                <div className="w-full max-w-sm">
                    <SignupForm />
                </div>
            </div>
        </main>
    );
}
