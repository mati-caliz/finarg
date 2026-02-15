"use client";

import type { ChartDataPoint } from "@/components/calculators/installments/types";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function InstallmentChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          className="text-xs"
          label={{ value: "Cuota N°", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          className="text-xs"
          label={{ value: "Valor ($)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="nominalValue"
          stroke="#94a3b8"
          name="Valor nominal"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="presentValue"
          stroke="#10b981"
          name="Valor presente"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
