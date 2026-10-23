
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_WHATSAPP_NUMBER = "+256 782 595 996";

export async function GET() {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "store-settings" },
      select: { whatsappNumber: true },
    });

    const whatsappNumber =
      settings?.whatsappNumber?.trim() || DEFAULT_WHATSAPP_NUMBER;

    return NextResponse.json(
      { whatsappNumber },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch public WhatsApp settings:", error);

    return NextResponse.json(
      { whatsappNumber: DEFAULT_WHATSAPP_NUMBER },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
