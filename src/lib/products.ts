import { Product } from "@/types/product";

export const products: Product[] = [
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