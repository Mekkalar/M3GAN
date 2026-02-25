import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const ITEM_CATEGORIES = [
    "CAMERAS_PHOTOGRAPHY",
    "LENSES_OPTICS",
    "VIDEO_CINEMA",
    "AUDIO_SOUND",
    "DRONES_AERIAL",
    "LIGHTING_STUDIO",
    "COMPUTERS_TECH",
    "SPORTS_OUTDOOR",
    "VEHICLES_MOBILITY",
    "FASHION_ACCESSORIES",
    "HOME_EVENTS",
    "OTHER",
] as const;

export const CATEGORY_LABELS: Record<(typeof ITEM_CATEGORIES)[number], string> = {
    CAMERAS_PHOTOGRAPHY: "Cameras & Photography",
    LENSES_OPTICS: "Lenses & Optics",
    VIDEO_CINEMA: "Video & Cinema",
    AUDIO_SOUND: "Audio & Sound",
    DRONES_AERIAL: "Drones & Aerial",
    LIGHTING_STUDIO: "Lighting & Studio",
    COMPUTERS_TECH: "Computers & Tech",
    SPORTS_OUTDOOR: "Sports & Outdoor",
    VEHICLES_MOBILITY: "Vehicles & Mobility",
    FASHION_ACCESSORIES: "Fashion & Accessories",
    HOME_EVENTS: "Home & Events",
    OTHER: "Other",
};

export const ITEM_CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"] as const;

export const CONDITION_LABELS: Record<(typeof ITEM_CONDITIONS)[number], string> = {
    NEW: "New",
    LIKE_NEW: "Like New",
    GOOD: "Good",
    FAIR: "Fair",
};

export const ITEM_STATUSES = ["DRAFT", "PUBLISHED", "PAUSED", "ARCHIVED"] as const;
export type ItemStatusType = (typeof ITEM_STATUSES)[number];
export type ItemCategoryType = (typeof ITEM_CATEGORIES)[number];

// ─── Step Schemas ─────────────────────────────────────────────────────────────

export const detailsSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100),
    description: z.string().min(20, "Description must be at least 20 characters").max(2000),
    brand: z.string().max(80).optional(),
    category: z.enum(ITEM_CATEGORIES, { required_error: "Please select a category" }),
    condition: z.enum(ITEM_CONDITIONS, { required_error: "Please select a condition" }),
    province: z.string().min(1, "Province is required"),
    district: z.string().min(1, "District is required"),
});

export const pricingSchema = z
    .object({
        dailyPrice: z.coerce
            .number({ invalid_type_error: "Enter a valid amount" })
            .int()
            .min(1, "Daily price must be at least ฿1"),
        weeklyPrice: z.coerce
            .number({ invalid_type_error: "Enter a valid amount" })
            .int()
            .min(1)
            .optional()
            .or(z.literal("")),
        replacementValue: z.coerce
            .number({ invalid_type_error: "Enter a valid amount" })
            .int()
            .min(1, "Replacement value must be at least ฿1"),
        securityDeposit: z.coerce
            .number({ invalid_type_error: "Enter a valid amount" })
            .int()
            .min(0, "Security deposit cannot be negative"),
    })
    .refine(
        (data) => data.securityDeposit <= data.replacementValue,
        {
            message: "Security deposit cannot exceed replacement value",
            path: ["securityDeposit"],
        },
    );

export const availabilityBlockSchema = z.object({
    itemId: z.string().cuid(),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export type DetailsInput = z.infer<typeof detailsSchema>;
export type PricingInput = z.infer<typeof pricingSchema>;
