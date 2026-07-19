import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  pad?: boolean;
  style?: CSSProperties;
}

export function Card({ title, subtitle, actions, footer, children, pad = true, style }: CardProps) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-1)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {(title || actions) && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 16px",
            borderBottom: "1px solid var(--border-1)",
          }}
        >
          <div>
            {title && (
              <div style={{ font: "var(--text-h3-def)", color: "var(--text-body)" }}>{title}</div>
            )}
            {subtitle && (
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
          {actions && <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>{actions}</div>}
        </div>
      )}
      <div style={{ padding: pad ? 16 : 0, flex: 1 }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--border-1)",
            background: "var(--surface-inset)",
            borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
