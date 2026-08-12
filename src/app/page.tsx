"use client";

import { HawkLogo } from "@/components/HawkLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

const COLORS_DARK = [
  { name: "brand.primary", hex: "#D4AF37", desc: "Hawk Gold" },
  { name: "brand.primary-light", hex: "#E8D48B", desc: "Hover" },
  { name: "brand.primary-dark", hex: "#B8941E", desc: "Pressed" },
  { name: "background.primary", hex: "#0A0A0A", desc: "Main BG" },
  { name: "background.secondary", hex: "#141414", desc: "Card BG" },
  { name: "background.tertiary", hex: "#1E1E1E", desc: "Popover BG" },
  { name: "text.primary", hex: "#EAEAEA", desc: "Primary text" },
  { name: "text.secondary", hex: "#A0A0A0", desc: "Secondary text" },
  { name: "text.disabled", hex: "#666666", desc: "Disabled" },
  { name: "border.default", hex: "#2A2A2A", desc: "Default border" },
  { name: "border.focus", hex: "#D4AF37", desc: "Focus border" },
  { name: "semantic.success", hex: "#34A853", desc: "Success" },
  { name: "semantic.warning", hex: "#FBBC05", desc: "Warning" },
  { name: "semantic.error", hex: "#EA4335", desc: "Error" },
  { name: "semantic.info", hex: "#4285F4", desc: "Info" },
];

const COLORS_LIGHT = [
  { name: "brand.primary", hex: "#4285F4", desc: "Hawk Blue" },
  { name: "brand.primary-light", hex: "#669DF6", desc: "Hover" },
  { name: "brand.primary-dark", hex: "#1A73E8", desc: "Pressed" },
  { name: "background.primary", hex: "#FFFFFF", desc: "Main BG" },
  { name: "background.secondary", hex: "#F8F9FA", desc: "Card BG" },
  { name: "background.tertiary", hex: "#F1F3F4", desc: "Popover BG" },
  { name: "text.primary", hex: "#202124", desc: "Primary text" },
  { name: "text.secondary", hex: "#5F6368", desc: "Secondary text" },
  { name: "text.disabled", hex: "#9AA0A6", desc: "Disabled" },
  { name: "border.default", hex: "#DADCE0", desc: "Default border" },
  { name: "border.focus", hex: "#4285F4", desc: "Focus border" },
  { name: "semantic.success", hex: "#34A853", desc: "Success" },
  { name: "semantic.warning", hex: "#FBBC05", desc: "Warning" },
  { name: "semantic.error", hex: "#EA4335", desc: "Error" },
  { name: "semantic.info", hex: "#4285F4", desc: "Info" },
];

const SPACING = [
  { name: "0", value: "0px" },
  { name: "1", value: "4px" },
  { name: "2", value: "8px" },
  { name: "3", value: "12px" },
  { name: "4", value: "16px" },
  { name: "6", value: "24px" },
  { name: "8", value: "32px" },
  { name: "12", value: "48px" },
  { name: "16", value: "64px" },
  { name: "24", value: "96px" },
  { name: "32", value: "128px" },
];

const RADII = [
  { name: "none", value: "0px" },
  { name: "sm", value: "6px" },
  { name: "md", value: "10px" },
  { name: "lg", value: "16px" },
  { name: "full", value: "9999px" },
];

const ELEVATIONS = [
  { name: "none", value: "none" },
  { name: "low", value: "0 1px 3px rgba(0,0,0,0.08)" },
  { name: "medium", value: "0 4px 12px rgba(0,0,0,0.12)" },
  { name: "high", value: "0 8px 24px rgba(0,0,0,0.16)" },
];

const MOTIONS = [
  { name: "instant", value: "0ms" },
  { name: "fast", value: "120ms" },
  { name: "normal", value: "200ms" },
  { name: "slow", value: "320ms" },
];

const FONT_SIZES = [
  { name: "xs", value: "0.75rem" },
  { name: "sm", value: "0.875rem" },
  { name: "base", value: "1rem" },
  { name: "lg", value: "1.125rem" },
  { name: "xl", value: "1.25rem" },
  { name: "2xl", value: "1.5rem" },
  { name: "3xl", value: "1.875rem" },
  { name: "4xl", value: "2.25rem" },
];

const FONT_FAMILIES = [
  { name: "heading", value: "Plus Jakarta Sans", desc: "Titles & headings" },
  { name: "body", value: "Inter", desc: "Body text" },
  { name: "code", value: "JetBrains Mono", desc: "Code blocks" },
];

const FONT_WEIGHTS = [
  { name: "regular", value: 400 },
  { name: "medium", value: 500 },
  { name: "semibold", value: 600 },
  { name: "bold", value: 700 },
];

function SectionHeader({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <div id={id} style={{ scrollMarginTop: "80px", marginBottom: "48px" }}>
      <h2
        style={{
          fontSize: "var(--fontSize-4xl)",
          fontWeight: "var(--fontWeight-bold)",
          color: "var(--color-brand-primary, var(--text-primary))",
          marginBottom: "8px",
        }}
      >
        {title}
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "var(--fontSize-lg)" }}>
        {subtitle}
      </p>
    </div>
  );
}

export default function Home() {
  const { resolved } = useTheme();
  const colors = resolved === "dark" ? COLORS_DARK : COLORS_LIGHT;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 32px",
          background: "var(--background-primary)",
          borderBottom: "1px solid var(--border-default)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <HawkLogo variant="mark" width={36} height={36} />
          <span
            style={{
              fontFamily: "var(--fontFamily-heading)",
              fontWeight: "var(--fontWeight-bold)",
              fontSize: "var(--fontSize-lg)",
              letterSpacing: "0.08em",
            }}
          >
            HAWK
          </span>
        </div>
        <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {["Logo", "Color", "Typography", "Tokens"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "var(--fontSize-sm)",
                transition: "color var(--duration-fast) var(--easing-default)",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
            >
              {item}
            </a>
          ))}
          <ThemeToggle />
        </nav>
      </header>

      {/* Hero */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          textAlign: "center",
          padding: "64px 32px",
        }}
      >
        <HawkLogo variant="full" width={320} height={320} />
        <h1
          style={{
            fontFamily: "var(--fontFamily-logo, var(--fontFamily-heading))",
            fontSize: "var(--fontSize-4xl)",
            fontWeight: "var(--fontWeight-bold)",
            letterSpacing: "0.08em",
            marginTop: "32px",
            color: "var(--color-brand-primary, var(--text-primary))",
          }}
        >
          HAWK
        </h1>
        <p
          style={{
            fontSize: "var(--fontSize-xl)",
            color: "var(--text-secondary)",
            marginTop: "16px",
            maxWidth: "480px",
          }}
        >
          A personal technology identity system.
        </p>
        <p
          style={{
            fontSize: "var(--fontSize-lg)",
            color: "var(--text-disabled)",
            marginTop: "12px",
            letterSpacing: "0.2em",
          }}
        >
          轻奢 · 现代 · 智能
        </p>
      </section>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 96px" }}>
        {/* Logo System */}
        <section id="logo" style={{ paddingTop: "64px" }}>
          <SectionHeader
            id="logo-heading"
            title="Logo System"
            subtitle="Primary brand marks in dark and light modes"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              marginBottom: "48px",
            }}
          >
            {(["full", "mark", "icon"] as const).map((variant) => (
              <div
                key={variant}
                style={{
                  padding: "32px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-default)",
                  background: "var(--background-secondary)",
                  textAlign: "center",
                }}
              >
                <HawkLogo variant={variant} width={128} height={128} />
                <p
                  style={{
                    marginTop: "16px",
                    fontFamily: "var(--fontFamily-code)",
                    fontSize: "var(--fontSize-sm)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {variant}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "24px",
              borderRadius: "var(--radius-lg)",
              background: "var(--background-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <h3 style={{ marginBottom: "16px", fontSize: "var(--fontSize-xl)" }}>
              Logo Rules
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <p style={{ fontWeight: "var(--fontWeight-semibold)", marginBottom: "4px" }}>
                  Minimum Sizes
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--fontSize-sm)" }}>
                  Full: 120px · Mark: 32px · Icon: 16px
                </p>
              </div>
              <div>
                <p style={{ fontWeight: "var(--fontWeight-semibold)", marginBottom: "4px" }}>
                  Safe Area
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--fontSize-sm)" }}>
                  1× stroke-width clearance on all sides
                </p>
              </div>
              <div>
                <p style={{ fontWeight: "var(--fontWeight-semibold)", marginBottom: "4px" }}>
                  Prohibited Uses
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--fontSize-sm)" }}>
                  No gradients · No shadows · No 3D · No rotation · No stretching
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section id="color" style={{ paddingTop: "64px" }}>
          <SectionHeader
            id="color-heading"
            title="Color Palette"
            subtitle={`${resolved === "dark" ? "Dark" : "Light"} mode tokens`}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {colors.map((c) => (
              <div
                key={c.name}
                style={{
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div
                  style={{
                    height: "80px",
                    background: c.hex,
                    border: c.hex === "#FFFFFF" || c.hex === "#0A0A0A"
                      ? "1px solid var(--border-default)"
                      : "none",
                  }}
                />
                <div style={{ padding: "12px", background: "var(--background-secondary)" }}>
                  <p style={{ fontFamily: "var(--fontFamily-code)", fontSize: "var(--fontSize-sm)" }}>
                    {c.name}
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "var(--fontSize-xs)" }}>
                    {c.hex} · {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section id="typography" style={{ paddingTop: "64px" }}>
          <SectionHeader
            id="typography-heading"
            title="Typography"
            subtitle="Font families, sizes, weights, and line heights"
          />

          {/* Font Families */}
          <div style={{ marginBottom: "48px" }}>
            <h3 style={{ marginBottom: "24px", fontSize: "var(--fontSize-2xl)" }}>
              Font Families
            </h3>
            {FONT_FAMILIES.map((f) => (
              <div
                key={f.name}
                style={{
                  padding: "24px",
                  marginBottom: "16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--background-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <p
                  style={{
                    fontFamily: f.value,
                    fontSize: "var(--fontSize-2xl)",
                    marginBottom: "8px",
                  }}
                >
                  {f.value} — The quick brown fox
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--fontSize-sm)" }}>
                  {f.name} · {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Font Sizes */}
          <div style={{ marginBottom: "48px" }}>
            <h3 style={{ marginBottom: "24px", fontSize: "var(--fontSize-2xl)" }}>
              Font Sizes
            </h3>
            {FONT_SIZES.map((s) => (
              <div
                key={s.name}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "16px",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border-default)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--fontFamily-code)",
                    fontSize: "var(--fontSize-sm)",
                    color: "var(--text-secondary)",
                    minWidth: "48px",
                  }}
                >
                  {s.name}
                </span>
                <span style={{ fontSize: s.value }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Font Weights */}
          <div style={{ marginBottom: "48px" }}>
            <h3 style={{ marginBottom: "24px", fontSize: "var(--fontSize-2xl)" }}>
              Font Weights
            </h3>
            {FONT_WEIGHTS.map((w) => (
              <div
                key={w.name}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "16px",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border-default)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--fontFamily-code)",
                    fontSize: "var(--fontSize-sm)",
                    color: "var(--text-secondary)",
                    minWidth: "80px",
                  }}
                >
                  {w.name} ({w.value})
                </span>
                <span style={{ fontWeight: w.value, fontSize: "var(--fontSize-xl)" }}>
                  Aa Bb Cc 012
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Foundation Tokens */}
        <section id="tokens" style={{ paddingTop: "64px" }}>
          <SectionHeader
            id="tokens-heading"
            title="Foundation Tokens"
            subtitle="Spacing, radius, elevation, and motion"
          />

          {/* Spacing */}
          <div style={{ marginBottom: "48px" }}>
            <h3 style={{ marginBottom: "24px", fontSize: "var(--fontSize-2xl)" }}>
              Spacing
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {SPACING.map((s) => (
                <div
                  key={s.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--fontFamily-code)",
                      fontSize: "var(--fontSize-sm)",
                      color: "var(--text-secondary)",
                      minWidth: "32px",
                    }}
                  >
                    {s.name}
                  </span>
                  <div
                    style={{
                      height: "24px",
                      width: s.value,
                      background: "var(--color-brand-primary, #D4AF37)",
                      borderRadius: "var(--radius-sm)",
                      opacity: 0.8,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--fontFamily-code)",
                      fontSize: "var(--fontSize-xs)",
                      color: "var(--text-disabled)",
                    }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Radius */}
          <div style={{ marginBottom: "48px" }}>
            <h3 style={{ marginBottom: "24px", fontSize: "var(--fontSize-2xl)" }}>
              Border Radius
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
              {RADII.map((r) => (
                <div key={r.name} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "var(--color-brand-primary, #D4AF37)",
                      borderRadius: r.value,
                      opacity: 0.3,
                      border: "2px solid var(--color-brand-primary, #D4AF37)",
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "var(--fontFamily-code)",
                      fontSize: "var(--fontSize-sm)",
                      marginTop: "8px",
                    }}
                  >
                    {r.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--fontFamily-code)",
                      fontSize: "var(--fontSize-xs)",
                      color: "var(--text-disabled)",
                    }}
                  >
                    {r.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Elevation */}
          <div style={{ marginBottom: "48px" }}>
            <h3 style={{ marginBottom: "24px", fontSize: "var(--fontSize-2xl)" }}>
              Elevation
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
              {ELEVATIONS.map((e) => (
                <div key={e.name} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "120px",
                      height: "80px",
                      background: "var(--background-secondary)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      boxShadow: e.value === "none" ? "none" : e.value,
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "var(--fontFamily-code)",
                      fontSize: "var(--fontSize-sm)",
                      marginTop: "8px",
                    }}
                  >
                    {e.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Motion */}
          <div style={{ marginBottom: "48px" }}>
            <h3 style={{ marginBottom: "24px", fontSize: "var(--fontSize-2xl)" }}>
              Motion
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
              {MOTIONS.map((m) => (
                <div key={m.name} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "var(--color-brand-primary, #D4AF37)",
                      borderRadius: "var(--radius-md)",
                      opacity: 0.3,
                      transition: `opacity ${m.value} ease`,
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = "0.3")}
                  />
                  <p
                    style={{
                      fontFamily: "var(--fontFamily-code)",
                      fontSize: "var(--fontSize-sm)",
                      marginTop: "8px",
                    }}
                  >
                    {m.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--fontFamily-code)",
                      fontSize: "var(--fontSize-xs)",
                      color: "var(--text-disabled)",
                    }}
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
        style={{
          textAlign: "center",
          padding: "32px",
          borderTop: "1px solid var(--border-default)",
          color: "var(--text-secondary)",
          fontSize: "var(--fontSize-sm)",
        }}
      >
        HAWK Brand System · Gate HAWK-UI-Foundation-01
      </footer>
    </div>
  );
}
