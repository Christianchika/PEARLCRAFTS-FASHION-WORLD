import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductActions from "@/components/admin/ProductActions";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-600">
            Catalogue Management
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-[#35102f]">
            Products
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Add and manage the products displayed on the
            PEARLCRAFTS FASHION WORLD website.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 font-bold text-white shadow-md transition hover:from-pink-700 hover:to-purple-700"
        >
          + Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white p-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-[#35102f]">
            No products yet
          </h2>

          <p className="mt-3 text-gray-600">
            Add your first product to start building the
            catalogue.
          </p>

          <Link
            href="/admin/products/new"
            className="mt-6 inline-block rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 font-bold text-white"
          >
            Add First Product
          </Link>
        </div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-pink-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#35102f]">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#35102f]">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#35102f]">
                    Price
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#35102f]">
                    Stock
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#35102f]">
                    Featured
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#35102f]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-pink-50/40"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-pink-50">
                          <Image
  src={product.imageUrl}
  alt={product.name}
  fill
  sizes="64px"
  className="object-cover"
/>
                        </div>

                        <div>
                          <p className="font-bold text-[#35102f]">
                            {product.name}
                          </p>

                          {product.colour && (
                            <p className="mt-1 text-xs text-gray-500">
                              {product.colour}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      {product.category}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-purple-700">
                      UGX {product.price.toLocaleString()}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      {product.stockQuantity}
                    </td>

                    <td className="px-6 py-5">
                      {product.isFeatured ? (
                        <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-700">
                          Featured
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          No
                        </span>
                      )}
                    </td>

                  <td className="px-6 py-5 text-right">
  <ProductActions
    productId={product.id}
    productName={product.name}
  />
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
