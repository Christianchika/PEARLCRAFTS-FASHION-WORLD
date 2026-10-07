import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import { isValidVideoUrl } from "@/lib/video";

type UpdateVideoRequest = {
  title?: string;
  description?: string;
  videoUrl?: string;
  sortOrder?: number;
  isPublished?: boolean;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as UpdateVideoRequest;
    const data: Record<string, unknown> = {};

    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json(
          { error: "Video title cannot be empty." },
          { status: 400 }
        );
      }
      data.title = title;
    }

    if (body.description !== undefined) {
      data.description = body.description.trim();
    }

    if (body.videoUrl !== undefined) {
      const videoUrl = body.videoUrl.trim();
      if (!isValidVideoUrl(videoUrl)) {
        return NextResponse.json(
          {
            error:
              "Video URL must be an http/https link or a /path in the public folder.",
          },
          { status: 400 }
        );
      }
      data.videoUrl = videoUrl;
    }

    if (body.sortOrder !== undefined) {
      if (!Number.isInteger(body.sortOrder)) {
        return NextResponse.json(
          { error: "Sort order must be a whole number." },
          { status: 400 }
        );
      }
      data.sortOrder = body.sortOrder;
    }

    if (body.isPublished !== undefined) {
      data.isPublished = Boolean(body.isPublished);
    }

    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    const video = await prisma.video.update({ where: { id }, data });

    revalidatePath("/");
    revalidatePath("/videos");

    return NextResponse.json({ message: "Video updated.", video });
  } catch (error) {
    console.error("Failed to update video:", error);
    return NextResponse.json(
      { error: "Failed to update video." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    await prisma.video.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/videos");

    return NextResponse.json({ message: "Video deleted." });
  } catch (error) {
    console.error("Failed to delete video:", error);
    return NextResponse.json(
      { error: "Failed to delete video." },
      { status: 500 }
    );
  }
}
