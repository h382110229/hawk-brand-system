"use client";

import React, { forwardRef, useId } from "react";

type InputSize = "sm" | "md" | "lg";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  description?: string;
  error?: string;
  size?: InputSize;
  fullWidth?: boolean;
}

/** Merge class names, filtering falsy values */
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const sizeStyles: Record<InputSize, { input: string; label: string }> = {
  sm: {
    input: cn(
      "px-[var(--spacing-3)]",
      "py-[var(--spacing-1)]",
      "text-[var(--font-size-sm)]",
      "min-h-[44px]"
    ),
    label: "text-[var(--font-size-sm)]",
  },
  md: {
    input: cn(
      "px-[var(--spacing-4)]",
      "py-[var(--spacing-2)]",
      "text-[var(--font-size-base)]",
      "min-h-[44px]"
    ),
    label: "text-[var(--font-size-base)]",
  },
  lg: {
    input: cn(
      "px-[var(--spacing-4)]",
      "py-[var(--spacing-3)]",
      "text-[var(--font-size-lg)]",
      "min-h-[48px]"
    ),
    label: "text-[var(--font-size-lg)]",
  },
};

/**
 * HAWK Input component.
 *
 * Renders a native `<input>` element with label, description, error,
 * and HAWK design-token styling.
 *
 * className applies to the input element, not the wrapper.
 * Wrapper styling is controlled by fullWidth.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      description,
      error,
      size = "md",
      fullWidth = true,
      disabled = false,
      readOnly = false,
      required = false,
      type = "text",
      id: callerId,
      className,
      "aria-describedby": callerDescribedBy,
      "aria-invalid": callerInvalid,
      ...rest
    },
    ref
  ) {
    const autoId = useId();
    const inputId = callerId ?? `input-${autoId}`;
    const descriptionId = `${inputId}-desc`;
    const errorId = `${inputId}-error`;

    // Build aria-describedby: caller + description (if present) + error (if present)
    const describedParts = [callerDescribedBy];
    if (description) describedParts.push(descriptionId);
    if (error) describedParts.push(errorId);
    const describedBy = describedParts.filter(Boolean).join(" ") || undefined;

    // aria-invalid: error takes precedence, then caller value
    const ariaInvalid = error ? true : callerInvalid;

    return (
      <div className={cn(fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block mb-[var(--spacing-1)]",
              "font-[var(--font-family-body)]",
              "font-[var(--font-weight-medium)]",
              sizeStyles[size].label,
              disabled
                ? "text-[var(--color-text-disabled)]"
                : "text-[var(--color-text-primary)]"
            )}
          >
            {label}
            {required && (
              <span
                className="ml-[var(--spacing-1)] text-[var(--color-semantic-error)]"
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>
        )}

        {/* Input — className applies here */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={ariaInvalid || undefined}
          className={cn(
            // Base
            "block w-full",
            "font-[var(--font-family-body)]",
            "leading-[var(--line-height-normal)]",
            "border border-solid",
            "rounded-[var(--radius-md)]",
            "outline-none",
            "transition-colors",
            "duration-[var(--motion-duration-fast)]",
            "ease-[var(--motion-easing-default)]",
            // Background
            "bg-[var(--color-background-primary)]",
            // Text
            "text-[var(--color-text-primary)]",
            // Placeholder
            "placeholder:text-[var(--color-text-disabled)]",
            // Border
            error
              ? "border-[var(--color-semantic-error)]"
              : "border-[var(--color-border-default)]",
            // Hover (non-error, non-disabled)
            !error &&
              !disabled &&
              "hover:border-[var(--color-border-focus)]",
            // Focus-visible
            "focus-visible:border-[var(--color-border-focus)]",
            "focus-visible:ring-2",
            "focus-visible:ring-[var(--color-border-focus)]",
            "focus-visible:ring-offset-1",
            "focus-visible:ring-offset-[var(--color-background-primary)]",
            // Error focus
            error &&
              "focus-visible:border-[var(--color-semantic-error)]",
            error &&
              "focus-visible:ring-[var(--color-semantic-error)]",
            // Disabled
            disabled &&
              "opacity-50 cursor-not-allowed bg-[var(--color-background-secondary)]",
            // ReadOnly
            readOnly &&
              "bg-[var(--color-background-secondary)] cursor-default",
            // Size
            sizeStyles[size].input,
            // Caller className applied to input
            className
          )}
          {...rest}
        />

        {/* Description — always rendered when provided (even with error) */}
        {description && (
          <p
            id={descriptionId}
            className={cn(
              "mt-[var(--spacing-1)]",
              "text-[var(--font-size-sm)]",
              "text-[var(--color-text-secondary)]"
            )}
          >
            {description}
          </p>
        )}

        {/* Error — rendered when error is present */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className={cn(
              "mt-[var(--spacing-1)]",
              "text-[var(--font-size-sm)]",
              "font-[var(--font-weight-medium)]",
              "text-[var(--color-text-error)]"
            )}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
