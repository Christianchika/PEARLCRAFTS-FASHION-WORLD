import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type OrderRequest = {
  productId: string;
  quantity: number;
  deliveryMethod: string;
  notes?: string;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    location: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderRequest;

    const {
      productId,
      quantity,
      deliveryMethod,
      notes,
      customer,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product is required." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1." },
        { status: 400 }
      );
    }

    if (!customer?.fullName?.trim()) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!customer?.phone?.trim()) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }

    if (!customer?.location?.trim()) {
      return NextResponse.json(
        { error: "Delivery location is required." },
        { status: 400 }
      );
    }

    if (!["Delivery", "Pickup"].includes(deliveryMethod)) {
      return NextResponse.json(
        { error: "Invalid delivery method." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(
      async (transaction) => {
        const product = await transaction.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          return { status: "not_found" as const };
        }

        // Atomically check and reduce the available stock.
        const stockUpdate = await transaction.product.updateMany({
          where: {
            id: productId,
            stockQuantity: {
              gte: quantity,
            },
          },
          data: {
            stockQuantity: {
              decrement: quantity,
            },
          },
        });

        if (stockUpdate.count === 0) {
          const latestProduct =
            await transaction.product.findUnique({
              where: { id: productId },
              select: { stockQuantity: true },
            });

          return {
            status: "insufficient_stock" as const,
            available: latestProduct?.stockQuantity ?? 0,
          };
        }

        // Always use the price stored in PostgreSQL.
        const subtotal = product.price * quantity;
        const totalAmount = subtotal;

        const existingCustomer =
          await transaction.customer.findFirst({
            where: {
              phone: customer.phone.trim(),
            },
          });

        const savedCustomer =
          existingCustomer ??
          (await transaction.customer.create({
            data: {
              fullName: customer.fullName.trim(),
              phone: customer.phone.trim(),
              email: customer.email?.trim() || null,
              location: customer.location.trim(),
            },
          }));

        const savedOrder = await transaction.order.create({
          data: {
            customerId: savedCustomer.id,
            deliveryMethod,
            notes: notes?.trim() || null,
            status: "PENDING",
            totalAmount,
            items: {
              create: {
                productId: product.id,
                quantity,
                unitPrice: product.price,
                subtotal,
              },
            },
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
          order: savedOrder,
        };
      }
    );

    if (result.status === "not_found") {
      return NextResponse.json(
        { error: "The selected product was not found." },
        { status: 404 }
      );
    }

    if (result.status === "insufficient_stock") {
      return NextResponse.json(
        {
          error: `Only ${result.available} item(s) are currently available. Please update your order quantity.`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Order created successfully.",
        order: result.order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create order:", error);

    return NextResponse.json(
      {
        error: "Failed to create order. Please try again.",
      },
      { status: 500 }
    );
  }
}
