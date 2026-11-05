"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import ProjectCard, { Project } from "./ProjectCard";
import SectionHeading from "./SectionHeading";

// Rows always add up to six columns, alternating wide and narrow cards.
const ROW_PATTERNS = [
  [4, 2],
  [2, 4],
  [3, 3],
  [3, 3],
];
const SPAN_CLASSES: Record<number, string> = {
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4 md:col-span-2",
  6: "lg:col-span-6 md:col-span-2",
};

function bentoSpans(count: number) {
  const spans: number[] = [];
  for (let row = 0; spans.length < count; row++) {
    const pattern = ROW_PATTERNS[row % ROW_PATTERNS.length];
    if (count - spans.length === 1) spans.push(6);
    else spans.push(...pattern);
  }
  return spans;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    checkAdminStatus();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setIsAdmin(data.isLoggedIn);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const spans = bentoSpans(projects.length);

  return (
    <section id="projects" className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between gap-4">
          <SectionHeading index="02" label="work" title="Projects" />
          {isAdmin && (
            <a
              href="/admin?tab=projects"
              className="flex shrink-0 items-center gap-2 rounded-lg bg-accent-cyan px-4 py-2 text-dark-bg transition-colors hover:bg-accent-cyan-light"
            >
              <FiPlus size={20} />
              <span className="text-sm font-medium">Add Project</span>
            </a>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-600 dark:text-gray-400">
            Loading projects...
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6 lg:gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={SPAN_CLASSES[spans[index]]}
              >
                <ProjectCard
                  project={project}
                  large={spans[index] >= 3}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
