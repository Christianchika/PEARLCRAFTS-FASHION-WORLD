"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  "Fascinators",
  "Boater Hats",
  "Auto Gele",
  "Headbands",
  "Hair Accessories",
  "Wedding Headpieces",
  "Bridal Accessories",
  "Custom Designs",
  "New Arrivals",
];

export default function NewProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Fascinators",
    colour: "",
    stockQuantity: "1",
    imageUrl: "",
    isFeatured: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          colour: formData.colour || null,
          stockQuantity: Number(formData.stockQuantity),
          imageUrl: formData.imageUrl,
          isFeatured: formData.isFeatured,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create product."
        );
      }

      router.push("/admin/products");
      router.refresh();
    } catch (submitError) {
      console.error(
        "Failed to create product:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create product."
      );
    } finally {
      setSubmitting(true);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="font-semibold text-purple-700 hover:text-pink-600"
        >
          ← Back to Products
        </Link>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-pink-600">
          Catalogue Management
        </p>

        <h1 className="mt-2 text-3xl font-extrabold text-[#35102f]">
          Add New Product
        </h1>

        <p className="mt-2 text-gray-600">
          Add a product to the PEARLCRAFTS catalogue.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white p-6 shadow-sm md:p-8"
      >
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-[#35102f]"
            >
              Product Name
            </label>

            <input
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Royal Pearl Fascinator"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-[#35102f]"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the product..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-semibold text-[#35102f]"
            >
              Price (UGX)
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              required
              value={formData.price}
              onChange={handleChange}
              placeholder="180000"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div>
            <label
              htmlFor="stockQuantity"
              className="mb-2 block text-sm font-semibold text-[#35102f]"
            >
              Stock Quantity
            </label>

            <input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min="0"
              step="1"
              required
              value={formData.stockQuantity}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-semibold text-[#35102f]"
            >
              Category
            </label>

            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="colour"
              className="mb-2 block text-sm font-semibold text-[#35102f]"
            >
              Colour
            </label>

            <input
              id="colour"
              name="colour"
              value={formData.colour}
              onChange={handleChange}
              placeholder="e.g. Ivory"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="imageUrl"
              className="mb-2 block text-sm font-semibold text-[#35102f]"
            >
              Product Image URL
            </label>

            <input
              id="imageUrl"
              name="imageUrl"
              type="text"
              required
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="/products/product-image.jpg"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            />

            <p className="mt-2 text-xs leading-5 text-gray-500">
              For now, enter an image URL. We will replace
              this with secure S3 image uploading in the next
              stage.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                name="isFeatured"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />

              <span className="font-semibold text-[#35102f]">
                Feature this product
              </span>
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/admin/products"
            className="rounded-full border-2 border-purple-600 px-6 py-3 text-center font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-7 py-3 font-bold text-white shadow-md transition hover:from-pink-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Saving Product..."
              : "Save Product"}
          </button>
        </div>
      </form>
    </main>
  );
}
