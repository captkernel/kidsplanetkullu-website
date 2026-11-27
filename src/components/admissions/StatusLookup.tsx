"use client";

import { useEffect, useState } from "react";
import { Loader2, Phone, Search } from "lucide-react";
import { admissionsOnline, api, loadSaved, STATUS_LABELS, type StatusResult } from "@/lib/admissions";
import { SCHOOL } from "@/lib/constants";
import { telHref } from "@/lib/links";
import { track } from "@/lib/track";

const field =
  "w-full rounded-xl border border-line bg-canvas px-4 py-3 text-ink " +
  "placeholder:text-ink-soft/60 focus:border-primary focus-visible:outline-2 " +
  "focus-visible:outline-primary-deep focus-visible:outline-offset-2";
const labelCls = "block text-sm font-semibold text-ink";

// The stages a parent moves through, in order, for the progress line.
const PATH = ["submitted", "in_review", "visit_booked", "offered", "admitted"];

export function StatusLookup() {
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusResult | null>(null);

  // Prefill from the link on the thank-you screen, or from this phone's saved application.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("ref");
    setRef((q || loadSaved()?.ref || "").toUpperCase());
  }, []);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!ref.trim() || !phone.trim()) {
      setError("Please enter both the reference and the mobile number you applied with.");
      return;
    }
    setBusy(true);
    try {
      const r = await api<StatusResult>(
        "GET",
        `/api/status?ref=${encodeURIComponent(ref.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      setResult(r);
      track("status_check", r.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!admissionsOnline) {
    return (
      <p className="leading-relaxed text-ink-soft">
        To check on an application, call the school office on{" "}
        <a href={telHref} className="font-semibold text-primary">{SCHOOL.phoneDisplay}</a>.
      </p>
    );
  }

  const info = result ? STATUS_LABELS[result.status] : null;
  const at = result ? PATH.indexOf(result.status) : -1;

  return (
    <div>
      <form onSubmit={lookup} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="ref" className={labelCls}>Reference</label>
            <input id="ref" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} className={`mt-2 ${field} uppercase`} placeholder="KP27-ABC234" autoComplete="off" />
          </div>
          <div>
            <label htmlFor="status_phone" className={labelCls}>Mobile number</label>
            <input id="status_phone" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} className={`mt-2 ${field}`} placeholder="The number you applied with" autoComplete="tel" />
          </div>
        </div>
        {error && (
          <p role="alert" className="rounded-xl border border-gold bg-gold/10 px-4 py-3 text-sm font-medium text-ink">{error}</p>
        )}
        <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-canvas transition-colors hover:bg-primary-deep active:scale-[0.98] disabled:opacity-60">
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} strokeWidth={1.75} />}
          Check progress
        </button>
      </form>

      {result && info && (
        <div className="mt-10 border-t border-line pt-8" data-testid="status-result">
          <p className="text-sm text-ink-soft">
            {result.kind === "enquiry" ? "Enquiry" : "Application"} {result.ref}
            {result.class_sought ? `, ${result.class_sought}` : ""}, {result.session}
          </p>
          <h2 className="mt-2 font-display text-3xl text-primary md:text-4xl">{info.label}</h2>
          {result.status_note && (
            <p className="mt-4 rounded-xl border border-line bg-canvas px-4 py-3 font-medium text-ink">
              {result.status_note}
            </p>
          )}
          <p className="mt-4 leading-relaxed text-ink-soft">{info.body}</p>
          {at >= 0 && result.kind === "application" && (
            <ol className="mt-6 grid gap-2 sm:grid-cols-5">
              {PATH.map((s, i) => (
                <li key={s} className="text-sm">
                  <span className={`block h-1.5 rounded-full ${i <= at ? "bg-primary" : "bg-line"}`} />
                  <span className={`mt-2 block ${i <= at ? "font-semibold text-ink" : "text-ink-soft"}`}>
                    {STATUS_LABELS[s].label}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-6 text-sm text-ink-soft">
            Documents added online: {result.documents}. Last updated{" "}
            {new Date(result.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.
          </p>
          <a href={telHref} className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">
            <Phone size={16} strokeWidth={1.75} /> Call the office on {SCHOOL.phoneDisplay}
          </a>
        </div>
      )}
    </div>
  );
}
