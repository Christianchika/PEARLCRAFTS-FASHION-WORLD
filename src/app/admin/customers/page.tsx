import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where: query
        ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" } },
              { phone: { contains: query } },
              { email: { contains: query, mode: "insensitive" } },
              { location: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { fullName: "asc" },
      include: { _count: { select: { orders: true } } },
    }),
    prisma.customer.count(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-pink-600"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <div className="rounded-2xl bg-fuchsia-100 p-3 text-fuchsia-600">
          <Users size={23} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#35102f]">
            Customers
          </h1>
          <p className="text-sm text-gray-500">
            {query
              ? `${customers.length} match${customers.length === 1 ? "" : "es"} of ${total} total`
              : `${total} total`}
          </p>
        </div>
      </div>

      <form method="GET" className="mt-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search name, phone, email or location"
          className="w-full max-w-md rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm shadow-sm outline-none focus:border-purple-400"
        />
        <button
          type="submit"
          className="rounded-full bg-purple-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-pink-600"
        >
          Search
        </button>
        {query && (
          <Link
            href="/admin/customers"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 shadow-sm hover:text-pink-600"
          >
            Clear
          </Link>
        )}
      </form>

      <section className="mt-6 overflow-x-auto rounded-3xl bg-white shadow-sm">
        {customers.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">
            No customers found.
          </p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-5 py-4 font-bold text-[#35102f]">
                    {customer.fullName}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {customer.phone}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {customer.email ?? (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {customer.location}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href="/admin/orders"
                      className="font-semibold text-purple-700 hover:text-pink-600"
                    >
                      {customer._count.orders}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
