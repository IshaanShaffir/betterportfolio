"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { HiCalendar, HiBriefcase } from "react-icons/hi";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { getSkillIcon } from "@/lib/skillIcons";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

interface SkillCategory {
  id: number;
  name: string;
  skills: Skill[];
  order: number;
}

interface Skill {
  id: number;
  name: string;
  categoryId: number;
  order: number;
  icon?: string | null;
}

interface Experience {
  id: number;
  role: string;
  company: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  bullets: string[];
  order: number;
}

export default function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    checkAdminStatus();
  }, []);

  const fetchData = async () => {
    try {
      const [skillsRes, expRes] = await Promise.all([
        fetch("/api/skills/categories"),
        fetch("/api/experiences"),
      ]);

      const skillsData = await skillsRes.json();
      const expData = await expRes.json();

      setSkillCategories(skillsData);
      setExperiences(expData);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const handleDeleteExperience = async (id: number) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;

    try {
      const res = await fetch(`/api/experiences/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  const formatDateRange = (startDate: string, endDate?: string | null) => {
    const start = new Date(startDate);
    const startStr = start.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!endDate) {
      return `${startStr} - Present`;
    }

    const end = new Date(endDate);
    const endStr = end.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    return `${startStr} - ${endStr}`;
  };

  return (
    <section
      id="experience"
      className="relative py-20 lg:py-32 bg-white dark:bg-dark-surface"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-12"
          >
            Experience & Skills
          </motion.h2>

          {loading ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-12">
              Loading...
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Skills Section */}
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Skills
                  </h3>
                  {isAdmin && (
                    <a
                      href="/admin?tab=skills"
                      className="text-sm text-accent-cyan hover:text-accent-cyan-light transition-colors"
                    >
                      <FiPlus className="inline mr-1" />
                      Manage
                    </a>
                  )}
                </div>
                <div className="space-y-6">
                  {skillCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      variants={fadeInUp}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    >
                      <h4 className="text-accent-cyan font-semibold mb-3">
                        {category.name}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {category.skills.map((skill) => {
                          const SkillIcon = getSkillIcon(skill.name, skill.icon ?? undefined);
                          return (
                            <span
                              key={skill.id}
                              className="px-3 py-1.5 bg-light-elevated dark:bg-dark-elevated text-gray-700 dark:text-gray-300 text-sm rounded-lg border border-light-border dark:border-dark-border hover:border-accent-cyan/50 hover:text-accent-cyan transition-all duration-200 flex items-center gap-2"
                            >
                              <SkillIcon className="w-4 h-4" />
                              {skill.name}
                            </span>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Experience Timeline */}
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Experience
                  </h3>
                  {isAdmin && (
                    <a
                      href="/admin?tab=experience"
                      className="text-sm text-accent-cyan hover:text-accent-cyan-light transition-colors"
                    >
                      <FiPlus className="inline mr-1" />
                      Add
                    </a>
                  )}
                </div>
                <div className="space-y-8">
                  {experiences.map((exp, index) => (
                    <motion.div
                      key={exp.id}
                      variants={fadeInUp}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="relative pl-8 border-l-2 border-light-border dark:border-dark-border hover:border-accent-cyan/50 transition-colors duration-200"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-accent-cyan rounded-full border-4 border-white dark:border-dark-surface" />

                      <div className="bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg p-5 hover:border-accent-cyan/30 transition-all duration-200 relative group">
                        {isAdmin && (
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                (window.location.href = `/admin?tab=experience&edit=${exp.id}`)
                              }
                              className="p-1.5 bg-light-bg dark:bg-dark-bg rounded hover:bg-accent-cyan/20 transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 size={14} className="text-accent-cyan" />
                            </button>
                            <button
                              onClick={() => handleDeleteExperience(exp.id)}
                              className="p-1.5 bg-light-bg dark:bg-dark-bg rounded hover:bg-red-500/20 transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                              {exp.role}
                            </h4>
                            <p className="text-accent-cyan font-medium">
                              {exp.company}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                            <HiCalendar size={16} />
                            <span>
                              {formatDateRange(exp.startDate, exp.endDate)}
                            </span>
                          </div>
                        </div>
                        {exp.location && (
                          <p className="text-gray-500 text-sm mb-3">
                            {exp.location}
                          </p>
                        )}
                        <ul className="space-y-2">
                          {exp.bullets.map((point, i) => (
                            <li
                              key={i}
                              className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex gap-2"
                            >
                              <span className="text-accent-cyan mt-1">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
