import { auth } from "../../../auth";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#fff8fc]">
      <AdminSidebar />

      <div className="min-h-screen lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-pink-100 bg-white/95 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between px-6 py-4 lg:px-8">
            <div className="pl-12 lg:pl-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
                PEARLCRAFTS
              </p>

              <p className="text-sm font-semibold text-[#35102f]">
                Fashion World Administration
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">
                Signed in as
              </p>

              <p className="text-sm font-bold text-[#35102f]">
                {session.user.email}
              </p>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
