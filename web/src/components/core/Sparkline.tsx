import type { CSSProperties } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
  style?: CSSProperties;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  color = "var(--serie-1)",
  fill = false,
  strokeWidth = 1.5,
  style,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return null;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((value, index) => [
    (index / (data.length - 1)) * width,
    height - 2 - ((value - min) / range) * (height - 4),
  ]);
  const line = points
    .map((point, index) => `${index ? "L" : "M"}${point[0].toFixed(1)},${point[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const last = points[points.length - 1];
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "visible", ...style }}
      aria-hidden="true"
    >
      {fill && <path d={area} fill={color} opacity="0.1" />}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2.2" fill={color} />
    </svg>
  );
}
