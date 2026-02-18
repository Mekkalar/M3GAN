
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log("Users found:", JSON.stringify(users, null, 2));
    } catch (error) {
        console.error("Error fetching users:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
