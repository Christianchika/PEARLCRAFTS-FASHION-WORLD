import Link from "next/link";
import {
  Store,
  Contact,
  Share2,
  ClipboardList,
  Info,
  ArrowRight,
} from "lucide-react";

const settingsSections = [
  {
    title: "Store Information",
    description: "Your shop identity and business details.",
    icon: Store,
    items: [
      {
        label: "Store name",
        value: "PEARLCRAFTS FASHION WORLD",
        status: "Current",
      },
      {
        label: "Product focus",
        value: "Fascinators, headpieces and hair accessories",
        status: "Current",
      },
      {
        label: "Business address",
        value: "Not configured on this page",
        status: "Not configured",
      },
      {
        label: "Business hours",
        value: "Not configured on this page",
        status: "Not configured",
      },
    ],
  },
  {
    title: "Contact Information",
    description: "Contact details customers use to reach your business.",
    icon: Contact,
    items: [
      {
        label: "Business email",
        value: "Not configured on this page",
        status: "Not configured",
      },
      {
        label: "Business phone",
        value: "Not configured on this page",
        status: "Not configured",
      },
      {
        label: "WhatsApp number",
        value: "Not configured on this page",
        status: "Not configured",
      },
    ],
  },
  {
    title: "Social Media",
    description: "Your social profiles and links across the website.",
    icon: Share2,
    items: [
      {
        label: "Facebook",
        value: "Review the existing website link",
        status: "Managed elsewhere",
      },
      {
        label: "Instagram",
        value: "Review the existing website link",
        status: "Managed elsewhere",
      },
      {
        label: "TikTok",
        value: "Review the existing website link",
        status: "Managed elsewhere",
      },
    ],
  },
  {
    title: "Order Preferences",
    description: "An overview of your existing order-management tools.",
    icon: ClipboardList,
    items: [
      {
        label: "Online orders",
        value: "View orders and manage their statuses",
        status: "Available",
      },
      {
        label: "Custom orders",
        value: "Manage customer requests and quotations",
        status: "Available",
      },
      {
        label: "Order notifications",
        value: "Notification preferences are not configurable yet",
        status: "Not configured",
      },
      {
        label: "Delivery instructions",
        value: "Not configured on this page",
        status: "Not configured",
      },
    ],
  },
];

function getStatusClass(status: string) {
  switch (status) {
    case "Current":
      return "bg-green-50 text-green-700";
    case "Available":
      return "bg-purple-50 text-purple-700";
    case "Managed elsewhere":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

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
          Review your store information, contact details, social media
          and order-management preferences.
        </p>
      </section>

      <div
        role="status"
        className="mt-8 flex gap-3 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm"
      >
        <Info
          size={22}
          className="mt-0.5 shrink-0 text-pink-600"
          aria-hidden="true"
        />

        <div>
          <p className="font-bold text-[#35102f]">
            Settings overview — read only
          </p>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            This is the first version of Settings. It displays an overview
            of available and unconfigured information. Changes cannot be
            made or saved here yet. Your existing website configuration
            and admin features remain unchanged.
          </p>
        </div>
      </div>

      <section
        aria-label="Store settings overview"
        className="mt-8 grid gap-6 xl:grid-cols-2"
      >
        {settingsSections.map((section) => {
          const Icon = section.icon;

          return (
            <article
              key={section.title}
              className="overflow-hidden rounded-3xl bg-white shadow-sm"
            >
              <div className="border-b border-pink-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-pink-100 p-3 text-pink-600">
                    <Icon size={23} aria-hidden="true" />
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold text-[#35102f]">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100 px-6">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#35102f]">
                        {item.label}
                      </p>
                      <p className="mt-1 break-words text-sm leading-6 text-gray-600">
                        {item.value}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 p-6 text-white sm:p-8">
        <h2 className="text-xl font-extrabold">
          Manage your existing orders
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">
          Your current order-management features are still available.
          Use the links below to access them.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/orders"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-pink-700 transition hover:bg-pink-50"
          >
            Manage Orders
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <Link
            href="/admin/custom-orders"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Manage Custom Orders
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
