"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { socialLinks } from "@/lib/socials";
import Link from "next/link";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Collections", href: "/products" },
  { name: "Videos", href: "/videos" },
  { name: "About", href: "/#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("+256 782 595 996");

  useEffect(() => {
    let cancelled = false;

    async function loadWhatsAppNumber() {
      try {
        const response = await fetch("/api/public/settings", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled && typeof data.whatsappNumber === "string") {
          const number = data.whatsappNumber.trim();

          if (number) {
            setWhatsappNumber(number);
          }
        }
      } catch (error) {
        console.error("Failed to load WhatsApp number:", error);
      }
    }

    void loadWhatsAppNumber();

    return () => {
      cancelled = true;
    };
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;

  return (
    <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link href="/" className="group">
          <div className="bg-linear-to-r from-pink-600 via-fuchsia-500 to-purple-600 bg-clip-text text-xl font-extrabold tracking-wide text-transparent transition">
            PEARLCRAFTS
          </div>

          <div className="text-[10px] font-semibold tracking-[0.35em] text-purple-600">
            FASHION WORLD
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold text-gray-700 transition hover:text-pink-600"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {/* WhatsApp: external link */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-purple-600 px-5 py-2.5 text-sm font-semibold text-purple-600 transition hover:bg-purple-600 hover:text-white"
          >
            WhatsApp
          </a>

          {/* Order Now */}
          <Link
            href="/products"
            className="rounded-full bg-linear-to-r from-pink-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:from-pink-700 hover:to-purple-700 hover:shadow-lg"
          >
            Order Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-purple-600 transition hover:bg-pink-50 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-pink-100 bg-white px-6 py-5 shadow-lg md:hidden">
          <nav className="flex flex-col gap-5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-semibold text-gray-700 transition hover:text-pink-600"
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile WhatsApp: external link */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-full border-2 border-purple-600 px-6 py-3 text-center font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
            >
              WhatsApp
            </a>

            {/* Mobile Order Now */}
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="rounded-full bg-linear-to-r from-pink-600 to-purple-600 px-6 py-3 text-center font-bold text-white shadow-md"
            >
              Order Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}