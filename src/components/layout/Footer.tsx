
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { socialLinks } from "@/lib/socials";

const DEFAULTS = {
  storeName: "PEARLCRAFTS FASHION WORLD",
  productFocus: "Fascinators, headpieces and hair accessories",
  businessAddress: "",
  businessHours: "",
  businessEmail: "info@pearlcrafts.com",
  businessPhone: "+256 782 595 996",
  whatsappNumber: "+256 782 595 996",
  facebookUrl: socialLinks.facebook,
  instagramUrl: socialLinks.instagram,
  tiktokUrl: socialLinks.tiktok,
};

export default async function Footer() {
  let savedSettings: Awaited<
    ReturnType<typeof prisma.storeSettings.findUnique>
  > = null;

  try {
    savedSettings = await prisma.storeSettings.findUnique({
      where: { id: "store-settings" },
    });
  } catch (error) {
    console.error("Unable to load footer settings:", error);
  }

  const settings = {
    storeName: savedSettings?.storeName || DEFAULTS.storeName,
    productFocus: savedSettings?.productFocus || DEFAULTS.productFocus,
    businessAddress:
      savedSettings?.businessAddress || DEFAULTS.businessAddress,
    businessEmail:
      savedSettings?.businessEmail || DEFAULTS.businessEmail,
    businessPhone:
      savedSettings?.businessPhone || DEFAULTS.businessPhone,
    whatsappNumber:
      savedSettings?.whatsappNumber || DEFAULTS.whatsappNumber,
    facebookUrl:
      savedSettings?.facebookUrl || DEFAULTS.facebookUrl,
    instagramUrl:
      savedSettings?.instagramUrl || DEFAULTS.instagramUrl,
    tiktokUrl: savedSettings?.tiktokUrl || DEFAULTS.tiktokUrl,
    businessHours: savedSettings?.businessHours || DEFAULTS.businessHours,
  };

  const whatsappDigits = settings.whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}`
    : socialLinks.whatsapp;

  const phoneHref = settings.businessPhone.replace(/[^\d+]/g, "");
  const emailHref = `mailto:${settings.businessEmail}`;

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold tracking-wide">
            {settings.storeName}
          </h2>

          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
            {settings.productFocus}
          </p>

          <p className="mt-5 max-w-md leading-7 text-gray-600">
            Beautifully crafted {settings.productFocus.toLowerCase()}{" "}
            designed to make every occasion special.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold">Quick Links</h3>

          <div className="mt-5 flex flex-col gap-3 text-sm text-gray-600">
            <Link href="/" className="transition hover:text-black">
              Home
            </Link>

            <Link
              href="/#collections"
              className="transition hover:text-black"
            >
              Collections
            </Link>

            <Link
              href="/#videos"
              className="transition hover:text-black"
            >
              Videos
            </Link>

            <Link
              href="/#about"
              className="transition hover:text-black"
            >
              About Us
            </Link>

            <Link
              href="/custom-order"
              className="transition hover:text-black"
            >
              Place an Order
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold">Contact</h3>

          <div className="mt-5 flex flex-col gap-4 text-sm text-gray-600">
            <a
              href={`tel:${phoneHref}`}
              className="flex items-center gap-3 transition hover:text-black"
            >
              <Phone size={17} aria-hidden="true" />
              <span>{settings.businessPhone}</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 transition hover:text-black"
            >
              <MessageCircle size={17} aria-hidden="true" />
              <span>WhatsApp</span>
            </a>

            <a
              href={emailHref}
              className="flex items-center gap-3 transition hover:text-black"
            >
              <Mail size={17} aria-hidden="true" />
              <span className="break-all">
                {settings.businessEmail}
              </span>
            </a>
          </div>
          
          {settings.businessAddress && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900">
                Business Address
              </h3>
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-gray-600">
                {settings.businessAddress}
              </p>
            </div>
          )}

          {settings.businessHours && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900">
                Business Days & Hours
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                {settings.businessHours}
              </p>
            </div>
          )}

          {/* Social Media */}

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={settings.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border px-4 py-3 text-sm font-medium transition hover:bg-gray-100"
              aria-label="TikTok"
            >
              TikTok
            </a>

            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border px-4 py-3 text-sm font-medium transition hover:bg-gray-100"
              aria-label="Instagram"
            >
              Instagram
            </a>

            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border px-4 py-3 text-sm font-medium transition hover:bg-gray-100"
              aria-label="Facebook"
            >
              Facebook
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border px-4 py-3 text-sm font-medium transition hover:bg-gray-100"
              aria-label="WhatsApp"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 py-6 text-xs text-gray-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.storeName}.
            {" "}All rights reserved.
          </p>

          <p>Handmade with care.</p>
        </div>
      </div>
    </footer>
  );
}
