"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="contact"
      className="relative py-20 lg:py-32 bg-light-bg dark:bg-dark-bg"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.1 }}
          className="text-center"
        >
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Let's connect
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400 text-lg mb-12 max-w-2xl mx-auto"
          >
            If you'd like to talk about an internship, collaboration, or
            project, feel free to reach out. I'm always open to interesting
            conversations.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <a
              href="mailto:ishaanshaffir@gmail.com"
              className="flex items-center gap-3 px-6 py-3 bg-accent-cyan text-dark-bg font-medium rounded-lg hover:bg-accent-cyan-light transition-all duration-200 hover:shadow-lg hover:shadow-accent-cyan/50 hover:-translate-y-0.5"
            >
              <FiMail size={20} />
              <span>Email Me</span>
            </a>
            <a
              href="https://github.com/IshaanShaffir"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border text-gray-900 dark:text-white font-medium rounded-lg hover:border-accent-cyan hover:text-accent-cyan transition-all duration-200"
            >
              <FiGithub size={20} />
              <span>GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/ishaan-shaffir-075308260"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border text-gray-900 dark:text-white font-medium rounded-lg hover:border-accent-cyan hover:text-accent-cyan transition-all duration-200"
            >
              <FiLinkedin size={20} />
              <span>LinkedIn</span>
            </a>
          </motion.div>

          {/* Footer */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-12 border-t border-light-border dark:border-dark-border"
          >
            <p className="text-gray-500 text-sm">
              Built by Ishaan · {new Date().getFullYear()}
            </p>
            <p className="text-gray-400 dark:text-gray-600 text-xs mt-2">
              Powered by Next.js & Tailwind CSS
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
