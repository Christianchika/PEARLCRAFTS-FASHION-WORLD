
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const inStock = product.stockQuantity > 0;

  return (
    <article className="group overflow-hidden rounded-3xl border border-pink-100/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/products/${product.id}`}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-[#fff8fc] to-[#f8f5f1]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4 transition duration-500 group-hover:scale-105 sm:p-6"
          />

          {product.isFeatured && (
            <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-md">
              Featured
            </span>
          )}

          <span
            className={`absolute bottom-4 right-4 rounded-full px-3 py-1.5 text-xs font-semibold ${
              inStock
                ? "bg-white/95 text-green-700"
                : "bg-white/95 text-red-600"
            }`}
          >
            {inStock ? "Available" : "Sold Out"}
          </span>
        </div>
      </Link>

      <div className="p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">
          {product.category}
        </p>

        <Link href={`/products/${product.id}`}>
          <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-7 text-[#35102f] transition group-hover:text-pink-600 sm:text-xl">
            {product.name}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-gray-600">
          {product.description}
        </p>

        <div className="mt-5 border-t border-pink-100 pt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Price
          </p>

          <p className="mt-1 text-xl font-extrabold text-[#35102f]">
            UGX {product.price.toLocaleString("en-UG")}
          </p>
        </div>

        <div className="mt-5">
          {inStock ? (
            <Link
              href={`/order?product=${encodeURIComponent(product.id)}`}
              className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-3.5 text-center text-sm font-bold text-white shadow-sm transition hover:from-pink-700 hover:to-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
            >
              Order This Piece
            </Link>
          ) : (
            <Link
              href={`/products/${product.id}`}
              className="flex w-full items-center justify-center rounded-full border border-purple-200 px-5 py-3.5 text-center text-sm font-bold text-purple-700 transition hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
            >
              View Product Details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
