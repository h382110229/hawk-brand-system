import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/Input";

describe("Input", () => {
  // ── Rendering ──────────────────────────────────────────────

  describe("rendering", () => {
    it("renders as a native input element", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input.tagName).toBe("INPUT");
    });

    it("renders with type='text' by default", () => {
      render(<Input />);
      expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
    });

    it("renders with type='email'", () => {
      render(<Input type="email" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
    });

    it("renders placeholder", () => {
      render(<Input placeholder="Enter name" />);
      expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
    });

    it("renders with value", () => {
      render(<Input value="hello" onChange={() => {}} />);
      expect(screen.getByDisplayValue("hello")).toBeInTheDocument();
    });

    it("renders with defaultValue", () => {
      render(<Input defaultValue="world" />);
      expect(screen.getByDisplayValue("world")).toBeInTheDocument();
    });

    it("renders with name", () => {
      render(<Input name="email" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("name", "email");
    });

    it("renders with id", () => {
      render(<Input id="my-input" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("id", "my-input");
    });

    it("applies className to input element", () => {
      render(<Input className="custom-class" data-testid="inp" />);
      const input = screen.getByTestId("inp");
      expect(input.className).toContain("custom-class");
      // Should also contain base input styles
      expect(input.className).toContain("block w-full");
    });

    it("applies fullWidth to wrapper div", () => {
      render(<Input data-testid="inp" />);
      const wrapper = screen.getByTestId("inp").parentElement;
      expect(wrapper?.className).toContain("w-full");
    });

    it("forwards ref to the input element", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  // ── Label ──────────────────────────────────────────────────

  describe("label", () => {
    it("renders label text", () => {
      render(<Input label="Email Address" />);
      expect(screen.getByText("Email Address")).toBeInTheDocument();
    });

    it("label has htmlFor matching input id", () => {
      render(<Input label="Email" id="email-field" />);
      const label = screen.getByText("Email");
      expect(label).toHaveAttribute("for", "email-field");
    });

    it("label is associated with input", () => {
      render(<Input label="Username" />);
      const input = screen.getByRole("textbox");
      const label = screen.getByText("Username");
      expect(label.getAttribute("for")).toBe(input.getAttribute("id"));
    });

    it("works without label using aria-label", () => {
      render(<Input aria-label="Search query" />);
      expect(
        screen.getByRole("textbox", { name: "Search query" })
      ).toBeInTheDocument();
    });

    it("shows required indicator", () => {
      render(<Input label="Email" required />);
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
    });
  });

  // ── Description / Error ────────────────────────────────────

  describe("description and error", () => {
    it("renders description text", () => {
      render(<Input description="We'll never share your email" />);
      expect(
        screen.getByText("We'll never share your email")
      ).toBeInTheDocument();
    });

    it("input has aria-describedby with description", () => {
      render(<Input description="Help text" id="my" />);
      const input = screen.getByRole("textbox");
      const describedBy = input.getAttribute("aria-describedby");
      expect(describedBy).toContain("my-desc");
    });

    it("renders error text", () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("error has role='alert'", () => {
      render(<Input error="Invalid email" />);
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
    });

    it("sets aria-invalid when error is present", () => {
      render(<Input error="Bad input" />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true"
      );
    });

    it("input has aria-describedby with error id", () => {
      render(<Input error="Required" id="f" />);
      const input = screen.getByRole("textbox");
      const describedBy = input.getAttribute("aria-describedby");
      expect(describedBy).toContain("f-error");
    });

    it("description and error both referenced in aria-describedby", () => {
      render(<Input description="Help" error="Err" id="x" />);
      const input = screen.getByRole("textbox");
      const describedBy = input.getAttribute("aria-describedby") ?? "";
      expect(describedBy).toContain("x-desc");
      expect(describedBy).toContain("x-error");
    });

    it("error text is readable by assistive technology", () => {
      render(<Input error="Email is invalid" />);
      const alert = screen.getByRole("alert");
      expect(alert).toBeVisible();
      expect(alert.textContent).toBe("Email is invalid");
    });

    it("renders both description and error when both provided", () => {
      render(<Input description="Help" error="Err" />);
      expect(screen.getByText("Help")).toBeInTheDocument();
      expect(screen.getByText("Err")).toBeInTheDocument();
    });

    it("description and error both have DOM nodes with IDs", () => {
      render(<Input description="Help" error="Err" id="x" />);
      expect(document.getElementById("x-desc")).toBeInTheDocument();
      expect(document.getElementById("x-desc")?.textContent).toBe("Help");
      expect(document.getElementById("x-error")).toBeInTheDocument();
      expect(document.getElementById("x-error")?.textContent).toBe("Err");
    });
  });

  // ── States ─────────────────────────────────────────────────

  describe("states", () => {
    it("disabled input is not editable", () => {
      render(<Input disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("readOnly input cannot be modified", () => {
      render(<Input readOnly value="fixed" onChange={() => {}} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("readonly");
    });

    it("required input has required attribute", () => {
      render(<Input required />);
      expect(screen.getByRole("textbox")).toBeRequired();
    });

    it("disabled input has opacity class", () => {
      render(<Input disabled />);
      expect(screen.getByRole("textbox").className).toContain("opacity-50");
    });

    it("readOnly input has readonly bg class", () => {
      render(<Input readOnly />);
      expect(screen.getByRole("textbox").className).toContain(
        "bg-[var(--color-background-secondary)]"
      );
    });

    it("error input has error border class", () => {
      render(<Input error="Bad" />);
      expect(screen.getByRole("textbox").className).toContain(
        "border-[var(--color-semantic-error)]"
      );
    });

    it("error text uses text-error token", () => {
      render(<Input error="Bad" />);
      const errorEl = screen.getByRole("alert");
      expect(errorEl.className).toContain("text-[var(--color-text-error)]");
    });

    it("default input has default border class", () => {
      render(<Input />);
      expect(screen.getByRole("textbox").className).toContain(
        "border-[var(--color-border-default)]"
      );
    });
  });

  // ── Sizes ──────────────────────────────────────────────────

  describe("sizes", () => {
    it("defaults to md size", () => {
      render(<Input />);
      expect(screen.getByRole("textbox").className).toContain(
        "min-h-[44px]"
      );
    });

    it("renders sm size", () => {
      render(<Input size="sm" />);
      expect(screen.getByRole("textbox").className).toContain(
        "min-h-[44px]"
      );
    });

    it("renders lg size", () => {
      render(<Input size="lg" />);
      expect(screen.getByRole("textbox").className).toContain(
        "min-h-[48px]"
      );
    });
  });

  // ── Interaction ────────────────────────────────────────────

  describe("interaction", () => {
    it("fires onChange", () => {
      const handler = vi.fn();
      render(<Input onChange={handler} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "abc" },
      });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("fires onFocus", () => {
      const handler = vi.fn();
      render(<Input onFocus={handler} />);
      fireEvent.focus(screen.getByRole("textbox"));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("fires onBlur", () => {
      const handler = vi.fn();
      render(<Input onBlur={handler} />);
      fireEvent.blur(screen.getByRole("textbox"));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("passes through native attributes", () => {
      render(
        <Input
          autoComplete="email"
          maxLength={50}
          data-custom="test"
        />
      );
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("autocomplete", "email");
      expect(input).toHaveAttribute("maxlength", "50");
      expect(input).toHaveAttribute("data-custom", "test");
    });

    it("user aria attributes are not overridden incorrectly", () => {
      render(
        <Input aria-label="Custom label" aria-invalid={false} />
      );
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-label", "Custom label");
      // aria-invalid from caller when no error
      expect(input).not.toHaveAttribute("aria-invalid", "true");
    });

    it("error overrides caller aria-invalid", () => {
      render(<Input error="Bad" aria-invalid={false} />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true"
      );
    });
  });

  // ── Token compliance ───────────────────────────────────────

  describe("token compliance", () => {
    it("does not contain hardcoded brand hex", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      const cls = input.className;
      expect(cls).not.toContain("#D4AF37");
      expect(cls).not.toContain("#4285F4");
      expect(cls).not.toContain("#0A0A0A");
      expect(cls).not.toContain("#FFFFFF");
    });

    it("uses CSS variables for background", () => {
      render(<Input />);
      expect(screen.getByRole("textbox").className).toContain(
        "var(--color-background-primary)"
      );
    });

    it("uses CSS variables for border-radius", () => {
      render(<Input />);
      expect(screen.getByRole("textbox").className).toContain(
        "var(--radius-md)"
      );
    });

    it("uses CSS variables for font", () => {
      render(<Input />);
      expect(screen.getByRole("textbox").className).toContain(
        "var(--font-size-"
      );
    });

    it("uses CSS variables for motion", () => {
      render(<Input />);
      expect(screen.getByRole("textbox").className).toContain(
        "var(--motion-duration-"
      );
    });
  });

  // ── Accessibility ──────────────────────────────────────────

  describe("accessibility", () => {
    it("can be found by role 'textbox'", () => {
      render(<Input aria-label="Search" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("label is correctly associated", () => {
      render(<Input label="Name" />);
      const input = screen.getByRole("textbox");
      const label = screen.getByText("Name");
      expect(label.getAttribute("for")).toBe(input.id);
    });

    it("disabled state is semantically correct", () => {
      render(<Input disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("readOnly state is semantically correct", () => {
      render(<Input readOnly />);
      expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    });

    it("focus-visible ring is configured", () => {
      render(<Input />);
      const cls = screen.getByRole("textbox").className;
      expect(cls).toContain("focus-visible:ring-2");
      expect(cls).toContain("focus-visible:ring-[var(--color-border-focus)]");
    });
  });
});
