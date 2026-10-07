import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof allowedStatuses)[number];

type UpdateStatusRequest = {
  orderId?: string;
  status?: string;
};

class InventoryError extends Error {
  constructor(
    message: string,
    public available: number
  ) {
    super(message);
    this.name = "InventoryError";
  }
}

class OrderConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderConflictError";
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body =
      (await request.json()) as UpdateStatusRequest;

    const orderId = body.orderId?.trim();
    const status = body.status;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    if (
      !status ||
      !allowedStatuses.includes(status as OrderStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid order status." },
        { status: 400 }
      );
    }

    const newStatus = status as OrderStatus;

    const result = await prisma.$transaction(
      async (transaction) => {
        const existingOrder =
          await transaction.order.findUnique({
            where: { id: orderId },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          });

        if (!existingOrder) {
          return { status: "not_found" as const };
        }

        const previousStatus = existingOrder.status;

        if (previousStatus === newStatus) {
          return {
            status: "unchanged" as const,
            order: existingOrder,
          };
        }

        if (
          previousStatus === "COMPLETED" &&
          newStatus === "CANCELLED"
        ) {
          return {
            status: "invalid_transition" as const,
            message:
              "A completed order cannot be cancelled. Contact the administrator to handle a completed-order return.",
          };
        }

        if (
          previousStatus === "CANCELLED" &&
          newStatus !== "PENDING"
        ) {
          return {
            status: "invalid_transition" as const,
            message:
              "A cancelled order must first be reopened as PENDING.",
          };
        }

        // Claim the transition to prevent duplicate inventory changes.
        const statusUpdate =
          await transaction.order.updateMany({
            where: {
              id: orderId,
              status: previousStatus,
            },
            data: {
              status: newStatus,
            },
          });

        if (statusUpdate.count !== 1) {
          throw new OrderConflictError(
            "This order was updated by another request. Refresh and try again."
          );
        }

        // Restore stock when an order is cancelled.
        if (newStatus === "CANCELLED") {
          for (const item of existingOrder.items) {
            await transaction.product.update({
              where: {
                id: item.productId,
              },
              data: {
                stockQuantity: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        // Deduct stock again when a cancelled order is reopened.
        if (previousStatus === "CANCELLED") {
          for (const item of existingOrder.items) {
            const stockUpdate =
              await transaction.product.updateMany({
                where: {
                  id: item.productId,
                  stockQuantity: {
                    gte: item.quantity,
                  },
                },
                data: {
                  stockQuantity: {
                    decrement: item.quantity,
                  },
                },
              });

            if (stockUpdate.count !== 1) {
              const product =
                await transaction.product.findUnique({
                  where: {
                    id: item.productId,
                  },
                  select: {
                    stockQuantity: true,
                    name: true,
                  },
                });

              throw new InventoryError(
                `Cannot reopen this order. ${product?.name ?? "A product"} has insufficient stock.`,
                product?.stockQuantity ?? 0
              );
            }
          }
        }

        const updatedOrder =
          await transaction.order.findUniqueOrThrow({
            where: {
              id: orderId,
            },
            include: {
              customer: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          });

        return {
          status: "success" as const,
          order: updatedOrder,
        };
      },
      {
        isolationLevel: "Serializable",
      }
    );

    if (result.status === "not_found") {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    if (result.status === "invalid_transition") {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    if (result.status === "unchanged") {
      return NextResponse.json({
        message: "Order status is unchanged.",
        order: result.order,
      });
    }

    return NextResponse.json({
      message: "Order status updated successfully.",
      order: result.order,
    });
  } catch (error) {
    if (error instanceof InventoryError) {
      return NextResponse.json(
        {
          error: error.message,
          available: error.available,
        },
        { status: 409 }
      );
    }

    if (error instanceof OrderConflictError) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        {
          error:
            "Another transaction changed this order or its stock. Refresh and try again.",
        },
        { status: 409 }
      );
    }

    console.error(
      "Failed to update order status:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update order status.",
      },
      { status: 500 }
    );
  }
}
