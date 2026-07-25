"use client";

import type { PostCategory } from "@/lib/labrechaApi";
import type { CSSProperties, ReactNode } from "react";
import { useId } from "react";

const W = 640;
const H = 360;

const INK = "var(--ink)";
const INK2 = "var(--ink2)";
const INK3 = "var(--ink3)";
const LINE = "var(--line)";
const ACC = "var(--gap)";
const SURFACE = "var(--line2)";
const SURFACE_2 = "var(--line)";

function Car({
  x,
  y,
  w = 66,
  h = 30,
  fill = "none",
  stroke = INK,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  fill?: string;
  stroke?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={w} height={h} rx={7} fill={fill} stroke={stroke} strokeWidth={2.2} />
      <rect
        x={w * 0.14}
        y={h * 0.22}
        width={w * 0.28}
        height={h * 0.56}
        rx={3}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
      />
      <rect
        x={w * 0.56}
        y={h * 0.22}
        width={w * 0.3}
        height={h * 0.56}
        rx={3}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
      />
    </g>
  );
}

function Bolt({
  x,
  y,
  scale = 1,
  fill = ACC,
}: { x: number; y: number; scale?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${scale})`}
      d="M22 0 L2 30 L16 30 L8 58 L32 24 L18 24 Z"
      fill={fill}
    />
  );
}

function TrafficMotif() {
  return (
    <g>
      <rect x={0} y={150} width={W} height={86} fill={SURFACE_2} />
      <rect x={276} y={0} width={110} height={H} fill={SURFACE_2} />
      <path d="M0 193 H250 M412 193 H640" stroke={INK3} strokeWidth={2.5} strokeDasharray="18 14" />
      <path d="M331 0 V128 M331 258 V360" stroke={INK3} strokeWidth={2.5} strokeDasharray="18 14" />
      <Car x={92} y={158} />
      <Car x={462} y={196} />
      <g transform="translate(296 62) rotate(90 35 15)">
        <Car x={0} y={0} stroke={INK2} />
      </g>
      <g>
        <rect
          x={40}
          y={54}
          width={54}
          height={126}
          rx={12}
          fill={SURFACE}
          stroke={INK}
          strokeWidth={2.4}
        />
        <circle cx={67} cy={86} r={13} fill={ACC} />
        <circle cx={67} cy={117} r={13} fill="none" stroke={INK3} strokeWidth={2} />
        <circle cx={67} cy={148} r={13} fill="none" stroke={INK3} strokeWidth={2} />
        <path d="M67 180 V300" stroke={INK} strokeWidth={2.4} />
      </g>
    </g>
  );
}

function TollMotif() {
  return (
    <g>
      <rect x={0} y={214} width={W} height={100} fill={SURFACE_2} />
      <path d="M0 264 H640" stroke={INK3} strokeWidth={2.5} strokeDasharray="20 16" />
      <rect
        x={148}
        y={92}
        width={20}
        height={160}
        rx={4}
        fill="none"
        stroke={INK}
        strokeWidth={2.4}
      />
      <rect
        x={472}
        y={92}
        width={20}
        height={160}
        rx={4}
        fill="none"
        stroke={INK}
        strokeWidth={2.4}
      />
      <rect
        x={140}
        y={70}
        width={360}
        height={26}
        rx={6}
        fill={SURFACE}
        stroke={INK}
        strokeWidth={2.4}
      />
      <rect x={222} y={44} width={44} height={26} rx={5} fill={ACC} />
      <rect x={374} y={44} width={44} height={26} rx={5} fill={ACC} />
      <g stroke={ACC} strokeWidth={2.2} fill="none" strokeLinecap="round">
        <path d="M244 104 a30 30 0 0 0 0 26" />
        <path d="M244 104 a48 48 0 0 0 0 44" transform="translate(0 -9)" />
        <path d="M396 104 a30 30 0 0 1 0 26" />
        <path d="M396 104 a48 48 0 0 1 0 44" transform="translate(0 -9)" />
      </g>
      <Car x={274} y={182} w={92} h={40} fill={SURFACE} />
      <path d="M96 300 H540" stroke={ACC} strokeWidth={3} strokeLinecap="round" />
      <path d="M524 288 L548 300 L524 312 Z" fill={ACC} />
    </g>
  );
}

function LicensePlateMotif() {
  return (
    <g>
      <rect
        x={110}
        y={96}
        width={420}
        height={168}
        rx={16}
        fill={SURFACE}
        stroke={INK}
        strokeWidth={3}
      />
      <rect
        x={126}
        y={112}
        width={388}
        height={136}
        rx={9}
        fill="none"
        stroke={LINE}
        strokeWidth={2}
      />
      <rect x={126} y={112} width={54} height={136} rx={9} fill={ACC} opacity={0.9} />
      <circle cx={153} cy={148} r={9} fill={SURFACE} />
      <circle cx={132} cy={128} r={5} fill={LINE} />
      <circle cx={508} cy={128} r={5} fill={LINE} />
      <text
        x={352}
        y={200}
        textAnchor="middle"
        fill={INK}
        fontFamily="var(--font-jb-mono), ui-monospace, monospace"
        fontSize={62}
        fontWeight={700}
        letterSpacing="6"
      >
        AB 123 CD
      </text>
      <path d="M110 296 H530" stroke={LINE} strokeWidth={2} />
    </g>
  );
}

function ParkingMotif() {
  return (
    <g>
      <g stroke={INK3} strokeWidth={2.4}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${88 + i * 82} 236 V320`} />
        ))}
      </g>
      <path d="M88 236 H498" stroke={INK3} strokeWidth={2.4} />
      <Car x={182} y={252} w={62} h={54} fill={SURFACE_2} />
      <Car x={346} y={252} w={62} h={54} fill={SURFACE_2} />
      <path
        d="M104 190 C104 96 244 62 336 96 C424 128 388 190 306 178 C232 168 218 118 292 108"
        fill="none"
        stroke={ACC}
        strokeWidth={3}
        strokeDasharray="12 10"
        strokeLinecap="round"
      />
      <path d="M282 96 L300 108 L280 120 Z" fill={ACC} />
      <text
        x={470}
        y={140}
        textAnchor="middle"
        fill={INK}
        fontFamily="var(--font-jb-mono), ui-monospace, monospace"
        fontSize={72}
        fontWeight={700}
      >
        $
      </text>
      <circle cx={470} cy={116} r={46} fill="none" stroke={LINE} strokeWidth={2.4} />
    </g>
  );
}

function StateSoftwareMotif() {
  const bars = [220, 148, 262, 176, 118, 236];
  return (
    <g>
      <rect
        x={92}
        y={72}
        width={456}
        height={216}
        rx={12}
        fill={SURFACE}
        stroke={INK}
        strokeWidth={2.6}
      />
      <path d="M92 110 H548" stroke={INK} strokeWidth={2.2} />
      <circle cx={116} cy={91} r={6} fill={ACC} />
      <circle cx={136} cy={91} r={6} fill={LINE} />
      <circle cx={156} cy={91} r={6} fill={LINE} />
      <g>
        {bars.map((w, i) => (
          <rect
            key={`bar-${w}`}
            x={i % 2 === 0 ? 124 : 144}
            y={136 + i * 25}
            width={w}
            height={9}
            rx={4.5}
            fill={i === 2 ? ACC : LINE}
          />
        ))}
      </g>
      <path
        d="M446 148 l40 26 l-40 26"
        fill="none"
        stroke={INK2}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M420 236 h96" stroke={INK2} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

function CarPaperworkMotif() {
  return (
    <g>
      <rect
        x={128}
        y={54}
        width={300}
        height={258}
        rx={10}
        fill={SURFACE}
        stroke={INK}
        strokeWidth={2.6}
      />
      <g fill={LINE}>
        <rect x={158} y={90} width={150} height={11} rx={5.5} />
        <rect x={158} y={252} width={196} height={9} rx={4.5} />
        <rect x={158} y={274} width={140} height={9} rx={4.5} />
      </g>
      <Car x={166} y={140} w={168} h={72} stroke={INK2} />
      <g transform="translate(392 168) rotate(-14)">
        <circle cx={0} cy={0} r={62} fill="none" stroke={ACC} strokeWidth={4} />
        <circle cx={0} cy={0} r={50} fill="none" stroke={ACC} strokeWidth={2} />
        <path
          d="M-24 2 l16 18 l32 -38"
          fill="none"
          stroke={ACC}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

function InvoicingMotif() {
  const qrCells: [number, number][] = [
    [0, 0],
    [1, 0],
    [2, 0],
    [4, 0],
    [0, 1],
    [2, 1],
    [5, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [2, 3],
    [4, 3],
    [5, 3],
    [0, 4],
    [1, 4],
    [3, 4],
    [5, 4],
    [1, 5],
    [2, 5],
    [4, 5],
    [5, 5],
  ];
  return (
    <g>
      <path
        d="M136 48 H392 V300 l-21 -16 l-21 16 l-21 -16 l-21 16 l-21 -16 l-21 16 l-21 -16 l-21 16 l-21 -16 l-21 16 Z"
        fill={SURFACE}
        stroke={INK}
        strokeWidth={2.6}
        strokeLinejoin="round"
      />
      <g fill={LINE}>
        <rect x={164} y={86} width={128} height={12} rx={6} />
        <rect x={164} y={132} width={200} height={9} rx={4.5} />
        <rect x={164} y={156} width={172} height={9} rx={4.5} />
        <rect x={164} y={180} width={188} height={9} rx={4.5} />
      </g>
      <rect x={164} y={218} width={110} height={13} rx={6.5} fill={ACC} />
      <g transform="translate(422 118)">
        <rect
          x={-14}
          y={-14}
          width={140}
          height={140}
          rx={10}
          fill={SURFACE}
          stroke={INK}
          strokeWidth={2.4}
        />
        {qrCells.map(([c, r]) => (
          <rect
            key={`qr-${c}-${r}`}
            x={c * 19}
            y={r * 19}
            width={15}
            height={15}
            rx={2}
            fill={r + c === 0 ? ACC : INK2}
          />
        ))}
      </g>
    </g>
  );
}

function MobilityMotif() {
  const lanes = [
    { label: "peatón", width: 420 },
    { label: "bici", width: 330 },
    { label: "bus", width: 244 },
    { label: "auto", width: 150 },
  ];
  return (
    <g>
      {lanes.map((lane, i) => {
        const y = 74 + i * 62;
        return (
          <g key={lane.label}>
            <rect
              x={150}
              y={y}
              width={lane.width}
              height={34}
              rx={17}
              fill={i === 0 ? ACC : LINE}
            />
            <text
              x={134}
              y={y + 24}
              textAnchor="end"
              fill={INK2}
              fontFamily="var(--font-jb-mono), ui-monospace, monospace"
              fontSize={17}
              letterSpacing="1"
            >
              {lane.label}
            </text>
            <path d={`M150 ${y + 48} H570`} stroke={LINE} strokeWidth={1.5} />
          </g>
        );
      })}
      <path d="M150 56 V318" stroke={INK} strokeWidth={2.4} />
    </g>
  );
}

function ElectricMotif() {
  return (
    <g>
      <Car x={72} y={148} w={196} h={92} fill={SURFACE} />
      <path d="M104 240 v22 M236 240 v22" stroke={INK} strokeWidth={2.2} />
      <circle cx={104} cy={272} r={16} fill="none" stroke={INK} strokeWidth={2.4} />
      <circle cx={236} cy={272} r={16} fill="none" stroke={INK} strokeWidth={2.4} />
      <g stroke={INK} strokeWidth={2.6} fill="none">
        <circle cx={432} cy={252} r={40} />
        <circle cx={548} cy={252} r={40} />
        <path
          d="M432 252 L474 178 L520 252 M474 178 L512 178 M548 252 L512 186"
          strokeLinejoin="round"
        />
        <path d="M456 172 h36" strokeLinecap="round" />
      </g>
      <Bolt x={310} y={128} scale={1.7} />
    </g>
  );
}

function ChargingMotif() {
  return (
    <g>
      <rect
        x={96}
        y={48}
        width={224}
        height={266}
        rx={8}
        fill={SURFACE}
        stroke={INK}
        strokeWidth={2.6}
      />
      <g fill={LINE}>
        {[0, 1, 2, 3, 4].map((r) =>
          [0, 1, 2].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={124 + c * 68}
              y={78 + r * 48}
              width={44}
              height={32}
              rx={4}
            />
          )),
        )}
      </g>
      <rect
        x={192}
        y={266}
        width={44}
        height={48}
        rx={3}
        fill={SURFACE_2}
        stroke={INK2}
        strokeWidth={2}
      />
      <path
        d="M320 132 C400 132 400 210 452 210"
        fill="none"
        stroke={ACC}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <g transform="translate(452 168)">
        <rect
          x={0}
          y={0}
          width={92}
          height={84}
          rx={12}
          fill={SURFACE}
          stroke={INK}
          strokeWidth={2.6}
        />
        <circle cx={30} cy={34} r={8} fill={INK2} />
        <circle cx={62} cy={34} r={8} fill={INK2} />
        <rect x={26} y={54} width={40} height={9} rx={4.5} fill={INK2} />
        <path d="M46 84 v42" stroke={INK} strokeWidth={2.6} />
        <path d="M18 126 h56" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      </g>
      <Bolt x={370} y={244} scale={1} />
    </g>
  );
}

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 100000;
  }
  return hash;
}

function IdeaFallback({ seed }: { seed: number }) {
  return (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <circle
          key={i}
          cx={320}
          cy={190}
          r={44 + i * 38}
          fill="none"
          stroke={i === 0 ? ACC : LINE}
          strokeWidth={i === 0 ? 3 : 2}
          strokeDasharray={i % 2 === 0 ? undefined : "10 12"}
        />
      ))}
      <circle cx={320} cy={190} r={13} fill={ACC} />
      <path
        d={`M320 190 L${320 + 150 * Math.cos(seed)} ${190 + 130 * Math.sin(seed)}`}
        stroke={INK2}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </g>
  );
}

function LeyFallback() {
  return (
    <g stroke={INK} strokeWidth={2.6} fill="none">
      <path d="M124 118 L320 62 L516 118" strokeLinejoin="round" />
      <path d="M124 138 H516" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={162 + i * 92} y={152 + 0} width={40} height={110} rx={4} />
      ))}
      <path d="M124 276 H516" />
      <rect x={296} y={152} width={48} height={110} rx={4} stroke={ACC} />
    </g>
  );
}

function AnalisisFallback({ seed }: { seed: number }) {
  const bars = ["b1", "b2", "b3", "b4", "b5", "b6"].map((id, i) => ({
    id,
    height: 70 + ((seed >> (i * 2)) % 7) * 26,
  }));
  const tallest = Math.max(...bars.map((bar) => bar.height));
  return (
    <g>
      <path d="M120 296 H540 M120 296 V72" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      {bars.map((bar, i) => (
        <rect
          key={bar.id}
          x={150 + i * 64}
          y={296 - bar.height}
          width={40}
          height={bar.height}
          rx={4}
          fill={bar.height === tallest ? ACC : LINE}
        />
      ))}
    </g>
  );
}

function NotaFallback() {
  return (
    <g>
      <rect
        x={148}
        y={68}
        width={344}
        height={230}
        rx={10}
        fill={SURFACE}
        stroke={INK}
        strokeWidth={2.6}
      />
      <rect x={180} y={104} width={160} height={14} rx={7} fill={ACC} />
      <g fill={LINE}>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={180} y={148 + i * 28} width={i === 4 ? 180 : 280} height={10} rx={5} />
        ))}
      </g>
    </g>
  );
}

const SLUG_MOTIFS: Record<string, () => ReactNode> = {
  "como-se-arregla-el-transito-en-argentina": TrafficMotif,
  "peajes-sin-frenar-free-flow": TollMotif,
  "patentes-que-sistema-conviene": LicensePlateMotif,
  "estacionamiento-gratis-no-es-gratis": ParkingMotif,
  "organismo-software-del-estado": StateSoftwareMotif,
  "el-auto-como-tramite": CarPaperworkMotif,
  "facturacion-electronica-el-mejor-sistema-posible": InvoicingMotif,
  "como-organizar-la-movilidad-de-una-ciudad": MobilityMotif,
  "autos-y-bicis-electricas-vale-la-pena-incentivar": ElectricMotif,
  "derecho-a-enchufar-cargadores-en-edificios": ChargingMotif,
};

function motifFor(slug: string, category: PostCategory, seed: number): ReactNode {
  const Motif = SLUG_MOTIFS[slug];
  if (Motif) {
    return <Motif />;
  }
  if (category === "ley") {
    return <LeyFallback />;
  }
  if (category === "analisis") {
    return <AnalisisFallback seed={seed} />;
  }
  if (category === "nota") {
    return <NotaFallback />;
  }
  return <IdeaFallback seed={seed} />;
}

export function PostCover({
  slug,
  category,
  ratio = "16 / 9",
  style,
}: {
  slug: string;
  category: PostCategory;
  ratio?: string;
  style?: CSSProperties;
}) {
  const patternId = useId();
  const seed = hashSlug(slug);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Ilustración de portada de la idea "${slug.replace(/-/g, " ")}"`}
      style={{
        display: "block",
        width: "100%",
        aspectRatio: ratio,
        ...style,
      }}
    >
      <title>{`Portada: ${slug.replace(/-/g, " ")}`}</title>
      <defs>
        <pattern id={patternId} width={32} height={32} patternUnits="userSpaceOnUse">
          <circle cx={1.5} cy={1.5} r={1.5} fill={LINE} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#${patternId})`} opacity={0.7} />
      {motifFor(slug, category, seed)}
    </svg>
  );
}
