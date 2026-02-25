"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useUploadThing } from "~/lib/uploadthing";
import { useDropzone } from "@uploadthing/react";
import {
    UploadCloud,
    X,
    Lock,
    CheckCircle,
    AlertCircle,
    Loader2,
    Move,
    ShieldCheck,
} from "lucide-react";
import { submitVerification } from "~/modules/kyc/actions/submitVerification";
import { useRouter } from "next/navigation";
import { generateClientDropzoneAccept } from "uploadthing/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BoxState {
    x: number; // px from left of container
    y: number; // px from top of container
    width: number;
    height: number;
}

interface DragStart {
    mouseX: number;
    mouseY: number;
    boxX: number;
    boxY: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function IDCardUploadForm() {
    const router = useRouter();

    // Stage: "idle" | "preview" | "uploading"
    const [stage, setStage] = useState<"idle" | "preview" | "uploading">("idle");
    const [rawFile, setRawFile] = useState<File | null>(null);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Refs for coordinate math
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Blackout box state
    const [box, setBox] = useState<BoxState>({ x: 0, y: 0, width: 220, height: 40 });
    const [dragStart, setDragStart] = useState<DragStart | null>(null);
    const [confirmed, setConfirmed] = useState(false); // true after canvas compositing

    // ── Position box at 68% height on image load ──────────────────────────────
    const initBox = useCallback(() => {
        const img = imgRef.current;
        const container = containerRef.current;
        if (!img || !container) return;

        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const bw = Math.round(cw * 0.6);
        const bh = Math.round(ch * 0.08);
        setBox({
            x: Math.round((cw - bw) / 2),
            y: Math.round(ch * 0.68),
            width: bw,
            height: bh,
        });
    }, []);

    useEffect(() => {
        if (stage === "preview") {
            const id = setTimeout(initBox, 50);
            return () => clearTimeout(id);
        }
    }, [stage, initBox]);

    // ── Drag handlers ─────────────────────────────────────────────────────────
    const onBoxMouseDown = (e: React.MouseEvent) => {
        if (confirmed) return;
        e.preventDefault();
        setDragStart({ mouseX: e.clientX, mouseY: e.clientY, boxX: box.x, boxY: box.y });
    };

    const onContainerMouseMove = (e: React.MouseEvent) => {
        if (!dragStart || confirmed) return;
        const container = containerRef.current;
        if (!container) return;

        const dx = e.clientX - dragStart.mouseX;
        const dy = e.clientY - dragStart.mouseY;
        const cw = container.clientWidth;
        const ch = container.clientHeight;

        setBox((prev) => ({
            ...prev,
            x: Math.max(0, Math.min(cw - prev.width, dragStart.boxX + dx)),
            y: Math.max(0, Math.min(ch - prev.height, dragStart.boxY + dy)),
        }));
    };

    const stopDrag = () => setDragStart(null);

    // ── Uploadthing ───────────────────────────────────────────────────────────
    const { startUpload } = useUploadThing("idCardUpload", {
        onClientUploadComplete: async (res) => {
            if (!res?.[0]) return;
            const uploadedFile = res[0];

            try {
                const result = await submitVerification({
                    fileUrl: uploadedFile.ufsUrl,
                    fileKey: uploadedFile.key,
                });
                if (result.success) {
                    router.push("/verify-identity/pending");
                    router.refresh();
                } else {
                    setError(result.error || "Submission failed");
                    setStage("preview");
                }
            } catch {
                setError("Server communication error.");
                setStage("preview");
            }
        },
        onUploadError: (err: Error) => {
            setError(err.message);
            setStage("preview");
        },
    });

    // ── Canvas compositing ────────────────────────────────────────────────────
    const handleConfirmAndUpload = useCallback(async () => {
        const img = imgRef.current;
        const container = containerRef.current;
        if (!img || !container || !rawFile) return;

        setStage("uploading");
        setError(null);

        try {
            // Natural (full-resolution) image dimensions
            const nw = img.naturalWidth;
            const nh = img.naturalHeight;

            // Displayed image dimensions
            const dw = img.clientWidth;
            const dh = img.clientHeight;

            // Scale factors: displayed → natural coords
            const scaleX = nw / dw;
            const scaleY = nh / dh;

            // Offset of image inside container (handles letterbox / pillarbox)
            const imgRect = img.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const imgOffsetX = imgRect.left - containerRect.left;
            const imgOffsetY = imgRect.top - containerRect.top;

            // Box coords relative to the image element
            const relX = box.x - imgOffsetX;
            const relY = box.y - imgOffsetY;

            // Scale to natural pixels
            const natX = Math.round(relX * scaleX);
            const natY = Math.round(relY * scaleY);
            const natW = Math.round(box.width * scaleX);
            const natH = Math.round(box.height * scaleY);

            const canvas = document.createElement("canvas");
            canvas.width = nw;
            canvas.height = nh;

            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas context unavailable");

            ctx.drawImage(img, 0, 0);

            // Solid black redaction rectangle
            ctx.fillStyle = "#000000";
            ctx.fillRect(
                Math.max(0, natX),
                Math.max(0, natY),
                Math.min(natW, nw - natX),
                Math.min(natH, nh - natY),
            );

            const blob = await new Promise<Blob>((resolve, reject) =>
                canvas.toBlob(
                    (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
                    "image/jpeg",
                    0.92,
                ),
            );

            const maskedFile = new File([blob], rawFile.name, { type: "image/jpeg" });

            // Update preview to display the masked image
            setConfirmed(true);
            setPreviewSrc(URL.createObjectURL(maskedFile));

            await startUpload([maskedFile]);
        } catch (err) {
            console.error(err);
            setError("Failed to process image. Please try again.");
            setStage("preview");
        }
    }, [box, rawFile, startUpload]);

    // ── Dropzone ──────────────────────────────────────────────────────────────
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const f = acceptedFiles[0];
        if (!f) return;
        setRawFile(f);
        setPreviewSrc(URL.createObjectURL(f));
        setConfirmed(false);
        setError(null);
        setStage("preview");
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: generateClientDropzoneAccept(["image/*"]),
        multiple: false,
    });

    const clearSelection = () => {
        if (previewSrc) URL.revokeObjectURL(previewSrc);
        setRawFile(null);
        setPreviewSrc(null);
        setConfirmed(false);
        setError(null);
        setStage("idle");
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="w-full">
            {/* Error banner */}
            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-md border border-error/20 bg-error/10 p-4 text-error">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* ── IDLE: Drop Zone ── */}
            {stage === "idle" && (
                <div
                    {...getRootProps()}
                    className={`relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-300 ${isDragActive
                            ? "border-primary bg-primary/10"
                            : "border-primary/20 bg-primary/5 hover:border-primary/50 hover:bg-primary/10"
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4 p-8 text-center text-primary">
                        <div className="rounded-full bg-white p-4 shadow-soft-sm">
                            <UploadCloud className="h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-lg font-bold">Upload Thai National ID Card</p>
                            <p className="mt-1 text-sm text-muted opacity-80">Drag &amp; drop or click to browse</p>
                        </div>
                        <p className="mt-2 text-xs tracking-wider text-muted opacity-60">
                            PNG, JPG or WEBP · Max 4 MB
                        </p>
                    </div>
                </div>
            )}

            {/* ── PREVIEW / UPLOADING: Masking UI ── */}
            {(stage === "preview" || stage === "uploading") && previewSrc && (
                <div className="space-y-5">
                    {/* Instruction banner */}
                    {!confirmed && stage === "preview" && (
                        <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
                            <Move className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                            <p className="text-sm font-medium text-amber-800">
                                Drag the black box to cover the{" "}
                                <span className="font-bold">Religion</span> field on your ID card,
                                then click{" "}
                                <span className="font-bold">Confirm &amp; Upload</span>.
                            </p>
                        </div>
                    )}

                    {/* Image + draggable blackout box */}
                    <div
                        ref={containerRef}
                        className="relative select-none overflow-hidden rounded-xl border border-border bg-slate-900 shadow-soft-lg"
                        style={{ minHeight: 260 }}
                        onMouseMove={onContainerMouseMove}
                        onMouseUp={stopDrag}
                        onMouseLeave={stopDrag}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            ref={imgRef}
                            src={previewSrc}
                            alt="ID Card Preview"
                            onLoad={initBox}
                            draggable={false}
                            className="block w-full object-contain"
                            style={{ maxHeight: 420 }}
                        />

                        {/* Draggable blackout box — hidden after canvas compositing */}
                        {!confirmed && (
                            <div
                                onMouseDown={onBoxMouseDown}
                                style={{
                                    position: "absolute",
                                    left: box.x,
                                    top: box.y,
                                    width: box.width,
                                    height: box.height,
                                    cursor: dragStart ? "grabbing" : "grab",
                                }}
                                className="flex items-center justify-center rounded border-2 border-white bg-black/60 backdrop-blur-[1px] transition-shadow hover:shadow-[0_0_0_2px_rgba(255,255,255,0.4)]"
                            >
                                <Move className="h-4 w-4 text-white/70" />
                            </div>
                        )}

                        {/* "Religion field masked" badge — appears after upload starts */}
                        {confirmed && (
                            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-green-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Religion field masked
                            </div>
                        )}

                        {/* Uploading overlay */}
                        {stage === "uploading" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm">
                                <Loader2 className="h-9 w-9 animate-spin text-white" />
                                <span className="text-sm font-semibold text-white">
                                    Uploading securely…
                                </span>
                            </div>
                        )}

                        {/* Clear / reset button */}
                        {stage !== "uploading" && (
                            <button
                                onClick={clearSelection}
                                className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-error"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Confirm & Upload CTA */}
                    {stage === "preview" && (
                        <button
                            onClick={handleConfirmAndUpload}
                            className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-4 font-bold text-white shadow-soft-md transition-all hover:bg-primary/90 hover:shadow-lg"
                        >
                            <CheckCircle className="h-5 w-5" />
                            Confirm &amp; Upload
                        </button>
                    )}
                </div>
            )}

            {/* Privacy notice */}
            <div className="mt-8 flex items-start gap-3 rounded-md bg-slate-100 p-4 text-muted">
                <Lock className="h-5 w-5 shrink-0 opacity-70" />
                <div className="space-y-1 text-xs leading-relaxed opacity-80">
                    <p>
                        Your data is encrypted and stored according to PDPA standards.
                        Used only for identity verification — never shared with third parties.
                    </p>
                    <p className="font-semibold text-green-700">
                        ✓ You control which fields are masked. The redacted image is
                        processed on your device — the original never leaves it.
                    </p>
                </div>
            </div>
        </div>
    );
}
