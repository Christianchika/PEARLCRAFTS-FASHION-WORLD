"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ShoppingBag,
  Package,
  Users,
  Video,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

import { signOut } from "next-auth/react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: ShoppingBag,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: Package,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  
  {
    name: "Videos",
    href: "/admin/videos",
    icon: Video,
  },
  {
    name: "Custom Orders",
    href: "/admin/custom-orders",
    icon: Sparkles,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    await signOut({
      callbackUrl: "/login",
    });
  }

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 p-3 text-white shadow-lg lg:hidden"
        aria-label="Open admin menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-pink-100 bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="border-b border-pink-100 px-6 py-6">
          <div className="flex items-start justify-between">
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
            >
              <p className="bg-gradient-to-r from-pink-600 via-fuchsia-500 to-purple-600 bg-clip-text text-xl font-extrabold tracking-wide text-transparent">
                PEARLCRAFTS
              </p>

              <p className="mt-1 text-[10px] font-bold tracking-[0.35em] text-purple-600">
                FASHION WORLD
              </p>

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                Admin Panel
              </p>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-pink-50 hover:text-pink-600 lg:hidden"
              aria-label="Close admin menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-pink-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-pink-600 transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={19} />

            {loggingOut ? "Logging Out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}