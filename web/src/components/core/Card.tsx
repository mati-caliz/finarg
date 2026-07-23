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
        background: "var(--raise)",
        border: "1px solid var(--line)",
        borderRadius: 10,
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
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div>
            {title && (
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.0625rem",
                  letterSpacing: "-0.01em",
                  color: "var(--ink)",
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "0.9rem",
                  color: "var(--ink2)",
                  marginTop: 2,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          {actions && <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>{actions}</div>}
        </div>
      )}
      <div style={{ padding: pad ? 20 : 0, flex: 1 }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--line)",
            background: "var(--surface)",
            borderRadius: "0 0 10px 10px",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
