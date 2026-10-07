export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  colour?: string;
  stockQuantity: number;
  imageUrl: string;
  isFeatured: boolean;
};