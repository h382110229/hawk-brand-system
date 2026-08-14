# HAWK-UI-Component-03 — Read-Only Preflight Report

> **Date:** 2026-08-14
> **Author:** Hermes (Engineering Lead)
> **Status:** PREFLIGHT ONLY — No code changes, no branches, no commits, no PRs
> **Purpose:** Determine minimal reasonable scope for Component-03

---

## 1. Repository Baseline

| Field | Value | Status |
|-------|-------|--------|
| Repository | `h382110229/hawk-brand-system` | — |
| Default Branch | `main` | — |
| Expected HEAD | `6b7ee66d893a3f64ec2e1948b360013cc1bac4c0` | — |
| Actual HEAD | `6b7ee66d893a3f64ec2e1948b360013cc1bac4c0` | ✅ MATCH |
| Working Tree | Clean (no uncommitted changes) | ✅ CLEAN |

**Conclusion:** Baseline is valid. HEAD matches expected merge commit exactly.

---

## 2. Current main HEAD

```
6b7ee66 feat: HAWK Input Component (Component-02B) (#3)
24d8cdb feat: HAWK Button Component (Component-02A)
598b3aa chore: regenerate verification report with correct headSha 05ade8e
05ade8e fix: final remediation — active/keyboard/reduced-motion/outline hover
ca53c4d fix: hover detection in headless Chrome — remove unsupported emulateMediaFeatures
09760ff fix: remediate Component-02 — contrast, touch target, onKeyDown, verification
bb51923 feat: add HAWK button component
afe9ee4 Merge pull request #1 from h382110229/feat/ui-foundation-01
```

Linear progression: Foundation → Button (Component-02A) → Input (Component-02B). No unexpected merges or divergent history.

---

## 3. Working Tree Status

**Clean** — `git status --short` produces empty output. No untracked files, no staged changes, no stash entries.

---

## 4. Existing Components

### Component Inventory

| File | Type | Description |
|------|------|-------------|
| `src/components/Button.tsx` | Interactive | Button with 4 variants, 3 sizes, loading/disabled states |
| `src/components/Input.tsx` | Interactive | Input with label, description, error, 3 sizes, disabled/readonly |
| `src/components/HawkLogo.tsx` | Display | Logo renderer (full/mark/icon variants) |
| `src/components/ThemeProvider.tsx` | Infrastructure | Theme context provider (dark/light/system) |
| `src/components/ThemeToggle.tsx` | Interactive | Theme switcher control |

### Button API Summary

```typescript
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;   // default: "primary"
  size?: ButtonSize;         // default: "md"
  loading?: boolean;
  fullWidth?: boolean;
}
```

- All styling via CSS custom properties (no hardcoded hex)
- `forwardRef` with full accessibility (`aria-disabled`, `aria-busy`, focus-visible ring)
- Token compliance tests enforce no brand hex in classNames

### Input API Summary

```typescript
type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  description?: string;
  error?: string;
  size?: InputSize;          // default: "md"
  fullWidth?: boolean;       // default: true
}
```

- `forwardRef` with `useId` for label/description/error association
- Full accessibility: `aria-describedby`, `aria-invalid`, `role="alert"` on error
- Token compliance tests enforce no brand hex in classNames

### Shared Patterns Between Button and Input

| Pattern | Button | Input | Reusable? |
|---------|--------|-------|-----------|
| `cn()` utility | ✅ local | ✅ local (duplicate) | Could extract to shared util |
| `--radius-md` | ✅ | ✅ | ✅ Foundation token |
| `--motion-duration-fast` + `--motion-easing-default` | ✅ | ✅ | ✅ Foundation token |
| `--spacing-3` / `--spacing-4` | ✅ | ✅ | ✅ Foundation token |
| `focus-visible:outline-2 + offset-2 + focus-color` | ✅ (outline) | ✅ (ring) | Slight style difference is intentional |
| `min-h-[44px]` / `min-h-[48px]` touch targets | ✅ | ✅ | ✅ Shared convention |

**Key finding:** Both components define identical `cn()` helper locally. This is a minor duplication but not blocking for Component-03.

### Card-Like Implementations in Current Codebase

**No Card, Panel, Surface, or Section component exists.** However, the showcase page uses card-like styling inline:

```tsx
// page.tsx — Logo grid items (line ~100)
<div className="p-8 rounded-[var(--radius-lg)] border border-[var(--color-border-default)]
                bg-[var(--color-background-secondary)] text-center">
```

```tsx
// page.tsx — Logo Rules box (line ~113)
<div className="p-6 rounded-[var(--radius-lg)] bg-[var(--color-background-secondary)]
                border border-[var(--color-border-default)]">
```

These are **ad-hoc inline styling**, not a reusable component. The pattern is consistent and well-suited for extraction into a Card component.

---

## 5. Existing Tokens

### Token Sources

| Source | Files |
|--------|-------|
| JSON definitions | `tokens/color/dark.json`, `tokens/color/light.json`, `tokens/spacing.json`, `tokens/radius.json`, `tokens/motion.json`, `tokens/elevation.json`, `tokens/typography.json`, `tokens/breakpoint.json` |
| Generated CSS | `src/styles/generated-tokens.css` (auto-generated, 115 lines) |
| Generated JS | `src/lib/generated-token-data.ts` (auto-generated, 467 lines) |

### Token Coverage for Card Requirements

| Card Requirement | Token | Status |
|-----------------|-------|--------|
| **Background** | `--color-background-secondary` (#F8F9FA / #141414) | ✅ Available — described as "卡片/面板背景" |
| **Background (elevated)** | `--color-background-tertiary` (#F1F3F4 / #1E1E1E) | ✅ Available — described as "悬浮/弹窗背景" |
| **Border** | `--color-border-default` (#DADCE0 / #2A2A2A) | ✅ Available |
| **Border (interactive)** | `--color-border-focus` | ✅ Available |
| **Radius** | `--radius-sm` (6px), `--radius-md` (10px), `--radius-lg` (16px) | ✅ Available |
| **Spacing** | `--spacing-1` through `--spacing-16` | ✅ Available |
| **Elevation / Shadow** | `--elevation-none`, `--elevation-low`, `--elevation-medium`, `--elevation-high` | ✅ Available |
| **Motion (duration)** | `--motion-duration-instant/fast/normal/slow` | ✅ Available |
| **Motion (easing)** | `--motion-easing-default/in/out/in-out` | ✅ Available |
| **Typography (family)** | `--font-family-heading`, `--font-family-body` | ✅ Available |
| **Typography (size)** | `--font-size-xs` through `--font-size-4xl` | ✅ Available |
| **Typography (weight)** | `--font-weight-regular/medium/semibold/bold` | ✅ Available |
| **Typography (line-height)** | `--line-height-tight/normal/relaxed` | ✅ Available |
| **Text color (primary)** | `--color-text-primary` | ✅ Available |
| **Text color (secondary)** | `--color-text-secondary` | ✅ Available |
| **Text color (disabled)** | `--color-text-disabled` | ✅ Available |

### Token Gap Analysis

**No gaps found.** All tokens required for a Card component already exist in the Foundation token set. The `--color-background-secondary` token is explicitly described as "卡片/面板背景" (card/panel background) — it was designed for this use case.

**Key observation:** The elevation tokens use `rgba(0,0,0,...)` values. In dark mode, shadows against `#0A0A0A` background will be nearly invisible. This is a known pattern (standard dark-mode design) — cards in dark mode should rely on background differentiation rather than shadow for elevation. This is acceptable and does not require new tokens.

### Hard Brand Hex Check

No component source file contains hardcoded `#D4AF37`, `#4285F4`, `#0A0A0A`, or `#FFFFFF` in className strings. All styling flows through CSS custom properties. This invariant must be maintained for Component-03.

---

## 6. Existing Tests and CI

### Test Framework

| Aspect | Value |
|--------|-------|
| Framework | Vitest 2.1.x |
| Environment | jsdom |
| Assertion Library | @testing-library/jest-dom 6.6.x |
| Rendering | @testing-library/react 16.1.x |
| Setup | `src/test/setup.ts` (matchMedia mock) |
| Config | `vitest.config.ts` (path alias `@` → `./src`) |

### Test Inventory

| File | Coverage |
|------|----------|
| `button.test.tsx` | 30 tests: rendering, variants, sizes, interaction, states, token compliance, accessibility |
| `input.test.tsx` | 32 tests: rendering, label, description/error, states, sizes, interaction, token compliance, accessibility |
| `homepage.test.tsx` | Renders sections, nav links, logo system, color palette, typography, tokens |
| `tokens.test.ts` | Token file integrity, CSS variable presence in generated output |
| `generated-tokens.test.ts` | Generated data structure validation |
| `logo.test.ts` | Logo component rendering |
| `theme.test.tsx` | Theme toggle behavior |

### CI Workflow (`.github/workflows/ui-foundation-ci.yml`)

```
Steps:
 1. pnpm install --frozen-lockfile
 2. pnpm tokens:check           ← Token JSON integrity
 3. pnpm tokens:build           ← Generate CSS + JS from JSON
 4. pnpm brand:sync             ← Sync brand assets
 5. pnpm lint                   ← ESLint
 6. pnpm test                   ← Vitest (all test files)
 7. pnpm build                  ← Next.js build
 8. Install Chrome (browser-actions/setup-chrome@v1)
 9. pnpm browser:verify         ← Foundation screenshots
10. pnpm component-02:browser-verify   ← Button screenshots
11. pnpm component-02b:browser-verify  ← Input screenshots
12. Upload artifacts (3 separate uploads)
```

### Browser Verification Pattern

Each component has its own browser-verify script (`scripts/component-02b-browser-verify.mts`):
- Uses Puppeteer with system Chrome
- Starts Next.js dev server on unique port (3003)
- Takes screenshots: desktop-dark, desktop-light, tablet-dark, tablet-light, mobile-dark, mobile-light
- Generates `verification-report.json` with hashes
- Screenshots stored in `deliverables/ui-component-0Xb-<name>/actual/`
- CI uploads as artifacts with 30-day retention

### Required New Dependencies

**None.** The existing toolchain (Puppeteer, Vitest, @testing-library/react, Tailwind CSS v4) is sufficient for Card implementation.

---

## 7. Card 是否已有实现

**No.** There is no Card component in `src/components/`. The showcase page uses inline card-like patterns (div with `bg-[var(--color-background-secondary)]`, `border`, `rounded-[var(--radius-lg)]`), but these are not extracted into a reusable component.

The token `--color-background-secondary` is explicitly described as "卡片/面板背景" in the token data, confirming Card was anticipated in the Foundation design.

---

## 8. Candidate Scope Comparison

### Option A: Minimal Card (Recommended ✅)

**Scope:** Single `Card` component with `header`, `children` (content), `footer` slots. Two visual variants (`elevated`, `outlined`). Two padding sizes (`md`, `lg`). No interactive states.

| Dimension | Assessment |
|-----------|------------|
| **Value** | High — removes inline card duplication from showcase; establishes layout primitive for all future content sections |
| **Technical Complexity** | Low — pure presentational component, no state management, no event handling |
| **Token Requirements** | All existing: `--color-background-secondary`, `--color-border-default`, `--radius-md`/`--radius-lg`, `--spacing-4`/`--spacing-6`/`--spacing-8`, `--elevation-low`/`--elevation-medium` |
| **Accessibility Needs** | Low — use `<article>` or `<section>` semantic element, optional `aria-label` |
| **Browser Verification Cost** | Same pattern as Button/Input: 6 screenshots (desktop/tablet/mobile × dark/light) |
| **Scope Expansion Risk** | Minimal — self-contained, no new dependencies, no new token types |

### Option B: Card + Multiple Variants

**Scope:** Option A + `interactive` variant (hover lift), `flush` variant (no border/shadow for nested cards), `horizontal` layout mode, image/media slot.

| Dimension | Assessment |
|-----------|------------|
| **Value** | Medium — interactive and horizontal variants add real value but aren't needed yet |
| **Technical Complexity** | Medium — hover state requires motion tokens, image slot adds responsive concerns, horizontal layout needs flexbox/grid logic |
| **Token Requirements** | Existing tokens sufficient, but hover elevation transitions need careful dark-mode handling |
| **Accessibility Needs** | Medium — interactive card needs `role="button"` or `tabIndex`, keyboard activation, focus management |
| **Browser Verification Cost** | Higher — interactive states need hover/focus screenshots, horizontal layout needs additional breakpoint coverage |
| **Scope Expansion Risk** | Moderate — interactive Card starts blurring into "clickable card" patterns that invite complex state management |

### Option C: Surface/Panel Foundation Component

**Scope:** Abstract `Surface` component providing background + elevation + radius without content slots. Card would later compose Surface.

| Dimension | Assessment |
|-----------|------------|
| **Value** | Low-Medium — over-abstraction at current stage; Surface alone has no content semantics |
| **Technical Complexity** | Low — but adds an indirection layer without clear consumer |
| **Token Requirements** | Same as Card |
| **Accessibility Needs** | Minimal — no semantic content |
| **Browser Verification Cost** | Low — but what do you screenshot? An empty box? |
| **Scope Expansion Risk** | Low for Surface itself, but creates pressure to build Card on top immediately (doubling scope) |

### Option D: Defer Card, Do Other Higher-Value Component

**Scope:** Skip Card, implement something else (e.g., Badge, Tooltip, Toggle).

| Dimension | Assessment |
|-----------|------------|
| **Value** | Depends on alternative — Badge/Tooltip have lower structural value than Card |
| **Technical Complexity** | Variable |
| **Token Requirements** | Variable |
| **Accessibility Needs** | Variable |
| **Browser Verification Cost** | Variable |
| **Scope Expansion Risk** | Low — but delays the layout primitive that every content section needs |

---

## 9. Recommended Minimal Scope

**Recommendation: Option A — Minimal Card**

### Rationale

1. **Token-ready:** Every required token already exists. `--color-background-secondary` was designed for card backgrounds.
2. **Pattern extraction:** The showcase page already has 5+ instances of identical card-like inline styling. This is a clear refactoring target.
3. **Foundation for everything:** Cards are the building block for project showcases, blog posts, feature lists, testimonials — every content section in an "Intelligent Editorial Grid."
4. **Low risk:** Pure presentational component. No state, no events, no complex accessibility.
5. **Established verification pattern:** Follows the exact same Browser Verify → 6 screenshots → verification-report.json pipeline as Button and Input.
6. **No scope creep:** Minimal Card does not expand into a "component library" or "personal website." It's one file, one test, one verify script.

### What Minimal Card IS

- A container component with optional `header`, `children`, `footer`
- Two visual variants: `elevated` (shadow) and `outlined` (border)
- Two padding presets: `md` (16px) and `lg` (24px)
- Full token compliance (no hardcoded values)
- Semantic HTML (`<article>`)
- Responsive (full-width by default)

### What Minimal Card IS NOT

- Not interactive (no hover lift, no click handling)
- Not a "card system" (no horizontal, no media, no flush variants)
- Not a Surface/Panel abstraction
- Not a layout grid system
- Not a content management system

---

## 10. Proposed Component API 初稿

```typescript
type CardVariant = "elevated" | "outlined";
type CardPadding = "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual variant. "elevated" uses shadow, "outlined" uses border. */
  variant?: CardVariant;       // default: "elevated"
  /** Internal padding preset. */
  padding?: CardPadding;       // default: "lg"
  /** Card header content. Rendered above children with separator. */
  header?: React.ReactNode;
  /** Card footer content. Rendered below children with separator. */
  footer?: React.ReactNode;
  /** Accessible label for the card landmark. */
  "aria-label"?: string;
}
```

### Usage Example

```tsx
// Simple card
<Card>
  <p>Content goes here</p>
</Card>

// Card with header and footer
<Card header={<h3>Project Title</h3>} footer={<Button size="sm">View</Button>}>
  <p>Project description text.</p>
</Card>

// Outlined variant with custom padding
<Card variant="outlined" padding="md">
  <p>Compact card content</p>
</Card>

// With custom className and aria-label
<Card aria-label="Featured project" className="max-w-md">
  <p>Featured content</p>
</Card>
```

### Implementation Notes

- Render as `<article>` by default (semantic, accessible)
- `forwardRef` for ref forwarding (consistent with Button/Input)
- `className` applies to the outer container (consistent with Button pattern)
- `header` and `footer` are visually separated with a subtle border line
- All styling via CSS custom properties via Tailwind utility classes
- `cn()` utility — consider extracting to `src/lib/utils.ts` to eliminate duplication

---

## 11. Proposed Variants / Sizes / States

### Variants

| Variant | Background | Border | Shadow | Token Usage |
|---------|-----------|--------|--------|-------------|
| `elevated` (default) | `--color-background-secondary` | `--color-border-default` | `--elevation-low` | BG + subtle shadow for depth |
| `outlined` | `--color-background-secondary` | `--color-border-default` | none | BG + visible border, no shadow |

### Padding

| Presing | Value | Token |
|---------|-------|-------|
| `md` | 16px | `--spacing-4` |
| `lg` (default) | 24px | `--spacing-6` |

Header/footer sections get slightly reduced padding (`--spacing-4` or `--spacing-3`).

### States

**None for v1.** Minimal Card is purely presentational:
- No hover state
- No focus state (not interactive)
- No disabled state
- No loading state

If interactive Card is needed later, it should be a separate variant or a composed Card+Button pattern — not baked into the Card itself.

### Border Radius

Use `--radius-lg` (16px) for the outer container — consistent with the existing showcase page pattern.

### Header/Footer Separation

Use `border-b` / `border-t` with `--color-border-default` at reduced opacity or the existing default border color. This creates visual separation without introducing new tokens.

---

## 12. Accessibility Considerations

| Requirement | Approach |
|-------------|----------|
| Semantic HTML | `<article>` element (not `<div>`) |
| Landmark labeling | Optional `aria-label` prop |
| Header association | `<header>` element inside `<article>` for card header |
| Footer association | `<footer>` element inside `<article>` for card footer |
| Content section | Main content as direct children of `<article>`, wrapped in a `<div>` with appropriate padding |
| Keyboard navigation | Not applicable (Card is not interactive in v1) |
| Screen readers | `<article>` is announced as an article/region; `aria-label` provides context |
| Color contrast | Background tokens already validated for contrast against text tokens |
| Reduced motion | No animations in v1 (no motion tokens needed for state transitions) |

### Test Cases Required

1. Renders as `<article>` element
2. Renders header content in `<header>` element
3. Renders footer content in `<footer>` element
4. Renders children content
5. `aria-label` passes through
6. `className` passes through to outer element
7. `ref` forwards to `<article>` element
8. Default variant is `elevated`
9. Default padding is `lg`
10. `outlined` variant has no shadow class
11. `elevated` variant has elevation class
12. Token compliance: no hardcoded brand hex in className
13. Token compliance: uses CSS variables for background, border, radius, spacing

---

## 13. Responsive Considerations

| Aspect | Approach |
|--------|----------|
| Width | `w-full` by default (responsive by nature) |
| Max-width | Not enforced by Card itself — consumer controls via `className` or wrapper |
| Padding | Fixed token values (not responsive) — this is consistent with Button/Input |
| Header/Footer | Stack vertically by default (no horizontal layout in v1) |
| Mobile | Full-width, standard padding — no special mobile behavior needed |
| Breakpoints | No breakpoint-specific styles in v1 |

**Key decision:** Card does not own its width. It fills its container. This is the correct behavior for a composable primitive — the parent grid/layout controls sizing.

---

## 14. Browser Verification Requirements

### Required Script

`scripts/component-03-browser-verify.mts` — following the exact pattern of `component-02b-browser-verify.mts`.

### Screenshots Required

| Viewport | Theme | Filename |
|----------|-------|----------|
| Desktop (1280px) | Dark | `desktop-dark.png` |
| Desktop (1280px) | Light | `desktop-light.png` |
| Tablet (768px) | Dark | `tablet-dark.png` |
| Tablet (768px) | Light | `tablet-light.png` |
| Mobile (375px) | Dark | `mobile-dark.png` |
| Mobile (375px) | Light | `mobile-light.png` |

### Verification Report

`deliverables/ui-component-03-card/actual/verification-report.json` — JSON with file hashes, viewport dimensions, and pass/fail status.

### Deliverable Directory

```
deliverables/ui-component-03-card/
  actual/
    desktop-dark.png
    desktop-light.png
    tablet-dark.png
    tablet-light.png
    mobile-dark.png
    mobile-light.png
    verification-report.json
  component-03-report.md
  pr-body.md
```

### CI Integration Required

Add to `.github/workflows/ui-foundation-ci.yml`:
```yaml
- name: Component-03 browser verification
  run: pnpm component-03:browser-verify
  env:
    CHROME_PATH: ${{ steps.setup-chrome.outputs.chrome-path }}
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: component-03-screenshots
    path: deliverables/ui-component-03-card/actual/
    retention-days: 30
```

---

## 15. Screenshot Requirements

### Showcase Page Additions

The showcase page (`src/app/page.tsx`) needs a new section for Card:

```
# Card section in showcase page:
- Card Variants: elevated vs outlined side-by-side
- Card with Header/Footer: full composition example
- Card Sizes: md vs lg padding comparison
- Card in Grid: 2-3 cards in a responsive grid (demonstrates real usage)
```

All screenshots should capture:
1. Card component section in isolation
2. Both themes (dark/light)
3. All three viewports (desktop/tablet/mobile)
4. Cards within a grid layout to demonstrate composability

---

## 16. Required New Dependencies

**None.**

| Dependency | Needed? | Reason |
|------------|---------|--------|
| New npm packages | ❌ No | Tailwind CSS v4 + existing tokens handle all styling |
| New test utilities | ❌ No | @testing-library/react + Vitest sufficient |
| New browser tools | ❌ No | Puppeteer + existing verify pattern sufficient |
| New design tokens | ❌ No | All required tokens exist in Foundation |
| New fonts | ❌ No | Plus Jakarta Sans, Inter, JetBrains Mono already loaded |

---

## 17. Non-Goals

The following are explicitly **out of scope** for Component-03:

1. **Interactive Card** (hover lift, click handling, keyboard activation) — defer to future variant
2. **Horizontal Card** (image + text side-by-side layout) — defer to future variant
3. **Card Grid / Card Layout system** — not a Card concern; use CSS Grid in the page
4. **Surface/Panel abstraction** — premature; Card is concrete enough
5. **Card with image/media slot** — defer; needs responsive image handling
6. **Skeleton/loading state** — defer; no loading use case yet
7. **Card composition with Button/Input** — demonstrate in showcase, but Card itself doesn't embed them
8. **Extracting `cn()` to shared utility** — nice-to-have cleanup, but not part of Component-03 scope
9. **New design tokens** — none needed, none to be created
10. **Stitch-generated designs** — Card is structural, not a design exploration target
11. **Full personal website / dashboard** — Card is a single primitive component
12. **Component documentation site** — showcase page is sufficient for now

---

## 18. Risks and Open Questions

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Elevation tokens invisible in dark mode** | Low | Expected behavior. Dark mode cards should use background differentiation (`secondary` vs `primary`), not shadow. Document this in showcase. |
| **`cn()` duplication** (Button, Input, Card all define locally) | Low | Not blocking. Extract in a future cleanup PR. Don't bundle with Component-03. |
| **Header/footer separator design ambiguity** | Low | Use `border-[var(--color-border-default)]` — same border pattern as existing components. |
| **Card over-use temptation** | Low | Non-goal section explicitly prevents scope creep. Gate review controls this. |
| **Semantic HTML choice (`<article>` vs `<section>` vs `<div>`)** | Low | `<article>` is correct for self-contained content. If ChatGPT prefers `<section>`, easy to change. |

### Open Questions for ChatGPT (Product)

1. **Default variant:** Should `elevated` (shadow) or `outlined` (border) be the default? Proposal: `elevated` (more distinctive, establishes depth hierarchy).

2. **Default padding:** Should `lg` (24px) or `md` (16px) be default? Proposal: `lg` (cards are containers, need breathing room).

3. **Header/footer separator:** Thin border line (1px `--color-border-default`) or visual whitespace only? Proposal: thin border line (consistent with existing patterns).

4. **Card section in showcase:** Should it include a grid demo (multiple cards) or just single-card examples? Proposal: include a 2-card grid to demonstrate the primary use case.

5. **Article vs Section:** `<article>` is semantically correct for self-contained content. `<section>` is thematic grouping. Preference?

6. **Do we need a `flush` variant** (no padding, no border — for nested cards inside grids)? Proposal: no, defer to future.

---

## 19. Recommendation to ChatGPT

### Primary Recommendation: Proceed with Option A — Minimal Card

**Component name:** `Card`
**File:** `src/components/Card.tsx`
**Test:** `src/test/card.test.tsx`
**Verify script:** `scripts/component-03-browser-verify.mts`
**Showcase section:** `#card` in `src/app/page.tsx`
**Deliverable dir:** `deliverables/ui-component-03-card/`

### Implementation Checklist (for ChatGPT Gate)

- [ ] Card component with `elevated` / `outlined` variants
- [ ] Card component with `md` / `lg` padding presets
- [ ] Optional `header`, `children`, `footer` composition
- [ ] Semantic HTML (`<article>` with `<header>` / `<footer>`)
- [ ] `forwardRef` + `aria-label` pass-through
- [ ] Full token compliance (no hardcoded hex)
- [ ] Unit tests (≥12 test cases covering rendering, variants, padding, composition, token compliance, accessibility)
- [ ] Browser verification script (6 screenshots)
- [ ] Showcase section with variant/composition/grid examples
- [ ] CI workflow updated with component-03 verify step
- [ ] Deliverable report + PR body

### Expected Effort

| Phase | Estimate |
|-------|----------|
| Component implementation | ~100 lines of code |
| Unit tests | ~150 lines, ~15 test cases |
| Browser verify script | ~300 lines (following existing pattern) |
| Showcase section | ~80 lines of JSX |
| CI workflow update | ~12 lines |
| **Total** | ~640 lines of new code |

### What This Enables

After Component-03, the showcase page can use `<Card>` everywhere instead of inline div styling. This establishes the pattern for all future content components and keeps the codebase DRY.

---

*Report generated by Hermes Engineering Lead. No code changes were made. Awaiting ChatGPT product review and Gate approval.*
