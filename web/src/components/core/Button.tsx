"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
}

const variants: Record<ButtonVariant, CSSProperties> = {
  primary: { background: "var(--ds-accent)", color: "#fff", border: "1px solid var(--ds-accent)" },
  secondary: {
    background: "var(--surface-card)",
    color: "var(--text-body)",
    border: "1px solid var(--border-2)",
  },
  ghost: { background: "transparent", color: "var(--text-link)", border: "1px solid transparent" },
  danger: { background: "var(--neg)", color: "#fff", border: "1px solid var(--neg)" },
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  icon,
  disabled,
  onClick,
  style,
}: ButtonProps) {
  const padding = size === "sm" ? "5px 10px" : size === "lg" ? "10px 20px" : "7px 14px";
  const fontSize = size === "sm" ? "0.8125rem" : "0.9375rem";
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding,
    fontSize,
    fontFamily: "var(--font-sans)",
    fontWeight: 600,
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 120ms ease-out,border-color 120ms ease-out",
    opacity: disabled ? 0.5 : 1,
    lineHeight: 1.2,
  };
  return (
    <button
      type="button"
      style={{ ...base, ...variants[variant], ...style }}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={(event) => {
        if (disabled) {
          return;
        }
        if (variant === "primary") {
          event.currentTarget.style.background = "var(--accent-strong)";
        }
        if (variant === "secondary") {
          event.currentTarget.style.background = "var(--surface-inset)";
        }
        if (variant === "ghost") {
          event.currentTarget.style.background = "var(--accent-soft)";
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = variants[variant].background as string;
      }}
    >
      {icon}
      {children}
    </button>
  );
}
