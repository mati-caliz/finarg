'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  formatX?: (value: any) => string;
  formatY?: (value: any) => string;
  showGrid?: boolean;
  colorByValue?: boolean;
  positiveColor?: string;
  negativeColor?: string;
}

export function BarChart({
  data,
  xKey,
  yKey,
  color = '#10b981',
  height = 300,
  formatX,
  formatY,
  showGrid = true,
  colorByValue = false,
  positiveColor = '#10b981',
  negativeColor = '#ef4444',
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
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
          {colorByValue
            ? data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry[yKey] >= 0 ? positiveColor : negativeColor}
                />
              ))
            : data.map((_, index) => <Cell key={`cell-${index}`} fill={color} />)}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
