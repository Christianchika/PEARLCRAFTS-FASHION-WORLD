"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Collections", href: "#collections" },
  { name: "Gallery", href: "#gallery" },
  { name: "Videos", href: "#videos" },
  { name: "About", href: "#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <a href="/" className="group">
          <div className="text-xl font-bold tracking-wide">
            PEARLCRAFTS
          </div>

          <div className="text-[10px] font-medium tracking-[0.35em] text-gray-500">
            FASHION WORLD
          </div>
        </a>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-700 transition hover:text-black"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Desktop order button */}
        <a
          href="#order"
          className="hidden rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 md:block"
        >
          Order Now
        </a>

        {/* Mobile button */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {open && (
        <div className="border-t bg-white px-6 py-5 md:hidden">
          <nav className="flex flex-col gap-5">

            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-medium text-gray-700"
              >
                {item.name}
              </a>
            ))}

            <a
              href="#order"
              onClick={() => setOpen(false)}
              className="rounded-full bg-black px-6 py-3 text-center font-semibold text-white"
            >
              Order Now
            </a>

          </nav>
        </div>
      )}
    </header>
  );
}