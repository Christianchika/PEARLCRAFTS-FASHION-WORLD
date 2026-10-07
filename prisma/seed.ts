import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const products = [
  {
    id: "royal-pearl-fascinator",
    name: "Royal Pearl Fascinator",
    description:
      "An elegant pearl fascinator designed for weddings, parties and special occasions.",
    price: 180000,
    category: "Fascinators",
    colour: "Ivory",
    stockQuantity: 5,
    imageUrl: "/products/royal-pearl-fascinator.jpg",
    isFeatured: true,
  },
  {
    id: "elegant-bridal-headpiece",
    name: "Elegant Bridal Headpiece",
    description:
      "A beautiful bridal headpiece created to complement your special wedding look.",
    price: 250000,
    category: "Bridal",
    colour: "White",
    stockQuantity: 3,
    imageUrl: "/products/elegant-bridal-headpiece.jpg",
    isFeatured: true,
  },
  {
    id: "classic-black-fascinator",
    name: "Classic Black Fascinator",
    description:
      "A timeless black fascinator suitable for elegant formal occasions.",
    price: 150000,
    category: "Fascinators",
    colour: "Black",
    stockQuantity: 7,
    imageUrl: "/products/classic-black-fascinator.jpg",
    isFeatured: true,
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: {
        id: product.id,
      },
      update: product,
      create: product,
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });