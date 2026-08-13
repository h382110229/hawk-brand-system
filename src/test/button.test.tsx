import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/Button";

describe("Button", () => {
  // ── Rendering ──────────────────────────────────────────────

  describe("rendering", () => {
    it("renders as a native button element", () => {
      render(<Button>Click</Button>);
      const btn = screen.getByRole("button", { name: "Click" });
      expect(btn.tagName).toBe("BUTTON");
    });

    it("renders children", () => {
      render(<Button>Hello World</Button>);
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("defaults to type='button'", () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("respects explicit type='submit'", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("applies className alongside defaults", () => {
      render(<Button className="custom-class">Test</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("custom-class");
      // Should also contain base styles
      expect(btn.className).toContain("inline-flex");
    });

    it("applies fullWidth class", () => {
      render(<Button fullWidth>Full</Button>);
      expect(screen.getByRole("button").className).toContain("w-full");
    });

    it("forwards ref to the button element", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Test</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe("Ref Test");
    });
  });

  // ── Variants ───────────────────────────────────────────────

  describe("variants", () => {
    it("defaults to primary variant", () => {
      render(<Button>Primary</Button>);
      const btn = screen.getByRole("button");
      // primary uses brand-primary background
      expect(btn.className).toContain("bg-[var(--color-brand-primary)]");
      // Text color via inline style to ensure contrast (overrides Tailwind inherit)
      expect(btn.style.color).toBe("var(--color-text-on-primary)");
    });

    it("renders secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain(
        "bg-[var(--color-background-tertiary)]"
      );
    });

    it("renders outline variant", () => {
      render(<Button variant="outline">Outline</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("bg-transparent");
      expect(btn.className).toContain(
        "text-[var(--color-brand-primary)]"
      );
    });

    it("renders ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("bg-transparent");
    });
  });

  // ── Sizes ──────────────────────────────────────────────────

  describe("sizes", () => {
    it("defaults to md size", () => {
      render(<Button>Medium</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("min-h-[44px]");
    });

    it("renders sm size", () => {
      render(<Button size="sm">Small</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("min-h-[44px]");
    });

    it("renders lg size", () => {
      render(<Button size="lg">Large</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("min-h-[48px]");
    });
  });

  // ── Interaction ────────────────────────────────────────────

  describe("interaction", () => {
    it("fires onClick when clicked", () => {
      const handler = vi.fn();
      render(<Button onClick={handler}>Click</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("does NOT fire onClick when disabled", () => {
      const handler = vi.fn();
      render(
        <Button disabled onClick={handler}>
          Disabled
        </Button>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handler).not.toHaveBeenCalled();
    });

    it("does NOT fire onClick when loading", () => {
      const handler = vi.fn();
      render(
        <Button loading onClick={handler}>
          Loading
        </Button>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handler).not.toHaveBeenCalled();
    });

    it("Enter key does not trigger click when disabled", () => {
      const handler = vi.fn();
      render(
        <Button disabled onClick={handler}>
          Enter
        </Button>
      );
      fireEvent.keyDown(screen.getByRole("button"), {
        key: "Enter",
        code: "Enter",
      });
      expect(handler).not.toHaveBeenCalled();
    });

    it("Space key does not trigger click when disabled", () => {
      const handler = vi.fn();
      render(
        <Button disabled onClick={handler}>
          Space
        </Button>
      );
      fireEvent.keyDown(screen.getByRole("button"), {
        key: " ",
        code: "Space",
      });
      expect(handler).not.toHaveBeenCalled();
    });

    it("Enter key does not trigger click when loading", () => {
      const handler = vi.fn();
      render(
        <Button loading onClick={handler}>
          Enter
        </Button>
      );
      fireEvent.keyDown(screen.getByRole("button"), {
        key: "Enter",
        code: "Enter",
      });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ── States ─────────────────────────────────────────────────

  describe("states", () => {
    it("sets native disabled attribute when disabled", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("sets native disabled attribute when loading", () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("sets aria-busy='true' when loading", () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-busy",
        "true"
      );
    });

    it("does NOT set aria-busy when not loading", () => {
      render(<Button>Normal</Button>);
      expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
    });

    it("preserves accessible name when loading", () => {
      render(<Button loading>Submit Form</Button>);
      expect(
        screen.getByRole("button", { name: "Submit Form" })
      ).toBeInTheDocument();
    });

    it("loading takes precedence — button is disabled", () => {
      render(
        <Button loading disabled={false}>
          Loading
        </Button>
      );
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("passes through aria-label", () => {
      render(<Button aria-label="Custom Label">X</Button>);
      expect(
        screen.getByRole("button", { name: "Custom Label" })
      ).toBeInTheDocument();
    });

    it("passes through data-* attributes", () => {
      render(<Button data-testid="my-btn">Test</Button>);
      expect(screen.getByTestId("my-btn")).toBeInTheDocument();
    });
  });

  // ── Token compliance ───────────────────────────────────────

  describe("token compliance", () => {
    it("does not contain hardcoded brand hex colors in className", () => {
      render(<Button>Test</Button>);
      const btn = screen.getByRole("button");
      // No direct hex in class
      expect(btn.className).not.toContain("#D4AF37");
      expect(btn.className).not.toContain("#4285F4");
      expect(btn.className).not.toContain("#0A0A0A");
      expect(btn.className).not.toContain("#FFFFFF");
    });

    it("uses CSS variables for background", () => {
      render(<Button>Test</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("var(--color-brand-primary)");
    });

    it("uses CSS variables for border-radius", () => {
      render(<Button>Test</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("var(--radius-md)");
    });

    it("uses CSS variables for spacing", () => {
      render(<Button>Test</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("var(--spacing-");
    });

    it("uses CSS variables for font", () => {
      render(<Button>Test</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("var(--font-size-");
      expect(btn.className).toContain("var(--font-weight-");
    });

    it("uses CSS variables for motion", () => {
      render(<Button>Test</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("var(--motion-duration-");
      expect(btn.className).toContain("var(--motion-easing-");
    });
  });

  // ── Accessibility contract ─────────────────────────────────

  describe("accessibility", () => {
    it("can be found by role with accessible name", () => {
      render(<Button>Save</Button>);
      expect(
        screen.getByRole("button", { name: "Save" })
      ).toBeInTheDocument();
    });

    it("disabled button has correct semantics", () => {
      render(<Button disabled>No</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute("aria-disabled", "true");
    });

    it("loading button has correct semantics", () => {
      render(<Button loading>Wait</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute("aria-busy", "true");
      expect(btn).toHaveAttribute("aria-disabled", "true");
    });

    it("onKeyDown is not overridden by rest props", () => {
      const handler = vi.fn();
      render(
        <Button onKeyDown={handler} data-custom="test">
          KeyTest
        </Button>
      );
      fireEvent.keyDown(screen.getByRole("button"), {
        key: "a",
        code: "KeyA",
      });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onKeyDown prevents default for disabled + Enter", () => {
      const handler = vi.fn();
      render(
        <Button disabled onKeyDown={handler}>
          Disabled
        </Button>
      );
      fireEvent.keyDown(screen.getByRole("button"), {
        key: "Enter",
        code: "Enter",
      });
      // onKeyDown from props should NOT be called when disabled
      expect(handler).not.toHaveBeenCalled();
    });

    it("focus-visible outline is configured", () => {
      render(<Button>Focus</Button>);
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("focus-visible:outline-");
      expect(btn.className).toContain("focus-visible:outline-offset-");
      expect(btn.className).toContain(
        "focus-visible:outline-[var(--color-border-focus)]"
      );
    });

    it("normal button is focusable", () => {
      render(<Button>Tab Me</Button>);
      const btn = screen.getByRole("button");
      btn.focus();
      expect(btn).toHaveFocus();
    });
  });
});
