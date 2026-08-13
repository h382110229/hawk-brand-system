# Stitch Final Direction — HAWK Intelligent Editorial Grid

## Design Direction

**HAWK Intelligent Editorial Grid** = C's precision + A's whitespace + B's token grid

Style: Black background #0A0A0A with restrained gold #D4AF37 accent. Left-aligned precise grid. Generous whitespace. Logo does NOT fill hero. Personal tech brand guidelines site.

## Derivation Chain

```
master (desktop-dark)
├── desktop-light (edit: light mode colors only)
├── mobile-light (from desktop-light, edit: responsive reflow)
└── mobile-dark (from mobile-light, edit: dark colors only — structure unchanged)
```

## Screens

| Screen | Screen ID | Pixel Dimensions | File Size | SHA-256 |
|--------|-----------|-----------------|-----------|---------|
| Desktop Dark (master) | `1631f118e576480fb8a4032e0cc655e7` | 1440×900 | 84,869 bytes | `9032c1f2cfcb5b1cb7b3039e1e4c25795bc699ba22932928a06183205ddf612b` |
| Desktop Light | `15cedf97c5cb453d836c46786f4ae1b8` | 1440×900 | 79,053 bytes | `e13c5ad0f571a4ecb956a90855d36b54bd3852bd6fe4ef545f89f326a534199e` |
| Mobile Dark | `ae0020684d4943e5adb923d24094198d` | 375×812 | 48,006 bytes | `ddad0fbaa755530828d155ecbf117285b134aeafc6646283855ca4000e56129f` |
| Mobile Light | `413d505d16ab4b8cb4010186c0dceb48` | 375×812 | 37,571 bytes | `3a45465a04c3b161476a6137c56d290210d25c1f53f1042ff40cb3d65d6ab44f` |

## Image Export Method

Stitch SDK `getImage()` returns a Google FIFE URL. The raw URL serves a thumbnail (~191×512). Appending `=s0` to the URL returns the full-resolution image (2560×6860 for desktop, 780×3540+ for mobile). The full-res images were downloaded, scaled to target viewport width, and center-cropped to target height using Pillow/LANCZOS resampling.

Mobile dark was derived from the approved mobile-light screen via `edit()` with a dark-mode color-only prompt, ensuring identical layout, section order, and content structure.

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
- [x] Mobile dark derives from mobile-light (colors only, structure unchanged)
- [x] Mobile is responsive version of Desktop
- [x] Typography hierarchy is consistent
- [x] No neon, metallic, 3D, excessive gradients
- [x] Token information is readable
- [x] No template SaaS CTA
- [x] No incorrect brand copy
- [x] SHA-256 differs from R2/R3 old files
- [x] Desktop screenshots are 1440×900 (verified via IHDR)
- [x] Mobile screenshots are 375×812 (verified via IHDR)

## Consistency Check

All 4 screens share:
- Same section order (Header → Hero → Logo → Color → Typography → Tokens)
- Same content and text
- Same information architecture
- Only responsive reflow differs (desktop vs mobile)
- Only color scheme differs (dark vs light)
