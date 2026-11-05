"use client";

import { motion } from "framer-motion";

export default function SectionHeading({
  index,
  label,
  title,
}: {
  index: string;
  label: string;
  title: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="mb-3 flex items-center gap-3 font-mono text-sm text-accent-cyan">
        <span aria-hidden="true" className="hex-mark h-3 w-3 bg-accent-cyan" />
        {index} / {label}
      </p>
      <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
        {title}
      </h2>
    </motion.div>
  );
}
