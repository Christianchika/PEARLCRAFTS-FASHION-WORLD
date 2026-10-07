import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import { isValidVideoUrl } from "@/lib/video";

type CreateVideoRequest = {
  title?: string;
  description?: string;
  videoUrl?: string;
  sortOrder?: number;
  isPublished?: boolean;
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as CreateVideoRequest;

    const title = body.title?.trim();
    const description = body.description?.trim() ?? "";
    const videoUrl = body.videoUrl?.trim();
    const sortOrder = Number.isInteger(body.sortOrder) ? body.sortOrder! : 0;

    if (!title) {
      return NextResponse.json(
        { error: "Video title is required." },
        { status: 400 }
      );
    }

    if (!videoUrl || !isValidVideoUrl(videoUrl)) {
      return NextResponse.json(
        {
          error:
            "Video URL must be an http/https link or a /path in the public folder.",
        },
        { status: 400 }
      );
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl,
        sortOrder,
        isPublished: body.isPublished !== false,
      },
    });

    revalidatePath("/");
    revalidatePath("/videos");

    return NextResponse.json(
      { message: "Video created successfully.", video },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create video:", error);
    return NextResponse.json(
      { error: "Failed to create video." },
      { status: 500 }
    );
  }
}
