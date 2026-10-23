
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Info,
  Settings2,
  Store,
} from "lucide-react";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";

export default function AdminSettingsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-600">
          Business Configuration
        </p>

        <h1 className="mt-2 text-3xl font-extrabold text-[#35102f] sm:text-4xl">
          Settings
        </h1>

        <p className="mt-2 max-w-2xl text-gray-600">
          Manage your store information, customer contact details,
          social media accounts and order preferences.
        </p>
      </section>

      <div
        role="note"
        className="mt-8 flex gap-3 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm"
      >
        <Info
          size={22}
          className="mt-0.5 shrink-0 text-pink-600"
          aria-hidden="true"
        />

        <div>
          <p className="font-bold text-[#35102f]">
            Your store settings
          </p>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Update your business details below and save your changes.
            Your settings are stored in the database. Public website
            integration will be checked separately.
          </p>
        </div>
      </div>

      <section
        aria-label="Editable store settings"
        className="mt-8"
      >
        <AdminSettingsForm />
      </section>

      <section className="mt-8 rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 p-6 text-white sm:p-8">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white/15 p-3">
            <Settings2 size={24} aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold">
              Manage your existing orders
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">
              Your existing order-management and custom-order
              quotation features remain available.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/orders"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-pink-700 transition hover:bg-pink-50"
          >
            <ClipboardList size={16} aria-hidden="true" />
            Manage Orders
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <Link
            href="/admin/custom-orders"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            <Store size={16} aria-hidden="true" />
            Manage Custom Orders
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
