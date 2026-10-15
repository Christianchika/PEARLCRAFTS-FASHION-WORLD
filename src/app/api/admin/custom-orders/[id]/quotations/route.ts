import { NextResponse } from "next/server";
import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { QuotationStatus } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuoteItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

type CreateQuotationInput = {
  items: QuoteItemInput[];
  deliveryFee?: number;
  additionalFees?: number;
  estimatedCompletion?: string;
  paymentTerms?: string;
  notes?: string;
  validUntil?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(
  value: unknown,
  fieldName: string,
  maxLength: number
): { value?: string; error?: string } {
  if (value === undefined || value === null || value === "") {
    return {};
  }

  if (typeof value !== "string" || value.trim().length > maxLength) {
    return { error: `${fieldName} must be text of at most ${maxLength} characters.` };
  }

  return { value: value.trim() };
}

function nonNegativeAmount(
  value: unknown,
  fieldName: string
): { value: number; error?: string } {
  if (value === undefined) {
    return { value: 0 };
  }

  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    return {
      value: 0,
      error: `${fieldName} must be a non-negative whole number of UGX.`,
    };
  }

  return { value };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;

    const order = await prisma.customOrder.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Custom order not found." },
        { status: 404 }
      );
    }

    const quotations = await prisma.customOrderQuotation.findMany({
      where: { customOrderId: id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quotations });
  } catch (error) {
    console.error("Unable to fetch quotations:", error);
    return NextResponse.json(
      { error: "Unable to fetch quotations." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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

  if (!isRecord(body)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 }
    );
  }

  const input = body as unknown as CreateQuotationInput;

  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 50) {
    return NextResponse.json(
      { error: "Provide between 1 and 50 quotation items." },
      { status: 400 }
    );
  }

  const items: QuoteItemInput[] = [];

  for (const [index, rawItem] of input.items.entries()) {
    if (!isRecord(rawItem)) {
      return NextResponse.json(
        { error: `Quotation item ${index + 1} is invalid.` },
        { status: 400 }
      );
    }

    const description = optionalText(
      rawItem.description,
      `Item ${index + 1} description`,
      300
    );

    if (description.error || !description.value) {
      return NextResponse.json(
        { error: description.error ?? `Item ${index + 1} needs a description.` },
        { status: 400 }
      );
    }

    if (
      typeof rawItem.quantity !== "number" ||
      !Number.isSafeInteger(rawItem.quantity) ||
      rawItem.quantity < 1 ||
      rawItem.quantity > 10000
    ) {
      return NextResponse.json(
        { error: `Item ${index + 1} quantity must be a whole number from 1 to 10,000.` },
        { status: 400 }
      );
    }

    if (
      typeof rawItem.unitPrice !== "number" ||
      !Number.isSafeInteger(rawItem.unitPrice) ||
      rawItem.unitPrice < 0 ||
      rawItem.unitPrice > 1_000_000_000
    ) {
      return NextResponse.json(
        { error: `Item ${index + 1} unit price must be a non-negative whole number of UGX.` },
        { status: 400 }
      );
    }

    items.push({
      description: description.value,
      quantity: rawItem.quantity,
      unitPrice: rawItem.unitPrice,
    });
  }

  const delivery = nonNegativeAmount(input.deliveryFee, "Delivery fee");
  const additional = nonNegativeAmount(input.additionalFees, "Additional fees");

  if (delivery.error || additional.error) {
    return NextResponse.json(
      { error: delivery.error ?? additional.error },
      { status: 400 }
    );
  }

  const estimatedCompletion = optionalText(
    input.estimatedCompletion,
    "Estimated completion",
    120
  );
  const paymentTerms = optionalText(input.paymentTerms, "Payment terms", 1000);
  const notes = optionalText(input.notes, "Notes", 3000);

  if (
    estimatedCompletion.error ||
    paymentTerms.error ||
    notes.error
  ) {
    return NextResponse.json(
      {
        error:
          estimatedCompletion.error ??
          paymentTerms.error ??
          notes.error,
      },
      { status: 400 }
    );
  }

  let validUntil: Date | undefined;

  if (input.validUntil !== undefined && input.validUntil !== "") {
    if (
      typeof input.validUntil !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.validUntil)
    ) {
      return NextResponse.json(
        { error: "Validity date must use YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    validUntil = new Date(`${input.validUntil}T23:59:59.999Z`);

    if (
      Number.isNaN(validUntil.getTime()) ||
      validUntil.toISOString().slice(0, 10) !== input.validUntil
    ) {
      return NextResponse.json(
        { error: "Validity date is invalid." },
        { status: 400 }
      );
    }

    if (validUntil.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Validity date must be today or a future date." },
        { status: 400 }
      );
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const totalAmount = subtotal + delivery.value + additional.value;

  if (
    !Number.isSafeInteger(subtotal) ||
    !Number.isSafeInteger(totalAmount) ||
    totalAmount > 2_000_000_000
  ) {
    return NextResponse.json(
      { error: "The quotation total is too large." },
      { status: 400 }
    );
  }

  const { id: customOrderId } = await params;

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const quotation = await prisma.$transaction(async (tx) => {
      const order = await tx.customOrder.findUnique({
        where: { id: customOrderId },
        select: { id: true, status: true },
      });

      if (!order) {
        throw new Error("CUSTOM_ORDER_NOT_FOUND");
      }

      if (!["PENDING", "REVIEWED", "QUOTED"].includes(order.status)) {
        throw new Error("ORDER_NOT_ELIGIBLE_FOR_QUOTATION");
      }

      const quotationNumber = `PCQ-${Date.now()}-${crypto.randomUUID()
        .replace(/-/g, "")
        .slice(0, 6)
        .toUpperCase()}`;

      return tx.customOrderQuotation.create({
        data: {
          customOrderId,
          quotationNumber,
          status: QuotationStatus.DRAFT,
          currency: "UGX",
          subtotal,
          deliveryFee: delivery.value,
          additionalFees: additional.value,
          totalAmount,
          estimatedCompletion: estimatedCompletion.value,
          paymentTerms: paymentTerms.value,
          notes: notes.value,
          validUntil,
          createdByName: admin.name,
          createdByEmail: admin.email,
          items: {
            create: items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.quantity * item.unitPrice,
            })),
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(
      {
        message: "Quotation draft saved successfully.",
        quotation,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "CUSTOM_ORDER_NOT_FOUND") {
      return NextResponse.json(
        { error: "Custom order not found." },
        { status: 404 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "ORDER_NOT_ELIGIBLE_FOR_QUOTATION"
    ) {
      return NextResponse.json(
        { error: "A quotation cannot be created for this order at its current status." },
        { status: 409 }
      );
    }

    console.error("Quotation draft creation failed:", error);
    return NextResponse.json(
      { error: "Unable to save quotation draft." },
      { status: 500 }
    );
  }
}
