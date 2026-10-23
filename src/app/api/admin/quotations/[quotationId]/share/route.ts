import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { QuotationStatus } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quotationId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    // Confirm that the signed-in user is an administrator.
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    // Read the quotation ID from the dynamic route.
    const { quotationId } = await params;

    // Find the quotation and the customer's contact details.
    const quotation =
      await prisma.customOrderQuotation.findUnique({
        where: { id: quotationId },
        select: {
          id: true,
          quotationNumber: true,
          status: true,
          validUntil: true,
          customOrder: {
            select: {
              fullName: true,
              phone: true,
            },
          },
        },
      });

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found." },
        { status: 404 }
      );
    }

    // Only drafts and already-sent quotations can get a link.
    if (
      quotation.status !== QuotationStatus.DRAFT &&
      quotation.status !== QuotationStatus.SENT
    ) {
      return NextResponse.json(
        {
          error:
            "Only draft or sent quotations can have a customer link generated.",
        },
        { status: 409 }
      );
    }

    // Do not share a quotation that has passed its validity date.
    if (
      quotation.validUntil &&
      quotation.validUntil.getTime() < Date.now()
    ) {
      return NextResponse.json(
        {
          error:
            "This quotation has expired. Create a revised quotation before sharing it.",
        },
        { status: 409 }
      );
    }

    // Validate the public website URL before changing the database.
    const configuredSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim();

    let baseUrl: URL;

    try {
      baseUrl = configuredSiteUrl
        ? new URL(configuredSiteUrl)
        : new URL(request.url);
    } catch {
      return NextResponse.json(
        {
          error:
            "The public site URL is invalid. Check NEXT_PUBLIC_SITE_URL.",
        },
        { status: 500 }
      );
    }

    if (
      baseUrl.protocol !== "https:" &&
      baseUrl.protocol !== "http:"
    ) {
      return NextResponse.json(
        {
          error:
            "The public site URL must use HTTP or HTTPS.",
        },
        { status: 500 }
      );
    }

    // Store only a SHA-256 hash of the random customer token.
    const quotationUrlBase = baseUrl.origin;
    const token = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    // Update only if the quotation is still eligible for sharing.
    const updated =
      await prisma.customOrderQuotation.updateMany({
        where: {
          id: quotation.id,
          status: {
            in: [
              QuotationStatus.DRAFT,
              QuotationStatus.SENT,
            ],
          },
        },
        data: {
          shareTokenHash: tokenHash,
          status: QuotationStatus.SENT,
          sentAt: new Date(),
        },
      });

    if (updated.count !== 1) {
      return NextResponse.json(
        {
          error:
            "The quotation status changed while generating the link. Refresh and try again.",
        },
        { status: 409 }
      );
    }

    // Build the customer-facing URL using the validated public origin.
    const quotationUrl = new URL(
      `/quotation/${token}`,
      quotationUrlBase
    ).toString();

    return NextResponse.json({
      message:
        "Customer quotation link generated successfully.",
      quotation: {
        id: quotation.id,
        quotationNumber: quotation.quotationNumber,
        status: QuotationStatus.SENT,
        sentAt: new Date().toISOString(),
      },
      customer: {
        name: quotation.customOrder.fullName,
        phone: quotation.customOrder.phone,
      },
      quotationUrl,
    });
  } catch (error) {
    console.error(
      "Quotation sharing link generation failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate the customer quotation link.",
      },
      { status: 500 }
    );
  }
}