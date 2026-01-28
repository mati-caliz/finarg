'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface LineChartProps {
  data: any[];
  xKey: string;
  yKey: string | string[];
  colors?: string[];
  height?: number;
  formatX?: (value: any) => string;
  formatY?: (value: any) => string;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function LineChart({
  data,
  xKey,
  yKey,
  colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
  height = 300,
  formatX,
  formatY,
  showGrid = true,
  showLegend = false,
}: LineChartProps) {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333" />}
        <XAxis
          dataKey={xKey}
          stroke="#888"
          fontSize={12}
          tickFormatter={formatX}
          tick={{ fill: '#888' }}
        />
        <YAxis
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
          formatter={(value: number) => [formatY ? formatY(value) : value.toLocaleString('es-AR')]}
        />
        {showLegend && <Legend />}
        {yKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
