"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  HiLocationMarker,
  HiAcademicCap,
  HiCode,
  HiLightningBolt,
} from "react-icons/hi";
import SectionHeading from "./SectionHeading";

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function About() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      setContent(data);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  const quickFacts = [
    {
      icon: <HiLocationMarker size={22} />,
      label: "Location",
      value: content?.location || "Kelowna, BC",
    },
    {
      icon: <HiAcademicCap size={22} />,
      label: "Education",
      value: content?.education || "BSc Computer Science",
    },
    {
      icon: <HiCode size={22} />,
      label: "Favorite Stack",
      value: content?.favouriteStack || "React · Flask · Firebase",
    },
    {
      icon: <HiLightningBolt size={22} />,
      label: "Currently Vibing",
      value: content?.currentlyVibing || "AI APIs & Game Dev",
    },
  ];

  return (
    <section id="about" className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index="01" label="about" title="About me" />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="panel space-y-4 p-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300 sm:p-8 lg:col-span-2"
          >
            <p>
              {content?.aboutParagraph1 ||
                "Hey! I'm a Computer Science student at UBC Okanagan who genuinely enjoys the process of building things—whether it's a full-stack web app, a 3D game in Unity, or a Chrome extension that makes studying less painful. There's something satisfying about taking a vague idea and turning it into something that actually works."}
            </p>
            <p>
              {content?.aboutParagraph2 ||
                "When I'm not debugging code or wrestling with APIs, you'll probably find me exploring new tech, trying out the latest frameworks, or diving into a side project just because it sounds interesting. I'm the kind of person who starts building something \"just to see if it's possible\" and ends up with a full project at 2 AM."}
            </p>
            <p>
              {content?.aboutParagraph3 ||
                "I'm a big believer in learning by doing. Whether it's experimenting with AI APIs, picking up a new programming language, or figuring out how to deploy something I built to the cloud—I'm always tinkering. If you want to chat about tech, collaborate on something cool, or just talk about what you're building, I'm all ears!"}
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {quickFacts.map((fact, index) => (
              <motion.div
                key={fact.label}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="panel flex items-start gap-3 p-4 transition-colors duration-200 hover:border-accent-cyan/50"
              >
                <div className="mt-0.5 text-accent-cyan">{fact.icon}</div>
                <div>
                  <p className="mb-1 text-sm text-gray-500">{fact.label}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {fact.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
