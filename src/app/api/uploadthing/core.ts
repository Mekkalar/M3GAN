import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "~/server/auth";

const f = createUploadthing();

/**
 * Uploadthing File Router
 * Defines upload endpoints with access control
 */
export const ourFileRouter = {
    /**
     * Private ID Card Upload
     * - Only authenticated users can upload
     * - Max file size: 4MB (will be compressed client-side to <2MB)
     * - Only images allowed
     * - Private files (not publicly accessible)
     */
    idCardUpload: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async () => {
            // Check authentication
            const session = await auth();

            if (!session?.user) {
                throw new Error("Unauthorized");
            }

            // Check if user is unverified (only unverified users can upload)
            if (session.user.verificationStatus !== "UNVERIFIED") {
                throw new Error("User already has verification status");
            }

            // Pass user ID to onUploadComplete
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("File URL:", file.url);

            // Return data to client
            return { uploadedBy: metadata.userId, fileUrl: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
