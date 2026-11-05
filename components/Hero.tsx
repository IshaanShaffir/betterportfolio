"use client";

import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { HiArrowDown } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ShatterText from "./ShatterText";
import FacetedPortrait from "./FacetedPortrait";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Hero() {
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [isWaitingForCode, setIsWaitingForCode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [content, setContent] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    checkAdminStatus();
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

  const checkAdminStatus = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setIsAdmin(data.isAdmin);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };

  const handleTerminalSubmit = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== "Enter") return;

    const input = terminalInput.trim();

    if (isWaitingForCode) {
      // Verify the 2FA code
      setTerminalHistory((prev) => [...prev, `> ${input.replace(/./g, "•")}`]);
      setTerminalInput("");

      try {
        const res = await fetch("/api/auth/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code: input }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Login successful:", data);
          setTerminalHistory((prev) => [
            ...prev,
            "✓ Authentication successful",
            "✓ Admin session started",
            "→ Redirecting to admin...",
          ]);
          setIsWaitingForCode(false);
          setIsAdmin(true);
          // Wait a moment for cookie to be set, then redirect
          setTimeout(() => {
            console.log("Redirecting now...");
            window.location.href = "/admin";
          }, 500);
        } else {
          const error = await res.text();
          console.error("Login failed:", error);
          setTerminalHistory((prev) => [...prev, "✗ Invalid or expired code"]);
          setIsWaitingForCode(false);
        }
      } catch (error) {
        setTerminalHistory((prev) => [...prev, "✗ Verification failed"]);
        setIsWaitingForCode(false);
      }
    } else if (input === ":dev-login") {
      // Request 2FA code
      setTerminalHistory((prev) => [
        ...prev,
        `$ ${input}`,
        "Initiating admin login...",
      ]);
      setTerminalInput("");

      try {
        const res = await fetch("/api/auth/request-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          setTerminalHistory((prev) => [
            ...prev,
            "✓ Verification code sent to admin email",
            "Enter 6-digit code:",
          ]);
          setIsWaitingForCode(true);
        } else {
          setTerminalHistory((prev) => [...prev, "✗ Failed to send code"]);
        }
      } catch (error) {
        setTerminalHistory((prev) => [...prev, "✗ Connection error"]);
      }
    } else if (input === ":admin") {
      if (isAdmin) {
        router.push("/admin");
      } else {
        setTerminalHistory((prev) => [
          ...prev,
          `$ ${input}`,
          "✗ Not authenticated. Use :dev-login",
        ]);
        setTerminalInput("");
      }
    } else if (input === ":logout") {
      if (isAdmin) {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          setTerminalHistory((prev) => [...prev, `$ ${input}`, "✓ Logged out"]);
          setIsAdmin(false);
        } catch (error) {
          setTerminalHistory((prev) => [...prev, "✗ Logout failed"]);
        }
      } else {
        setTerminalHistory((prev) => [
          ...prev,
          `$ ${input}`,
          "✗ Not logged in",
        ]);
      }
      setTerminalInput("");
    } else if (input === ":help") {
      setTerminalHistory((prev) => [
        ...prev,
        `$ ${input}`,
        "Available commands:",
        "  :dev-login - Start admin authentication",
        "  :admin     - Go to admin dashboard",
        "  :logout    - End admin session",
        "  :help      - Show this help",
      ]);
      setTerminalInput("");
    } else if (input) {
      setTerminalHistory((prev) => [
        ...prev,
        `$ ${input}`,
        `Command not found: ${input}. Type :help for commands.`,
      ]);
      setTerminalInput("");
    }
  };

  const scrollToProjects = () => {
    const element = document.querySelector("#projects");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="min-h-screen relative pt-16 flex items-center"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
            className="space-y-6"
          >
            <motion.div variants={fadeIn} transition={{ duration: 0.5 }}>
              <p className="mb-4 flex items-center gap-3 font-mono text-sm text-accent-cyan">
                <span
                  aria-hidden="true"
                  className="hex-mark h-3 w-3 bg-accent-cyan"
                />
                {content?.heroTitle || "Full-Stack Developer · CS Student"}
              </p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.05]">
                <ShatterText
                  text={content?.heroHeading || "Hi, I'm Ishaan."}
                />
                <span className="mt-4 block text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight">
                  <span className="text-gradient">
                    {content?.heroSubheading ||
                      "I build practical, thoughtful experiences."}
                  </span>
                </span>
              </h1>
            </motion.div>

            <motion.p
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-xl"
            >
              {content?.heroBio ||
                "I'm a Computer Science student at UBC Okanagan passionate about full-stack development and building systems that solve real problems. From exam analysis tools to weather dashboards and e-commerce platforms, I enjoy bringing ideas to life through code."}
            </motion.p>

            <motion.div
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <button
                onClick={scrollToProjects}
                className="px-6 py-3 bg-accent-cyan text-dark-bg font-medium rounded-lg hover:bg-accent-cyan-light transition-all duration-200 hover:shadow-lg hover:shadow-accent-cyan/50 hover:-translate-y-0.5"
              >
                View Projects
              </button>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-accent-cyan text-accent-cyan font-medium rounded-lg hover:bg-accent-cyan/10 transition-all duration-200"
              >
                Download Resume
              </a>
            </motion.div>

            <motion.div
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex gap-4 pt-4"
            >
              <a
                href="https://github.com/IshaanShaffir"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-light-elevated dark:bg-dark-elevated rounded-lg text-gray-600 dark:text-gray-400 hover:text-accent-cyan hover:bg-gray-200 dark:hover:bg-dark-border transition-all duration-200 hover:-translate-y-1"
              >
                <FiGithub size={24} />
              </a>
              <a
                href="https://linkedin.com/in/ishaan-shaffir-075308260"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-light-elevated dark:bg-dark-elevated rounded-lg text-gray-600 dark:text-gray-400 hover:text-accent-cyan hover:bg-gray-200 dark:hover:bg-dark-border transition-all duration-200 hover:-translate-y-1"
              >
                <FiLinkedin size={24} />
              </a>
              <a
                href="mailto:ishaanshaffir@gmail.com"
                className="p-3 bg-light-elevated dark:bg-dark-elevated rounded-lg text-gray-600 dark:text-gray-400 hover:text-accent-cyan hover:bg-gray-200 dark:hover:bg-dark-border transition-all duration-200 hover:-translate-y-1"
              >
                <FiMail size={24} />
              </a>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Portrait */}
              <div className="relative z-10">
                <FacetedPortrait />
              </div>

              {/* Floating Code Card - Now Interactive with Minimize */}
              {!isMinimized && (
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-8 -right-4 lg:-right-8 z-20 w-72 cursor-text"
                  onClick={handleTerminalClick}
                >
                  <div
                    className={`bg-white dark:bg-dark-surface border ${
                      isFocused
                        ? "border-accent-cyan"
                        : "border-light-border dark:border-dark-border"
                    } rounded-lg p-4 shadow-xl backdrop-blur-sm transition-colors`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div
                          className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer hover:brightness-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMinimized(true);
                          }}
                        />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        terminal{" "}
                        {isAdmin && (
                          <span className="text-accent-cyan ml-2">● admin</span>
                        )}
                      </span>
                    </div>
                    <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
                      <p className="text-gray-500">$ npm run dev</p>
                      <p className="text-accent-cyan">▲ Next.js 14.0.0</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        - Local:{" "}
                        <span className="text-gray-900 dark:text-white">
                          localhost:3000
                        </span>
                      </p>
                      <p className="text-green-400">✓ Ready in 1.2s</p>

                      {terminalHistory.slice(-4).map((line, i) => (
                        <p
                          key={i}
                          className={
                            line.startsWith("✓")
                              ? "text-green-400"
                              : line.startsWith("✗")
                                ? "text-red-400"
                                : line.startsWith("$")
                                  ? "text-gray-500"
                                  : line.startsWith(">")
                                    ? "text-gray-500"
                                    : "text-gray-600 dark:text-gray-400"
                          }
                        >
                          {line}
                        </p>
                      ))}

                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1">
                          {isWaitingForCode ? ">" : "$"}
                        </span>
                        <input
                          ref={inputRef}
                          type={isWaitingForCode ? "password" : "text"}
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          onKeyDown={handleTerminalSubmit}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          placeholder={
                            isWaitingForCode ? "Enter code..." : "Type :help"
                          }
                          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
                          autoComplete="off"
                        />
                        <span className="animate-pulse text-gray-500">▊</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Minimized Terminal Button - Fixed at bottom right */}
        {isMinimized && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-8 right-8 z-50 p-4 bg-accent-cyan text-dark-bg rounded-full shadow-lg hover:shadow-xl hover:shadow-accent-cyan/50 transition-all duration-200 hover:scale-110"
            title="Open Terminal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </motion.button>
        )}

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-accent-cyan"
          >
            <HiArrowDown size={24} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
