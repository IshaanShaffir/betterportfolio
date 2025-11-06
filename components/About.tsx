"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  HiLocationMarker,
  HiAcademicCap,
  HiCode,
  HiLightningBolt,
} from "react-icons/hi";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const quickFacts = [
  {
    icon: <HiLocationMarker size={24} />,
    label: "Location",
    value: "Kelowna, BC",
  },
  {
    icon: <HiAcademicCap size={24} />,
    label: "Education",
    value: "BSc Computer Science",
  },
  {
    icon: <HiCode size={24} />,
    label: "Favorite Stack",
    value: "React · Flask · Firebase",
  },
  {
    icon: <HiLightningBolt size={24} />,
    label: "Currently Vibing",
    value: "AI APIs & Game Dev",
  },
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      className="relative py-20 lg:py-32 bg-white dark:bg-dark-surface"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.15 }}
        >
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            About me
          </motion.h2>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-4 text-gray-600 dark:text-gray-400 text-lg leading-relaxed"
            >
              <p>
                Hey! I'm a Computer Science student at UBC Okanagan who
                genuinely enjoys the process of building things—whether it's a
                full-stack web app, a 3D game in Unity, or a Chrome extension
                that makes studying less painful. There's something satisfying
                about taking a vague idea and turning it into something that
                actually works.
              </p>
              <p>
                When I'm not debugging code or wrestling with APIs, you'll
                probably find me exploring new tech, trying out the latest
                frameworks, or diving into a side project just because it sounds
                interesting. I'm the kind of person who starts building
                something "just to see if it's possible" and ends up with a full
                project at 2 AM.
              </p>
              <p>
                I'm a big believer in learning by doing. Whether it's
                experimenting with AI APIs, picking up a new programming
                language, or figuring out how to deploy something I built to the
                cloud—I'm always tinkering. If you want to chat about tech,
                collaborate on something cool, or just talk about what you're
                building, I'm all ears!
              </p>
            </motion.div>

            {/* Quick facts sidebar */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              {quickFacts.map((fact, index) => (
                <motion.div
                  key={fact.label}
                  variants={fadeInUp}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg p-4 hover:border-accent-cyan/50 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-accent-cyan mt-1">{fact.icon}</div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{fact.label}</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {fact.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
