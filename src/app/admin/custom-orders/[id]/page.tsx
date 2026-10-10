import Link from "next/link";
import { ArrowLeft, FileText, Sparkles, History } from "lucide-react";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import CustomOrderStatusForm from "@/components/admin/CustomOrderStatusForm";

export const dynamic = "force-dynamic";

const badgeStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  QUOTED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-fuchsia-100 text-fuchsia-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-200 text-gray-600",
};

function label(status: string) {
  return status.replace(/_/g, " ");
}

export default async function AdminCustomOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.customOrder.findUnique({
    where: { id },
    include: {
      attachments: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      <Link
        href="/admin/custom-orders"
        className="inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-pink-600"
      >
        <ArrowLeft size={16} />
        Back to Custom Orders
      </Link>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pink-100 p-3 text-pink-600">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#35102f]">
              Custom Design Request
            </h1>
            <p className="text-sm text-gray-500">Request #{order.id}</p>
          </div>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${
            badgeStyles[order.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {label(order.status)}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#35102f]">
            Customer Information
          </h2>
          <div className="mt-5 space-y-4">
            <Info label="Full Name" value={order.fullName} />
            <Info label="Phone" value={order.phone} />
            {order.email && <Info label="Email" value={order.email} />}
            <Info label="Location" value={order.location} />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#35102f]">
            Design Information
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Info label="Item Type" value={order.itemType} />
            <Info label="Quantity" value={String(order.quantity)} />
            {order.occasion && (
              <Info label="Occasion" value={order.occasion} />
            )}
            {order.preferredColour && (
              <Info label="Preferred Colour" value={order.preferredColour} />
            )}
            {order.deliveryMethod && (
              <Info label="Delivery Method" value={order.deliveryMethod} />
            )}
            <Info
              label="Submitted"
              value={order.createdAt.toLocaleString("en-GB")}
            />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-[#35102f]">
          Customer Description
        </h2>
        <div className="mt-4 rounded-2xl bg-pink-50 p-5">
          <p className="whitespace-pre-wrap text-gray-700">
            {order.description}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-2 text-purple-700">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#35102f]">
              Design / Inspiration Files
            </h2>
            <p className="text-sm text-gray-500">
              Files uploaded by the customer
            </p>
          </div>
        </div>

        {order.attachments.length === 0 ? (
          <p className="mt-5 text-sm text-gray-500">
            No files were uploaded with this request.
          </p>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {order.attachments.map((file) => {
              const isImage = file.contentType?.startsWith("image/");
              const attachmentUrl =
                `/api/admin/custom-orders/attachments/${file.id}`;

              return (
                <div
                  key={file.id}
                  className="overflow-hidden rounded-2xl border border-gray-200"
                >
                  {isImage ? (
                    <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={attachmentUrl}
                        alt={file.fileName}
                        className="h-64 w-full bg-gray-50 object-contain"
                      />
                    </a>
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-gray-50">
                      <FileText size={48} className="text-gray-400" />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 border-t border-gray-200 p-4">
                    <p className="min-w-0 truncate text-sm font-semibold text-gray-800">
                      {file.fileName}
                    </p>
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg bg-purple-700 px-3 py-2 text-xs font-bold text-white hover:bg-pink-600"
                    >
                      Open
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <History size={21} className="text-purple-700" />
          <div>
            <h2 className="text-lg font-extrabold text-[#35102f]">
              Status History
            </h2>
            <p className="text-sm text-gray-500">
              A record of changes to this custom design request.
            </p>
          </div>
        </div>

        {order.statusHistory.length === 0 ? (
          <div className="mt-5 rounded-2xl bg-purple-50 p-5">
            <p className="text-sm font-medium text-purple-800">
              No status changes have been recorded yet. Future changes will
              appear here automatically.
            </p>
          </div>
        ) : (
          <ol className="mt-6 space-y-5">
            {order.statusHistory.map((entry) => (
              <li
                key={entry.id}
                className="relative border-l-2 border-purple-200 pb-1 pl-5"
              >
                <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-purple-600 ring-4 ring-white" />

                <div className="flex flex-wrap items-center gap-2">
                  {entry.fromStatus ? (
                    <>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          badgeStyles[entry.fromStatus] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {label(entry.fromStatus)}
                      </span>
                      <span className="text-sm font-bold text-gray-400">
                        →
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-gray-500">
                      Initial status
                    </span>
                  )}

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      badgeStyles[entry.toStatus] ??
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {label(entry.toStatus)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  {entry.createdAt.toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {entry.changedByName || "Administrator"}
                </p>
                {entry.changedByEmail && (
                  <p className="text-sm text-gray-500">
                    {entry.changedByEmail}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-[#35102f]">
          Order Management
        </h2>
        <CustomOrderStatusForm
          orderId={order.id}
          currentStatus={order.status}
        />
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 break-words font-semibold text-gray-900">{value}</p>
    </div>
  );
}
