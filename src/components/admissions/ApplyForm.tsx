"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, FileUp, Loader2, MessageCircle, Phone, Trash2 } from "lucide-react";
import {
  admissionsOnline, ageGuidance, api, ApiError, CLASSES, clearSaved, CONSENT_TEXT, DOC_KINDS,
  loadSaved, loadSession, MIN_PASSWORD, saveSaved, saveSession, shrinkImage, takePrefill, uploadFile, visitSource,
  type AccountData, type Application, type Details, type Saved, type UploadedFile,
} from "@/lib/admissions";
import { SCHOOL } from "@/lib/constants";
import { telHref, whatsappHref } from "@/lib/links";
import { track } from "@/lib/track";
import { HumanCheck } from "./HumanCheck";
import { PasswordField } from "./PasswordField";

const STEPS = ["Your child", "Family", "Documents", "Visit and send"] as const;

const VISIT_TIMES = [
  "Any working day, morning",
  "Any working day, afternoon",
  "Saturday morning",
  "Please call me to fix a time",
];

const field =
  "w-full rounded-xl border border-line bg-canvas px-4 py-3 text-ink " +
  "placeholder:text-ink-soft/60 focus:border-primary focus-visible:outline-2 " +
  "focus-visible:outline-gold focus-visible:outline-offset-2";
const labelCls = "block text-sm font-semibold text-ink";
const hintCls = "mt-1 text-sm text-ink-soft";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base " +
  "font-semibold text-canvas transition-colors hover:bg-primary-deep active:scale-[0.98] " +
  "disabled:cursor-not-allowed disabled:opacity-60";
const quietBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-6 py-3 " +
  "text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-canvas";

const EMPTY_START = { child_name: "", child_dob: "", class_sought: "", parent_name: "", phone: "" };

export function ApplyForm() {
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [start, setStart] = useState(EMPTY_START);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot, hidden from people
  const [details, setDetails] = useState<Details>({});
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [visit, setVisit] = useState("");
  const [message, setMessage] = useState("");
  const [declared, setDeclared] = useState(false);
  const [session, setSession] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [human, setHuman] = useState<string | null>(null);
  const [humanRound, setHumanRound] = useState(0);
  const [phoneFromProfile, setPhoneFromProfile] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  // Pick up where this phone left off, or open the form a signed-in parent chose
  // on their profile page (?ref=...), or start a fresh one for another child (?new=1).
  useEffect(() => {
    if (!admissionsOnline) {
      setReady(true);
      return;
    }
    const q = new URLSearchParams(window.location.search);
    const sess = loadSession();
    setSession(sess);
    const wanted = (q.get("ref") || "").toUpperCase();
    const s: Saved | null =
      wanted && sess ? { ref: wanted, token: sess } : q.get("new") ? null : loadSaved();
    if (!s) {
      // A child chosen on the profile page arrives already filled in.
      const pre = takePrefill();
      if (pre) {
        setStart((v) => ({ ...v, child_name: pre.child_name || v.child_name, child_dob: pre.child_dob || v.child_dob, class_sought: pre.class_sought || v.class_sought }));
      }
      // A signed-in parent does not retype their own name and number.
      if (sess) {
        api<AccountData>("GET", "/api/account", { token: sess })
          .then(({ account }) => {
            setStart((v) => ({ ...v, parent_name: v.parent_name || account.name, phone: v.phone || account.phone }));
            setPhoneFromProfile(!!account.phone);
          })
          .catch(() => setSession(null))
          .finally(() => setReady(true));
      } else {
        setReady(true);
      }
      return;
    }
    api<{ application: Application }>("GET", `/api/applications/${s.ref}`, { token: s.token })
      .then(({ application: a }) => {
        setSaved(s);
        setStart({
          child_name: a.child_name, child_dob: a.child_dob, class_sought: a.class_sought,
          parent_name: a.parent_name, phone: a.phone,
        });
        setConsent(true);
        setDetails(a.details || {});
        setFiles(a.files || []);
        setVisit(a.visit_pref || "");
        setMessage(a.message || "");
        if (a.status === "started") setStep(1);
        else setDone(true);
      })
      .catch((e: ApiError) => {
        if ((e.status === 401 || e.status === 404) && !wanted) clearSaved();
      })
      .finally(() => setReady(true));
  }, []);

  const goTo = (n: number) => {
    setError(null);
    setStep(n);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setS = (k: keyof typeof EMPTY_START) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setStart((v) => ({ ...v, [k]: e.target.value }));
  const setD = (k: keyof Details) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setDetails((v) => ({ ...v, [k]: e.target.value }));

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setHumanRound((n) => n + 1); // a human-check token works once
    } finally {
      setBusy(false);
    }
  }

  // Step 1: the first save creates the application, so a half-finished form still
  // reaches the office and they can call to help.
  const submitStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start.child_name.trim()) return setError("Please add your child's name.");
    if (!start.child_dob) return setError("Please add your child's date of birth.");
    if (!start.class_sought) return setError("Please choose the class you are applying for.");
    if (!start.parent_name.trim()) return setError("Please add your own name.");
    if (!/^[6-9]\d{9}$/.test(start.phone.replace(/\D/g, "").slice(-10)))
      return setError("Please add a 10 digit mobile number.");
    if (!consent) return setError("Please tick the box so we can keep your details.");
    run(async () => {
      if (saved) {
        await api("PATCH", `/api/applications/${saved.ref}`, {
          token: saved.token,
          body: { child_name: start.child_name, child_dob: start.child_dob, class_sought: start.class_sought, parent_name: start.parent_name },
        });
      } else {
        const r = await api<{ ref: string; token?: string }>("POST", "/api/applications", {
          token: session ?? undefined,
          body: { ...start, consent: true, consent_text: CONSENT_TEXT, source: visitSource(), website, ts: human },
        });
        if (!r.token) throw new Error("Could not save just now. Please call the school office.");
        const s = { ref: r.ref, token: r.token };
        saveSaved(s);
        setSaved(s);
        track("apply_start", start.class_sought);
      }
      goTo(1);
    });
  };

  const submitFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saved) return;
    if (!details.child_gender) return setError("Please choose your child's gender.");
    if (!details.father_name?.trim() && !details.mother_name?.trim())
      return setError("Please add the name of at least one parent.");
    if (!details.address?.trim()) return setError("Please add your home address.");
    run(async () => {
      await api("PATCH", `/api/applications/${saved.ref}`, { token: saved.token, body: { details, progress: "family" } });
      track("apply_step", "family");
      goTo(2);
    });
  };

  async function addFile(kind: string, file: File | undefined) {
    if (!file || !saved) return;
    setError(null);
    setUploading(kind);
    try {
      const blob = await shrinkImage(file);
      if (blob.size > 4 * 1024 * 1024) throw new Error("That file is over 4 MB. A phone photo of the page works better.");
      const f = await uploadFile(saved.ref, saved.token, kind, blob, file.name);
      setFiles((v) => [...v, f]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file did not upload. Please try again.");
    } finally {
      setUploading(null);
    }
  }

  async function removeFile(id: string) {
    if (!saved) return;
    try {
      await api("DELETE", `/api/applications/${saved.ref}/files/${id}`, { token: saved.token });
      setFiles((v) => v.filter((f) => f.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove that file.");
    }
  }

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saved) return;
    if (!declared) return setError("Please confirm the details are correct.");
    run(async () => {
      await api("PATCH", `/api/applications/${saved.ref}`, {
        token: saved.token,
        body: { visit_pref: visit, message, progress: "visit" },
      });
      await api("POST", `/api/applications/${saved.ref}/submit`, { token: saved.token, body: { declared: true } });
      track("apply_submit", start.class_sought);
      setDone(true);
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // After sending: one password turns this phone-only form into a parent account.
  const createAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saved) return;
    if (newPassword.length < MIN_PASSWORD) return setError(`Please choose a password of at least ${MIN_PASSWORD} characters.`);
    if (newPassword !== newPassword2) return setError("The two passwords are not the same. Please type them again.");
    run(async () => {
      const r = await api<{ session: string }>("POST", "/api/account/register", {
        body: { ref: saved.ref, phone: start.phone, password: newPassword, email: newEmail, name: start.parent_name, ts: human },
      });
      saveSession(r.session);
      setSession(r.session);
      setNewPassword("");
      setNewPassword2("");
      track("account_create", "after apply");
    });
  };

  const startAnother = () => {
    clearSaved();
    setSaved(null);
    setDone(false);
    setStart({ ...EMPTY_START, parent_name: start.parent_name, phone: start.phone });
    setDetails((d) => ({ ...d, child_gender: "", previous_school: "", previous_class: "", medical_notes: "" }));
    setFiles([]);
    setDeclared(false);
    setConsent(false);
    goTo(0);
  };

  // ---------------------------------------------------------------- views

  if (!admissionsOnline) {
    return (
      <div>
        <h2 className="font-display text-2xl md:text-3xl">The online form opens shortly.</h2>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Until then, call or message the school office and we will take your
          child&rsquo;s details over the phone. You can also walk in on any working day.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href={telHref} className={primaryBtn}>
            <Phone size={18} strokeWidth={1.75} /> Call {SCHOOL.phoneDisplay}
          </a>
          <a
            href={whatsappHref("Hello Kids Planet, I would like to apply for admission.")}
            target="_blank"
            rel="noopener noreferrer"
            className={quietBtn}
          >
            <MessageCircle size={18} strokeWidth={1.75} /> WhatsApp
          </a>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <p className="flex items-center gap-2 text-ink-soft">
        <Loader2 size={18} className="animate-spin" /> Opening the form...
      </p>
    );
  }

  if (done && saved) {
    return (
      <div ref={top}>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-canvas">
          <Check size={24} strokeWidth={2} />
        </span>
        <h2 className="mt-5 font-display text-3xl md:text-4xl">
          Thank you. We have {start.child_name.split(" ")[0] || "your child"}&rsquo;s application.
        </h2>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-ink-soft">Your reference</p>
        <p className="mt-1 font-display text-4xl tracking-wide text-primary" data-testid="ref">{saved.ref}</p>
        <p className="mt-2 text-sm text-ink-soft">
          Please note this down or take a screenshot. You will need it with your phone number to check progress.
        </p>
        <ol className="mt-8 space-y-3 leading-relaxed text-ink">
          <li><span className="text-gold">✦</span> The office will call you within one working day.</li>
          <li><span className="text-gold">✦</span> We fix a time for you to visit, see the classrooms and meet a teacher.</li>
          <li><span className="text-gold">✦</span> Bring the original documents on the visit. The seat is confirmed at the office.</li>
        </ol>
        {session ? (
          <p className="mt-8 rounded-xl border border-line bg-canvas px-4 py-3 text-ink">
            This application is in your parent profile.{" "}
            <Link href="/parent/" className="font-semibold text-primary underline underline-offset-4">
              Open my profile
            </Link>
          </p>
        ) : (
          <form onSubmit={createAccount} className="mt-8 rounded-xl border border-line bg-canvas p-5" noValidate>
            <h3 className="font-display text-xl">Make this your parent profile</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Choose a password and you can sign in from any phone with your mobile
              number, to follow progress, add documents, or apply for another child.
            </p>
            <div className="mt-4 space-y-4">
              <PasswordField id="new_password" label="Choose a password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" guide />
              <PasswordField id="new_password2" label="Type it once more" value={newPassword2} onChange={setNewPassword2} autoComplete="new-password" />
              <div>
                <label htmlFor="new_email" className={labelCls}>Email</label>
                <input id="new_email" type="email" autoComplete="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={`mt-2 ${field}`} placeholder="Only if you use one. You can sign in with it too." />
              </div>
              <HumanCheck onToken={setHuman} resetKey={humanRound} />
            </div>
            <ErrorLine error={error} />
            <button type="submit" disabled={busy} className={`${quietBtn} mt-4`}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : null}
              Create my profile
            </button>
          </form>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={whatsappHref(`Hello Kids Planet, I have applied online for ${start.class_sought}. My reference is ${saved.ref}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={primaryBtn}
          >
            <MessageCircle size={18} strokeWidth={1.75} /> Message the office on WhatsApp
          </a>
          <Link href={`/admissions/status/?ref=${saved.ref}`} className={quietBtn}>
            Check progress
          </Link>
        </div>
        <button type="button" onClick={startAnother} className="mt-8 text-sm font-semibold text-primary underline underline-offset-4">
          Apply for another child
        </button>
      </div>
    );
  }

  const guidance = ageGuidance(start.child_dob, start.class_sought);

  return (
    <div ref={top} className="scroll-mt-28">
      {/* Progress */}
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-semibold text-primary">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
        {saved && <p className="text-sm text-ink-soft">Saved as <strong className="text-ink">{saved.ref}</strong></p>}
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {STEPS.map((s, i) => (
          <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-line"}`} />
        ))}
      </div>

      {step === 0 && (
        <form onSubmit={submitStart} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="child_name" className={labelCls}>Child&rsquo;s full name</label>
            <input id="child_name" value={start.child_name} onChange={setS("child_name")} className={`mt-2 ${field}`} placeholder="As on the birth certificate" autoComplete="off" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="child_dob" className={labelCls}>Date of birth</label>
              <input id="child_dob" type="date" value={start.child_dob} onChange={setS("child_dob")} className={`mt-2 ${field}`} />
            </div>
            <div>
              <label htmlFor="class_sought" className={labelCls}>Class applying for</label>
              <select id="class_sought" value={start.class_sought} onChange={setS("class_sought")} className={`mt-2 ${field}`}>
                <option value="">Select a class</option>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {guidance && (
            <p className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${guidance.mismatch ? "border-gold bg-gold/10 text-ink" : "border-line bg-canvas text-ink-soft"}`} data-testid="age-note">
              {guidance.text}
            </p>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="parent_name" className={labelCls}>Your name</label>
              <input id="parent_name" value={start.parent_name} onChange={setS("parent_name")} className={`mt-2 ${field}`} placeholder="Parent or guardian" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="phone" className={labelCls}>Mobile number</label>
              <input id="phone" type="tel" inputMode="numeric" value={start.phone} onChange={setS("phone")} className={`mt-2 ${field}`} placeholder="10 digit mobile number" autoComplete="tel" disabled={!!saved || phoneFromProfile} />
              {(saved || phoneFromProfile) && <p className={hintCls}>To change the number, call the office.</p>}
            </div>
          </div>
          {/* Honeypot: hidden from people, tempting to bots. */}
          <div className="hidden" aria-hidden>
            <label htmlFor="website">Website</label>
            <input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas p-4">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[#2d5016]" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={!!saved} />
            <span className="text-sm leading-relaxed text-ink">
              {CONSENT_TEXT}{" "}
              <Link href="/privacy/" target="_blank" className="font-semibold text-primary underline underline-offset-4">
                How we look after your details
              </Link>
            </span>
          </label>
          {!saved && !session && <HumanCheck onToken={setHuman} resetKey={humanRound} />}
          <ErrorLine error={error} />
          <button type="submit" disabled={busy} className={`${primaryBtn} w-full sm:w-auto`}>
            {busy ? <Loader2 size={18} className="animate-spin" /> : null}
            Save and continue <ArrowRight size={18} strokeWidth={1.75} />
          </button>
          <p className="text-sm text-ink-soft">
            Takes about five minutes. Your place is saved on this phone after this step, so you can finish later.
            {!session && (
              <>
                {" "}Already have a parent profile?{" "}
                <Link href="/parent/" className="font-semibold text-primary underline underline-offset-4">Sign in</Link>
              </>
            )}
          </p>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={submitFamily} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="child_gender" className={labelCls}>Child&rsquo;s gender</label>
            <select id="child_gender" value={details.child_gender || ""} onChange={setD("child_gender")} className={`mt-2 ${field} sm:max-w-xs`}>
              <option value="">Select</option>
              <option value="F">Girl</option>
              <option value="M">Boy</option>
              <option value="O">Other</option>
            </select>
          </div>
          {(["father", "mother"] as const).map((p) => (
            <fieldset key={p} className="rounded-xl border border-line p-4">
              <legend className="px-2 text-sm font-semibold capitalize text-primary">{p}</legend>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor={`${p}_name`} className={labelCls}>Name</label>
                  <input id={`${p}_name`} value={details[`${p}_name`] || ""} onChange={setD(`${p}_name`)} className={`mt-2 ${field}`} />
                </div>
                <div>
                  <label htmlFor={`${p}_phone`} className={labelCls}>Mobile</label>
                  <input id={`${p}_phone`} type="tel" inputMode="numeric" value={details[`${p}_phone`] || ""} onChange={setD(`${p}_phone`)} className={`mt-2 ${field}`} />
                </div>
                <div>
                  <label htmlFor={`${p}_occupation`} className={labelCls}>Occupation</label>
                  <input id={`${p}_occupation`} value={details[`${p}_occupation`] || ""} onChange={setD(`${p}_occupation`)} className={`mt-2 ${field}`} />
                </div>
              </div>
            </fieldset>
          ))}
          <div>
            <label htmlFor="address" className={labelCls}>Home address</label>
            <textarea id="address" rows={2} value={details.address || ""} onChange={setD("address")} className={`mt-2 ${field} resize-y`} placeholder="House, village or ward, town" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="previous_school" className={labelCls}>Last school attended</label>
              <input id="previous_school" value={details.previous_school || ""} onChange={setD("previous_school")} className={`mt-2 ${field}`} placeholder="Leave blank if this is the first school" />
            </div>
            <div>
              <label htmlFor="previous_class" className={labelCls}>Class there</label>
              <input id="previous_class" value={details.previous_class || ""} onChange={setD("previous_class")} className={`mt-2 ${field}`} />
            </div>
          </div>
          <div>
            <label htmlFor="sibling_at_school" className={labelCls}>Brother or sister already at Kids Planet</label>
            <input id="sibling_at_school" value={details.sibling_at_school || ""} onChange={setD("sibling_at_school")} className={`mt-2 ${field}`} placeholder="Name and class, if any" />
          </div>
          <div>
            <label htmlFor="medical_notes" className={labelCls}>Anything about your child&rsquo;s health we should know</label>
            <textarea id="medical_notes" rows={2} value={details.medical_notes || ""} onChange={setD("medical_notes")} className={`mt-2 ${field} resize-y`} placeholder="Allergies, medicines, anything else. Leave blank if none." />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className={labelCls}>Email</label>
              <input id="email" type="email" value={details.email || ""} onChange={setD("email")} className={`mt-2 ${field}`} placeholder="Only if you use one" autoComplete="email" />
            </div>
            <div>
              <label htmlFor="heard_from" className={labelCls}>How did you hear about us?</label>
              <select id="heard_from" value={details.heard_from || ""} onChange={setD("heard_from")} className={`mt-2 ${field}`}>
                <option value="">Select</option>
                {["A family at the school", "Friends or relatives", "Board or poster", "Facebook or Instagram", "Google", "Live nearby", "Other"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          <ErrorLine error={error} />
          <Nav busy={busy} onBack={() => goTo(0)} />
        </form>
      )}

      {step === 2 && (
        <div className="mt-8 space-y-5">
          <p className="leading-relaxed text-ink-soft">
            Adding these now saves time at the school. If it is not convenient,
            skip this step and bring them on your visit.
          </p>
          {DOC_KINDS.map((d) => {
            const mine = files.filter((f) => f.kind === d.kind);
            return (
              <div key={d.kind} className="rounded-xl border border-line p-4">
                <p className="font-semibold text-ink">{d.label}</p>
                <p className={hintCls}>{d.hint}</p>
                {mine.map((f) => (
                  <div key={f.id} className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-canvas px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-ink">
                      <Check size={16} className="shrink-0 text-primary" />
                      <span className="truncate">{f.filename || "Uploaded file"}</span>
                    </span>
                    <button type="button" onClick={() => removeFile(f.id)} className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary" aria-label={`Remove ${f.filename || d.label}`}>
                      <Trash2 size={15} strokeWidth={1.75} /> Remove
                    </button>
                  </div>
                ))}
                <label className={`mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-canvas ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                  {uploading === d.kind ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} strokeWidth={1.75} />}
                  {uploading === d.kind ? "Uploading..." : mine.length ? "Add another" : "Take a photo or choose a file"}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="sr-only"
                    data-kind={d.kind}
                    onChange={(e) => {
                      addFile(d.kind, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            );
          })}
          <p className="text-sm text-ink-soft">
            Documents are seen only by the school office. We do not ask for Aadhaar online.
          </p>
          <ErrorLine error={error} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button type="button" onClick={() => goTo(1)} className={quietBtn}>
              <ArrowLeft size={18} strokeWidth={1.75} /> Back
            </button>
            <button
              type="button"
              onClick={() => {
                track("apply_step", `documents:${files.length}`);
                if (saved) api("PATCH", `/api/applications/${saved.ref}`, { token: saved.token, body: { progress: "documents" } }).catch(() => {});
                goTo(3);
              }}
              className={primaryBtn}
              disabled={!!uploading}
            >
              {files.length ? "Continue" : "Skip for now"} <ArrowRight size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={send} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="visit" className={labelCls}>When would you like to visit the school?</label>
            <select id="visit" value={visit} onChange={(e) => setVisit(e.target.value)} className={`mt-2 ${field}`}>
              <option value="">Select</option>
              {VISIT_TIMES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <p className={hintCls}>The office will call to confirm the day and time.</p>
          </div>
          <div>
            <label htmlFor="message" className={labelCls}>Anything else you would like to ask or tell us</label>
            <textarea id="message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`mt-2 ${field} resize-y`} />
          </div>
          <dl className="grid gap-x-6 gap-y-2 rounded-xl border border-line bg-canvas p-4 text-sm sm:grid-cols-2">
            <Row k="Child" v={start.child_name} />
            <Row k="Class" v={start.class_sought} />
            <Row k="Date of birth" v={start.child_dob.split("-").reverse().join("-")} />
            <Row k="Your number" v={start.phone} />
            <Row k="Documents added" v={String(files.length)} />
          </dl>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas p-4">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[#2d5016]" checked={declared} onChange={(e) => setDeclared(e.target.checked)} />
            <span className="text-sm leading-relaxed text-ink">
              The details I have given are correct. I understand that this is an
              application, and that the seat is confirmed at the school office.
            </span>
          </label>
          <ErrorLine error={error} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button type="button" onClick={() => goTo(2)} className={quietBtn}>
              <ArrowLeft size={18} strokeWidth={1.75} /> Back
            </button>
            <button type="submit" disabled={busy} className={primaryBtn}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : null}
              Send application
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ErrorLine({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-xl border border-gold bg-gold/10 px-4 py-3 text-sm font-medium text-ink">
      {error}
    </p>
  );
}

function Nav({ busy, onBack }: { busy: boolean; onBack: () => void }) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <button type="button" onClick={onBack} className={quietBtn}>
        <ArrowLeft size={18} strokeWidth={1.75} /> Back
      </button>
      <button type="submit" disabled={busy} className={primaryBtn}>
        {busy ? <Loader2 size={18} className="animate-spin" /> : null}
        Save and continue <ArrowRight size={18} strokeWidth={1.75} />
      </button>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 sm:block">
      <dt className="text-ink-soft">{k}</dt>
      <dd className="font-semibold text-ink">{v || "Not given"}</dd>
    </div>
  );
}
