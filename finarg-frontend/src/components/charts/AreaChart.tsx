'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
  xAxisInterval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
}

export function AreaChart({
  data,
  xKey,
  yKey,
  color = '#10b981',
  height = 300,
  formatX,
  formatY,
  showGrid = true,
  gradientId = 'colorValue',
  yDomain,
  xAxisInterval = 'preserveStartEnd',
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
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333" />}
        <XAxis
          dataKey={xKey}
          stroke="#888"
          fontSize={12}
          tickFormatter={formatX}
          tick={{ fill: '#888' }}
          interval={xAxisInterval}
        />
        <YAxis
          domain={yDomain ?? ['auto', 'auto']}
          stroke="#888"
          fontSize={12}
          tickFormatter={formatY}
          tick={{ fill: '#888' }}
          width={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value: number) => [formatY ? formatY(value) : value.toLocaleString('es-AR')]}
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
