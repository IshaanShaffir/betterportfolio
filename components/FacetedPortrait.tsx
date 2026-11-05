"use client";

import { useRef } from "react";

const POINTS: [number, number][] = [
  [50, 0],
  [86, 11],
  [100, 47],
  [90, 84],
  [54, 100],
  [15, 90],
  [0, 53],
  [11, 14],
];
const CLIP = `polygon(${POINTS.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
const INNER_RING = 0.8;

// The portrait is cut into a gem shape, with facets that catch the cursor's light.
export default function FacetedPortrait() {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className="group relative mx-auto aspect-square w-full max-w-md"
    >
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-accent-cyan to-accent-blue opacity-30 blur-3xl" />

      {/* Rotating gradient, visible as the gem's edge. */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: CLIP }}
      >
        <div
          className="facet-spin absolute -inset-1/4"
          style={{
            background:
              "conic-gradient(from 0deg, #06b6d4, #3b82f6, #22d3ee, #60a5fa, #06b6d4)",
          }}
        />
      </div>

      <div
        className="absolute inset-[5px] overflow-hidden bg-dark-elevated"
        style={{ clipPath: CLIP }}
      >
        <img
          src="/profile-photo"
          alt="Ishaan Shaffir"
          className="h-full w-full object-cover"
        />

        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {/* Facets stay in an outer ring, so no lines cross the face. */}
          {POINTS.map(([x, y], i) => {
            const [nextX, nextY] = POINTS[(i + 1) % POINTS.length];
            const inner = (px: number, py: number) =>
              `${50 + (px - 50) * INNER_RING},${50 + (py - 50) * INNER_RING}`;
            return (
              <polygon
                key={i}
                points={`${x},${y} ${nextX},${nextY} ${inner(nextX, nextY)} ${inner(x, y)}`}
                fill={i % 2 === 0 ? "#22d3ee" : "#3b82f6"}
                fillOpacity={i % 2 === 0 ? 0.12 : 0.16}
                stroke="#ffffff"
                strokeOpacity={0.14}
                strokeWidth={0.25}
              />
            );
          })}
        </svg>

        {/* Cursor light. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.65), transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
