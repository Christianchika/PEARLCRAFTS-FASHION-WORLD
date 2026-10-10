"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Copy, Mail, MessageCircle } from "lucide-react";

// Used to turn local numbers such as 0772123456 into international format
// for WhatsApp links. Change it if most customers are in another country.
const DEFAULT_COUNTRY_CODE = "256";

type Props = {
  orderId: string;
  status: string;
  fullName: string;
  phone: string;
  email: string | null;
  itemType: string;
  quantity: number;
  quotedAmount: number | null;
  quoteNotes: string | null;
  quoteValidUntil: string; // YYYY-MM-DD or ""
};

function formatAmount(amount: number) {
  return `UGX ${amount.toLocaleString("en-US")}`;
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toWhatsAppNumber(phone: string) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return DEFAULT_COUNTRY_CODE + digits.slice(1);

  return digits;
}

function buildMessage(props: Props) {
  const lines = [
    `Hello ${props.fullName},`,
    "",
    `Thank you for your custom design request with PEARLCRAFTS Fashion World (${props.itemType}, quantity ${props.quantity}).`,
    "",
    `Our quotation: ${formatAmount(props.quotedAmount ?? 0)}`,
  ];

  if (props.quoteNotes) {
    lines.push("", props.quoteNotes);
  }

  if (props.quoteValidUntil) {
    lines.push("", `This quotation is valid until ${formatDate(props.quoteValidUntil)}.`);
  }

  lines.push(
    "",
    "Please reply to confirm and we will begin work on your design.",
    "",
    "Thank you,",
    "PEARLCRAFTS Fashion World"
  );

  return lines.join("\n");
}

export default function CustomOrderQuoteForm(props: Props) {
  const router = useRouter();

  const [amount, setAmount] = useState(
    props.quotedAmount ? String(props.quotedAmount) : ""
  );
  const [notes, setNotes] = useState(props.quoteNotes ?? "");
  const [validUntil, setValidUntil] = useState(props.quoteValidUntil);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const canEdit = props.status === "REVIEWED" || props.status === "QUOTED";
  const hasQuote = props.quotedAmount !== null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    const parsed = Number.parseInt(amount.replace(/[,\s]/g, ""), 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError("Enter the price as a whole number, for example 150000.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/custom-orders/${props.orderId}/quote`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quotedAmount: parsed,
            quoteNotes: notes,
            quoteValidUntil: validUntil || null,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to save quotation.");
      }

      setMessage("Quotation saved. You can now send it to the customer.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save quotation.");
    } finally {
      setSaving(false);
    }
  }

  const text = hasQuote ? buildMessage(props) : "";
  const whatsappUrl = `https://wa.me/${toWhatsAppNumber(props.phone)}?text=${encodeURIComponent(text)}`;
  const mailUrl = props.email
    ? `mailto:${props.email}?subject=${encodeURIComponent(
        "Your PEARLCRAFTS custom design quotation"
      )}&body=${encodeURIComponent(text)}`
    : null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Select the message and copy it manually.");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200";

  return (
    <div className="mt-5 space-y-5">
      {props.status === "PENDING" && (
        <div className="rounded-2xl bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800">
            Mark this request as REVIEWED first (see Order Management below),
            then you can enter a price.
          </p>
        </div>
      )}

      {canEdit && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="quote-amount"
              className="text-sm font-bold text-[#35102f]"
            >
              Total price (UGX)
            </label>
            <input
              id="quote-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="150000"
              disabled={saving}
              className={`${inputClass} mt-2`}
            />
          </div>

          <div>
            <label
              htmlFor="quote-notes"
              className="text-sm font-bold text-[#35102f]"
            >
              Notes for the customer (optional)
            </label>
            <textarea
              id="quote-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes delivery in Kampala. 50% deposit to start. Ready in 10 days."
              disabled={saving}
              maxLength={1000}
              className={`${inputClass} mt-2`}
            />
          </div>

          <div>
            <label
              htmlFor="quote-valid"
              className="text-sm font-bold text-[#35102f]"
            >
              Valid until (optional)
            </label>
            <input
              id="quote-valid"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              disabled={saving}
              className={`${inputClass} mt-2 sm:max-w-xs`}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Send size={16} />
                {hasQuote ? "Update Quotation" : "Save Quotation"}
              </>
            )}
          </button>
        </form>
      )}

      {error && (
        <p className="text-sm font-semibold text-red-600">{error}</p>
      )}
      {message && (
        <p className="text-sm font-semibold text-emerald-600">{message}</p>
      )}

      {!canEdit && hasQuote && (
        <div className="rounded-2xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">Quoted price</p>
          <p className="mt-1 text-2xl font-extrabold text-[#35102f]">
            {formatAmount(props.quotedAmount ?? 0)}
          </p>
          {props.quoteNotes && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
              {props.quoteNotes}
            </p>
          )}
          {props.quoteValidUntil && (
            <p className="mt-3 text-sm text-gray-500">
              Valid until {formatDate(props.quoteValidUntil)}
            </p>
          )}
        </div>
      )}

      {!canEdit && !hasQuote && props.status !== "PENDING" && (
        <p className="text-sm text-gray-500">
          No quotation was issued for this order.
        </p>
      )}

      {props.status === "QUOTED" && hasQuote && (
        <div className="rounded-2xl bg-purple-50 p-5">
          <h3 className="text-sm font-bold text-[#35102f]">
            Send to customer
          </h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-4 text-sm text-gray-700">
            {text}
          </pre>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
            >
              <MessageCircle size={16} />
              Send via WhatsApp
            </a>

            {mailUrl && (
              <a
                href={mailUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                <Mail size={16} />
                Send via email
              </a>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
            >
              <Copy size={16} />
              {copied ? "Copied" : "Copy message"}
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            WhatsApp and email open with the message filled in. You press send.
            Save any change to the quotation first so the message is current.
          </p>
        </div>
      )}
    </div>
  );
}
