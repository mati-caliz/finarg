"use client";

import { Card } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useSenateBlocs } from "@/hooks/useLabrecha";
import { blocColor } from "@/lib/congress";

export function SenateComposition() {
  const { data, isLoading } = useSenateBlocs();

  if (isLoading) {
    return <Skeleton className="h-56 w-full rounded-[10px]" />;
  }

  const blocs = (data ?? []).filter((bloc) => bloc.bloc !== null && bloc.count > 0);
  if (blocs.length === 0) {
    return null;
  }

  const total = blocs.reduce((sum, bloc) => sum + bloc.count, 0);
  const majority = Math.floor(total / 2) + 1;
  const majorityLeft = (majority / total) * 100;

  return (
    <Card
      title="Composición del Senado"
      subtitle={`${total} bancas · mayoría en ${majority}`}
      footer={
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          Fuente: Senado de la Nación (datos abiertos)
        </span>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ position: "relative", paddingTop: 18 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `${majorityLeft}%`,
              transform: "translateX(-50%)",
              fontSize: "0.625rem",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
            }}
          >
            Mayoría {majority}
          </div>
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                height: 18,
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                gap: 1,
              }}
            >
              {blocs.map((bloc, index) => (
                <div
                  key={bloc.bloc}
                  style={{ width: `${(bloc.count / total) * 100}%`, background: blocColor(index) }}
                  title={`${bloc.bloc}: ${bloc.count}`}
                />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                top: -3,
                bottom: -3,
                left: `${majorityLeft}%`,
                width: 2,
                background: "var(--text-body)",
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gap: "6px 16px",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          }}
        >
          {blocs.map((bloc, index) => (
            <div
              key={bloc.bloc}
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8125rem" }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: blocColor(index),
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  color: "var(--text-secondary)",
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {bloc.bloc}
              </span>
              <span className="num" style={{ fontWeight: 600 }}>
                {bloc.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
