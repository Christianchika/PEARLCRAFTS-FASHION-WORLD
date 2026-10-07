"use client";

import Link from "next/link";
import { useState } from "react";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

type UploadResponse = {
  uploadId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadUrl: string;
};

export default function CustomOrderPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(event.target.files ?? []);

    setError("");
    setSuccess("");

    if (selectedFiles.length > MAX_FILES) {
      setFiles([]);
      event.target.value = "";
      setError(`You can select a maximum of ${MAX_FILES} files.`);
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !ALLOWED_TYPES.includes(file.type) ||
        file.size < 1 ||
        file.size > MAX_FILE_SIZE
    );

    if (invalidFile) {
      setFiles([]);
      event.target.value = "";
      setError(
        "Only JPEG, PNG, WebP images and PDF files are allowed. Each file must be no larger than 10 MB."
      );
      return;
    }

    setFiles(selectedFiles);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const payload = {
        fullName: String(formData.get("fullName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        location: String(formData.get("location") ?? ""),
        itemType: String(formData.get("itemType") ?? ""),
        occasion: String(formData.get("occasion") ?? ""),
        colour: String(formData.get("colour") ?? ""),
        quantity: Number(formData.get("quantity") ?? 1),
        description: String(formData.get("description") ?? ""),
        deliveryMethod: String(
          formData.get("deliveryMethod") ?? "Delivery"
        ),
        files: files.map((file) => ({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        })),
      };

      // STEP 1: Create the custom order and obtain upload permissions.
      const orderResponse = await fetch("/api/custom-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderResult.error || "Unable to create your custom order."
        );
      }

      const orderId: string = orderResult.orderId;
      const uploadToken: string = orderResult.uploadToken;
      const uploads: UploadResponse[] = orderResult.uploads ?? [];

      if (
        typeof orderId !== "string" ||
        typeof uploadToken !== "string" ||
        !Array.isArray(uploads) ||
        uploads.length !== files.length
      ) {
        throw new Error(
          "The server returned an incomplete upload response. Please contact us before submitting another request."
        );
      }

      // STEP 2: Upload the selected files directly to Amazon S3.
      for (let index = 0; index < uploads.length; index++) {
        const upload = uploads[index];
        const file = files[index];

        const uploadResponse = await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": upload.contentType,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(
            `The file "${file.name}" could not be uploaded. Your order reference is ${orderId}. Please contact us before submitting another request.`
          );
        }
      }

      // STEP 3: Ask the server to verify and register the uploads.
      if (uploads.length > 0) {
        const completionResponse = await fetch(
          "/api/custom-orders/attachments/complete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,
              uploadToken,
              uploadIds: uploads.map((upload) => upload.uploadId),
            }),
          }
        );

        const completionResult = await completionResponse.json();

        if (!completionResponse.ok) {
          throw new Error(
            `Your order was created, but the attachments could not be verified. Reference: ${orderId}. ${completionResult.error || ""}`
          );
        }
      }

      setSuccess(
        `Thank you! Your custom design request has been submitted successfully. Your reference number is ${orderId}. Our team will review your request and contact you.`
      );

      setFiles([]);
      form.reset();
    } catch (err) {
      console.error("Custom order submission error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff8fc]">
      {/* Header */}
      <section className="bg-gradient-to-r from-pink-600 via-fuchsia-500 to-purple-600 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="text-sm font-semibold text-white/80 transition hover:text-white"
          >
            ← Back to Home
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-yellow-200">
            PEARLCRAFTS FASHION WORLD
          </p>

          <h1 className="mt-4 text-4xl font-extrabold md:text-6xl">
            Create Your Custom Design
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">
            Have a special design in mind? Tell us what you want and upload
            your inspiration or reference images. We will review your idea
            and get back to you.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-xl md:p-10"
        >
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#35102f]">
              Tell Us About Your Design
            </h2>

            <p className="mt-2 text-gray-600">
              Please provide as much information as possible so we can
              understand exactly what you need.
            </p>
          </div>

          {/* Customer Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-[#35102f]">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                maxLength={150}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-pink-100 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-[#35102f]">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                maxLength={40}
                placeholder="+256 7XX XXX XXX"
                className="w-full rounded-xl border border-pink-100 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#35102f]">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-xl border border-pink-100 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-semibold text-[#35102f]">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                maxLength={200}
                placeholder="Kampala, Entebbe, Wakiso..."
                className="w-full rounded-xl border border-pink-100 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          {/* Design Details */}
          <div className="mt-10 border-t border-pink-100 pt-10">
            <h2 className="text-2xl font-bold text-[#35102f]">
              Design Details
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="itemType" className="mb-2 block text-sm font-semibold text-[#35102f]">
                  What would you like us to make? *
                </label>
                <select
                  id="itemType"
                  name="itemType"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-pink-100 bg-white px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                >
                  <option value="" disabled>Select an item</option>
                  <option value="Fascinator">Fascinator</option>
                  <option value="Headband">Headband</option>
                  <option value="Hair Accessory">Hair Accessory</option>
                  <option value="Wedding Headpiece">Wedding Headpiece</option>
                  <option value="Bridal Accessory">Bridal Accessory</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="occasion" className="mb-2 block text-sm font-semibold text-[#35102f]">
                  Occasion
                </label>
                <select
                  id="occasion"
                  name="occasion"
                  defaultValue=""
                  className="w-full rounded-xl border border-pink-100 bg-white px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                >
                  <option value="">Select an occasion</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Bridal Shower">Bridal Shower</option>
                  <option value="Traditional Ceremony">Traditional Ceremony</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Party">Party</option>
                  <option value="Graduation">Graduation</option>
                  <option value="Church Event">Church Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="colour" className="mb-2 block text-sm font-semibold text-[#35102f]">
                  Preferred Colour
                </label>
                <input
                  id="colour"
                  name="colour"
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Pink, Gold, Ivory..."
                  className="w-full rounded-xl border border-pink-100 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label htmlFor="quantity" className="mb-2 block text-sm font-semibold text-[#35102f]">
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  max="100"
                  defaultValue="1"
                  required
                  className="w-full rounded-xl border border-pink-100 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-10">
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-[#35102f]">
              Describe Your Design *
            </label>
            <textarea
              id="description"
              name="description"
              required
              maxLength={5000}
              rows={6}
              placeholder="Tell us about the style, shape, materials, colours, decorations and anything else you would like..."
              className="w-full resize-y rounded-xl border border-pink-100 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          {/* Upload */}
          <div className="mt-10">
            <label htmlFor="designFiles" className="mb-2 block text-sm font-semibold text-[#35102f]">
              Upload Your Design / Inspiration
            </label>

            <div className="rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/50 p-8 text-center">
              <input
                id="designFiles"
                name="designFiles"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple
                onChange={handleFileChange}
                className="mx-auto block w-full max-w-md text-sm"
              />

              <p className="mt-4 text-sm text-gray-500">
                Upload up to five JPEG, PNG, WebP or PDF files. Maximum 10 MB per file.
              </p>

              {files.length > 0 && (
                <div className="mt-5 text-left">
                  <p className="font-semibold text-[#35102f]">
                    Selected files:
                  </p>
                  <ul className="mt-2 space-y-2">
                    {files.map((file) => (
                      <li
                        key={`${file.name}-${file.size}`}
                        className="rounded-lg bg-white px-4 py-2 text-sm text-gray-700 shadow-sm"
                      >
                        {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Delivery */}
          <div className="mt-10">
            <label htmlFor="deliveryMethod" className="mb-2 block text-sm font-semibold text-[#35102f]">
              Preferred Delivery Method
            </label>
            <select
              id="deliveryMethod"
              name="deliveryMethod"
              defaultValue="Delivery"
              className="w-full rounded-xl border border-pink-100 bg-white px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            >
              <option value="Delivery">Delivery</option>
              <option value="Pickup">Pickup</option>
            </select>
          </div>

          {/* Feedback */}
          {error && (
            <div
              role="alert"
              className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            >
              {success}
            </div>
          )}

          {/* Submit */}
          <div className="mt-10">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 px-8 py-4 font-bold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting Your Design..."
                : "Submit Custom Design Request"}
            </button>

            <p className="mt-4 text-center text-sm text-gray-500">
              Our team will review your design request and contact you about
              the details and price.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
