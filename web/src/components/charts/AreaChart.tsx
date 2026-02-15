"use client";

import { CHART_STYLES } from "@/lib/constants";
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
                    fill: CHART_STYLES.axis.fill,
                    fontSize: 11,
                    fontWeight: 500,
                  }
                : undefined
            }
          />
        ))}
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.grid.stroke} />}
        <XAxis
          dataKey={xKey}
          stroke={CHART_STYLES.axis.stroke}
          fontSize={CHART_STYLES.axis.fontSize}
          tickFormatter={formatX}
          tick={{ fill: CHART_STYLES.axis.fill }}
          interval={xAxisInterval}
        />
        <YAxis
          domain={yDomain ?? ["auto", "auto"]}
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
