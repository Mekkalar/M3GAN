import "next-auth";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            phone: string;
            role: string;
            verificationStatus: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        phone: string;
        role: string;
        verificationStatus: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        phone: string;
        role: string;
        verificationStatus: string;
    }
}
