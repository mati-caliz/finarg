'use client';

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface LineChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string | string[];
  colors?: string[];
  height?: number;
  formatX?: (value: string | number) => string;
  formatY?: (value: string | number) => string;
  showGrid?: boolean;
  showLegend?: boolean;
  legendLabels?: Record<string, string>;
}

export function LineChart({
  data,
  xKey,
  yKey,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  height = 300,
  formatX,
  formatY,
  showGrid = false,
  showLegend = false,
  legendLabels,
}: LineChartProps) {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 20, left: 10, bottom: 8 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />}
        <defs>
          {yKeys.map((key, index) => {
            const color = colors[index % colors.length];
            const id = `gradient-${key}-${index}`;
            return (
              <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        <XAxis
          dataKey={xKey}
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickFormatter={formatX}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickFormatter={formatY}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          width={72}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number) => [formatY ? formatY(value) : value.toLocaleString('es-AR')]}
          content={({ active, payload, label }) => {
            if (!active || !payload || payload.length === 0) {return null;}
            const seen = new Set<string>();
            const uniquePayload = payload.filter((p) => {
              const key = p.dataKey as string;
              if (seen.has(key)) {return false;}
              seen.add(key);
              return true;
            });
            const displayLabel = formatX && label !== null ? formatX(label) : String(label);
            return (
              <div
                className="rounded-lg border px-3 py-2 shadow-lg"
                style={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                }}
              >
                <p className="mb-2 font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                  {displayLabel}
                </p>
                {uniquePayload.map((entry) => {
                  const key = entry.dataKey as string;
                  const label = legendLabels?.[key] ?? entry.name ?? key;
                  return (
                  <div key={String(key)} className="flex justify-between gap-4 text-sm">
                    <span style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {label}:
                    </span>
                    <span className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                      {formatY ? formatY(Number(entry.value)) : String(entry.value)}
                    </span>
                  </div>
                );
                })}
              </div>
            );
          }}
        />
        {showLegend && (
          <Legend
            formatter={(value) => legendLabels?.[value] ?? value}
          />
        )}
        {yKeys.map((key, index) => {
          const gradientId = `gradient-${key}-${index}`;
          return (
            <Area
              key={`area-${key}`}
              type="monotone"
              dataKey={key}
              stroke="none"
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              legendType="none"
            />
          );
        })}
        {yKeys.map((key, index) => {
          const displayName = legendLabels?.[key] ?? key;
          const lineColor = colors[index % colors.length];
          return (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={displayName}
              stroke={lineColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 6,
                fill: lineColor,
                stroke: 'hsl(var(--card))',
                strokeWidth: 2,
              }}
            />
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
