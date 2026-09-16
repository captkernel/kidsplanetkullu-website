"use client";

import Link from "next/link";
import { CalendarDays, MessageCircle } from "lucide-react";
import { whatsappHref } from "@/lib/links";

// Sticky bottom bar (mobile only). Respects the iOS home indicator.
export function StickyMobileCTA() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-2 gap-2 px-3 py-2.5">
        <a
          href={whatsappHref("Hello, I would like to know more about admissions at Kids Planet.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full border border-primary/40 py-3 text-sm font-semibold text-primary active:scale-[0.98]"
        >
          <MessageCircle size={18} strokeWidth={1.75} />
          WhatsApp
        </a>
        <Link
          href="/admissions#visit"
          className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-canvas active:scale-[0.98]"
        >
          <CalendarDays size={18} strokeWidth={1.75} />
          Book a Visit
        </Link>
      </div>
    </div>
  );
}
