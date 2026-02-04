"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  BarChart as RechartsBarChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ReferenceLineConfig {
  x?: string | number;
  label?: string;
  stroke?: string;
  strokeDasharray?: string;
}

interface BarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  formatX?: (value: string | number) => string;
  formatY?: (value: string | number) => string;
  showGrid?: boolean;
  colorByValue?: boolean;
  positiveColor?: string;
  negativeColor?: string;
  referenceLines?: ReferenceLineConfig[];
  referenceAreas?: Array<{
    x1: string | number;
    x2: string | number;
    fill: string;
    label?: string;
  }>;
  getBarColor?: (entry: Record<string, string | number>, index: number) => string;
}

export function BarChart({
  data,
  xKey,
  yKey,
  color = "#10b981",
  height = 300,
  formatX,
  formatY,
  showGrid = true,
  colorByValue = false,
  positiveColor = "#10b981",
  negativeColor = "#ef4444",
  referenceLines = [],
  referenceAreas = [],
  getBarColor,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333" />}
        <XAxis
          dataKey={xKey}
          stroke="#888"
          fontSize={12}
          tickFormatter={formatX}
          tick={{ fill: "#888" }}
        />
        <YAxis
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
        {referenceAreas.map((area) => (
          <ReferenceArea
            key={`${area.label}-${area.x1}-${area.x2}`}
            x1={area.x1}
            x2={area.x2}
            fill={area.fill}
            fillOpacity={0.2}
            strokeOpacity={0}
          />
        ))}
        {referenceLines.map((line) => (
          <ReferenceLine
            key={line.label || String(line.x)}
            x={line.x}
            stroke={line.stroke || "#888"}
            strokeDasharray={line.strokeDasharray || "3 3"}
            label={{
              value: line.label,
              position: "top",
              fill: "#888",
              fontSize: 10,
            }}
          />
        ))}
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
          {getBarColor
            ? data.map((entry, index) => (
                <Cell key={String(entry[xKey])} fill={getBarColor(entry, index)} />
              ))
            : colorByValue
              ? data.map((entry) => (
                  <Cell
                    key={String(entry[xKey])}
                    fill={Number(entry[yKey]) >= 0 ? positiveColor : negativeColor}
                  />
                ))
              : data.map((entry) => <Cell key={String(entry[xKey])} fill={color} />)}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
