"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type QuotationItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type PublicQuotation = {
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
  sentAt: string | null;
  customerRespondedAt: string | null;
  createdAt: string;
  customerName: string;
  items: QuotationItem[];
  canRespond: boolean;
  isPastValidity: boolean;
};

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
    month: "long",
    year: "numeric",
  });
}

function statusDescription(status: string) {
  switch (status) {
    case "SENT":
      return "Awaiting your response";
    case "ACCEPTED":
      return "You have accepted this quotation";
    case "REJECTED":
      return "You have declined this quotation";
    case "EXPIRED":
      return "This quotation has expired";
    default:
      return "This quotation is not available for a response";
  }
}

export default function CustomerQuotationPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [quotation, setQuotation] = useState<PublicQuotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadQuotation = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/quotation/${encodeURIComponent(token)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load this quotation.");
      }

      setQuotation(data.quotation);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this quotation."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadQuotation();
  }, 0);

  return () => window.clearTimeout(timer);
}, [loadQuotation]);

  async function respond(decision: "ACCEPTED" | "REJECTED") {
    if (submitting || !quotation?.canRespond) return;

    const confirmation =
      decision === "ACCEPTED"
        ? "Do you want to accept this quotation?"
        : "Do you want to decline this quotation?";

    if (!window.confirm(confirmation)) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/quotation/${encodeURIComponent(token)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to record your response.");
      }

      setMessage(data.message || "Your response has been recorded.");
      await loadQuotation();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to record your response."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
            <FileText size={28} />
          </div>
          <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.2em] text-purple-700">
            PearlCrafts
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#35102f] sm:text-4xl">
            Your Custom Quotation
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Please review your quotation carefully before making a decision.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-gray-100 bg-white p-12 text-gray-600 shadow-sm">
            <Loader2 size={22} className="animate-spin" />
            Loading your quotation...
          </div>
        ) : error && !quotation ? (
          <section className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <XCircle size={38} className="mx-auto text-red-500" />
            <h2 className="mt-4 text-xl font-extrabold text-gray-900">
              Quotation unavailable
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{error}</p>
            <button
              type="button"
              onClick={() => void loadQuotation()}
              className="mt-5 rounded-xl bg-purple-700 px-5 py-3 text-sm font-bold text-white hover:bg-purple-800"
            >
              Try again
            </button>
          </section>
        ) : quotation ? (
          <div className="space-y-5">
            <section className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Quotation number
                  </p>
                  <h2 className="mt-1 break-all text-xl font-black text-[#35102f]">
                    {quotation.quotationNumber}
                  </h2>
                  <p className="mt-3 text-sm text-gray-600">
                    Prepared for{" "}
                    <span className="font-bold text-gray-900">
                      {quotation.customerName}
                    </span>
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-purple-50 px-3 py-2 text-xs font-extrabold text-purple-800">
                  <Clock3 size={14} />
                  {statusDescription(quotation.status)}
                </span>
              </div>

              <div className="mt-6 grid gap-4 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Estimated completion
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {quotation.estimatedCompletion || "To be agreed"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Valid until
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {formatDate(quotation.validUntil)}
                  </p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-8">
                <h2 className="text-lg font-extrabold text-[#35102f]">
                  Itemized quotation
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Review the items, quantities, and prices below.
                </p>
              </div>

              <div className="divide-y divide-gray-100 px-5 sm:px-8">
                {quotation.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-bold text-gray-900">
                        {item.description}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.quantity} × {formatUGX(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-extrabold text-[#35102f]">
                      {formatUGX(item.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 bg-gray-50 px-5 py-5 sm:px-8">
                <div className="flex justify-between gap-4 text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatUGX(quotation.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm text-gray-600">
                  <span>Delivery fee</span>
                  <span className="font-semibold text-gray-900">
                    {formatUGX(quotation.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm text-gray-600">
                  <span>Additional fees</span>
                  <span className="font-semibold text-gray-900">
                    {formatUGX(quotation.additionalFees)}
                  </span>
                </div>
                <div className="flex flex-col gap-1 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-base font-extrabold text-[#35102f]">
                    Total quotation
                  </span>
                  <span className="text-2xl font-black text-purple-800">
                    {formatUGX(quotation.totalAmount)}
                  </span>
                </div>
              </div>
            </section>

            {(quotation.paymentTerms || quotation.notes) && (
              <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
                {quotation.paymentTerms && (
                  <div>
                    <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#35102f]">
                      Payment terms
                    </h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {quotation.paymentTerms}
                    </p>
                  </div>
                )}

                {quotation.notes && (
                  <div className={quotation.paymentTerms ? "mt-5 border-t border-gray-100 pt-5" : ""}>
                    <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#35102f]">
                      Additional notes
                    </h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {quotation.notes}
                    </p>
                  </div>
                )}
              </section>
            )}

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
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
              >
                {message}
              </div>
            )}

            {quotation.canRespond ? (
              <section className="rounded-3xl bg-[#35102f] p-5 text-white shadow-lg sm:p-8">
                <h2 className="text-xl font-extrabold">
                  Would you like to proceed?
                </h2>
                <p className="mt-2 text-sm leading-6 text-purple-100">
                  Please choose whether to accept or decline this quotation.
                  Your response will be recorded against this quotation.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void respond("ACCEPTED")}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-extrabold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    Accept quotation
                  </button>

                  <button
                    type="button"
                    onClick={() => void respond("REJECTED")}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-5 py-3 font-extrabold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <XCircle size={18} />
                    )}
                    Decline quotation
                  </button>
                </div>
              </section>
            ) : (
              <section className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                {quotation.status === "ACCEPTED" ? (
                  <CheckCircle2 size={34} className="mx-auto text-emerald-600" />
                ) : quotation.status === "REJECTED" || quotation.isPastValidity ? (
                  <XCircle size={34} className="mx-auto text-gray-500" />
                ) : (
                  <ShieldCheck size={34} className="mx-auto text-purple-700" />
                )}
                <h2 className="mt-3 font-extrabold text-[#35102f]">
                  {quotation.isPastValidity && quotation.status === "SENT"
                    ? "Quotation validity has ended"
                    : statusDescription(quotation.status)}
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {quotation.isPastValidity && quotation.status === "SENT"
                    ? "Please contact PearlCrafts if you need a revised quotation."
                    : quotation.status === "ACCEPTED"
                      ? "Thank you for confirming. Please contact PearlCrafts to agree on the next steps."
                      : quotation.status === "REJECTED"
                        ? "Your response has been recorded. You can contact PearlCrafts if you wish to discuss this quotation."
                        : "If you need assistance, please contact PearlCrafts."}
                </p>
              </section>
            )}

            <footer className="pb-4 text-center text-xs leading-5 text-gray-500">
              <p>PearlCrafts Fashion World</p>
              <p>Quotation issued {formatDate(quotation.sentAt)}</p>
            </footer>
          </div>
        ) : null}
      </div>
    </main>
  );
}
