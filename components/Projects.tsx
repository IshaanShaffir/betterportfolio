"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  FiGithub,
  FiExternalLink,
  FiEdit2,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

interface Project {
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

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
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

  return (
    <section
      id="projects"
      className="relative py-20 lg:py-32 bg-light-bg dark:bg-dark-bg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.1 }}
        >
          <div className="flex items-center justify-between mb-12">
            <motion.h2
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white"
            >
              Projects
            </motion.h2>
            {isAdmin && (
              <motion.a
                href="/admin?tab=projects"
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg hover:bg-accent-cyan-light transition-colors"
              >
                <FiPlus size={20} />
                <span className="text-sm font-medium">Add Project</span>
              </motion.a>
            )}
          </div>

          {loading ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-12">
              Loading projects...
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6 hover:border-accent-cyan/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-accent-cyan/20 relative"
                >
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          (window.location.href = `/admin?tab=projects&edit=${project.id}`)
                        }
                        className="p-2 bg-light-elevated dark:bg-dark-elevated rounded-lg hover:bg-accent-cyan/20 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={16} className="text-accent-cyan" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 bg-light-elevated dark:bg-dark-elevated rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-accent-cyan transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-light-elevated dark:bg-dark-elevated text-accent-cyan text-sm rounded-full border border-accent-cyan/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex gap-4">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-accent-cyan transition-colors"
                      >
                        <FiGithub size={20} />
                        <span className="text-sm font-medium">GitHub</span>
                      </a>
                    )}
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-accent-cyan transition-colors"
                      >
                        <FiExternalLink size={20} />
                        <span className="text-sm font-medium">Live Demo</span>
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 text-gray-400 dark:text-gray-600 cursor-not-allowed">
                        <FiExternalLink size={20} />
                        <span className="text-sm font-medium">Coming Soon</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
