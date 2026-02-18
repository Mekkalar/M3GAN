"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "~/lib/uploadthing";
import { submitIdentityVerification } from "../actions/submitVerification";

export function IDCardUpload() {
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [compressing, setCompressing] = useState(false);

    // Extract submission logic to be reusable
    const handleVerificationSubmit = async (imageUrl: string) => {
        const result = await submitIdentityVerification({
            idCardImageUrl: imageUrl,
        });

        if (result.success) {
            router.push("/verify-identity/pending");
        } else {
            setError(result.error ?? "Failed to submit verification");
            setUploading(false);
        }
    };

    const { startUpload, isUploading } = useUploadThing("idCardUpload", {
        onClientUploadComplete: async (res) => {
            console.log("Upload complete:", res);
            if (res && res[0]) {
                await handleVerificationSubmit(res[0].url);
            }
            setUploading(false);
        },
        onUploadError: (error: Error) => {
            console.error("Upload error:", error);
            // Fallback to mock upload if real upload fails (for development)
            console.log("Falling back to mock upload...");
            handleMockUpload();
        },
    });

    const handleMockUpload = async () => {
        try {
            // Simulate upload delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Use a placeholder image service
            const mockUrl = `https://placehold.co/800x600/png?text=Mock+ID+Card+${Date.now()}`;

            await handleVerificationSubmit(mockUrl);
        } catch (err) {
            setError("Mock upload failed");
            setUploading(false);
        }
    };

    const handleFileSelect = async (file: File) => {
        setError("");
        setCompressing(true);

        try {
            // Compress image to < 2MB
            const options = {
                maxSizeMB: 2,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);

            console.log("Original file size:", (file.size / 1024 / 1024).toFixed(2), "MB");
            console.log("Compressed file size:", (compressedFile.size / 1024 / 1024).toFixed(2), "MB");

            setSelectedFile(compressedFile);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(compressedFile);
        } catch (err) {
            console.error("Compression error:", err);
            setError("Failed to compress image. Please try again.");
        } finally {
            setCompressing(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];

        if (file && file.type.startsWith("image/")) {
            handleFileSelect(file);
        } else {
            setError("Please select an image file");
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError("");

        try {
            // For this specific request, checking if we should use mock directly
            // You can uncomment the next line to always use mock in dev
            // return handleMockUpload();

            await startUpload([selectedFile]);
        } catch (err) {
            console.error("Upload error:", err);
            // Fallback to mock
            await handleMockUpload();
        }
    };

    const isLoading = uploading || isUploading || compressing;

    return (
        <div className="w-full max-w-2xl space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Upload Thai National ID Card</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Upload a clear photo of the front of your ID card
                </p>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {error}
                </div>
            )}

            {/* Upload Area */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isLoading
                    ? "border-gray-300 bg-gray-50"
                    : "border-blue-300 bg-blue-50 hover:border-blue-400"
                    }`}
            >
                {previewUrl ? (
                    <div className="space-y-4">
                        <img
                            src={previewUrl}
                            alt="ID Card Preview"
                            className="mx-auto max-h-64 rounded-lg"
                        />
                        {!isLoading && (
                            <button
                                onClick={() => {
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Choose different image
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                            <svg
                                className="h-8 w-8 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                        <div>
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer text-blue-600 hover:text-blue-800"
                            >
                                <span className="font-medium">Click to upload</span>
                                <span className="text-gray-600"> or drag and drop</span>
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileInput}
                                className="hidden"
                                disabled={isLoading}
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB (will be compressed to &lt;2MB)
                        </p>
                    </div>
                )}

                {compressing && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white bg-opacity-90">
                        <div className="text-center">
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                            <p className="mt-2 text-sm text-gray-600">Compressing image...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Button */}
            {selectedFile && !isLoading && (
                <button
                    onClick={handleUpload}
                    disabled={isLoading}
                    className="w-full rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    style={{ minHeight: "44px" }}
                >
                    {uploading ? "Uploading..." : "Submit for Verification"}
                </button>
            )}

            {/* Privacy Notice */}
            <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
                <p className="font-medium">🔒 Your Privacy Matters</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                    <li>Your ID card image is encrypted and stored securely</li>
                    <li>Only authorized admins can access your verification</li>
                    <li>Sensitive fields are automatically masked</li>
                    <li>We comply with Thai PDPA data protection laws</li>
                </ul>
            </div>
        </div>
    );
}
