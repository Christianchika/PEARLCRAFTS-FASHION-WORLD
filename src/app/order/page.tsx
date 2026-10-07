import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import OrderForm from "@/components/orders/OrderForm";

type OrderPageProps = {
  searchParams: Promise<{
    product?: string;
  }>;
};

export default async function OrderPage({
  searchParams,
}: OrderPageProps) {
  const params = await searchParams;
  const productId = params.product;

  /*
   * If a product ID was supplied, get that product
   * directly from PostgreSQL.
   */
  const selectedProduct = productId
    ? await prisma.product.findUnique({
        where: {
          id: productId,
        },
      })
    : undefined;

  /*
   * If no product was selected, show all products
   * from PostgreSQL.
   */
  if (!selectedProduct) {
    const products = await prisma.product.findMany({
      where: {
        stockQuantity: {
          gt: 0,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return (
      <main className="min-h-screen bg-[#fff8fc] px-6 py-16">
        <div className="mx-auto max-w-7xl">

          {/* Back to Home */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border-2 border-purple-600 px-5 py-2.5 text-sm font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-[#35102f] md:text-5xl">
              Choose Your Product
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#5f4960]">
              Select a beautiful PEARLCRAFTS FASHION WORLD design
              to continue with your order.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-lg">
              <h2 className="text-2xl font-bold text-[#35102f]">
                No products are currently available
              </h2>

              <p className="mt-3 text-[#5f4960]">
                Please check back soon or contact us for a custom order.
              </p>

              <Link
                href="/custom-order"
                className="mt-6 inline-flex rounded-full bg-gradient-to-r from-[#ec1976] to-[#7c3aed] px-7 py-3 font-bold text-white"
              >
                Request a Custom Order
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-[#ead7e6]"
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="block"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#fff0f7]">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="p-6">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#ec1976]">
                      {product.category}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-[#35102f]">
                      {product.name}
                    </h2>

                    <p className="mt-3 text-[#5f4960]">
                      {product.description}
                    </p>

                    <p className="mt-4 text-xl font-bold text-[#7c3aed]">
                      UGX {product.price.toLocaleString()}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-green-600">
                      {product.stockQuantity} available
                    </p>

                    <Link
                      href={`/order?product=${product.id}`}
                      className="mt-6 block rounded-full bg-gradient-to-r from-[#ec1976] to-[#7c3aed] px-6 py-3 text-center font-bold text-white transition hover:scale-[1.02]"
                    >
                      Order This Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-[#5f4960]">
              Looking for something specially designed for you?
            </p>

            <Link
              href="/custom-order"
              className="mt-3 inline-block font-bold text-[#ec1976] hover:text-[#7c3aed]"
            >
              Request a Custom Order →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * A product was selected.
   * Make sure the customer cannot order an out-of-stock product.
   */
  if (selectedProduct.stockQuantity <= 0) {
    return (
      <main className="min-h-screen bg-[#fff8fc] px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">

          <Link
            href="/products"
            className="inline-flex rounded-full border-2 border-purple-600 px-6 py-3 font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
          >
            ← Back to Collections
          </Link>

          <div className="mt-10 rounded-3xl bg-white p-10 shadow-lg">
            <h1 className="text-3xl font-bold text-[#35102f]">
              Product Currently Out of Stock
            </h1>

            <p className="mt-4 text-[#5f4960]">
              Sorry, <strong>{selectedProduct.name}</strong> is
              currently unavailable.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex rounded-full bg-gradient-to-r from-[#ec1976] to-[#7c3aed] px-7 py-3 font-bold text-white"
            >
              View Other Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Product was selected and is available.
   */
  return (
    <main className="min-h-screen bg-[#fff8fc] px-6 py-12">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full border-2 border-purple-600 px-5 py-2.5 text-sm font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
          >
            ← Home
          </Link>

          <Link
            href="/products"
            className="inline-flex rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-pink-700 hover:to-purple-700"
          >
            ← Collections
          </Link>
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-[#35102f] md:text-5xl">
            Place Your Order
          </h1>

          <p className="mt-4 text-lg text-[#5f4960]">
            Complete the form below and we will contact you to
            confirm your order.
          </p>
        </div>

        <OrderForm
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          productPrice={selectedProduct.price}
          stockQuantity={selectedProduct.stockQuantity}
       />
      </div>
    </main>
  );
}