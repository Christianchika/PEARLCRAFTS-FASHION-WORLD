
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
    <section className="bg-[#fff8fc] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-pink-600 sm:text-sm">
            Carefully Selected for You
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#35102f] sm:text-4xl lg:text-5xl">
            Our Featured Pieces
          </h2>

          <p className="mt-4 text-base leading-8 text-gray-600 sm:text-lg">
            Discover beautiful fascinators, elegant headwear and
            distinctive accessories crafted to help you create an
            unforgettable look for every special occasion.
          </p>
        </div>

        {/* Products */}
        {products.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-sm sm:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-pink-600">
              PearlCrafts Fashion World
            </p>

            <h3 className="mt-3 text-xl font-bold text-[#35102f]">
              Featured products coming soon
            </h3>

            <p className="mt-3 text-gray-600">
              We are preparing beautiful pieces for our featured collection.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 font-bold text-white transition hover:from-pink-700 hover:to-purple-700"
            >
              Explore Our Collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
            {products.map((product) => {
              const inStock = product.stockQuantity > 0;

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-3xl border border-pink-100/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Product Image */}
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

                      <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                        Featured
                      </span>

                      <span
                        className={`absolute bottom-4 right-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold shadow-sm ${
                          inStock
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {inStock ? "Available" : "Sold Out"}
                      </span>
                    </div>
                  </Link>

                  {/* Product Information */}
                  <div className="flex flex-col p-5 sm:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">
                      {product.category}
                    </p>

                    <Link href={`/products/${product.id}`}>
                      <h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-7 text-[#35102f] transition group-hover:text-pink-600 sm:text-xl">
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

                    {/* Actions */}
                    <div className="mt-5 flex gap-3">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex-1 rounded-full border border-purple-200 px-3 py-3 text-center text-sm font-bold text-purple-700 transition hover:border-purple-600 hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
                      >
                        View Details
                      </Link>

                      {inStock ? (
                        <Link
                          href={`/order?product=${encodeURIComponent(product.id)}`}
                          className="flex-1 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-3 py-3 text-center text-sm font-bold text-white transition hover:from-pink-700 hover:to-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
                        >
                          Order Now
                        </Link>
                      ) : (
                        <span className="flex-1 rounded-full bg-gray-100 px-3 py-3 text-center text-sm font-semibold text-gray-400">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* View All Products */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center rounded-full border-2 border-purple-600 px-8 py-3 font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
          >
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
