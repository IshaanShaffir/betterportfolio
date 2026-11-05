"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Four triangles meeting at the letter's centre. They extend past its box so
// accents and descenders aren't clipped.
const SHARDS = [
  "polygon(-30% -30%, 130% -30%, 50% 50%)",
  "polygon(130% -30%, 130% 130%, 50% 50%)",
  "polygon(130% 130%, -30% 130%, 50% 50%)",
  "polygon(-30% 130%, -30% -30%, 50% 50%)",
];
const STAGGER = 0.028;
const DURATION = 0.8;

// Deterministic, so the server and browser render the same starting positions.
function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 127.1) * 43758.5453;
  return value - Math.floor(value);
}

// Assembles text from triangular shards, then swaps to plain text, so the
// finished heading has no animation elements left behind.
export default function ShatterText({ text }: { text: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    setDone(false);
    const letters = text.replace(/\s/g, "").length;
    const timer = setTimeout(
      () => setDone(true),
      (letters * STAGGER + DURATION + 0.1) * 1000,
    );
    return () => clearTimeout(timer);
  }, [text]);

  if (done) return <>{text}</>;

  let letterIndex = 0;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, wordIndex) => (
          <span key={wordIndex}>
            {wordIndex > 0 && " "}
            <span className="inline-block whitespace-nowrap">
              {word.split("").map((letter, charIndex) => {
                const index = letterIndex++;
                return (
                  <span key={charIndex} className="relative inline-block">
                    <span className="invisible">{letter}</span>
                    {SHARDS.map((shard, shardIndex) => {
                      const seed = index * 4 + shardIndex + 1;
                      const angle = pseudoRandom(seed) * Math.PI * 2;
                      const distance = 50 + pseudoRandom(seed + 0.5) * 110;
                      return (
                        <motion.span
                          key={shardIndex}
                          className="absolute inset-0"
                          style={{ clipPath: shard }}
                          initial={{
                            opacity: 0,
                            x: Math.cos(angle) * distance,
                            y: Math.sin(angle) * distance,
                            rotate: (pseudoRandom(seed + 0.25) - 0.5) * 220,
                            scale: 0.5,
                          }}
                          animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                          transition={{
                            duration: DURATION,
                            delay: index * STAGGER,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        >
                          {letter}
                        </motion.span>
                      );
                    })}
                  </span>
                );
              })}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}
