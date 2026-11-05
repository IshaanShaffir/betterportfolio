"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { HiCalendar } from "react-icons/hi";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import SectionHeading from "./SectionHeading";

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

function formatDateRange(startDate: string, endDate?: string | null) {
  const format = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  return `${format(startDate)} - ${endDate ? format(endDate) : "Present"}`;
}

export default function Experience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // The line fills as the timeline moves through the middle of the screen.
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 55%"],
  });
  const lineProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
  });

  useEffect(() => {
    fetchExperiences();
    checkAdminStatus();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await fetch("/api/experiences");
      setExperiences(await res.json());
    } catch (error) {
      console.error("Error fetching experience:", error);
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
    if (!confirm("Are you sure you want to delete this experience?")) return;

    try {
      const res = await fetch(`/api/experiences/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchExperiences();
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  return (
    <section id="experience" className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 flex items-end justify-between gap-4">
          <SectionHeading index="03" label="journey" title="Experience" />
          {isAdmin && (
            <a
              href="/admin?tab=experience"
              className="shrink-0 text-sm text-accent-cyan transition-colors hover:text-accent-cyan-light"
            >
              <FiPlus className="mr-1 inline" />
              Add
            </a>
          )}
        </div>

        <div ref={timelineRef} className="relative">
          {/* Rail and the line that draws itself along it. */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[11px] top-0 w-0.5 bg-light-border dark:bg-dark-border lg:left-1/2 lg:-ml-px"
          >
            <motion.div
              className="h-full w-full origin-top bg-gradient-to-b from-accent-cyan to-accent-purple"
              style={{ scaleY: reducedMotion ? 1 : lineProgress }}
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-600 dark:text-gray-400">
              Loading...
            </div>
          ) : (
            <div className="space-y-10 lg:space-y-16">
              {experiences.map((exp, index) => {
                const onRight = index % 2 === 1;
                return (
                  <div
                    key={exp.id}
                    className="relative pl-10 lg:grid lg:grid-cols-2 lg:gap-16 lg:pl-0"
                  >
                    {/* Node lights up as the line reaches it. */}
                    <motion.div
                      aria-hidden="true"
                      initial={{ scale: 0.4, opacity: 0.35 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: "-45% 0px -45% 0px" }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                      className="absolute left-0 top-6 z-10 lg:left-1/2 lg:-ml-3"
                    >
                      <span className="hex-mark block h-6 w-6 bg-gradient-to-br from-accent-cyan to-accent-purple" />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: onRight ? 44 : -44 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      className={onRight ? "lg:col-start-2" : ""}
                    >
                      <div className="panel group relative p-6 transition-colors duration-200 hover:border-accent-cyan/40">
                        {isAdmin && (
                          <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() =>
                                (window.location.href = `/admin?tab=experience&edit=${exp.id}`)
                              }
                              className="rounded bg-light-bg p-1.5 transition-colors hover:bg-accent-cyan/20 dark:bg-dark-bg"
                              title="Edit"
                            >
                              <FiEdit2 size={14} className="text-accent-cyan" />
                            </button>
                            <button
                              onClick={() => handleDelete(exp.id)}
                              className="rounded bg-light-bg p-1.5 transition-colors hover:bg-red-500/20 dark:bg-dark-bg"
                              title="Delete"
                            >
                              <FiTrash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        )}

                        <p className="mb-3 flex items-center gap-1.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                          <HiCalendar size={14} />
                          {formatDateRange(exp.startDate, exp.endDate)}
                        </p>
                        <h3 className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                          {exp.role}
                        </h3>
                        <p className="font-medium text-cyan-700 dark:text-accent-cyan-light">
                          {exp.company}
                        </p>
                        {exp.location && (
                          <p className="mb-3 mt-0.5 text-sm text-gray-500">
                            {exp.location}
                          </p>
                        )}
                        <ul className="mt-3 space-y-2">
                          {exp.bullets.map((point, i) => (
                            <li
                              key={i}
                              className="flex gap-2.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                            >
                              <span
                                aria-hidden="true"
                                className="hex-mark mt-1.5 h-2 w-2 shrink-0 bg-accent-cyan"
                              />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
