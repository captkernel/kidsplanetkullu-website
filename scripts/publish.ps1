# Publish website-v2 to kidsplanetkullu.com.
#
# Copies this folder (source only, no node_modules/build output/env files) into the
# public deploy repo C:\Claude\kidsplanetkullu-website, commits, and pushes to main.
# GitHub Actions there builds the Next.js static export and deploys it to GitHub
# Pages (about 1.5 minutes). The school monorepo itself is never pushed.
#
# Usage:
#   & C:\Claude\KidsPlanet\website-v2\scripts\publish.ps1 -Message "Update admissions dates"
#
# Verify afterwards:
#   gh run list --repo captkernel/kidsplanetkullu-website --limit 1
#   curl -sI https://kidsplanetkullu.com/
param([string]$Message = "Update website")

$src  = Split-Path -Parent $PSScriptRoot
$dest = "C:\Claude\kidsplanetkullu-website"
if (-not (Test-Path "$dest\.git")) {
  throw "Deploy repo missing at $dest. Clone it first: gh repo clone captkernel/kidsplanetkullu-website $dest"
}

# Mirror source into the deploy repo. Excluded: dependencies, build output, git metadata,
# local logs, generated TS files, env files, the 13 MB logo master, and unused leftovers
# from the old site (mock fee data, PlanetStudio assets, unreferenced content JSON).
robocopy $src $dest /MIR `
  /XD node_modules .next out .git `
  /XF .preview.log next-env.d.ts *.tsbuildinfo .env .env.local kp-logo-large.png `
      finance.ts media-library.ts stickers.ts curated-icons.ts templates.ts `
      achievements.json daily-schedule.json faq.json gallery.json news.json testimonials.json `
  /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }

Push-Location $dest
try {
  git add -A
  $pending = git status --porcelain
  if (-not $pending) { Write-Host "Nothing to publish - deploy repo already matches website-v2."; return }
  git commit -q -m $Message
  git push origin main
  Write-Host "Pushed. Deploy runs on GitHub Actions; check with: gh run list --repo captkernel/kidsplanetkullu-website --limit 1"
} finally { Pop-Location }
