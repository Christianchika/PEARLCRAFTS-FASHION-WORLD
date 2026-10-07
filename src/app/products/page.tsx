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
  "Bridal",
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
      <section className="bg-gradient-to-br from-pink-600 via-fuchsia-600 to-purple-700 px-6 py-16 text-white">
  <div className="mx-auto max-w-7xl">

    {/* Back to Home */}
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-purple-700"
    >
      ← Back to Home
    </Link>

    <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-pink-100">
      PEARLCRAFTS FASHION WORLD
    </p>

    <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">
      Our Collection
    </h1>

    <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">
      Discover beautifully crafted fascinators, bridal headpieces
      and hair accessories made for your special moments.
    </p>
  </div>
</section>

      {/* Category filters */}
      <section className="border-b border-pink-100 bg-white px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          {categories.map((category) => {
            const active =
              category === selectedCategory;

            const href =
              category === "All"
                ? "/products"
                : `/products?category=${encodeURIComponent(category)}`;

            return (
              <Link
                key={category}
                href={href}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  active
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md"
                    : "border-2 border-pink-100 bg-white text-purple-700 hover:border-pink-300 hover:bg-pink-50"
                }`}
              >
                {category}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-600">
              {selectedCategory === "All"
                ? "All Products"
                : selectedCategory}
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-[#35102f]">
              Find Your Perfect Piece
            </h2>
          </div>

          <p className="text-sm font-semibold text-gray-500">
            {products.length}{" "}
            {products.length === 1
              ? "product"
              : "products"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-white p-12 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-[#35102f]">
              No products found
            </h3>

            <p className="mt-3 text-gray-600">
              We don't currently have products in the{" "}
              <strong>{selectedCategory}</strong> category.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 font-bold text-white"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
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

                    {product.isFeatured && (
                      <span className="absolute left-4 top-4 rounded-full bg-pink-600 px-3 py-1.5 text-xs font-bold text-white shadow">
                        Featured
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">
                    {product.category}
                  </p>

                  <Link
                    href={`/products/${product.id}`}
                  >
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
                        ? `${product.stockQuantity} available`
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
      </section>

      <div className="mt-14 flex justify-center">
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
