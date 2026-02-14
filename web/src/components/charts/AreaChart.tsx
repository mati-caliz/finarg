"use client";

import {
  Area,
  CartesianGrid,
  AreaChart as RechartsAreaChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AreaChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  formatX?: (value: string | number) => string;
  formatY?: (value: string | number) => string;
  showGrid?: boolean;
  gradientId?: string;
  yDomain?: [number, number];
  xAxisInterval?: number | "preserveStart" | "preserveEnd" | "preserveStartEnd";
  referenceAreas?: Array<{
    x1: string | number;
    x2: string | number;
    fill: string;
    label?: string;
  }>;
}

export function AreaChart({
  data,
  xKey,
  yKey,
  color = "#10b981",
  height = 300,
  formatX,
  formatY,
  showGrid = true,
  gradientId = "colorValue",
  yDomain,
  xAxisInterval = "preserveStartEnd",
  referenceAreas = [],
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {referenceAreas.map((area, idx) => (
          <ReferenceArea
            key={`area-${idx}-${area.x1}-${area.x2}`}
            x1={area.x1}
            x2={area.x2}
            fill={area.fill}
            fillOpacity={0.15}
            strokeOpacity={0}
            label={
              area.label
                ? {
                    value: area.label,
                    position: "top",
                    fill: "#888",
                    fontSize: 11,
                    fontWeight: 500,
                  }
                : undefined
            }
          />
        ))}
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333" />}
        <XAxis
          dataKey={xKey}
          stroke="#888"
          fontSize={12}
          tickFormatter={formatX}
          tick={{ fill: "#888" }}
          interval={xAxisInterval}
        />
        <YAxis
          domain={yDomain ?? ["auto", "auto"]}
          stroke="#888"
          fontSize={12}
          tickFormatter={formatY}
          tick={{ fill: "#888" }}
          width={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#fff" }}
          itemStyle={{ color: "#fff" }}
          formatter={(value: number) => [formatY ? formatY(value) : value.toLocaleString("es-AR")]}
        />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
