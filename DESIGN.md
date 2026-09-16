# Kids Planet — Design System (DESIGN.md)

The single source of truth for the website's visual language. Synthesises the **Taste**
skill (leonxlnx/taste-skill) and **Awesome Design** (VoltAgent/awesome-claude-design,
Notion warm-minimalism family) with the Kids Planet brand. Every page and component
follows this. Written 2026-08-23.

> Brand: a 16-year-old K-8 school in Dhalpur, Kullu, Himachal Pradesh. Planet/stars
> universe, houses Mars/Venus/Jupiter/Mercury, tagline **"Aim for the Stars."**
> Feeling to evoke: warm, rooted, trustworthy, quietly premium. Parents deciding
> where their child spends six formative years. Not a startup, not an agency reel.

---

## 0. The design read + dials

**Read:** trust-first institutional site with warm, editorial heritage language and a
light celestial motif. Parents are the buyers; reassurance and credibility beat spectacle.

**Dials (Taste framework) — pushed for a standout, memorable site:**
- **VARIANCE = 8** — bold and editorial. Asymmetric, overlapping compositions; expressive oversized serif display; type and image that interlock. No centered-everything, no template feel. Every section should look composed, not stamped.
- **MOTION = 6** — choreographed but calm: staged scroll reveals, gentle parallax on hero imagery, a living constellation/star motif, magnetic hover on CTAs. Motion is motivated (hierarchy, reveal, feedback), never spectacle-for-its-own-sake. ALWAYS gated behind `prefers-reduced-motion` (collapses to static). Use IntersectionObserver / CSS scroll-driven, never `window` scroll listeners.
- **DENSITY = 3** — still generous and breathing. Boldness comes from scale and composition, not clutter.

## 0.5 Signature system — the thing that makes it ownable

What separates "nice school site" from unforgettable. One idea, threaded everywhere:

**The Constellation.** "Aim for the Stars" becomes a literal visual language.
- A thin, elegant **star-map line** threads down the page, connecting sections like a constellation the visitor traces while scrolling (subtle gold, low opacity; SVG stroke draws in on scroll, reduced-motion = drawn static).
- The **four houses (Mars, Venus, Jupiter, Mercury)** become a distinctive orbital/planetary section, not a 4-card row. Each is a "world" with its own character.
- The **six promises** are stars in the constellation, an asymmetric star-field the eye travels, not a grid.
- Hero: one expressive star + a whisper of night-sky behind warm campus photography (forest scrim keeps it grounded, not literal space).
- Numbers set in the serif; a recurring **star glyph** as the one accent mark, never generic bullet dots.
- Tasteful and warm, not sci-fi. Celestial as aspiration, rendered in bone + forest + gold. No cartoon planets, no clip-art.

---

## 1. Visual theme & atmosphere

Warm heritage minimalism with a night-sky accent. Bone/cream canvas, deep forest ink,
one gold star-accent. Rounded, soft surfaces (approachable for a children's school) with
crisp typography (credible for parents). Celestial motif used sparingly: a single star
mark, a subtle constellation line, never literal cartoon planets on marketing pages.

## 2. Color palette & roles

One accent, locked page-wide (Taste: color-consistency lock). Off-white/off-black only.

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#FBF8F1` (warm bone) | page background |
| `--surface` | `#FFFFFF` softened to `#FEFCF8` | cards, raised surfaces |
| `--ink` | `#1C2A21` (near-black forest) | primary text (NOT pure black) |
| `--ink-soft` | `#4A5A50` | secondary text (passes AA on canvas) |
| `--primary` | `#2D5016` (deep forest green) | brand, headings accent, primary buttons |
| `--primary-deep`| `#1E3A10` | footer, dark sections |
| `--gold` | `#C8A84E` (muted, <80% sat) | the single accent: stars, highlights, focus, links |
| `--line` | `#E8E1D3` | hairline dividers on canvas |

Rules: gold is the ONLY accent, everywhere or nowhere. No second accent, no neon, no
gradients-as-decoration. Dark sections use `--primary-deep`, not black. Shadows tinted
green-warm, never pure black.

## 3. Typography rules

**One display + one text family. Drop the third font (Nunito) from the public site.**

- **Taste flags Fraunces as an over-used LLM serif.** Decision: move display to a
  distinctive warm serif that isn't the tell — **Newsreader** (or Source Serif 4) — kept
  because a 16-year-old heritage institution genuinely justifies a serif (Taste's stated
  exception). Body stays a humanist sans: **Plus Jakarta Sans** (already loaded).
- Display: `text-4xl md:text-6xl tracking-tight leading-[1.05]`, weight 500-600 (control size via weight + color, don't just scream `text-7xl`).
- Body: `text-base md:text-lg text-[--ink-soft] leading-relaxed max-w-[65ch]`.
- Emphasis inside a headline: italic of the SAME serif, never a swapped family.
- Italic descenders (`y g j p q`): `leading-[1.1]` + `pb-1` reserve.

## 4. Component stylings

- **Shape lock:** soft-rounded system — cards `rounded-2xl`, buttons `rounded-full` (pill), inputs `rounded-xl`. Applied consistently everywhere.
- **Buttons:** primary = forest fill, cream text (AA verified); secondary = forest outline; on `:active` `scale-[0.98]` for tactile push; visible gold focus ring.
- **Cards:** used only where elevation means hierarchy; otherwise group with `--line` dividers / whitespace. Tinted soft shadow.
- **Icons:** one family, `strokeWidth` locked at 1.75. (Lucide is already in the repo — acceptable to keep since we depend on it; do not add a second set.)
- **Forms:** label above, error below, never placeholder-as-label; gold focus ring.

## 5. Layout principles

- Contain to `max-w-[1200px] mx-auto`. CSS Grid over flex-math. `min-h-[100dvh]` never `h-screen`.
- **Hero:** headline ≤ 2 lines, subtext ≤ 20 words, CTAs visible without scroll, `pt-24` max. Max 4 stacked elements. No trust-strip/logo-wall inside the hero.
- **Section diversity:** no layout family repeats back-to-back; ≥ 4 families across the page (split, full-bleed, bento, editorial-stack, quote). Zigzag max 2 in a row.
- **Eyebrow restraint:** ≤ 1 uppercase-tracking eyebrow per 3 sections.
- No three-equal-feature-cards trio. The six houses/pillars use an asymmetric or bento arrangement, not a plain 3×2 grid.

## 6. Depth & elevation

Flat-warm. Elevation via soft tinted shadow + `--line`, not heavy drop shadows. One
elevation step for cards, one for popovers. No glassmorphism, no neon glow.

## 7. Do's and don'ts (Kids Planet anti-slop)

**Do:** real school photos (we have 200+), real parent names and quotes, real board/UDISE
credentials, warm concrete language, generous whitespace, gentle scroll reveals.

**Don't (hard rules):**
- **ZERO em-dashes (`—`)** anywhere in site copy. Use periods, commas, colons, or line breaks. (This is the #1 AI tell.)
- No filler verbs: "Elevate, Seamless, Unleash, Nurture-to-empower." Say the real thing.
- No fake-precise stats. Use real numbers (188 students, est. 2010) or none.
- No scroll cues, no section-number eyebrows (`01 · Programs`), no decorative status dots, no locale/time strips.
- No pure black/white, no neon, no gradient headline text, no custom cursors.
- No three-equal-cards, no `border-t`+`border-b` on every list row.
- Cartoon planets/clip-art stay OUT of marketing pages; celestial motif is a subtle single star + thin constellation line only.

## 8. Responsive behaviour

Mobile-first. Sticky bottom CTA on mobile (WhatsApp + Book a Visit) already present.
Nav one line ≤ 80px, hamburger below `lg`. Test hero fit on 360px and notched iOS
(`env(safe-area-inset-bottom)`).

## 9. Agent prompt guide

When building or restyling any page: state the read + dials, use only the tokens above,
run the Taste pre-flight (em-dashes = 0, one accent, one radius scale, eyebrow count,
section-family diversity, hero fit, WCAG AA, reduced-motion). Elevate the existing
"six pillars" homepage content to this bar rather than inventing new copy. Never ship a
page that fails a pre-flight box.
