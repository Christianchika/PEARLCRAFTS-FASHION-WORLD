import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type ProductDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fff8fc]">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center gap-3">
  <Link
    href="/"
    className="inline-flex items-center rounded-full border-2 border-purple-600 px-5 py-2.5 text-sm font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
  >
    ← Home
  </Link>

  <Link
    href="/products"
    className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-pink-700 hover:to-purple-700"
  >
    ← Collections
  </Link>
</div>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-pink-50 shadow-lg">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center">
            {product.isFeatured && (
              <span className="w-fit rounded-full bg-pink-100 px-4 py-2 text-sm font-bold text-pink-700">
                Featured
              </span>
            )}

            <p className="mt-5 text-sm font-bold uppercase tracking-[0.25em] text-purple-600">
              {product.category}
            </p>

            <h1 className="mt-3 text-4xl font-extrabold text-[#35102f]">
              {product.name}
            </h1>

            <p className="mt-6 text-3xl font-extrabold text-pink-600">
              UGX {product.price.toLocaleString()}
            </p>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              {product.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {product.colour && (
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-gray-500">
                    Colour
                  </p>
                  <p className="mt-1 font-bold text-[#35102f]">
                    {product.colour}
                  </p>
                </div>
              )}

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-gray-500">
                  Availability
                </p>

                <p className="mt-1 font-bold text-[#35102f]">
                  {product.stockQuantity > 0
                    ? `${product.stockQuantity} available`
                    : "Out of stock"}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              {product.stockQuantity > 0 ? (
                <Link
                  href={`/order?product=${product.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-4 font-bold text-white shadow-lg transition hover:from-pink-700 hover:to-purple-700"
                >
                  Order This Product
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center rounded-full bg-gray-200 px-8 py-4 font-bold text-gray-500">
                  Out of Stock
                </span>
              )}

              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full border-2 border-purple-600 px-8 py-4 font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
              >
                View More Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}