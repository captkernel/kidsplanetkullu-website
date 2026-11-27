# Publish website-v2 to kidsplanetkullu.com.
#
# Copies this folder (source only, no node_modules/build output/env files) into the
# public deploy repo C:\Claude\kidsplanetkullu-website, commits, and pushes to main.
# GitHub Actions there builds the Next.js static export and deploys it to GitHub
# Pages (about 1.5 minutes). The school monorepo itself is never pushed.
#
# Usage:
#   & C:\Claude\KidsPlanet\website-v2\scripts\publish.ps1 -Message "Update admissions dates"
#   ... -SkipBuild        skip the local test build (not recommended)
#   ... -Backported       record that website-v2 now contains everything on GitHub main
#                          (run this after copying commits made elsewhere into website-v2)
#
# Safety (added 2026-11-27 after TESTERS_REPORT.md finding A-C2):
#   * website-v2\.deploy-base holds the GitHub main commit that website-v2 was last in step with.
#     If GitHub main has moved on with commits that did NOT come from this script (cloud
#     sessions, the GitHub web editor), publishing is refused: mirroring would silently delete
#     that work from the live site. Copy those changes into website-v2, then run -Backported.
#   * The deploy clone is fast-forwarded to GitHub main before mirroring.
#   * A local `npm run build` must succeed and produce the key pages before anything is pushed.
#   * Every git step is checked; "Pushed." is printed only when the push really succeeded.
#
# Verify afterwards:
#   gh run list --repo captkernel/kidsplanetkullu-website --limit 1
#   curl -sI https://kidsplanetkullu.com/
param(
  [string]$Message = "Update website",
  [switch]$SkipBuild,
  [switch]$Backported
)

$ErrorActionPreference = "Stop"
$src      = Split-Path -Parent $PSScriptRoot
$dest     = "C:\Claude\kidsplanetkullu-website"
$baseFile = Join-Path $src ".deploy-base"
$trailer  = "Published-from: website-v2"

function Git-Ok([string]$what) {
  if ($LASTEXITCODE -ne 0) { throw "git $what failed (exit $LASTEXITCODE). Nothing was published." }
}

if (-not (Test-Path "$dest\.git")) {
  throw "Deploy repo missing at $dest. Clone it first: gh repo clone captkernel/kidsplanetkullu-website $dest"
}

Push-Location $dest
try {
  $branch = (git rev-parse --abbrev-ref HEAD).Trim(); Git-Ok "rev-parse"
  if ($branch -ne "main") { throw "Deploy repo is on '$branch', not main. Switch it back: git -C $dest switch main" }
  if (git status --porcelain) { throw "Deploy repo $dest has uncommitted changes. Clean it first (git -C $dest status)." }

  git fetch -q origin main; Git-Ok "fetch"
  $remote = (git rev-parse origin/main).Trim(); Git-Ok "rev-parse origin/main"

  if ($Backported) {
    Set-Content -Path $baseFile -Value $remote -Encoding ascii
    Write-Host "Recorded GitHub main $($remote.Substring(0,7)) as the base website-v2 is in step with."
    return
  }

  if (-not (Test-Path $baseFile)) {
    throw "No $baseFile yet. Check website-v2 contains everything on GitHub main, then run this script with -Backported."
  }
  $base = (Get-Content $baseFile -Raw).Trim()
  git cat-file -e "$base^{commit}" 2>$null
  if ($LASTEXITCODE -ne 0) { throw ".deploy-base names unknown commit '$base'. Re-check and run with -Backported." }

  # Commits on GitHub main since the base that this script did not make.
  $foreign = git log --format="%h %ad %an  %s" --date=short --invert-grep --grep="^$trailer" "$base..$remote"; Git-Ok "log"
  if ($foreign) {
    Write-Host "GitHub main has changes that are not in website-v2:" -ForegroundColor Yellow
    $foreign | ForEach-Object { Write-Host "  $_" }
    Write-Host "Files:" -ForegroundColor Yellow
    git diff --stat "$base" "$remote" | ForEach-Object { Write-Host "  $_" }
    throw "Refusing to publish: mirroring now would delete those changes from the live site. Copy them into website-v2 (git -C $dest diff $base $remote), then run with -Backported."
  }

  git merge -q --ff-only origin/main; Git-Ok "fast-forward to origin/main"
} finally { Pop-Location }

if (-not $SkipBuild) {
  Push-Location $src
  try {
    Write-Host "Test build (npm run build)..."
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Local build failed. Nothing was published." }
    foreach ($p in "index.html", "links\index.html", "admissions\index.html", "admissions\apply\index.html", "parent\index.html", "contact\index.html") {
      if (-not (Test-Path (Join-Path $src "out\$p"))) { throw "Build is missing out\$p. Nothing was published." }
    }
  } finally { Pop-Location }
}

# Mirror source into the deploy repo. staff-assets/ (the teachers' private marketing pages and
# pictures) is NEVER copied: it is served only by the kp-staff Worker after Google sign-in.
# Also excluded: dependencies, build output, git metadata,
# local logs, generated TS files, env files, the 13 MB logo master, the deploy-base marker,
# and unused leftovers from the old site (mock fee data, PlanetStudio assets, unreferenced JSON).
robocopy $src $dest /MIR `
  /XD node_modules .next out .git staff-assets `
  /XF .preview.log next-env.d.ts *.tsbuildinfo .env .env.local kp-logo-large.png .deploy-base `
      finance.ts media-library.ts stickers.ts curated-icons.ts templates.ts `
      achievements.json daily-schedule.json faq.json gallery.json news.json testimonials.json `
      SEO_RESEARCH.md DRAFT-*.md `
  /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }

Push-Location $dest
try {
  git add -A; Git-Ok "add"
  $pending = git status --porcelain
  if (-not $pending) { Write-Host "Nothing to publish - deploy repo already matches website-v2."; return }
  git commit -q -m $Message -m $trailer; Git-Ok "commit"
  git push -q origin main
  if ($LASTEXITCODE -ne 0) {
    throw "Push FAILED (exit $LASTEXITCODE) - nothing went live. The deploy clone has an unpushed commit; after fixing the cause, undo it with: git -C $dest reset --hard origin/main"
  }
  $head = (git rev-parse HEAD).Trim(); Git-Ok "rev-parse HEAD"
  Set-Content -Path $baseFile -Value $head -Encoding ascii
  Write-Host "Pushed $($head.Substring(0,7)). Deploy runs on GitHub Actions; check with: gh run list --repo captkernel/kidsplanetkullu-website --limit 1"
} finally { Pop-Location }
