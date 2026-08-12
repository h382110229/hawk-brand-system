"use client";

import { HawkLogo } from "@/components/HawkLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import {
  COLORS_DARK,
  COLORS_LIGHT,
  SPACING,
  RADII,
  ELEVATIONS,
  MOTIONS,
  FONT_SIZES,
  FONT_FAMILIES,
  FONT_WEIGHTS,
} from "@/lib/generated-token-data";

function SectionHeader({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <div id={id} className="scroll-mt-20 mb-12">
      <h2
        className="text-[var(--font-size-4xl)] font-[var(--font-weight-bold)] text-[var(--color-brand-primary,var(--color-text-primary))] mb-2"
      >
        {title}
      </h2>
      <p className="text-[var(--color-text-secondary)] text-[var(--font-size-lg)]">
        {subtitle}
      </p>
    </div>
  );
}

export default function Home() {
  const { resolved } = useTheme();
  const colors = resolved === "dark" ? COLORS_DARK : COLORS_LIGHT;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className="sticky top-0 z-100 flex items-center justify-between py-3 px-8 bg-[var(--color-background-primary)] border-b border-[var(--color-border-default)] backdrop-blur-[12px]"
      >
        <div className="flex items-center gap-3">
          <HawkLogo variant="mark" width={36} height={36} />
          <span
            className="font-[var(--font-family-heading)] font-[var(--font-weight-bold)] text-[var(--font-size-lg)] tracking-[var(--letter-spacing-wide)]"
          >
            HAWK
          </span>
        </div>
        <nav className="flex gap-6 items-center">
          {["Logo", "Color", "Typography", "Tokens"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[var(--color-text-secondary)] no-underline text-[var(--font-size-sm)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-default)] hover:text-[var(--color-text-primary)]"
            >
              {item}
            </a>
          ))}
          <ThemeToggle />
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] text-center py-16 px-8">
        <HawkLogo variant="full" width={320} height={320} />
        <h1
          className="font-[var(--font-family-logo,var(--font-family-heading))] text-[var(--font-size-4xl)] font-[var(--font-weight-bold)] tracking-[var(--letter-spacing-wide)] mt-8 text-[var(--color-brand-primary,var(--color-text-primary))]"
        >
          HAWK
        </h1>
        <p
          className="text-[var(--font-size-xl)] text-[var(--color-text-secondary)] mt-4 max-w-[480px]"
        >
          A personal technology identity system.
        </p>
        <p
          className="text-[var(--font-size-lg)] text-[var(--color-text-disabled)] mt-3 tracking-[var(--letter-spacing-wide)]"
        >
          轻奢 · 现代 · 智能
        </p>
      </section>

      <main className="max-w-[1200px] mx-auto px-8 pb-24">
        {/* Logo System */}
        <section id="logo" className="pt-16">
          <SectionHeader
            id="logo-heading"
            title="Logo System"
            subtitle="Primary brand marks in dark and light modes"
          />

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-12">
            {(["full", "mark", "icon"] as const).map((variant) => (
              <div
                key={variant}
                className="p-8 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-background-secondary)] text-center"
              >
                <HawkLogo variant={variant} width={128} height={128} />
                <p
                  className="mt-4 font-[var(--font-family-code)] text-[var(--font-size-sm)] text-[var(--color-text-secondary)]"
                >
                  {variant}
                </p>
              </div>
            ))}
          </div>

          <div
            className="p-6 rounded-[var(--radius-lg)] bg-[var(--color-background-secondary)] border border-[var(--color-border-default)]"
          >
            <h3 className="mb-4 text-[var(--font-size-xl)]">
              Logo Rules
            </h3>
            <div
              className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4"
            >
              <div>
                <p className="font-[var(--font-weight-semibold)] mb-1">
                  Minimum Sizes
                </p>
                <p className="text-[var(--color-text-secondary)] text-[var(--font-size-sm)]">
                  Full: 120px · Mark: 32px · Icon: 16px
                </p>
              </div>
              <div>
                <p className="font-[var(--font-weight-semibold)] mb-1">
                  Safe Area
                </p>
                <p className="text-[var(--color-text-secondary)] text-[var(--font-size-sm)]">
                  1× stroke-width clearance on all sides
                </p>
              </div>
              <div>
                <p className="font-[var(--font-weight-semibold)] mb-1">
                  Prohibited Uses
                </p>
                <p className="text-[var(--color-text-secondary)] text-[var(--font-size-sm)]">
                  No gradients · No shadows · No 3D · No rotation · No stretching
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section id="color" className="pt-16">
          <SectionHeader
            id="color-heading"
            title="Color Palette"
            subtitle={`${resolved === "dark" ? "Dark" : "Light"} mode tokens`}
          />

          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4"
          >
            {colors.map((c) => (
              <div
                key={c.name}
                className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border-default)]"
              >
                <div
                  className="h-20"
                  style={{
                    background: c.hex,
                    border: c.hex === "#FFFFFF" || c.hex === "#0A0A0A"
                      ? "1px solid var(--color-border-default)"
                      : "none",
                  }}
                />
                <div className="p-3 bg-[var(--color-background-secondary)]">
                  <p className="font-[var(--font-family-code)] text-[var(--font-size-sm)]">
                    {c.name}
                  </p>
                  <p className="text-[var(--color-text-secondary)] text-[var(--font-size-xs)]">
                    {c.hex} · {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section id="typography" className="pt-16">
          <SectionHeader
            id="typography-heading"
            title="Typography"
            subtitle="Font families, sizes, weights, and line heights"
          />

          {/* Font Families */}
          <div className="mb-12">
            <h3 className="mb-6 text-[var(--font-size-2xl)]">
              Font Families
            </h3>
            {FONT_FAMILIES.map((f) => (
              <div
                key={f.name}
                className="p-6 mb-4 rounded-[var(--radius-md)] bg-[var(--color-background-secondary)] border border-[var(--color-border-default)]"
              >
                <p
                  className="text-[var(--font-size-2xl)] mb-2"
                  style={{ fontFamily: f.value }}
                >
                  {f.value} — The quick brown fox
                </p>
                <p className="text-[var(--color-text-secondary)] text-[var(--font-size-sm)]">
                  {f.name} · {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Font Sizes */}
          <div className="mb-12">
            <h3 className="mb-6 text-[var(--font-size-2xl)]">
              Font Sizes
            </h3>
            {FONT_SIZES.map((s) => (
              <div
                key={s.name}
                className="flex items-baseline gap-4 py-3 border-b border-[var(--color-border-default)]"
              >
                <span
                  className="font-[var(--font-family-code)] text-[var(--font-size-sm)] text-[var(--color-text-secondary)] min-w-12"
                >
                  {s.name}
                </span>
                <span style={{ fontSize: s.value }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Font Weights */}
          <div className="mb-12">
            <h3 className="mb-6 text-[var(--font-size-2xl)]">
              Font Weights
            </h3>
            {FONT_WEIGHTS.map((w) => (
              <div
                key={w.name}
                className="flex items-baseline gap-4 py-3 border-b border-[var(--color-border-default)]"
              >
                <span
                  className="font-[var(--font-family-code)] text-[var(--font-size-sm)] text-[var(--color-text-secondary)] min-w-20"
                >
                  {w.name} ({w.value})
                </span>
                <span style={{ fontWeight: w.value, fontSize: "var(--font-size-xl)" }}>
                  Aa Bb Cc 012
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Foundation Tokens */}
        <section id="tokens" className="pt-16">
          <SectionHeader
            id="tokens-heading"
            title="Foundation Tokens"
            subtitle="Spacing, radius, elevation, and motion"
          />

          {/* Spacing */}
          <div className="mb-12">
            <h3 className="mb-6 text-[var(--font-size-2xl)]">
              Spacing
            </h3>
            <div className="flex flex-col gap-2">
              {SPACING.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-4"
                >
                  <span
                    className="font-[var(--font-family-code)] text-[var(--font-size-sm)] text-[var(--color-text-secondary)] min-w-8"
                  >
                    {s.name}
                  </span>
                  <div
                    className="h-6 bg-[var(--color-brand-primary,#D4AF37)] rounded-[var(--radius-sm)] opacity-80"
                    style={{ width: s.value }}
                  />
                  <span
                    className="font-[var(--font-family-code)] text-[var(--font-size-xs)] text-[var(--color-text-disabled)]"
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Radius */}
          <div className="mb-12">
            <h3 className="mb-6 text-[var(--font-size-2xl)]">
              Border Radius
            </h3>
            <div className="flex flex-wrap gap-6">
              {RADII.map((r) => (
                <div key={r.name} className="text-center">
                  <div
                    className="w-20 h-20 bg-[var(--color-brand-primary,#D4AF37)] opacity-30 border-2 border-[var(--color-brand-primary,#D4AF37)]"
                    style={{ borderRadius: r.value }}
                  />
                  <p
                    className="font-[var(--font-family-code)] text-[var(--font-size-sm)] mt-2"
                  >
                    {r.name}
                  </p>
                  <p
                    className="font-[var(--font-family-code)] text-[var(--font-size-xs)] text-[var(--color-text-disabled)]"
                  >
                    {r.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Elevation */}
          <div className="mb-12">
            <h3 className="mb-6 text-[var(--font-size-2xl)]">
              Elevation
            </h3>
            <div className="flex flex-wrap gap-6">
              {ELEVATIONS.map((e) => (
                <div key={e.name} className="text-center">
                  <div
                    className="w-[120px] h-20 bg-[var(--color-background-secondary)] rounded-[var(--radius-md)] border border-[var(--color-border-default)]"
                    style={{ boxShadow: e.value === "none" ? "none" : e.value }}
                  />
                  <p
                    className="font-[var(--font-family-code)] text-[var(--font-size-sm)] mt-2"
                  >
                    {e.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Motion */}
          <div className="mb-12">
            <h3 className="mb-6 text-[var(--font-size-2xl)]">
              Motion
            </h3>
            <div className="flex flex-wrap gap-6">
              {MOTIONS.map((m) => (
                <div key={m.name} className="text-center">
                  <div
                    className="w-20 h-20 bg-[var(--color-brand-primary,#D4AF37)] rounded-[var(--radius-md)] opacity-30 hover:opacity-100"
                    style={{ transition: `opacity ${m.value} ease` }}
                  />
                  <p
                    className="font-[var(--font-family-code)] text-[var(--font-size-sm)] mt-2"
                  >
                    {m.name}
                  </p>
                  <p
                    className="font-[var(--font-family-code)] text-[var(--font-size-xs)] text-[var(--color-text-disabled)]"
                  >
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-8 border-t border-[var(--color-border-default)] text-[var(--color-text-secondary)] text-[var(--font-size-sm)]"
      >
        HAWK Brand System · Gate HAWK-UI-Foundation-01
      </footer>
    </div>
  );
}
