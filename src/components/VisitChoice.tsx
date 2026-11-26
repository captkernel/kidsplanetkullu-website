"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { allow, browserSaysNo, canStore, decline, getChoice, isPrivatePath, onChoiceChange, withdraw } from "@/lib/consent";
import { startRecording, stopRecording } from "@/lib/recorder";
import { endpoint, track } from "@/lib/track";

const btn =
  "inline-flex flex-1 items-center justify-center rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white";

const snapshot = () => getChoice()?.value ?? "none";
const noSubscribe = () => () => {};
const useChoice = () => useSyncExternalStore(onChoiceChange, snapshot, () => "none");

/** Asks once, quietly, after someone has actually used the site. Also runs the recorder. */
export function VisitChoice() {
  const pathname = usePathname();
  const choice = useChoice();
  const [show, setShow] = useState(false);
  const pages = useRef(0);

  // Layout effect: on a tap into a private page the recorder must stop in the same step that puts
  // the page on screen, before it can see any of it.
  useLayoutEffect(() => {
    if (choice === "allow" && !isPrivatePath(pathname)) {
      const t = setTimeout(() => void startRecording(), 1500);
      return () => clearTimeout(t);
    }
    stopRecording(choice !== "allow");
  }, [choice, pathname]);

  useEffect(() => {
    pages.current += 1;
    // Not on the link-in-bio page: the card would sit over its buttons. The next page asks instead.
    if (choice !== "none" || !endpoint("/r") || browserSaysNo() || !canStore() || isPrivatePath(pathname) || pathname.startsWith("/links")) return;
    const t = setTimeout(() => {
      // Never over someone filling in a form.
      if (document.activeElement?.closest("form")) return;
      setShow(true);
    }, pages.current >= 2 ? 4000 : 25000);
    return () => clearTimeout(t);
  }, [choice, pathname]);

  if (!show || choice !== "none" || isPrivatePath(pathname) || pathname.startsWith("/privacy") || pathname.startsWith("/links")) return null;

  return (
    <section
      aria-label="Your choice about this visit"
      className="fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 rounded-2xl border border-line bg-canvas p-4 shadow-lg sm:left-auto sm:right-4 sm:max-w-sm lg:bottom-5 lg:right-5"
      data-testid="visit-choice"
    >
      <p className="text-sm leading-relaxed text-ink">
        <strong>May we remember this device?</strong> With your permission we note return visits and record how
        pages are scrolled and tapped, to make this website easier to use. Forms are never recorded. If you are under
        18, please choose No.{" "}
        <Link href="/privacy/#visits" className="font-semibold text-primary underline underline-offset-4">
          What this means
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" className={btn} onClick={() => { decline(); track("visit_choice", "no"); }}>
          No thanks
        </button>
        <button type="button" className={btn} onClick={() => { allow(); track("visit_choice", "allow"); }}>
          Allow
        </button>
      </div>
    </section>
  );
}

/** On the privacy page: see and change the choice at any time. */
export function VisitControls() {
  const choice = useChoice();
  const [msg, setMsg] = useState("");
  const blocked = useSyncExternalStore(noSubscribe, browserSaysNo, () => false);
  // Rendered only in the browser: the server cannot know this device's choice.
  const ready = useSyncExternalStore(noSubscribe, () => !!endpoint("/r"), () => false);
  if (!ready) return null;
  return (
    <div className="mt-4 rounded-xl border border-line bg-surface p-4" data-testid="visit-controls">
      <p className="text-ink">
        {blocked
          ? "Your browser asks websites not to track you, so this is off and we will not ask."
          : choice === "allow"
            ? "This device: remembered, and visits may be recorded."
            : "This device: not remembered, and nothing is recorded."}
      </p>
      {!blocked && (
        <div className="mt-3 flex max-w-sm">
          {choice === "allow" ? (
            <button
              type="button"
              className={btn}
              onClick={async () => {
                stopRecording(true);
                const ok = await withdraw();
                setMsg(ok
                  ? "Stopped. The recordings and the link between your visits have been deleted."
                  : "Stopped on this device. We could not reach the store to delete past recordings; they are deleted within 30 days, or call the office.");
              }}
            >
              Stop and delete
            </button>
          ) : (
            <button type="button" className={btn} onClick={() => { allow(); setMsg("Thank you."); }}>
              Allow
            </button>
          )}
        </div>
      )}
      {msg && <p role="status" className="mt-3 text-sm text-ink-soft">{msg}</p>}
    </div>
  );
}
