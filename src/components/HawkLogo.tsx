"use client";

import { useTheme } from "./ThemeProvider";
import Image from "next/image";

type LogoVariant = "full" | "mark" | "icon";

interface HawkLogoProps {
  variant?: LogoVariant;
  width?: number;
  height?: number;
  className?: string;
}

export function HawkLogo({
  variant = "mark",
  width = 48,
  height = 48,
  className,
}: HawkLogoProps) {
  const { resolved } = useTheme();
  const src = `/brand/hawk-${variant}-${resolved}.svg`;

  return (
    <Image
      src={src}
      alt={`HAWK ${variant} logo`}
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
