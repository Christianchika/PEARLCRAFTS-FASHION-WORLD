import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-80 bg-gray-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {product.category}
        </p>

        <h3 className="mt-2 text-xl font-bold">
          {product.name}
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold">
            UGX {product.price.toLocaleString()}
          </p>

          <span className="text-sm text-gray-500">
            {product.stockQuantity} available
          </span>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="mt-5 block w-full rounded-full bg-black px-6 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
        >
          View Product
        </Link>
      </div>
    </article>
  );
}