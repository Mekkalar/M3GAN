/**
 * maskImage.ts
 *
 * Story 1.4: Auto-Masking & PII Protection
 *
 * Applies a black bar over the bottom 30% of an ID card image to mask
 * sensitive fields (Religion / Blood Type) before upload in accordance
 * with Thai PDPA data minimisation principles.
 *
 * Processing is 100% client-side — the unmasked original never leaves
 * the user's device.
 */

/** Fraction of the image height that is masked from the bottom (30%). */
export const MASK_RATIO = 0.3;

/**
 * Draws a solid black rectangle over the bottom `MASK_RATIO` of the image
 * and returns a new `File` containing the masked JPEG.
 *
 * @param file   - The original image file selected by the user.
 * @param quality - JPEG output quality (0–1). Defaults to 0.92.
 * @returns A new `File` with the same name, type `image/jpeg`.
 */
export async function maskIdCardImage(
    file: File,
    quality = 0.92,
): Promise<File> {
    // 1. Decode the image into a bitmap.
    const bitmap = await createImageBitmap(file);

    const { width, height } = bitmap;

    // 2. Draw the original image onto a canvas.
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("maskIdCardImage: unable to get 2D canvas context");
    }

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close(); // Free GPU memory.

    // 3. Paint a solid black bar over the bottom MASK_RATIO of the image.
    const maskHeight = Math.round(height * MASK_RATIO);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, height - maskHeight, width, maskHeight);

    // 4. Export as JPEG Blob → File.
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => {
                if (b) {
                    resolve(b);
                } else {
                    reject(new Error("maskIdCardImage: canvas.toBlob returned null"));
                }
            },
            "image/jpeg",
            quality,
        );
    });

    return new File([blob], file.name, { type: "image/jpeg" });
}
