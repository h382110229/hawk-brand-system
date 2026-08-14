# HAWK-UI-Component-03 Card Round 1

## Summary

Implements the HAWK Card component — a container primitive for grouping related content, built entirely on HAWK design tokens.

## What Changed

### New Files
- `src/components/Card.tsx` — Card component (107 lines)
- `src/test/card.test.tsx` — 33 unit tests
- `scripts/component-03-browser-verify.mts` — Browser verification script
- `deliverables/ui-component-03-card/actual/` — 6 screenshots + verification report

### Modified Files
- `src/app/page.tsx` — Added Card showcase section (variants, padding, composition, grid)
- `package.json` — Added `component-03:browser-verify` script
- `.github/workflows/ui-foundation-ci.yml` — Added Component-03 browser verification step

## Component API

```typescript
type CardVariant = "elevated" | "outlined";
type CardPadding = "md" | "lg";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: CardVariant;       // default: "elevated"
  padding?: CardPadding;       // default: "lg"
  header?: React.ReactNode;
  footer?: React.ReactNode;
}
```

## Features

- **Variants:** `elevated` (shadow) and `outlined` (border-only)
- **Padding:** `md` (16px) and `lg` (24px) presets
- **Composition:** Optional `header`, `children`, `footer` slots
- **Semantic HTML:** `<article>` with `<header>` / `<footer>`
- **Accessibility:** `forwardRef`, `aria-label` pass-through
- **Token compliance:** Zero hardcoded brand hex values

## Verification Results

| Check | Result |
|-------|--------|
| Tests | 196/196 passed (33 new Card tests) |
| Build | ✅ Compiled successfully |
| Token check | ✅ All validations passed |
| Browser verify | ✅ 6/6 PASS (desktop/tablet/mobile × dark/light) |

## Screenshots

Desktop dark mode preview included. Full set: `deliverables/ui-component-03-card/actual/`

## Gate

Gate: HAWK-UI-Component-03 Card Round 1
Base: 6b7ee66d893a3f64ec2e1948b360013cc1bac4c0
Head: be1309d
