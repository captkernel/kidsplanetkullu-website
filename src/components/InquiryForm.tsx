"use client";

import { useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { whatsappHref } from "@/lib/links";

// Static-export friendly: no backend. On submit we compose a WhatsApp message
// (the school's real, monitored channel) so the enquiry actually reaches them.
export function InquiryForm() {
  const [values, setValues] = useState({
    parent: "",
    phone: "",
    childClass: "",
    message: "",
  });
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.parent.trim() || !values.phone.trim()) {
      setError("Please add your name and a phone number so we can reach you.");
      return;
    }
    setError(null);
    const lines = [
      "Hello Kids Planet, I would like to enquire about admissions.",
      `Parent: ${values.parent}`,
      `Phone: ${values.phone}`,
      values.childClass ? `Class of interest: ${values.childClass}` : "",
      values.message ? `Message: ${values.message}` : "",
    ].filter(Boolean);
    window.open(whatsappHref(lines.join("\n")), "_blank", "noopener,noreferrer");
  };

  const field =
    "w-full rounded-xl border border-line bg-canvas px-4 py-3 text-ink " +
    "placeholder:text-ink-soft/60 focus:border-primary focus-visible:outline-2 " +
    "focus-visible:outline-gold focus-visible:outline-offset-2";
  const labelCls = "block text-sm font-semibold text-ink";

  const classes = [
    "Playgroup",
    "Nursery",
    "LKG",
    "UKG",
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="parent" className={labelCls}>
            Parent or guardian name
          </label>
          <input
            id="parent"
            name="parent"
            type="text"
            autoComplete="name"
            value={values.parent}
            onChange={set("parent")}
            className={`mt-2 ${field}`}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={set("phone")}
            className={`mt-2 ${field}`}
            placeholder="10 digit mobile number"
          />
        </div>
      </div>

      <div>
        <label htmlFor="childClass" className={labelCls}>
          Class of interest
        </label>
        <select
          id="childClass"
          name="childClass"
          value={values.childClass}
          onChange={set("childClass")}
          className={`mt-2 ${field}`}
        >
          <option value="">Select a class (optional)</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelCls}>
          Anything you would like us to know
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={values.message}
          onChange={set("message")}
          className={`mt-2 ${field} resize-y`}
          placeholder="A question, a preferred visit time, your child's age..."
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-primary">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-canvas transition-colors hover:bg-primary-deep active:scale-[0.98]"
        >
          <Send size={18} strokeWidth={1.75} />
          Send enquiry
        </button>
        <a
          href={whatsappHref("Hello, I would like to enquire about admissions at Kids Planet.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-7 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-canvas active:scale-[0.98]"
        >
          <MessageCircle size={18} strokeWidth={1.75} />
          Chat on WhatsApp
        </a>
      </div>
      <p className="text-xs text-ink-soft">
        Your enquiry opens WhatsApp with the details filled in, sent straight to
        the school office. We usually reply within one working day.
      </p>
    </form>
  );
}
