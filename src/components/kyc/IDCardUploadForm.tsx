"use client";

import { useState, useCallback } from "react";
import { useUploadThing } from "~/lib/uploadthing"; // Ensure this internal path is correct, or use @uploadthing/react directly if not wrapped
import { useDropzone } from "@uploadthing/react";
import { UploadCloud, X, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { submitVerification } from "~/modules/kyc/actions/submitVerification";
import { useRouter } from "next/navigation";
import { generateClientDropzoneAccept } from "uploadthing/client";

export default function IDCardUploadForm() {
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const { startUpload, routeConfig } = useUploadThing("idCardUpload", {
        onClientUploadComplete: async (res) => {
            if (!res || res.length === 0) return;

            const uploadedFile = res[0];
            if (!uploadedFile) return;

            try {
                const result = await submitVerification({
                    fileUrl: uploadedFile.url,
                    fileKey: uploadedFile.key,
                });

                if (result.success) {
                    router.push("/verify-identity/pending");
                    router.refresh();
                } else {
                    setError(result.error || "Submission failed");
                    setUploading(false);
                }
            } catch (err) {
                setError("Server communication error");
                setUploading(false);
            }
        },
        onUploadError: (error: Error) => {
            setError(error.message);
            setUploading(false);
        },
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            if (selectedFile) {
                setFile(selectedFile);
                setPreview(URL.createObjectURL(selectedFile));
                setError(null);
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: generateClientDropzoneAccept(["image/*"]),
        multiple: false,
    });

    const handleSubmit = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);

        await startUpload([file]);
    };

    const clearSelection = () => {
        setFile(null);
        setPreview(null);
        setError(null);
    };

    return (
        <div className="w-full">
            {/* Error Message */}
            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-md bg-error/10 p-4 text-error border border-error/20">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {!preview ? (
                // Upload Zone
                <div
                    {...getRootProps()}
                    className={`
                        relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-300
                        ${isDragActive
                            ? "border-primary bg-primary/10"
                            : "border-primary/20 bg-primary/5 hover:border-primary/50 hover:bg-primary/10"
                        }
                    `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4 p-8 text-center text-primary">
                        <div className="rounded-full bg-white p-4 shadow-soft-sm">
                            <UploadCloud className="h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-lg font-bold">Upload Thai National ID Card</p>
                            <p className="mt-1 text-sm text-muted opacity-80">Drag & drop or click to browse</p>
                        </div>
                        <p className="mt-4 text-xs tracking-wider text-muted opacity-60">
                            SVG, PNG, JPG or WEBP (Max 4MB)
                        </p>
                    </div>
                </div>
            ) : (
                // Preview Zone
                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-lg border border-border bg-slate-50 shadow-soft-md">
                        <div className="relative aspect-[16/10] w-full">
                            <Image
                                src={preview}
                                alt="ID Card Preview"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <button
                            onClick={clearSelection}
                            className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-error"
                            disabled={uploading}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-4 font-bold text-white shadow-soft-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-5 w-5" />
                                Submit for Verification
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Privacy Notice */}
            <div className="mt-8 flex items-start gap-3 rounded-md bg-slate-100 p-4 text-muted">
                <Lock className="h-5 w-5 shrink-0 opacity-70" />
                <p className="text-xs leading-relaxed opacity-80">
                    Your data is securely stored and encrypted according to PDPA standards.
                    This document is only used for identity verification purposes and will not be shared with third parties.
                </p>
            </div>
        </div>
    );
}
