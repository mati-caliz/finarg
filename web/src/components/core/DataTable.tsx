import type { CSSProperties, ReactNode } from "react";

export interface DataTableColumn {
  key: string;
  label: ReactNode;
  align?: "left" | "right" | "center";
  numeric?: boolean;
}

export interface DataTableRow {
  id: string;
  cells: ReactNode[];
}

interface DataTableProps {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  footer?: ReactNode;
  style?: CSSProperties;
}

export function DataTable({ columns, rows, footer, style }: DataTableProps) {
  return (
    <div style={{ overflowX: "auto", ...style }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: column.align || "left",
                  padding: "8px 12px",
                  borderBottom: "1px solid var(--border-2)",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: "0.6875rem",
                  textTransform: "uppercase",
                  letterSpacing: "var(--ls-caps)",
                  whiteSpace: "nowrap",
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} style={{ borderBottom: "1px solid var(--border-1)" }}>
              {row.cells.map((cell, cellIndex) => {
                const column = columns[cellIndex];
                return (
                  <td
                    key={column.key}
                    className={column.numeric ? "num" : undefined}
                    style={{
                      textAlign: column.align || "left",
                      padding: "9px 12px",
                      color: "var(--text-body)",
                      fontVariantNumeric: column.numeric ? "tabular-nums" : undefined,
                      fontFamily: column.numeric ? "var(--font-mono)" : undefined,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {footer && <div style={{ padding: "8px 12px" }}>{footer}</div>}
    </div>
  );
}
