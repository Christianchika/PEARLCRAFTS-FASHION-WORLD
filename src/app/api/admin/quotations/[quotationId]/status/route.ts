import { NextResponse } from "next/server";
import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { QuotationStatus } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


const ALLOWED_TRANSITIONS: Record<
  QuotationStatus,
  QuotationStatus[]
> = {
  DRAFT: [QuotationStatus.EXPIRED],
  SENT: [QuotationStatus.EXPIRED],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
};


export async function PATCH(
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("status" in body) ||
    typeof body.status !== "string"
  ) {
    return NextResponse.json(
      { error: "A quotation status is required." },
      { status: 400 }
    );
  }

  const requestedStatus = body.status;

  if (
    !Object.values(QuotationStatus).includes(
      requestedStatus as QuotationStatus
    )
  ) {
    return NextResponse.json(
      { error: "Invalid quotation status." },
      { status: 400 }
    );
  }

  const nextStatus = requestedStatus as QuotationStatus;
  const { quotationId } = await params;

  try {
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

    const result = await prisma.$transaction(async (tx) => {
      const quotation = await tx.customOrderQuotation.findUnique({
        where: { id: quotationId },
        select: {
          id: true,
          status: true,
          validUntil: true,
        },
      });

      if (!quotation) {
        return {
          error: "Quotation not found.",
          statusCode: 404,
        } as const;
      }

      if (quotation.status === nextStatus) {
        return {
          error: `Quotation is already ${nextStatus}.`,
          statusCode: 409,
        } as const;
      }

      if (!ALLOWED_TRANSITIONS[quotation.status].includes(nextStatus)) {
        return {
          error: `Cannot change quotation from ${quotation.status} to ${nextStatus}.`,
          statusCode: 409,
        } as const;
      }

      if (
        nextStatus === QuotationStatus.SENT &&
        quotation.validUntil &&
        quotation.validUntil.getTime() < Date.now()
      ) {
        return {
          error: "This quotation has passed its validity date. Create a revised quotation before sending it.",
          statusCode: 409,
        } as const;
      }

      const now = new Date();

      const updated = await tx.customOrderQuotation.update({
        where: { id: quotationId },
        data: {
          status: nextStatus,
          ...(nextStatus === QuotationStatus.SENT
            ? { sentAt: now }
            : {}),
          ...(
            nextStatus === QuotationStatus.ACCEPTED ||
            nextStatus === QuotationStatus.REJECTED
              ? { customerRespondedAt: now }
              : {}
          ),
        },
        select: {
          id: true,
          quotationNumber: true,
          status: true,
          sentAt: true,
          customerRespondedAt: true,
          updatedAt: true,
        },
      });

      return { quotation: updated } as const;
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode }
      );
    }

    return NextResponse.json({
      message: "Quotation status updated successfully.",
      quotation: result.quotation,
    });
  } catch (error) {
    console.error("Quotation status update failed:", error);

    return NextResponse.json(
      { error: "Unable to update quotation status." },
      { status: 500 }
    );
  }
}
