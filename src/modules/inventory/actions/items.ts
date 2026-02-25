"use server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { detailsSchema, pricingSchema } from "~/lib/validators/item";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionResponse<T> =
    | { success: true; data: T }
    | { success: false; code: "UNAUTHORIZED" | "FORBIDDEN" | "VALIDATION_ERROR" | "NOT_FOUND" | "SERVER_ERROR"; message?: string };

async function requireVerifiedUser() {
    const session = await auth();
    if (!session?.user) return null;
    if (session.user.verificationStatus !== "VERIFIED") return null;
    return session.user;
}

async function requireOwnership(itemId: string, userId: string) {
    const item = await db.item.findUnique({ where: { id: itemId }, select: { ownerId: true } });
    if (!item) return false;
    return item.ownerId === userId;
}

// ─── createItemDraft ──────────────────────────────────────────────────────────
// Story 2.1: Creates an empty DRAFT immediately so other steps can attach to it.

export async function createItemDraft(): Promise<ActionResponse<{ itemId: string }>> {
    const user = await requireVerifiedUser();
    if (!user) return { success: false, code: "UNAUTHORIZED", message: "Please verify your identity first." };

    try {
        const item = await db.item.create({
            data: {
                ownerId: user.id,
                title: "",
                description: "",
                category: "OTHER",
                condition: "GOOD",
                dailyPrice: 0,
                replacementValue: 0,
                securityDeposit: 0,
                status: "DRAFT",
            },
        });
        return { success: true, data: { itemId: item.id } };
    } catch (err) {
        console.error("[createItemDraft]", err);
        return { success: false, code: "SERVER_ERROR", message: "Could not create draft." };
    }
}

// ─── updateItemDetails ────────────────────────────────────────────────────────
// Story 2.1 Step 1

export async function updateItemDetails(
    itemId: string,
    rawInput: unknown,
): Promise<ActionResponse<void>> {
    const user = await requireVerifiedUser();
    if (!user) return { success: false, code: "UNAUTHORIZED" };
    if (!(await requireOwnership(itemId, user.id))) return { success: false, code: "FORBIDDEN" };

    const parsed = detailsSchema.safeParse(rawInput);
    if (!parsed.success) {
        return { success: false, code: "VALIDATION_ERROR", message: parsed.error.errors[0]?.message };
    }

    try {
        await db.item.update({ where: { id: itemId }, data: parsed.data });
        revalidatePath(`/items/create`);
        return { success: true, data: undefined };
    } catch (err) {
        console.error("[updateItemDetails]", err);
        return { success: false, code: "SERVER_ERROR" };
    }
}

// ─── updateItemPricing ────────────────────────────────────────────────────────
// Stories 2.2 & 2.3

export async function updateItemPricing(
    itemId: string,
    rawInput: unknown,
): Promise<ActionResponse<void>> {
    const user = await requireVerifiedUser();
    if (!user) return { success: false, code: "UNAUTHORIZED" };
    if (!(await requireOwnership(itemId, user.id))) return { success: false, code: "FORBIDDEN" };

    const parsed = pricingSchema.safeParse(rawInput);
    if (!parsed.success) {
        return { success: false, code: "VALIDATION_ERROR", message: parsed.error.errors[0]?.message };
    }

    const { dailyPrice, weeklyPrice, replacementValue, securityDeposit } = parsed.data;

    try {
        await db.item.update({
            where: { id: itemId },
            data: {
                dailyPrice,
                weeklyPrice: weeklyPrice !== undefined && weeklyPrice !== "" ? Number(weeklyPrice) : null,
                replacementValue,
                securityDeposit,
            },
        });
        revalidatePath(`/items/create`);
        return { success: true, data: undefined };
    } catch (err) {
        console.error("[updateItemPricing]", err);
        return { success: false, code: "SERVER_ERROR" };
    }
}

// ─── addItemImage ─────────────────────────────────────────────────────────────
// Story 2.1 Step 2

export async function addItemImage(
    itemId: string,
    url: string,
    fileKey: string,
    order: number,
): Promise<ActionResponse<{ imageId: string }>> {
    const user = await requireVerifiedUser();
    if (!user) return { success: false, code: "UNAUTHORIZED" };
    if (!(await requireOwnership(itemId, user.id))) return { success: false, code: "FORBIDDEN" };

    const count = await db.itemImage.count({ where: { itemId } });
    if (count >= 10) return { success: false, code: "VALIDATION_ERROR", message: "Maximum 10 images per listing." };

    try {
        const img = await db.itemImage.create({ data: { itemId, url, fileKey, order } });
        return { success: true, data: { imageId: img.id } };
    } catch (err) {
        console.error("[addItemImage]", err);
        return { success: false, code: "SERVER_ERROR" };
    }
}

// ─── removeItemImage ──────────────────────────────────────────────────────────

export async function removeItemImage(imageId: string): Promise<ActionResponse<void>> {
    const user = await requireVerifiedUser();
    if (!user) return { success: false, code: "UNAUTHORIZED" };

    const image = await db.itemImage.findUnique({ where: { id: imageId }, include: { item: true } });
    if (!image) return { success: false, code: "NOT_FOUND" };
    if (image.item.ownerId !== user.id) return { success: false, code: "FORBIDDEN" };

    await db.itemImage.delete({ where: { id: imageId } });
    return { success: true, data: undefined };
}

// ─── publishItem ──────────────────────────────────────────────────────────────
// Story 2.1: Final step — validates all required fields then sets PUBLISHED.

export async function publishItem(itemId: string): Promise<ActionResponse<void>> {
    const user = await requireVerifiedUser();
    if (!user) return { success: false, code: "UNAUTHORIZED" };
    if (!(await requireOwnership(itemId, user.id))) return { success: false, code: "FORBIDDEN" };

    const item = await db.item.findUnique({
        where: { id: itemId },
        include: { images: true },
    });
    if (!item) return { success: false, code: "NOT_FOUND" };

    // Validate all required fields are populated
    if (!item.title || item.title.length < 5)
        return { success: false, code: "VALIDATION_ERROR", message: "Please complete Step 1: add a title." };
    if (!item.description || item.description.length < 20)
        return { success: false, code: "VALIDATION_ERROR", message: "Please complete Step 1: add a description." };
    if (item.images.length === 0)
        return { success: false, code: "VALIDATION_ERROR", message: "Please complete Step 2: upload at least one photo." };
    if (item.dailyPrice < 1)
        return { success: false, code: "VALIDATION_ERROR", message: "Please complete Step 3: set a daily price." };
    if (item.replacementValue < 1)
        return { success: false, code: "VALIDATION_ERROR", message: "Please complete Step 3: set replacement value." };
    if (item.securityDeposit > item.replacementValue)
        return { success: false, code: "VALIDATION_ERROR", message: "Security deposit cannot exceed replacement value." };

    await db.item.update({ where: { id: itemId }, data: { status: "PUBLISHED" } });
    revalidatePath("/my-listings");
    return { success: true, data: undefined };
}

// ─── blockDate / unblockDate ──────────────────────────────────────────────────
// Story 2.4

export async function toggleDateBlock(
    itemId: string,
    dateStr: string, // "YYYY-MM-DD"
): Promise<ActionResponse<{ blocked: boolean }>> {
    const user = await requireVerifiedUser();
    if (!user) return { success: false, code: "UNAUTHORIZED" };
    if (!(await requireOwnership(itemId, user.id))) return { success: false, code: "FORBIDDEN" };

    const date = new Date(dateStr + "T00:00:00.000Z");

    try {
        const existing = await db.availability.findUnique({
            where: { itemId_date: { itemId, date } },
        });

        if (existing) {
            await db.availability.delete({ where: { id: existing.id } });
            return { success: true, data: { blocked: false } };
        } else {
            await db.availability.create({ data: { itemId, date, isBlocked: true } });
            return { success: true, data: { blocked: true } };
        }
    } catch (err) {
        console.error("[toggleDateBlock]", err);
        return { success: false, code: "SERVER_ERROR" };
    }
}

// ─── getMyItems ───────────────────────────────────────────────────────────────
// Dashboard "My Listings" section

export async function getMyItems() {
    const session = await auth();
    if (!session?.user) return [];

    return db.item.findMany({
        where: { ownerId: session.user.id },
        include: { images: { orderBy: { order: "asc" }, take: 1 } },
        orderBy: { updatedAt: "desc" },
    });
}

// ─── getItemWithDetails ───────────────────────────────────────────────────────

export async function getItemWithDetails(itemId: string) {
    return db.item.findUnique({
        where: { id: itemId },
        include: {
            images: { orderBy: { order: "asc" } },
            availability: { orderBy: { date: "asc" } },
        },
    });
}
