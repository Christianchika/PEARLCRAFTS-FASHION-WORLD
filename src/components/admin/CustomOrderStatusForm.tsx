"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const TRANSITIONS = {
  PENDING: ["REVIEWED", "CANCELLED"],
  REVIEWED: ["QUOTED", "CANCELLED"],
  QUOTED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
} as const;

type Status = keyof typeof TRANSITIONS;

function label(status: string) {
  return status.replace("_", " ");
}

type Props = {
  orderId: string;
  currentStatus: Status;
};

export default function CustomOrderStatusForm({
  orderId,
  currentStatus,
}: Props) {
  const router = useRouter();

  // QUOTED is reached by saving a quotation (price), not from this list.
  const availableStatuses = (
    TRANSITIONS[currentStatus] as readonly string[]
  ).filter((s) => s !== "QUOTED");

  const [status, setStatus] = useState<string>(
    availableStatuses[0] ?? currentStatus
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    if (!availableStatuses.includes(status as never)) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/custom-orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      setMessage("Status updated successfully.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update status."
      );
    } finally {
      setSaving(false);
    }
  }

  if (availableStatuses.length === 0) {
    return (
      <div className="mt-5 rounded-2xl bg-gray-50 p-5">
        <p className="text-sm font-semibold text-gray-500">
          This order is {label(currentStatus).toLowerCase()} and has no
          further status changes available.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl bg-gray-50 p-5">
      <label
        htmlFor="custom-order-status"
        className="text-sm font-bold text-[#35102f]"
      >
        Change Status
      </label>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          id="custom-order-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={saving}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
        >
          {availableStatuses.map((item) => (
            <option key={item} value={item}>
              {label(item)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Save Status
            </>
          )}
        </button>
      </div>

      {message && (
        <p
          className={`mt-3 text-sm font-semibold ${
            message.includes("successfully")
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
