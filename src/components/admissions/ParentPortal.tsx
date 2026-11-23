"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, FileUp, Loader2, LogOut, Phone, Plus, ShieldCheck, Smartphone } from "lucide-react";
import {
  admissionsOnline, api, ApiError, clearSession, DOC_KINDS, EVENT_WORDS, fetchFeatures, loadSaved, loadSession,
  MIN_PASSWORD, saveSession, shrinkImage, STATUS_LABELS, uploadFile,
  type Account, type AccountData, type Application, type Features,
} from "@/lib/admissions";
import { SCHOOL } from "@/lib/constants";
import { telHref } from "@/lib/links";
import { track } from "@/lib/track";
import { HumanCheck } from "./HumanCheck";
import { PasswordField } from "./PasswordField";

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
const SHORT = `Please choose a password of at least ${MIN_PASSWORD} characters.`;

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

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
  const [features, setFeatures] = useState<Features>({ human_check: false, verify_phone: false, messages: false });

  const refresh = useCallback(async (token: string) => {
    const d = await api<AccountData>("GET", "/api/account", { token });
    setData(d);
  }, []);

  useEffect(() => {
    const boot = async () => {
      const s = admissionsOnline ? loadSession() : null;
      if (admissionsOnline) fetchFeatures().then(setFeatures);
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
  return (
    <Profile
      session={session}
      data={data}
      features={features}
      setData={setData}
      onChanged={signedIn}
      refresh={() => refresh(session)}
      onSignOut={signOut}
    />
  );
}

// ---------------------------------------------------------------- sign in / create

function SignIn({ onSignedIn }: { onSignedIn: (token: string) => Promise<void> }) {
  const [mode, setMode] = useState<"in" | "new">("in");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [human, setHuman] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Someone who has just applied on this phone has their reference filled in.
  useEffect(() => {
    const prefill = async () => {
      const q = new URLSearchParams(window.location.search).get("ref");
      const r = (q || loadSaved()?.ref || "").toUpperCase();
      if (r) setRef(r);
      if (q) setMode("new");
    };
    void prefill();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "in" && (!id.trim() || !password)) return setError("Please enter your mobile number or email, and your password.");
    if (mode === "new") {
      if (!ref.trim() || !phone.trim()) return setError("Please enter your reference and the mobile number you applied with.");
      if (password.length < MIN_PASSWORD) return setError(SHORT);
      if (password !== confirm) return setError("The two passwords are not the same. Please type them again.");
    }
    setBusy(true);
    try {
      const r =
        mode === "in"
          ? await api<{ session: string }>("POST", "/api/account/login", { body: { id, password, ts: human } })
          : await api<{ session: string }>("POST", "/api/account/register", { body: { ref, phone, password, email, ts: human } });
      track(mode === "in" ? "account_login" : "account_create", "parent page");
      await onSignedIn(r.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
      setRound((n) => n + 1); // a human-check token works once
    } finally {
      setBusy(false);
    }
  };

  const tab = (m: "in" | "new", label: string) => (
    <button
      type="button"
      onClick={() => { setMode(m); setError(null); setPassword(""); setConfirm(""); }}
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
          <>
            <div>
              <label htmlFor="login_id" className={labelCls}>Mobile number or email</label>
              <input id="login_id" value={id} onChange={(e) => setId(e.target.value)} className={`mt-2 ${field}`} autoComplete="username" autoCapitalize="none" placeholder="The one on your profile" />
            </div>
            <PasswordField id="pw" label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
          </>
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
            <PasswordField id="pw" label="Choose a password" value={password} onChange={setPassword} autoComplete="new-password" guide />
            <PasswordField id="pw2" label="Type it once more" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          </>
        )}
        <HumanCheck onToken={setHuman} resetKey={round} />
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
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < MIN_PASSWORD) return setError(SHORT);
    if (next !== confirm) return setError("The two new passwords are not the same. Please type them again.");
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
        It stops working after 24 hours.
      </p>
      <PasswordField id="temp_pw" label="Temporary password" value={current} onChange={setCurrent} autoComplete="current-password" />
      <PasswordField id="next_pw" label="New password" value={next} onChange={setNext} autoComplete="new-password" guide />
      <PasswordField id="next_pw2" label="Type it once more" value={confirm} onChange={setConfirm} autoComplete="new-password" />
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

type ProfileProps = {
  session: string;
  data: AccountData;
  features: Features;
  setData: (d: AccountData) => void;
  onChanged: (token: string) => Promise<void>;
  refresh: () => Promise<void>;
  onSignOut: () => void;
};

function Profile(props: ProfileProps) {
  const { session, data, refresh } = props;
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
      <div className="space-y-10">
        <Details {...props} account={account} />
        <Security {...props} />
      </div>
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
      await api("POST", "/api/account/claim", { token: session, body: { ref } });
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

function Details({ account, session, onChanged, refresh, onSignOut }: ProfileProps & { account: Account }) {
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const emailChanged = email.trim().toLowerCase() !== account.email;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const body: Record<string, unknown> = {};
    if (name.trim() !== account.name) body.name = name;
    if (emailChanged) {
      if (!current) return setMsg({ tone: "warn", text: "Please enter your current password to change your email." });
      body.email = email;
      body.current_password = current;
    }
    if (next) {
      if (next.length < MIN_PASSWORD) return setMsg({ tone: "warn", text: SHORT });
      if (next !== confirm) return setMsg({ tone: "warn", text: "The two new passwords are not the same. Please type them again." });
      body.password = { current, next };
    }
    if (!Object.keys(body).length) return setMsg({ tone: "ok", text: "Nothing to change." });
    setBusy(true);
    try {
      const r = await api<{ session?: string }>("PATCH", "/api/account", { token: session, body });
      setCurrent("");
      setNext("");
      setConfirm("");
      if (r.session) await onChanged(r.session);
      else await refresh();
      setMsg({ tone: "ok", text: r.session ? "Saved. Other phones have been signed out." : "Saved." });
    } catch (err) {
      setMsg({ tone: "warn", text: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
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
        <fieldset className="space-y-4 rounded-xl border border-line p-4">
          <legend className="px-2 text-sm font-semibold text-primary">Password</legend>
          <PasswordField id="acc_current" label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" placeholder="Needed to change your email or password" />
          <PasswordField id="acc_next" label="New password" value={next} onChange={setNext} autoComplete="new-password" placeholder="Leave blank to keep the current one" guide={next.length > 0} />
          {next.length > 0 && (
            <PasswordField id="acc_next2" label="Type the new password once more" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          )}
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
    </section>
  );
}

/** Who is signed in, what has happened on the profile, and proving the number. */
function Security({ session, data, features, setData }: ProfileProps) {
  const { account, sessions, events } = data;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const revoke = (body: Record<string, unknown>) =>
    run(async () => setData(await api<AccountData>("POST", "/api/account/sessions/revoke", { token: session, body })));

  const others = sessions.filter((s) => !s.current);

  return (
    <section data-testid="security">
      <h2 className="flex items-center gap-2 font-display text-2xl md:text-3xl">
        <ShieldCheck size={24} strokeWidth={1.75} className="text-primary" /> Security
      </h2>

      {features.verify_phone && (
        <div className="mt-5 rounded-xl border border-line p-4">
          {account.phone_verified ? (
            <p className="flex items-center gap-2 font-semibold text-ink">
              <Check size={16} className="text-primary" /> Mobile number confirmed
            </p>
          ) : codeSent ? (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                run(async () => setData(await api<AccountData>("POST", "/api/account/verify/confirm", { token: session, body: { code } })));
              }}
            >
              <label htmlFor="otp" className={labelCls}>Enter the 6 digit code we sent on WhatsApp</label>
              <input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className={`${field} tracking-[0.4em]`} />
              <button type="submit" disabled={busy || code.length !== 6} className={quietBtn}>Confirm</button>
            </form>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-ink-soft">
                Confirm that {account.phone} is yours with a one-time code on WhatsApp.
              </p>
              <button
                type="button"
                disabled={busy}
                className={`${quietBtn} mt-3`}
                onClick={() => run(async () => { await api("POST", "/api/account/verify/start", { token: session }); setCodeSent(true); })}
              >
                Send me a code
              </button>
            </>
          )}
        </div>
      )}

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-ink-soft">Signed in on</h3>
      <ul className="mt-2 divide-y divide-line">
        {sessions.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <span className="flex items-start gap-2 text-ink">
              <Smartphone size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" />
              <span>
                {s.device || "Unknown device"}
                {s.current && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">this phone</span>}
                <span className="block text-ink-soft">Last used {when(s.last_used_at)}</span>
              </span>
            </span>
            {!s.current && (
              <button type="button" disabled={busy} onClick={() => revoke({ id: s.id })} className="shrink-0 font-semibold text-primary underline underline-offset-4">
                Sign out
              </button>
            )}
          </li>
        ))}
      </ul>
      {others.length > 0 && (
        <button type="button" disabled={busy} onClick={() => revoke({ others: true })} className={`${quietBtn} mt-2`}>
          Sign out everywhere else
        </button>
      )}

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-ink-soft">Recent activity</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {events.map((e, i) => (
          <li key={i} className="flex justify-between gap-3">
            <span className="text-ink">
              {EVENT_WORDS[e.kind] ?? e.kind.replace(/_/g, " ")}
              {e.device && <span className="text-ink-soft"> · {e.device}</span>}
            </span>
            <span className="shrink-0 text-ink-soft">{when(e.at)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-ink-soft">
        Something here you do not recognise? Change your password, then call the office.
      </p>
      {error && <div className="mt-3"><Notice>{error}</Notice></div>}
    </section>
  );
}
