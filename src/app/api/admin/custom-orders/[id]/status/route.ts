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

  const existingOrder = await prisma.customOrder.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingOrder) {
    return NextResponse.json(
      { error: "Custom order not found." },
      { status: 404 }
    );
  }

  const updatedOrder = await prisma.customOrder.update({
    where: { id },
    data: {
      status: status as Status,
    },
    select: {
      id: true,
      status: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    message: "Custom order status updated.",
    order: updatedOrder,
  });
}
