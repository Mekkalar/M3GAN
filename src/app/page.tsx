import { auth, signOut } from "~/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Shield,
    User,
    Package,
    PlusCircle,
    LogOut,
    AlertTriangle,
    Clock,
    CheckCircle,
    ChevronRight,
    ImageIcon,
    Tag,
} from "lucide-react";
import { getMyItems } from "~/modules/inventory/actions/items";
import { CATEGORY_LABELS, ItemStatusType, ItemCategoryType } from "~/lib/validators/item";

export default async function Dashboard() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const { user } = session;
    const isVerified = user.verificationStatus === "VERIFIED";

    // Fetch lender's own listings for the dashboard preview
    const myItems = isVerified ? await getMyItems() : [];

    const formatPhone = (phone: string | null | undefined) => {
        if (!phone) return "";
        if (phone.length >= 10) {
            return `${phone.substring(0, 3)}-xxx-${phone.substring(phone.length - 4)}`;
        }
        return phone;
    };

    const STATUS_STYLES: Record<ItemStatusType, string> = {
        DRAFT: "bg-amber-100 text-amber-700",
        PUBLISHED: "bg-green-100 text-green-700",
        PAUSED: "bg-slate-100 text-slate-600",
        ARCHIVED: "bg-red-100 text-red-600",
    };

    return (
        <main className="flex min-h-screen flex-col bg-background font-sans text-body">
            {/* Hero Section */}
            <section className="bg-primary px-6 py-12 text-primary-foreground shadow-soft-md md:px-12 md:py-16">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                                Welcome Back
                            </h1>
                            <p className="mt-2 text-lg text-primary-foreground/90">
                                {formatPhone(user.phone)}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        <form
                            action={async () => {
                                "use server";
                                await signOut();
                            }}
                        >
                            <button
                                type="submit"
                                className="group flex items-center gap-2 rounded-sm border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sign Out</span>
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <div className="mx-auto w-full max-w-5xl px-6 py-8 md:px-12">
                {/* KYC Status Banner */}
                <div className="mb-10">
                    {user.verificationStatus === "UNVERIFIED" || user.verificationStatus === "REJECTED" ? (
                        <div className="flex flex-col items-start gap-4 rounded-md border border-warning/30 bg-warning/5 p-6 shadow-soft-sm md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-warning/10 p-2 text-warning">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-heading">Identity Verification Required</h3>
                                    <p className="text-sm text-body">
                                        To ensure safety and trust in our community, please complete your identity verification to start renting or listing items.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={"/verify-identity" as never}
                                className="mt-4 flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-warning px-6 py-3 text-sm font-bold text-white shadow-soft-sm transition-transform hover:scale-[1.02] hover:shadow-soft-md md:mt-0 md:w-auto"
                            >
                                Verify Identity
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : user.verificationStatus === "PENDING" ? (
                        <div className="flex items-center gap-4 rounded-md border border-info/30 bg-info/5 p-6 shadow-soft-sm">
                            <div className="rounded-full bg-info/10 p-2 text-info">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-heading">Verification in Progress</h3>
                                <p className="text-sm text-body">
                                    We are currently reviewing your documents. This usually takes 24-48 hours.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 rounded-md border border-success/30 bg-success/5 p-6 shadow-soft-sm md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-success/10 p-2 text-success">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-heading">Verified Member</h3>
                                    <p className="text-sm text-body">
                                        Your identity has been verified. You have full access to RENTU services.
                                    </p>
                                </div>
                            </div>
                            {/* Primary CTA for verified users — Epic 2 */}
                            <Link
                                href={"/items/create" as never}
                                className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3 font-bold text-white shadow-soft-sm transition-all hover:bg-primary/90 hover:shadow-soft-md md:w-auto"
                            >
                                <PlusCircle className="h-4 w-4" />
                                List an Item
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions for Admin/User */}
                {(user.role === "ADMIN" || user.verificationStatus === "UNVERIFIED" || user.verificationStatus === "REJECTED") && (
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-heading">Quick Actions</h2>
                        <div className="flex flex-wrap gap-4">
                            {user.role === "ADMIN" && (
                                <Link
                                    href={"/admin/kyc" as never}
                                    className="flex items-center gap-3 rounded-sm bg-primary px-6 py-4 text-white shadow-soft-md transition-all hover:bg-primary/90 hover:shadow-soft-lg"
                                >
                                    <Shield className="h-5 w-5" />
                                    <span className="font-bold">Approve KYC Requests</span>
                                    <ChevronRight className="h-4 w-4 opacity-70" />
                                </Link>
                            )}
                            {(user.verificationStatus === "UNVERIFIED" || user.verificationStatus === "REJECTED") && (
                                <Link
                                    href={"/verify-identity" as never}
                                    className="flex items-center gap-3 rounded-sm bg-accent px-6 py-4 text-white shadow-soft-md transition-all hover:bg-accent/90 hover:shadow-soft-lg"
                                >
                                    <User className="h-5 w-5" />
                                    <span className="font-bold">Complete Verification</span>
                                    <ChevronRight className="h-4 w-4 opacity-70" />
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Dashboard Grid */}
                <h2 className="mb-6 text-2xl font-bold text-heading">Dashboard</h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Admin Actions */}
                    {user.role === "ADMIN" && (
                        <Link
                            href={"/admin/kyc" as never}
                            className="group flex flex-col justify-between rounded-md border border-border bg-card p-6 shadow-soft-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-soft-md"
                        >
                            <div>
                                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-heading">Review KYC Requests</h3>
                                <p className="text-sm text-muted">
                                    Manage and review identity verification submissions from users.
                                </p>
                            </div>
                            <span className="mt-4 flex items-center text-sm font-medium text-primary decoration-2 underline-offset-4 group-hover:underline">
                                Go to Admin Panel <ChevronRight className="ml-1 h-4 w-4" />
                            </span>
                        </Link>
                    )}

                    {/* Browse */}
                    <Link
                        href={"/browse" as never}
                        className="group flex flex-col justify-between rounded-md border border-border bg-card p-6 shadow-soft-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-soft-md"
                    >
                        <div>
                            <div className="mb-4 inline-flex rounded-full bg-secondary p-3 text-secondary-foreground group-hover:bg-secondary-foreground group-hover:text-secondary transition-colors">
                                <Package className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-heading">Browse Items</h3>
                            <p className="text-sm text-muted">
                                Explore a curated collection of luxury items available for rent.
                            </p>
                        </div>
                        <span className="mt-4 flex items-center text-sm font-medium text-primary decoration-2 underline-offset-4 group-hover:underline">
                            Start Browsing <ChevronRight className="ml-1 h-4 w-4" />
                        </span>
                    </Link>

                    {/* List an Item — Epic 2 primary CTA */}
                    <Link
                        href={"/items/create" as never}
                        className="group flex flex-col justify-between rounded-md border border-border bg-card p-6 shadow-soft-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-soft-md"
                    >
                        <div>
                            <div className="mb-4 inline-flex rounded-full bg-accent/10 p-3 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                                <PlusCircle className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-heading">List an Item</h3>
                            <p className="text-sm text-muted">
                                Monetize your luxury assets by listing them for rent on our secure platform.
                            </p>
                        </div>
                        <span className="mt-4 flex items-center text-sm font-medium text-primary decoration-2 underline-offset-4 group-hover:underline">
                            Create Listing <ChevronRight className="ml-1 h-4 w-4" />
                        </span>
                    </Link>

                    {/* Profile */}
                    <Link
                        href={"/profile" as never}
                        className="group flex flex-col justify-between rounded-md border border-border bg-card p-6 shadow-soft-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-soft-md"
                    >
                        <div>
                            <div className="mb-4 inline-flex rounded-full bg-slate-100 p-3 text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                                <User className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-heading">My Profile</h3>
                            <p className="text-sm text-muted">
                                Manage your account settings, personal information, and preferences.
                            </p>
                        </div>
                        <span className="mt-4 flex items-center text-sm font-medium text-primary decoration-2 underline-offset-4 group-hover:underline">
                            View Profile <ChevronRight className="ml-1 h-4 w-4" />
                        </span>
                    </Link>
                </div>

                {/* ── My Listings Section (Epic 2) ──────────────────────────── */}
                {isVerified && (
                    <div className="mt-12">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-heading">My Listings</h2>
                                <p className="text-sm text-muted">{myItems.length} item{myItems.length !== 1 ? "s" : ""}</p>
                            </div>
                            <Link href={"/my-listings" as never} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                                View All <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {myItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card py-12 text-center">
                                <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                                    <Package className="h-8 w-8" />
                                </div>
                                <h3 className="mb-1 font-bold text-heading">No listings yet</h3>
                                <p className="mb-4 text-sm text-muted">Start earning from your luxury items today.</p>
                                <Link
                                    href={"/items/create" as never}
                                    className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    Create Your First Listing
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {myItems.slice(0, 3).map((item: Awaited<ReturnType<typeof getMyItems>>[number]) => {
                                    const cover = item.images[0];
                                    const catLabel = CATEGORY_LABELS[item.category as ItemCategoryType] ?? item.category;
                                    return (
                                        <div
                                            key={item.id}
                                            className="group overflow-hidden rounded-md border border-border bg-card shadow-soft-sm transition-all hover:-translate-y-1 hover:shadow-soft-md"
                                        >
                                            <div className="relative h-36 overflow-hidden bg-slate-100">
                                                {cover ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={cover.url} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-slate-300">
                                                        <ImageIcon className="h-10 w-10" />
                                                    </div>
                                                )}
                                                <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[item.status as ItemStatusType] ?? ""}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <div className="p-3">
                                                <p className="mb-0.5 font-bold text-heading line-clamp-1">{item.title || "Untitled Draft"}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-xs text-muted">
                                                        <Tag className="h-3 w-3" />{catLabel}
                                                    </div>
                                                    <span className="text-sm font-bold text-primary">฿{item.dailyPrice.toLocaleString("th-TH")}/day</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {myItems.length > 3 && (
                                    <Link href={"/my-listings" as never} className="flex items-center justify-center rounded-md border border-dashed border-border bg-card p-6 text-sm font-medium text-primary hover:bg-slate-50">
                                        +{myItems.length - 3} more <ChevronRight className="ml-1 h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
