import Link from "next/link";

import { prisma } from "@/lib/prisma";
import VideoPlayer from "@/components/VideoPlayer";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="min-h-screen bg-[#fff8fc]">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#35102f] via-[#7c3aed] to-[#ec1976] px-6 py-20 text-center text-white">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#ffd966]">
          PEARLCRAFTS FASHION WORLD
        </p>

        <h1 className="text-5xl font-bold md:text-6xl">Our Videos</h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90">
          Watch our latest fashion creations, behind-the-scenes moments,
          styling ideas and beautiful PEARLCRAFTS designs.
        </p>
      </section>

      {/* Back to Home */}
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border-2 border-[#7c3aed] px-6 py-3 font-bold text-[#7c3aed] transition hover:bg-[#7c3aed] hover:text-white"
        >
          ← Back to Home
        </Link>
      </section>

      {/* Videos */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {videos.length === 0 ? (
          <p className="rounded-3xl bg-white p-12 text-center text-[#5f4960] shadow-lg ring-1 ring-[#ead7e6]">
            New videos are coming soon. Please check back shortly.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-[#ead7e6]"
              >
                <VideoPlayer url={video.videoUrl} title={video.title} />

                <div className="p-6">
                  <p className="text-sm font-bold uppercase tracking-wide text-[#ec1976]">
                    PEARLCRAFTS VIDEO
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-[#35102f]">
                    {video.title}
                  </h2>

                  {video.description && (
                    <p className="mt-3 leading-7 text-[#5f4960]">
                      {video.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-[#fff0f7] to-[#f3e8ff] p-10 text-center">
          <h2 className="text-3xl font-bold text-[#35102f]">
            Want to See More?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[#5f4960]">
            We will continue adding new PEARLCRAFTS fashion videos,
            product showcases and behind-the-scenes content.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#ec1976] to-[#7c3aed] px-8 py-4 font-bold text-white shadow-lg transition hover:scale-105"
          >
            Explore Our Collections
          </Link>
        </div>
      </section>
    </main>
  );
}
