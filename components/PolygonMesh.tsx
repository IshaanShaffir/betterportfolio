"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

const CURSOR_RADIUS = 280;
const RIPPLE_SPEED = 560;
const RIPPLE_WIDTH = 140;
const RIPPLE_LIFETIME = 1.5;
const CYAN = [6, 182, 212];
const BLUE = [59, 130, 246];

interface Ripple {
  x: number;
  y: number;
  start: number;
}

// A full-page low-poly mesh that drifts, brightens near the cursor, and ripples
// on click. Phones get a coarser, slower version; reduced motion gets one still frame.
export default function PolygonMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    themeRef.current = theme;
    redrawRef.current();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const minFrameMs = coarsePointer ? 33 : 0;

    let width = 0;
    let height = 0;
    let baseX = new Float32Array(0);
    let baseY = new Float32Array(0);
    let phase = new Float32Array(0);
    let x = new Float32Array(0);
    let y = new Float32Array(0);
    let triangles = new Uint32Array(0);

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cell = coarsePointer || width < 768 ? 130 : 86;
      const cols = Math.ceil(width / cell) + 3;
      const rows = Math.ceil(height / cell) + 3;
      const count = cols * rows;
      baseX = new Float32Array(count);
      baseY = new Float32Array(count);
      phase = new Float32Array(count);
      x = new Float32Array(count);
      y = new Float32Array(count);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          baseX[i] = (col - 1) * cell + (Math.random() - 0.5) * cell * 0.7;
          baseY[i] = (row - 1) * cell + (Math.random() - 0.5) * cell * 0.7;
          phase[i] = Math.random() * Math.PI * 2;
        }
      }

      const indices: number[] = [];
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const a = row * cols + col;
          const b = a + 1;
          const c = a + cols;
          const d = c + 1;
          // Alternating diagonals avoid a visibly regular grid.
          if ((row + col) % 2 === 0) indices.push(a, b, d, a, d, c);
          else indices.push(a, b, c, b, d, c);
        }
      }
      triangles = new Uint32Array(indices);
    };

    let mouseX = -9999;
    let mouseY = -9999;
    let targetX = -9999;
    let targetY = -9999;
    let cursorStrength = 0;
    let targetStrength = 0;
    const ripples: Ripple[] = [];

    const draw = (now: number) => {
      const time = now / 1000;
      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - height,
      );
      const progress = Math.min(1, scrollY / maxScroll);
      const dark = themeRef.current === "dark";

      mouseX += (targetX - mouseX) * 0.14;
      mouseY += (targetY - mouseY) * 0.14;
      cursorStrength += (targetStrength - cursorStrength) * 0.08;

      for (let i = ripples.length - 1; i >= 0; i--) {
        if (time - ripples[i].start > RIPPLE_LIFETIME) ripples.splice(i, 1);
      }

      // Scrolling feeds the wave, so the surface reacts as you move down the page.
      const scrollWave = scrollY * 0.0025;
      for (let i = 0; i < baseX.length; i++) {
        const wave = time * 0.45 + phase[i] + scrollWave;
        x[i] = baseX[i] + Math.sin(wave) * 7;
        y[i] = baseY[i] + Math.cos(wave * 0.9) * 7;

        const dx = x[i] - mouseX;
        const dy = y[i] - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (cursorStrength > 0.01 && distance < CURSOR_RADIUS && distance > 1) {
          const push = (1 - distance / CURSOR_RADIUS) * 16 * cursorStrength;
          x[i] += (dx / distance) * push;
          y[i] += (dy / distance) * push;
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      const baseAlpha = dark ? 0.03 : 0.035;
      const shadeAlpha = dark ? 0.022 : 0.02;
      const glowAlpha = dark ? 0.26 : 0.2;

      for (let t = 0; t < triangles.length; t += 3) {
        const a = triangles[t];
        const b = triangles[t + 1];
        const c = triangles[t + 2];
        const cx = (x[a] + x[b] + x[c]) / 3;
        const cy = (y[a] + y[b] + y[c]) / 3;
        if (cx < -150 || cx > width + 150 || cy < -150 || cy > height + 150) {
          continue;
        }

        const facet =
          Math.sin(cx * 0.006 + time * 0.28) +
          Math.cos(cy * 0.008 - time * 0.2);
        let alpha = Math.max(0, baseAlpha + facet * shadeAlpha);

        const dx = cx - mouseX;
        const dy = cy - mouseY;
        const cursorDistance = Math.sqrt(dx * dx + dy * dy);
        if (cursorDistance < CURSOR_RADIUS) {
          const lit = 1 - cursorDistance / CURSOR_RADIUS;
          alpha += lit * lit * glowAlpha * cursorStrength;
        }

        for (const ripple of ripples) {
          const age = time - ripple.start;
          const rx = cx - ripple.x;
          const ry = cy - ripple.y;
          const fromFront = Math.abs(
            Math.sqrt(rx * rx + ry * ry) - age * RIPPLE_SPEED,
          );
          if (fromFront < RIPPLE_WIDTH) {
            alpha +=
              (1 - fromFront / RIPPLE_WIDTH) *
              (1 - age / RIPPLE_LIFETIME) *
              glowAlpha;
          }
        }

        // Colour moves from cyan to blue across the screen and down the page.
        const mix = Math.min(1, Math.max(0, cx / width * 0.5 + progress * 0.6));
        const r = Math.round(CYAN[0] + (BLUE[0] - CYAN[0]) * mix);
        const g = Math.round(CYAN[1] + (BLUE[1] - CYAN[1]) * mix);
        const blue = Math.round(CYAN[2] + (BLUE[2] - CYAN[2]) * mix);

        ctx.fillStyle = `rgba(${r},${g},${blue},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(x[a], y[a]);
        ctx.lineTo(x[b], y[b]);
        ctx.lineTo(x[c], y[c]);
        ctx.closePath();
        ctx.fill();
      }

      ctx.strokeStyle = dark
        ? "rgba(148, 163, 184, 0.045)"
        : "rgba(71, 85, 105, 0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let t = 0; t < triangles.length; t += 3) {
        const a = triangles[t];
        const b = triangles[t + 1];
        const c = triangles[t + 2];
        ctx.moveTo(x[a], y[a]);
        ctx.lineTo(x[b], y[b]);
        ctx.lineTo(x[c], y[c]);
        ctx.closePath();
      }
      ctx.stroke();
    };

    build();
    redrawRef.current = () => draw(performance.now());
    draw(performance.now());

    const handleResize = () => {
      build();
      draw(performance.now());
    };
    window.addEventListener("resize", handleResize);

    if (reducedMotion) {
      return () => {
        window.removeEventListener("resize", handleResize);
        redrawRef.current = () => {};
      };
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (targetStrength === 0) {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }
      targetX = e.clientX;
      targetY = e.clientY;
      targetStrength = 1;
    };
    const handlePointerLeave = () => {
      targetStrength = 0;
    };
    const handlePointerDown = (e: PointerEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        start: performance.now() / 1000,
      });
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    document.documentElement.addEventListener(
      "mouseleave",
      handlePointerLeave,
    );

    // requestAnimationFrame already stops while the tab is hidden.
    let frame = 0;
    let last = 0;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (now - last < minFrameMs) return;
      last = now;
      draw(now);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      document.documentElement.removeEventListener(
        "mouseleave",
        handlePointerLeave,
      );
      redrawRef.current = () => {};
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
