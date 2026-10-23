
"use client";

import { useCallback, useEffect, useState } from "react";

type StoreSettings = {
  storeName: string;
  productFocus: string;
  businessAddress: string;
  businessHours: string;
  businessEmail: string;
  businessPhone: string;
  whatsappNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  orderNotificationsEnabled: boolean;
  deliveryInstructions: string;
};

const initialSettings: StoreSettings = {
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

type ApiResponse = {
  settings?: Partial<StoreSettings>;
  message?: string;
  error?: string;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const labelClass = "block text-sm font-medium text-gray-700";

function SettingsField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  maxLength,
}: {
  label: string;
  name: keyof StoreSettings;
  value: string;
  onChange: (name: keyof StoreSettings, value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        className={inputClass}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
      />
    </label>
  );
}

export default function AdminSettingsForm() {
  const [settings, setSettings] =
    useState<StoreSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = useCallback(
    (name: keyof StoreSettings, value: string | boolean) => {
      setSettings((current) => ({
        ...current,
        [name]: value,
      }));
      setSuccess("");
      setError("");
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings", {
          method: "GET",
          cache: "no-store",
        });

        const result = (await response.json()) as ApiResponse;

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load store settings."
          );
        }

        if (!result.settings) {
          throw new Error("The server returned no settings.");
        }

        if (!cancelled) {
          setSettings({
            ...initialSettings,
            ...result.settings,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load store settings."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  storeName: settings.storeName,
  productFocus: settings.productFocus,
  businessAddress: settings.businessAddress,
  businessHours: settings.businessHours,
  businessEmail: settings.businessEmail,
  businessPhone: settings.businessPhone,
  whatsappNumber: settings.whatsappNumber,
  facebookUrl: settings.facebookUrl,
  instagramUrl: settings.instagramUrl,
  tiktokUrl: settings.tiktokUrl,
  orderNotificationsEnabled: settings.orderNotificationsEnabled,
  deliveryInstructions: settings.deliveryInstructions,
}),
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to save store settings."
        );
      }

      if (result.settings) {
        setSettings({
          ...initialSettings,
          ...result.settings,
        });
      }

      setSuccess(result.message || "Settings saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-pink-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-pink-100 border-t-pink-600" />
        <p className="mt-4 text-sm text-gray-600">
          Loading your store settings...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Store Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your shop name and business details.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <SettingsField
            label="Store Name"
            name="storeName"
            value={settings.storeName}
            onChange={updateField}
            required
            maxLength={120}
          />

          <SettingsField
            label="Product Focus"
            name="productFocus"
            value={settings.productFocus}
            onChange={updateField}
            placeholder="Fascinators, headpieces and hair accessories"
            maxLength={300}
          />

          <SettingsField
            label="Business Address"
            name="businessAddress"
            value={settings.businessAddress}
            onChange={updateField}
            placeholder="Enter your business address"
            maxLength={500}
          />

          <SettingsField
            label="Business Hours"
            name="businessHours"
            value={settings.businessHours}
            onChange={updateField}
            placeholder="e.g. Monday–Saturday, 9 AM–6 PM"
            maxLength={300}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Contact Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update the contact details customers can use to reach you.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <SettingsField
            label="Business Email"
            name="businessEmail"
            type="email"
            value={settings.businessEmail}
            onChange={updateField}
            placeholder="you@example.com"
            maxLength={254}
          />

          <SettingsField
            label="Business Phone"
            name="businessPhone"
            value={settings.businessPhone}
            onChange={updateField}
            placeholder="+256..."
            maxLength={50}
          />

          <SettingsField
            label="WhatsApp Number"
            name="whatsappNumber"
            value={settings.whatsappNumber}
            onChange={updateField}
            placeholder="+256..."
            maxLength={50}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Social Media
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter the full URLs for your official social accounts.
          </p>
        </div>

        <div className="space-y-5">
          <SettingsField
            label="Facebook URL"
            name="facebookUrl"
            type="url"
            value={settings.facebookUrl}
            onChange={updateField}
            placeholder="https://www.facebook.com/..."
            maxLength={500}
          />

          <SettingsField
            label="Instagram URL"
            name="instagramUrl"
            type="url"
            value={settings.instagramUrl}
            onChange={updateField}
            placeholder="https://www.instagram.com/..."
            maxLength={500}
          />

          <SettingsField
            label="TikTok URL"
            name="tiktokUrl"
            type="url"
            value={settings.tiktokUrl}
            onChange={updateField}
            placeholder="https://www.tiktok.com/@..."
            maxLength={500}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Order Preferences
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Set your order preferences and delivery instructions.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-pink-100 bg-pink-50/50 p-4">
          <input
            type="checkbox"
            checked={settings.orderNotificationsEnabled}
            onChange={(event) =>
              updateField(
                "orderNotificationsEnabled",
                event.target.checked
              )
            }
            className="mt-1 h-4 w-4 accent-pink-600"
          />
          <span>
            <span className="block text-sm font-medium text-gray-800">
              Enable order notifications
            </span>
            <span className="mt-1 block text-sm text-gray-500">
              Save your preference for receiving order notifications.
              This setting does not send notifications by itself.
            </span>
          </span>
        </label>

        <label className={`${labelClass} mt-5`}>
          Delivery Instructions
          <textarea
            className={inputClass}
            name="deliveryInstructions"
            rows={4}
            maxLength={2000}
            value={settings.deliveryInstructions}
            onChange={(event) =>
              updateField(
                "deliveryInstructions",
                event.target.value
              )
            }
            placeholder="Enter delivery arrangements or instructions for customers..."
          />
        </label>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          Changes are saved to your store settings database.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-pink-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving Settings..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
