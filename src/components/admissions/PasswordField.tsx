"use client";

import { useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { MIN_PASSWORD } from "@/lib/admissions";

const field =
  "w-full rounded-xl border border-line bg-canvas px-4 py-3 pr-12 text-ink " +
  "placeholder:text-ink-soft/60 focus:border-primary focus-visible:outline-2 " +
  "focus-visible:outline-primary-deep focus-visible:outline-offset-2";

/** 0 too short, 1 fair, 2 good, 3 strong. Guidance only: the server makes the real decision. */
export function passwordScore(pw: string): number {
  if (pw.length < MIN_PASSWORD) return 0;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  const words = pw.trim().split(/[\s\-_.]+/).filter((w) => w.length > 2).length;
  let score = 1;
  if (pw.length >= 14 || kinds >= 3) score++;
  if (pw.length >= 16 && (kinds >= 3 || words >= 3)) score++;
  if (/^(.)\1+$/.test(pw) || /^\d+$/.test(pw)) score = 1;
  return score;
}
const WORDS = ["Too short", "Fair", "Good", "Strong"];

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  guide = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  /** Show the strength bar and the rules. Use when a password is being chosen, not typed in. */
  guide?: boolean;
}) {
  const [show, setShow] = useState(false);
  const score = passwordScore(value);
  const longEnough = value.length >= MIN_PASSWORD;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={field}
          autoComplete={autoComplete}
          placeholder={placeholder}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby={guide ? `${id}-guide` : undefined}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-ink-soft hover:text-primary"
        >
          {show ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
        </button>
      </div>
      {guide && (
        <div id={`${id}-guide`} className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1" aria-hidden>
              {[1, 2, 3].map((n) => (
                <span key={n} className={`h-1.5 flex-1 rounded-full ${value && score >= n ? "bg-primary" : "bg-line"}`} />
              ))}
            </div>
            <span className="w-20 text-right text-xs font-semibold text-ink-soft" data-testid={`${id}-strength`}>
              {value ? WORDS[score] : ""}
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            <li className={`flex items-center gap-2 ${longEnough ? "text-ink" : ""}`}>
              <Check size={14} className={longEnough ? "text-primary" : "text-line"} /> At least {MIN_PASSWORD} characters
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-line" /> Not your name, mobile number or a common password
            </li>
            <li className="pl-6">Three or four unrelated words work well, like a short sentence only you know.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
