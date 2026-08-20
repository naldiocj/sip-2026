"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IconButtonProps extends Omit<ButtonProps, "size"> {
  icon: React.ReactNode;
  "aria-label": string;
  size?: "icon" | "icon-xs" | "icon-sm" | "icon-lg";
}

export function IconButton({
  icon,
  "aria-label": ariaLabel,
  size = "icon",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <Button
      size={size}
      className={cn("p-0", className)}
      aria-label={ariaLabel}
      data-icon="inline-end"
      {...props}
    >
      {icon}
      {children}
    </Button>
  );
}