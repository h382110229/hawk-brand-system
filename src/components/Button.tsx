"use client";

import React, { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

/** Merge class names, filtering falsy values */
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-[var(--color-brand-primary)]",
    "text-[var(--color-background-primary)]",
    "border-transparent",
    "hover:bg-[var(--color-brand-primary-dark)]",
    "active:bg-[var(--color-brand-primary-dark)]"
  ),
  secondary: cn(
    "bg-[var(--color-background-tertiary)]",
    "text-[var(--color-text-primary)]",
    "border-[var(--color-border-default)]",
    "hover:bg-[var(--color-background-secondary)]",
    "active:bg-[var(--color-background-secondary)]"
  ),
  outline: cn(
    "bg-transparent",
    "text-[var(--color-brand-primary)]",
    "border-[var(--color-brand-primary)]",
    "hover:bg-[var(--color-brand-primary)]",
    "hover:text-[var(--color-background-primary)]",
    "active:bg-[var(--color-brand-primary-dark)]",
    "active:text-[var(--color-background-primary)]"
  ),
  ghost: cn(
    "bg-transparent",
    "text-[var(--color-text-primary)]",
    "border-transparent",
    "hover:bg-[var(--color-background-tertiary)]",
    "active:bg-[var(--color-background-tertiary)]"
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: cn(
    "px-[var(--spacing-3)]",
    "py-[var(--spacing-1)]",
    "text-[var(--font-size-sm)]",
    "min-h-[32px]"
  ),
  md: cn(
    "px-[var(--spacing-4)]",
    "py-[var(--spacing-2)]",
    "text-[var(--font-size-base)]",
    "min-h-[40px]"
  ),
  lg: cn(
    "px-[var(--spacing-6)]",
    "py-[var(--spacing-3)]",
    "text-[var(--font-size-lg)]",
    "min-h-[48px]"
  ),
};

/**
 * HAWK Button component.
 *
 * Renders a native `<button>` element with HAWK design-token styling.
 * Supports variants, sizes, loading state, and full accessibility.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled = false,
      type = "button",
      className,
      children,
      onClick,
      ...rest
    },
    ref
  ) {
    const isDisabled = disabled || loading;

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
      if (isDisabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        return;
      }
      rest.onKeyDown?.(e);
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center",
          "font-[var(--font-family-body)]",
          "font-[var(--font-weight-medium)]",
          "leading-[var(--line-height-normal)]",
          "border border-solid",
          "rounded-[var(--radius-md)]",
          "cursor-pointer",
          "select-none",
          "whitespace-nowrap",
          // Transition
          "transition-colors",
          "duration-[var(--motion-duration-fast)]",
          "ease-[var(--motion-easing-default)]",
          // Focus ring
          "focus-visible:outline-2",
          "focus-visible:outline-offset-2",
          "focus-visible:outline-[var(--color-border-focus)]",
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && "w-full",
          // Disabled
          isDisabled && "opacity-50 cursor-not-allowed",
          // Loading — keep pointer-events-none on the inner spinner only
          loading && "relative",
          className
        )}
        {...rest}
      >
        {loading && (
          <span
            className="mr-[var(--spacing-2)] inline-flex items-center"
            aria-hidden="true"
          >
            <svg
              className="animate-spin h-[1em] w-[1em]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </span>
        )}
        {children}
      </button>
    );
  }
);
