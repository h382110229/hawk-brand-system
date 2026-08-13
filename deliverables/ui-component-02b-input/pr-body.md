## Goal
Implement HAWK Input component — text input with label, description, error, and accessibility support, consistent with Button architecture.

## Scope
- `src/components/Input.tsx` — Input component with forwardRef
- `src/test/input.test.tsx` — 51 unit tests (161 total with Foundation)
- `src/app/page.tsx` — Input showcase in design system page
- `scripts/component-02b-browser-verify.mts` — Browser verification script
- `.github/workflows/ui-foundation-ci.yml` — CI updates
- `deliverables/ui-component-02b-input/actual/` — Screenshots and verification report

## Non-goals
- No Select, Textarea, Checkbox, Radio
- No complex validation logic
- No new dependencies

## API
```typescript
type InputSize = "sm" | "md" | "lg";
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  description?: string;
  error?: string;
  size?: InputSize;       // default: "md"
  fullWidth?: boolean;    // default: true
}
```

## Label / Description / Error Semantics
- Label: `<label htmlFor={inputId}>` — correctly associated
- Description: `aria-describedby` with stable ID
- Error: `aria-invalid="true"`, `aria-describedby` with error ID, `role="alert"`
- Description + error: both IDs in `aria-describedby`
- No label: `aria-label` from caller works correctly
- Required: native `required` + visual `*` indicator

## Token Compliance
- All colors via CSS variables — zero hardcoded hex
- Error: `--color-semantic-error` (Light: #EA4335, Dark: #EA4335)
- Border: `--color-border-default`, `--color-border-focus`
- Background: `--color-background-primary`, `--color-background-secondary`
- Text: `--color-text-primary`, `--color-text-secondary`, `--color-text-disabled`
- Radius: `--radius-md`
- Motion: `--motion-duration-fast`, `--motion-easing-default`

## Touch Targets
- sm: 44px, md: 44px, lg: 48px

## Tests
- 161/161 passed (51 Input + 41 Button + 69 Foundation)
- Covers: rendering, label, description, error, states, sizes, interaction, token compliance, accessibility

## Browser Verification (6/6 PASS)
- Viewports: desktop 1440x900, tablet 768x1024, mobile 390x844
- Themes: dark, light
- Text contrast: 16.46:1 (dark), 16.10:1 (light)
- All checks pass: focus-visible, hover, disabled, readOnly, aria-invalid, label association, touch targets, reduced-motion, no overflow

## CI
All commands passing: tokens:check, tokens:build, brand:sync, lint, test, build, browser:verify, component-02b:browser-verify

## Known Limitations
- Error text contrast in light mode: 3.92:1 (below 4.5:1 AA for small text, passes 3:1 for large text)
- No dedicated `--color-border-error` token — reuses `--color-semantic-error`
- No complex validation (regex, async, etc.)

## ChatGPT Review Pending
- Draft PR — do not merge, do not convert to Ready, do not deploy
