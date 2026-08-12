import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

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

describe("Theme Toggle", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("renders all three theme options", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    expect(screen.getByLabelText(/Light mode/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dark mode/)).toBeInTheDocument();
    expect(screen.getByLabelText(/System mode/)).toBeInTheDocument();
  });

  it("sets data-theme attribute when clicking Dark", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByLabelText(/Dark mode/));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("sets data-theme attribute when clicking Light", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByLabelText(/Light mode/));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("persists theme to localStorage", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByLabelText(/Dark mode/));
    expect(localStorage.getItem("hawk-theme")).toBe("dark");
  });

  it("active button has aria-pressed=true", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    const darkBtn = screen.getByLabelText(/Dark mode/);
    expect(darkBtn).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(darkBtn);
    expect(darkBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("inactive buttons have aria-pressed=false", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByLabelText(/Dark mode/));
    expect(screen.getByLabelText(/Light mode/)).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByLabelText(/System mode/)).toHaveAttribute("aria-pressed", "false");
  });

  it("buttons have aria-label with current state", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    expect(screen.getByLabelText(/Light mode/)).toHaveAttribute("aria-label", expect.stringContaining("mode"));
    expect(screen.getByLabelText(/Dark mode/)).toHaveAttribute("aria-label", expect.stringContaining("mode"));
  });

  it("container has role=group with aria-label", () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    const group = container.querySelector('[role="group"]');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("aria-label", "Theme selection");
  });
});
