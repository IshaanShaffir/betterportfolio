"use client";

import { useEffect, useState } from "react";

export default function CursorGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 mix-blend-screen"
      style={{
        background: `radial-gradient(150px at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.25), transparent 60%)`,
      }}
    />
  );
}
