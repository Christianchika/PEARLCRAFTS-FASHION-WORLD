import { NextResponse } from "next/server";
import { auth } from "@auth";
import { prisma } from "@/lib/prisma";

const STATUSES = [
  "PENDING",
  "REVIEWED",
  "QUOTED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

type Status = (typeof STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  PENDING: ["REVIEWED", "CANCELLED"],
  REVIEWED: ["QUOTED", "CANCELLED"],
  QUOTED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const adminUser = session.user;

  if (!adminUser) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const changedById = adminUser.id ?? null;
  const changedByName = adminUser.name ?? null;
  const changedByEmail = adminUser.email ?? null;

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

  const status =
    typeof body === "object" &&
    body !== null &&
    "status" in body &&
    typeof body.status === "string"
      ? body.status
      : null;

  if (!status || !STATUSES.includes(status as Status)) {
    return NextResponse.json(
      { error: "Invalid custom-order status." },
      { status: 400 }
    );
  }

  const requestedStatus = status as Status;

  if (requestedStatus === "QUOTED") {
    return NextResponse.json(
      {
        error:
          "Use the quotation form to set a price. The order moves to QUOTED when the quotation is saved.",
      },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.customOrder.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
        },
      });

      if (!existingOrder) {
        return {
          error: "Custom order not found.",
          statusCode: 404,
        } as const;
      }

      const currentStatus = existingOrder.status as Status;

      if (currentStatus === requestedStatus) {
        return {
          error: `Custom order is already ${requestedStatus}.`,
          statusCode: 409,
        } as const;
      }

      const allowedStatuses = ALLOWED_TRANSITIONS[currentStatus];

      if (!allowedStatuses.includes(requestedStatus)) {
        return {
          error: `Cannot change custom order from ${currentStatus} to ${requestedStatus}.`,
          allowedTransitions: allowedStatuses,
          statusCode: 409,
        } as const;
      }

      const updated = await tx.customOrder.update({
        where: { id },
        data: { status: requestedStatus },
        select: {
          id: true,
          status: true,
          updatedAt: true,
        },
      });

      await tx.customOrderStatusHistory.create({
        data: {
          customOrderId: id,
          fromStatus: currentStatus,
          toStatus: requestedStatus,
          changedById,
          changedByName,
          changedByEmail,
        },
      });

      return { order: updated } as const;
    });

    if ("error" in result) {
      return NextResponse.json(
        {
          error: result.error,
          ...("allowedTransitions" in result
            ? { allowedTransitions: result.allowedTransitions }
            : {}),
        },
        { status: result.statusCode }
      );
    }

    return NextResponse.json({
      message: "Custom order status updated and audit history recorded.",
      order: result.order,
    });
  } catch (error) {
    console.error("Custom-order status update failed:", error);

    return NextResponse.json(
      { error: "Unable to update custom-order status." },
      { status: 500 }
    );
  }
}
