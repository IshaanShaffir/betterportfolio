"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { getSkillIcon } from "@/lib/skillIcons";
import type { Project } from "./ProjectCard";
import SectionHeading from "./SectionHeading";

interface Skill {
  id: number;
  name: string;
  icon?: string | null;
}

interface SkillCategory {
  id: number;
  name: string;
  skills: Skill[];
}

type Active = { type: "skill" | "project"; id: number } | null;

interface Line {
  key: string;
  d: string;
}

// Projects and the skills list sometimes name the same thing differently.
const ALIASES: Record<string, string> = {
  "tailwind css": "tailwind",
  "gemini api": "google gemini api",
  jwt: "jwt auth",
};
const normalize = (name: string) => {
  const lower = name.trim().toLowerCase();
  return ALIASES[lower] ?? lower;
};

const skillKey = (id: number) => `skill-${id}`;
const projectKey = (id: number) => `project-${id}`;

// Skills form constellations. Hovering or tapping a skill draws lines to the
// projects that use it, and hovering a project lights up its skills.
export default function Skills() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Active>(null);
  const [baseLines, setBaseLines] = useState<Line[]>([]);
  const [activeLines, setActiveLines] = useState<Line[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const lastPointer = useRef("mouse");

  useEffect(() => {
    const load = async () => {
      try {
        const [skillsRes, projectsRes, sessionRes] = await Promise.all([
          fetch("/api/skills/categories"),
          fetch("/api/projects"),
          fetch("/api/auth/session"),
        ]);
        setCategories(await skillsRes.json());
        setProjects(await projectsRes.json());
        setIsAdmin((await sessionRes.json()).isLoggedIn);
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const allSkills = useMemo(
    () => categories.flatMap((category) => category.skills),
    [categories],
  );

  const projectsBySkill = useMemo(() => {
    const map = new Map<number, Project[]>();
    for (const skill of allSkills) {
      map.set(
        skill.id,
        projects.filter((project) =>
          project.techStack.some(
            (tech) => normalize(tech) === normalize(skill.name),
          ),
        ),
      );
    }
    return map;
  }, [allSkills, projects]);

  const skillsByProject = useMemo(() => {
    const map = new Map<number, Skill[]>();
    for (const project of projects) {
      map.set(
        project.id,
        allSkills.filter((skill) =>
          projectsBySkill.get(skill.id)?.some((p) => p.id === project.id),
        ),
      );
    }
    return map;
  }, [allSkills, projects, projectsBySkill]);

  const linkedKeys = useMemo(() => {
    if (!active) return null;
    const keys = new Set<string>();
    if (active.type === "skill") {
      keys.add(skillKey(active.id));
      projectsBySkill
        .get(active.id)
        ?.forEach((project) => keys.add(projectKey(project.id)));
    } else {
      keys.add(projectKey(active.id));
      skillsByProject
        .get(active.id)
        ?.forEach((skill) => keys.add(skillKey(skill.id)));
    }
    return keys;
  }, [active, projectsBySkill, skillsByProject]);

  const curve = useCallback((fromKey: string, toKey: string) => {
    const container = containerRef.current;
    const from = nodes.current.get(fromKey);
    const to = nodes.current.get(toKey);
    if (!container || !from || !to) return null;
    const origin = container.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const x1 = a.left + a.width / 2 - origin.left;
    const y1 = a.top + a.height / 2 - origin.top;
    const x2 = b.left + b.width / 2 - origin.left;
    const y2 = b.top + b.height / 2 - origin.top;
    const bend = (x2 - x1) * 0.35;
    return `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`;
  }, []);

  // Faint lines chain each category's skills into a constellation.
  const measureBase = useCallback(() => {
    const lines: Line[] = [];
    for (const category of categories) {
      for (let i = 0; i < category.skills.length - 1; i++) {
        const fromKey = skillKey(category.skills[i].id);
        const toKey = skillKey(category.skills[i + 1].id);
        const d = curve(fromKey, toKey);
        if (d) lines.push({ key: `${fromKey}-${toKey}`, d });
      }
    }
    setBaseLines(lines);
  }, [categories, curve]);

  const measureActive = useCallback(() => {
    if (!active) {
      setActiveLines([]);
      return;
    }
    const pairs =
      active.type === "skill"
        ? (projectsBySkill.get(active.id) ?? []).map((project) => [
            skillKey(active.id),
            projectKey(project.id),
          ])
        : (skillsByProject.get(active.id) ?? []).map((skill) => [
            skillKey(skill.id),
            projectKey(active.id),
          ]);
    const lines: Line[] = [];
    for (const [fromKey, toKey] of pairs) {
      const d = curve(fromKey, toKey);
      if (d) lines.push({ key: `${fromKey}-${toKey}`, d });
    }
    setActiveLines(lines);
  }, [active, curve, projectsBySkill, skillsByProject]);

  useEffect(() => {
    measureBase();
  }, [measureBase]);

  useEffect(() => {
    measureActive();
  }, [measureActive]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      measureBase();
      measureActive();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [measureBase, measureActive]);

  const register = (key: string) => (el: HTMLElement | null) => {
    if (el) nodes.current.set(key, el);
    else nodes.current.delete(key);
  };

  const interactions = (next: NonNullable<Active>) => ({
    onPointerDown: (e: React.PointerEvent) => {
      lastPointer.current = e.pointerType;
    },
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setActive(next);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setActive(null);
    },
    onFocus: () => {
      if (lastPointer.current === "mouse") setActive(next);
    },
    onBlur: () => setActive(null),
    // Touch screens have no hover, so a tap toggles instead.
    onClick: () => {
      if (lastPointer.current === "mouse") return;
      setActive((current) =>
        current?.type === next.type && current.id === next.id ? null : next,
      );
    },
  });

  const dimmed = (key: string) =>
    linkedKeys && !linkedKeys.has(key) ? "opacity-25" : "opacity-100";

  const status = useMemo(() => {
    if (!active) return "Hover or tap a skill to see where I've used it.";
    if (active.type === "skill") {
      const skill = allSkills.find((s) => s.id === active.id);
      const used = projectsBySkill.get(active.id) ?? [];
      return used.length
        ? `${skill?.name}: used in ${used.map((p) => p.title).join(", ")}`
        : `${skill?.name}: not tied to a listed project`;
    }
    const project = projects.find((p) => p.id === active.id);
    const count = skillsByProject.get(active.id)?.length ?? 0;
    return `${project?.title}: ${count} ${count === 1 ? "skill" : "skills"} lit up`;
  }, [active, allSkills, projects, projectsBySkill, skillsByProject]);

  return (
    <section id="skills" className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <SectionHeading index="04" label="toolkit" title="Skills" />
          {isAdmin && (
            <a
              href="/admin?tab=skills"
              className="shrink-0 text-sm text-accent-cyan transition-colors hover:text-accent-cyan-light"
            >
              <FiPlus className="mr-1 inline" />
              Manage
            </a>
          )}
        </div>

        <p
          aria-live="polite"
          className="mb-10 min-h-[1.5rem] font-mono text-sm text-gray-600 dark:text-gray-300"
        >
          {status}
        </p>

        {loading ? (
          <div className="py-12 text-center text-gray-600 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid gap-10 lg:grid-cols-[1fr_260px] lg:gap-14"
          >
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block"
            >
              <g className="text-accent-cyan">
                {baseLines.map((line) => (
                  <path
                    key={line.key}
                    d={line.d}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1}
                    className={`transition-opacity duration-300 ${
                      active ? "opacity-5" : "opacity-25"
                    }`}
                  />
                ))}
              </g>
              <defs>
                <linearGradient id="skill-link" x1="0" x2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              {activeLines.map((line) => (
                <motion.path
                  key={line.key}
                  d={line.d}
                  fill="none"
                  stroke="url(#skill-link)"
                  strokeWidth={1.75}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              ))}
            </svg>

            <div className="grid content-start gap-x-8 gap-y-10 sm:grid-cols-2">
              {categories.map((category) => (
                <div key={category.id}>
                  <h3 className="mb-4 font-display text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {category.skills.map((skill) => {
                      const Icon = getSkillIcon(
                        skill.name,
                        skill.icon ?? undefined,
                      );
                      const key = skillKey(skill.id);
                      const isActive =
                        active?.type === "skill" && active.id === skill.id;
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          ref={register(key)}
                          aria-pressed={isActive}
                          {...interactions({ type: "skill", id: skill.id })}
                          className={`relative z-10 flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm text-gray-700 transition-all duration-200 dark:bg-dark-elevated dark:text-gray-200 ${dimmed(key)} ${
                            linkedKeys?.has(key)
                              ? "scale-105 border-accent-cyan shadow-md shadow-accent-cyan/30"
                              : "border-light-border dark:border-dark-border"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10">
              <h3 className="mb-4 font-display text-lg font-semibold text-gray-900 dark:text-white">
                Used in
              </h3>
              <div className="flex flex-wrap gap-2.5 lg:flex-col">
                {projects.map((project) => {
                  const key = projectKey(project.id);
                  const isActive =
                    active?.type === "project" && active.id === project.id;
                  return (
                    <button
                      key={project.id}
                      type="button"
                      ref={register(key)}
                      aria-pressed={isActive}
                      {...interactions({ type: "project", id: project.id })}
                      className={`rounded-lg border bg-white px-3 py-2 text-left text-sm font-medium text-gray-800 transition-all duration-200 dark:bg-dark-surface dark:text-gray-100 ${dimmed(key)} ${
                        linkedKeys?.has(key)
                          ? "border-accent-blue shadow-md shadow-accent-blue/30"
                          : "border-light-border dark:border-dark-border"
                      }`}
                    >
                      {project.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
