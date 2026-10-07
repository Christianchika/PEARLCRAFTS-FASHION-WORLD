import Link from "next/link";
import { ArrowLeft, Video } from "lucide-react";

import { prisma } from "@/lib/prisma";
import VideosManager from "./VideosManager";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      videoUrl: true,
      sortOrder: true,
      isPublished: true,
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-pink-600"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <div className="rounded-2xl bg-purple-100 p-3 text-purple-600">
          <Video size={23} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#35102f]">
            Videos
          </h1>
          <p className="text-sm text-gray-500">
            Changes appear on the Videos page of your website.
          </p>
        </div>
      </div>

      <VideosManager videos={videos} />
    </main>
  );
}
