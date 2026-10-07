"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
};

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: Product;
};

type Customer = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  location: string;
};

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

type Order = {
  id: string;
  deliveryMethod: string;
  notes: string | null;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
};

const statusOptions: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
    null
  );

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/orders", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load orders."
        );
      }

      setOrders(data);
    } catch (loadError) {
      console.error(
        "Failed to load orders:",
        loadError
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ) {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      const response = await fetch(
        "/api/admin/orders/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update order status."
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: data.order.status,
              }
            : order
        )
      );
    } catch (updateError) {
      console.error(
        "Failed to update order status:",
        updateError
      );

      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update order status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const confirmedOrders = orders.filter(
    (order) => order.status === "CONFIRMED"
  ).length;

  const processingOrders = orders.filter(
    (order) => order.status === "PROCESSING"
  ).length;

  const readyOrders = orders.filter(
    (order) => order.status === "READY"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED"
  ).length;

  const totalSales = orders
    .filter(
      (order) => order.status !== "CANCELLED"
    )
    .reduce(
      (total, order) =>
        total + order.totalAmount,
      0
    );

  function formatDate(date: string) {
    return new Date(date).toLocaleString(
      "en-UG",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  function getStatusClasses(
    status: OrderStatus
  ) {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";

      case "PROCESSING":
        return "bg-purple-100 text-purple-800";

      case "READY":
        return "bg-indigo-100 text-indigo-800";

      case "COMPLETED":
        return "bg-green-100 text-green-800";

      case "CANCELLED":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <main className="min-h-screen bg-[#fff8fc]">
      {/* HEADER */}
      <header className="border-b border-pink-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-pink-600">
              PEARLCRAFTS
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-[#35102f]">
              Admin Orders
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-full border-2 border-purple-600 px-5 py-2.5 text-sm font-semibold text-purple-600 transition hover:bg-purple-600 hover:text-white"
          >
            View Website
          </Link>
        </div>
      </header>

      {/* DASHBOARD */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* HERO */}
        <div className="rounded-3xl bg-gradient-to-r from-pink-600 via-fuchsia-500 to-purple-600 p-8 text-white shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-100">
            PEARLCRAFTS FASHION WORLD
          </p>

          <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
            Orders Dashboard
          </h2>

          <p className="mt-3 max-w-2xl text-white/90">
            Manage customer orders, update order
            status and monitor your business sales
            from one place.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Orders"
            value={orders.length}
          />

          <StatCard
            title="Pending"
            value={pendingOrders}
          />

          <StatCard
            title="Confirmed"
            value={confirmedOrders}
          />

          <StatCard
            title="Processing"
            value={processingOrders}
          />

          <StatCard
            title="Ready"
            value={readyOrders}
          />

          <StatCard
            title="Completed"
            value={completedOrders}
          />

          <StatCard
            title="Cancelled"
            value={cancelledOrders}
          />
        </div>

        {/* SALES */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">
            Sales Value
          </p>

          <p className="mt-2 text-3xl font-extrabold text-purple-700">
            UGX {totalSales.toLocaleString()}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Excludes cancelled orders
          </p>
        </div>

        {/* ORDERS */}
        <div className="mt-8 rounded-3xl bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#35102f]">
                Customer Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Orders submitted through the
                website.
              </p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white transition hover:from-pink-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Refreshing..."
                : "Refresh Orders"}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="m-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading && orders.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              Loading orders...
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            orders.length === 0 && (
              <div className="p-12 text-center">
                <div className="text-4xl">
                  📦
                </div>

                <h3 className="mt-4 text-xl font-bold text-[#35102f]">
                  No orders yet
                </h3>

                <p className="mt-2 text-gray-500">
                  Customer orders will appear
                  here.
                </p>
              </div>
            )}

          {/* TABLE */}
          {orders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4">
                      Order
                    </th>

                    <th className="px-6 py-4">
                      Customer
                    </th>

                    <th className="px-6 py-4">
                      Product
                    </th>

                    <th className="px-6 py-4">
                      Total
                    </th>

                    <th className="px-6 py-4">
                      Delivery
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-pink-50/40"
                    >
                      {/* ORDER */}
                      <td className="px-6 py-5 align-top">
                        <p className="font-bold text-[#35102f]">
                          #
                          {order.id
                            .slice(-8)
                            .toUpperCase()}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {order.items.length}{" "}
                          item
                          {order.items.length !==
                          1
                            ? "s"
                            : ""}
                        </p>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-6 py-5 align-top">
                        <p className="font-semibold text-gray-800">
                          {
                            order.customer
                              .fullName
                          }
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {
                            order.customer
                              .phone
                          }
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {
                            order.customer
                              .location
                          }
                        </p>

                        {order.customer
                          .email && (
                          <p className="mt-1 text-xs text-gray-400">
                            {
                              order.customer
                                .email
                            }
                          </p>
                        )}
                      </td>

                      {/* PRODUCT */}
                      <td className="px-6 py-5 align-top">
                        {order.items.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="mb-3 last:mb-0"
                            >
                              <p className="font-semibold text-gray-800">
                                {
                                  item.product
                                    .name
                                }
                              </p>

                              <p className="text-sm text-gray-500">
                                Qty:{" "}
                                {
                                  item.quantity
                                }
                              </p>

                              <p className="text-xs text-gray-400">
                                UGX{" "}
                                {item.unitPrice.toLocaleString()}{" "}
                                each
                              </p>
                            </div>
                          )
                        )}
                      </td>

                      {/* TOTAL */}
                      <td className="px-6 py-5 align-top">
                        <p className="font-bold text-purple-700">
                          UGX{" "}
                          {order.totalAmount.toLocaleString()}
                        </p>
                      </td>

                      {/* DELIVERY */}
                      <td className="px-6 py-5 align-top">
                        <span className="inline-flex rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
                          {
                            order.deliveryMethod
                          }
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5 align-top">
                        <div className="min-w-44 space-y-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>

                          <select
                            value={
                              order.status
                            }
                            disabled={
                              updatingOrderId ===
                              order.id
                            }
                            onChange={(
                              event
                            ) =>
                              updateOrderStatus(
                                order.id,
                                event
                                  .target
                                  .value as OrderStatus
                              )
                            }
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                          >
                            {statusOptions.map(
                              (status) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {status}
                                </option>
                              )
                            )}
                          </select>

                          {updatingOrderId ===
                            order.id && (
                            <p className="text-xs font-medium text-purple-600">
                              Updating...
                            </p>
                          )}
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="whitespace-nowrap px-6 py-5 align-top text-sm text-gray-500">
                        {formatDate(
                          order.createdAt
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ORDER WORKFLOW */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#35102f]">
            Order Workflow
          </h2>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <WorkflowBadge
              label="PENDING"
              className="bg-yellow-100 text-yellow-800"
            />

            <span className="text-gray-400">
              →
            </span>

            <WorkflowBadge
              label="CONFIRMED"
              className="bg-blue-100 text-blue-800"
            />

            <span className="text-gray-400">
              →
            </span>

            <WorkflowBadge
              label="PROCESSING"
              className="bg-purple-100 text-purple-800"
            />

            <span className="text-gray-400">
              →
            </span>

            <WorkflowBadge
              label="READY"
              className="bg-indigo-100 text-indigo-800"
            />

            <span className="text-gray-400">
              →
            </span>

            <WorkflowBadge
              label="COMPLETED"
              className="bg-green-100 text-green-800"
            />

            <span className="ml-2 text-gray-400">
              or
            </span>

            <WorkflowBadge
              label="CANCELLED"
              className="bg-red-100 text-red-800"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-extrabold text-[#35102f]">
        {value}
      </p>
    </div>
  );
}

function WorkflowBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`rounded-full px-4 py-2 text-xs font-bold ${className}`}
    >
      {label}
    </span>
  );
}