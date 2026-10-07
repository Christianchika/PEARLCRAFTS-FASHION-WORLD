"use client";

import { useState } from "react";

type OrderFormProps = {
  productName?: string;
  productId?: string;
  productPrice?: number;
  stockQuantity?: number;
};

export default function OrderForm({
  productName = "",
  productId = "",
  productPrice = 0,
  stockQuantity = 1,
}: OrderFormProps) {
  const [quantity, setQuantity] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    location: "",
    deliveryMethod: "Delivery",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const total = productPrice * quantity;

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    if (quantity > stockQuantity) {
  setError(
    `Only ${stockQuantity} unit${
      stockQuantity === 1 ? "" : "s"
    } of this product are currently available.`
  );
  setSubmitting(false);
  return;
}

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
          deliveryMethod: formData.deliveryMethod,
          notes: formData.notes,
          customer: {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email || undefined,
            location: formData.location,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to submit your order."
        );
      }

      console.log("Order created:", data.order);

      setSubmitted(true);
    } catch (submitError) {
      console.error(
        "Order submission failed:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while submitting your order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-2xl font-bold text-white">
          ✓
        </div>

        <h2 className="mt-6 text-2xl font-bold text-[#35102f]">
          Order Request Received
        </h2>

        <p className="mx-auto mt-4 max-w-lg leading-7 text-gray-600">
          Thank you for your order request. PEARLCRAFTS
          FASHION WORLD will contact you to confirm the
          order, delivery details and payment arrangements.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-2xl bg-pink-50 p-5">
          <p className="text-sm text-gray-600">
            Product
          </p>

          <p className="mt-1 font-bold text-[#35102f]">
            {productName || "Selected Product"}
          </p>

          <div className="mt-3 flex justify-between text-sm">
            <span className="text-gray-600">
              Quantity
            </span>

            <span className="font-semibold">
              {quantity}
            </span>
          </div>

          <div className="mt-2 flex justify-between">
            <span className="font-semibold">
              Total
            </span>

            <span className="font-bold text-purple-700">
              UGX {total.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setQuantity(1);
            setError("");
          }}
          className="mt-6 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-md transition hover:from-pink-700 hover:to-purple-700"
        >
          Place Another Order
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white p-6 shadow-sm md:p-8"
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Customer Information */}
        <div>
          <h2 className="text-2xl font-bold text-[#35102f]">
            Your Details
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Please provide your contact and delivery
            information.
          </p>

          <div className="mt-6 space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-semibold text-[#35102f]"
              >
                Full Name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-[#35102f]"
              >
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +256 7XX XXX XXX"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#35102f]"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-semibold text-[#35102f]"
              >
                Delivery Location
              </label>

              <input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your delivery location"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {/* Delivery Method */}
            <div>
              <label
                htmlFor="deliveryMethod"
                className="mb-2 block text-sm font-semibold text-[#35102f]"
              >
                Delivery Method
              </label>

              <select
                id="deliveryMethod"
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
              >
                <option value="Delivery">
                  Delivery
                </option>

                <option value="Pickup">
                  Pickup
                </option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-semibold text-[#35102f]"
              >
                Additional Notes
              </label>

              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special requirements?"
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-2xl font-bold text-[#35102f]">
            Order Summary
          </h2>

          <div className="mt-6 rounded-2xl bg-gray-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Product
            </p>

            <h3 className="mt-2 text-xl font-bold text-[#35102f]">
              {productName || "Selected Product"}
            </h3>
            <p className="mt-2 text-sm font-semibold text-green-600">
  {stockQuantity} available
</p>

            <div className="mt-6 flex items-center justify-between border-b pb-4">
              <span className="text-gray-600">
                Unit Price
              </span>

              <span className="font-semibold">
                UGX {productPrice.toLocaleString()}
              </span>
            </div>

            {/* Quantity */}
            <div className="mt-4 flex items-center justify-between border-b pb-4">
              <label
                htmlFor="quantity"
                className="text-gray-600"
              >
                Quantity
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border font-bold transition hover:bg-white"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span className="w-8 text-center font-semibold">
                  {quantity}
                </span>

               <button
  type="button"
  onClick={() =>
    setQuantity((current) =>
      Math.min(stockQuantity, current + 1)
    )
  }
  disabled={quantity >= stockQuantity}
  className="flex h-9 w-9 items-center justify-center rounded-full border font-bold transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
  aria-label="Increase quantity"
>
  +
</button>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 flex items-center justify-between">
              <span className="text-lg font-semibold">
                Total
              </span>

              <span className="text-2xl font-bold text-purple-700">
                UGX {total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-md transition hover:from-pink-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Submitting Order..."
              : "Submit Order Request"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-gray-500">
            Your order will be confirmed before final payment
            and fulfilment.
          </p>
        </div>
      </div>
    </form>
  );
}