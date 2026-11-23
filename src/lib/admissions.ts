// Client for the kp-admissions Worker (see ../../../admissions-online).
// The site is a static export, so every call here runs in the parent's browser.
// Disabled unless NEXT_PUBLIC_ADMISSIONS_API is set at build time: the pages then
// fall back to phone and WhatsApp, so publishing without the backend is safe.

export const ADMISSIONS_API = (process.env.NEXT_PUBLIC_ADMISSIONS_API || "").replace(/\/$/, "");
export const admissionsOnline = ADMISSIONS_API !== "";

export const CLASSES = [
  "Pre-Nursery", "Nursery", "LKG", "UKG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8",
] as const;

// The exact words the parent agrees to. Stored with the application.
export const CONSENT_TEXT =
  "I am this child's parent or guardian. I agree to Kids Planet School keeping the details and documents I give here, to process this admission application and to contact me about it.";

export const DOC_KINDS = [
  { kind: "child_photo", label: "Child's photo", hint: "A recent, clear photo of your child's face." },
  { kind: "birth_certificate", label: "Birth certificate", hint: "A phone photo of the certificate is fine." },
  { kind: "previous_school", label: "Last report card or transfer certificate", hint: "Only if your child has been to school before." },
] as const;

export type Details = Partial<Record<
  | "child_gender" | "father_name" | "father_phone" | "father_occupation"
  | "mother_name" | "mother_phone" | "mother_occupation" | "email" | "address"
  | "previous_school" | "previous_class" | "sibling_at_school" | "medical_notes" | "heard_from",
  string
>>;

export type UploadedFile = {
  id: string;
  kind: string;
  filename: string;
  content_type: string;
  size_bytes: number;
};

export type Application = {
  ref: string;
  kind?: "enquiry" | "application";
  status: string;
  status_note?: string;
  class_sought: string;
  child_name: string;
  child_dob: string;
  parent_name: string;
  phone: string;
  details: Details;
  visit_pref: string;
  message: string;
  files: UploadedFile[];
};

export type StatusResult = {
  ref: string;
  kind: "enquiry" | "application";
  status: string;
  status_note: string;
  class_sought: string;
  session: string;
  documents: number;
  updated_at: string;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const OFFLINE = "We could not reach the school's server. Check your connection and try again.";

export async function api<T>(
  method: string,
  path: string,
  opts: { body?: unknown; token?: string } = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(ADMISSIONS_API + path, {
      method,
      headers: {
        ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(OFFLINE, 0);
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiError(data.error || "Something went wrong. Please try again.", res.status);
  return data as T;
}

export async function uploadFile(ref: string, token: string, kind: string, file: Blob, filename: string) {
  let res: Response;
  try {
    res = await fetch(`${ADMISSIONS_API}/api/applications/${ref}/files?kind=${kind}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type || "application/octet-stream",
        "X-Filename": encodeURIComponent(filename),
      },
      body: file,
    });
  } catch {
    throw new ApiError(OFFLINE, 0);
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string; file?: UploadedFile };
  if (!res.ok || !data.file) throw new ApiError(data.error || "That file did not upload. Please try again.", res.status);
  return data.file;
}

/**
 * Phone photos are 3 to 8 MB and school-town connections are slow, so shrink
 * images in the browser before they travel. PDFs and small images pass through.
 */
export async function shrinkImage(file: File, maxSide = 1800, quality = 0.85): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 900_000 && file.type === "image/jpeg") return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", quality));
    return blob ?? file;
  } catch {
    return file; // an image the browser cannot decode (HEIC on some phones): send as is
  }
}

// ---- the parent's saved place on this phone -------------------------------

const KEY = "kp_apply";
export type Saved = { ref: string; token: string };

export function loadSaved(): Saved | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v && typeof v.ref === "string" && typeof v.token === "string" ? v : null;
  } catch {
    return null;
  }
}
export function saveSaved(v: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
}
export function clearSaved() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

// ---- the signed-in parent --------------------------------------------------

const SESSION_KEY = "kp_parent";
export type Account = { name: string; phone: string; email: string; must_change: boolean };
export type AccountData = { account: Account; applications: Application[] };

export function loadSession(): string | null {
  try {
    const v = localStorage.getItem(SESSION_KEY);
    return v && /^[0-9a-f]{40}$/.test(v) ? v : null;
  } catch {
    return null;
  }
}
export function saveSession(token: string) {
  try {
    localStorage.setItem(SESSION_KEY, token);
  } catch {}
}
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

/** Which poster, QR or post sent this parent: ?src=..., or utm_source. */
export function visitSource(): string {
  try {
    const q = new URLSearchParams(location.search);
    const s = q.get("src") || q.get("utm_source") || "";
    if (s) sessionStorage.setItem("kp_src", s.slice(0, 80));
    return sessionStorage.getItem("kp_src") || "";
  } catch {
    return "";
  }
}

// ---- age guidance ----------------------------------------------------------

// School policy (website admissions page): minimum completed years per class.
const MIN_AGE: [string, number][] = [
  ["Class 1", 6], ["UKG", 5], ["LKG", 4], ["Nursery", 3], ["Pre-Nursery", 2],
];
// Himachal Education Department letters of 24-12-2025, 12-03-2026 and 08-10-2026 (file
// EDN-C-F(1)-2/2023; copies in admissions-online/reference/age-rule): 3 / 4 / 5 / 6 completed
// years for Nursery / LKG / UKG / Class 1 "on or before 30th September of the academic year in
// which admission is sought", all schools including private. Minimum ages only, no upper limit.
// The date moved between 31 March and 30 September three times from 2023 to 2025, so it is
// one value here: re-check the Directorate's site before each admission season.
export const AGE_ON = "2027-09-30";
export const AGE_ON_LABEL = "30 September 2027";

export function ageOn(dob: string, on = AGE_ON): { years: number; months: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const [by, bm, bd] = dob.split("-").map(Number);
  const [oy, om, od] = on.split("-").map(Number);
  let months = (oy - by) * 12 + (om - bm) - (od < bd ? 1 : 0);
  if (months < 0) return null;
  const years = Math.floor(months / 12);
  months -= years * 12;
  return { years, months };
}

/** A gentle line about age and class. Never blocks: the office decides at the visit. */
export function ageGuidance(dob: string, cls: string): { text: string; mismatch: boolean } | null {
  const age = ageOn(dob);
  if (!age || age.years > 17) return null;
  const said = `On ${AGE_ON_LABEL} your child will be ${age.years} ${age.years === 1 ? "year" : "years"}${
    age.months ? ` and ${age.months} ${age.months === 1 ? "month" : "months"}` : ""
  } old.`;
  const rule = MIN_AGE.find(([c]) => c === cls);
  if (!rule) return { text: said, mismatch: false };
  if (age.years < rule[1]) {
    const fit = MIN_AGE.find(([, min]) => age.years >= min);
    return {
      text: `${said} ${cls} is for children of ${rule[1]} and above${
        fit ? `, so ${fit[0]} may suit better` : ""
      }. You can still send this, and the office will talk it through with you.`,
      mismatch: true,
    };
  }
  return { text: `${said} That fits ${cls}.`, mismatch: false };
}

export const STATUS_LABELS: Record<string, { label: string; body: string }> = {
  started: {
    label: "Not sent yet",
    body: "This application was started but not sent. Open it on the phone you began on and press Send.",
  },
  submitted: {
    label: "Received",
    body: "We have your form. The office will call you within one working day.",
  },
  in_review: {
    label: "With the office",
    body: "The office is going through your details and will call if anything is missing.",
  },
  visit_booked: {
    label: "Visit arranged",
    body: "We look forward to showing you the school. Please bring the original documents.",
  },
  offered: {
    label: "Seat offered",
    body: "A seat is being held for your child. Please visit the office to complete the admission.",
  },
  admitted: {
    label: "Admitted",
    body: "Welcome to Kids Planet. The office will share the first day details.",
  },
  waitlisted: {
    label: "On the waiting list",
    body: "This class is full right now. We will call you as soon as a seat opens.",
  },
  closed: {
    label: "Closed",
    body: "This application is closed. Call the office if you would like to reopen it.",
  },
};
