import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/Card";

describe("Card", () => {
  // ── Rendering ──────────────────────────────────────────────

  describe("rendering", () => {
    it("renders as an article element", () => {
      render(<Card>Content</Card>);
      const card = screen.getByRole("article");
      expect(card.tagName).toBe("ARTICLE");
    });

    it("renders children content", () => {
      render(<Card>Hello World</Card>);
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("applies className to the article element", () => {
      render(<Card className="custom-class" data-testid="card" />);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("custom-class");
      // Should also contain base styles
      expect(card.className).toContain("rounded-[var(--radius-lg)]");
    });

    it("forwards ref to the article element", () => {
      const ref = React.createRef<HTMLElement>();
      render(<Card ref={ref}>Ref Test</Card>);
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe("ARTICLE");
      expect(ref.current?.textContent).toBe("Ref Test");
    });

    it("passes through data-* attributes", () => {
      render(<Card data-testid="my-card" data-custom="test" />);
      const card = screen.getByTestId("my-card");
      expect(card).toHaveAttribute("data-custom", "test");
    });

    it("passes through id attribute", () => {
      render(<Card id="section-card" data-testid="card" />);
      expect(screen.getByTestId("card")).toHaveAttribute("id", "section-card");
    });
  });

  // ── Variants ───────────────────────────────────────────────

  describe("variants", () => {
    it("defaults to elevated variant", () => {
      render(<Card data-testid="card" />);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("shadow-[var(--elevation-low)]");
      expect(card.className).toContain("border-[var(--color-border-default)]");
    });

    it("renders elevated variant explicitly", () => {
      render(<Card variant="elevated" data-testid="card" />);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("shadow-[var(--elevation-low)]");
    });

    it("renders outlined variant with no shadow", () => {
      render(<Card variant="outlined" data-testid="card" />);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("shadow-none");
      expect(card.className).toContain("border-[var(--color-border-default)]");
    });
  });

  // ── Padding ────────────────────────────────────────────────

  describe("padding", () => {
    it("defaults to lg padding", () => {
      render(<Card data-testid="card" />);
      const contentDiv = screen.getByTestId("card").querySelector("div");
      expect(contentDiv?.className).toContain("p-[var(--spacing-6)]");
    });

    it("renders md padding", () => {
      render(<Card padding="md" data-testid="card" />);
      const contentDiv = screen.getByTestId("card").querySelector("div");
      expect(contentDiv?.className).toContain("p-[var(--spacing-4)]");
    });

    it("renders lg padding explicitly", () => {
      render(<Card padding="lg" data-testid="card" />);
      const contentDiv = screen.getByTestId("card").querySelector("div");
      expect(contentDiv?.className).toContain("p-[var(--spacing-6)]");
    });
  });

  // ── Composition (header / footer) ──────────────────────────

  describe("composition", () => {
    it("renders header content in a header element", () => {
      render(<Card header={<h3>Card Title</h3>}>Body</Card>);
      const header = screen.getByRole("banner"); // <header> has banner role
      expect(header).toBeInTheDocument();
      expect(header.textContent).toBe("Card Title");
    });

    it("renders footer content in a footer element", () => {
      render(<Card footer={<span>Footer</span>}>Body</Card>);
      const footer = screen.getByRole("contentinfo"); // <footer> has contentinfo role
      expect(footer).toBeInTheDocument();
      expect(footer.textContent).toBe("Footer");
    });

    it("renders header, content, and footer together", () => {
      render(
        <Card
          header={<h3>Title</h3>}
          footer={<span>Action</span>}
        >
          Body content
        </Card>
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Body content")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });

    it("does not render header element when header prop is omitted", () => {
      render(<Card>No Header</Card>);
      expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    });

    it("does not render footer element when footer prop is omitted", () => {
      render(<Card>No Footer</Card>);
      expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    });

    it("header has border-bottom separator", () => {
      render(<Card header={<h3>Title</h3>}>Body</Card>);
      const header = screen.getByRole("banner");
      expect(header.className).toContain("border-b");
      expect(header.className).toContain("border-[var(--color-border-default)]");
    });

    it("footer has border-top separator", () => {
      render(<Card footer={<span>Footer</span>}>Body</Card>);
      const footer = screen.getByRole("contentinfo");
      expect(footer.className).toContain("border-t");
      expect(footer.className).toContain("border-[var(--color-border-default)]");
    });

    it("content section removes top padding when header is present", () => {
      render(<Card header={<h3>Title</h3>} data-testid="card">Body</Card>);
      const card = screen.getByTestId("card");
      // The content div is the second child (after header)
      const contentDiv = card.querySelectorAll("div")[0];
      expect(contentDiv.className).toContain("pt-0");
    });

    it("content section removes bottom padding when footer is present", () => {
      render(<Card footer={<span>Footer</span>} data-testid="card">Body</Card>);
      const card = screen.getByTestId("card");
      // The content div is the first child (before footer)
      const contentDiv = card.querySelectorAll("div")[0];
      expect(contentDiv.className).toContain("pb-0");
    });

    it("header respects padding prop", () => {
      render(<Card padding="md" header={<h3>Title</h3>}>Body</Card>);
      const header = screen.getByRole("banner");
      expect(header.className).toContain("px-[var(--spacing-4)]");
    });

    it("footer respects padding prop", () => {
      render(<Card padding="md" footer={<span>End</span>}>Body</Card>);
      const footer = screen.getByRole("contentinfo");
      expect(footer.className).toContain("px-[var(--spacing-4)]");
    });
  });

  // ── Accessibility ──────────────────────────────────────────

  describe("accessibility", () => {
    it("renders as semantic article element", () => {
      render(<Card data-testid="card" />);
      expect(screen.getByTestId("card").tagName).toBe("ARTICLE");
    });

    it("supports aria-label", () => {
      render(<Card aria-label="Featured project" data-testid="card" />);
      expect(screen.getByTestId("card")).toHaveAttribute(
        "aria-label",
        "Featured project"
      );
    });

    it("can be found by role 'article'", () => {
      render(<Card>Accessible Card</Card>);
      expect(screen.getByRole("article")).toBeInTheDocument();
    });

    it("aria-label passes through to article element", () => {
      render(<Card aria-label="Profile card">Content</Card>);
      const card = screen.getByRole("article");
      expect(card).toHaveAttribute("aria-label", "Profile card");
    });
  });

  // ── Token compliance ───────────────────────────────────────

  describe("token compliance", () => {
    it("does not contain hardcoded brand hex colors in className", () => {
      render(<Card data-testid="card" />);
      const card = screen.getByTestId("card");
      expect(card.className).not.toContain("#D4AF37");
      expect(card.className).not.toContain("#4285F4");
      expect(card.className).not.toContain("#0A0A0A");
      expect(card.className).not.toContain("#FFFFFF");
    });

    it("uses CSS variables for background", () => {
      render(<Card data-testid="card" />);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("var(--color-background-secondary)");
    });

    it("uses CSS variables for border-radius", () => {
      render(<Card data-testid="card" />);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("var(--radius-lg)");
    });

    it("uses CSS variables for border color", () => {
      render(<Card data-testid="card" />);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("var(--color-border-default)");
    });

    it("uses CSS variables for elevation", () => {
      render(<Card data-testid="card" />);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("var(--elevation-low)");
    });

    it("uses CSS variables for spacing in content", () => {
      render(<Card data-testid="card" />);
      const contentDiv = screen.getByTestId("card").querySelector("div");
      expect(contentDiv?.className).toContain("var(--spacing-");
    });
  });
});
