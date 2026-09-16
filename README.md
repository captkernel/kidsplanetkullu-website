# kidsplanetkullu.com

Public marketing website for Kids Planet School, Dhalpur, Kullu. Next.js static export, deployed to GitHub Pages on every push to `main`.

Source of truth lives in the school workspace at `KidsPlanet/website-v2/`; this repo contains only the public website (no school data). Sync it from there, then push.

- Build locally: `npm ci && npm run build` (output in `out/`)
- Refresh faculty list: `node scripts/pull-faculty.mjs` from the workspace copy (needs portal DB), then copy `src/data/faculty.generated.json`
