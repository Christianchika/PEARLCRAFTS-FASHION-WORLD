import Link from "next/link";

import {
  ShoppingBag,
  Package,
  Clock3,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [
    productCount,
    orderCount,
    pendingOrderCount,
    customerCount,
    recentOrders,
    recentProducts,
    customOrderCount,
    pendingCustomOrderCount,
  ] = await Promise.all([
    prisma.product.count(),

    prisma.order.count(),

    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.customer.count(),

    prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    }),

    prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.customOrder.count(),

    prisma.customOrder.count({
      where: {
        status: "PENDING",
      },
    }),

  ]);
  const formatCurrency = (amount: number) =>
    `UGX ${amount.toLocaleString()}`;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      {/* Welcome */}
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-600">
          Business Management
        </p>

        <h1 className="mt-2 text-3xl font-extrabold text-[#35102f] sm:text-4xl">
          Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-gray-600">
          Manage your PEARLCRAFTS products, orders, customers
          and media from one place.
        </p>
      </section>

      {/* Statistics */}
      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {/* Products */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Products
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#35102f]">
                {productCount}
              </p>
            </div>

            <div className="rounded-2xl bg-pink-100 p-3 text-pink-600">
              <ShoppingBag size={23} />
            </div>
          </div>

          <Link
            href="/admin/products"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-pink-600"
          >
            Manage Products
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Orders */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Total Orders
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#35102f]">
                {orderCount}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-100 p-3 text-purple-600">
              <Package size={23} />
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-pink-600"
          >
            Manage Orders
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Pending */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Pending Orders
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#35102f]">
                {pendingOrderCount}
              </p>
            </div>

            <div className="rounded-2xl bg-yellow-100 p-3 text-yellow-600">
              <Clock3 size={23} />
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-pink-600"
          >
            Review Orders
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Customers */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Customers
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#35102f]">
                {customerCount}
              </p>
            </div>

            <div className="rounded-2xl bg-fuchsia-100 p-3 text-fuchsia-600">
              <Users size={23} />
            </div>
          </div>

          <Link
            href="/admin/customers"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-pink-600"
          >
            View Customers
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Custom Design Requests */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Custom Design Requests
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#35102f]">
                {customOrderCount}
              </p>
            </div>

            <div className="rounded-2xl bg-pink-100 p-3 text-pink-600">
              <Sparkles size={23} />
            </div>
          </div>

          <Link
            href="/admin/custom-orders"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-pink-600"
          >
            View Requests
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Pending Custom Requests */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Pending Custom Requests
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#35102f]">
                {pendingCustomOrderCount}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
              <Clock3 size={23} />
            </div>
          </div>

          <Link
            href="/admin/custom-orders"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-pink-600"
          >
            Review Pending
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-8 rounded-3xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-extrabold">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-white/85">
              Quickly manage your PEARLCRAFTS catalogue and
              customer orders.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-purple-700 transition hover:bg-pink-50"
            >
              <Plus size={18} />
              Add Product
            </Link>

            <Link
              href="/admin/orders"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              <Package size={18} />
              View Orders
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <section className="mt-8 rounded-3xl bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#35102f]">
              Recent Orders
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your latest customer orders.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="font-bold text-purple-700 hover:text-pink-600"
          >
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-pink-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#35102f]">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#35102f]">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#35102f]">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#35102f]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-5">
                      <p className="font-bold text-[#35102f]">
                        {order.customer.fullName}
                      </p>

                      <p className="text-xs text-gray-500">
                        {order.customer.phone}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      {order.items[0]?.product.name ??
                        "Product"}
                      {order.items.length > 1 &&
                        ` +${order.items.length - 1}`}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-purple-700">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Products */}
      <section className="mt-8 rounded-3xl bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#35102f]">
              Recent Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Products recently added to your catalogue.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="font-bold text-purple-700 hover:text-pink-600"
          >
            View All →
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No products yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-purple-50">
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

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#35102f]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-5 font-bold text-[#35102f]">
                      {product.name}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      {product.category}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-purple-700">
                      {formatCurrency(product.price)}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      {product.stockQuantity}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="font-bold text-pink-600 hover:text-purple-700"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}