# Teacher portal: Google sign-in in front of /marketing/

## What changes

Before: every teacher's sharing page and all ~40 MB of pictures sat in `public/marketing/`, so
anyone with the address (or anyone browsing this public GitHub repo) could open any teacher's page.

After: the real pages live in `website-v2/staff-assets/marketing/` and are served only by the
**kp-staff** Cloudflare Worker (code in the school workspace at `KidsPlanet/staff-portal/`).
The Worker checks every request, pictures included, against Google sign-in and the staff list:

- A teacher signs in with their Google account. Only emails on the staff list get in.
- They see their portal home: **Marketing** (their own page), and placeholders for Attendance,
  Salary, Fees, My work and Substitutions until the school portal is connected.
- They can open only their own page and pictures, plus the shared school pictures. Another
  teacher's page or pictures are refused by the server (403), not just hidden.
- Admins (principal, office) see everything, including the teacher list and the link builder,
  and manage the staff list at `/admin/`.

`kidsplanetkullu.com/marketing/<teacher>/` keeps working: it is now a tiny page that forwards to
the same path on the Worker, which asks for sign-in first. So the links teachers already have still work.

## Apply to website-v2 (so the next publish does not undo it)

From `C:\Claude\KidsPlanet\website-v2`:

1. Move the real pages out of the public folder:
   `Move-Item public\marketing staff-assets\marketing`
2. Copy in `scripts/marketing-stubs.mjs` and the updated `scripts/publish.ps1` from this change
   (publish.ps1 now skips `staff-assets`).
3. Make the forwarding pages: `node scripts/marketing-stubs.mjs`
4. Copy this file in too, then publish as usual.

Do steps 1 to 3 only once the Worker is live (below). Publishing before that sends teachers to an
address that does not answer yet.

When you add a teacher page later: put it in `staff-assets/marketing/<slug>/`, run
`node scripts/marketing-stubs.mjs`, publish the site, and redeploy the Worker.

## Before it goes live (each is your call)

1. **Cloudflare:** create the database (`npx wrangler d1 create kp-staff`), load `schema.sql`,
   and deploy the Worker (`npx wrangler deploy` in `staff-portal/`). Uses the same Cloudflare
   account as the PaperCheck and admissions Workers. At this size it should fit Cloudflare's free
   tier; check the plan page when you deploy.
2. **Google:** add `https://kp-staff.kidsplanetkullu.workers.dev` to the Authorized JavaScript
   origins of the Google OAuth client the parent sign-in uses, and put that client id in
   `wrangler.jsonc` (`GOOGLE_CLIENT_ID`).
3. **First admin:** put your own Google email in `ADMIN_EMAILS`, sign in, then add each teacher's
   real Gmail address and page name on `/admin/`.
4. **Old copies:** this repo is public, so the pictures stay visible in its git history even after
   this change. To close that, either make the repo private (GitHub Pages from a private repo needs
   a paid GitHub plan) or rewrite its history. Ask before doing either.
5. Optional: a nicer address such as `staff.kidsplanetkullu.com` (needs the domain's DNS on
   Cloudflare). Change `STAFF` in `scripts/marketing-stubs.mjs` if you do.
