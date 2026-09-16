// Build-time export: pull PUBLIC-SAFE staff info from the Kids Planet portal DB
// (staff_profiles + staff_subjects) into the website, and copy each active staff
// member's portal portrait (photo-day headshot) into public/images/faculty/ as a
// small web-sized JPEG. Re-run whenever staff join or leave.
//
// Excludes all PII (phone, email, salary, aadhaar, address, dob, emergency contact).
// Usage (from website-v2/):  node scripts/pull-faculty.mjs
// Needs: dashboard/.env.local (PG*), python with Pillow (for resizing).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const DASH = "C:/Claude/KidsPlanet/dashboard";
const require = createRequire(DASH + "/");
const { Client } = require("pg");

const OUT = "src/data/faculty.generated.json";
const PHOTO_DIR = "public/images/faculty";
const PHOTO_W = 480; // 3:4 tiles render at 64-96px wide; 480x640 is plenty for 2x/3x screens

// Public roles beyond "Teacher" (school leadership as of Sept 2026).
const TITLE_OVERRIDES = {
  "Divya Thakur": "Vice Principal",
  "Ribha Sharma": "Administration",
};

// Class-teacher map from the 2026-27 timetable (portal class_id is not yet filled).
const CLASS_TEACHER = {
  "Divya Thakur": "Class 1",
  "Meenu Bala": "Class 2",
  "Alpana Gautam": "Class 3",
  "Ravina": "Class 4",
  "Yamika Chaudhary": "Class 5",
  "Pragya Sharma": "Class 6",
  "Santosh": "Class 7",
  "Kanika Sharma": "Class 8",
  "Madhavi": "Nursery",
  "Vipasha Bhardwaj": "LKG",
};

// Qualifications as recorded in the KP Master Staff Register (public, non-PII).
// Blank for staff whose entry is pending a register update.
const QUALIFICATIONS = {
  "Alpana Gautam": "B.A., B.Ed, PdPet, DIT, TET",
  "Broniya Jambal Sharma": "MA, B.Ed, PdPet, TET, NTT",
  "Pragya Sharma": "MBA, PGDCA",
  "Divya Thakur": "BBA, D.El.Ed",
  "Yamika Chaudhary": "MA (English), B.Ed, Pd.Pet, CCA, TET",
};

const env = Object.fromEntries(
  readFileSync(DASH + "/.env.local", "utf8")
    .split(/\r?\n/).filter((l) => /^[A-Z]/.test(l))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).trim()]; })
);

const c = new Client({ host: env.PGHOST, port: env.PGPORT, user: env.PGUSER, password: env.PGPASSWORD, database: env.PGDATABASE });
await c.connect();

// PUBLIC fields only. Active staff only.
const { rows } = await c.query(`
  select sp.full_name, sp.designation, sp.photo_url,
         (select string_agg(distinct ss.subject, '|') from staff_subjects ss where ss.staff_id = sp.id) as subjects
  from staff_profiles sp
  where sp.full_name is not null and lower(coalesce(sp.status, '')) = 'active'
  order by sp.full_name
`);
await c.end();

const clean = (s) => (s || "").replace(/[–—]/g, "-").trim(); // no en/em dashes
const slug = (s) => clean(s).toLowerCase().replace(/[()]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

mkdirSync(PHOTO_DIR, { recursive: true });
const resizeJobs = [];

const staff = rows.map((r) => {
  const name = clean(r.full_name);
  const isTeacher = /teach/i.test(r.designation || "");
  const subjects = (r.subjects || "").split("|").map(clean).filter(Boolean).sort();
  let photo = null;
  // Hand-picked override (website-v2/portraits/<slug>.jpg) wins over the portal photo.
  const override = `portraits/${slug(name)}.jpg`;
  if (existsSync(override)) {
    const file = `${slug(name)}.jpg`;
    resizeJobs.push([override, `${PHOTO_DIR}/${file}`]);
    photo = `/images/faculty/${file}`;
  } else if (r.photo_url) {
    const src = `${DASH}/${r.photo_url}`;
    if (existsSync(src)) {
      const file = `${slug(name)}.jpg`;
      resizeJobs.push([src, `${PHOTO_DIR}/${file}`]);
      photo = `/images/faculty/${file}`;
    } else {
      console.warn(`photo missing on disk for ${name}: ${src}`);
    }
  }
  return {
    name,
    title: TITLE_OVERRIDES[name] || (isTeacher ? "Teacher" : "Support staff"),
    isTeacher,
    classTeacherOf: CLASS_TEACHER[name] || null,
    subjects: isTeacher ? subjects : [],
    qualification: QUALIFICATIONS[name] || "",
    photo,
  };
});

// Resize portraits with Pillow (centre-crop to 3:4, JPEG q82).
const py = `
import sys
from PIL import Image, ImageOps
w = ${PHOTO_W}; h = int(w * 4 / 3)
for src, dst in zip(sys.argv[1::2], sys.argv[2::2]):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(0.5, 0.4)).save(dst, "JPEG", quality=82, optimize=True, progressive=True)
print(f"resized {len(sys.argv)//2} portraits")
`;
if (resizeJobs.length) {
  execFileSync("python", ["-c", py, ...resizeJobs.flat()], { stdio: "inherit" });
}

const teachers = staff.filter((s) => s.isTeacher);
const payload = {
  source: "Kids Planet Student Portal (staff_profiles, active) - public fields only: name, role, subjects, class, qualification, portrait",
  generatedAt: new Date().toISOString().slice(0, 10),
  count: staff.length,
  teacherCount: teachers.length,
  staff,
};
writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
console.log(`exported ${staff.length} active staff (${teachers.length} teaching) -> ${OUT}`);
console.log("no photo:", staff.filter((s) => !s.photo).map((s) => s.name).join(", ") || "none");
