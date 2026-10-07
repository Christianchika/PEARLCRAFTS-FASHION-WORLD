"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

type ProductActionsProps = {
  productId: string;
  productName: string;
};

export default function ProductActions({
  productId,
  productName,
}: ProductActionsProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete product."
        );
      }

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete product."
      );
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center justify-end gap-4">
        <Link
          href={`/products/${productId}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-purple-700 transition hover:text-pink-600"
        >
          <Eye size={16} />
          View
        </Link>

        <Link
          href={`/admin/products/${productId}/edit`}
          className="inline-flex items-center gap-1 text-sm font-bold text-pink-600 transition hover:text-purple-700"
        >
          <Pencil size={16} />
          Edit
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1 text-sm font-bold text-red-600 transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={16} />

          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {error && (
        <p className="max-w-xs text-right text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}