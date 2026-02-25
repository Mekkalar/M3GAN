import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyItems } from "~/modules/inventory/actions/items";
import { CATEGORY_LABELS, ITEM_CATEGORIES, ItemStatusType, ItemCategoryType } from "~/lib/validators/item";
import {
    PlusCircle,
    Package,
    ImageIcon,
    Calendar,
    ChevronRight,
    Tag,
} from "lucide-react";

export const metadata = {
    title: "My Listings | RENTU",
};

const STATUS_STYLES: Record<ItemStatusType, string> = {
    DRAFT: "bg-amber-100 text-amber-700",
    PUBLISHED: "bg-green-100 text-green-700",
    PAUSED: "bg-slate-100 text-slate-600",
    ARCHIVED: "bg-red-100 text-red-600",
};

export default async function MyListingsPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    if (session.user.verificationStatus !== "VERIFIED") redirect("/verify-identity?reason=listing");

    const items = await getMyItems();

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="border-b border-border bg-white px-4 py-6 shadow-soft-sm">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-heading">My Listings</h1>
                        <p className="text-sm text-muted">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                    </div>
                    <Link
                        href={"/items/create" as never}
                        className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-bold text-white shadow-soft-sm transition-all hover:bg-primary/90 hover:shadow-soft-md"
                    >
                        <PlusCircle className="h-4 w-4" />
                        <span>List an Item</span>
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8">
                {items.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-white py-20 text-center">
                        <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                            <Package className="h-10 w-10" />
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-heading">No listings yet</h2>
                        <p className="mb-6 max-w-sm text-sm text-muted">
                            Your first listing is just a few steps away. Start earning from your luxury items today.
                        </p>
                        <Link
                            href={"/items/create" as never}
                            className="flex items-center gap-2 rounded-sm bg-primary px-6 py-3 font-bold text-white shadow-soft-md transition-all hover:bg-primary/90"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Create Your First Listing
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item: Awaited<ReturnType<typeof getMyItems>>[number]) => {
                            const cover = item.images[0];
                            const catLabel = CATEGORY_LABELS[item.category as ItemCategoryType] ?? item.category;
                            return (
                                <div
                                    key={item.id}
                                    className="group flex flex-col overflow-hidden rounded-md border border-border bg-white shadow-soft-sm transition-all hover:-translate-y-1 hover:shadow-soft-md"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative h-44 overflow-hidden bg-slate-100">
                                        {cover ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={cover.url}
                                                alt={item.title}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-slate-300">
                                                <ImageIcon className="h-12 w-12" />
                                            </div>
                                        )}
                                        {/* Status badge */}
                                        <span className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLES[item.status as ItemStatusType] ?? ""}`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-1 flex-col p-4">
                                        <h3 className="mb-1 font-bold text-heading line-clamp-1">
                                            {item.title || <span className="text-muted italic">Untitled Draft</span>}
                                        </h3>
                                        <div className="mb-3 flex items-center gap-1.5 text-xs text-muted">
                                            <Tag className="h-3 w-3" />
                                            {catLabel}
                                        </div>
                                        <div className="mb-4 flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-primary">
                                                ฿{item.dailyPrice.toLocaleString("th-TH")}
                                            </span>
                                            <span className="text-xs text-muted">/day</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-auto flex gap-2">
                                            <Link
                                                href={`/items/create?edit=${item.id}` as never}
                                                className="flex flex-1 items-center justify-center gap-1.5 rounded border border-border py-2 text-xs font-medium text-body transition-colors hover:bg-slate-50"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                href={`/my-listings/${item.id}/calendar` as never}
                                                className="flex items-center justify-center gap-1.5 rounded border border-border px-3 py-2 text-xs font-medium text-body transition-colors hover:bg-slate-50"
                                                title="Manage Calendar"
                                            >
                                                <Calendar className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Back to Dashboard */}
                <div className="mt-10 flex justify-center">
                    <Link href={"/" as never} className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
