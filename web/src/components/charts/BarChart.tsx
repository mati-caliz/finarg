"use client";

import { CHART_STYLES } from "@/lib/constants";
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
        {referenceAreas.map((area, idx) => (
          <ReferenceArea
            key={`area-${idx}-${area.x1}-${area.x2}`}
            x1={area.x1}
            x2={area.x2}
            fill={area.fill}
            fillOpacity={0.15}
            strokeOpacity={0}
          />
        ))}
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.grid.stroke} />}
        <XAxis
          dataKey={xKey}
          stroke={CHART_STYLES.axis.stroke}
          fontSize={CHART_STYLES.axis.fontSize}
          tickFormatter={formatX}
          tick={{ fill: CHART_STYLES.axis.fill }}
        />
        <YAxis
          stroke={CHART_STYLES.axis.stroke}
          fontSize={CHART_STYLES.axis.fontSize}
          tickFormatter={formatY}
          tick={{ fill: CHART_STYLES.axis.fill }}
          width={80}
        />
        <Tooltip
          contentStyle={CHART_STYLES.tooltip.contentStyle}
          labelStyle={CHART_STYLES.tooltip.labelStyle}
          itemStyle={CHART_STYLES.tooltip.itemStyle}
          formatter={(value: number) => [formatY ? formatY(value) : value.toLocaleString("es-AR")]}
        />
        {referenceLines.map((line) => (
          <ReferenceLine
            key={line.label || String(line.x)}
            x={line.x}
            stroke={line.stroke || "#888"}
            strokeDasharray={line.strokeDasharray || "3 3"}
            label={{
              value: line.label,
              position: "top",
              fill: CHART_STYLES.axis.fill,
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
