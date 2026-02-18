import { makeUserAdmin } from "~/modules/auth/actions/makeUserAdmin";

/**
 * API route to make a user an admin
 * In production, this should be protected or removed
 * For development/testing only
 */
export async function POST(request: Request) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return Response.json(
                { success: false, error: "Phone number required" },
                { status: 400 }
            );
        }

        const result = await makeUserAdmin(phone);

        return Response.json(result);
    } catch (error) {
        console.error("Make admin API error:", error);
        return Response.json(
            { success: false, error: "Failed to make user admin" },
            { status: 500 }
        );
    }
}
