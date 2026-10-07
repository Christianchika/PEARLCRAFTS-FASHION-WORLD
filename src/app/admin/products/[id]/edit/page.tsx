"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  colour: string | null;
  stockQuantity: number;
  imageUrl: string;
  isFeatured: boolean;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = String(params.id);

  const [product, setProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [colour, setColour] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(
          `/api/admin/products/${productId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load product."
          );
        }

        const loadedProduct = data.product as Product;

        setProduct(loadedProduct);

        setName(loadedProduct.name);
        setDescription(loadedProduct.description);
        setPrice(String(loadedProduct.price));
        setCategory(loadedProduct.category);
        setColour(loadedProduct.colour ?? "");
        setStockQuantity(
          String(loadedProduct.stockQuantity)
        );
        setImageUrl(loadedProduct.imageUrl);
        setIsFeatured(loadedProduct.isFeatured);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            price: Number(price),
            category,
            colour,
            stockQuantity: Number(stockQuantity),
            imageUrl,
            isFeatured,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update product."
        );
      }

      setSuccess("Product updated successfully.");
      setProduct(data.product);

      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-gray-600">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#35102f]">
            Product not found
          </h1>

          <p className="mt-3 text-gray-600">
            {error}
          </p>

          <Link
            href="/admin/products"
            className="mt-6 inline-block rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 font-bold text-white"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
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

        <p className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-pink-600">
          Catalogue Management
        </p>

        <h1 className="mt-2 text-3xl font-extrabold text-[#35102f]">
          Edit Product
        </h1>

        <p className="mt-2 text-gray-600">
          Update the information for {product.name}.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8"
      >
        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {success}
          </div>
        )}

        <div>
          <label className="text-sm font-bold text-[#35102f]">
            Product Name
          </label>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-pink-100 px-4 py-3 outline-none focus:border-pink-500"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-[#35102f]">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            required
            rows={5}
            className="mt-2 w-full rounded-xl border border-pink-100 px-4 py-3 outline-none focus:border-pink-500"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-[#35102f]">
              Price (UGX)
            </label>

            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-pink-100 px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-[#35102f]">
              Stock Quantity
            </label>

            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(event) =>
                setStockQuantity(event.target.value)
              }
              required
              className="mt-2 w-full rounded-xl border border-pink-100 px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-[#35102f]">
              Category
            </label>

            <input
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              required
              className="mt-2 w-full rounded-xl border border-pink-100 px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-[#35102f]">
              Colour
            </label>

            <input
              value={colour}
              onChange={(event) =>
                setColour(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-pink-100 px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-[#35102f]">
            Image URL
          </label>

          <input
            value={imageUrl}
            onChange={(event) =>
              setImageUrl(event.target.value)
            }
            required
            placeholder="/products/example.jpg"
            className="mt-2 w-full rounded-xl border border-pink-100 px-4 py-3 outline-none focus:border-pink-500"
          />

          <p className="mt-2 text-xs text-gray-500">
            Temporary field. We will replace this with the
            secure Amazon S3 upload system.
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-pink-50 p-4">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(event) =>
              setIsFeatured(event.target.checked)
            }
            className="h-5 w-5 accent-pink-600"
          />

          <span className="font-semibold text-[#35102f]">
            Featured Product
          </span>
        </label>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-4 font-bold text-white shadow-md transition hover:from-pink-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>

          <Link
            href="/admin/products"
            className="flex-1 rounded-full border-2 border-purple-600 px-6 py-4 text-center font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}