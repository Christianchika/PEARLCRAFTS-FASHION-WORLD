import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes, randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  createUploadUrl,
  isAllowedUploadType,
  MAX_UPLOAD_FILES,
  MAX_UPLOAD_SIZE,
} from "@/lib/storage/s3";

export const runtime = "nodejs";

type UploadFileInput = {
  fileName: string;
  contentType: string;
  fileSize: number;
};

const allowedItemTypes = [
  "Fascinator",
  "Headband",
  "Hair Accessory",
  "Wedding Headpiece",
  "Bridal Accessory",
  "Other",
];

const allowedDeliveryMethods = ["Delivery", "Pickup"];

const fileExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function POST(request: NextRequest) {
  //let orderId: string | undefined;

  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request data." },
        { status: 400 }
      );
    }

    const {
      fullName,
      phone,
      email,
      location,
      itemType,
      occasion,
      colour,
      quantity,
      description,
      deliveryMethod,
      files,
    } = body;

    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      fullName.trim().length > 150 ||
      typeof phone !== "string" ||
      !phone.trim() ||
      phone.trim().length > 40 ||
      typeof location !== "string" ||
      !location.trim() ||
      location.trim().length > 200 ||
      typeof description !== "string" ||
      !description.trim() ||
      description.trim().length > 5000
    ) {
      return NextResponse.json(
        { error: "Please complete all required customer details correctly." },
        { status: 400 }
      );
    }

    if (
      typeof itemType !== "string" ||
      !allowedItemTypes.includes(itemType)
    ) {
      return NextResponse.json(
        { error: "Invalid custom-order item type." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 100." },
        { status: 400 }
      );
    }

    if (
      typeof deliveryMethod !== "string" ||
      !allowedDeliveryMethods.includes(deliveryMethod)
    ) {
      return NextResponse.json(
        { error: "Please select a valid delivery method." },
        { status: 400 }
      );
    }

    if (
      email !== undefined &&
      email !== null &&
      (typeof email !== "string" ||
        email.length > 254 ||
        (email.trim() !== "" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())))
    ) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(files) ||
      files.length > MAX_UPLOAD_FILES
    ) {
      return NextResponse.json(
        {
          error: `You can attach a maximum of ${MAX_UPLOAD_FILES} files.`,
        },
        { status: 400 }
      );
    }

    const uploadFiles: UploadFileInput[] = [];

    for (const file of files) {
      if (
        !file ||
        typeof file.fileName !== "string" ||
        !file.fileName.trim() ||
        file.fileName.length > 255 ||
        /[/\\]/.test(file.fileName) ||
        typeof file.contentType !== "string" ||
        !isAllowedUploadType(file.contentType) ||
        !Number.isInteger(file.fileSize) ||
        file.fileSize < 1 ||
        file.fileSize > MAX_UPLOAD_SIZE
      ) {
        return NextResponse.json(
          {
            error:
              "Each attachment must be a JPEG, PNG, WebP image or PDF, with a maximum size of 10 MB.",
          },
          { status: 400 }
        );
      }

      uploadFiles.push(file);
    }

    // A high-entropy token is returned to the customer.
    // Only its SHA-256 hash is stored in the database.
    const uploadToken = randomBytes(32).toString("hex");
    const uploadTokenHash = createHash("sha256")
      .update(uploadToken)
      .digest("hex");

    const uploadTokenExpiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    );

    const order = await prisma.customOrder.create({
      data: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        location: location.trim(),
        itemType,
        occasion:
          typeof occasion === "string"
            ? occasion.trim().slice(0, 150) || null
            : null,
        preferredColour:
          typeof colour === "string"
            ? colour.trim().slice(0, 100) || null
            : null,
        quantity,
        description: description.trim(),
        deliveryMethod,
        uploadTokenHash,
        uploadTokenExpiresAt,
      },
    });


    try {
      const uploads = await Promise.all(
        uploadFiles.map(async (file) => {
          const extension = fileExtensions[file.contentType];

          const objectKey =
            `custom-orders/${order.id}/${randomUUID()}.${extension}`;

          // Save the server-generated upload manifest before
          // giving the browser permission to upload.
          const uploadRecord = await prisma.customOrderUpload.create({
            data: {
              customOrderId: order.id,
              objectKey,
              fileName: file.fileName.trim(),
              contentType: file.contentType,
              expectedSize: file.fileSize,
            },
          });

          const uploadUrl = await createUploadUrl(
            objectKey,
            file.contentType
          );

          return {
            uploadId: uploadRecord.id,
            fileName: uploadRecord.fileName,
            contentType: uploadRecord.contentType,
            fileSize: uploadRecord.expectedSize,
            uploadUrl,
          };
        })
      );

      return NextResponse.json(
        {
          message: "Custom order created. Upload your design files.",
          orderId: order.id,
          uploadToken,
          uploadTokenExpiresAt,
          uploads,
        },
        { status: 201 }
      );
    } catch (error) {
      // Remove the order and its upload records if URL creation fails.
      await prisma.customOrder.delete({
        where: { id: order.id },
      });

      throw error;
    }
  } catch (error) {
    console.error("Custom order creation error:", error);

    return NextResponse.json(
      { error: "Unable to create your custom order. Please try again." },
      { status: 500 }
    );
  }
}
