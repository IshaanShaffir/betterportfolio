"use client";

import { useRef } from "react";
import { FiEdit2, FiExternalLink, FiGithub, FiTrash2 } from "react-icons/fi";

export interface Project {
  id: number;
  title: string;
  subtitle?: string | null;
  description: string;
  techStack: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  featured: boolean;
  order: number;
}

const MAX_TILT = 5;

// Small seeded generator, so each project keeps the same artwork on every visit.
function seededRandom(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 15), 2147483647 - 18);
    hash ^= hash >>> 13;
    return (hash >>> 0) / 4294967296;
  };
}

// Generated low-poly banner, unique to each project.
function ProjectArt({ title }: { title: string }) {
  const random = seededRandom(title);
  const cols = 12;
  const rows = 4;
  const width = 600;
  const height = 160;
  const cellW = width / cols;
  const cellH = height / rows;
  const flip = random() > 0.5;

  const points: [number, number][][] = [];
  for (let row = 0; row <= rows; row++) {
    points.push([]);
    for (let col = 0; col <= cols; col++) {
      points[row].push([
        col * cellW + (random() - 0.5) * cellW * 0.8,
        row * cellH + (random() - 0.5) * cellH * 0.8,
      ]);
    }
  }

  const facets: { points: string; color: string; opacity: number }[] = [];
  const addFacet = (corners: [number, number][], position: number) => {
    const mix = Math.max(0, Math.min(1, flip ? 1 - position : position));
    facets.push({
      points: corners.map((p) => p.join(",")).join(" "),
      color: mix + (random() - 0.5) * 0.4 > 0.5 ? "#a855f7" : "#06b6d4",
      opacity: 0.1 + random() * 0.5,
    });
  };

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const a = points[row][col];
      const b = points[row][col + 1];
      const c = points[row + 1][col];
      const d = points[row + 1][col + 1];
      const position = col / cols;
      if ((row + col) % 2 === 0) {
        addFacet([a, b, d], position);
        addFacet([a, d, c], position);
      } else {
        addFacet([a, b, c], position);
        addFacet([b, d, c], position);
      }
    }
  }

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-110"
    >
      {facets.map((facet, i) => (
        <polygon
          key={i}
          points={facet.points}
          fill={facet.color}
          fillOpacity={facet.opacity}
        />
      ))}
    </svg>
  );
}

export default function ProjectCard({
  project,
  large,
  isAdmin,
  onDelete,
}: {
  project: Project;
  large: boolean;
  isAdmin: boolean;
  onDelete: (id: number) => void;
}) {
  const ref = useRef<HTMLElement>(null);

  // Writes styles directly, so moving the cursor doesn't re-render React.
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    el.style.setProperty("--mx", `${px}px`);
    el.style.setProperty("--my", `${py}px`);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rotateY = (px / rect.width - 0.5) * MAX_TILT * 2;
    const rotateX = (0.5 - py / rect.height) * MAX_TILT * 2;
    el.style.transition = "transform 0.08s linear";
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
  };

  const handlePointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "";
  };

  return (
    <article
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="glow-card group flex h-full flex-col overflow-hidden will-change-transform"
    >
      <div className={`overflow-hidden ${large ? "h-40" : "h-24"}`}>
        <ProjectArt title={project.title} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-6">
        {isAdmin && (
          <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() =>
                (window.location.href = `/admin?tab=projects&edit=${project.id}`)
              }
              className="rounded-lg bg-light-elevated p-2 transition-colors hover:bg-accent-cyan/20 dark:bg-dark-elevated"
              title="Edit"
            >
              <FiEdit2 size={16} className="text-accent-cyan" />
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="rounded-lg bg-light-elevated p-2 transition-colors hover:bg-red-500/20 dark:bg-dark-elevated"
              title="Delete"
            >
              <FiTrash2 size={16} className="text-red-500" />
            </button>
          </div>
        )}

        <h3
          className={`mb-3 font-display font-bold tracking-tight text-gray-900 transition-colors group-hover:text-accent-cyan dark:text-white ${
            large ? "text-3xl" : "text-2xl"
          }`}
        >
          {project.title}
        </h3>
        {project.subtitle && (
          <p className="mb-3 text-sm font-medium text-accent-purple">
            {project.subtitle}
          </p>
        )}
        <p className="mb-5 flex-1 leading-relaxed text-gray-600 dark:text-gray-300">
          {project.description}
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-accent-cyan/30 bg-light-elevated px-3 py-1 text-xs text-cyan-700 dark:bg-dark-elevated dark:text-accent-cyan-light"
            >
              {tech}
            </span>
          ))}
        </div>

        {(project.githubUrl || project.liveUrl) && (
          <div className="flex gap-5">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-accent-cyan dark:text-gray-200"
              >
                <FiExternalLink size={18} />
                Live Site
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-accent-cyan dark:text-gray-200"
              >
                <FiGithub size={18} />
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
