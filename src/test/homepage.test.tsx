import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/ThemeProvider";

// Mock Next.js Image — strip Next-specific props like `priority` that aren't valid on <img>
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { priority: _p, ...imgProps } = props; // eslint-disable-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imgProps} alt={imgProps.alt as string} />;
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Import page after mocks
import Home from "@/app/page";

function renderHome() {
  return render(
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  );
}

describe("Homepage", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("renders the HAWK heading", () => {
    renderHome();
    const headings = screen.getAllByText("HAWK");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the tagline", () => {
    renderHome();
    expect(
      screen.getByText("A personal technology identity system.")
    ).toBeInTheDocument();
  });

  it("renders the Chinese subtitle", () => {
    renderHome();
    expect(screen.getByText("轻奢 · 现代 · 智能")).toBeInTheDocument();
  });

  it("renders nav links for key sections", () => {
    renderHome();
    expect(screen.getByText("Logo")).toBeInTheDocument();
    expect(screen.getByText("Color")).toBeInTheDocument();
    expect(screen.getAllByText("Typography").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Tokens")).toBeInTheDocument();
  });

  it("renders theme toggle buttons", () => {
    renderHome();
    expect(screen.getByLabelText(/Light mode/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dark mode/)).toBeInTheDocument();
    expect(screen.getByLabelText(/System mode/)).toBeInTheDocument();
  });

  it("renders logo system section", () => {
    renderHome();
    expect(screen.getByText("Logo System")).toBeInTheDocument();
    expect(screen.getAllByText("full").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("mark").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("icon").length).toBeGreaterThanOrEqual(1);
  });

  it("renders color palette section", () => {
    renderHome();
    expect(screen.getByText("Color Palette")).toBeInTheDocument();
  });

  it("renders typography section", () => {
    renderHome();
    expect(screen.getAllByText("Typography").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Font Families")).toBeInTheDocument();
    expect(screen.getByText("Font Sizes")).toBeInTheDocument();
    expect(screen.getByText("Font Weights")).toBeInTheDocument();
  });

  it("renders foundation tokens section", () => {
    renderHome();
    expect(screen.getByText("Foundation Tokens")).toBeInTheDocument();
    expect(screen.getByText("Spacing")).toBeInTheDocument();
    expect(screen.getByText("Border Radius")).toBeInTheDocument();
    expect(screen.getByText("Elevation")).toBeInTheDocument();
    expect(screen.getByText("Motion")).toBeInTheDocument();
  });
});
