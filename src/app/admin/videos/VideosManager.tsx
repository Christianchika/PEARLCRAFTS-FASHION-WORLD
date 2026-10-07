"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import VideoPlayer from "@/components/VideoPlayer";

type VideoItem = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  sortOrder: number;
  isPublished: boolean;
};

const emptyForm = {
  title: "",
  description: "",
  videoUrl: "",
  sortOrder: "0",
  isPublished: true,
};

async function callApi(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export default function VideosManager({
  videos,
}: {
  videos: VideoItem[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function startEdit(video: VideoItem) {
    setEditingId(video.id);
    setError("");
    setForm({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      sortOrder: String(video.sortOrder),
      isPublished: video.isPublished,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const parsedOrder = Number.parseInt(form.sortOrder, 10);

    const payload = {
      title: form.title,
      description: form.description,
      videoUrl: form.videoUrl,
      sortOrder: Number.isNaN(parsedOrder) ? 0 : parsedOrder,
      isPublished: form.isPublished,
    };

    try {
      if (editingId) {
        await callApi(`/api/admin/videos/${editingId}`, "PATCH", payload);
      } else {
        await callApi("/api/admin/videos", "POST", payload);
      }
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(video: VideoItem) {
    setBusy(true);
    setError("");
    try {
      await callApi(`/api/admin/videos/${video.id}`, "PATCH", {
        isPublished: !video.isPublished,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(video: VideoItem) {
    if (!window.confirm(`Delete "${video.title}"? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await callApi(`/api/admin/videos/${video.id}`, "DELETE");
      if (editingId === video.id) resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-400";

  return (
    <div className="mt-6 space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-[#35102f]">
          {editingId ? "Edit video" : "Add a video"}
        </h2>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">
            Title
          </label>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">
            Description
          </label>
          <textarea
            className={inputClass}
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">
            Video link
          </label>
          <input
            className={inputClass}
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=... or /videos/clip.mp4"
            required
          />
          <p className="mt-1 text-xs text-gray-400">
            YouTube, Vimeo and direct .mp4/.webm links play on the site.
            Other links (TikTok, Instagram) show a &quot;Watch video&quot;
            button.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <div className="w-32">
            <label className="mb-1 block text-sm font-semibold text-gray-600">
              Order
            </label>
            <input
              type="number"
              className={inputClass}
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: e.target.value })
              }
            />
          </div>

          <label className="flex items-center gap-2 pb-2 text-sm font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
            />
            Show on website
          </label>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-purple-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-pink-600 disabled:opacity-50"
          >
            {busy ? "Saving..." : editingId ? "Save changes" : "Add video"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full bg-gray-100 px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="space-y-4">
        {videos.length === 0 ? (
          <p className="rounded-3xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            No videos yet. Add your first one above.
          </p>
        ) : (
          videos.map((video) => (
            <article
              key={video.id}
              className="grid gap-4 overflow-hidden rounded-3xl bg-white p-4 shadow-sm md:grid-cols-[16rem_1fr]"
            >
              <div className="overflow-hidden rounded-2xl">
                <VideoPlayer url={video.videoUrl} title={video.title} />
              </div>

              <div className="flex flex-col justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-[#35102f]">
                      {video.title}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                        video.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {video.isPublished ? "Published" : "Hidden"}
                    </span>
                    <span className="text-xs text-gray-400">
                      Order {video.sortOrder}
                    </span>
                  </div>
                  {video.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {video.description}
                    </p>
                  )}
                  <p className="mt-1 break-all text-xs text-gray-400">
                    {video.videoUrl}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => startEdit(video)}
                    disabled={busy}
                    className="rounded-full bg-purple-100 px-4 py-1.5 text-sm font-bold text-purple-700 hover:bg-purple-200 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => togglePublished(video)}
                    disabled={busy}
                    className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-700 hover:bg-amber-200 disabled:opacity-50"
                  >
                    {video.isPublished ? "Hide" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleDelete(video)}
                    disabled={busy}
                    className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-bold text-red-600 hover:bg-red-200 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
