"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";
import { Spinner } from "./Spinner";
import "./ui.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "danger";
  size?: "md" | "sm";
  loading?: boolean;
  icon?: ReactNode;
}

// Shared button primitive: consistent hover/active/focus/disabled/loading
// states across every OS surface.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "default", size = "md", loading = false, icon, className, children, disabled, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={clsx(
          "ui-btn",
          variant === "primary" && "ui-btn--primary",
          variant === "danger" && "ui-btn--danger",
          size === "sm" && "ui-btn--sm",
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? <Spinner size={12} /> : icon}
        {children}
      </button>
    );
  },
);

// Square icon-only button. Always pass aria-label.
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "icon"> & { "aria-label": string }
>(function IconButton({ className, ...rest }, ref) {
  return <Button ref={ref} className={clsx("ui-btn--icon", className)} {...rest} />;
});
