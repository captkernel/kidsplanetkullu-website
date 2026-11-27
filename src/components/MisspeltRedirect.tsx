"use client";

import { useEffect } from "react";

// Addresses people actually typed or followed that do not exist (seen in the visitor log),
// matched loosely, and where they should go. Query and #anchor are kept, so tracked
// links (utm_...) still count where they came from.
const RULES: [RegExp, string][] = [
  [/^\/ad+m[a-z]*s+[a-z]*n/i, "/admissions/"], // admsslons, admssions, admisions, addmissions...
  [/^\/apply/i, "/admissions/apply/"],
  [/^\/(enquir|inquir|enquire)/i, "/admissions/#enquire"],
  [/^\/fee/i, "/admissions/"],
  [/^\/faq/i, "/admissions/"],
  [/^\/(login|signin|sign-in|parents?-?login)/i, "/parent/"],
  [/^\/(classes|program|curriculum)/i, "/programs/"],
  [/^\/(teachers?|staff)/i, "/faculty/"],
  [/^\/(contact|location|map)/i, "/contact/"],
  [/^\/(about|history)/i, "/about/"],
];

export function MisspeltRedirect() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    for (const [re, to] of RULES) {
      if (re.test(pathname) && !pathname.startsWith(to.split("#")[0])) {
        const [path, anchor] = to.split("#");
        window.location.replace(path + search + (hash || (anchor ? "#" + anchor : "")));
        return;
      }
    }
  }, []);
  return null;
}
