// Short links for the sharing pages: kidsplanetkullu.com/t/<short>/<app>[/apply]
//
// Each one is a tiny static page that forwards to the long tracked link the sharing pages used
// to paste into captions, so the reports (utm_source, utm_medium, utm_campaign, utm_content)
// read exactly as before. Parents see a short, readable address instead of a line of tags.
//
//   /t/alpana/wa        WhatsApp  -> /admissions/?utm_source=teacher&utm_medium=whatsapp&...&utm_content=alpana-gautam#enquire
//   /t/alpana/fb        Facebook
//   /t/alpana/ig        Instagram (her bio link)
//   /t/alpana/wa/apply  the same, but to the online application form (the "Apply from your phone" card)
//
// The names come from `short` in people.js (public/marketing/ or staff-assets/marketing/).
// Run after adding a person or changing a short name:   node scripts/short-links.mjs
// It rewrites public/t/ completely. Never rename a short name someone has already shared.

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://kidsplanetkullu.com";
const CAMPAIGN = "digital27";
const APPS = { wa: "whatsapp", fb: "facebook", ig: "instagram" };
const DEST = {
  "": { path: "/admissions/", hash: "#enquire", title: "Admissions 2027-28 are open", desc: "Pre-Nursery (age 2+) to Class 8 in Dhalpur, Kullu. Visit on any working day, no appointment needed." },
  apply: { path: "/admissions/apply/", hash: "", title: "Apply online for 2027-28", desc: "Apply from your phone with a free parent profile. No fee to apply." },
};

const peopleFile = ["public/marketing/people.js", "staff-assets/marketing/people.js"]
  .map((p) => path.join(ROOT, p))
  .find((p) => fs.existsSync(p));
if (!peopleFile) throw new Error("people.js not found in public/marketing/ or staff-assets/marketing/");
const box = { window: {} };
vm.runInNewContext(fs.readFileSync(peopleFile, "utf8"), box);
const people = box.window.KP_PEOPLE || {};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const seen = new Map();
for (const [slug, p] of Object.entries(people)) {
  if (!p.short) continue;
  if (!/^[a-z]+$/.test(p.short)) throw new Error(`${slug}: short "${p.short}" must be lowercase letters only`);
  if (seen.has(p.short)) throw new Error(`short "${p.short}" is used by both ${seen.get(p.short)} and ${slug}`);
  seen.set(p.short, slug);
}

const out = path.join(ROOT, "public", "t");
fs.rmSync(out, { recursive: true, force: true });
let n = 0;
for (const [short, slug] of seen) {
  const source = people[slug].staff ? "school" : "teacher";
  for (const [code, medium] of Object.entries(APPS)) {
    for (const [d, dest] of Object.entries(DEST)) {
      const q = new URLSearchParams({ utm_source: source, utm_medium: medium, utm_campaign: CAMPAIGN, utm_content: slug });
      const to = `${SITE}${dest.path}?${q}${dest.hash}`;
      const dir = path.join(out, short, code, d);
      fs.mkdirSync(dir, { recursive: true });
      // no-referrer: the landing page should not count this forwarding page as where the visit came from.
      fs.writeFileSync(
        path.join(dir, "index.html"),
        `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kids Planet School · ${esc(dest.title)}</title><meta name="robots" content="noindex"><meta name="referrer" content="no-referrer">
<meta property="og:type" content="website"><meta property="og:site_name" content="Kids Planet School"><meta property="og:title" content="Kids Planet School · ${esc(dest.title)}">
<meta property="og:description" content="${esc(dest.desc)}"><meta property="og:image" content="${SITE}/og-image.png">
<link rel="canonical" href="${SITE}${dest.path}"><meta http-equiv="refresh" content="0;url=${esc(to)}">
<script>location.replace(${JSON.stringify(to)})</script></head>
<body style="font:17px/1.5 system-ui,sans-serif;padding:24px"><p><a href="${esc(to)}">Continue to Kids Planet School</a></p></body></html>
`
      );
      n++;
    }
  }
}
console.log(`Made ${n} short-link pages for ${seen.size} people in public/t/`);
