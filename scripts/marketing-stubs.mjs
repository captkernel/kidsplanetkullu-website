// Writes the public stand-ins for the teachers' pages.
//
// The real pages and pictures live in staff-assets/marketing/ and are served only by the
// kp-staff Worker, after Google sign-in. GitHub Pages keeps a tiny page at each old address
// (kidsplanetkullu.com/marketing/<teacher>/) that forwards to the same path on the Worker,
// so links teachers already have keep working.
//
// Run after adding or removing a teacher page:   node scripts/marketing-stubs.mjs
import { readdirSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Where the Worker answers. Change once if it moves (for example to https://staff.kidsplanetkullu.com).
const STAFF = "https://kp-staff.kidsplanetkullu.workers.dev";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "staff-assets", "marketing");
const out = join(root, "public", "marketing");
if (!existsSync(src)) throw new Error(`Missing ${src}: move public/marketing there first (see TEACHER-PORTAL.md).`);

const pages = [""].concat(readdirSync(src).filter((d) => existsSync(join(src, d, "index.html"))).sort());
rmSync(out, { recursive: true, force: true });
for (const d of pages) {
  const path = `/marketing/${d ? d + "/" : ""}`;
  mkdirSync(join(out, d), { recursive: true });
  writeFileSync(
    join(out, d, "index.html"),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Kids Planet teachers · sign in</title>
<!-- The teachers' pages now sit behind staff sign-in. Made by scripts/marketing-stubs.mjs. -->
<meta http-equiv="refresh" content="0; url=${STAFF}${path}">
<script>location.replace("${STAFF}"+location.pathname+location.search+location.hash)</script>
</head><body style="font:17px/1.5 system-ui,sans-serif;max-width:520px;margin:40px auto;padding:0 16px">
<p>The teachers' pages have moved behind staff sign-in. <a href="${STAFF}${path}">Continue to sign in</a>.</p>
</body></html>
`
  );
}
console.log(`Wrote ${pages.length} stand-in pages to public/marketing/.`);
