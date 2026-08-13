## Goal
Implement HAWK Button component — the first reusable UI component in the design system, building on Foundation-01 tokens.

## Scope
- `src/components/Button.tsx` — Button component with forwardRef
- `src/test/button.test.tsx` — 41 unit tests (110 total with Foundation)
- `src/app/page.tsx` — Button showcase in design system page
- `scripts/component-02-browser-verify.mts` — Browser verification script
- `.github/workflows/ui-foundation-ci.yml` — CI updates
- `tokens/color/light.json` + `tokens/color/dark.json` — New `text-on-primary` token
- `deliverables/ui-component-02/actual/` — Screenshots and verification report

## Non-goals
- No Input, Card, Modal, Dialog, Tooltip, Dropdown
- No Storybook, no new dependencies

## API
```typescript
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;  // default: "primary"
  size?: ButtonSize;        // default: "md"
  loading?: boolean;        // default: false
  fullWidth?: boolean;      // default: false
}
```

## Token Compliance
- All colors via CSS variables — zero hardcoded hex
- New semantic token: `--color-text-on-primary` (light: #202124, dark: #0A0A0A)
- Dark Primary contrast: 9.42:1 (AAA) — gold #D4AF37 on dark #0A0A0A
- Light Primary contrast: 4.52:1 (AA) — blue #4285F4 on dark #202124
- Outline hover text switches to text-on-primary for accessible contrast

## Touch Targets
- sm: min-height 44px
- md: min-height 44px
- lg: min-height 48px

## Tests
- 110/110 passed (41 Button + 69 Foundation)
- Covers: rendering, variants, sizes, interaction, states, token compliance, accessibility, onKeyDown

## Browser Verification (6/6 PASS)
- Viewports: desktop 1440x900, tablet 768x1024, mobile 390x844
- Themes: dark, light
- Verified: all variants, all sizes, contrast, hover, focus-visible, active, disabled click, loading click, Enter/Space keyboard, touch targets, reduced-motion, no overflow, no console errors

## CI
- All commands passing: tokens:check, tokens:build, brand:sync, lint, test, build, browser:verify, component-02:browser-verify

## Known Limitations
- Input not implemented (Component-02B)
- Card not implemented (Component-02C)

## ChatGPT Review Pending
- Draft PR — do not merge, do not convert to Ready, do not deploy
