"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { projectedValue } from "@/lib/liveCounter";

interface LiveCounterProps {
  baseValue: number;
  since: number;
  ratePerSecond: number;
  format: (value: number) => string;
  unit?: string;
  style?: CSSProperties;
}

const REDUCED_MOTION_INTERVAL_MS = 1000;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function LiveCounter({
  baseValue,
  since,
  ratePerSecond,
  format,
  unit,
  style,
}: LiveCounterProps) {
  const [display, setDisplay] = useState(() => format(baseValue));
  const lastDisplay = useRef(display);

  useEffect(() => {
    let frameId = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const render = () => {
      const next = format(projectedValue(baseValue, ratePerSecond, since, Date.now()));
      if (next !== lastDisplay.current) {
        lastDisplay.current = next;
        setDisplay(next);
      }
    };

    if (prefersReducedMotion()) {
      render();
      intervalId = setInterval(render, REDUCED_MOTION_INTERVAL_MS);
    } else {
      const tick = () => {
        render();
        frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [baseValue, since, ratePerSecond, format]);

  return (
    <span
      className="num"
      style={{
        fontVariantNumeric: "tabular-nums",
        fontFamily: "var(--font-mono)",
        ...style,
      }}
    >
      {display}
      {unit && (
        <span style={{ fontSize: "0.5em", color: "var(--text-muted)", marginLeft: 6, fontWeight: 500 }}>
          {unit}
        </span>
      )}
    </span>
  );
}
