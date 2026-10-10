import { NextResponse } from "next/server";
import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/storage/s3";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const { id } = await params;

  const attachment = await prisma.customOrderAttachment.findUnique({
    where: { id },
    select: { fileUrl: true },
  });

  if (!attachment) {
    return NextResponse.json(
      { error: "Attachment not found." },
      { status: 404 }
    );
  }

  // Older records may already hold a full URL.
  if (/^https?:\/\//i.test(attachment.fileUrl)) {
    return NextResponse.redirect(attachment.fileUrl);
  }

  const signedUrl = await createDownloadUrl(attachment.fileUrl);

  return NextResponse.redirect(signedUrl);
}
