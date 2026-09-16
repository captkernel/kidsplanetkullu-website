// Build-time export: pull PUBLIC-SAFE teacher info from the Kids Planet portal DB
// (staff_profiles + staff_subjects) into the website. Re-run to refresh.
// Excludes all PII (phone, email, salary, aadhaar, address, dob, emergency contact).
// Usage: node scripts/pull-faculty.mjs   (run from website-v2/)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const DASH = "C:/Claude/KidsPlanet/dashboard";
const require = createRequire(DASH + "/");
const { Client } = require("pg");

const env = Object.fromEntries(
  readFileSync(DASH + "/.env.local", "utf8")
    .split(/\r?\n/).filter((l) => /^[A-Z]/.test(l))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).trim()]; })
);

const OUT = "src/data/faculty.generated.json";

const c = new Client({ host: env.PGHOST, port: env.PGPORT, user: env.PGUSER, password: env.PGPASSWORD, database: env.PGDATABASE });
await c.connect();

const statuses = await c.query("select coalesce(status,'(null)') s, count(*) n from staff_profiles group by 1 order by 2 desc");
console.log("status values:", statuses.rows.map((r) => `${r.s}:${r.n}`).join("  "));

// PUBLIC fields only. Active staff only.
const { rows } = await c.query(`
  select sp.id, sp.full_name, sp.designation, sp.appointed_level, sp.teacher_type,
         coalesce(json_agg(distinct jsonb_build_object('subject', ss.subject, 'class', ss.class_label, 'main', ss.is_main))
                  filter (where ss.subject is not null), '[]') as subjects
  from staff_profiles sp
  left join staff_subjects ss on ss.staff_id = sp.id
  where sp.full_name is not null
    and (sp.status is null or lower(sp.status) in ('active','working','on roll','on-roll'))
  group by sp.id
  order by sp.full_name
`);

const clean = (s) => (s || "").replace(/[–—]/g, "-").trim(); // no en/em dashes (anti-slop)
const teachers = rows.map((r) => {
  const subs = [...new Set((r.subjects || []).map((x) => clean(x.subject)).filter(Boolean))];
  const main = (r.subjects || []).find((x) => x.main);
  return {
    name: clean(r.full_name),
    title: clean(r.designation) || "Teacher",
    level: clean(r.appointed_level) || null,
    isTeacher: /teach/i.test(r.designation || "") || !!r.teacher_type || subs.length > 0,
    mainSubject: main ? clean(main.subject) : subs[0] || null,
    subjects: subs,
  };
});

const payload = {
  source: "Kids Planet Student Portal (staff_profiles) — public fields only",
  generatedAt: new Date().toISOString().slice(0, 10),
  note: "No PII. Photos intentionally omitted (require consent before public use).",
  count: teachers.length,
  teachers,
};

mkdirSync("src/data", { recursive: true });
writeFileSync(OUT, JSON.stringify(payload, null, 2));
console.log(`\nexported ${teachers.length} staff -> ${OUT}`);
console.log("teaching staff:", teachers.filter((t) => t.isTeacher).length);
console.log("sample titles:", [...new Set(teachers.map((t) => t.title))].slice(0, 8).join(", "));
await c.end();
