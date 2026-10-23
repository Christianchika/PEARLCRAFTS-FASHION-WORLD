"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  FileText,
  RefreshCw,
  Copy,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

type QuoteItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

type SavedQuoteItem = QuoteItem & {
  id: string;
  lineTotal: number;
};

type Quotation = {
  id: string;
  quotationNumber: string;
  status: string;
  currency: string;
  subtotal: number;
  deliveryFee: number;
  additionalFees: number;
  totalAmount: number;
  estimatedCompletion: string | null;
  paymentTerms: string | null;
  notes: string | null;
  validUntil: string | null;
  createdAt: string;
  items: SavedQuoteItem[];
};

type Props = {
  orderId: string;
  orderItemType: string;
  customerName: string;
  customerPhone: string;
};

const initialItem = (description = ""): QuoteItem => ({
  description,
  quantity: 1,
  unitPrice: 0,
});

function formatUGX(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusStyle(status: string) {
  switch (status) {
    case "SENT":
      return "bg-blue-100 text-blue-700";
    case "ACCEPTED":
      return "bg-emerald-100 text-emerald-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "EXPIRED":
      return "bg-gray-200 text-gray-600";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

export default function CustomOrderQuotationManager({
  orderId,
  orderItemType,
  customerName,
  customerPhone,
}: Props) {

  const router = useRouter();

  const [items, setItems] = useState<QuoteItem[]>([
    initialItem(orderItemType),
  ]);
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [additionalFees, setAdditionalFees] = useState("0");
  const [estimatedCompletion, setEstimatedCompletion] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(
    "Please confirm the quotation and agreed payment arrangements before production begins."
  );
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sharingQuoteId, setSharingQuoteId] = useState<string | null>(null);
const [shareLinks, setShareLinks] = useState<Record<string, string>>({});

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      ),
    [items]
  );

  const total =
    subtotal +
    (Number(deliveryFee) || 0) +
    (Number(additionalFees) || 0);

  const loadQuotations = useCallback(async () => {
  setLoadingQuotes(true);
  setError("");

  try {
    const response = await fetch(
      `/api/admin/custom-orders/${orderId}/quotations`,
      { cache: "no-store" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load quotations.");
    }

    setQuotations(data.quotations ?? []);
  } catch (loadError) {
    setError(
      loadError instanceof Error
        ? loadError.message
        : "Could not load quotations."
    );
  } finally {
    setLoadingQuotes(false);
  }
}, [orderId]);

useEffect(() => {
  let cancelled = false;

  async function fetchQuotations() {
    try {
      const response = await fetch(
        `/api/admin/custom-orders/${orderId}/quotations`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load quotations.");
      }

      if (!cancelled) {
        setQuotations(data.quotations ?? []);
        setError("");
      }
    } catch (loadError) {
      if (!cancelled) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load quotations."
        );
      }
    } finally {
      if (!cancelled) {
        setLoadingQuotes(false);
      }
    }
  }

  void fetchQuotations();

  return () => {
    cancelled = true;
  };
}, [orderId]);

  function updateItem(
    index: number,
    field: keyof QuoteItem,
    value: string
  ) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === "description") {
          return { ...item, description: value };
        }

        const numericValue = value === "" ? 0 : Number(value);

        return {
          ...item,
          [field]: Number.isFinite(numericValue)
            ? Math.max(0, numericValue)
            : 0,
        };
      })
    );
  }

  function addItem() {
    setItems((current) => [...current, initialItem()]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter((_, itemIndex) => itemIndex !== index)
    );
  }
  
  async function generateCustomerLink(quote: Quotation) {
    setSharingQuoteId(quote.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/quotations/${encodeURIComponent(quote.id)}/share`,
        {
          method: "POST",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to generate the customer quotation link."
        );
      }

      if (typeof data.quotationUrl !== "string") {
        throw new Error("The server did not return a quotation link.");
      }

      setShareLinks((current) => ({
        ...current,
        [quote.id]: data.quotationUrl,
      }));

      setMessage(
        `Customer link generated for ${quote.quotationNumber}. The quotation status is now SENT. You still need to share the link with the customer.`
      );

      await loadQuotations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate the customer quotation link."
      );
    } finally {
      setSharingQuoteId(null);
    }
  }

  async function copyCustomerLink(quoteId: string) {
    const link = shareLinks[quoteId];

    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setMessage("Customer quotation link copied to the clipboard.");
      setError("");
    } catch {
      setError(
        "Could not copy the link automatically. Select and copy the link displayed below."
      );
    }
  }

  function getWhatsAppUrl(link: string) {
    const digits = customerPhone.replace(/\D/g, "");
    let phone = digits;

    if (phone.startsWith("00")) {
      phone = phone.slice(2);
    }

    if (phone.startsWith("0")) {
      phone = `256${phone.slice(1)}`;
    } else if (phone.length === 9) {
      phone = `256${phone}`;
    }

    const text = [
      `Hello ${customerName},`,
      "Your PearlCrafts quotation is ready.",
      `Quotation link: ${link}`,
      "Please review it and select Accept or Decline.",
    ].join("\n");

    const base = phone
      ? `https://wa.me/${phone}`
      : "https://wa.me/";

    return `${base}?text=${encodeURIComponent(text)}`;
  }


  async function saveDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    if (
      !items.every(
        (item) =>
          item.description.trim().length > 0 &&
          Number.isSafeInteger(item.quantity) &&
          item.quantity >= 1 &&
          Number.isSafeInteger(item.unitPrice) &&
          item.unitPrice >= 0
      )
    ) {
      setError(
        "Each item needs a description, a whole-number quantity of at least 1, and a non-negative whole-number price."
      );
      setSaving(false);
      return;
    }

    if (
      !Number.isSafeInteger(Number(deliveryFee)) ||
      Number(deliveryFee) < 0 ||
      !Number.isSafeInteger(Number(additionalFees)) ||
      Number(additionalFees) < 0
    ) {
      setError("Delivery and additional fees must be non-negative whole numbers.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/custom-orders/${orderId}/quotations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            deliveryFee: Number(deliveryFee),
            additionalFees: Number(additionalFees),
            estimatedCompletion,
            paymentTerms,
            notes,
            validUntil,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save quotation.");
      }

      setMessage(
        `Draft ${data.quotation.quotationNumber} saved successfully. It has not been sent to the customer.`
      );

      setItems([initialItem(orderItemType)]);
      setDeliveryFee("0");
      setAdditionalFees("0");
      setEstimatedCompletion("");
      setPaymentTerms(
        "Please confirm the quotation and agreed payment arrangements before production begins."
      );
      setNotes("");
      setValidUntil("");

      await loadQuotations();
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save quotation."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#35102f]">
              Create Quotation
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Prepare an itemized quotation for this custom design request.
              Saving creates a draft; it does not send it.
            </p>
          </div>
          <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-purple-800">
            Currency: UGX
          </span>
        </div>

        <form onSubmit={saveDraft} className="mt-6 space-y-5">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="font-bold text-gray-800">Quotation items</h4>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-bold text-purple-800 hover:bg-purple-100"
              >
                <Plus size={16} />
                Add item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-700">
                      Item {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      aria-label={`Remove item ${index + 1}`}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <label className="block text-xs font-bold text-gray-600">
                    Description
                    <input
                      required
                      maxLength={300}
                      value={item.description}
                      onChange={(event) =>
                        updateItem(index, "description", event.target.value)
                      }
                      placeholder="e.g. Handmade pearl fascinator"
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </label>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <label className="block text-xs font-bold text-gray-600">
                      Quantity
                      <input
                        required
                        type="number"
                        min={1}
                        max={10000}
                        step={1}
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(index, "quantity", event.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-purple-500"
                      />
                    </label>

                    <label className="block text-xs font-bold text-gray-600">
                      Unit price (UGX)
                      <input
                        required
                        type="number"
                        min={0}
                        max={1000000000}
                        step={1}
                        value={item.unitPrice}
                        onChange={(event) =>
                          updateItem(index, "unitPrice", event.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-purple-500"
                      />
                    </label>

                    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                      <p className="text-xs font-bold text-gray-500">
                        Line total
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-[#35102f]">
                        {formatUGX(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold text-gray-600">
              Delivery fee (UGX)
              <input
                type="number"
                min={0}
                step={1}
                required
                value={deliveryFee}
                onChange={(event) => setDeliveryFee(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-purple-500"
              />
            </label>

            <label className="block text-xs font-bold text-gray-600">
              Additional fees (UGX)
              <input
                type="number"
                min={0}
                step={1}
                required
                value={additionalFees}
                onChange={(event) => setAdditionalFees(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-purple-500"
              />
            </label>

            <label className="block text-xs font-bold text-gray-600">
              Estimated completion
              <input
                maxLength={120}
                value={estimatedCompletion}
                onChange={(event) => setEstimatedCompletion(event.target.value)}
                placeholder="e.g. 5–7 working days after confirmation"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-purple-500"
              />
            </label>

            <label className="block text-xs font-bold text-gray-600">
              Quotation valid until
              <input
                type="date"
                value={validUntil}
                onChange={(event) => setValidUntil(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-purple-500"
              />
            </label>
          </div>

          <label className="block text-xs font-bold text-gray-600">
            Payment terms
            <textarea
              rows={3}
              maxLength={1000}
              value={paymentTerms}
              onChange={(event) => setPaymentTerms(event.target.value)}
              placeholder="Enter deposit requirements and payment arrangements"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-purple-500"
            />
          </label>

          <label className="block text-xs font-bold text-gray-600">
            Notes for the customer
            <textarea
              rows={3}
              maxLength={3000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional details about materials, design, or the quotation"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-purple-500"
            />
          </label>

          <div className="rounded-2xl border border-purple-100 bg-white p-5">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatUGX(subtotal)}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-gray-600">
                <span>Delivery fee</span>
                <span className="font-semibold text-gray-900">
                  {formatUGX(Number(deliveryFee) || 0)}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-gray-600">
                <span>Additional fees</span>
                <span className="font-semibold text-gray-900">
                  {formatUGX(Number(additionalFees) || 0)}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 text-base font-extrabold text-[#35102f]">
                <span>Total quotation</span>
                <span>{formatUGX(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || loadingQuotes}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-3 font-bold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Saving draft...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Quotation Draft
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"
        >
          {message}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#35102f]">
              Saved Quotations
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Previously saved drafts and quotation records for this request.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadQuotations()}
            disabled={loadingQuotes}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loadingQuotes ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </button>
        </div>

        {loadingQuotes ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
            <Loader2 size={17} className="animate-spin" />
            Loading quotations...
          </div>
        ) : quotations.length === 0 ? (
          <div className="mt-5 rounded-xl bg-gray-50 p-6 text-center">
            <FileText size={28} className="mx-auto text-gray-400" />
            <p className="mt-2 font-semibold text-gray-700">
              No quotations saved yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Create a quotation above and save it as a draft.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {quotations.map((quote) => (
              <article
                key={quote.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-extrabold text-[#35102f]">
                      {quote.quotationNumber}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Created {formatDate(quote.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusStyle(quote.status)}`}
                  >
                    {quote.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {quote.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <span className="text-gray-600">
                        {item.description} × {item.quantity}
                      </span>
                      <span className="shrink-0 font-semibold text-gray-900">
                        {formatUGX(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-sm">
                  <div className="flex justify-between gap-4 text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatUGX(quote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-gray-600">
                    <span>Delivery fee</span>
                    <span>{formatUGX(quote.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-gray-600">
                    <span>Additional fees</span>
                    <span>{formatUGX(quote.additionalFees)}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-gray-100 pt-3 font-extrabold text-[#35102f]">
                    <span>Total</span>
                    <span>{formatUGX(quote.totalAmount)}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">
                      Estimated completion
                    </p>
                    <p className="mt-1 text-gray-700">
                      {quote.estimatedCompletion || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">
                      Valid until
                    </p>
                    <p className="mt-1 text-gray-700">
                      {formatDate(quote.validUntil)}
                    </p>
                  </div>
                </div>

                {quote.paymentTerms && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase text-gray-400">
                      Payment terms
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                      {quote.paymentTerms}
                    </p>
                  </div>
                )}

                {quote.notes && (
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase text-gray-400">
                      Notes
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                      {quote.notes}
                    </p>
                  </div>
                )}

                
<div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
  <p className="text-sm font-semibold text-gray-800">
    {quote.status === "DRAFT"
      ? "This quotation is saved as a draft. Generate a customer link when it is ready to share."
      : quote.status === "SENT"
        ? "A customer link can be generated or replaced. Generating a link does not confirm that the customer has received it."
        : quote.status === "ACCEPTED"
          ? "The customer has accepted this quotation."
          : quote.status === "REJECTED"
            ? "The customer has declined this quotation."
            : "This quotation has expired."}
  </p>

  {(quote.status === "DRAFT" || quote.status === "SENT") && (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void generateCustomerLink(quote)}
        disabled={sharingQuoteId !== null}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#35102f] px-4 py-2 text-sm font-bold text-white hover:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sharingQuoteId === quote.id ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ExternalLink size={16} />
        )}
        {sharingQuoteId === quote.id
          ? "Generating link..."
          : quote.status === "SENT"
            ? "Generate New Link"
            : "Generate Customer Link"}
      </button>

      {shareLinks[quote.id] && (
        <>
          <button
            type="button"
            onClick={() => void copyCustomerLink(quote.id)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100"
          >
            <Copy size={16} />
            Copy Link
          </button>

          <a
            href={getWhatsAppUrl(shareLinks[quote.id])}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
          >
            <MessageCircle size={16} />
            Share via WhatsApp
          </a>
        </>
      )}
    </div>
  )}

  {shareLinks[quote.id] && (
    <div className="mt-3">
      <label
        htmlFor={`quotation-link-${quote.id}`}
        className="block text-xs font-bold uppercase tracking-wide text-gray-500"
      >
        Customer quotation link
      </label>
      <input
        id={`quotation-link-${quote.id}`}
        type="text"
        readOnly
        value={shareLinks[quote.id]}
        onFocus={(event) => event.currentTarget.select()}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
      />
      <p className="mt-2 text-xs leading-5 text-gray-500">
        Generating a new link replaces the previous link. Share this link with
        the customer; opening WhatsApp does not itself confirm message delivery.
      </p>
    </div>
  )}
</div>

              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}