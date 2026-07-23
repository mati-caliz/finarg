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
  primary: { background: "var(--ink)", color: "var(--paper)", border: "1px solid var(--ink)" },
  secondary: {
    background: "var(--surface)",
    color: "var(--ink)",
    border: "1px solid var(--line)",
  },
  ghost: { background: "transparent", color: "var(--ink2)", border: "1px solid transparent" },
  danger: { background: "var(--neg)", color: "#fff", border: "1px solid var(--neg)" },
};

const hoverBackground: Record<ButtonVariant, string> = {
  primary: "var(--ink2)",
  secondary: "var(--line2)",
  ghost: "var(--surface)",
  danger: "var(--neg)",
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
  const padding = size === "sm" ? "6px 12px" : size === "lg" ? "11px 22px" : "8px 16px";
  const fontSize = size === "sm" ? "0.72rem" : "0.8125rem";
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding,
    fontSize,
    fontFamily: "var(--font-jb-mono)",
    fontWeight: 600,
    borderRadius: "var(--radius-pill)",
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
        event.currentTarget.style.background = hoverBackground[variant];
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
