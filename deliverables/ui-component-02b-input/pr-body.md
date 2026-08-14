## Goal
Implement HAWK Input component — text input with label, description, error, and accessibility support.

## Scope
- `src/components/Input.tsx` — Input component with forwardRef
- `src/test/input.test.tsx` — 53 unit tests (163 total with Foundation)
- `src/app/page.tsx` — Input showcase
- `scripts/component-02b-browser-verify.mts` — Browser verification
- `tokens/color/light.json` + `tokens/color/dark.json` — New `text-error` token

## Non-goals
- No Select, Textarea, Checkbox, Radio
- No new dependencies

## API
```typescript
type InputSize = "sm" | "md" | "lg";
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  description?: string;
  error?: string;
  size?: InputSize;
  fullWidth?: boolean;
}
```

## Token Compliance
- All colors via CSS variables — zero hardcoded hex
- New token: `--color-text-error` (light: #C62828, dark: #EA4335)
- Error text contrast: Light 5.62:1, Dark 5.05:1 (both ≥4.5:1 AA)
- Border: `--color-border-default`, `--color-border-focus`, `--color-semantic-error`
- Background: `--color-background-primary`, `--color-background-secondary`

## Label / Description / Error Semantics
- Label: `htmlFor` correctly associated
- Description: `aria-describedby` with stable DOM ID
- Error: `aria-invalid="true"`, `aria-describedby`, `role="alert"`
- Description + error: both rendered, both IDs in `aria-describedby`
- className applies to `<input>` element (not wrapper)

## Touch Targets
- sm: 44px, md: 44px, lg: 48px

## Tests
- 163/163 passed (53 Input + 41 Button + 69 Foundation)

## Browser Verification (6/6 PASS)
- Viewports: desktop 1440x900, tablet 768x1024, mobile 390x844
- Themes: dark, light
- Error text contrast verified via computed style: Light 5.62:1, Dark 5.05:1
- Description+error dual DOM verification: PASS
- All checks pass: focus, hover, disabled, readOnly, aria-invalid, label, touch, reduced-motion

## CI
All commands passing. CI Run: success.

## Known Limitations
- `text-[var(--font-size-sm)]` Tailwind class generates `color` not `font-size` — description/error use inline style as workaround

## ChatGPT Review Pending
- Draft PR — do not merge, do not convert to Ready, do not deploy
