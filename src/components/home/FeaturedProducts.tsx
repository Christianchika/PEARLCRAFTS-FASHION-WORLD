import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  return (
    <section className="bg-[#fff8fc] px-6 py-20">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-pink-600">
            Featured Products
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#35102f] sm:text-4xl">
            Our Featured Pieces
          </h2>

          <p className="mt-4 text-lg leading-8 text-gray-600">
            Discover some of our beautiful and carefully crafted pieces,
            selected to help you create an unforgettable look.
          </p>
        </div>

        {/* Products */}
        {products.length === 0 ? (
          <div className="mt-12 rounded-3xl bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-[#35102f]">
              Featured products coming soon
            </h3>

            <p className="mt-3 text-gray-600">
              We are preparing beautiful pieces for our featured collection.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 font-bold text-white transition hover:from-pink-700 hover:to-purple-700"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Product Image */}
                <Link
                  href={`/products/${product.id}`}
                  className="block"
                >
                  <div className="relative aspect-square overflow-hidden bg-pink-50">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-500 hover:scale-105"
                    />

                    <span className="absolute left-4 top-4 rounded-full bg-pink-600 px-3 py-1.5 text-xs font-bold text-white shadow">
                      Featured
                    </span>
                  </div>
                </Link>

                {/* Product Information */}
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">
                    {product.category}
                  </p>

                  <Link href={`/products/${product.id}`}>
                    <h3 className="mt-2 text-xl font-extrabold text-[#35102f] transition hover:text-pink-600">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
                    {product.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="text-xl font-extrabold text-pink-600">
                      UGX {product.price.toLocaleString()}
                    </p>

                    <span
                      className={`text-xs font-bold ${
                        product.stockQuantity > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {product.stockQuantity > 0
                        ? "Available"
                        : "Out of stock"}
                    </span>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 rounded-full border-2 border-purple-600 px-4 py-3 text-center text-sm font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
                    >
                      View Details
                    </Link>

                    {product.stockQuantity > 0 && (
                      <Link
                        href={`/order?product=${product.id}`}
                        className="flex-1 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:from-pink-700 hover:to-purple-700"
                      >
                        Order
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* View All */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex rounded-full border-2 border-purple-600 px-8 py-3 font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
          >
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}