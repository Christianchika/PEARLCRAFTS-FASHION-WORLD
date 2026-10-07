"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function AdminLogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="inline-flex items-center gap-2 rounded-full border-2 border-pink-600 px-5 py-2.5 text-sm font-bold text-pink-600 transition hover:bg-pink-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut size={17} />

      {loggingOut ? "Logging Out..." : "Logout"}
    </button>
  );
}
