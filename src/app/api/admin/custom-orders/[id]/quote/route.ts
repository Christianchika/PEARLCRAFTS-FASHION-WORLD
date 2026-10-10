import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_AMOUNT = 1_000_000_000;
const MAX_NOTES_LENGTH = 1000;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const adminUser = session.user;
  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const input = (typeof body === "object" && body !== null ? body : {}) as {
    quotedAmount?: unknown;
    quoteNotes?: unknown;
    quoteValidUntil?: unknown;
  };

  const { quotedAmount } = input;

  if (
    typeof quotedAmount !== "number" ||
    !Number.isInteger(quotedAmount) ||
    quotedAmount <= 0 ||
    quotedAmount > MAX_AMOUNT
  ) {
    return NextResponse.json(
      { error: "Price must be a whole number greater than zero." },
      { status: 400 }
    );
  }

  let quoteNotes: string | null = null;

  if (input.quoteNotes !== undefined && input.quoteNotes !== null) {
    if (typeof input.quoteNotes !== "string") {
      return NextResponse.json(
        { error: "Notes must be text." },
        { status: 400 }
      );
    }

    quoteNotes = input.quoteNotes.trim() || null;

    if (quoteNotes && quoteNotes.length > MAX_NOTES_LENGTH) {
      return NextResponse.json(
        { error: `Notes must be ${MAX_NOTES_LENGTH} characters or fewer.` },
        { status: 400 }
      );
    }
  }

  let quoteValidUntil: Date | null = null;

  if (
    input.quoteValidUntil !== undefined &&
    input.quoteValidUntil !== null &&
    input.quoteValidUntil !== ""
  ) {
    if (
      typeof input.quoteValidUntil !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.quoteValidUntil)
    ) {
      return NextResponse.json(
        { error: "Expiry date must be in YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    // End of the chosen day, so the quote stays valid all day.
    const date = new Date(`${input.quoteValidUntil}T23:59:59.000Z`);

    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid expiry date." },
        { status: 400 }
      );
    }

    if (date.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Expiry date cannot be in the past." },
        { status: 400 }
      );
    }

    quoteValidUntil = date;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.customOrder.findUnique({
        where: { id },
        select: { id: true, status: true },
      });

      if (!order) {
        return { error: "Custom order not found.", statusCode: 404 } as const;
      }

      // A first quote is given after review; a quote can be revised
      // while the customer has not yet accepted it.
      if (order.status !== "REVIEWED" && order.status !== "QUOTED") {
        return {
          error:
            order.status === "PENDING"
              ? "Mark this request as REVIEWED before sending a quotation."
              : `A quotation can no longer be changed for a ${order.status
                  .replace(/_/g, " ")
                  .toLowerCase()} order.`,
          statusCode: 409,
        } as const;
      }

      const updated = await tx.customOrder.update({
        where: { id },
        data: {
          quotedAmount,
          quoteNotes,
          quoteValidUntil,
          quotedAt: new Date(),
          status: "QUOTED",
        },
        select: {
          id: true,
          status: true,
          quotedAmount: true,
          quoteNotes: true,
          quoteValidUntil: true,
          quotedAt: true,
        },
      });

      if (order.status !== "QUOTED") {
        await tx.customOrderStatusHistory.create({
          data: {
            customOrderId: id,
            fromStatus: order.status,
            toStatus: "QUOTED",
            changedById: adminUser.id ?? null,
            changedByName: adminUser.name ?? null,
            changedByEmail: adminUser.email ?? null,
          },
        });
      }

      return { order: updated } as const;
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode }
      );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/custom-orders");
    revalidatePath(`/admin/custom-orders/${id}`);

    return NextResponse.json({
      message: "Quotation saved.",
      order: result.order,
    });
  } catch (error) {
    console.error("Failed to save quotation:", error);

    return NextResponse.json(
      { error: "Failed to save quotation." },
      { status: 500 }
    );
  }
}
