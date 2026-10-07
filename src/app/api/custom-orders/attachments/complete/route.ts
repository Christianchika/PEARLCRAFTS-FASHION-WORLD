import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  getS3ObjectMetadata,
  MAX_UPLOAD_FILES,
  MAX_UPLOAD_SIZE,
} from "@/lib/storage/s3";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      orderId,
      uploadToken,
      uploadIds,
    }: {
      orderId?: string;
      uploadToken?: string;
      uploadIds?: string[];
    } = body;

    if (
      typeof orderId !== "string" ||
      !orderId.trim() ||
      typeof uploadToken !== "string" ||
      !/^[a-f0-9]{64}$/i.test(uploadToken)
    ) {
      return NextResponse.json(
        { error: "Valid order credentials are required." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(uploadIds) ||
      uploadIds.length < 1 ||
      uploadIds.length > MAX_UPLOAD_FILES ||
      uploadIds.some(
        (id) => typeof id !== "string" || !id.trim()
      ) ||
      new Set(uploadIds).size !== uploadIds.length
    ) {
      return NextResponse.json(
        { error: "Invalid upload ID list." },
        { status: 400 }
      );
    }

    const order = await prisma.customOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        uploadTokenHash: true,
        uploadTokenExpiresAt: true,
      },
    });

    if (
      !order ||
      !order.uploadTokenHash ||
      !order.uploadTokenExpiresAt ||
      order.uploadTokenExpiresAt <= new Date()
    ) {
      return NextResponse.json(
        { error: "Upload permission is invalid or has expired." },
        { status: 403 }
      );
    }

    const suppliedHash = createHash("sha256")
      .update(uploadToken)
      .digest();

    const storedHash = Buffer.from(order.uploadTokenHash, "hex");

    if (
      suppliedHash.length !== storedHash.length ||
      !timingSafeEqual(suppliedHash, storedHash)
    ) {
      return NextResponse.json(
        { error: "Upload permission is invalid or has expired." },
        { status: 403 }
      );
    }

    const uploadRecords = await prisma.customOrderUpload.findMany({
      where: {
        customOrderId: orderId,
        id: { in: uploadIds },
      },
    });

    if (uploadRecords.length !== uploadIds.length) {
      return NextResponse.json(
        { error: "One or more upload records are invalid." },
        { status: 400 }
      );
    }

    if (uploadRecords.some((upload) => upload.status !== "PENDING")) {
      return NextResponse.json(
        { error: "One or more files have already been completed." },
        { status: 409 }
      );
    }

    const totalUploadRecords = await prisma.customOrderUpload.count({
      where: { customOrderId: orderId },
    });

    if (totalUploadRecords !== uploadIds.length) {
      return NextResponse.json(
        { error: "All authorised files must be submitted together." },
        { status: 400 }
      );
    }

    const existingAttachmentCount =
      await prisma.customOrderAttachment.count({
        where: { customOrderId: orderId },
      });

    if (
      existingAttachmentCount + uploadRecords.length >
      MAX_UPLOAD_FILES
    ) {
      return NextResponse.json(
        { error: "This order cannot have more than five attachments." },
        { status: 400 }
      );
    }

    // Verify each object against the server-generated manifest.
    const verifiedUploads: typeof uploadRecords = [];

    for (const upload of uploadRecords) {
      if (
        upload.expectedSize < 1 ||
        upload.expectedSize > MAX_UPLOAD_SIZE
      ) {
        return NextResponse.json(
          { error: "Invalid expected file size." },
          { status: 400 }
        );
      }

      const metadata = await getS3ObjectMetadata(upload.objectKey);

      if (metadata.ContentLength !== upload.expectedSize) {
        return NextResponse.json(
          {
            error: `File size verification failed for "${upload.fileName}".`,
          },
          { status: 400 }
        );
      }

      if (metadata.ContentType !== upload.contentType) {
        return NextResponse.json(
          {
            error: `File type verification failed for "${upload.fileName}".`,
          },
          { status: 400 }
        );
      }

      verifiedUploads.push(upload);
    }

    // Conditional status updates prevent the same upload from
    // being completed twice, even if two requests arrive together.
    await prisma.$transaction(async (tx) => {
      for (const upload of verifiedUploads) {
        const result = await tx.customOrderUpload.updateMany({
          where: {
            id: upload.id,
            customOrderId: orderId,
            status: "PENDING",
          },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });

        if (result.count !== 1) {
          throw new Error("UPLOAD_ALREADY_COMPLETED");
        }

        await tx.customOrderAttachment.create({
          data: {
            customOrderId: orderId,
            fileName: upload.fileName,
            fileUrl: upload.objectKey,
            contentType: upload.contentType,
            fileSize: upload.expectedSize,
          },
        });
      }

      await tx.customOrder.update({
        where: { id: orderId },
        data: {
          uploadTokenHash: null,
          uploadTokenExpiresAt: null,
        },
      });
    });

    return NextResponse.json(
      {
        message: "Attachments verified successfully.",
        orderId,
        attachmentCount: verifiedUploads.length,
      },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UPLOAD_ALREADY_COMPLETED"
    ) {
      return NextResponse.json(
        { error: "One or more files have already been completed." },
        { status: 409 }
      );
    }

    console.error("Custom order attachment verification error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to verify the uploaded files. Please try again.",
      },
      { status: 500 }
    );
  }
}
