import { NextResponse } from "next/server";
import { auth } from "@auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SETTINGS_ID = "store-settings";

const DEFAULT_SETTINGS = {
  storeName: "PEARLCRAFTS FASHION WORLD",
  productFocus: "Fascinators, headpieces and hair accessories",
  businessAddress: "",
  businessHours: "",
  businessEmail: "info@pearlcrafts.com",
  businessPhone: "+256 782 595 996",
  whatsappNumber: "+256 782 595 996",
  facebookUrl: "https://www.facebook.com/pearlcraftsfashionworld",
  instagramUrl: "https://www.instagram.com/pearlcrafts.fw_ug",
  tiktokUrl: "https://www.tiktok.com/@pearlcraftsfashionworld",
  orderNotificationsEnabled: false,
  deliveryInstructions: "",
};

const STRING_LIMITS = {
  storeName: 120,
  productFocus: 300,
  businessAddress: 500,
  businessHours: 300,
  businessEmail: 254,
  businessPhone: 50,
  whatsappNumber: 50,
  facebookUrl: 500,
  instagramUrl: 500,
  tiktokUrl: 500,
  deliveryInstructions: 2000,
} as const;

function isValidWebUrl(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function verifyAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      ),
      admin: null,
    };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });

  if (!admin) {
    return {
      response: NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      ),
      admin: null,
    };
  }

  return { response: null, admin };
}

export async function GET() {
  try {
    const access = await verifyAdmin();

    if (access.response) return access.response;

    const settings = await prisma.storeSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Loading store settings failed:", error);

    return NextResponse.json(
      { error: "Unable to load store settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const access = await verifyAdmin();

    if (access.response) return access.response;

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
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A settings object is required." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;

    const allowedFields = new Set([
      ...Object.keys(STRING_LIMITS),
      "orderNotificationsEnabled",
    ]);

    const unknownField = Object.keys(input).find(
      (field) => !allowedFields.has(field)
    );

    if (unknownField) {
      return NextResponse.json(
        { error: `Unrecognized settings field: ${unknownField}.` },
        { status: 400 }
      );
    }

    for (const [field, limit] of Object.entries(STRING_LIMITS)) {
      const value = input[field];

      if (typeof value !== "string") {
        return NextResponse.json(
          { error: `${field} must be text.` },
          { status: 400 }
        );
      }

      if (value.trim().length > limit) {
        return NextResponse.json(
          { error: `${field} exceeds the ${limit}-character limit.` },
          { status: 400 }
        );
      }
    }

    if (typeof input.orderNotificationsEnabled !== "boolean") {
      return NextResponse.json(
        { error: "The order notification preference must be true or false." },
        { status: 400 }
      );
    }

    const email = (input.businessEmail as string).trim();

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Enter a valid business email address or leave it blank." },
        { status: 400 }
      );
    }

    for (const field of [
      "facebookUrl",
      "instagramUrl",
      "tiktokUrl",
    ] as const) {
      const value = (input[field] as string).trim();

      if (!isValidWebUrl(value)) {
        return NextResponse.json(
          {
            error: `${field} must be a valid HTTP or HTTPS URL, or blank.`,
          },
          { status: 400 }
        );
      }
    }

    const data = {
      storeName: (input.storeName as string).trim(),
      productFocus: (input.productFocus as string).trim(),
      businessAddress: (input.businessAddress as string).trim(),
      businessHours: (input.businessHours as string).trim(),
      businessEmail: email,
      businessPhone: (input.businessPhone as string).trim(),
      whatsappNumber: (input.whatsappNumber as string).trim(),
      facebookUrl: (input.facebookUrl as string).trim(),
      instagramUrl: (input.instagramUrl as string).trim(),
      tiktokUrl: (input.tiktokUrl as string).trim(),
      orderNotificationsEnabled: input.orderNotificationsEnabled,
      deliveryInstructions: (
        input.deliveryInstructions as string
      ).trim(),
    };

    if (!data.storeName) {
      return NextResponse.json(
        { error: "Store name cannot be blank." },
        { status: 400 }
      );
    }

    const settings = await prisma.storeSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        ...DEFAULT_SETTINGS,
        ...data,
      },
      update: data,
    });

    return NextResponse.json({
      message: "Store settings saved successfully.",
      settings,
    });
  } catch (error) {
    console.error("Saving store settings failed:", error);

    return NextResponse.json(
      { error: "Unable to save store settings." },
      { status: 500 }
    );
  }
}
