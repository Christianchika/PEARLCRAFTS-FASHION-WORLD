import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUSES = [
  "PENDING",
  "REVIEWED",
  "QUOTED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

type Status = (typeof STATUSES)[number];

const badgeStyles: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  QUOTED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-fuchsia-100 text-fuchsia-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-200 text-gray-600",
};

function label(status: string) {
  return status.replace("_", " ");
}

export default async function AdminCustomOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const activeStatus = STATUSES.includes(status as Status)
    ? (status as Status)
    : undefined;

  const [orders, total] = await Promise.all([
    prisma.customOrder.findMany({
      where: activeStatus ? { status: activeStatus } : undefined,
      orderBy: { createdAt: "desc" },
      include: { attachments: true },
    }),
    prisma.customOrder.count(),
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
        <div className="rounded-2xl bg-pink-100 p-3 text-pink-600">
          <Sparkles size={23} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#35102f]">
            Custom Design Requests
          </h1>
          <p className="text-sm text-gray-500">
            {activeStatus
              ? `${orders.length} ${label(activeStatus).toLowerCase()} of ${total} total`
              : `${total} total`}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/custom-orders"
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            !activeStatus
              ? "bg-purple-700 text-white"
              : "bg-white text-gray-600 shadow-sm hover:text-pink-600"
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/custom-orders?status=${s}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              activeStatus === s
                ? "bg-purple-700 text-white"
                : "bg-white text-gray-600 shadow-sm hover:text-pink-600"
            }`}
          >
            {label(s)}
          </Link>
        ))}
      </div>

      <section className="mt-6 overflow-x-auto rounded-3xl bg-white shadow-sm">
        {orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">
            No custom design requests found.
          </p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Item</th>
                <th className="px-5 py-4">Details</th>
                <th className="px-5 py-4">Qty</th>
                <th className="px-5 py-4">Files</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#35102f]">
                      {order.fullName}
                    </p>
                    <p className="text-gray-500">{order.phone}</p>
                    {order.email && (
                      <p className="text-gray-500">{order.email}</p>
                    )}
                    <p className="text-gray-400">{order.location}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">
                      {order.itemType}
                    </p>
                    {order.occasion && (
                      <p className="text-gray-500">{order.occasion}</p>
                    )}
                    {order.preferredColour && (
                      <p className="text-gray-500">
                        {order.preferredColour}
                      </p>
                    )}
                  </td>
                  <td className="max-w-xs px-5 py-4 text-gray-600">
                    <p className="line-clamp-3">{order.description}</p>
                    {order.deliveryMethod && (
                      <p className="mt-1 text-xs text-gray-400">
                        Delivery: {order.deliveryMethod}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">{order.quantity}</td>
                  <td className="px-5 py-4">
                    {order.attachments.length === 0 ? (
                      <span className="text-gray-400">None</span>
                    ) : (
                      <ul className="space-y-1">
                        {order.attachments.map((file) => (
                          <li key={file.id}>
                            <a
                              href={`/api/admin/custom-orders/attachments/${file.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-purple-700 hover:text-pink-600"
                            >
                              {file.fileName}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        badgeStyles[order.status as Status]
                      }`}
                    >
                      {label(order.status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                    {order.createdAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}

                    <Link
                      href={`/admin/custom-orders/${order.id}`}
                      className="mt-3 inline-flex rounded-lg bg-purple-700 px-3 py-2 text-xs font-bold text-white hover:bg-pink-600"
                    >
                      View Request
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
