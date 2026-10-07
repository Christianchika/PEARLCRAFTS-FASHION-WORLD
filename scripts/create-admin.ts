import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_INITIAL_PASSWORD is not set.");
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  const name = "PEARLCRAFTS Administrator";
  const email = "admin@pearlcrafts-fashion-world.com";

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.adminUser.upsert({
      where: {
        email,
      },

      update: {
        name,
        passwordHash,
      },

      create: {
        name,
        email,
        passwordHash,
      },
    });

    console.log("");
    console.log("========================================");
    console.log(" ADMIN ACCOUNT READY");
    console.log("========================================");
    console.log(`Email: ${email}`);
    console.log("Password: [the password you supplied]");
    console.log("========================================");
    console.log("");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("");
  console.error("Failed to create admin account:");
  console.error(error);
  process.exit(1);
});
