# Kids Planet v2 — Research Brief (best-in-class school sites)

Grounding for the from-scratch build. Pairs with `DESIGN.md` (the Taste-based system).
Synthesised from 2026 award-winning school sites (VCUarts / Webby winner, Kent College
Canterbury, Agnes Irwin, The Walker School) and Finalsite's private-school pattern library.

## The one principle
**Weave ONE central theme through design, copy, and CTAs** — don't present disconnected
program lists. For Kids Planet that theme is **"Aim for the Stars"**: every child is known,
and helped to reach. Mirror Agnes Irwin's mission-anchored approach (their whole site is
built around one sentence). Ours anchors on the six promises (Known, Ready, Forward,
Curious, Cared-for, Ours).

## Homepage structural flow (tested K-8 sequence)
1. **Hero** — identity statement + primary action. Warm authentic photo, forest scrim, one
   serif headline (≤2 lines), one line of subtext, two CTAs (Book a Visit / WhatsApp).
   Restrained: a single star motif, not parallax spectacle.
2. **Mission / values** — the six promises, said as behaviours ("The Kids Planet Way"),
   presented as an asymmetric bento (NOT a 3-equal-card trio).
3. **How we learn** — programs by stage (Playgroup→Class 8) as scannable modular cards with
   "Learn more". "Say it, then show it": short overview, then proof.
4. **Fast facts / proof** — real metrics only: est. 2010, ~188 students, HPBOSE affiliated,
   UDISE 2040201127, 4 houses. Hairline-divided band, Newsreader numerals. No fake precision.
5. **Community voices** — real parent testimonials woven into the narrative, not hidden. Plus
   the founder's story (heritage, established institution — decade timeline works here).
6. **News / momentum** — announcements strip showing the school is alive and active.
7. **Admissions pathway** — clear step-by-step ("Enquire → Visit → Apply"), embedded
   mobile-friendly inquiry, one repeated primary CTA. Admissions action must recur at 2-3
   scroll moments, never made to hunt for.
8. **Footer** — reinforce the mission line; contacts, map, WhatsApp, credentials.

## Techniques to use (that separate great from average)
- **Story modules** the visitor learns to read: 50/50 visual+text blocks, alternating (cap
  zigzag at 2 per Taste), broken by full-bleed and bento.
- **Say-it-then-show-it**: claim in a headline, immediately backed by a specific/photo.
- **Persistent utility nav**: Book a Visit / Enquire / (Parent) Portal always reachable.
- **Cinematic but calm imagery**: full-width authentic student moments; images that slide
  gently into view on scroll (IntersectionObserver, reduced-motion safe). We have 200+ real
  photos in public/images — use them, no stock, no clip-art planets.
- **Fast-fact panel** for instant credibility.
- **Whitespace as warmth**: generous spacing (DENSITY 3), large calm typography.

## What to avoid (from the losers + Taste anti-slop)
Disconnected program lists, hidden testimonials, buried mission, generic stock, autoplay
audio, cluttered utility bars, and every Taste anti-slop tell (em-dashes, three-equal-cards,
section-number eyebrows, scroll cues, neon, pure black/white).

## Content sources to reuse (already in this app)
`src/content/*.json` (faculty, programs, testimonials, news), `src/data/*`,
`public/images/**` (optimized), logo derivatives (`public/kp-logo.png`, `og-image.png`,
favicons), `src/lib/constants.ts` + `metadata.ts` (school facts, UDISE, address).
