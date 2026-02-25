import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import ListingWizard from "~/modules/inventory/components/ListingWizard";

export const metadata = {
    title: "List an Item | RENTU",
    description: "Create a new listing on RENTU — the trusted luxury rental marketplace.",
};

export default async function CreateItemPage() {
    const session = await auth();

    if (!session?.user) redirect("/login");

    if (session.user.verificationStatus !== "VERIFIED") {
        redirect("/verify-identity?reason=listing");
    }

    return <ListingWizard />;
}
