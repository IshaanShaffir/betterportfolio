"use client";

import { useRef } from "react";
import { FiEdit2, FiExternalLink, FiGithub, FiTrash2 } from "react-icons/fi";
import { PROJECT_IMAGES } from "@/lib/projectImages";

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
  const image = PROJECT_IMAGES[project.title];

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
      {image && (
        <div
          className={`relative flex-1 overflow-hidden border-b border-light-border dark:border-dark-border ${large ? "min-h-80" : "min-h-48"}`}
        >
          <img
            src={image.src}
            alt={`${project.title} screenshot`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-105 ${
              image.fit === "contain"
                ? "bg-light-elevated object-contain p-4 dark:bg-dark-elevated"
                : "object-cover object-top"
            }`}
          />
        </div>
      )}

      <div
        className={`relative z-10 flex flex-col p-6 ${image ? "" : "flex-1"}`}
      >
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
          <p className="mb-3 text-sm font-medium text-accent-blue">
            {project.subtitle}
          </p>
        )}
        <p className="mb-5 leading-relaxed text-gray-600 dark:text-gray-300">
          {project.description}
        </p>

        <div className="mb-6 mt-auto flex flex-wrap gap-2">
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
