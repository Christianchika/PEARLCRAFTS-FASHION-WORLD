import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QuotationStatus } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ token: string }>;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function findQuotation(token: string) {
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return null;
  }

  return prisma.customOrderQuotation.findUnique({
    where: { shareTokenHash: hashToken(token) },
    select: {
      id: true,
      quotationNumber: true,
      status: true,
      currency: true,
      subtotal: true,
      deliveryFee: true,
      additionalFees: true,
      totalAmount: true,
      estimatedCompletion: true,
      paymentTerms: true,
      notes: true,
      validUntil: true,
      sentAt: true,
      customerRespondedAt: true,
      createdAt: true,
      customOrder: {
        select: {
          fullName: true,
        },
      },
      items: {
        select: {
          id: true,
          description: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { token } = await params;
    const quotation = await findQuotation(token);

    if (!quotation) {
      return NextResponse.json(
        { error: "This quotation link is invalid or no longer available." },
        { status: 404 }
      );
    }

    const isPastValidity =
      quotation.validUntil !== null &&
      quotation.validUntil.getTime() < Date.now();

    const canRespond =
      quotation.status === QuotationStatus.SENT && !isPastValidity;

    return NextResponse.json({
      quotation: {
        quotationNumber: quotation.quotationNumber,
        status: quotation.status,
        currency: quotation.currency,
        subtotal: quotation.subtotal,
        deliveryFee: quotation.deliveryFee,
        additionalFees: quotation.additionalFees,
        totalAmount: quotation.totalAmount,
        estimatedCompletion: quotation.estimatedCompletion,
        paymentTerms: quotation.paymentTerms,
        notes: quotation.notes,
        validUntil: quotation.validUntil,
        sentAt: quotation.sentAt,
        customerRespondedAt: quotation.customerRespondedAt,
        createdAt: quotation.createdAt,
        customerName: quotation.customOrder.fullName,
        items: quotation.items,
        canRespond,
        isPastValidity,
      },
    });
  } catch (error) {
    console.error("Public quotation lookup failed:", error);

    return NextResponse.json(
      { error: "Unable to load this quotation." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("decision" in body) ||
    (body.decision !== "ACCEPTED" && body.decision !== "REJECTED")
  ) {
    return NextResponse.json(
      { error: "Choose ACCEPTED or REJECTED." },
      { status: 400 }
    );
  }

  try {
    const { token } = await params;

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json(
        { error: "This quotation link is invalid or no longer available." },
        { status: 404 }
      );
    }

    const tokenHash = hashToken(token);
    const quotation = await prisma.customOrderQuotation.findUnique({
      where: { shareTokenHash: tokenHash },
      select: {
        id: true,
        status: true,
        validUntil: true,
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "This quotation link is invalid or no longer available." },
        { status: 404 }
      );
    }

    if (quotation.status !== QuotationStatus.SENT) {
      return NextResponse.json(
        { error: "This quotation has already been responded to or is no longer available for a response." },
        { status: 409 }
      );
    }

    if (
      quotation.validUntil &&
      quotation.validUntil.getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "This quotation has passed its validity date. Please contact PearlCrafts for a revised quotation." },
        { status: 409 }
      );
    }

    const now = new Date();
    const updated = await prisma.customOrderQuotation.updateMany({
      where: {
        id: quotation.id,
        shareTokenHash: tokenHash,
        status: QuotationStatus.SENT,
      },
      data: {
        status: body.decision,
        customerRespondedAt: now,
      },
    });

    if (updated.count !== 1) {
      return NextResponse.json(
        { error: "This quotation has already received a response. Refresh the page to see its current status." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message:
        body.decision === "ACCEPTED"
          ? "Thank you. You have accepted this quotation."
          : "Your decision has been recorded.",
      status: body.decision,
      customerRespondedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Public quotation response failed:", error);

    return NextResponse.json(
      { error: "Unable to record your response. Please try again." },
      { status: 500 }
    );
  }
}
