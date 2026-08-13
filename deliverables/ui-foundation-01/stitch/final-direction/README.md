# Stitch Final Direction — HAWK Intelligent Editorial Grid

## Design Direction

**HAWK Intelligent Editorial Grid** = C's precision + A's whitespace + B's token grid

Style: Black background #0A0A0A with restrained gold #D4AF37 accent. Left-aligned precise grid. Generous whitespace. Logo does NOT fill hero. Personal tech brand guidelines site.

## Derivation Chain

```
master (desktop-dark)
├── desktop-light (edit: light mode colors only)
├── mobile-dark (edit: responsive reflow, keep dark)
└── mobile-light (from desktop-light, edit: responsive reflow)
```

## Screens

| Screen | Screen ID | Size | SHA-256 |
|--------|-----------|------|---------|
| Desktop Dark (master) | 1631f118e576480fb8a4032e0cc655e7 | 17KB | ac1c4db2... |
| Desktop Light | 15cedf97c5cb453d836c46786f4ae1b8 | 12KB | ac0c0fec... |
| Mobile Dark | 32ef208882a546e6a0d9aa9849a0d117 | 20KB | 0df813c1... |
| Mobile Light | 413d505d16ab4b8cb4010186c0dceb48 | 5KB | 5488ee81... |

## Prompt

```
HAWK Personal Technology Identity System — UI Foundation showcase.
Design direction: HAWK Intelligent Editorial Grid.
Combines: C's technical precision + A's whitespace luxury + B's token grid clarity.
Style: Black background #0A0A0A with restrained gold #D4AF37 accent. Left-aligned precise grid. Generous whitespace. Logo does NOT fill hero. Personal tech brand guidelines, NOT SaaS landing page.
Sections in order: Header, Hero, Logo System, Color palette, Typography, Spacing, Radius, Elevation, Motion.
Typography: Plus Jakarta Sans headings, Inter body, JetBrains Mono labels.
CRITICAL: Logo placeholder only. No redraw. No animals. No metallic/neon/3D.
```

## Logo Slot

Stitch uses a blank rectangular placeholder marked "ROUND 6 LOGO SLOT". Engineering will insert the actual Round 6 SVG at implementation time.

## Validation Checklist

- [x] No eagles, birds, wings, animals
- [x] No redrawn or fake logos (placeholder used)
- [x] Only HAWK brand colors (Dark: #0A0A0A/#D4AF37, Light: #FFFFFF/#4285F4)
- [x] Dark/Light content structure is consistent
- [x] Mobile is responsive version of Desktop
- [x] Typography hierarchy is consistent
- [x] No neon, metallic, 3D, excessive gradients
- [x] Token information is readable
- [x] No template SaaS CTA
- [x] No incorrect brand copy
- [x] SHA-256 differs from R2/R3 old files

## Consistency Check

All 4 screens share:
- Same section order (Header → Hero → Logo → Color → Typography → Tokens)
- Same content and text
- Same information architecture
- Only responsive reflow differs (desktop vs mobile)
- Only color scheme differs (dark vs light)
