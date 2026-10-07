import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

type CreateProductRequest = {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  colour?: string | null;
  stockQuantity?: number;
  imageUrl?: string;
  isFeatured?: boolean;
};

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      (await request.json()) as CreateProductRequest;

    const name = body.name?.trim();
    const description = body.description?.trim();
    const category = body.category?.trim();
    const imageUrl = body.imageUrl?.trim();
    const colour = body.colour?.trim() || null;

    const price = body.price;
    const stockQuantity = body.stockQuantity;

    if (!name) {
      return NextResponse.json(
        {
          error: "Product name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          error: "Product description is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof price !== "number" ||
      !Number.isInteger(price) ||
      price < 0
    ) {
      return NextResponse.json(
        {
          error: "Price must be a valid whole number.",
        },
        {
          status: 400,
        }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          error: "Category is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof stockQuantity !== "number" ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Stock quantity must be a valid whole number.",
        },
        {
          status: 400,
        }
      );
    }

    if (!imageUrl) {
  return NextResponse.json(
    { error: "Product image is required." },
    { status: 400 }
  );
}

const isValidImagePath =
  imageUrl.startsWith("/products/") ||
  imageUrl.startsWith("http://") ||
  imageUrl.startsWith("https://");

if (!isValidImagePath) {
  return NextResponse.json(
    {
      error:
        "Image must be a /products/... path or a valid http/https URL.",
    },
    { status: 400 }
  );
}

    const productId = `${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        id: productId,
        name,
        description,
        price,
        category,
        colour,
        stockQuantity,
        imageUrl,
        isFeatured: Boolean(body.isFeatured),
      },
    });

    return NextResponse.json(
      {
        message: "Product created successfully.",
        product,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Failed to create product:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create product.",
      },
      {
        status: 500,
      }
    );
  }
}
