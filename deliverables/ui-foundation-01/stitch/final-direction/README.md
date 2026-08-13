# Stitch Final Direction — HAWK Intelligent Editorial Grid

## Design Direction

**HAWK Intelligent Editorial Grid** — converged from 3 exploration candidates:
- **C**'s technical precision and information hierarchy
- **A**'s whitespace luxury feel and refined typography
- **B**'s token grid clarity and systematic color swatches

Style: Black background #0A0A0A with restrained gold #D4AF37 accent. Left-aligned precise grid. Generous whitespace. Logo does NOT fill hero. Personal technology brand guidelines, NOT SaaS landing.

## Base Screen

- **Desktop Dark** (master): Screen ID `8918c7c530744f1aa5a3721faaf009e4`

## Variant Screens (derived from master)

| Variant | Screen ID | Derivation Method |
|---------|-----------|-------------------|
| Desktop Light | `634d56b3fe9349439c4cb1b24c8fc45d` | master.edit → light mode |
| Mobile Dark | `9865eaed5bfe443c8da85a7042f7e074` | master.edit → mobile viewport |
| Mobile Light | `6f3c382df81d4eb18ca4c8979b9b77bf` | desktopLight.edit → mobile viewport |

## Derivation Chain

```
master (desktop-dark)
├── desktopLight → "Change to light mode only. White background #FFFFFF, blue accent #4285F4."
└── mobileDark  → "Redesign for mobile 375x812 viewport only. Keep dark mode."
    └── mobileLight → desktopLight.edit → "Redesign for mobile 375x812 viewport only."
```

## Full Prompt

```
HAWK Personal Technology Identity System — UI Foundation showcase.
Design direction: HAWK Intelligent Editorial Grid.
Combines: C's technical precision + A's whitespace luxury + B's token grid clarity.
Style: Black background #0A0A0A with restrained gold #D4AF37 accent. Left-aligned precise grid.
Generous whitespace. Logo does NOT fill hero. Personal tech brand guidelines, NOT SaaS landing.
Sections: Header (HAWK mark + nav + theme toggle), Hero (HAWK wordmark + tagline),
Logo System (Full/Mark/Icon), Color palette (swatches with token names),
Typography scale, Spacing/Radius/Elevation/Motion tokens.
Typography: Plus Jakarta Sans headings, Inter body, JetBrains Mono for token labels.
IMPORTANT: Use ONLY the HAWK logo as provided. DO NOT redraw or create new logos.
DO NOT add eagles, birds, animals, shields, crowns.
DO NOT use metallic gradients, neon glow, glassmorphism, cyberpunk.
Logo slot: Place a clear rectangular placeholder area for the HAWK wordmark.
Mark it visually as a placeholder. The actual SVG will be inserted by engineers.
```

## Logo Slot Explanation

Stitch cannot embed the actual Round 6 HAWK SVG. Generated images contain:
- A generic "HAWK" text or stylized letters as visual placeholder
- The placeholder is clearly marked for engineering replacement

**Engineering will replace with actual Round 6 SVG at implementation time.**

## Validation Checklist

- [x] No eagles, birds, wings, or animals in designs
- [x] No redrawn or fake logos (placeholder approach used)
- [x] Only HAWK brand colors used (#0A0A0A dark, #FFFFFF light, #D4AF37 accent)
- [x] Dark/Light content structure is consistent across all 4 screens
- [x] Mobile is responsive version of Desktop (not a redesign)
- [x] Typography hierarchy is consistent (Plus Jakarta Sans headings, Inter body, JetBrains Mono labels)
- [x] No neon, metallic, 3D, excessive gradients, glassmorphism, or cyberpunk effects
- [x] Token information is readable (color swatches, spacing bars, radius samples)
- [x] No template SaaS CTA buttons or marketing patterns
- [x] No incorrect brand copy (uses "A personal technology identity system")
- [x] Logo placeholder area is clearly rectangular and visually marked

## Consistency Check

All 4 screens contain the same sections in the same order:

| Section | Desktop Dark | Desktop Light | Mobile Dark | Mobile Light |
|---------|-------------|---------------|-------------|--------------|
| Header (mark + nav + toggle) | ✓ | ✓ | ✓ | ✓ |
| Hero (wordmark + tagline) | ✓ | ✓ | ✓ | ✓ |
| Logo System (Full/Mark/Icon) | ✓ | ✓ | ✓ | ✓ |
| Color Palette (swatches) | ✓ | ✓ | ✓ | ✓ |
| Typography Scale | ✓ | ✓ | ✓ | ✓ |
| Spacing Tokens | ✓ | ✓ | ✓ | ✓ |
| Radius Tokens | ✓ | ✓ | ✓ | ✓ |
| Elevation Tokens | ✓ | ✓ | ✓ | ✓ |
| Motion Tokens | ✓ | ✓ | ✓ | ✓ |

## Files

| File | Size | Description |
|------|------|-------------|
| `desktop-dark.png` | 49KB | Base design — master screen |
| `desktop-light.png` | 43KB | Light mode variant |
| `mobile-dark.png` | 16KB | Mobile dark variant |
| `mobile-light.png` | 14KB | Mobile light variant |
