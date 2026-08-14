"use client";

import React, { forwardRef } from "react";

type CardVariant = "elevated" | "outlined";
type CardPadding = "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual variant. "elevated" uses shadow, "outlined" uses border only. */
  variant?: CardVariant;
  /** Internal padding preset. */
  padding?: CardPadding;
  /** Card header content. Rendered above children with separator. */
  header?: React.ReactNode;
  /** Card footer content. Rendered below children with separator. */
  footer?: React.ReactNode;
}

/** Merge class names, filtering falsy values */
function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const variantStyles: Record<CardVariant, string> = {
  elevated: cn(
    "border border-[var(--color-border-default)]",
    "shadow-[var(--elevation-low)]"
  ),
  outlined: cn(
    "border border-[var(--color-border-default)]",
    "shadow-none"
  ),
};

const paddingStyles: Record<CardPadding, string> = {
  md: "p-[var(--spacing-4)]",
  lg: "p-[var(--spacing-6)]",
};

const sectionPaddingStyles: Record<CardPadding, string> = {
  md: "px-[var(--spacing-4)]",
  lg: "px-[var(--spacing-6)]",
};

/**
 * HAWK Card component.
 *
 * Renders a semantic `<article>` container with optional header, content,
 * and footer sections. Built entirely on HAWK design tokens.
 *
 * - `variant` controls visual depth (shadow vs border)
 * - `padding` controls internal spacing
 * - `header` and `footer` are optional composition slots
 * - `className` applies to the outer `<article>` element
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    variant = "elevated",
    padding = "lg",
    header,
    footer,
    className,
    children,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  return (
    <article
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        // Base
        "rounded-[var(--radius-lg)]",
        "bg-[var(--color-background-secondary)]",
        "overflow-hidden",
        // Variant
        variantStyles[variant],
        // Custom className
        className
      )}
      {...rest}
    >
      {/* Header */}
      {header && (
        <header
          className={cn(
            sectionPaddingStyles[padding],
            "pt-[var(--spacing-6)]",
            "pb-[var(--spacing-4)]",
            "border-b border-[var(--color-border-default)]"
          )}
        >
          {header}
        </header>
      )}

      {/* Content */}
      <div
        className={cn(
          paddingStyles[padding],
          // When header present, remove top padding (header has its own)
          header ? "pt-0" : undefined,
          // When footer present, remove bottom padding (footer has its own)
          footer ? "pb-0" : undefined
        )}
      >
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <footer
          className={cn(
            sectionPaddingStyles[padding],
            "pt-[var(--spacing-4)]",
            "pb-[var(--spacing-6)]",
            "border-t border-[var(--color-border-default)]"
          )}
        >
          {footer}
        </footer>
      )}
    </article>
  );
});
