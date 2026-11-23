"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, FileUp, Loader2, LogOut, Phone, Plus } from "lucide-react";
import {
  admissionsOnline, api, ApiError, clearSession, DOC_KINDS, loadSaved, loadSession, saveSession,
  shrinkImage, STATUS_LABELS, uploadFile,
  type Account, type AccountData, type Application,
} from "@/lib/admissions";
import { SCHOOL } from "@/lib/constants";
import { telHref } from "@/lib/links";
import { track } from "@/lib/track";

const field =
  "w-full rounded-xl border border-line bg-canvas px-4 py-3 text-ink " +
  "placeholder:text-ink-soft/60 focus:border-primary focus-visible:outline-2 " +
  "focus-visible:outline-gold focus-visible:outline-offset-2";
const labelCls = "block text-sm font-semibold text-ink";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base " +
  "font-semibold text-canvas transition-colors hover:bg-primary-deep active:scale-[0.98] disabled:opacity-60";
const quietBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-5 py-2.5 " +
  "text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-canvas disabled:opacity-60";

const DOCS_OPEN = ["started", "submitted", "in_review", "visit_booked"];
const DOC_LABEL: Record<string, string> = Object.fromEntries(DOC_KINDS.map((d) => [d.kind, d.label]));

function Notice({ tone = "warn", children }: { tone?: "warn" | "ok"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "warn" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm font-medium text-ink ${
        tone === "warn" ? "border-gold bg-gold/10" : "border-primary/30 bg-primary/5"
      }`}
    >
      {children}
    </p>
  );
}

export function ParentPortal() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<string | null>(null);
  const [data, setData] = useState<AccountData | null>(null);

  const refresh = useCallback(async (token: string) => {
    const d = await api<AccountData>("GET", "/api/account", { token });
    setData(d);
  }, []);

  useEffect(() => {
    const boot = async () => {
      const s = admissionsOnline ? loadSession() : null;
      if (s) {
        setSession(s);
        try {
          await refresh(s);
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) {
            clearSession();
            setSession(null);
          }
        }
      }
      setReady(true);
    };
    void boot();
  }, [refresh]);

  const signedIn = async (token: string) => {
    saveSession(token);
    setSession(token);
    await refresh(token);
  };

  const signOut = async () => {
    if (session) await api("POST", "/api/account/logout", { token: session }).catch(() => {});
    clearSession();
    setSession(null);
    setData(null);
  };

  if (!admissionsOnline) {
    return (
      <p className="leading-relaxed text-ink-soft">
        Parent profiles open shortly. Until then, call the school office on{" "}
        <a href={telHref} className="font-semibold text-primary">{SCHOOL.phoneDisplay}</a>.
      </p>
    );
  }
  if (!ready) {
    return (
      <p className="flex items-center gap-2 text-ink-soft">
        <Loader2 size={18} className="animate-spin" /> Opening...
      </p>
    );
  }
  if (!session || !data) return <SignIn onSignedIn={signedIn} />;
  if (data.account.must_change) {
    return <NewPassword session={session} onDone={signedIn} onSignOut={signOut} />;
  }
  return <Profile session={session} data={data} onChanged={signedIn} refresh={() => refresh(session)} onSignOut={signOut} />;
}

// ---------------------------------------------------------------- sign in / create

function SignIn({ onSignedIn }: { onSignedIn: (token: string) => Promise<void> }) {
  const [mode, setMode] = useState<"in" | "new">("in");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Someone who has just applied on this phone has their reference filled in.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("ref");
    const r = (q || loadSaved()?.ref || "").toUpperCase();
    if (r) setRef(r);
    if (q) setMode("new");
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "in" && (!id.trim() || !password)) return setError("Please enter your mobile number or email, and your password.");
    if (mode === "new") {
      if (!ref.trim() || !phone.trim()) return setError("Please enter your reference and the mobile number you applied with.");
      if (password.length < 8) return setError("Please choose a password of at least 8 characters.");
    }
    setBusy(true);
    try {
      const r =
        mode === "in"
          ? await api<{ session: string }>("POST", "/api/account/login", { body: { id, password } })
          : await api<{ session: string }>("POST", "/api/account/register", { body: { ref, phone, password, email } });
      track(mode === "in" ? "account_login" : "account_create", "parent page");
      await onSignedIn(r.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const tab = (m: "in" | "new", label: string) => (
    <button
      type="button"
      onClick={() => { setMode(m); setError(null); setPassword(""); }}
      aria-pressed={mode === m}
      className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
        mode === m ? "bg-primary text-canvas" : "text-primary hover:bg-primary/8"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-xl">
      <div className="flex gap-1 rounded-full border border-line bg-canvas p-1">
        {tab("in", "Sign in")}
        {tab("new", "Create a profile")}
      </div>
      <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
        {mode === "in" ? (
          <div>
            <label htmlFor="login_id" className={labelCls}>Mobile number or email</label>
            <input id="login_id" value={id} onChange={(e) => setId(e.target.value)} className={`mt-2 ${field}`} autoComplete="username" placeholder="The one on your profile" />
          </div>
        ) : (
          <>
            <p className="leading-relaxed text-ink-soft">
              A profile is for families who have applied or enquired. You need the
              reference we gave you, so we know the form is yours.{" "}
              <Link href="/admissions/apply/" className="font-semibold text-primary underline underline-offset-4">
                Not applied yet? Start here.
              </Link>
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="reg_ref" className={labelCls}>Reference</label>
                <input id="reg_ref" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} className={`mt-2 ${field} uppercase`} placeholder="KP27-ABC234" autoComplete="off" />
              </div>
              <div>
                <label htmlFor="reg_phone" className={labelCls}>Mobile number</label>
                <input id="reg_phone" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} className={`mt-2 ${field}`} placeholder="The number you applied with" autoComplete="tel" />
              </div>
            </div>
            <div>
              <label htmlFor="reg_email" className={labelCls}>Email</label>
              <input id="reg_email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-2 ${field}`} placeholder="Only if you use one. You can sign in with it too." autoComplete="email" />
            </div>
          </>
        )}
        <div>
          <label htmlFor="pw" className={labelCls}>{mode === "in" ? "Password" : "Choose a password"}</label>
          <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`mt-2 ${field}`} autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder={mode === "in" ? "" : "At least 8 characters"} />
        </div>
        {error && <Notice>{error}</Notice>}
        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy && <Loader2 size={18} className="animate-spin" />}
          {mode === "in" ? "Sign in" : "Create my profile"}
        </button>
        {mode === "in" && (
          <p className="text-sm leading-relaxed text-ink-soft">
            Forgotten your password? Call the office on{" "}
            <a href={telHref} className="font-semibold text-primary">{SCHOOL.phoneDisplay}</a>{" "}
            from your registered number and we will give you a temporary one.
          </p>
        )}
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- forced new password

function NewPassword({
  session, onDone, onSignOut,
}: { session: string; onDone: (token: string) => Promise<void>; onSignOut: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < 8) return setError("Please choose a password of at least 8 characters.");
    setBusy(true);
    try {
      const r = await api<{ session: string }>("PATCH", "/api/account", {
        token: session,
        body: { password: { current, next } },
      });
      await onDone(r.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-xl space-y-5" noValidate>
      <h2 className="font-display text-2xl md:text-3xl">Choose your own password.</h2>
      <p className="leading-relaxed text-ink-soft">
        You signed in with the temporary password from the office. Please replace it now.
      </p>
      <div>
        <label htmlFor="temp_pw" className={labelCls}>Temporary password</label>
        <input id="temp_pw" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={`mt-2 ${field}`} autoComplete="current-password" />
      </div>
      <div>
        <label htmlFor="next_pw" className={labelCls}>New password</label>
        <input id="next_pw" type="password" value={next} onChange={(e) => setNext(e.target.value)} className={`mt-2 ${field}`} autoComplete="new-password" placeholder="At least 8 characters" />
      </div>
      {error && <Notice>{error}</Notice>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy && <Loader2 size={18} className="animate-spin" />} Save password
        </button>
        <button type="button" onClick={onSignOut} className={quietBtn}>Sign out</button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- profile

function Profile({
  session, data, onChanged, refresh, onSignOut,
}: {
  session: string;
  data: AccountData;
  onChanged: (token: string) => Promise<void>;
  refresh: () => Promise<void>;
  onSignOut: () => void;
}) {
  const { account, applications } = data;
  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl md:text-3xl">Your children</h2>
          <Link href="/admissions/apply/?new=1" className={quietBtn}>
            <Plus size={16} strokeWidth={1.75} /> Apply for another child
          </Link>
        </div>
        {applications.length === 0 ? (
          <p className="mt-5 leading-relaxed text-ink-soft">
            Nothing here yet.{" "}
            <Link href="/admissions/apply/?new=1" className="font-semibold text-primary underline underline-offset-4">
              Start an application
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-5 space-y-5">
            {applications.map((a) => (
              <ChildCard key={a.ref} app={a} session={session} refresh={refresh} />
            ))}
          </ul>
        )}
        <Claim session={session} phone={account.phone} refresh={refresh} />
      </div>
      <Details account={account} session={session} onChanged={onChanged} refresh={refresh} onSignOut={onSignOut} />
    </div>
  );
}

function ChildCard({ app: a, session, refresh }: { app: Application; session: string; refresh: () => Promise<void> }) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const info = STATUS_LABELS[a.status];
  const canAdd = a.kind !== "enquiry" && DOCS_OPEN.includes(a.status);

  const add = async (kind: string, file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(kind);
    try {
      const blob = await shrinkImage(file);
      if (blob.size > 4 * 1024 * 1024) throw new Error("That file is over 4 MB. A phone photo of the page works better.");
      await uploadFile(a.ref, session, kind, blob, file.name);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file did not upload. Please try again.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <li className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]" data-testid={`child-${a.ref}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl">{a.child_name || "Enquiry"}</h3>
        <span className="text-sm text-ink-soft">{a.ref}</span>
      </div>
      <p className="mt-1 text-ink-soft">
        {[a.class_sought, a.child_dob && `born ${a.child_dob.split("-").reverse().join("-")}`].filter(Boolean).join(", ")}
      </p>
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-ink-soft">Progress</p>
      <p className="font-display text-2xl text-primary">{info?.label ?? a.status}</p>
      {a.status_note && (
        <p className="mt-2 rounded-xl border border-line bg-canvas px-4 py-3 font-medium text-ink">{a.status_note}</p>
      )}
      <p className="mt-2 leading-relaxed text-ink-soft">{info?.body}</p>

      {a.status === "started" && (
        <Link href={`/admissions/apply/?ref=${a.ref}`} className={`${primaryBtn} mt-4`}>
          Finish and send this application
        </Link>
      )}

      {a.kind !== "enquiry" && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-sm font-semibold text-ink">Documents</p>
          {a.files.length === 0 && <p className="mt-1 text-sm text-ink-soft">None added yet. You can also bring them on your visit.</p>}
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {a.files.map((f) => (
              <li key={f.id} className="flex items-center gap-2">
                <Check size={15} className="shrink-0 text-primary" /> {DOC_LABEL[f.kind] ?? "Document"}
              </li>
            ))}
          </ul>
          {canAdd && (
            <div className="mt-3 flex flex-wrap gap-2">
              {DOC_KINDS.map((d) => (
                <label key={d.kind} className={`${quietBtn} cursor-pointer ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                  {uploading === d.kind ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} strokeWidth={1.75} />}
                  Add {d.label.toLowerCase()}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="sr-only"
                    data-kind={d.kind}
                    onChange={(e) => {
                      add(d.kind, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              ))}
            </div>
          )}
          {error && <div className="mt-3"><Notice>{error}</Notice></div>}
        </div>
      )}
    </li>
  );
}

/** Bring a form made earlier (before the profile existed) into the profile. */
function Claim({ session, phone, refresh }: { session: string; phone: string; refresh: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api("POST", "/api/account/claim", { token: session, body: { ref, phone } });
      setRef("");
      setOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-6 text-sm font-semibold text-primary underline underline-offset-4">
        Add an application you made earlier
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="mt-6 flex flex-wrap items-end gap-3" noValidate>
      <div>
        <label htmlFor="claim_ref" className={labelCls}>Its reference</label>
        <input id="claim_ref" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} className={`mt-2 ${field} uppercase`} placeholder="KP27-ABC234" />
      </div>
      <button type="submit" disabled={busy || !ref.trim()} className={quietBtn}>
        {busy && <Loader2 size={15} className="animate-spin" />} Add
      </button>
      {error && <div className="w-full"><Notice>{error}</Notice></div>}
      <p className="w-full text-sm text-ink-soft">It must have been made with your mobile number, {phone}.</p>
    </form>
  );
}

function Details({
  account, session, onChanged, refresh, onSignOut,
}: {
  account: Account;
  session: string;
  onChanged: (token: string) => Promise<void>;
  refresh: () => Promise<void>;
  onSignOut: () => void;
}) {
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const body: Record<string, unknown> = {};
    if (name.trim() !== account.name) body.name = name;
    if (email.trim().toLowerCase() !== account.email) body.email = email;
    if (next || current) {
      if (next.length < 8) return setMsg({ tone: "warn", text: "Please choose a new password of at least 8 characters." });
      body.password = { current, next };
    }
    if (!Object.keys(body).length) return setMsg({ tone: "ok", text: "Nothing to change." });
    setBusy(true);
    try {
      const r = await api<{ session?: string }>("PATCH", "/api/account", { token: session, body });
      setCurrent("");
      setNext("");
      if (r.session) await onChanged(r.session);
      else await refresh();
      setMsg({ tone: "ok", text: "Saved." });
    } catch (err) {
      setMsg({ tone: "warn", text: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside>
      <h2 className="font-display text-2xl md:text-3xl">Your details</h2>
      <form onSubmit={save} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor="acc_name" className={labelCls}>Your name</label>
          <input id="acc_name" value={name} onChange={(e) => setName(e.target.value)} className={`mt-2 ${field}`} autoComplete="name" />
        </div>
        <div>
          <p className={labelCls}>Mobile number</p>
          <p className="mt-2 flex items-center gap-2 text-ink">
            <Phone size={16} strokeWidth={1.75} className="text-primary" /> {account.phone}
          </p>
          <p className="mt-1 text-sm text-ink-soft">This is how you sign in. To change it, call the office.</p>
        </div>
        <div>
          <label htmlFor="acc_email" className={labelCls}>Email</label>
          <input id="acc_email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-2 ${field}`} autoComplete="email" placeholder="Add one to sign in with it too" />
        </div>
        <fieldset className="rounded-xl border border-line p-4">
          <legend className="px-2 text-sm font-semibold text-primary">Change password</legend>
          <label htmlFor="acc_current" className={labelCls}>Current password</label>
          <input id="acc_current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={`mt-2 ${field}`} autoComplete="current-password" />
          <label htmlFor="acc_next" className={`${labelCls} mt-4`}>New password</label>
          <input id="acc_next" type="password" value={next} onChange={(e) => setNext(e.target.value)} className={`mt-2 ${field}`} autoComplete="new-password" placeholder="At least 8 characters" />
        </fieldset>
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy && <Loader2 size={18} className="animate-spin" />} Save
          </button>
          <button type="button" onClick={onSignOut} className={quietBtn}>
            <LogOut size={16} strokeWidth={1.75} /> Sign out
          </button>
        </div>
      </form>
    </aside>
  );
}
