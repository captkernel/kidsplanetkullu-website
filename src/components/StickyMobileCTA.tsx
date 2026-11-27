"use client";

import { usePathname } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { telHref, whatsappHref } from "@/lib/links";

// Pages where a mis-tap on the bar would lose what a parent is typing.
const HIDDEN_ON = ["/admissions/apply", "/admissions/status", "/parent"];

// Sticky bottom bar (mobile only): the two ways parents actually reach the office.
// Respects the iOS home indicator.
export function StickyMobileCTA() {
  const pathname = usePathname() || "/";
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;
  return (
    <div
      data-site-bar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-2 gap-2 px-3 py-2.5">
        <a
          href={telHref}
          className="flex items-center justify-center gap-2 rounded-full border border-primary/40 py-3 text-sm font-semibold text-primary active:scale-[0.98]"
        >
          <Phone size={18} strokeWidth={1.75} />
          Call
        </a>
        <a
          href={whatsappHref("Hello, I would like to know more about admissions at Kids Planet.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-canvas active:scale-[0.98]"
        >
          <MessageCircle size={18} strokeWidth={1.75} />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
