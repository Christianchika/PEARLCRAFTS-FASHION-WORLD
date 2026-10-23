
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

const categories = [
  "All",
  "Fascinators",
  "Boater Hats",
  "Auto Gele",
  "Hair Accessories",
];

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const selectedCategory = params.category?.trim() || "All";

  const products = await prisma.product.findMany({
    where:
      selectedCategory === "All"
        ? undefined
        : {
            category: selectedCategory,
          },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#fff8fc]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-600 via-fuchsia-600 to-purple-700 px-5 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-bold backdrop-blur-sm transition hover:bg-white hover:text-purple-700"
          >
            ← Back to Home
          </Link>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-pink-100 sm:text-sm">
            PEARLCRAFTS FASHION WORLD
          </p>

          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            Our Collection
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-white/90 sm:text-lg">
            Discover beautifully crafted fascinators, elegant boater
            hats, auto gele and exquisite hair accessories designed
            to make your special moments unforgettable.
          </p>
        </div>
      </section>

      {/* Category filters */}
      <section className="sticky top-0 z-20 border-b border-pink-100 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2.5">
          {categories.map((category) => {
            const active = category === selectedCategory;

            const href =
              category === "All"
                ? "/products"
                : `/products?category=${encodeURIComponent(category)}`;

            return (
              <Link
                key={category}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2.5 text-sm font-bold transition sm:px-5 ${
                  active
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md"
                    : "border border-pink-100 bg-white text-purple-700 hover:border-pink-300 hover:bg-pink-50"
                }`}
              >
                {category}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Product catalogue */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-600 sm:text-sm">
              {selectedCategory === "All"
                ? "All Products"
                : selectedCategory}
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-[#35102f] sm:text-3xl">
              Find Your Perfect Piece
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
              Explore statement headwear and accessories for weddings,
              celebrations and other memorable occasions.
            </p>
          </div>

          <p className="text-sm font-semibold text-gray-500">
            {products.length}{" "}
            {products.length === 1 ? "product" : "products"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-sm sm:p-12">
            <p className="text-sm font-bold uppercase tracking-widest text-pink-600">
              PearlCrafts Fashion World
            </p>

            <h3 className="mt-3 text-2xl font-bold text-[#35102f]">
              No products found
            </h3>

            <p className="mt-3 text-gray-600">
              We don&apos;t currently have products in the{" "}
              <strong>{selectedCategory}</strong> category.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 font-bold text-white transition hover:from-pink-700 hover:to-purple-700"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 xl:gap-8">
            {products.map((product) => {
              const inStock = product.stockQuantity > 0;

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-3xl border border-pink-100/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
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

                  <div className="flex h-full flex-col p-5 sm:p-6">
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
      </section>

      {/* Return home */}
      <div className="px-4 pb-12 text-center sm:pb-16">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border-2 border-purple-600 px-8 py-3 font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
