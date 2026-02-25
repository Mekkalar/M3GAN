"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronRight,
    ChevronLeft,
    Save,
    X,
    Check,
    UploadCloud,
    Eye,
    Calendar,
    DollarSign,
    ImageIcon,
    FileText,
} from "lucide-react";
import { useUploadThing } from "~/lib/uploadthing";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useDropzone } from "@uploadthing/react";
import {
    createItemDraft,
    updateItemDetails,
    updateItemPricing,
    addItemImage,
    removeItemImage,
    publishItem,
    toggleDateBlock,
} from "~/modules/inventory/actions/items";
import {
    ITEM_CATEGORIES,
    CATEGORY_LABELS,
    ITEM_CONDITIONS,
    CONDITION_LABELS,
} from "~/lib/validators/item";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedImage {
    id?: string;
    url: string;
    fileKey: string;
    order: number;
}

interface WizardState {
    itemId: string | null;
    title: string;
    description: string;
    brand: string;
    category: string;
    condition: string;
    province: string;
    district: string;
    images: UploadedImage[];
    dailyPrice: string;
    weeklyPrice: string;
    replacementValue: string;
    securityDeposit: string;
    blockedDates: Set<string>; // "YYYY-MM-DD"
}

const STEPS = [
    { id: 1, label: "Details", icon: FileText },
    { id: 2, label: "Photos", icon: ImageIcon },
    { id: 3, label: "Pricing", icon: DollarSign },
    { id: 4, label: "Calendar", icon: Calendar },
    { id: 5, label: "Review", icon: Eye },
];

// ─── Thai Provinces (abbreviated list) ───────────────────────────────────────

const PROVINCES = [
    "Bangkok", "Chiang Mai", "Chiang Rai", "Phuket", "Pattaya / Chonburi",
    "Khon Kaen", "Nakhon Ratchasima", "Udon Thani", "Hat Yai / Songkhla",
    "Nonthaburi", "Samut Prakan", "Rayong", "Kanchanaburi", "Other",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTHB(val: string) {
    const n = parseInt(val, 10);
    if (isNaN(n)) return "—";
    return `฿${n.toLocaleString("th-TH")}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepBadge({ num, active, done }: { num: number; active: boolean; done: boolean }) {
    if (done) return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
            <Check className="h-4 w-4" />
        </span>
    );
    return (
        <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${active ? "border-primary bg-primary text-white" : "border-border text-muted"}`}>
            {num}
        </span>
    );
}

// ─── Calendar Component ───────────────────────────────────────────────────────

function AvailabilityCalendar({
    blockedDates,
    onToggle,
}: {
    blockedDates: Set<string>;
    onToggle: (date: string) => void;
}) {
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(new Date().getMonth()); // 0-indexed

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const monthLabel = new Date(viewYear, viewMonth).toLocaleString("en-US", { month: "long", year: "numeric" });

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const toKey = (day: number) => {
        const m = String(viewMonth + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        return `${viewYear}-${m}-${d}`;
    };

    const isPast = (day: number) => new Date(viewYear, viewMonth, day) < today;

    return (
        <div className="select-none">
            {/* Month nav */}
            <div className="mb-4 flex items-center justify-between">
                <button onClick={prevMonth} className="rounded-sm p-2 hover:bg-slate-100 transition-colors">
                    <ChevronLeft className="h-5 w-5 text-muted" />
                </button>
                <span className="font-bold text-heading">{monthLabel}</span>
                <button onClick={nextMonth} className="rounded-sm p-2 hover:bg-slate-100 transition-colors">
                    <ChevronRight className="h-5 w-5 text-muted" />
                </button>
            </div>

            {/* Day headers */}
            <div className="mb-1 grid grid-cols-7 text-center text-xs font-bold text-muted">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                    <div key={d} className="py-1">{d}</div>
                ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                    if (day === null) return <div key={`empty-${i}`} />;
                    const key = toKey(day);
                    const past = isPast(day);
                    const blocked = blockedDates.has(key);
                    const isToday = new Date(viewYear, viewMonth, day).getTime() === today.getTime();

                    return (
                        <button
                            key={key}
                            disabled={past}
                            onClick={() => !past && onToggle(key)}
                            className={`flex aspect-square items-center justify-center rounded text-sm font-medium transition-all ${past
                                ? "cursor-not-allowed text-slate-300"
                                : blocked
                                    ? "bg-error text-white shadow-sm hover:bg-error/80"
                                    : isToday
                                        ? "border-2 border-primary text-primary hover:bg-primary/10"
                                        : "text-body hover:bg-slate-100"
                                }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            <p className="mt-4 text-center text-xs text-muted">
                Tap a date to toggle it blocked (red). Past dates are disabled.
            </p>
        </div>
    );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function ListingWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [state, setState] = useState<WizardState>({
        itemId: null,
        title: "",
        description: "",
        brand: "",
        category: "CAMERAS_PHOTOGRAPHY",
        condition: "GOOD",
        province: "",
        district: "",
        images: [],
        dailyPrice: "",
        weeklyPrice: "",
        replacementValue: "",
        securityDeposit: "",
        blockedDates: new Set(),
    });

    const set = (field: keyof WizardState, value: unknown) =>
        setState(prev => ({ ...prev, [field]: value }));

    // ── Uploadthing for listing photos ─────────────────────────────────────────
    const { startUpload } = useUploadThing("listingImages", {
        onClientUploadComplete: async (res) => {
            if (!state.itemId) return;
            const newImages: UploadedImage[] = [];
            for (const f of res) {
                const result = await addItemImage(
                    state.itemId,
                    f.ufsUrl,
                    f.key,
                    state.images.length + newImages.length,
                );
                if (result.success) {
                    newImages.push({ id: result.data.imageId, url: f.ufsUrl, fileKey: f.key, order: state.images.length + newImages.length });
                }
            }
            setState(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
            setIsUploading(false);
        },
        onUploadError: (err) => {
            setError(err.message);
            setIsUploading(false);
        },
    });

    const onDrop = useCallback(async (files: File[]) => {
        if (!state.itemId) {
            setError("Please complete Step 1 first.");
            return;
        }
        setIsUploading(true);
        setError(null);
        await startUpload(files);
    }, [state.itemId, startUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: generateClientDropzoneAccept(["image/*"]),
        multiple: true,
        maxFiles: 10,
    });

    // ── Step navigation ────────────────────────────────────────────────────────

    const handleNext = () => {
        setError(null);
        startTransition(async () => {
            if (step === 1) {
                // Create draft on first next if not yet created
                let id = state.itemId;
                if (!id) {
                    const res = await createItemDraft();
                    if (!res.success) { setError(res.message ?? "Failed to create draft."); return; }
                    id = res.data.itemId;
                    set("itemId", id);
                }
                // Save details
                const res = await updateItemDetails(id, {
                    title: state.title,
                    description: state.description,
                    brand: state.brand || undefined,
                    category: state.category,
                    condition: state.condition,
                    province: state.province,
                    district: state.district,
                });
                if (!res.success) { setError(res.message ?? "Please fill in all required fields."); return; }
            }

            if (step === 3) {
                if (!state.itemId) return;
                const res = await updateItemPricing(state.itemId, {
                    dailyPrice: state.dailyPrice,
                    weeklyPrice: state.weeklyPrice || undefined,
                    replacementValue: state.replacementValue,
                    securityDeposit: state.securityDeposit,
                });
                if (!res.success) { setError(res.message ?? "Please check your pricing."); return; }
            }

            if (step === 4 && state.itemId) {
                // Sync blocked dates to server
                // (already synced on each toggle — nothing to do here)
            }

            setStep(s => Math.min(s + 1, 5));
        });
    };

    const handlePublish = () => {
        if (!state.itemId) return;
        setError(null);
        startTransition(async () => {
            const res = await publishItem(state.itemId!);
            if (!res.success) { setError(res.message ?? "Publication failed."); return; }
            router.push("/my-listings" as never);
        });
    };

    const handleToggleDate = async (dateStr: string) => {
        if (!state.itemId) return;
        const res = await toggleDateBlock(state.itemId, dateStr);
        if (res.success) {
            setState(prev => {
                const next = new Set(prev.blockedDates);
                if (res.data.blocked) next.add(dateStr);
                else next.delete(dateStr);
                return { ...prev, blockedDates: next };
            });
        }
    };

    const removeImg = async (img: UploadedImage) => {
        if (img.id) await removeItemImage(img.id);
        setState(prev => ({ ...prev, images: prev.images.filter(i => i.url !== img.url) }));
    };

    // ── Pricing preview ────────────────────────────────────────────────────────
    const avgDaily7 = (() => {
        const d = parseInt(state.dailyPrice, 10);
        const w = parseInt(state.weeklyPrice, 10);
        if (!isNaN(w) && w > 0) return Math.round((w + d * 6) / 7);
        return d;
    })();

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-4 py-3 shadow-soft-sm">
                <button
                    onClick={() => router.push("/my-listings" as never)}
                    className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-heading"
                >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Save &amp; Exit</span>
                </button>
                <span className="text-sm font-bold text-heading">List an Item</span>
                <div className="flex items-center gap-1 text-xs text-muted">
                    <Save className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Auto-saved</span>
                </div>
            </div>

            {/* Progress stepper */}
            <div className="border-b border-border bg-white px-4 py-4">
                <div className="mx-auto flex max-w-2xl items-center justify-between">
                    {STEPS.map((s, idx) => (
                        <div key={s.id} className="flex items-center">
                            <div className="flex flex-col items-center gap-1">
                                <StepBadge num={s.id} active={step === s.id} done={step > s.id} />
                                <span className={`text-[10px] font-medium ${step === s.id ? "text-primary" : step > s.id ? "text-success" : "text-muted"}`}>
                                    {s.label}
                                </span>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className={`mx-1 mb-5 h-[2px] w-6 sm:w-10 md:w-16 transition-colors ${step > s.id ? "bg-primary" : "bg-border"}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step content */}
            <div className="mx-auto max-w-2xl px-4 py-8">
                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded border border-error/20 bg-error/5 p-4 text-sm text-error">
                        <X className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* ── Step 1: Details ── */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-heading">Item Details</h2>

                        <Field label="Title *">
                            <input
                                value={state.title}
                                onChange={e => set("title", e.target.value)}
                                placeholder="e.g. Sony A7 IV Mirrorless Camera"
                                className={inputCls}
                            />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Category *">
                                <select value={state.category} onChange={e => set("category", e.target.value)} className={inputCls}>
                                    {ITEM_CATEGORIES.map(c => (
                                        <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Condition *">
                                <select value={state.condition} onChange={e => set("condition", e.target.value)} className={inputCls}>
                                    {ITEM_CONDITIONS.map(c => (
                                        <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <Field label="Brand">
                            <input
                                value={state.brand}
                                onChange={e => set("brand", e.target.value)}
                                placeholder="e.g. Sony, Canon, DJI"
                                className={inputCls}
                            />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Province *">
                                <select value={state.province} onChange={e => set("province", e.target.value)} className={inputCls}>
                                    <option value="">Select Province</option>
                                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </Field>
                            <Field label="District *">
                                <input
                                    value={state.district}
                                    onChange={e => set("district", e.target.value)}
                                    placeholder="e.g. Sukhumvit"
                                    className={inputCls}
                                />
                            </Field>
                        </div>

                        <Field label="Description *">
                            <textarea
                                value={state.description}
                                onChange={e => set("description", e.target.value)}
                                placeholder="Describe your item — condition, accessories included, rental rules…"
                                rows={5}
                                className={inputCls + " resize-none"}
                            />
                            <p className="mt-1 text-xs text-muted">{state.description.length}/2000</p>
                        </Field>
                    </div>
                )}

                {/* ── Step 2: Photos ── */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-heading">Photos</h2>
                            <p className="mt-1 text-sm text-muted">Upload up to 10 photos. First photo is the cover.</p>
                        </div>

                        {/* Dropzone */}
                        {state.images.length < 10 && (
                            <div
                                {...getRootProps()}
                                className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded border-2 border-dashed p-6 text-center transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-slate-100"}`}
                            >
                                <input {...getInputProps()} />
                                <div className="rounded-full bg-primary/10 p-3 text-primary">
                                    <UploadCloud className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-medium text-body">
                                        {isDragActive ? "Drop photos here" : "Drag & drop or click to add photos"}
                                    </p>
                                    <p className="text-xs text-muted">Max 8 MB per photo · {10 - state.images.length} remaining</p>
                                </div>
                                {isUploading && (
                                    <p className="text-sm font-medium text-primary animate-pulse">Uploading…</p>
                                )}
                            </div>
                        )}

                        {/* Preview grid */}
                        {state.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {state.images.map((img, idx) => (
                                    <div key={img.url} className="group relative aspect-square overflow-hidden rounded border border-border bg-slate-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img.url} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                                        {idx === 0 && (
                                            <span className="absolute bottom-0 left-0 right-0 bg-primary/80 py-0.5 text-center text-[10px] font-bold text-white">
                                                COVER
                                            </span>
                                        )}
                                        <button
                                            onClick={() => removeImg(img)}
                                            className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:flex"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {state.images.length === 0 && !isUploading && (
                            <p className="text-center text-sm text-muted">No photos yet — upload at least one to continue.</p>
                        )}
                    </div>
                )}

                {/* ── Step 3: Pricing ── */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-heading">Pricing</h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field label="Daily Rate (฿) *">
                                <THBInput value={state.dailyPrice} onChange={v => set("dailyPrice", v)} placeholder="500" />
                            </Field>
                            <Field label="Weekly Rate — First Day (฿)">
                                <THBInput value={state.weeklyPrice} onChange={v => set("weeklyPrice", v)} placeholder="3000 (optional)" />
                                <p className="mt-1 text-xs text-muted">Rate for day 1 of a 7-day rental. Leave empty to use Daily × 7.</p>
                            </Field>
                        </div>

                        {/* Live pricing preview */}
                        {state.dailyPrice && (
                            <div className="rounded border border-primary/20 bg-primary/5 p-4 space-y-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-primary">Pricing Preview</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-muted">1-day rental</span>
                                    <span className="font-bold text-heading">{formatTHB(state.dailyPrice)}</span>
                                    <span className="text-muted">7-day avg/day</span>
                                    <span className="font-bold text-heading">
                                        {!isNaN(avgDaily7) ? `฿${avgDaily7.toLocaleString("th-TH")}` : "—"}
                                    </span>
                                    <span className="text-muted">7-day total</span>
                                    <span className="font-bold text-heading">
                                        {!isNaN(avgDaily7) ? `฿${(avgDaily7 * 7).toLocaleString("th-TH")}` : "—"}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="h-px bg-border" />

                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field label="Replacement Value (฿) *">
                                <THBInput value={state.replacementValue} onChange={v => set("replacementValue", v)} placeholder="50000" />
                                <p className="mt-1 text-xs text-muted">How much the item costs to replace if lost or destroyed.</p>
                            </Field>
                            <Field label="Security Deposit (฿) *">
                                <THBInput value={state.securityDeposit} onChange={v => set("securityDeposit", v)} placeholder="10000" />
                                <p className="mt-1 text-xs text-muted">Must not exceed Replacement Value.</p>
                                {state.securityDeposit && state.replacementValue &&
                                    parseInt(state.securityDeposit, 10) > parseInt(state.replacementValue, 10) && (
                                        <p className="mt-1 text-xs font-medium text-error">
                                            ⚠ Security deposit cannot exceed replacement value.
                                        </p>
                                    )}
                            </Field>
                        </div>
                    </div>
                )}

                {/* ── Step 4: Availability Calendar ── */}
                {step === 4 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-heading">Availability</h2>
                            <p className="mt-1 text-sm text-muted">
                                Block dates when your item is unavailable. Renters cannot select blocked dates.
                            </p>
                        </div>

                        <div className="rounded border border-border bg-white p-5 shadow-soft-sm">
                            <AvailabilityCalendar
                                blockedDates={state.blockedDates}
                                onToggle={handleToggleDate}
                            />
                        </div>

                        {state.blockedDates.size > 0 && (
                            <div className="rounded border border-error/20 bg-error/5 p-4">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-error">
                                    Blocked Dates ({state.blockedDates.size})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {[...state.blockedDates].sort().map(d => (
                                        <span key={d} className="flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-xs text-error">
                                            {d}
                                            <button onClick={() => handleToggleDate(d)} className="hover:text-error/70">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Step 5: Review ── */}
                {step === 5 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-heading">Review Your Listing</h2>
                            <p className="mt-1 text-sm text-muted">This is how renters will see your item.</p>
                        </div>

                        {/* Preview Card */}
                        <div className="overflow-hidden rounded-md border border-border bg-white shadow-soft-md">
                            {/* Cover photo */}
                            {state.images[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={state.images[0].url}
                                    alt="Cover"
                                    className="h-56 w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-56 items-center justify-center bg-slate-100 text-muted">
                                    <ImageIcon className="h-12 w-12 opacity-30" />
                                </div>
                            )}

                            <div className="p-5 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-heading">{state.title || "Untitled Listing"}</h3>
                                        <p className="text-sm text-muted">{state.province}{state.district ? `, ${state.district}` : ""}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-xl font-bold text-primary">{formatTHB(state.dailyPrice)}</p>
                                        <p className="text-xs text-muted">/day</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Chip>{CATEGORY_LABELS[state.category as keyof typeof CATEGORY_LABELS] ?? state.category}</Chip>
                                    <Chip>{CONDITION_LABELS[state.condition as keyof typeof CONDITION_LABELS] ?? state.condition}</Chip>
                                    {state.brand && <Chip>{state.brand}</Chip>}
                                </div>

                                <p className="text-sm text-body line-clamp-3">{state.description || "No description yet."}</p>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <ReviewRow label="Daily Rate" value={formatTHB(state.dailyPrice)} />
                                    <ReviewRow label="7-Day Avg / Day" value={!isNaN(avgDaily7) ? `฿${avgDaily7.toLocaleString("th-TH")}` : "—"} />
                                    <ReviewRow label="Replacement Value" value={formatTHB(state.replacementValue)} />
                                    <ReviewRow label="Security Deposit" value={formatTHB(state.securityDeposit)} />
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {state.blockedDates.size > 0
                                            ? `${state.blockedDates.size} date(s) blocked`
                                            : "All dates currently available"}
                                    </span>
                                </div>

                                {/* Photo count */}
                                {state.images.length > 1 && (
                                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                                        {state.images.slice(1).map((img, i) => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img key={i} src={img.url} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded border border-info/20 bg-info/5 p-4 text-sm text-info">
                            <p className="font-medium">Everything looks good?</p>
                            <p className="mt-0.5 opacity-80">Click <strong>Publish Listing</strong> to make it live. You can edit or pause it anytime from My Listings.</p>
                        </div>
                    </div>
                )}

                {/* ── Navigation buttons ── */}
                <div className="mt-10 flex gap-4">
                    {step > 1 && (
                        <button
                            onClick={() => { setError(null); setStep(s => s - 1); }}
                            disabled={isPending}
                            className="flex items-center gap-2 rounded-sm border border-border px-6 py-3 font-medium text-body transition-all hover:bg-slate-100"
                        >
                            <ChevronLeft className="h-4 w-4" /> Back
                        </button>
                    )}

                    {step < 5 ? (
                        <button
                            onClick={handleNext}
                            disabled={isPending || isUploading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-white shadow-soft-md transition-all hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isPending ? "Saving…" : <>Next <ChevronRight className="h-4 w-4" /></>}
                        </button>
                    ) : (
                        <button
                            onClick={handlePublish}
                            disabled={isPending}
                            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-white shadow-soft-md transition-all hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isPending ? "Publishing…" : <><Check className="h-5 w-5" /> Publish Listing</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

const inputCls = "w-full rounded border border-border bg-white px-4 py-3 text-sm text-body placeholder:text-slate-300 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-bold text-heading">{label}</label>
            {children}
        </div>
    );
}

function THBInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">฿</span>
            <input
                type="number"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                min={0}
                className={inputCls + " pl-8"}
            />
        </div>
    );
}

function Chip({ children }: { children: React.ReactNode }) {
    return (
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {children}
        </span>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-muted">{label}</span>
            <span className="font-bold text-heading">{value}</span>
        </div>
    );
}
